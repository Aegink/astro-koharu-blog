import {
  CONTENT_DIR,
  checkAuth,
  commitTextFiles,
  dumpMatter,
  type Env,
  isSafeMarkdownPath,
  json,
  parseMatter,
  readFile,
} from '../../_lib/online-cms';

type BulkAction = 'publish' | 'draft' | 'trash' | 'restore';

function applyAction(frontmatter: Record<string, unknown>, action: BulkAction): boolean {
  const before = JSON.stringify(frontmatter);
  if (action === 'trash') {
    if (!frontmatter.deletedAt) {
      frontmatter.deletedDraft = Boolean(frontmatter.draft);
      frontmatter.deletedAt = new Date().toISOString();
    }
    frontmatter.draft = true;
  } else if (action === 'restore' && frontmatter.deletedAt) {
    frontmatter.draft = frontmatter.deletedDraft ?? true;
    delete frontmatter.deletedAt;
    delete frontmatter.deletedDraft;
  } else if (!frontmatter.deletedAt) {
    frontmatter.draft = action === 'draft';
  }
  return JSON.stringify(frontmatter) !== before;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const authError = await checkAuth(context.request, context.env);
    if (authError) return authError;
    const body = (await context.request.json()) as { postIds?: string[]; action?: BulkAction };
    const postIds = [...new Set(body.postIds || [])];
    if (!body.action || !['publish', 'draft', 'trash', 'restore'].includes(body.action))
      return json({ error: '批量操作不合法。' }, 400);
    if (postIds.length === 0 || postIds.length > 100 || postIds.some((id) => !isSafeMarkdownPath(id))) {
      return json({ error: '请选择 1 到 100 篇合法文章。' }, 400);
    }

    const updates: Array<{ path: string; content: string }> = [];
    for (const postId of postIds) {
      const path = `${CONTENT_DIR}/${postId}`;
      const file = await readFile(context.env, path);
      const parsed = parseMatter(file.content);
      if (applyAction(parsed.frontmatter, body.action))
        updates.push({ path, content: dumpMatter(parsed.frontmatter, parsed.content) });
    }
    await commitTextFiles(context.env, updates, `chore(cms): bulk ${body.action} ${updates.length} posts`);
    return json({ success: true, changed: updates.length });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : '批量操作失败' }, 500);
  }
}
