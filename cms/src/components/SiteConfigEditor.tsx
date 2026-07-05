/**
 * Site Config Editor
 *
 * Chinese form-first editor for config/site.yaml in the GitHub-backed online CMS.
 */

import { Icon } from '@iconify/react';
import yaml from 'js-yaml';
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { readSiteConfig, writeSiteConfig } from '@/lib/api';
import { cn } from '@/lib/utils';

type YamlRecord = Record<string, any>;
type ConfigForm = {
  title: string; alternate: string; subtitle: string; name: string; author: string; description: string; url: string; avatar: string; defaultOgImage: string; startYear: string; timezone: string; showLogo: boolean; keywords: string;
  githubUrl: string; emailUrl: string; rssUrl: string; socialLinks: string;
  featuredCategories: string; navigation: string;
  friendsTitle: string; friendsSubtitle: string; friendsApplyTitle: string; friendsApplyDesc: string; friendsData: string; announcements: string;
  commentProvider: string; twikooEnvId: string; giscusRepo: string; giscusRepoId: string; walineServerURL: string;
  umamiEnabled: boolean; umamiId: string; umamiEndpoint: string; bgmEnabled: boolean; bgmMetingApi: string; bgmAudio: string; bangumiEnabled: boolean; bangumiUserId: string; bangumiLabel: string; bangumiIcon: string; christmasEnabled: boolean; snowfall: boolean; christmasColorScheme: boolean; christmasHat: boolean; enableLinkEmbed: boolean; enableMath: boolean; enableCodeCopy: boolean;
  categoryMap: string;
};
type ConfigTab = 'basic' | 'social' | 'home' | 'friends' | 'features' | 'category' | 'advanced';

const emptyForm: ConfigForm = {
  title: '', alternate: '', subtitle: '', name: '', author: '', description: '', url: '', avatar: '', defaultOgImage: '', startYear: '', timezone: 'Asia/Shanghai', showLogo: true, keywords: '',
  githubUrl: '', emailUrl: '', rssUrl: '/rss.xml', socialLinks: '',
  featuredCategories: '', navigation: '', friendsTitle: '', friendsSubtitle: '', friendsApplyTitle: '', friendsApplyDesc: '', friendsData: '', announcements: '',
  commentProvider: 'none', twikooEnvId: '', giscusRepo: '', giscusRepoId: '', walineServerURL: '',
  umamiEnabled: false, umamiId: '', umamiEndpoint: '', bgmEnabled: false, bgmMetingApi: '', bgmAudio: '', bangumiEnabled: false, bangumiUserId: '', bangumiLabel: '', bangumiIcon: 'ri:bilibili-fill', christmasEnabled: false, snowfall: true, christmasColorScheme: true, christmasHat: true, enableLinkEmbed: true, enableMath: true, enableCodeCopy: true,
  categoryMap: '',
};

const asRecord = (value: unknown): YamlRecord => (value && typeof value === 'object' && !Array.isArray(value) ? (value as YamlRecord) : {});
const asArray = (value: unknown): YamlRecord[] => (Array.isArray(value) ? value.filter((item) => item && typeof item === 'object').map((item) => item as YamlRecord) : []);
const splitLine = (line: string) => line.split('|').map((item) => item.trim());
const parseList = (value: string) => value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);

function parseConfig(content: string): YamlRecord {
  const parsed = yaml.load(content);
  return asRecord(parsed);
}

function mapToLines(map: Record<string, string>): string {
  return Object.entries(map).map(([name, slug]) => `${name}: ${slug}`).join('\n');
}

function parseCategoryMap(value: string): Record<string, string> {
  return Object.fromEntries(value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const index = line.indexOf(':');
    return index === -1 ? [line, line.toLowerCase().replace(/\s+/g, '-')] : [line.slice(0, index).trim(), line.slice(index + 1).trim()];
  }).filter(([name, slug]) => name && slug));
}

function toForm(content: string): ConfigForm {
  const config = parseConfig(content);
  const site = asRecord(config.site);
  const social = asRecord(config.social);
  const friends = asRecord(config.friends);
  const friendsIntro = asRecord(friends.intro);
  const comment = asRecord(config.comment);
  const analytics = asRecord(asRecord(config.analytics).umami);
  const bgm = asRecord(config.bgm);
  const bangumi = asRecord(config.bangumi);
  const christmas = asRecord(config.christmas);
  const christmasFeatures = asRecord(christmas.features);
  const contentOptions = asRecord(config.content);
  return {
    ...emptyForm,
    title: site.title || '', alternate: site.alternate || '', subtitle: site.subtitle || '', name: site.name || '', author: site.author || '', description: site.description || '', url: site.url || '', avatar: site.avatar || '', defaultOgImage: site.defaultOgImage || '', startYear: site.startYear ? String(site.startYear) : '', timezone: site.timezone || 'Asia/Shanghai', showLogo: site.showLogo !== false, keywords: Array.isArray(site.keywords) ? site.keywords.join('\n') : '',
    githubUrl: asRecord(social.github).url || '', emailUrl: asRecord(social.email).url || '', rssUrl: asRecord(social.rss).url || '/rss.xml',
    socialLinks: Object.entries(social).map(([key, item]) => `${key} | ${asRecord(item).url || ''} | ${asRecord(item).icon || ''} | ${asRecord(item).color || ''}`).join('\n'),
    featuredCategories: asArray(config.featuredCategories).map((item) => `${item.label || ''} | ${item.link || ''} | ${item.image || ''} | ${item.description || ''}`).join('\n'),
    navigation: asArray(config.navigation).flatMap((item) => {
      const row = `${item.name || ''} | ${item.path || ''} | ${item.icon || ''} | ${item.nameKey || ''}`;
      const children = asArray(item.children).map((child) => `  ${child.name || ''} | ${child.path || ''} | ${child.icon || ''} | ${child.nameKey || ''}`);
      return [row, ...children];
    }).join('\n'),
    friendsTitle: friendsIntro.title || '', friendsSubtitle: friendsIntro.subtitle || '', friendsApplyTitle: friendsIntro.applyTitle || '', friendsApplyDesc: friendsIntro.applyDesc || '',
    friendsData: asArray(friends.data).map((item) => `${item.site || ''} | ${item.url || ''} | ${item.owner || ''} | ${item.desc || ''} | ${item.image || ''} | ${item.color || ''}`).join('\n'),
    announcements: asArray(config.announcements).map((item) => `${item.id || ''} | ${item.title || ''} | ${item.content || ''} | ${item.type || 'info'} | ${item.priority ?? 1} | ${item.publishDate || ''} | ${item.color || ''}`).join('\n'),
    commentProvider: comment.provider || 'none', twikooEnvId: asRecord(comment.twikoo).envId || '', giscusRepo: asRecord(comment.giscus).repo || '', giscusRepoId: asRecord(comment.giscus).repoId || '', walineServerURL: asRecord(comment.waline).serverURL || '',
    umamiEnabled: Boolean(analytics.enabled), umamiId: analytics.id || '', umamiEndpoint: analytics.endpoint || '', bgmEnabled: bgm.enabled !== false, bgmMetingApi: bgm.metingApi || '', bgmAudio: asArray(bgm.audio).map((item) => `${item.title || ''} | ${Array.isArray(item.list) ? item.list.join(', ') : ''}`).join('\n'),
    bangumiEnabled: Boolean(bangumi.userId), bangumiUserId: bangumi.userId || '', bangumiLabel: bangumi.label || '', bangumiIcon: bangumi.icon || 'ri:bilibili-fill',
    christmasEnabled: Boolean(christmas.enabled), snowfall: christmasFeatures.snowfall !== false, christmasColorScheme: christmasFeatures.christmasColorScheme !== false, christmasHat: christmasFeatures.christmasHat !== false,
    enableLinkEmbed: contentOptions.enableLinkEmbed !== false, enableMath: contentOptions.enableMath !== false, enableCodeCopy: contentOptions.enableCodeCopy !== false,
    categoryMap: mapToLines(asRecord(config.categoryMap) as Record<string, string>),
  };
}

function parseSocialLinks(value: string, current: YamlRecord): YamlRecord {
  const social: YamlRecord = { ...current };
  for (const line of value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)) {
    const [key, url, icon, color] = splitLine(line);
    if (!key) continue;
    social[key] = { ...(asRecord(social[key])), url: url || '', icon: icon || asRecord(social[key]).icon || 'ri:links-line', ...(color ? { color } : {}) };
  }
  return social;
}

function parseFeaturedCategories(value: string) {
  return value.split(/\r?\n/).map((line) => splitLine(line)).filter(([label, link]) => label && link).map(([label, link, image, description]) => ({ label, link, image: image || '', description: description || '' }));
}

function parseNavigation(value: string) {
  const items: YamlRecord[] = [];
  for (const rawLine of value.split(/\r?\n/).filter((line) => line.trim())) {
    const isChild = /^\s+/.test(rawLine);
    const [name, path, icon, nameKey] = splitLine(rawLine.trim());
    if (!name) continue;
    const item: YamlRecord = { name, ...(nameKey ? { nameKey } : {}), ...(path ? { path } : {}), ...(icon ? { icon } : {}) };
    if (isChild && items.length > 0) {
      const parent = items[items.length - 1]!;
      parent.children = [...(Array.isArray(parent.children) ? parent.children : []), item];
    } else {
      items.push(item);
    }
  }
  return items;
}

function parseFriendsData(value: string) {
  return value.split(/\r?\n/).map((line) => splitLine(line)).filter(([site, url]) => site && url).map(([site, url, owner, desc, image, color]) => ({ site, url, owner: owner || '', desc: desc || '', image: image || '', ...(color ? { color } : {}) }));
}

function parseAnnouncements(value: string) {
  return value.split(/\r?\n/).map((line) => splitLine(line)).filter(([id, title]) => id && title).map(([id, title, content, type, priority, publishDate, color]) => ({ id, title, content: content || '', type: type || 'info', priority: Number(priority) || 1, publishDate: publishDate || new Date().toISOString().slice(0, 10), ...(color ? { color } : {}) }));
}

function parseBgmAudio(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => splitLine(line))
    .filter((parts) => Boolean(parts[0] && parts[1]))
    .map((parts) => ({
      title: parts[0] || '',
      list: (parts[1] || '').split(',').map((item) => item.trim()).filter(Boolean),
    }));
}

function buildConfig(content: string, form: ConfigForm): string {
  const config = parseConfig(content);
  const currentSite = asRecord(config.site);
  const currentSocial = asRecord(config.social);
  config.site = { ...currentSite, title: form.title.trim(), alternate: form.alternate.trim(), subtitle: form.subtitle.trim(), name: form.name.trim(), description: form.description.trim(), avatar: form.avatar.trim(), showLogo: form.showLogo, author: form.author.trim(), url: form.url.trim(), defaultOgImage: form.defaultOgImage.trim(), startYear: Number(form.startYear) || currentSite.startYear || new Date().getFullYear(), timezone: form.timezone.trim() || 'Asia/Shanghai', keywords: parseList(form.keywords) };
  const social = parseSocialLinks(form.socialLinks, currentSocial);
  social.github = { ...(asRecord(social.github)), url: form.githubUrl.trim(), icon: asRecord(social.github).icon || 'ri:github-fill' };
  social.email = { ...(asRecord(social.email)), url: form.emailUrl.trim(), icon: asRecord(social.email).icon || 'ri:mail-line' };
  social.rss = { ...(asRecord(social.rss)), url: form.rssUrl.trim() || '/rss.xml', icon: asRecord(social.rss).icon || 'ri:rss-line' };
  config.social = social;
  config.featuredCategories = parseFeaturedCategories(form.featuredCategories);
  config.navigation = parseNavigation(form.navigation);
  config.friends = { ...asRecord(config.friends), intro: { ...asRecord(asRecord(config.friends).intro), title: form.friendsTitle, subtitle: form.friendsSubtitle, applyTitle: form.friendsApplyTitle, applyDesc: form.friendsApplyDesc }, data: parseFriendsData(form.friendsData) };
  config.announcements = parseAnnouncements(form.announcements);
  const comment = asRecord(config.comment);
  config.comment = { ...comment, provider: form.commentProvider, twikoo: { ...asRecord(comment.twikoo), envId: form.twikooEnvId.trim() }, giscus: { ...asRecord(comment.giscus), repo: form.giscusRepo.trim(), repoId: form.giscusRepoId.trim() }, waline: { ...asRecord(comment.waline), serverURL: form.walineServerURL.trim() } };
  config.analytics = { ...asRecord(config.analytics), umami: { ...asRecord(asRecord(config.analytics).umami), enabled: form.umamiEnabled, id: form.umamiId.trim(), endpoint: form.umamiEndpoint.trim() } };
  const bgmConfig: YamlRecord = { ...asRecord(config.bgm), enabled: form.bgmEnabled, audio: parseBgmAudio(form.bgmAudio) };
  if (form.bgmMetingApi.trim()) bgmConfig.metingApi = form.bgmMetingApi.trim();
  else delete bgmConfig.metingApi;
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
  config.christmas = { ...asRecord(config.christmas), enabled: form.christmasEnabled, features: { ...asRecord(asRecord(config.christmas).features), snowfall: form.snowfall, christmasColorScheme: form.christmasColorScheme, christmasHat: form.christmasHat } };
  config.content = { ...asRecord(config.content), enableLinkEmbed: form.enableLinkEmbed, enableMath: form.enableMath, enableCodeCopy: form.enableCodeCopy };
  config.categoryMap = parseCategoryMap(form.categoryMap);
  return yaml.dump(config, { lineWidth: -1, noRefs: true, quotingType: "'", forceQuotes: false, sortKeys: false });
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="block space-y-2"><span className="font-medium text-sm">{label}</span>{children}{hint && <span className="block text-muted-foreground text-xs">{hint}</span>}</label>;
}
function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60', props.className)} />;
}
function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('w-full resize-y rounded-xl border border-input bg-background px-3 py-2.5 text-sm leading-6 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60', props.className)} />;
}
function CheckField({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 p-4"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-4" /><span><span className="block font-medium text-sm">{label}</span>{hint && <span className="text-muted-foreground text-xs">{hint}</span>}</span></label>;
}

export function SiteConfigEditor() {
  const [content, setContent] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [form, setForm] = useState<ConfigForm>(emptyForm);
  const [savedForm, setSavedForm] = useState<ConfigForm>(emptyForm);
  const [activeTab, setActiveTab] = useState<ConfigTab>('basic');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formDirty = JSON.stringify(form) !== JSON.stringify(savedForm);
  const rawDirty = content !== savedContent;
  const isDirty = activeTab === 'advanced' ? rawDirty : formDirty;
  const updateForm = (key: keyof ConfigForm, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const loadConfig = useCallback(async () => {
    setIsLoading(true); setError(null);
    try { const next = await readSiteConfig(); const nextForm = toForm(next); setContent(next); setSavedContent(next); setForm(nextForm); setSavedForm(nextForm); }
    catch (err) { const message = err instanceof Error ? err.message : '站点配置读取失败'; setError(message); toast.error(message); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { loadConfig(); }, [loadConfig]);
  const handleReset = () => { setContent(savedContent); setForm(savedForm); };
  const handleSave = async () => {
    setIsSaving(true); setError(null);
    try { const nextContent = activeTab === 'advanced' ? content : buildConfig(content, form); const nextForm = toForm(nextContent); await writeSiteConfig(nextContent); setContent(nextContent); setSavedContent(nextContent); setForm(nextForm); setSavedForm(nextForm); toast.success('站点配置已保存，Cloudflare Pages 会自动重新部署'); }
    catch (err) { const message = err instanceof Error ? err.message : '站点配置保存失败，请检查格式'; setError(message); toast.error(message); }
    finally { setIsSaving(false); }
  };
  const tabs: Array<{ id: ConfigTab; label: string; icon: string }> = [
    { id: 'basic', label: '站点信息', icon: 'ri:home-smile-line' }, { id: 'social', label: '社交链接', icon: 'ri:links-line' }, { id: 'home', label: '首页导航', icon: 'ri:layout-4-line' }, { id: 'friends', label: '友链公告', icon: 'ri:megaphone-line' }, { id: 'features', label: '功能开关', icon: 'ri:toggle-line' }, { id: 'category', label: '分类映射', icon: 'ri:folder-2-line' }, { id: 'advanced', label: '高级 YAML', icon: 'ri:code-s-slash-line' },
  ];
  return (
    <div className="space-y-6"><div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg shadow-black/5">
      <div className="border-border border-b bg-gradient-to-r from-primary/15 via-card to-card p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div className="space-y-2"><div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary text-xs"><Icon icon="ri:settings-4-line" className="size-4" />站点设置</div><h2 className="font-bold text-2xl">不用看代码，也能改博客信息</h2><p className="max-w-2xl text-muted-foreground text-sm">常用配置已经整理成中文表单。保存后会提交到 GitHub，并触发 Cloudflare Pages 自动部署。</p></div><div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={loadConfig} disabled={isLoading || isSaving}><Icon icon={isLoading ? 'ri:loader-4-line' : 'ri:refresh-line'} className={cn('mr-1.5 size-4', isLoading && 'animate-spin')} />重新读取</Button><Button variant="outline" size="sm" onClick={handleReset} disabled={!isDirty || isSaving}>还原</Button><Button size="sm" onClick={handleSave} disabled={!isDirty || isLoading || isSaving}><Icon icon={isSaving ? 'ri:loader-4-line' : 'ri:save-3-line'} className={cn('mr-1.5 size-4', isSaving && 'animate-spin')} />保存设置</Button></div></div>{error && <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-sm">{error}</p>}</div>
      <div className="grid gap-0 lg:grid-cols-[240px_1fr]"><nav className="border-border border-b p-3 lg:border-r lg:border-b-0"><div className="grid gap-2 sm:grid-cols-4 lg:grid-cols-1">{tabs.map((tab) => <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={cn('flex items-center gap-2 rounded-2xl px-3 py-2.5 text-left font-medium text-sm transition-colors', activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}><Icon icon={tab.icon} className="size-4" />{tab.label}</button>)}</div></nav>
        <div className="p-5 lg:p-6">{isLoading ? <div className="flex min-h-80 items-center justify-center text-muted-foreground"><Icon icon="ri:loader-4-line" className="mr-2 size-5 animate-spin" />正在读取配置...</div> : <>
          {activeTab === 'basic' && <div className="grid gap-4 md:grid-cols-2"><Field label="站点标题"><TextInput value={form.title} onChange={(e) => updateForm('title', e.target.value)} /></Field><Field label="站点英文名"><TextInput value={form.alternate} onChange={(e) => updateForm('alternate', e.target.value)} /></Field><Field label="副标题"><TextInput value={form.subtitle} onChange={(e) => updateForm('subtitle', e.target.value)} /></Field><Field label="作者昵称"><TextInput value={form.name} onChange={(e) => updateForm('name', e.target.value)} /></Field><Field label="作者名称"><TextInput value={form.author} onChange={(e) => updateForm('author', e.target.value)} /></Field><Field label="站点 URL"><TextInput value={form.url} onChange={(e) => updateForm('url', e.target.value)} /></Field><Field label="建站年份"><TextInput value={form.startYear} onChange={(e) => updateForm('startYear', e.target.value)} /></Field><Field label="时区"><TextInput value={form.timezone} onChange={(e) => updateForm('timezone', e.target.value)} /></Field><Field label="头像路径"><TextInput value={form.avatar} onChange={(e) => updateForm('avatar', e.target.value)} /></Field><Field label="默认分享图"><TextInput value={form.defaultOgImage} onChange={(e) => updateForm('defaultOgImage', e.target.value)} /></Field><CheckField label="显示站点 Logo" hint="关闭后前台会隐藏 Logo 标识。" checked={form.showLogo} onChange={(value) => updateForm('showLogo', value)} /><Field label="网站描述" hint="会用于搜索引擎摘要。"><TextArea value={form.description} onChange={(e) => updateForm('description', e.target.value)} rows={4} /></Field><Field label="全站关键词" hint="每行一个，也可以用英文逗号分隔。"><TextArea value={form.keywords} onChange={(e) => updateForm('keywords', e.target.value)} rows={4} /></Field></div>}
          {activeTab === 'social' && <div className="space-y-4"><div className="grid gap-4 md:grid-cols-3"><Field label="GitHub 链接"><TextInput value={form.githubUrl} onChange={(e) => updateForm('githubUrl', e.target.value)} /></Field><Field label="邮箱链接"><TextInput value={form.emailUrl} onChange={(e) => updateForm('emailUrl', e.target.value)} /></Field><Field label="RSS 地址"><TextInput value={form.rssUrl} onChange={(e) => updateForm('rssUrl', e.target.value)} /></Field></div><Field label="全部社交链接" hint="每行：平台键名 | 链接 | Iconify 图标 | 颜色，例如 bilibili | https://space.bilibili.com/... | ri:bilibili-fill | #da708a"><TextArea value={form.socialLinks} onChange={(e) => updateForm('socialLinks', e.target.value)} rows={8} /></Field></div>}
          {activeTab === 'home' && <div className="space-y-4"><Field label="首页精选分类" hint="每行：显示名 | 分类路径 | 图片 | 描述"><TextArea value={form.featuredCategories} onChange={(e) => updateForm('featuredCategories', e.target.value)} rows={8} /></Field><Field label="顶部导航" hint="每行：名称 | 路径 | 图标 | 翻译键。子菜单行前面加两个空格。"><TextArea value={form.navigation} onChange={(e) => updateForm('navigation', e.target.value)} rows={10} /></Field></div>}
          {activeTab === 'friends' && <div className="space-y-4"><div className="grid gap-4 md:grid-cols-2"><Field label="友链页标题"><TextInput value={form.friendsTitle} onChange={(e) => updateForm('friendsTitle', e.target.value)} /></Field><Field label="友链页副标题"><TextInput value={form.friendsSubtitle} onChange={(e) => updateForm('friendsSubtitle', e.target.value)} /></Field><Field label="申请区标题"><TextInput value={form.friendsApplyTitle} onChange={(e) => updateForm('friendsApplyTitle', e.target.value)} /></Field><Field label="申请说明"><TextInput value={form.friendsApplyDesc} onChange={(e) => updateForm('friendsApplyDesc', e.target.value)} /></Field></div><Field label="友链列表" hint="每行：站点名 | URL | 站长 | 描述 | 头像 | 颜色"><TextArea value={form.friendsData} onChange={(e) => updateForm('friendsData', e.target.value)} rows={8} /></Field><Field label="公告列表" hint="每行：ID | 标题 | 内容 | 类型(info/success/warning/error) | 优先级 | 发布日期 | 颜色"><TextArea value={form.announcements} onChange={(e) => updateForm('announcements', e.target.value)} rows={8} /></Field></div>}
          {activeTab === 'features' && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <CheckField label="链接卡片预览" checked={form.enableLinkEmbed} onChange={(v) => updateForm('enableLinkEmbed', v)} />
                <CheckField label="数学公式" checked={form.enableMath} onChange={(v) => updateForm('enableMath', v)} />
                <CheckField label="代码复制按钮" checked={form.enableCodeCopy} onChange={(v) => updateForm('enableCodeCopy', v)} />
                <CheckField label="Umami 统计" checked={form.umamiEnabled} onChange={(v) => updateForm('umamiEnabled', v)} />
                <CheckField label="歌单 / 背景音乐" hint="控制右下角音乐播放器和歌单数据。" checked={form.bgmEnabled} onChange={(v) => updateForm('bgmEnabled', v)} />
                <CheckField label="追番页面" hint="控制前台 /bangumi 页面和侧边栏入口。" checked={form.bangumiEnabled} onChange={(v) => updateForm('bangumiEnabled', v)} />
                <CheckField label="圣诞/季节特效" checked={form.christmasEnabled} onChange={(v) => updateForm('christmasEnabled', v)} />
              </div>

              <div className="rounded-2xl border border-border bg-muted/20 p-4">
                <div className="mb-4 flex items-center gap-2 font-semibold">
                  <Icon icon="ri:music-2-line" className="size-5 text-primary" />
                  歌单 / 背景音乐
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Meting API 地址" hint="不填则使用前台默认接口。">
                    <TextInput value={form.bgmMetingApi} onChange={(e) => updateForm('bgmMetingApi', e.target.value)} placeholder="https://163.hyc.moe/" />
                  </Field>
                  <Field label="歌单数据" hint="每行：分组标题 | 歌单链接1, 歌单链接2">
                    <TextArea value={form.bgmAudio} onChange={(e) => updateForm('bgmAudio', e.target.value)} rows={5} placeholder="最爱山山 | https://music.163.com/playlist?id=..." />
                  </Field>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-muted/20 p-4">
                <div className="mb-4 flex items-center gap-2 font-semibold">
                  <Icon icon="ri:tv-2-line" className="size-5 text-primary" />
                  追番页面
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Bangumi 用户 ID" hint="例如 cosine；关闭追番时可留空。">
                    <TextInput value={form.bangumiUserId} onChange={(e) => updateForm('bangumiUserId', e.target.value)} placeholder="cosine" disabled={!form.bangumiEnabled} />
                  </Field>
                  <Field label="导航显示名称" hint="不填则使用默认“追番”。">
                    <TextInput value={form.bangumiLabel} onChange={(e) => updateForm('bangumiLabel', e.target.value)} placeholder="追番" disabled={!form.bangumiEnabled} />
                  </Field>
                  <Field label="导航图标" hint="Iconify 图标名，例如 ri:bilibili-fill。">
                    <TextInput value={form.bangumiIcon} onChange={(e) => updateForm('bangumiIcon', e.target.value)} placeholder="ri:bilibili-fill" disabled={!form.bangumiEnabled} />
                  </Field>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="评论系统">
                  <select value={form.commentProvider} onChange={(e) => updateForm('commentProvider', e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none">
                    <option value="none">关闭评论</option>
                    <option value="twikoo">Twikoo</option>
                    <option value="giscus">Giscus</option>
                    <option value="waline">Waline</option>
                    <option value="remark42">Remark42</option>
                  </select>
                </Field>
                <Field label="Twikoo 地址"><TextInput value={form.twikooEnvId} onChange={(e) => updateForm('twikooEnvId', e.target.value)} /></Field>
                <Field label="Waline 地址"><TextInput value={form.walineServerURL} onChange={(e) => updateForm('walineServerURL', e.target.value)} /></Field>
                <Field label="Giscus Repo"><TextInput value={form.giscusRepo} onChange={(e) => updateForm('giscusRepo', e.target.value)} /></Field>
                <Field label="Giscus Repo ID"><TextInput value={form.giscusRepoId} onChange={(e) => updateForm('giscusRepoId', e.target.value)} /></Field>
                <Field label="Umami ID"><TextInput value={form.umamiId} onChange={(e) => updateForm('umamiId', e.target.value)} /></Field>
                <Field label="Umami 地址"><TextInput value={form.umamiEndpoint} onChange={(e) => updateForm('umamiEndpoint', e.target.value)} /></Field>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <CheckField label="飘雪效果" checked={form.snowfall} onChange={(v) => updateForm('snowfall', v)} />
                <CheckField label="圣诞配色" checked={form.christmasColorScheme} onChange={(v) => updateForm('christmasColorScheme', v)} />
                <CheckField label="头像圣诞帽" checked={form.christmasHat} onChange={(v) => updateForm('christmasHat', v)} />
              </div>
            </div>
          )}
          {activeTab === 'category' && <div className="space-y-4"><Field label="分类 URL 映射" hint="格式：中文分类: 英文路径。每行一个，例如：随笔: life。"><TextArea value={form.categoryMap} onChange={(e) => updateForm('categoryMap', e.target.value)} rows={12} /></Field><div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200 text-sm">分类名称会影响文章列表和分类页；右侧英文路径会影响 URL，改动后旧链接可能变化。</div></div>}
          {activeTab === 'advanced' && <div className="space-y-3"><div className="rounded-2xl border border-border bg-muted/20 p-4 text-muted-foreground text-sm">高级模式会直接保存完整 YAML。只有需要处理复杂结构时再使用。</div><TextArea value={content} onChange={(e) => setContent(e.target.value)} spellCheck={false} className="min-h-[560px] font-mono" placeholder="config/site.yaml" /></div>}
        </>}</div></div></div></div>
  );
}
