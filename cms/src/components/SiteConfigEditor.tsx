/**
 * Site Config Editor
 *
 * Chinese form-first editor for config/site.yaml in the GitHub-backed online CMS.
 */

import { Icon } from '@iconify/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { readSiteConfig, writeSiteConfig } from '@/lib/api';
import { cn } from '@/lib/utils';
import { CheckField, Field, InfoBox, Section, SelectInput, TextArea, TextInput, WarnBox } from './site-config-editor/fields';
import { buildConfig, type ConfigForm, type ConfigTab, emptyForm, toForm } from './site-config-editor/schema';

const tabs: Array<{ id: ConfigTab; label: string; icon: string }> = [
  { id: 'basic', label: '站点资料', icon: 'ri:home-smile-line' },
  { id: 'social', label: '社交链接', icon: 'ri:links-line' },
  { id: 'home', label: '首页导航', icon: 'ri:layout-4-line' },
  { id: 'series', label: '系列封面', icon: 'ri:newspaper-line' },
  { id: 'friends', label: '友链公告', icon: 'ri:megaphone-line' },
  { id: 'content', label: '内容增强', icon: 'ri:magic-line' },
  { id: 'integrations', label: '评论统计歌单', icon: 'ri:puzzle-line' },
  { id: 'seo', label: 'SEO/节日', icon: 'ri:search-eye-line' },
  { id: 'i18n', label: '多语言', icon: 'ri:translate-2' },
  { id: 'dev', label: '开发入口', icon: 'ri:code-box-line' },
  { id: 'category', label: '分类映射', icon: 'ri:folder-2-line' },
  { id: 'advanced', label: '高级 YAML', icon: 'ri:code-s-slash-line' },
];

function Grid({ children, cols = 2 }: { children: React.ReactNode; cols?: 2 | 3 | 4 }) {
  const className = cols === 4 ? 'md:grid-cols-2 xl:grid-cols-4' : cols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';
  return <div className={cn('grid gap-4', className)}>{children}</div>;
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
      toast.success('站点配置已保存，Cloudflare Pages 会自动重新部署');
    } catch (err) {
      const message = err instanceof Error ? err.message : '站点配置保存失败，请检查输入格式';
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

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
              <h2 className="font-bold text-2xl">前台能配置的内容，这里都能改</h2>
              <p className="max-w-3xl text-muted-foreground text-sm leading-6">
                表单会保存到 <span className="font-mono text-foreground">config/site.yaml</span>。复杂列表统一用“每行一条、竖线分隔”的格式，保存后会提交到 GitHub 并触发 Cloudflare Pages 部署。
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
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
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
              <div className="space-y-5">
                {activeTab === 'basic' && (
                  <>
                    <Section icon="ri:profile-line" title="基础资料" desc="这些内容会影响站点标题、SEO、侧边栏作者信息和默认分享图。">
                      <Grid>
                        <Field label="站点标题"><TextInput value={form.title} onChange={(e) => updateForm('title', e.target.value)} /></Field>
                        <Field label="站点英文名 / 备用名"><TextInput value={form.alternate} onChange={(e) => updateForm('alternate', e.target.value)} /></Field>
                        <Field label="副标题"><TextInput value={form.subtitle} onChange={(e) => updateForm('subtitle', e.target.value)} /></Field>
                        <Field label="侧边栏昵称"><TextInput value={form.name} onChange={(e) => updateForm('name', e.target.value)} /></Field>
                        <Field label="作者名称"><TextInput value={form.author} onChange={(e) => updateForm('author', e.target.value)} /></Field>
                        <Field label="站点 URL" hint="正式域名，末尾不用加斜杠。"><TextInput value={form.url} onChange={(e) => updateForm('url', e.target.value)} /></Field>
                        <Field label="建站年份"><TextInput value={form.startYear} onChange={(e) => updateForm('startYear', e.target.value)} /></Field>
                        <Field label="时区" hint="例如 Asia/Shanghai。"><TextInput value={form.timezone} onChange={(e) => updateForm('timezone', e.target.value)} /></Field>
                        <Field label="头像路径"><TextInput value={form.avatar} onChange={(e) => updateForm('avatar', e.target.value)} placeholder="/img/avatar.webp" /></Field>
                        <Field label="默认分享图"><TextInput value={form.defaultOgImage} onChange={(e) => updateForm('defaultOgImage', e.target.value)} placeholder="/img/avatar.webp" /></Field>
                      </Grid>
                      <Grid>
                        <Field label="站点描述" hint="用于搜索引擎摘要和首页说明。"><TextArea value={form.description} onChange={(e) => updateForm('description', e.target.value)} rows={4} /></Field>
                        <Field label="全站关键词" hint="每行一个，也可以用英文逗号分隔。"><TextArea value={form.keywords} onChange={(e) => updateForm('keywords', e.target.value)} rows={4} /></Field>
                      </Grid>
                      <Grid cols={3}>
                        <CheckField label="显示站点 Logo" hint="关闭后前台会隐藏 Logo 标识。" checked={form.showLogo} onChange={(value) => updateForm('showLogo', value)} />
                        <CheckField label="中文文章路径转拼音" hint="开启后，中文 slug 会尽量转成拼音/罗马字。" checked={form.enableSlugTransliteration} onChange={(value) => updateForm('enableSlugTransliteration', value)} />
                        <Field label="面包屑首页名" hint="不填则使用默认“首页”。"><TextInput value={form.breadcrumbHome} onChange={(e) => updateForm('breadcrumbHome', e.target.value)} /></Field>
                      </Grid>
                      <Grid>
                        <Field label="ICP备案号 / 页脚备案文字"><TextInput value={form.icpText} onChange={(e) => updateForm('icpText', e.target.value)} placeholder="例如：粤ICP备..." /></Field>
                        <Field label="备案链接"><TextInput value={form.icpLink} onChange={(e) => updateForm('icpLink', e.target.value)} placeholder="https://beian.miit.gov.cn/" /></Field>
                      </Grid>
                    </Section>
                  </>
                )}

                {activeTab === 'social' && (
                  <Section icon="ri:links-line" title="社交链接" desc="顶部三个是常用快捷项，下面的完整列表可以添加 B 站、微博、豆瓣等任意平台。">
                    <Grid cols={3}>
                      <Field label="GitHub 链接"><TextInput value={form.githubUrl} onChange={(e) => updateForm('githubUrl', e.target.value)} /></Field>
                      <Field label="邮箱链接"><TextInput value={form.emailUrl} onChange={(e) => updateForm('emailUrl', e.target.value)} placeholder="mailto:you@example.com" /></Field>
                      <Field label="RSS 地址"><TextInput value={form.rssUrl} onChange={(e) => updateForm('rssUrl', e.target.value)} /></Field>
                    </Grid>
                    <Field label="全部社交链接" hint="每行：平台键名 | 链接 | Iconify 图标 | 颜色。例如：bilibili | https://space.bilibili.com/... | ri:bilibili-fill | #da708a">
                      <TextArea value={form.socialLinks} onChange={(e) => updateForm('socialLinks', e.target.value)} rows={10} />
                    </Field>
                  </Section>
                )}

                {activeTab === 'home' && (
                  <>
                    <Section icon="ri:layout-4-line" title="首页精选分类" desc="首页卡片入口。分类路径要和“分类映射”里的英文路径对应。">
                      <Field label="精选分类" hint="每行：显示名 | 分类路径 | 图片 | 描述">
                        <TextArea value={form.featuredCategories} onChange={(e) => updateForm('featuredCategories', e.target.value)} rows={8} />
                      </Field>
                    </Section>
                    <Section icon="ri:menu-3-line" title="顶部导航" desc="导航支持一级菜单和二级菜单；二级菜单行前面加两个空格。">
                      <Field label="导航列表" hint="每行：名称 | 路径 | 图标 | 翻译键。没有路径的一级菜单可以作为下拉菜单标题。">
                        <TextArea value={form.navigation} onChange={(e) => updateForm('navigation', e.target.value)} rows={12} />
                      </Field>
                    </Section>
                  </>
                )}

                {activeTab === 'series' && (
                  <>
                    <Section icon="ri:image-line" title="默认封面池" desc="文章未设置封面图时，会从这里挑选默认封面。">
                      <Field label="默认封面图片" hint="每行一个图片路径，例如 /img/cover/1.webp。留空则使用主题内置 21 张封面。">
                        <TextArea value={form.defaultCoverList} onChange={(e) => updateForm('defaultCoverList', e.target.value)} rows={7} />
                      </Field>
                    </Section>
                    <Section icon="ri:newspaper-line" title="系列 / 周刊页面" desc="用于生成 /weekly 这类独立系列页。slug 不能和 posts、tags、categories 等保留路径冲突。">
                      <InfoBox>格式：slug | 分类名 | 短标题 | 页面标题 | 封面 | 图标 | 是否启用 | 首页突出 | GitHub | RSS | Chrome | Docs | 描述</InfoBox>
                      <Field label="系列列表" hint="示例：weekly | 周刊 | 我的周刊 | 我的技术周刊 | /img/weekly_header.webp | ri:newspaper-line | true | false | https://github.com/... | /rss.xml |  |  | 每周记录">
                        <TextArea value={form.featuredSeries} onChange={(e) => updateForm('featuredSeries', e.target.value)} rows={8} />
                      </Field>
                    </Section>
                  </>
                )}

                {activeTab === 'friends' && (
                  <>
                    <Section icon="ri:heart-2-line" title="友链页文字" desc="控制友链页顶部说明和申请区文字。">
                      <Grid>
                        <Field label="友链页标题"><TextInput value={form.friendsTitle} onChange={(e) => updateForm('friendsTitle', e.target.value)} /></Field>
                        <Field label="友链页副标题"><TextInput value={form.friendsSubtitle} onChange={(e) => updateForm('friendsSubtitle', e.target.value)} /></Field>
                        <Field label="申请区标题"><TextInput value={form.friendsApplyTitle} onChange={(e) => updateForm('friendsApplyTitle', e.target.value)} /></Field>
                        <Field label="申请说明"><TextInput value={form.friendsApplyDesc} onChange={(e) => updateForm('friendsApplyDesc', e.target.value)} /></Field>
                      </Grid>
                      <Field label="申请示例 YAML" hint="显示给访客看的示例内容。">
                        <TextArea value={form.friendsExampleYaml} onChange={(e) => updateForm('friendsExampleYaml', e.target.value)} rows={7} />
                      </Field>
                    </Section>
                    <Section icon="ri:user-heart-line" title="友链列表">
                      <Field label="友链数据" hint="每行：站点名 | URL | 站长 | 描述 | 头像 | 颜色">
                        <TextArea value={form.friendsData} onChange={(e) => updateForm('friendsData', e.target.value)} rows={10} />
                      </Field>
                    </Section>
                    <Section icon="ri:megaphone-line" title="公告列表">
                      <InfoBox>格式：ID | 标题 | 内容 | 类型 | 优先级 | 发布日期 | 开始日期 | 结束日期 | 链接URL | 链接文字 | 是否外链 | 颜色</InfoBox>
                      <Field label="公告数据" hint="类型可填 info、success、warning、error、important。日期格式建议 YYYY-MM-DD。">
                        <TextArea value={form.announcements} onChange={(e) => updateForm('announcements', e.target.value)} rows={8} />
                      </Field>
                    </Section>
                  </>
                )}

                {activeTab === 'content' && (
                  <>
                    <Section icon="ri:magic-line" title="文章阅读增强" desc="这些开关控制文章页的自动增强能力。通常建议保持开启。">
                      <Grid cols={4}>
                        <CheckField label="外链新窗口打开" checked={form.addBlankTarget} onChange={(v) => updateForm('addBlankTarget', v)} />
                        <CheckField label="平滑滚动" checked={form.smoothScroll} onChange={(v) => updateForm('smoothScroll', v)} />
                        <CheckField label="标题层级标记" checked={form.addHeadingLevel} onChange={(v) => updateForm('addHeadingLevel', v)} />
                        <CheckField label="代码块增强" checked={form.enhanceCodeBlock} onChange={(v) => updateForm('enhanceCodeBlock', v)} />
                        <CheckField label="代码复制按钮" checked={form.enableCodeCopy} onChange={(v) => updateForm('enableCodeCopy', v)} />
                        <CheckField label="代码全屏按钮" checked={form.enableCodeFullscreen} onChange={(v) => updateForm('enableCodeFullscreen', v)} />
                        <CheckField label="链接卡片预览" checked={form.enableLinkEmbed} onChange={(v) => updateForm('enableLinkEmbed', v)} />
                        <CheckField label="推文嵌入" checked={form.enableTweetEmbed} onChange={(v) => updateForm('enableTweetEmbed', v)} />
                        <CheckField label="OG 链接预览" checked={form.enableOGPreview} onChange={(v) => updateForm('enableOGPreview', v)} />
                        <CheckField label="CodePen 嵌入" checked={form.enableCodePenEmbed} onChange={(v) => updateForm('enableCodePenEmbed', v)} />
                        <CheckField label="懒加载嵌入内容" checked={form.lazyLoadEmbeds} onChange={(v) => updateForm('lazyLoadEmbeds', v)} />
                      </Grid>
                      <Grid>
                        <Field label="链接预览缓存时间" hint="单位：分钟。"><TextInput value={form.previewCacheTime} onChange={(e) => updateForm('previewCacheTime', e.target.value)} /></Field>
                        <Field label="文章卡片封面位置">
                          <SelectInput value={form.postCardImagePosition} onChange={(e) => updateForm('postCardImagePosition', e.target.value)}>
                            <option value="alternating">左右交替</option>
                            <option value="left">固定左侧</option>
                            <option value="right">固定右侧</option>
                          </SelectInput>
                        </Field>
                      </Grid>
                    </Section>
                    <Section icon="ri:markdown-line" title="Shoka / Markdown 扩展语法" desc="控制特殊 Markdown 语法是否启用。如果文章里用了这些语法，建议保持开启。">
                      <Grid cols={4}>
                        <CheckField label="容器语法" checked={form.enableShokaContainers} onChange={(v) => updateForm('enableShokaContainers', v)} />
                        <CheckField label="属性语法" checked={form.enableShokaAttrs} onChange={(v) => updateForm('enableShokaAttrs', v)} />
                        <CheckField label="动效语法" checked={form.enableShokaEffects} onChange={(v) => updateForm('enableShokaEffects', v)} />
                        <CheckField label="剧透语法" checked={form.enableShokaSpoiler} onChange={(v) => updateForm('enableShokaSpoiler', v)} />
                        <CheckField label="Ruby 注音" checked={form.enableShokaRuby} onChange={(v) => updateForm('enableShokaRuby', v)} />
                        <CheckField label="Hexo 标签" checked={form.enableShokaHexoTags} onChange={(v) => updateForm('enableShokaHexoTags', v)} />
                        <CheckField label="数学公式" checked={form.enableMath} onChange={(v) => updateForm('enableMath', v)} />
                        <CheckField label="代码元信息" checked={form.enableCodeMeta} onChange={(v) => updateForm('enableCodeMeta', v)} />
                        <CheckField label="测验题语法" checked={form.enableQuiz} onChange={(v) => updateForm('enableQuiz', v)} />
                        <CheckField label="加密块语法" checked={form.enableEncryptedBlock} onChange={(v) => updateForm('enableEncryptedBlock', v)} />
                      </Grid>
                    </Section>
                  </>
                )}

                {activeTab === 'integrations' && (
                  <>
                    <Section icon="ri:message-3-line" title="评论系统" desc="先选择使用哪一种评论服务，再填写对应服务的参数。未使用的服务可以留空。">
                      <Grid cols={3}>
                        <Field label="评论系统">
                          <SelectInput value={form.commentProvider} onChange={(e) => updateForm('commentProvider', e.target.value)}>
                            <option value="none">关闭评论</option>
                            <option value="twikoo">Twikoo</option>
                            <option value="giscus">Giscus</option>
                            <option value="waline">Waline</option>
                            <option value="remark42">Remark42</option>
                          </SelectInput>
                        </Field>
                        <Field label="Remark42 Host"><TextInput value={form.remark42Host} onChange={(e) => updateForm('remark42Host', e.target.value)} /></Field>
                        <Field label="Remark42 Site ID"><TextInput value={form.remark42SiteId} onChange={(e) => updateForm('remark42SiteId', e.target.value)} /></Field>
                      </Grid>
                      <Grid cols={4}>
                        <Field label="Twikoo 地址 / 环境 ID"><TextInput value={form.twikooEnvId} onChange={(e) => updateForm('twikooEnvId', e.target.value)} /></Field>
                        <Field label="Twikoo 地域"><TextInput value={form.twikooRegion} onChange={(e) => updateForm('twikooRegion', e.target.value)} placeholder="ap-shanghai" /></Field>
                        <Field label="Twikoo 自定义路径"><TextInput value={form.twikooPath} onChange={(e) => updateForm('twikooPath', e.target.value)} /></Field>
                        <Field label="Twikoo 语言"><TextInput value={form.twikooLang} onChange={(e) => updateForm('twikooLang', e.target.value)} placeholder="zh-CN" /></Field>
                      </Grid>
                    </Section>

                    <Section icon="ri:github-fill" title="Giscus 配置" desc="Giscus 基于 GitHub Discussions。repo 格式必须是 owner/repo。布尔项请填 0 或 1。">
                      <Grid cols={4}>
                        <Field label="Repo"><TextInput value={form.giscusRepo} onChange={(e) => updateForm('giscusRepo', e.target.value)} placeholder="owner/repo" /></Field>
                        <Field label="Repo ID"><TextInput value={form.giscusRepoId} onChange={(e) => updateForm('giscusRepoId', e.target.value)} /></Field>
                        <Field label="分类名"><TextInput value={form.giscusCategory} onChange={(e) => updateForm('giscusCategory', e.target.value)} /></Field>
                        <Field label="分类 ID"><TextInput value={form.giscusCategoryId} onChange={(e) => updateForm('giscusCategoryId', e.target.value)} /></Field>
                        <Field label="映射方式"><TextInput value={form.giscusMapping} onChange={(e) => updateForm('giscusMapping', e.target.value)} placeholder="pathname" /></Field>
                        <Field label="特定 term"><TextInput value={form.giscusTerm} onChange={(e) => updateForm('giscusTerm', e.target.value)} /></Field>
                        <Field label="严格匹配 0/1"><TextInput value={form.giscusStrict} onChange={(e) => updateForm('giscusStrict', e.target.value)} /></Field>
                        <Field label="启用反应 0/1"><TextInput value={form.giscusReactionsEnabled} onChange={(e) => updateForm('giscusReactionsEnabled', e.target.value)} /></Field>
                        <Field label="发送元数据 0/1"><TextInput value={form.giscusEmitMetadata} onChange={(e) => updateForm('giscusEmitMetadata', e.target.value)} /></Field>
                        <Field label="输入框位置"><TextInput value={form.giscusInputPosition} onChange={(e) => updateForm('giscusInputPosition', e.target.value)} placeholder="top 或 bottom" /></Field>
                        <Field label="语言"><TextInput value={form.giscusLang} onChange={(e) => updateForm('giscusLang', e.target.value)} placeholder="zh-CN" /></Field>
                        <Field label="自定义 Host"><TextInput value={form.giscusHost} onChange={(e) => updateForm('giscusHost', e.target.value)} /></Field>
                        <Field label="主题"><TextInput value={form.giscusTheme} onChange={(e) => updateForm('giscusTheme', e.target.value)} /></Field>
                        <Field label="加载方式"><TextInput value={form.giscusLoading} onChange={(e) => updateForm('giscusLoading', e.target.value)} placeholder="lazy 或 eager" /></Field>
                      </Grid>
                    </Section>

                    <Section icon="ri:chat-smile-2-line" title="Waline 配置" desc="常用项做成开关，复杂项支持 true/false、逗号列表或 YAML。">
                      <Grid cols={4}>
                        <Field label="Waline 地址"><TextInput value={form.walineServerURL} onChange={(e) => updateForm('walineServerURL', e.target.value)} /></Field>
                        <Field label="语言"><TextInput value={form.walineLang} onChange={(e) => updateForm('walineLang', e.target.value)} placeholder="zh-CN" /></Field>
                        <Field label="暗色模式"><TextInput value={form.walineDark} onChange={(e) => updateForm('walineDark', e.target.value)} placeholder="true、false 或 html.dark" /></Field>
                        <Field label="登录模式"><TextInput value={form.walineLogin} onChange={(e) => updateForm('walineLogin', e.target.value)} placeholder="enable / disable / force" /></Field>
                        <Field label="显示字段"><TextInput value={form.walineMeta} onChange={(e) => updateForm('walineMeta', e.target.value)} placeholder="nick, mail, link" /></Field>
                        <Field label="必填字段"><TextInput value={form.walineRequiredMeta} onChange={(e) => updateForm('walineRequiredMeta', e.target.value)} /></Field>
                        <Field label="字数限制"><TextInput value={form.walineWordLimit} onChange={(e) => updateForm('walineWordLimit', e.target.value)} placeholder="0 或 10, 200" /></Field>
                        <Field label="每页评论数"><TextInput value={form.walinePageSize} onChange={(e) => updateForm('walinePageSize', e.target.value)} /></Field>
                        <Field label="评论排序"><TextInput value={form.walineCommentSorting} onChange={(e) => updateForm('walineCommentSorting', e.target.value)} placeholder="latest / oldest / hottest" /></Field>
                        <Field label="文章反应"><TextInput value={form.walineReaction} onChange={(e) => updateForm('walineReaction', e.target.value)} placeholder="true、false 或 喜欢, 有用" /></Field>
                        <Field label="reCAPTCHA v3 Key"><TextInput value={form.walineRecaptchaV3Key} onChange={(e) => updateForm('walineRecaptchaV3Key', e.target.value)} /></Field>
                        <Field label="Turnstile Key"><TextInput value={form.walineTurnstileKey} onChange={(e) => updateForm('walineTurnstileKey', e.target.value)} /></Field>
                        <Field label="评论数显示"><TextInput value={form.walineComment} onChange={(e) => updateForm('walineComment', e.target.value)} placeholder="true、false 或选择器" /></Field>
                        <Field label="访问量显示"><TextInput value={form.walinePageview} onChange={(e) => updateForm('walinePageview', e.target.value)} placeholder="true、false 或选择器" /></Field>
                      </Grid>
                      <Grid cols={4}>
                        <CheckField label="图片上传" checked={form.walineImageUploader} onChange={(v) => updateForm('walineImageUploader', v)} />
                        <CheckField label="代码高亮" checked={form.walineHighlighter} onChange={(v) => updateForm('walineHighlighter', v)} />
                        <CheckField label="LaTeX 渲染" checked={form.walineTexRenderer} onChange={(v) => updateForm('walineTexRenderer', v)} />
                        <CheckField label="评论搜索" checked={form.walineSearch} onChange={(v) => updateForm('walineSearch', v)} />
                        <CheckField label="隐藏 Waline 版权" checked={form.walineNoCopyright} onChange={(v) => updateForm('walineNoCopyright', v)} />
                      </Grid>
                      <Grid>
                        <Field label="表情包" hint="可填 true/false、每行一个 CDN 地址，或 YAML 数组。"><TextArea value={form.walineEmoji} onChange={(e) => updateForm('walineEmoji', e.target.value)} rows={4} /></Field>
                        <Field label="自定义文案" hint="每行：键: 文案，例如 placeholder: 欢迎评论。"><TextArea value={form.walineLocale} onChange={(e) => updateForm('walineLocale', e.target.value)} rows={4} /></Field>
                      </Grid>
                    </Section>

                    <Section icon="ri:bar-chart-box-line" title="Umami 统计" desc="基础统计控制脚本接入；展示统计用于页脚站点访问量和文章阅读量。token 是 Umami 分享链接里的只读令牌。">
                      <Grid cols={3}>
                        <CheckField label="启用 Umami" checked={form.umamiEnabled} onChange={(v) => updateForm('umamiEnabled', v)} />
                        <Field label="Umami 网站 ID"><TextInput value={form.umamiId} onChange={(e) => updateForm('umamiId', e.target.value)} /></Field>
                        <Field label="Umami 地址"><TextInput value={form.umamiEndpoint} onChange={(e) => updateForm('umamiEndpoint', e.target.value)} /></Field>
                        <Field label="只读分享 Token"><TextInput value={form.umamiStatsToken} onChange={(e) => updateForm('umamiStatsToken', e.target.value)} /></Field>
                        <CheckField label="显示文章阅读量" checked={form.umamiArticlePageViews} onChange={(v) => updateForm('umamiArticlePageViews', v)} />
                        <CheckField label="页脚显示站点统计" checked={form.umamiFooterSiteStats} onChange={(v) => updateForm('umamiFooterSiteStats', v)} />
                      </Grid>
                    </Section>

                    <Section icon="ri:music-2-line" title="歌单 / 背景音乐" desc="控制右下角播放器和 /music 页面使用的歌单数据。">
                      <Grid>
                        <CheckField label="启用歌单播放器" checked={form.bgmEnabled} onChange={(v) => updateForm('bgmEnabled', v)} />
                        <Field label="Meting API 地址" hint="不填则使用前台默认接口。"><TextInput value={form.bgmMetingApi} onChange={(e) => updateForm('bgmMetingApi', e.target.value)} placeholder="https://163.hyc.moe/" /></Field>
                      </Grid>
                      <Field label="歌单数据" hint="每行：分组标题 | 歌单链接1, 歌单链接2">
                        <TextArea value={form.bgmAudio} onChange={(e) => updateForm('bgmAudio', e.target.value)} rows={5} placeholder="最爱山山 | https://music.163.com/playlist?id=..." />
                      </Field>
                    </Section>

                    <Section icon="ri:tv-2-line" title="追番页面" desc="控制前台 /bangumi 页面和侧边栏入口。">
                      <Grid cols={3}>
                        <CheckField label="启用追番页面" checked={form.bangumiEnabled} onChange={(v) => updateForm('bangumiEnabled', v)} />
                        <Field label="Bangumi 用户 ID"><TextInput value={form.bangumiUserId} onChange={(e) => updateForm('bangumiUserId', e.target.value)} placeholder="cosine" disabled={!form.bangumiEnabled} /></Field>
                        <Field label="导航显示名称"><TextInput value={form.bangumiLabel} onChange={(e) => updateForm('bangumiLabel', e.target.value)} placeholder="追番" disabled={!form.bangumiEnabled} /></Field>
                        <Field label="导航图标"><TextInput value={form.bangumiIcon} onChange={(e) => updateForm('bangumiIcon', e.target.value)} placeholder="ri:bilibili-fill" disabled={!form.bangumiEnabled} /></Field>
                      </Grid>
                    </Section>
                  </>
                )}

                {activeTab === 'seo' && (
                  <>
                    <Section icon="ri:robot-2-line" title="Robots / 搜索引擎抓取" desc="不懂可以保持关闭。开启后可控制哪些路径允许或禁止搜索引擎抓取。">
                      <Grid>
                        <CheckField label="启用 robots 配置" checked={form.seoRobotsEnabled} onChange={(v) => updateForm('seoRobotsEnabled', v)} />
                        <CheckField label="输出站点 host" checked={form.seoRobotsHost} onChange={(v) => updateForm('seoRobotsHost', v)} />
                      </Grid>
                      <Field label="Robots 规则" hint="每行：UserAgent | 允许路径 | 禁止路径 | 抓取间隔。多个路径用英文逗号分隔。">
                        <TextArea value={form.seoRobotsPolicy} onChange={(e) => updateForm('seoRobotsPolicy', e.target.value)} rows={6} disabled={!form.seoRobotsEnabled} placeholder="* | / | /admin, /api | 10" />
                      </Field>
                    </Section>

                    <Section icon="ri:snowy-line" title="节日 / 圣诞特效" desc="控制前台雪花、圣诞配色、头像帽子等视觉效果。">
                      <Grid cols={4}>
                        <CheckField label="启用节日特效" checked={form.christmasEnabled} onChange={(v) => updateForm('christmasEnabled', v)} />
                        <CheckField label="飘雪效果" checked={form.snowfall} onChange={(v) => updateForm('snowfall', v)} />
                        <CheckField label="圣诞配色" checked={form.christmasColorScheme} onChange={(v) => updateForm('christmasColorScheme', v)} />
                        <CheckField label="封面装饰" checked={form.christmasCoverDecoration} onChange={(v) => updateForm('christmasCoverDecoration', v)} />
                        <CheckField label="头像圣诞帽" checked={form.christmasHat} onChange={(v) => updateForm('christmasHat', v)} />
                        <CheckField label="阅读时间雪花" checked={form.readingTimeSnow} onChange={(v) => updateForm('readingTimeSnow', v)} />
                      </Grid>
                      <Grid cols={4}>
                        <Field label="雪花速度"><TextInput value={form.snowfallSpeed} onChange={(e) => updateForm('snowfallSpeed', e.target.value)} /></Field>
                        <Field label="雪花密度"><TextInput value={form.snowfallIntensity} onChange={(e) => updateForm('snowfallIntensity', e.target.value)} /></Field>
                        <Field label="移动端密度"><TextInput value={form.snowfallMobileIntensity} onChange={(e) => updateForm('snowfallMobileIntensity', e.target.value)} /></Field>
                        <Field label="最大层数"><TextInput value={form.snowfallMaxLayers} onChange={(e) => updateForm('snowfallMaxLayers', e.target.value)} /></Field>
                        <Field label="最大迭代"><TextInput value={form.snowfallMaxIterations} onChange={(e) => updateForm('snowfallMaxIterations', e.target.value)} /></Field>
                        <Field label="移动端最大层数"><TextInput value={form.snowfallMobileMaxLayers} onChange={(e) => updateForm('snowfallMobileMaxLayers', e.target.value)} /></Field>
                        <Field label="移动端最大迭代"><TextInput value={form.snowfallMobileMaxIterations} onChange={(e) => updateForm('snowfallMobileMaxIterations', e.target.value)} /></Field>
                      </Grid>
                    </Section>
                  </>
                )}

                {activeTab === 'i18n' && (
                  <Section icon="ri:translate-2" title="多语言配置" desc="控制默认语言和可访问语言。默认语言不加路径前缀，其他语言会使用 /en、/ja 这类路径。">
                    <Grid>
                      <Field label="默认语言代码"><TextInput value={form.i18nDefaultLocale} onChange={(e) => updateForm('i18nDefaultLocale', e.target.value)} placeholder="zh" /></Field>
                    </Grid>
                    <Field label="语言列表" hint="每行：语言代码 | 显示名称 | 是否启用。例如：en | English | true">
                      <TextArea value={form.i18nLocales} onChange={(e) => updateForm('i18nLocales', e.target.value)} rows={7} />
                    </Field>
                    <WarnBox>如果关闭某个语言，前台语言入口会隐藏它；但已有多语言页面文件不会被删除。</WarnBox>
                  </Section>
                )}

                {activeTab === 'dev' && (
                  <Section icon="ri:code-box-line" title="开发编辑器入口" desc="这些配置只影响开发/编辑入口，不影响普通访客。线上后台通常不需要改本地路径。">
                    <Grid>
                      <Field label="本地项目绝对路径"><TextInput value={form.devLocalProjectPath} onChange={(e) => updateForm('devLocalProjectPath', e.target.value)} placeholder="/Users/you/path/to/astro-koharu" /></Field>
                      <Field label="文章目录相对路径"><TextInput value={form.devContentRelativePath} onChange={(e) => updateForm('devContentRelativePath', e.target.value)} placeholder="src/content/blog" /></Field>
                    </Grid>
                    <Field label="编辑器列表" hint="每行：ID | 名称 | 图标 | URL 模板。URL 模板里用 {path} 代表文件路径。">
                      <TextArea value={form.devEditors} onChange={(e) => updateForm('devEditors', e.target.value)} rows={7} />
                    </Field>
                  </Section>
                )}

                {activeTab === 'category' && (
                  <Section icon="ri:folder-2-line" title="分类 URL 映射" desc="左边是文章里填写的中文分类名，右边是前台 URL 使用的英文路径。">
                    <Field label="分类映射" hint="格式：中文分类: 英文路径。每行一个，例如：随笔: life。">
                      <TextArea value={form.categoryMap} onChange={(e) => updateForm('categoryMap', e.target.value)} rows={12} />
                    </Field>
                    <WarnBox>改动分类映射会影响分类页 URL；旧链接可能需要重新分享或做跳转。</WarnBox>
                  </Section>
                )}

                {activeTab === 'advanced' && (
                  <Section icon="ri:code-s-slash-line" title="高级 YAML" desc="这里会直接保存完整 config/site.yaml。只有表单无法表达的特殊结构才需要用它。">
                    <TextArea value={content} onChange={(e) => setContent(e.target.value)} spellCheck={false} className="min-h-[640px] font-mono" placeholder="config/site.yaml" />
                  </Section>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
