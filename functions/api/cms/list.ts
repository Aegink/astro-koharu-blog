import {
  CONTENT_DIR,
  checkAuth,
  type Env,
  extractCategories,
  extractTags,
  json,
  listRepoTree,
  parseMatter,
  readFile,
} from '../../_lib/online-cms';

const postCache = new Map<string, PostListItem>();

type PostListItem = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  date: string;
  updated?: string;
  categories: string[];
  tags: string[];
  draft: boolean;
  sticky: boolean;
  deleted: boolean;
};

function countBy(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

function getSortableValue(post: PostListItem, sort: string): string {
  if (sort === 'title') return post.title;
  if (sort === 'updated') return post.updated || post.date;
  return post.date;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const authError = await checkAuth(context.request, context.env);
    if (authError) return authError;

    const url = new URL(context.request.url);
    const files = (await listRepoTree(context.env)).filter(
      (item) => item.type === 'blob' && item.path.startsWith(`${CONTENT_DIR}/`) && /\.mdx?$/.test(item.path),
    );
    const posts: PostListItem[] = await Promise.all(
      files.map(async (item) => {
        const cacheKey = `${item.path}:${item.sha}`;
        const cached = postCache.get(cacheKey);
        if (cached) return cached;
        const id = item.path.slice(CONTENT_DIR.length + 1);
        const file = await readFile(context.env, `${CONTENT_DIR}/${id}`);
        const { frontmatter } = parseMatter(file.content);
        const post = {
          id,
          slug: String(frontmatter.link || id.replace(/\.mdx?$/, '')),
          title: String(frontmatter.title || id),
          description: frontmatter.description ? String(frontmatter.description) : undefined,
          date: String(frontmatter.date || ''),
          updated: frontmatter.updated ? String(frontmatter.updated) : undefined,
          categories: extractCategories(frontmatter.categories),
          tags: extractTags(frontmatter.tags),
          draft: Boolean(frontmatter.draft),
          sticky: Boolean(frontmatter.sticky),
          deleted: Boolean(frontmatter.deletedAt),
        };
        postCache.set(cacheKey, post);
        if (postCache.size > 1000) postCache.clear();
        return post;
      }),
    );

    let filtered = posts;
    const search = url.searchParams.get('search')?.toLowerCase();
    const category = url.searchParams.get('category');
    const tag = url.searchParams.get('tag');
    const status = url.searchParams.get('status');
    if (search) {
      filtered = filtered.filter((post) => {
        const searchable = [post.title, post.id, post.slug, post.description || '', ...post.categories, ...post.tags]
          .join(' ')
          .toLowerCase();
        return searchable.includes(search);
      });
    }
    if (category) filtered = filtered.filter((post) => post.categories.includes(category));
    if (tag) filtered = filtered.filter((post) => post.tags.includes(tag));
    if (status === 'trash') {
      filtered = filtered.filter((post) => post.deleted);
    } else {
      filtered = filtered.filter((post) => !post.deleted);
      if (status === 'draft') filtered = filtered.filter((post) => post.draft);
      if (status === 'published') filtered = filtered.filter((post) => !post.draft);
    }

    const sort = url.searchParams.get('sort') || 'date';
    const order = url.searchParams.get('order') || 'desc';
    filtered.sort((a, b) => getSortableValue(a, sort).localeCompare(getSortableValue(b, sort)) * (order === 'asc' ? 1 : -1));

    const activePosts = posts.filter((post) => !post.deleted);
    const allCategories = [...new Set(activePosts.flatMap((post) => post.categories))].sort();
    const allTags = [...new Set(activePosts.flatMap((post) => post.tags))].sort();
    const stats = {
      total: activePosts.length,
      published: activePosts.filter((post) => !post.draft).length,
      draft: activePosts.filter((post) => post.draft).length,
      trash: posts.length - activePosts.length,
      categoryStats: countBy(activePosts.flatMap((post) => post.categories)),
      tagStats: countBy(activePosts.flatMap((post) => post.tags)),
      recentPosts: [...activePosts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    };

    const total = filtered.length;
    const pageSize = Math.min(100, Math.max(10, Number(url.searchParams.get('pageSize')) || 20));
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(totalPages, Math.max(1, Number(url.searchParams.get('page')) || 1));
    const offset = (page - 1) * pageSize;

    return json({
      posts: filtered.slice(offset, offset + pageSize),
      total,
      stats,
      categories: allCategories,
      tags: allTags,
      pagination: { page, pageSize, total, totalPages },
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Internal server error' }, 500);
  }
}
