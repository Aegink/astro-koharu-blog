import {
  checkAuth,
  CONTENT_DIR,
  dumpMatter,
  type Env,
  getCategoryMap,
  json,
  slugify,
  updateCategoryMappings,
  writeFile,
} from '../../../_lib/online-cms';

type CreateBody = {
  title: string;
  categories?: string[];
  tags?: string[];
  draft?: boolean;
  categoryMappings?: Record<string, string>;
};

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const authError = checkAuth(context.request, context.env);
    if (authError) return authError;

    const body = (await context.request.json()) as CreateBody;
    if (!body.title?.trim()) return json({ error: 'Title is required' }, 400);

    const categoryMap = { ...(await getCategoryMap(context.env)), ...(body.categoryMappings || {}) };
    const segments = (body.categories || []).map((name) => categoryMap[name] || slugify(name));
    const postId = `${segments.length ? `${segments.join('/')}/` : ''}${slugify(body.title)}.md`;

    await updateCategoryMappings(context.env, body.categoryMappings);

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const frontmatter: Record<string, unknown> = {
      title: body.title,
      date: now,
      updated: now,
      categories: body.categories?.length ? [body.categories] : undefined,
      tags: body.tags,
      draft: body.draft !== false ? true : undefined,
      catalog: true,
    };

    await writeFile(context.env, `${CONTENT_DIR}/${postId}`, dumpMatter(frontmatter, ''), `chore(cms): create ${postId}`);
    return json({ success: true, postId }, 201);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Internal server error' }, 500);
  }
}
