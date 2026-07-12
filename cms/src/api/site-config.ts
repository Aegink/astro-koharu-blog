/**
 * CMS Site Config API Handler
 *
 * Local filesystem version of the online config editor API.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import type { Context } from 'hono';
import { CONFIG_PATH } from '@/lib/paths';
import { validateSiteConfigContent } from '@/lib/site-config-validation';

type SaveBody = {
  content: string;
};

export async function siteConfigHandler(c: Context) {
  const projectRoot = c.get('projectRoot') as string;
  const configPath = path.join(projectRoot, CONFIG_PATH);

  try {
    if (c.req.method === 'POST') {
      const body = (await c.req.json()) as SaveBody;
      if (typeof body.content !== 'string' || !body.content.trim()) return c.json({ error: 'Config content is required' }, 400);

      const errors = validateSiteConfigContent(body.content);
      if (errors.length > 0) return c.json({ error: errors.join('；') }, 400);

      await fs.writeFile(configPath, body.content, 'utf-8');
      return c.json({ success: true });
    }

    const content = await fs.readFile(configPath, 'utf-8');
    return c.json({ content });
  } catch (error) {
    console.error('[CMS Site Config API] Error:', error);
    return c.json({ error: error instanceof Error ? error.message : '站点配置处理失败' }, 500);
  }
}
