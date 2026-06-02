import { Icon } from '@iconify/react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getDeployStatus } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { CloudflareDeploymentInfo, CommitInfo, DeployStatusResponse } from '@/types';

function timeAgo(value?: string): string {
  if (!value) return '未知时间';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return formatDistanceToNow(date, { addSuffix: true, locale: zhCN });
}

function statusStyle(status: string): string {
  const normalized = status.toLowerCase();
  if (['success', 'done', 'complete'].includes(normalized)) return 'border-green-500/30 bg-green-500/10 text-green-300';
  if (['failure', 'failed', 'canceled', 'cancelled'].includes(normalized)) return 'border-red-500/30 bg-red-500/10 text-red-300';
  if (['active', 'queued', 'running', 'building'].includes(normalized)) return 'border-amber-500/30 bg-amber-500/10 text-amber-200';
  return 'border-border bg-muted/20 text-muted-foreground';
}

function statusText(status: string): string {
  const normalized = status.toLowerCase();
  if (['success', 'done', 'complete'].includes(normalized)) return '已成功';
  if (['failure', 'failed'].includes(normalized)) return '失败';
  if (['canceled', 'cancelled'].includes(normalized)) return '已取消';
  if (['active', 'running', 'building'].includes(normalized)) return '构建中';
  if (normalized === 'queued') return '排队中';
  return status || '未知状态';
}

function CommitCard({ commit }: { commit: CommitInfo }) {
  return (
    <a
      href={commit.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl border border-border bg-background/60 p-4 transition hover:border-primary/40 hover:bg-muted/20"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 font-medium text-sm">{commit.message}</p>
          <p className="mt-2 text-muted-foreground text-xs">{commit.author || '未知作者'} · {timeAgo(commit.date)}</p>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2 py-1 font-mono text-xs">{commit.shortSha}</span>
      </div>
    </a>
  );
}

function DeploymentCard({ deployment }: { deployment: CloudflareDeploymentInfo }) {
  const displayUrl = deployment.aliases[0] || deployment.url || '';
  return (
    <article className="rounded-2xl border border-border bg-background/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('rounded-full border px-2 py-1 text-xs', statusStyle(deployment.status))}>{statusText(deployment.status)}</span>
            {deployment.environment && <span className="rounded-full bg-muted px-2 py-1 text-muted-foreground text-xs">{deployment.environment}</span>}
            {deployment.branch && <span className="rounded-full bg-muted px-2 py-1 text-muted-foreground text-xs">{deployment.branch}</span>}
          </div>
          <h3 className="mt-3 line-clamp-2 font-medium text-sm">{deployment.commitMessage || 'Cloudflare Pages 部署'}</h3>
          <p className="mt-2 text-muted-foreground text-xs">创建于 {timeAgo(deployment.createdOn)} · 更新于 {timeAgo(deployment.modifiedOn)}</p>
        </div>
        {displayUrl && (
          <Button variant="outline" size="sm" onClick={() => window.open(displayUrl.startsWith('http') ? displayUrl : `https://${displayUrl}`, '_blank', 'noopener,noreferrer')}>
            访问
          </Button>
        )}
      </div>
      <div className="mt-4 grid gap-2 text-xs md:grid-cols-2">
        <div className="rounded-xl bg-muted/20 px-3 py-2 text-muted-foreground">
          部署 ID：<span className="font-mono text-foreground">{deployment.id.slice(0, 12)}</span>
        </div>
        <div className="rounded-xl bg-muted/20 px-3 py-2 text-muted-foreground">
          提交：<span className="font-mono text-foreground">{deployment.commitHash ? deployment.commitHash.slice(0, 7) : '未知'}</span>
        </div>
      </div>
    </article>
  );
}

export function DeployStatusPanel() {
  const [data, setData] = useState<DeployStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const latestDeployment = data?.cloudflare.deployments[0];
  const syncState = useMemo(() => {
    if (!data?.latestCommit) return '还没有读取到 GitHub 提交记录。';
    if (!latestDeployment?.commitHash) return '已读取 GitHub 最新提交，等待 Cloudflare Pages 部署记录。';
    return latestDeployment.commitHash.startsWith(data.latestCommit.sha)
      ? 'Cloudflare Pages 已部署 GitHub 最新提交。'
      : 'GitHub 有新提交，Cloudflare Pages 可能仍在构建或等待队列。';
  }, [data?.latestCommit, latestDeployment]);

  const loadStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await getDeployStatus());
    } catch (err) {
      const message = err instanceof Error ? err.message : '发布状态读取失败';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg shadow-black/5">
        <div className="border-border border-b bg-gradient-to-r from-amber-500/15 via-card to-card p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-amber-200 text-xs">
                <Icon icon="ri:rocket-2-line" className="size-4" />
                发布状态
              </div>
              <h2 className="font-bold text-2xl">查看保存后的部署进度</h2>
              <p className="max-w-2xl text-muted-foreground text-sm leading-6">
                文章、图片或配置保存后会先提交到 GitHub，然后由 Cloudflare Pages 自动构建。这里用来确认最新提交是否已经上线。
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={loadStatus} disabled={isLoading}>
              <Icon icon={isLoading ? 'ri:loader-4-line' : 'ri:refresh-line'} className={cn('mr-1.5 size-4', isLoading && 'animate-spin')} />
              刷新状态
            </Button>
          </div>
        </div>

        <div className="p-5 lg:p-6">
          {error && <div className="mb-5 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-destructive text-sm">{error}</div>}
          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center text-muted-foreground">
              <Icon icon="ri:loader-4-line" className="mr-2 size-5 animate-spin" />
              正在读取发布状态...
            </div>
          ) : data ? (
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-border bg-background/60 p-4">
                  <p className="text-muted-foreground text-sm">GitHub 仓库</p>
                  <p className="mt-2 font-semibold">{data.repo.owner}/{data.repo.name}</p>
                  <p className="mt-1 text-muted-foreground text-xs">分支：{data.repo.branch}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/60 p-4">
                  <p className="text-muted-foreground text-sm">Cloudflare Pages</p>
                  <p className="mt-2 font-semibold">{data.cloudflare.projectName}</p>
                  <p className="mt-1 text-muted-foreground text-xs">{data.cloudflare.configured ? '已配置 API 读取权限' : '未配置 API 读取权限'}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/60 p-4">
                  <p className="text-muted-foreground text-sm">同步判断</p>
                  <p className="mt-2 text-sm leading-6">{syncState}</p>
                </div>
              </div>

              {!data.cloudflare.configured && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100 text-sm leading-6">
                  <p className="font-medium">Cloudflare 部署列表还没有启用。</p>
                  <p className="mt-1">{data.cloudflare.message}</p>
                  {data.cloudflare.missingVariables && data.cloudflare.missingVariables.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {data.cloudflare.missingVariables.map((name) => (
                        <span key={name} className="rounded-full bg-black/20 px-2 py-1 font-mono text-xs text-amber-50">{name}</span>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 text-amber-50/90">配置完成并重新部署后，这里会显示最近 5 次 Cloudflare Pages 部署记录。</p>
                </div>
              )}
              {data.cloudflare.configured && data.cloudflare.message && (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-destructive text-sm leading-6">
                  <p className="font-medium">Cloudflare 部署列表读取失败</p>
                  <p className="mt-1">{data.cloudflare.message}</p>
                </div>
              )}

              <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-3">
                  <h3 className="font-semibold">最近 GitHub 提交</h3>
                  {data.commits.length === 0 ? <p className="text-muted-foreground text-sm">暂无提交记录</p> : data.commits.map((commit) => <CommitCard key={commit.sha} commit={commit} />)}
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold">最近 Cloudflare 部署</h3>
                  {data.cloudflare.deployments.length === 0 ? (
                    <div className="rounded-2xl border border-border border-dashed p-6 text-muted-foreground text-sm">暂无 Cloudflare 部署记录。若刚保存内容，请等待 Pages 构建开始后再刷新。</div>
                  ) : (
                    data.cloudflare.deployments.map((deployment) => <DeploymentCard key={deployment.id} deployment={deployment} />)
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}