import {
  checkAuth,
  CONTENT_DIR,
  dumpMatter,
  type Env,
  getCategoryMap,
  json,
  listMarkdownFiles,
  parseMatter,
  readFile,
  replaceCategoryMap,
  slugify,
  writeFile,
} from '../../_lib/online-cms';

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

function replaceValue(value: unknown, from: string, to: string): unknown {
  if (typeof value === 'string') return value === from ? to : value;
  if (Array.isArray(value)) return value.map((item) => replaceValue(item, from, to));
  return value;
}

function normalizeMap(value: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(value)
      .map(([name, path]) => [name.trim(), path.trim().replace(/^\/+|\/+$/g, '')])
      .filter(([name, path]) => name && path),
  );
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const authError = checkAuth(context.request, context.env);
    if (authError) return authError;

    const body = (await context.request.json()) as TaxonomyBody;

    if (body.action === 'saveCategoryMap') {
      await replaceCategoryMap(context.env, normalizeMap(body.categoryMap || {}));
      return json({ success: true });
    }

    if (body.action !== 'rename') return json({ error: '不支持的操作。' }, 400);

    const from = body.from?.trim();
    const to = body.to?.trim();
    if (!from || !to) return json({ error: '旧名称和新名称都不能为空。' }, 400);
    if (from === to) return json({ success: true, changed: 0, files: [] });

    const files = await listMarkdownFiles(context.env);
    const changedFiles: string[] = [];

    for (const postId of files) {
      const filePath = `${CONTENT_DIR}/${postId}`;
      const file = await readFile(context.env, filePath);
      const parsed = parseMatter(file.content);
      const before = JSON.stringify(parsed.frontmatter);

      if (body.target === 'category') {
        parsed.frontmatter.categories = replaceValue(parsed.frontmatter.categories, from, to);
      } else {
        parsed.frontmatter.tags = replaceValue(parsed.frontmatter.tags, from, to);
      }

      if (JSON.stringify(parsed.frontmatter) !== before) {
        await writeFile(
          context.env,
          filePath,
          dumpMatter(parsed.frontmatter, parsed.content),
          `chore(cms): rename ${body.target} ${from} to ${to}`,
          file.sha,
        );
        changedFiles.push(postId);
      }
    }

    if (body.target === 'category') {
      const categoryMap = await getCategoryMap(context.env);
      if (Object.prototype.hasOwnProperty.call(categoryMap, from)) {
        categoryMap[to] = categoryMap[from] || slugify(to);
        delete categoryMap[from];
        await replaceCategoryMap(context.env, categoryMap);
      }
    }

    return json({ success: true, changed: changedFiles.length, files: changedFiles });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : '分类标签保存失败' }, 500);
  }
}
