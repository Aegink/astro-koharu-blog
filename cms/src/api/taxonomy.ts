/**
 * CMS Taxonomy API Handler
 *
 * Local filesystem version of category map saving and taxonomy renaming.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type { Context } from 'hono';
import yaml from 'js-yaml';
import { CONFIG_PATH, CONTENT_DIR } from '@/lib/paths';
import { hasValidMarkdownExtension } from '@/lib/validation';

type SaveCategoryMapBody = {
  action: 'saveCategoryMap';
  categoryMap: Record<string, string>;
};

type RenameBody = {
  action: 'rename';
  target: 'category' | 'tag';
  from: string;
  to: string;
};

type TaxonomyBody = SaveCategoryMapBody | RenameBody;

function normalizeMap(value: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(value)
      .map(([name, pathValue]) => [name.trim(), pathValue.trim().replace(/^\/+|\/+$/g, '')])
      .filter(([name, pathValue]) => name && pathValue),
  );
}

function replaceValue(value: unknown, from: string, to: string): unknown {
  if (typeof value === 'string') return value === from ? to : value;
  if (Array.isArray(value)) return value.map((item) => replaceValue(item, from, to));
  return value;
}

async function listMarkdownFiles(rootDir: string, dir = ''): Promise<string[]> {
  const absoluteDir = path.join(rootDir, dir);
  const entries = await fs.readdir(absoluteDir, { withFileTypes: true }).catch(() => []);
  const files: string[] = [];

  for (const entry of entries) {
    const relativePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(rootDir, relativePath)));
    } else if (entry.isFile() && hasValidMarkdownExtension(entry.name)) {
      files.push(relativePath.replace(/\\/g, '/'));
    }
  }

  return files;
}

function parseMatter(fileContent: string) {
  return matter(fileContent, {
    engines: {
      yaml: {
        parse: (str) => yaml.load(str, { schema: yaml.JSON_SCHEMA }) as object,
        stringify: (obj) => yaml.dump(obj),
      },
    },
  });
}

function stringifyMatter(content: string, frontmatter: Record<string, unknown>): string {
  return matter.stringify(content, frontmatter, {
    engines: {
      yaml: {
        parse: (input: string) => yaml.load(input) as object,
        stringify: (obj: object) =>
          yaml
            .dump(obj, { flowLevel: 2, lineWidth: -1, quotingType: "'", forceQuotes: false })
            .replace(/^(date|updated): '(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})'$/gm, '$1: $2'),
      },
    },
  });
}

async function readConfig(configPath: string): Promise<Record<string, unknown>> {
  const content = await fs.readFile(configPath, 'utf-8');
  return (yaml.load(content) || {}) as Record<string, unknown>;
}

async function writeConfig(configPath: string, config: Record<string, unknown>) {
  const next = yaml.dump(config, { flowLevel: 2, lineWidth: -1, quotingType: "'", forceQuotes: false, sortKeys: false });
  await fs.writeFile(configPath, next, 'utf-8');
}

export async function taxonomyHandler(c: Context) {
  const projectRoot = c.get('projectRoot') as string;

  try {
    const body = (await c.req.json()) as TaxonomyBody;
    const configPath = path.join(projectRoot, CONFIG_PATH);

    if (body.action === 'saveCategoryMap') {
      const config = await readConfig(configPath);
      config.categoryMap = normalizeMap(body.categoryMap || {});
      await writeConfig(configPath, config);
      return c.json({ success: true });
    }

    if (body.action !== 'rename') return c.json({ error: '不支持的操作。' }, 400);

    const from = body.from?.trim();
    const to = body.to?.trim();
    if (!from || !to) return c.json({ error: '旧名称和新名称都不能为空。' }, 400);
    if (from === to) return c.json({ success: true, changed: 0, files: [] });

    const contentRoot = path.join(projectRoot, CONTENT_DIR);
    const files = await listMarkdownFiles(contentRoot);
    const changedFiles: string[] = [];
    const updates: Array<{ filePath: string; before: string; after: string }> = [];

    for (const postId of files) {
      const filePath = path.join(contentRoot, postId);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const parsed = parseMatter(fileContent);
      const before = JSON.stringify(parsed.data);

      if (body.target === 'category') {
        parsed.data.categories = replaceValue(parsed.data.categories, from, to);
      } else {
        parsed.data.tags = replaceValue(parsed.data.tags, from, to);
      }

      if (JSON.stringify(parsed.data) !== before) {
        updates.push({ filePath, before: fileContent, after: stringifyMatter(parsed.content, parsed.data) });
        changedFiles.push(postId);
      }
    }

    let configUpdate: { before: string; after: string } | null = null;
    if (body.target === 'category') {
      const configContent = await fs.readFile(configPath, 'utf-8');
      const config = await readConfig(configPath);
      const categoryMap = normalizeMap((config.categoryMap as Record<string, string>) || {});
      if (Object.hasOwn(categoryMap, from)) {
        categoryMap[to] = categoryMap[from] || to.toLowerCase().replace(/\s+/g, '-');
        delete categoryMap[from];
        config.categoryMap = categoryMap;
        configUpdate = {
          before: configContent,
          after: yaml.dump(config, { flowLevel: 2, lineWidth: -1, quotingType: "'", forceQuotes: false, sortKeys: false }),
        };
      }
    }

    const written: Array<{ filePath: string; before: string }> = [];
    try {
      for (const update of updates) {
        await fs.writeFile(update.filePath, update.after, 'utf-8');
        written.push({ filePath: update.filePath, before: update.before });
      }
      if (configUpdate) {
        await fs.writeFile(configPath, configUpdate.after, 'utf-8');
        written.push({ filePath: configPath, before: configUpdate.before });
      }
    } catch (error) {
      for (const item of written.reverse()) await fs.writeFile(item.filePath, item.before, 'utf-8').catch(() => undefined);
      throw error;
    }

    return c.json({ success: true, changed: changedFiles.length, files: changedFiles });
  } catch (error) {
    console.error('[CMS Taxonomy API] Error:', error);
    return c.json({ error: error instanceof Error ? error.message : '分类标签保存失败' }, 500);
  }
}
