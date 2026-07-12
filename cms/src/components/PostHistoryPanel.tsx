import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getPostHistory, restorePostVersion } from '@/lib/api';
import type { PostHistoryEntry, ReadPostResult } from '@/types';

type PostHistoryPanelProps = {
  postId: string;
  baseSha: string;
  onRestored: (post: ReadPostResult) => void;
};

export function PostHistoryPanel({ postId, baseSha, onRestored }: PostHistoryPanelProps) {
  const [commits, setCommits] = useState<PostHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoringSha, setRestoringSha] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      setCommits(await getPostHistory(postId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '版本历史读取失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getPostHistory(postId)
      .then((items) => {
        if (!cancelled) setCommits(items);
      })
      .catch((error) => {
        if (!cancelled) toast.error(error instanceof Error ? error.message : '版本历史读取失败');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const restore = async (commit: PostHistoryEntry) => {
    if (!window.confirm(`确定恢复到版本 ${commit.shortSha} 吗？当前内容会作为新的 Git 历史保留。`)) return;
    setRestoringSha(commit.sha);
    try {
      const result = await restorePostVersion(postId, commit.sha, baseSha);
      onRestored(result);
      toast.success('文章版本已恢复');
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '文章版本恢复失败');
    } finally {
      setRestoringSha(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        <Icon icon="ri:loader-4-line" className="mr-2 size-5 animate-spin" />
        正在读取版本历史...
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs">最近 {commits.length} 个影响此文章的 Git 版本</p>
        <Button variant="outline" size="sm" onClick={load}>
          刷新
        </Button>
      </div>
      {commits.length === 0 ? (
        <p className="rounded-xl border border-dashed p-5 text-center text-muted-foreground text-sm">暂无版本记录</p>
      ) : (
        commits.map((commit) => (
          <article key={commit.sha} className="rounded-xl border border-border bg-background/60 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="line-clamp-2 font-medium text-sm">{commit.message}</p>
                <p className="mt-1 text-muted-foreground text-xs">
                  {commit.shortSha} · {commit.author || '未知作者'}
                </p>
                <p className="mt-1 text-muted-foreground text-xs">
                  {commit.date ? new Date(commit.date).toLocaleString('zh-CN') : '未知时间'}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => restore(commit)} disabled={restoringSha !== null}>
                {restoringSha === commit.sha ? <Icon icon="ri:loader-4-line" className="size-4 animate-spin" /> : '恢复'}
              </Button>
            </div>
          </article>
        ))
      )}
    </div>
  );
}
