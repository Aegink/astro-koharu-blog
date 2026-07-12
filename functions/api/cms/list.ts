import {
  CONTENT_DIR,
  checkAuth,
  type Env,
  extractCategories,
  extractTags,
  json,
  listMarkdownFiles,
  parseMatter,
  readFile,
} from '../../_lib/online-cms';

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
};

function countBy(values: string[]) {
  return [...new Set(values)].map((name) => ({ name, count: values.filter((value) => value === name).length }));
}

function getSortableValue(post: PostListItem, sort: string): string {
  if (sort === 'title') return post.title;
  if (sort === 'updated') return post.updated || post.date;
  return post.date;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const authError = checkAuth(context.request, context.env);
    if (authError) return authError;

    const url = new URL(context.request.url);
    const files = await listMarkdownFiles(context.env);
    const posts: PostListItem[] = await Promise.all(
      files.map(async (id) => {
        const file = await readFile(context.env, `${CONTENT_DIR}/${id}`);
        const { frontmatter } = parseMatter(file.content);
        return {
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
        };
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
    if (status === 'draft') filtered = filtered.filter((post) => post.draft);
    if (status === 'published') filtered = filtered.filter((post) => !post.draft);

    const sort = url.searchParams.get('sort') || 'date';
    const order = url.searchParams.get('order') || 'desc';
    filtered.sort((a, b) => getSortableValue(a, sort).localeCompare(getSortableValue(b, sort)) * (order === 'asc' ? 1 : -1));

    const allCategories = [...new Set(posts.flatMap((post) => post.categories))].sort();
    const allTags = [...new Set(posts.flatMap((post) => post.tags))].sort();
    const stats = {
      total: posts.length,
      published: posts.filter((post) => !post.draft).length,
      draft: posts.filter((post) => post.draft).length,
      categoryStats: countBy(posts.flatMap((post) => post.categories)),
      tagStats: countBy(posts.flatMap((post) => post.tags)),
      recentPosts: [...posts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    };

    return json({ posts: filtered, total: filtered.length, stats, categories: allCategories, tags: allTags });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Internal server error' }, 500);
  }
}
