/**
 * CMS App
 *
 * Main entry point for the standalone CMS application.
 */

import { Icon } from '@iconify/react';
import { type FormEvent, useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'sonner';
import {
  CategoryStats,
  CreatePostDialog,
  DashboardStats,
  DeployStatusPanel,
  ErrorFallback,
  MediaLibrary,
  PostEditor,
  PostTable,
  RecentUpdates,
  SiteConfigEditor,
  TaxonomyManager,
} from '@/components';
import { Button } from '@/components/ui/button';
import { type StatusFilter, type Tab, useDashboardState } from '@/hooks';
import { hasCmsSession, loginCms, logoutCms } from '@/lib/auth';
import { MAX_CATEGORY_DISPLAY, MAX_RECENT_POSTS_DISPLAY } from '@/lib/paths';
import { cn } from '@/lib/utils';

type NavItem = { id: Tab; label: string; description: string; icon: string };
type LoginFeature = { title: string; description: string; icon: string };

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: '仪表盘', description: '内容概览与快捷入口', icon: 'ri:dashboard-3-line' },
  { id: 'posts', label: '文章管理', description: '搜索、编辑、发布文章', icon: 'ri:article-line' },
  { id: 'media', label: '媒体库', description: '上传、复制、删除文章图片', icon: 'ri:image-2-line' },
  { id: 'taxonomy', label: '分类标签', description: '分类映射、标签统计与批量重命名', icon: 'ri:price-tag-3-line' },
  { id: 'config', label: '站点设置', description: '站点资料、友链、导航和功能开关', icon: 'ri:settings-4-line' },
  { id: 'deploy', label: '发布状态', description: '查看 GitHub 提交与 Cloudflare 部署', icon: 'ri:rocket-2-line' },
];

const LOGIN_FEATURES: LoginFeature[] = [
  { title: '写文章', description: '新建草稿并进入编辑器', icon: 'ri:quill-pen-line' },
  { title: '管图片', description: '媒体库统一上传和复制链接', icon: 'ri:image-add-line' },
  { title: '改设置', description: '中文表单维护站点配置', icon: 'ri:settings-5-line' },
];

function LoginScreen({ onLogin }: { onLogin: () => Promise<void> }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = password.trim();
    if (!trimmed) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await loginCms(trimmed);
      setPassword('');
      await onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-10 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(251,191,36,0.18),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(56,189,248,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_38%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-muted-foreground text-sm shadow-black/10 shadow-lg backdrop-blur">
            <span className="size-2 rounded-full bg-green-400" />
            Cloudflare Pages 线上后台
          </div>
          <div className="space-y-4">
            <h1 className="max-w-2xl font-semibold text-4xl tracking-tight md:text-6xl">博客管理后台</h1>
            <p className="max-w-xl text-lg text-muted-foreground leading-8">
              这里是基于项目自带 CMS 改造的线上版。登录后可以写文章、管理图片、整理分类标签、修改站点资料，保存后会写入 GitHub
              并触发重新部署。
            </p>
          </div>
          <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
            {LOGIN_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-card/70 p-4 shadow-black/10 shadow-lg backdrop-blur"
              >
                <Icon icon={feature.icon} className="mb-3 size-6 text-primary" />
                <p className="font-medium">{feature.title}</p>
                <p className="mt-1 text-muted-foreground text-xs leading-5">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="w-full rounded-[2rem] border border-border bg-card/85 p-6 shadow-2xl shadow-black/25 backdrop-blur md:p-8"
        >
          <div className="mb-8 flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
              <Icon icon="ri:lock-password-line" className="size-7" />
            </div>
            <div>
              <h2 className="font-semibold text-2xl">进入后台</h2>
              <p className="mt-1 text-muted-foreground text-sm">请输入 Cloudflare 环境变量中的后台密码。</p>
            </div>
          </div>

          <label htmlFor="cms-password" className="mb-2 block font-medium text-sm">
            后台密码
          </label>
          <input
            id="cms-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="输入后台登录密码"
            className="mb-4 w-full rounded-2xl border border-input bg-background/80 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {error && (
            <p className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-sm">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full rounded-2xl py-6 text-base" disabled={isSubmitting}>
            {isSubmitting ? '验证中...' : '登录后台'}
          </Button>
          <p className="mt-4 text-muted-foreground text-xs leading-5">
            密码只保存在当前浏览器，用于调用 Cloudflare Pages Functions，不会写入页面源码。
          </p>
        </form>
      </div>
    </div>
  );
}

function AppContent({ onLogout }: { onLogout: () => void }) {
  const {
    activeTab,
    setActiveTab,
    data,
    isLoading,
    error,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    editingPostId,
    search,
    setSearch,
    category,
    setCategory,
    status,
    setStatus,
    sortField,
    sortOrder,
    page,
    setPage,
    fetchData,
    handleSort,
    handleToggleDraft,
    handleToggleSticky,
    handleTrashPost,
    handleRestorePost,
    handleBulkAction,
    handleCreatePostSuccess,
    handleEditPost,
    handleEditorClose,
    handleEditorSaved,
  } = useDashboardState();

  const activeNav = NAV_ITEMS.find((item) => item.id === activeTab) ?? {
    id: 'overview' as const,
    label: '仪表盘',
    description: '内容概览与快捷入口',
    icon: 'ri:dashboard-3-line',
  };

  if (editingPostId) {
    return <PostEditor postId={editingPostId} onClose={handleEditorClose} onSaved={handleEditorSaved} />;
  }

  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(251,191,36,0.13),transparent_26%),radial-gradient(circle_at_100%_0%,rgba(56,189,248,0.13),transparent_28%)]" />
        <div className="relative flex min-h-screen">
          <aside className="hidden w-72 shrink-0 border-border border-r bg-card/70 p-5 backdrop-blur xl:block">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
                <Icon icon="ri:quill-pen-line" className="size-6" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">博客管理后台</h1>
                <p className="text-muted-foreground text-xs">线上写作与站点维护</p>
              </div>
            </div>

            <nav className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition',
                    activeTab === item.id
                      ? 'border-primary/40 bg-primary/15 text-foreground shadow-lg shadow-primary/10'
                      : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground',
                  )}
                >
                  <Icon icon={item.icon} className="mt-0.5 size-5 shrink-0" />
                  <span>
                    <span className="block font-medium text-sm">{item.label}</span>
                    <span className="mt-1 block text-xs leading-5 opacity-80">{item.description}</span>
                  </span>
                </button>
              ))}
            </nav>

            <div className="mt-8 rounded-2xl border border-border bg-background/50 p-4">
              <p className="font-medium text-sm">部署状态</p>
              <p className="mt-2 text-muted-foreground text-xs leading-5">
                文章、图片和配置保存后会提交到 GitHub，Cloudflare Pages 会自动重新构建。
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('deploy')}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-green-400 text-xs transition hover:bg-green-500/15"
              >
                <span className="size-1.5 rounded-full bg-green-400" />
                查看发布进度
              </button>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-20 border-border border-b bg-background/80 backdrop-blur">
              <div className="flex flex-col gap-4 px-4 py-4 md:px-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm xl:hidden">
                    <Icon icon="ri:quill-pen-line" className="size-4" />
                    博客管理后台
                  </div>
                  <h2 className="mt-1 font-semibold text-2xl tracking-tight">{activeNav.label}</h2>
                  <p className="mt-1 text-muted-foreground text-sm">{activeNav.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
                    <Icon
                      icon={isLoading ? 'ri:loader-4-line' : 'ri:refresh-line'}
                      className={cn('mr-1.5 size-4', isLoading && 'animate-spin')}
                    />
                    刷新数据
                  </Button>
                  <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                    <Icon icon="ri:add-line" className="mr-1.5 size-4" />
                    写文章
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onLogout}>
                    <Icon icon="ri:logout-circle-r-line" className="mr-1.5 size-4" />
                    退出登录
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto px-4 pb-4 md:px-6 xl:hidden">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 font-medium text-sm transition',
                      activeTab === item.id
                        ? 'border-primary/40 bg-primary/15 text-primary'
                        : 'border-border bg-card text-muted-foreground',
                    )}
                  >
                    <Icon icon={item.icon} className="size-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </header>

            <main className="flex-1 px-4 py-6 md:px-6">
              {isLoading ? (
                <div className="flex h-80 items-center justify-center rounded-[2rem] border border-border bg-card/60">
                  <div className="text-center">
                    <Icon icon="ri:loader-4-line" className="mx-auto size-9 animate-spin text-primary" />
                    <p className="mt-3 text-muted-foreground text-sm">正在读取 GitHub 仓库内容...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex h-80 flex-col items-center justify-center gap-4 rounded-[2rem] border border-destructive/30 bg-destructive/10 p-8 text-center">
                  <Icon icon="ri:error-warning-line" className="size-12 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">后台数据读取失败</p>
                    <p className="mt-2 max-w-xl text-muted-foreground text-sm">{error}</p>
                  </div>
                  <Button variant="outline" onClick={fetchData}>
                    重试
                  </Button>
                </div>
              ) : data ? (
                <>
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <section className="overflow-hidden rounded-[2rem] border border-border bg-card/70 p-6 shadow-black/10 shadow-xl md:p-8">
                        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
                          <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary text-xs">
                              <Icon icon="ri:sparkling-2-line" className="size-4" />
                              今日写作入口
                            </div>
                            <h3 className="font-semibold text-3xl tracking-tight">管理文章、图片、分类与站点资料</h3>
                            <p className="mt-3 max-w-2xl text-muted-foreground leading-7">
                              这是项目自带 CMS
                              的线上改造版。你可以直接在网页里写文章、上传图片、整理分类标签、维护站点配置，并查看部署进度。
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2">
                              <Button onClick={() => setIsCreateDialogOpen(true)}>
                                <Icon icon="ri:add-line" className="mr-1.5 size-4" />
                                新建文章
                              </Button>
                              <Button variant="outline" onClick={() => setActiveTab('posts')}>
                                <Icon icon="ri:list-check" className="mr-1.5 size-4" />
                                管理文章
                              </Button>
                              <Button variant="outline" onClick={() => setActiveTab('media')}>
                                <Icon icon="ri:image-2-line" className="mr-1.5 size-4" />
                                管理图片
                              </Button>
                              <Button variant="outline" onClick={() => setActiveTab('taxonomy')}>
                                <Icon icon="ri:price-tag-3-line" className="mr-1.5 size-4" />
                                分类标签
                              </Button>
                              <Button variant="outline" onClick={() => setActiveTab('config')}>
                                <Icon icon="ri:settings-4-line" className="mr-1.5 size-4" />
                                修改站点设置
                              </Button>
                              <Button variant="outline" onClick={() => setActiveTab('deploy')}>
                                <Icon icon="ri:rocket-2-line" className="mr-1.5 size-4" />
                                查看发布状态
                              </Button>
                            </div>
                          </div>
                          <div className="rounded-3xl border border-border bg-background/55 p-5">
                            <p className="text-muted-foreground text-sm">内容状态</p>
                            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                              <div className="rounded-2xl bg-muted/40 p-3">
                                <p className="font-semibold text-2xl">{data.stats.total}</p>
                                <p className="mt-1 text-muted-foreground text-xs">文章</p>
                              </div>
                              <div className="rounded-2xl bg-green-500/10 p-3 text-green-400">
                                <p className="font-semibold text-2xl">{data.stats.published}</p>
                                <p className="mt-1 text-xs">已发布</p>
                              </div>
                              <div className="rounded-2xl bg-orange-500/10 p-3 text-orange-300">
                                <p className="font-semibold text-2xl">{data.stats.draft}</p>
                                <p className="mt-1 text-xs">草稿</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      <DashboardStats
                        total={data.stats.total}
                        published={data.stats.published}
                        draft={data.stats.draft}
                        trash={data.stats.trash}
                      />

                      <div className="grid gap-6 lg:grid-cols-2">
                        <CategoryStats categories={data.stats.categoryStats} maxDisplay={MAX_CATEGORY_DISPLAY} />
                        <RecentUpdates
                          posts={data.stats.recentPosts}
                          maxDisplay={MAX_RECENT_POSTS_DISPLAY}
                          onEdit={handleEditPost}
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'media' && <MediaLibrary />}

                  {activeTab === 'taxonomy' && <TaxonomyManager data={data} onChanged={fetchData} />}

                  {activeTab === 'deploy' && <DeployStatusPanel />}

                  {activeTab === 'config' && (
                    <div className="space-y-5">
                      <div className="rounded-[2rem] border border-border bg-card/70 p-6 shadow-black/10 shadow-xl">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="font-semibold text-xl">站点设置</h3>
                            <p className="mt-2 text-muted-foreground text-sm leading-6">
                              优先使用中文表单修改常用配置。高级 YAML 只用于维护更复杂的原始配置。
                            </p>
                          </div>
                          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary text-xs">
                            <Icon icon="ri:git-branch-line" className="size-4" />
                            保存后写入 GitHub
                          </div>
                        </div>
                      </div>
                      <SiteConfigEditor />
                    </div>
                  )}

                  {activeTab === 'posts' && (
                    <div className="space-y-5">
                      <div className="rounded-[2rem] border border-border bg-card/70 p-6 shadow-black/10 shadow-xl">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                          <div>
                            <h3 className="font-semibold text-xl">文章管理</h3>
                            <p className="mt-2 text-muted-foreground text-sm leading-6">
                              搜索文章，按分类或发布状态筛选。点击编辑图标进入可视化编辑器。
                            </p>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            共 {data.stats.total} 篇文章，筛选结果 {data.total} 篇
                          </p>
                        </div>

                        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px_180px]">
                          <div className="relative">
                            <Icon
                              icon="ri:search-line"
                              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                            />
                            <input
                              type="text"
                              placeholder="搜索文章标题、分类或标签..."
                              value={search}
                              onChange={(event) => setSearch(event.target.value)}
                              className="w-full rounded-2xl border border-input bg-background/80 py-3 pr-3 pl-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <div className="relative">
                            <Icon
                              icon="ri:folder-line"
                              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                            />
                            <select
                              value={category}
                              onChange={(event) => setCategory(event.target.value)}
                              className="w-full appearance-none rounded-2xl border border-input bg-background/80 py-3 pr-8 pl-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="">全部分类</option>
                              {data.categories.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                            <Icon
                              icon="ri:arrow-down-s-line"
                              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                            />
                          </div>
                          <div className="relative">
                            <Icon
                              icon="ri:filter-line"
                              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                            />
                            <select
                              value={status}
                              onChange={(event) => setStatus(event.target.value as StatusFilter)}
                              className="w-full appearance-none rounded-2xl border border-input bg-background/80 py-3 pr-8 pl-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="all">全部状态</option>
                              <option value="published">已发布</option>
                              <option value="draft">草稿</option>
                              <option value="trash">回收站</option>
                            </select>
                            <Icon
                              icon="ri:arrow-down-s-line"
                              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                            />
                          </div>
                        </div>
                      </div>

                      <PostTable
                        posts={data.posts}
                        sortField={sortField}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                        onToggleDraft={handleToggleDraft}
                        onToggleSticky={handleToggleSticky}
                        onEdit={handleEditPost}
                        onTrash={handleTrashPost}
                        onRestore={handleRestorePost}
                        onBulkAction={handleBulkAction}
                      />
                      {data.pagination.totalPages > 1 && (
                        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-muted-foreground text-sm">
                            第 {data.pagination.page} / {data.pagination.totalPages} 页，每页 {data.pagination.pageSize} 篇
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPage(Math.max(1, page - 1))}
                              disabled={page <= 1}
                            >
                              <Icon icon="ri:arrow-left-s-line" className="mr-1 size-4" />
                              上一页
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPage(Math.min(data.pagination.totalPages, page + 1))}
                              disabled={page >= data.pagination.totalPages}
                            >
                              下一页
                              <Icon icon="ri:arrow-right-s-line" className="ml-1 size-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </main>
          </div>
        </div>
      </div>

      <CreatePostDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        existingCategories={data?.categories || []}
        onSuccess={handleCreatePostSuccess}
      />
    </>
  );
}

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    hasCmsSession()
      .then(setIsAuthenticated)
      .finally(() => setIsCheckingSession(false));
    const handleUnauthorized = () => setIsAuthenticated(false);
    window.addEventListener('cms:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('cms:unauthorized', handleUnauthorized);
  }, []);

  const handleLogout = async () => {
    await logoutCms();
    setIsAuthenticated(false);
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Toaster position="top-right" richColors />
      {isCheckingSession ? (
        <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
          正在检查登录状态...
        </div>
      ) : isAuthenticated ? (
        <AppContent onLogout={handleLogout} />
      ) : (
        <LoginScreen onLogin={async () => setIsAuthenticated(true)} />
      )}
    </ErrorBoundary>
  );
}
