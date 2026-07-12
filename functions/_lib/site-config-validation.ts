import yaml from 'js-yaml';

type RecordValue = Record<string, unknown>;

const RESERVED_SLUGS = new Set([
  '404',
  '_astro',
  '@fs',
  'about',
  'api',
  'archives',
  'bangumi',
  'categories',
  'favicon.ico',
  'friends',
  'post',
  'posts',
  'robots.txt',
  'rss.xml',
  'sitemap.xml',
  'tags',
]);

function asRecord(value: unknown): RecordValue | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as RecordValue) : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function validatePath(pathValue: unknown, label: string, errors: string[]) {
  if (pathValue === undefined || pathValue === null || pathValue === '') return;
  if (typeof pathValue !== 'string') {
    errors.push(`${label} 必须是字符串。`);
    return;
  }
  if (!pathValue.startsWith('/') && !/^https?:\/\//i.test(pathValue)) {
    errors.push(`${label} 必须以 / 或 http(s):// 开头。`);
  }
}

function validateNavigation(items: unknown, errors: string[], prefix = 'navigation') {
  for (const [index, item] of asArray(items).entries()) {
    const navItem = asRecord(item);
    if (!navItem) {
      errors.push(`${prefix}[${index}] 必须是对象。`);
      continue;
    }
    if (!isNonEmptyString(navItem.name) && !isNonEmptyString(navItem.nameKey)) {
      errors.push(`${prefix}[${index}] 至少需要 name 或 nameKey。`);
    }
    validatePath(navItem.path, `${prefix}[${index}].path`, errors);
    if (navItem.children !== undefined) validateNavigation(navItem.children, errors, `${prefix}[${index}].children`);
  }
}

function validateFeaturedSeries(value: unknown, errors: string[]) {
  const items = Array.isArray(value) ? value : value ? [value] : [];
  const seen = new Set<string>();

  for (const [index, item] of items.entries()) {
    const series = asRecord(item);
    if (!series) {
      errors.push(`featuredSeries[${index}] 必须是对象。`);
      continue;
    }
    if (!isNonEmptyString(series.categoryName)) errors.push(`featuredSeries[${index}].categoryName 不能为空。`);
    if (!isNonEmptyString(series.slug)) {
      errors.push(`featuredSeries[${index}].slug 不能为空。`);
      continue;
    }

    const slug = series.slug.trim().toLowerCase();
    if (!/^[a-z0-9-_]+$/.test(slug)) errors.push(`featuredSeries[${index}].slug 只能包含字母、数字、连字符和下划线。`);
    if (RESERVED_SLUGS.has(slug)) errors.push(`featuredSeries[${index}].slug 不能使用保留路径：${slug}。`);
    if (seen.has(slug)) errors.push(`featuredSeries slug 重复：${slug}。`);
    seen.add(slug);
  }
}

export function validateSiteConfigContent(content: string): string[] {
  const errors: string[] = [];
  let parsed: unknown;

  try {
    parsed = yaml.load(content);
  } catch (error) {
    return [`YAML 解析失败：${error instanceof Error ? error.message : '未知错误'}`];
  }

  const config = asRecord(parsed);
  if (!config) return ['配置必须是 YAML 对象。'];

  const site = asRecord(config.site);
  if (!site) {
    errors.push('缺少 site 配置。');
  } else {
    for (const key of ['title', 'name', 'url'] as const) {
      if (!isNonEmptyString(site[key])) errors.push(`site.${key} 不能为空。`);
    }
    if (isNonEmptyString(site.url) && !/^https?:\/\//i.test(site.url))
      errors.push('site.url 必须是 http(s):// 开头的完整 URL。');
    if (site.keywords !== undefined && !Array.isArray(site.keywords)) errors.push('site.keywords 必须是数组。');
  }

  const categoryMap = config.categoryMap;
  if (categoryMap !== undefined) {
    const map = asRecord(categoryMap);
    if (!map) {
      errors.push('categoryMap 必须是键值对象。');
    } else {
      for (const [name, slug] of Object.entries(map)) {
        if (!name.trim() || !isNonEmptyString(slug)) errors.push('categoryMap 不能包含空分类名或空路径。');
        if (isNonEmptyString(slug) && !/^[a-z0-9][a-z0-9/_-]*$/i.test(slug)) {
          errors.push(`categoryMap.${name} 路径只能包含字母、数字、斜杠、下划线和连字符。`);
        }
      }
    }
  }

  validateNavigation(config.navigation, errors);
  validateFeaturedSeries(config.featuredSeries, errors);

  const contentConfig = asRecord(config.content);
  if (
    contentConfig?.postCardImagePosition &&
    !['alternating', 'left', 'right'].includes(String(contentConfig.postCardImagePosition))
  ) {
    errors.push('content.postCardImagePosition 只能是 alternating、left 或 right。');
  }

  const comment = asRecord(config.comment);
  if (comment?.provider && !['remark42', 'giscus', 'waline', 'twikoo', 'none'].includes(String(comment.provider))) {
    errors.push('comment.provider 只能是 remark42、giscus、waline、twikoo 或 none。');
  }

  const i18n = asRecord(config.i18n);
  if (i18n) {
    if (!isNonEmptyString(i18n.defaultLocale)) errors.push('i18n.defaultLocale 不能为空。');
    const locales = asArray(i18n.locales);
    if (locales.length === 0) errors.push('i18n.locales 至少需要一个语言。');
    if (isNonEmptyString(i18n.defaultLocale)) {
      const hasDefaultLocale = locales.some((item) => asRecord(item)?.code === i18n.defaultLocale);
      if (!hasDefaultLocale) errors.push('i18n.locales 必须包含 defaultLocale。');
    }
  }

  return [...new Set(errors)];
}
