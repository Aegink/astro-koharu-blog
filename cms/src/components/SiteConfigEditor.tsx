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

type SiteConfig = {
  site?: {
    title?: string;
    alternate?: string;
    subtitle?: string;
    name?: string;
    description?: string;
    avatar?: string;
    showLogo?: boolean;
    author?: string;
    url?: string;
    defaultOgImage?: string;
    startYear?: number;
    timezone?: string;
    keywords?: string[];
  };
  social?: Record<string, { url?: string; icon?: string; color?: string }>;
  categoryMap?: Record<string, string>;
  [key: string]: unknown;
};

type ConfigForm = {
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
  githubUrl: string;
  emailUrl: string;
  rssUrl: string;
  categoryMap: string;
};

type ConfigTab = 'basic' | 'social' | 'category' | 'advanced';

const emptyForm: ConfigForm = {
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
  githubUrl: '',
  emailUrl: '',
  rssUrl: '/rss.xml',
  categoryMap: '',
};

function parseConfig(content: string): SiteConfig {
  const parsed = yaml.load(content);
  return parsed && typeof parsed === 'object' ? (parsed as SiteConfig) : {};
}

function toForm(content: string): ConfigForm {
  const config = parseConfig(content);
  const site = config.site || {};
  const social = config.social || {};
  return {
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
    keywords: Array.isArray(site.keywords) ? site.keywords.join('\n') : '',
    githubUrl: social.github?.url || '',
    emailUrl: social.email?.url || '',
    rssUrl: social.rss?.url || '/rss.xml',
    categoryMap: Object.entries(config.categoryMap || {})
      .map(([name, slug]) => `${name}: ${slug}`)
      .join('\n'),
  };
}

function parseList(value: string): string[] {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCategoryMap(value: string): Record<string, string> {
  return Object.fromEntries(
    value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const index = line.indexOf(':');
        if (index === -1) return [line, line.toLowerCase().replace(/\s+/g, '-')];
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      })
      .filter(([name, slug]) => name && slug),
  );
}

function buildConfig(content: string, form: ConfigForm): string {
  const config = parseConfig(content);
  const currentSite = config.site || {};
  const currentSocial = config.social || {};

  config.site = {
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
  };

  config.social = {
    ...currentSocial,
    github: { ...(currentSocial.github || {}), url: form.githubUrl.trim(), icon: currentSocial.github?.icon || 'ri:github-fill' },
    email: { ...(currentSocial.email || {}), url: form.emailUrl.trim(), icon: currentSocial.email?.icon || 'ri:mail-line' },
    rss: { ...(currentSocial.rss || {}), url: form.rssUrl.trim() || '/rss.xml', icon: currentSocial.rss?.icon || 'ri:rss-line' },
  };

  config.categoryMap = parseCategoryMap(form.categoryMap);

  return yaml.dump(config, {
    lineWidth: -1,
    noRefs: true,
    quotingType: "'",
    forceQuotes: false,
    sortKeys: false,
  });
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="font-medium text-sm">{label}</span>
      {children}
      {hint && <span className="block text-muted-foreground text-xs">{hint}</span>}
    </label>
  );
}

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors',
        'focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60',
        props.className,
      )}
    />
  );
}

function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'w-full resize-y rounded-xl border border-input bg-background px-3 py-2.5 text-sm leading-6 outline-none transition-colors',
        'focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60',
        props.className,
      )}
    />
  );
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

  const updateForm = (key: keyof ConfigForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await readSiteConfig();
      const nextForm = toForm(next);
      setContent(next);
      setSavedContent(next);
      setForm(nextForm);
      setSavedForm(nextForm);
    } catch (err) {
      const message = err instanceof Error ? err.message : '站点配置读取失败';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleReset = () => {
    setContent(savedContent);
    setForm(savedForm);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const nextContent = activeTab === 'advanced' ? content : buildConfig(content, form);
      const nextForm = toForm(nextContent);
      await writeSiteConfig(nextContent);
      setContent(nextContent);
      setSavedContent(nextContent);
      setForm(nextForm);
      setSavedForm(nextForm);
      toast.success('站点配置已保存，GitHub Actions 会自动重新部署');
    } catch (err) {
      const message = err instanceof Error ? err.message : '站点配置保存失败，请检查 YAML 格式';
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs: Array<{ id: ConfigTab; label: string; icon: string }> = [
    { id: 'basic', label: '站点信息', icon: 'ri:home-smile-line' },
    { id: 'social', label: '社交链接', icon: 'ri:links-line' },
    { id: 'category', label: '分类映射', icon: 'ri:folder-2-line' },
    { id: 'advanced', label: '高级 YAML', icon: 'ri:code-s-slash-line' },
  ];

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg shadow-black/5">
        <div className="border-border border-b bg-gradient-to-r from-primary/15 via-card to-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary text-xs">
                <Icon icon="ri:settings-4-line" className="size-4" />
                站点设置
              </div>
              <h2 className="font-bold text-2xl">不用看代码，也能改博客信息</h2>
              <p className="max-w-2xl text-muted-foreground text-sm">
                常用配置已经整理成中文表单。保存后会提交到 GitHub，并触发 Cloudflare Pages 自动部署。
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadConfig} disabled={isLoading || isSaving}>
                <Icon icon={isLoading ? 'ri:loader-4-line' : 'ri:refresh-line'} className={cn('mr-1.5 size-4', isLoading && 'animate-spin')} />
                重新读取
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset} disabled={!isDirty || isSaving}>
                还原
              </Button>
              <Button size="sm" onClick={handleSave} disabled={!isDirty || isLoading || isSaving}>
                <Icon icon={isSaving ? 'ri:loader-4-line' : 'ri:save-3-line'} className={cn('mr-1.5 size-4', isSaving && 'animate-spin')} />
                保存设置
              </Button>
            </div>
          </div>
          {error && <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-sm">{error}</p>}
        </div>

        <div className="grid gap-0 lg:grid-cols-[240px_1fr]">
          <nav className="border-border border-b p-3 lg:border-r lg:border-b-0">
            <div className="grid gap-2 sm:grid-cols-4 lg:grid-cols-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-2xl px-3 py-2.5 text-left font-medium text-sm transition-colors',
                    activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon icon={tab.icon} className="size-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          <div className="p-5 lg:p-6">
            {isLoading ? (
              <div className="flex min-h-80 items-center justify-center text-muted-foreground">
                <Icon icon="ri:loader-4-line" className="mr-2 size-5 animate-spin" />
                正在读取配置...
              </div>
            ) : (
              <>
                {activeTab === 'basic' && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="网站名称" hint="显示在首页、浏览器标题和 RSS 中。">
                      <TextInput value={form.title} onChange={(event) => updateForm('title', event.target.value)} placeholder="例如：余弦的博客" />
                    </Field>
                    <Field label="英文/短名称" hint="用于 Logo、页脚或 handle。">
                      <TextInput value={form.alternate} onChange={(event) => updateForm('alternate', event.target.value)} placeholder="例如：cosine" />
                    </Field>
                    <Field label="副标题">
                      <TextInput value={form.subtitle} onChange={(event) => updateForm('subtitle', event.target.value)} placeholder="一句话介绍你的博客" />
                    </Field>
                    <Field label="作者昵称">
                      <TextInput value={form.author} onChange={(event) => updateForm('author', event.target.value)} placeholder="你的名字或昵称" />
                    </Field>
                    <Field label="站点地址" hint="必须是正式域名，用于 SEO 和 RSS。">
                      <TextInput value={form.url} onChange={(event) => updateForm('url', event.target.value)} placeholder="https://wangyouboke.com" />
                    </Field>
                    <Field label="建站年份">
                      <TextInput value={form.startYear} onChange={(event) => updateForm('startYear', event.target.value)} placeholder="2024" />
                    </Field>
                    <Field label="头像路径">
                      <TextInput value={form.avatar} onChange={(event) => updateForm('avatar', event.target.value)} placeholder="/img/avatar.webp" />
                    </Field>
                    <Field label="默认分享图">
                      <TextInput value={form.defaultOgImage} onChange={(event) => updateForm('defaultOgImage', event.target.value)} placeholder="/img/avatar.webp" />
                    </Field>
                    <Field label="时区">
                      <TextInput value={form.timezone} onChange={(event) => updateForm('timezone', event.target.value)} placeholder="Asia/Shanghai" />
                    </Field>
                    <label className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 p-4">
                      <input type="checkbox" checked={form.showLogo} onChange={(event) => updateForm('showLogo', event.target.checked)} className="size-4" />
                      <span>
                        <span className="block font-medium text-sm">显示站点 Logo</span>
                        <span className="text-muted-foreground text-xs">关闭后前台会隐藏 Logo 标识。</span>
                      </span>
                    </label>
                    <Field label="网站描述" hint="会用于搜索引擎摘要。">
                      <TextArea value={form.description} onChange={(event) => updateForm('description', event.target.value)} rows={4} placeholder="写一段博客简介" />
                    </Field>
                    <Field label="全站关键词" hint="每行一个，也可以用英文逗号分隔。">
                      <TextArea value={form.keywords} onChange={(event) => updateForm('keywords', event.target.value)} rows={4} placeholder={'博客\nAstro\n前端'} />
                    </Field>
                  </div>
                )}

                {activeTab === 'social' && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="GitHub 链接">
                      <TextInput value={form.githubUrl} onChange={(event) => updateForm('githubUrl', event.target.value)} placeholder="https://github.com/Aegink" />
                    </Field>
                    <Field label="邮箱链接" hint="邮箱要保留 mailto: 前缀。">
                      <TextInput value={form.emailUrl} onChange={(event) => updateForm('emailUrl', event.target.value)} placeholder="mailto:name@example.com" />
                    </Field>
                    <Field label="RSS 地址">
                      <TextInput value={form.rssUrl} onChange={(event) => updateForm('rssUrl', event.target.value)} placeholder="/rss.xml" />
                    </Field>
                    <div className="rounded-2xl border border-border bg-muted/20 p-4 text-muted-foreground text-sm">
                      更多平台可以在“高级 YAML”里继续添加。常用的 GitHub、邮箱和 RSS 已经放到表单里。
                    </div>
                  </div>
                )}

                {activeTab === 'category' && (
                  <div className="space-y-4">
                    <Field label="分类 URL 映射" hint="格式：中文分类: 英文路径。每行一个，例如：随笔: life。">
                      <TextArea
                        value={form.categoryMap}
                        onChange={(event) => updateForm('categoryMap', event.target.value)}
                        rows={12}
                        placeholder={'随笔: life\n笔记: note\n前端: front-end'}
                      />
                    </Field>
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200 text-sm">
                      分类名称会影响文章列表和分类页；右侧英文路径会影响 URL，改动后旧链接可能变化。
                    </div>
                  </div>
                )}

                {activeTab === 'advanced' && (
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-border bg-muted/20 p-4 text-muted-foreground text-sm">
                      高级模式会直接保存完整 YAML。只有需要改友链、公告、主题开关等复杂配置时再使用。
                    </div>
                    <TextArea
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      spellCheck={false}
                      className="min-h-[560px] font-mono"
                      placeholder="config/site.yaml"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
