import yaml from 'js-yaml';

// biome-ignore lint/suspicious/noExplicitAny: YAML 配置结构开放，编辑器需要保留宽松记录类型。
export type YamlRecord = Record<string, any>;

export type ConfigTab =
  | 'basic'
  | 'social'
  | 'home'
  | 'series'
  | 'friends'
  | 'content'
  | 'integrations'
  | 'seo'
  | 'i18n'
  | 'dev'
  | 'category'
  | 'advanced';

export type ConfigForm = {
  title: string;
  alternate: string;
  subtitle: string;
  name: string;
  author: string;
  description: string;
  url: string;
  avatar: string;
  defaultOgImage: string;
  startYear: string;
  timezone: string;
  showLogo: boolean;
  keywords: string;
  breadcrumbHome: string;
  icpText: string;
  icpLink: string;
  enableSlugTransliteration: boolean;

  githubUrl: string;
  emailUrl: string;
  rssUrl: string;
  socialLinks: string;

  featuredCategories: string;
  navigation: string;
  defaultCoverList: string;
  featuredSeries: string;

  friendsTitle: string;
  friendsSubtitle: string;
  friendsApplyTitle: string;
  friendsApplyDesc: string;
  friendsExampleYaml: string;
  friendsData: string;
  announcements: string;

  addBlankTarget: boolean;
  smoothScroll: boolean;
  addHeadingLevel: boolean;
  enhanceCodeBlock: boolean;
  enableCodeCopy: boolean;
  enableCodeFullscreen: boolean;
  enableLinkEmbed: boolean;
  enableTweetEmbed: boolean;
  enableOGPreview: boolean;
  enableCodePenEmbed: boolean;
  previewCacheTime: string;
  lazyLoadEmbeds: boolean;
  postCardImagePosition: string;
  enableShokaContainers: boolean;
  enableShokaAttrs: boolean;
  enableShokaEffects: boolean;
  enableShokaSpoiler: boolean;
  enableShokaRuby: boolean;
  enableShokaHexoTags: boolean;
  enableMath: boolean;
  enableCodeMeta: boolean;
  enableQuiz: boolean;
  enableEncryptedBlock: boolean;

  commentProvider: string;
  remark42Host: string;
  remark42SiteId: string;
  twikooEnvId: string;
  twikooRegion: string;
  twikooPath: string;
  twikooLang: string;
  giscusRepo: string;
  giscusRepoId: string;
  giscusCategory: string;
  giscusCategoryId: string;
  giscusMapping: string;
  giscusTerm: string;
  giscusStrict: string;
  giscusReactionsEnabled: string;
  giscusEmitMetadata: string;
  giscusInputPosition: string;
  giscusLang: string;
  giscusHost: string;
  giscusTheme: string;
  giscusLoading: string;
  walineServerURL: string;
  walineLang: string;
  walineDark: string;
  walineMeta: string;
  walineRequiredMeta: string;
  walineLogin: string;
  walineWordLimit: string;
  walinePageSize: string;
  walineImageUploader: boolean;
  walineHighlighter: boolean;
  walineTexRenderer: boolean;
  walineSearch: boolean;
  walineReaction: string;
  walineRecaptchaV3Key: string;
  walineTurnstileKey: string;
  walineEmoji: string;
  walineCommentSorting: string;
  walineNoCopyright: boolean;
  walineComment: string;
  walinePageview: string;
  walineLocale: string;

  umamiEnabled: boolean;
  umamiId: string;
  umamiEndpoint: string;
  umamiStatsToken: string;
  umamiArticlePageViews: boolean;
  umamiFooterSiteStats: boolean;

  bgmEnabled: boolean;
  bgmMetingApi: string;
  bgmAudio: string;
  bangumiEnabled: boolean;
  bangumiUserId: string;
  bangumiLabel: string;
  bangumiIcon: string;

  christmasEnabled: boolean;
  snowfall: boolean;
  christmasColorScheme: boolean;
  christmasCoverDecoration: boolean;
  christmasHat: boolean;
  readingTimeSnow: boolean;
  snowfallSpeed: string;
  snowfallIntensity: string;
  snowfallMobileIntensity: string;
  snowfallMaxLayers: string;
  snowfallMaxIterations: string;
  snowfallMobileMaxLayers: string;
  snowfallMobileMaxIterations: string;

  seoRobotsEnabled: boolean;
  seoRobotsHost: boolean;
  seoRobotsPolicy: string;

  i18nDefaultLocale: string;
  i18nLocales: string;

  devLocalProjectPath: string;
  devContentRelativePath: string;
  devEditors: string;

  categoryMap: string;
};

export const emptyForm: ConfigForm = {
  title: '',
  alternate: '',
  subtitle: '',
  name: '',
  author: '',
  description: '',
  url: '',
  avatar: '',
  defaultOgImage: '',
  startYear: '',
  timezone: 'Asia/Shanghai',
  showLogo: true,
  keywords: '',
  breadcrumbHome: '',
  icpText: '',
  icpLink: '',
  enableSlugTransliteration: false,

  githubUrl: '',
  emailUrl: '',
  rssUrl: '/rss.xml',
  socialLinks: '',

  featuredCategories: '',
  navigation: '',
  defaultCoverList: '',
  featuredSeries: '',

  friendsTitle: '',
  friendsSubtitle: '',
  friendsApplyTitle: '',
  friendsApplyDesc: '',
  friendsExampleYaml: '',
  friendsData: '',
  announcements: '',

  addBlankTarget: true,
  smoothScroll: true,
  addHeadingLevel: true,
  enhanceCodeBlock: true,
  enableCodeCopy: true,
  enableCodeFullscreen: true,
  enableLinkEmbed: true,
  enableTweetEmbed: true,
  enableOGPreview: true,
  enableCodePenEmbed: true,
  previewCacheTime: '30',
  lazyLoadEmbeds: true,
  postCardImagePosition: 'alternating',
  enableShokaContainers: true,
  enableShokaAttrs: true,
  enableShokaEffects: true,
  enableShokaSpoiler: true,
  enableShokaRuby: true,
  enableShokaHexoTags: true,
  enableMath: true,
  enableCodeMeta: true,
  enableQuiz: true,
  enableEncryptedBlock: true,

  commentProvider: 'none',
  remark42Host: '',
  remark42SiteId: '',
  twikooEnvId: '',
  twikooRegion: '',
  twikooPath: '',
  twikooLang: '',
  giscusRepo: '',
  giscusRepoId: '',
  giscusCategory: '',
  giscusCategoryId: '',
  giscusMapping: '',
  giscusTerm: '',
  giscusStrict: '',
  giscusReactionsEnabled: '',
  giscusEmitMetadata: '',
  giscusInputPosition: '',
  giscusLang: '',
  giscusHost: '',
  giscusTheme: '',
  giscusLoading: '',
  walineServerURL: '',
  walineLang: '',
  walineDark: '',
  walineMeta: '',
  walineRequiredMeta: '',
  walineLogin: '',
  walineWordLimit: '',
  walinePageSize: '',
  walineImageUploader: false,
  walineHighlighter: true,
  walineTexRenderer: false,
  walineSearch: false,
  walineReaction: '',
  walineRecaptchaV3Key: '',
  walineTurnstileKey: '',
  walineEmoji: '',
  walineCommentSorting: '',
  walineNoCopyright: false,
  walineComment: '',
  walinePageview: '',
  walineLocale: '',

  umamiEnabled: false,
  umamiId: '',
  umamiEndpoint: '',
  umamiStatsToken: '',
  umamiArticlePageViews: false,
  umamiFooterSiteStats: false,

  bgmEnabled: false,
  bgmMetingApi: '',
  bgmAudio: '',
  bangumiEnabled: false,
  bangumiUserId: '',
  bangumiLabel: '',
  bangumiIcon: 'ri:bilibili-fill',

  christmasEnabled: false,
  snowfall: true,
  christmasColorScheme: true,
  christmasCoverDecoration: true,
  christmasHat: true,
  readingTimeSnow: true,
  snowfallSpeed: '0.5',
  snowfallIntensity: '0.7',
  snowfallMobileIntensity: '0.4',
  snowfallMaxLayers: '6',
  snowfallMaxIterations: '8',
  snowfallMobileMaxLayers: '4',
  snowfallMobileMaxIterations: '6',

  seoRobotsEnabled: false,
  seoRobotsHost: false,
  seoRobotsPolicy: '',

  i18nDefaultLocale: 'zh',
  i18nLocales: 'zh | 中文 | true',

  devLocalProjectPath: '',
  devContentRelativePath: 'src/content/blog',
  devEditors: '',

  categoryMap: '',
};

const asRecord = (value: unknown): YamlRecord =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as YamlRecord) : {};
const asArray = (value: unknown): YamlRecord[] =>
  Array.isArray(value) ? value.filter((item) => item && typeof item === 'object').map((item) => item as YamlRecord) : [];
const splitLine = (line: string) => line.split('|').map((item) => item.trim());
const parseList = (value: string) =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
const lineList = (value: unknown): string =>
  Array.isArray(value) ? value.filter((item) => typeof item === 'string').join('\n') : '';
const stringValue = (value: unknown): string => (value === undefined || value === null ? '' : String(value));
const boolText = (value: unknown): string => (typeof value === 'boolean' ? String(value) : stringValue(value));
const compactText = (value: unknown): string => stringValue(value).replace(/\s+/g, ' ').trim();

function parseConfig(content: string): YamlRecord {
  return asRecord(yaml.load(content));
}

function parseBool(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'y', 'on', '启用', '是'].includes(normalized)) return true;
  if (['false', '0', 'no', 'n', 'off', '关闭', '否'].includes(normalized)) return false;
  return fallback;
}

function parseNumber(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseStringBool(value: string): string | boolean | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^(true|false)$/i.test(trimmed)) return trimmed.toLowerCase() === 'true';
  return trimmed;
}

function parseNumberOrPair(value: string): number | [number, number] | undefined {
  const parts = value
    .split(',')
    .map((item) => Number(item.trim()))
    .filter(Number.isFinite);
  const [first, second] = parts;
  if (first !== undefined && second !== undefined) return [first, second];
  return first;
}

function parseLooseValue(value: string): unknown {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^(true|false)$/i.test(trimmed)) return trimmed.toLowerCase() === 'true';
  if (/^\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if (trimmed.startsWith('[') || trimmed.startsWith('{') || trimmed.startsWith('- ')) {
    try {
      return yaml.load(trimmed);
    } catch {
      return trimmed;
    }
  }
  if (trimmed.includes('\n')) return parseList(trimmed);
  if (trimmed.includes(',')) return parseList(trimmed);
  return trimmed;
}

function dumpLooseValue(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') return String(value);
  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) return value.join('\n');
  return yaml.dump(value, { lineWidth: -1, noRefs: true, sortKeys: false }).trim();
}

function mapToLines(map: Record<string, string>): string {
  return Object.entries(map)
    .map(([name, slug]) => `${name}: ${slug}`)
    .join('\n');
}

function parseCategoryMap(value: string): Record<string, string> {
  return Object.fromEntries(
    value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const index = line.indexOf(':');
        return index === -1
          ? [line, line.toLowerCase().replace(/\s+/g, '-')]
          : [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      })
      .filter(([name, slug]) => name && slug),
  );
}

function parseSocialLinks(value: string, current: YamlRecord): YamlRecord {
  const social: YamlRecord = {};
  for (const line of value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)) {
    const [key, url, icon, color] = splitLine(line);
    if (!key || !url) continue;
    social[key] = {
      ...asRecord(current[key]),
      url,
      icon: icon || asRecord(current[key]).icon || 'ri:links-line',
      ...(color ? { color } : {}),
    };
  }
  return social;
}

function parseFeaturedCategories(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => splitLine(line))
    .filter(([label, link]) => label && link)
    .map(([label, link, image, description]) => ({ label, link, image: image || '', description: description || '' }));
}

function parseFeaturedSeries(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => splitLine(line))
    .filter(([slug, categoryName]) => slug && categoryName)
    .map((parts) => {
      const [slug, categoryName, label, fullName, cover, icon, enabled, highlightOnHome, github, rss, chrome, docs] = parts;
      const description = parts.slice(12).join(' | ').trim();
      const links = Object.fromEntries(Object.entries({ github, rss, chrome, docs }).filter(([, val]) => Boolean(val)));
      return {
        slug,
        categoryName,
        ...(label ? { label } : {}),
        ...(fullName ? { fullName } : {}),
        ...(cover ? { cover } : {}),
        ...(icon ? { icon } : {}),
        ...(enabled ? { enabled: parseBool(enabled, true) } : {}),
        ...(highlightOnHome ? { highlightOnHome: parseBool(highlightOnHome) } : {}),
        ...(Object.keys(links).length ? { links } : {}),
        ...(description ? { description } : {}),
      };
    });
}

function parseNavigation(value: string) {
  const items: YamlRecord[] = [];
  for (const rawLine of value.split(/\r?\n/).filter((line) => line.trim())) {
    const isChild = /^\s+/.test(rawLine);
    const [name, path, icon, nameKey] = splitLine(rawLine.trim());
    if (!name) continue;
    const item: YamlRecord = { name, ...(nameKey ? { nameKey } : {}), ...(path ? { path } : {}), ...(icon ? { icon } : {}) };
    const parent = items[items.length - 1];
    if (isChild && parent) {
      parent.children = [...(Array.isArray(parent.children) ? parent.children : []), item];
    } else {
      items.push(item);
    }
  }
  return items;
}

function parseFriendsData(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => splitLine(line))
    .filter(([site, url]) => site && url)
    .map(([site, url, owner, desc, image, color]) => ({
      site,
      url,
      owner: owner || '',
      desc: desc || '',
      image: image || '',
      ...(color ? { color } : {}),
    }));
}

function parseAnnouncements(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => splitLine(line))
    .filter(([id, title]) => id && title)
    .map(([id, title, content, type, priority, publishDate, startDate, endDate, linkUrl, linkText, linkExternal, color]) => ({
      id,
      title,
      content: content || '',
      type: type || 'info',
      priority: Number(priority) || 1,
      publishDate: publishDate || new Date().toISOString().slice(0, 10),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      ...(linkUrl
        ? {
            link: {
              url: linkUrl,
              ...(linkText ? { text: linkText } : {}),
              ...(linkExternal ? { external: parseBool(linkExternal) } : {}),
            },
          }
        : {}),
      ...(color ? { color } : {}),
    }));
}

function parseBgmAudio(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => splitLine(line))
    .filter((parts) => Boolean(parts[0] && parts[1]))
    .map((parts) => ({
      title: parts[0] || '',
      list: (parts[1] || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    }));
}

function parseLocales(value: string, defaultLocale: string) {
  const locales = value
    .split(/\r?\n/)
    .map((line) => splitLine(line))
    .filter(([code]) => code)
    .map(([code, label, enabled]) => ({
      code,
      ...(label ? { label } : {}),
      enabled: enabled ? parseBool(enabled, true) : true,
    }));
  return locales.length ? locales : [{ code: defaultLocale || 'zh', label: '中文', enabled: true }];
}

function parseEditors(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => splitLine(line))
    .filter(([id, name, icon, urlTemplate]) => id && name && icon && urlTemplate)
    .map(([id, name, icon, urlTemplate]) => ({ id, name, icon, urlTemplate }));
}

function parseRobotsPolicy(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => splitLine(line))
    .filter(([userAgent]) => userAgent)
    .map(([userAgent, allow, disallow, crawlDelay]) => ({
      userAgent,
      ...(allow ? { allow: allow.includes(',') ? parseList(allow) : allow } : {}),
      ...(disallow ? { disallow: disallow.includes(',') ? parseList(disallow) : disallow } : {}),
      ...(crawlDelay ? { crawlDelay: Number(crawlDelay) || 0 } : {}),
    }));
}

function parseKeyValueLines(value: string): Record<string, string> | undefined {
  const entries = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const index = line.indexOf(':');
      return index === -1 ? [line, ''] : [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    })
    .filter(([key]) => key);
  return entries.length ? Object.fromEntries(entries) : undefined;
}

function setOptional(target: YamlRecord, key: string, value: unknown) {
  if (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
  ) {
    delete target[key];
  } else target[key] = value;
}

export function toForm(content: string): ConfigForm {
  const config = parseConfig(content);
  const site = asRecord(config.site);
  const social = asRecord(config.social);
  const friends = asRecord(config.friends);
  const friendsIntro = asRecord(friends.intro);
  const comment = asRecord(config.comment);
  const remark42 = asRecord(comment.remark42);
  const twikoo = asRecord(comment.twikoo);
  const giscus = asRecord(comment.giscus);
  const waline = asRecord(comment.waline);
  const analytics = asRecord(asRecord(config.analytics).umami);
  const statisticsDisplay = asRecord(analytics.statistics_display);
  const bgm = asRecord(config.bgm);
  const bangumi = asRecord(config.bangumi);
  const christmas = asRecord(config.christmas);
  const christmasFeatures = asRecord(christmas.features);
  const christmasSnowfall = asRecord(christmas.snowfall);
  const contentOptions = asRecord(config.content);
  const robots = asRecord(asRecord(config.seo).robots);
  const i18n = asRecord(config.i18n);
  const dev = asRecord(config.dev);
  const icp = site.icp;
  const icpRecord = asRecord(icp);

  return {
    ...emptyForm,
    title: site.title || '',
    alternate: site.alternate || '',
    subtitle: site.subtitle || '',
    name: site.name || '',
    author: site.author || '',
    description: site.description || '',
    url: site.url || '',
    avatar: site.avatar || '',
    defaultOgImage: site.defaultOgImage || '',
    startYear: site.startYear ? String(site.startYear) : '',
    timezone: site.timezone || 'Asia/Shanghai',
    showLogo: site.showLogo !== false,
    keywords: lineList(site.keywords),
    breadcrumbHome: site.breadcrumbHome || '',
    icpText: typeof icp === 'string' ? icp : icpRecord.text || '',
    icpLink: icpRecord.link || '',
    enableSlugTransliteration: Boolean(site.enableSlugTransliteration),

    githubUrl: asRecord(social.github).url || '',
    emailUrl: asRecord(social.email).url || '',
    rssUrl: asRecord(social.rss).url || '/rss.xml',
    socialLinks: Object.entries(social)
      .map(
        ([key, item]) => `${key} | ${asRecord(item).url || ''} | ${asRecord(item).icon || ''} | ${asRecord(item).color || ''}`,
      )
      .join('\n'),

    featuredCategories: asArray(config.featuredCategories)
      .map((item) => `${item.label || ''} | ${item.link || ''} | ${item.image || ''} | ${item.description || ''}`)
      .join('\n'),
    navigation: asArray(config.navigation)
      .flatMap((item) => {
        const row = `${item.name || ''} | ${item.path || ''} | ${item.icon || ''} | ${item.nameKey || ''}`;
        const children = asArray(item.children).map(
          (child) => `  ${child.name || ''} | ${child.path || ''} | ${child.icon || ''} | ${child.nameKey || ''}`,
        );
        return [row, ...children];
      })
      .join('\n'),
    defaultCoverList: lineList(config.defaultCoverList),
    featuredSeries: asArray(config.featuredSeries)
      .map((item) => {
        const links = asRecord(item.links);
        return [
          item.slug || '',
          item.categoryName || '',
          item.label || '',
          item.fullName || '',
          item.cover || '',
          item.icon || '',
          item.enabled === undefined ? '' : String(item.enabled),
          item.highlightOnHome === undefined ? '' : String(item.highlightOnHome),
          links.github || '',
          links.rss || '',
          links.chrome || '',
          links.docs || '',
          compactText(item.description),
        ].join(' | ');
      })
      .join('\n'),

    friendsTitle: friendsIntro.title || '',
    friendsSubtitle: friendsIntro.subtitle || '',
    friendsApplyTitle: friendsIntro.applyTitle || '',
    friendsApplyDesc: friendsIntro.applyDesc || '',
    friendsExampleYaml: friendsIntro.exampleYaml || '',
    friendsData: asArray(friends.data)
      .map(
        (item) =>
          `${item.site || ''} | ${item.url || ''} | ${item.owner || ''} | ${item.desc || ''} | ${item.image || ''} | ${item.color || ''}`,
      )
      .join('\n'),
    announcements: asArray(config.announcements)
      .map((item) => {
        const link = asRecord(item.link);
        return [
          item.id || '',
          item.title || '',
          item.content || '',
          item.type || 'info',
          item.priority ?? 1,
          item.publishDate || '',
          item.startDate || '',
          item.endDate || '',
          link.url || '',
          link.text || '',
          link.external === undefined ? '' : String(link.external),
          item.color || '',
        ].join(' | ');
      })
      .join('\n'),

    addBlankTarget: contentOptions.addBlankTarget !== false,
    smoothScroll: contentOptions.smoothScroll !== false,
    addHeadingLevel: contentOptions.addHeadingLevel !== false,
    enhanceCodeBlock: contentOptions.enhanceCodeBlock !== false,
    enableCodeCopy: contentOptions.enableCodeCopy !== false,
    enableCodeFullscreen: contentOptions.enableCodeFullscreen !== false,
    enableLinkEmbed: contentOptions.enableLinkEmbed !== false,
    enableTweetEmbed: contentOptions.enableTweetEmbed !== false,
    enableOGPreview: contentOptions.enableOGPreview !== false,
    enableCodePenEmbed: contentOptions.enableCodePenEmbed !== false,
    previewCacheTime: stringValue(contentOptions.previewCacheTime || 30),
    lazyLoadEmbeds: contentOptions.lazyLoadEmbeds !== false,
    postCardImagePosition: contentOptions.postCardImagePosition || 'alternating',
    enableShokaContainers: contentOptions.enableShokaContainers !== false,
    enableShokaAttrs: contentOptions.enableShokaAttrs !== false,
    enableShokaEffects: contentOptions.enableShokaEffects !== false,
    enableShokaSpoiler: contentOptions.enableShokaSpoiler !== false,
    enableShokaRuby: contentOptions.enableShokaRuby !== false,
    enableShokaHexoTags: contentOptions.enableShokaHexoTags !== false,
    enableMath: contentOptions.enableMath !== false,
    enableCodeMeta: contentOptions.enableCodeMeta !== false,
    enableQuiz: contentOptions.enableQuiz !== false,
    enableEncryptedBlock: contentOptions.enableEncryptedBlock !== false,

    commentProvider: comment.provider || 'none',
    remark42Host: remark42.host || '',
    remark42SiteId: remark42.siteId || '',
    twikooEnvId: twikoo.envId || '',
    twikooRegion: twikoo.region || '',
    twikooPath: twikoo.path || '',
    twikooLang: twikoo.lang || '',
    giscusRepo: giscus.repo || '',
    giscusRepoId: giscus.repoId || '',
    giscusCategory: giscus.category || '',
    giscusCategoryId: giscus.categoryId || '',
    giscusMapping: giscus.mapping || '',
    giscusTerm: giscus.term || '',
    giscusStrict: giscus.strict || '',
    giscusReactionsEnabled: giscus.reactionsEnabled || '',
    giscusEmitMetadata: giscus.emitMetadata || '',
    giscusInputPosition: giscus.inputPosition || '',
    giscusLang: giscus.lang || '',
    giscusHost: giscus.host || '',
    giscusTheme: giscus.theme || '',
    giscusLoading: giscus.loading || '',
    walineServerURL: waline.serverURL || '',
    walineLang: waline.lang || '',
    walineDark: boolText(waline.dark),
    walineMeta: Array.isArray(waline.meta) ? waline.meta.join(', ') : '',
    walineRequiredMeta: Array.isArray(waline.requiredMeta) ? waline.requiredMeta.join(', ') : '',
    walineLogin: waline.login || '',
    walineWordLimit: Array.isArray(waline.wordLimit) ? waline.wordLimit.join(', ') : stringValue(waline.wordLimit),
    walinePageSize: stringValue(waline.pageSize),
    walineImageUploader: Boolean(waline.imageUploader),
    walineHighlighter: waline.highlighter !== false,
    walineTexRenderer: Boolean(waline.texRenderer),
    walineSearch: Boolean(waline.search),
    walineReaction: dumpLooseValue(waline.reaction),
    walineRecaptchaV3Key: waline.recaptchaV3Key || '',
    walineTurnstileKey: waline.turnstileKey || '',
    walineEmoji: dumpLooseValue(waline.emoji),
    walineCommentSorting: waline.commentSorting || '',
    walineNoCopyright: Boolean(waline.noCopyright),
    walineComment: boolText(waline.comment),
    walinePageview: boolText(waline.pageview),
    walineLocale: mapToLines(asRecord(waline.locale) as Record<string, string>),

    umamiEnabled: Boolean(analytics.enabled),
    umamiId: analytics.id || '',
    umamiEndpoint: analytics.endpoint || '',
    umamiStatsToken: statisticsDisplay.token || '',
    umamiArticlePageViews: Boolean(statisticsDisplay.article_page_views),
    umamiFooterSiteStats: Boolean(statisticsDisplay.footer_site_stats),

    bgmEnabled: bgm.enabled !== false,
    bgmMetingApi: bgm.metingApi || '',
    bgmAudio: asArray(bgm.audio)
      .map((item) => `${item.title || ''} | ${Array.isArray(item.list) ? item.list.join(', ') : ''}`)
      .join('\n'),
    bangumiEnabled: Boolean(bangumi.userId),
    bangumiUserId: bangumi.userId || '',
    bangumiLabel: bangumi.label || '',
    bangumiIcon: bangumi.icon || 'ri:bilibili-fill',

    christmasEnabled: Boolean(christmas.enabled),
    snowfall: christmasFeatures.snowfall !== false,
    christmasColorScheme: christmasFeatures.christmasColorScheme !== false,
    christmasCoverDecoration: christmasFeatures.christmasCoverDecoration !== false,
    christmasHat: christmasFeatures.christmasHat !== false,
    readingTimeSnow: christmasFeatures.readingTimeSnow !== false,
    snowfallSpeed: stringValue(christmasSnowfall.speed || 0.5),
    snowfallIntensity: stringValue(christmasSnowfall.intensity || 0.7),
    snowfallMobileIntensity: stringValue(christmasSnowfall.mobileIntensity || 0.4),
    snowfallMaxLayers: stringValue(christmasSnowfall.maxLayers || 6),
    snowfallMaxIterations: stringValue(christmasSnowfall.maxIterations || 8),
    snowfallMobileMaxLayers: stringValue(christmasSnowfall.mobileMaxLayers || 4),
    snowfallMobileMaxIterations: stringValue(christmasSnowfall.mobileMaxIterations || 6),

    seoRobotsEnabled: Boolean(asRecord(config.seo).robots),
    seoRobotsHost: Boolean(robots.host),
    seoRobotsPolicy: asArray(robots.policy)
      .map(
        (item) =>
          `${item.userAgent || '*'} | ${Array.isArray(item.allow) ? item.allow.join(', ') : item.allow || ''} | ${Array.isArray(item.disallow) ? item.disallow.join(', ') : item.disallow || ''} | ${item.crawlDelay || ''}`,
      )
      .join('\n'),

    i18nDefaultLocale: i18n.defaultLocale || 'zh',
    i18nLocales:
      asArray(i18n.locales)
        .map(
          (item) => `${item.code || ''} | ${item.label || ''} | ${item.enabled === undefined ? 'true' : String(item.enabled)}`,
        )
        .join('\n') || emptyForm.i18nLocales,

    devLocalProjectPath: dev.localProjectPath || '',
    devContentRelativePath: dev.contentRelativePath || 'src/content/blog',
    devEditors: asArray(dev.editors)
      .map((item) => `${item.id || ''} | ${item.name || ''} | ${item.icon || ''} | ${item.urlTemplate || ''}`)
      .join('\n'),

    categoryMap: mapToLines(asRecord(config.categoryMap) as Record<string, string>),
  };
}

export function buildConfig(content: string, form: ConfigForm): string {
  const config = parseConfig(content);
  const currentSite = asRecord(config.site);
  const currentSocial = asRecord(config.social);

  const site: YamlRecord = {
    ...currentSite,
    title: form.title.trim(),
    alternate: form.alternate.trim(),
    subtitle: form.subtitle.trim(),
    name: form.name.trim(),
    description: form.description.trim(),
    avatar: form.avatar.trim(),
    showLogo: form.showLogo,
    author: form.author.trim(),
    url: form.url.trim(),
    defaultOgImage: form.defaultOgImage.trim(),
    startYear: Number(form.startYear) || currentSite.startYear || new Date().getFullYear(),
    timezone: form.timezone.trim() || 'Asia/Shanghai',
    keywords: parseList(form.keywords),
    enableSlugTransliteration: form.enableSlugTransliteration,
  };
  setOptional(site, 'breadcrumbHome', form.breadcrumbHome.trim());
  if (form.icpText.trim())
    site.icp = form.icpLink.trim() ? { text: form.icpText.trim(), link: form.icpLink.trim() } : form.icpText.trim();
  else delete site.icp;
  config.site = site;

  const social = parseSocialLinks(form.socialLinks, currentSocial);
  if (form.githubUrl.trim()) {
    social.github = {
      ...asRecord(social.github),
      url: form.githubUrl.trim(),
      icon: asRecord(social.github).icon || 'ri:github-fill',
      color: asRecord(social.github).color || '#191717',
    };
  } else {
    delete social.github;
  }
  if (form.emailUrl.trim()) {
    social.email = {
      ...asRecord(social.email),
      url: form.emailUrl.trim(),
      icon: asRecord(social.email).icon || 'ri:mail-line',
      color: asRecord(social.email).color || '#55acd5',
    };
  } else {
    delete social.email;
  }
  social.rss = {
    ...asRecord(social.rss),
    url: form.rssUrl.trim() || '/rss.xml',
    icon: asRecord(social.rss).icon || 'ri:rss-line',
    color: asRecord(social.rss).color || '#ff6600',
  };
  config.social = social;

  config.featuredCategories = parseFeaturedCategories(form.featuredCategories);
  config.navigation = parseNavigation(form.navigation);
  config.defaultCoverList = parseList(form.defaultCoverList);
  config.featuredSeries = parseFeaturedSeries(form.featuredSeries);

  config.friends = {
    ...asRecord(config.friends),
    intro: {
      ...asRecord(asRecord(config.friends).intro),
      title: form.friendsTitle,
      subtitle: form.friendsSubtitle,
      applyTitle: form.friendsApplyTitle,
      applyDesc: form.friendsApplyDesc,
      exampleYaml: form.friendsExampleYaml,
    },
    data: parseFriendsData(form.friendsData),
  };
  config.announcements = parseAnnouncements(form.announcements);

  config.content = {
    ...asRecord(config.content),
    addBlankTarget: form.addBlankTarget,
    smoothScroll: form.smoothScroll,
    addHeadingLevel: form.addHeadingLevel,
    enhanceCodeBlock: form.enhanceCodeBlock,
    enableCodeCopy: form.enableCodeCopy,
    enableCodeFullscreen: form.enableCodeFullscreen,
    enableLinkEmbed: form.enableLinkEmbed,
    enableTweetEmbed: form.enableTweetEmbed,
    enableOGPreview: form.enableOGPreview,
    enableCodePenEmbed: form.enableCodePenEmbed,
    previewCacheTime: parseNumber(form.previewCacheTime, 30),
    lazyLoadEmbeds: form.lazyLoadEmbeds,
    postCardImagePosition: form.postCardImagePosition || 'alternating',
    enableShokaContainers: form.enableShokaContainers,
    enableShokaAttrs: form.enableShokaAttrs,
    enableShokaEffects: form.enableShokaEffects,
    enableShokaSpoiler: form.enableShokaSpoiler,
    enableShokaRuby: form.enableShokaRuby,
    enableShokaHexoTags: form.enableShokaHexoTags,
    enableMath: form.enableMath,
    enableCodeMeta: form.enableCodeMeta,
    enableQuiz: form.enableQuiz,
    enableEncryptedBlock: form.enableEncryptedBlock,
  };

  const comment = asRecord(config.comment);
  const giscus: YamlRecord = { ...asRecord(comment.giscus), repo: form.giscusRepo.trim(), repoId: form.giscusRepoId.trim() };
  setOptional(giscus, 'category', form.giscusCategory.trim());
  setOptional(giscus, 'categoryId', form.giscusCategoryId.trim());
  setOptional(giscus, 'mapping', form.giscusMapping.trim());
  setOptional(giscus, 'term', form.giscusTerm.trim());
  setOptional(giscus, 'strict', form.giscusStrict.trim());
  setOptional(giscus, 'reactionsEnabled', form.giscusReactionsEnabled.trim());
  setOptional(giscus, 'emitMetadata', form.giscusEmitMetadata.trim());
  setOptional(giscus, 'inputPosition', form.giscusInputPosition.trim());
  setOptional(giscus, 'lang', form.giscusLang.trim());
  setOptional(giscus, 'host', form.giscusHost.trim());
  setOptional(giscus, 'theme', form.giscusTheme.trim());
  setOptional(giscus, 'loading', form.giscusLoading.trim());

  const waline: YamlRecord = { ...asRecord(comment.waline), serverURL: form.walineServerURL.trim() };
  setOptional(waline, 'lang', form.walineLang.trim());
  setOptional(waline, 'dark', parseStringBool(form.walineDark));
  setOptional(waline, 'meta', parseList(form.walineMeta));
  setOptional(waline, 'requiredMeta', parseList(form.walineRequiredMeta));
  setOptional(waline, 'login', form.walineLogin.trim());
  setOptional(waline, 'wordLimit', parseNumberOrPair(form.walineWordLimit));
  setOptional(waline, 'pageSize', form.walinePageSize ? Number(form.walinePageSize) || undefined : undefined);
  waline.imageUploader = form.walineImageUploader;
  waline.highlighter = form.walineHighlighter;
  waline.texRenderer = form.walineTexRenderer;
  waline.search = form.walineSearch;
  setOptional(waline, 'reaction', parseLooseValue(form.walineReaction));
  setOptional(waline, 'recaptchaV3Key', form.walineRecaptchaV3Key.trim());
  setOptional(waline, 'turnstileKey', form.walineTurnstileKey.trim());
  setOptional(waline, 'emoji', parseLooseValue(form.walineEmoji));
  setOptional(waline, 'commentSorting', form.walineCommentSorting.trim());
  waline.noCopyright = form.walineNoCopyright;
  setOptional(waline, 'comment', parseStringBool(form.walineComment));
  setOptional(waline, 'pageview', parseStringBool(form.walinePageview));
  setOptional(waline, 'locale', parseKeyValueLines(form.walineLocale));

  const twikoo: YamlRecord = { ...asRecord(comment.twikoo), envId: form.twikooEnvId.trim() };
  setOptional(twikoo, 'region', form.twikooRegion.trim());
  setOptional(twikoo, 'path', form.twikooPath.trim());
  setOptional(twikoo, 'lang', form.twikooLang.trim());

  config.comment = {
    ...comment,
    provider: form.commentProvider,
    remark42: { ...asRecord(comment.remark42), host: form.remark42Host.trim(), siteId: form.remark42SiteId.trim() },
    twikoo,
    giscus,
    waline,
  };

  const umami: YamlRecord = {
    ...asRecord(asRecord(config.analytics).umami),
    enabled: form.umamiEnabled,
    id: form.umamiId.trim(),
    endpoint: form.umamiEndpoint.trim(),
  };
  if (form.umamiStatsToken.trim() || form.umamiArticlePageViews || form.umamiFooterSiteStats) {
    umami.statistics_display = {
      token: form.umamiStatsToken.trim(),
      article_page_views: form.umamiArticlePageViews,
      footer_site_stats: form.umamiFooterSiteStats,
    };
  } else {
    delete umami.statistics_display;
  }
  config.analytics = { ...asRecord(config.analytics), umami };

  const bgmConfig: YamlRecord = { ...asRecord(config.bgm), enabled: form.bgmEnabled, audio: parseBgmAudio(form.bgmAudio) };
  setOptional(bgmConfig, 'metingApi', form.bgmMetingApi.trim());
  config.bgm = bgmConfig;

  if (form.bangumiEnabled && form.bangumiUserId.trim()) {
    config.bangumi = {
      userId: form.bangumiUserId.trim(),
      ...(form.bangumiLabel.trim() ? { label: form.bangumiLabel.trim() } : {}),
      ...(form.bangumiIcon.trim() ? { icon: form.bangumiIcon.trim() } : {}),
    };
  } else {
    delete config.bangumi;
  }

  config.christmas = {
    ...asRecord(config.christmas),
    enabled: form.christmasEnabled,
    features: {
      ...asRecord(asRecord(config.christmas).features),
      snowfall: form.snowfall,
      christmasColorScheme: form.christmasColorScheme,
      christmasCoverDecoration: form.christmasCoverDecoration,
      christmasHat: form.christmasHat,
      readingTimeSnow: form.readingTimeSnow,
    },
    snowfall: {
      ...asRecord(asRecord(config.christmas).snowfall),
      speed: parseNumber(form.snowfallSpeed, 0.5),
      intensity: parseNumber(form.snowfallIntensity, 0.7),
      mobileIntensity: parseNumber(form.snowfallMobileIntensity, 0.4),
      maxLayers: parseNumber(form.snowfallMaxLayers, 6),
      maxIterations: parseNumber(form.snowfallMaxIterations, 8),
      mobileMaxLayers: parseNumber(form.snowfallMobileMaxLayers, 4),
      mobileMaxIterations: parseNumber(form.snowfallMobileMaxIterations, 6),
    },
  };

  config.seo = {
    ...asRecord(config.seo),
    robots: form.seoRobotsEnabled ? { host: form.seoRobotsHost, policy: parseRobotsPolicy(form.seoRobotsPolicy) } : null,
  };

  config.i18n = {
    ...asRecord(config.i18n),
    defaultLocale: form.i18nDefaultLocale.trim() || 'zh',
    locales: parseLocales(form.i18nLocales, form.i18nDefaultLocale.trim() || 'zh'),
  };

  config.dev = {
    ...asRecord(config.dev),
    localProjectPath: form.devLocalProjectPath.trim(),
    contentRelativePath: form.devContentRelativePath.trim() || 'src/content/blog',
    editors: parseEditors(form.devEditors),
  };

  config.categoryMap = parseCategoryMap(form.categoryMap);

  return yaml.dump(config, { lineWidth: -1, noRefs: true, quotingType: "'", forceQuotes: false, sortKeys: false });
}
