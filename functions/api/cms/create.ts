import {
  addCategoryMappings,
  CONFIG_PATH,
  CONTENT_DIR,
  checkAuth,
  commitTextFiles,
  dumpMatter,
  type Env,
  getCategoryMap,
  json,
  listMarkdownFiles,
  readFile,
  slugify,
} from '../../_lib/online-cms';

type CreateBody = {
  title: string;
  categories?: string[];
  tags?: string[];
  draft?: boolean;
  categoryMappings?: Record<string, string>;
};

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const authError = await checkAuth(context.request, context.env);
    if (authError) return authError;

    const body = (await context.request.json()) as CreateBody;
    if (!body.title?.trim()) return json({ error: '标题不能为空' }, 400);

    const categoryMap = { ...(await getCategoryMap(context.env)), ...(body.categoryMappings || {}) };
    const segments = (body.categories || []).map((name) => categoryMap[name] || slugify(name));
    const postId = `${segments.length ? `${segments.join('/')}/` : ''}${slugify(body.title)}.md`;
    const postPath = `${CONTENT_DIR}/${postId}`;
    if ((await listMarkdownFiles(context.env)).includes(postId)) return json({ error: '同名文章已存在，请修改标题。' }, 409);

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

    const updates = [{ path: postPath, content: dumpMatter(frontmatter, '') }];
    if (body.categoryMappings && Object.keys(body.categoryMappings).length > 0) {
      const config = await readFile(context.env, CONFIG_PATH);
      const nextConfig = addCategoryMappings(config.content, body.categoryMappings);
      if (nextConfig && nextConfig !== config.content) updates.push({ path: CONFIG_PATH, content: nextConfig });
    }
    await commitTextFiles(context.env, updates, `chore(cms): create ${postId}`);
    return json({ success: true, postId }, 201);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : '服务内部错误' }, 500);
  }
}
