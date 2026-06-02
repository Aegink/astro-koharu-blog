import { Icon } from '@iconify/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getCMSConfig, renameTaxonomy, saveCategoryMap } from '@/lib/api';
import { generateCategorySlug } from '@/lib/category';
import { cn } from '@/lib/utils';
import type { ListPostsResponse } from '@/types';

type RenameTarget = 'category' | 'tag';

type TaxonomyManagerProps = {
  data: ListPostsResponse | null;
  onChanged: () => Promise<void> | void;
};

function mapToText(map: Record<string, string>): string {
  return Object.entries(map)
    .map(([name, slug]) => `${name}: ${slug}`)
    .join('\n');
}

function textToMap(value: string): Record<string, string> {
  return Object.fromEntries(
    value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const index = line.indexOf(':');
        if (index === -1) return [line, generateCategorySlug(line)];
        return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^\/+|\/+$/g, '')];
      })
      .filter(([name, slug]) => name && slug),
  );
}

function usageText(count: number): string {
  return `${count} 篇文章使用`;
}

export function TaxonomyManager({ data, onChanged }: TaxonomyManagerProps) {
  const [categoryMapText, setCategoryMapText] = useState('');
  const [savedCategoryMapText, setSavedCategoryMapText] = useState('');
  const [renameTarget, setRenameTarget] = useState<RenameTarget>('category');
  const [renameFrom, setRenameFrom] = useState('');
  const [renameTo, setRenameTo] = useState('');
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [isSavingMap, setIsSavingMap] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  const categoryStats = data?.stats.categoryStats || [];
  const tagStats = data?.stats.tagStats || [];
  const categoryNames = data?.categories || [];
  const tagNames = data?.tags || [];
  const renameOptions = renameTarget === 'category' ? categoryNames : tagNames;
  const categoryMap = useMemo(() => textToMap(categoryMapText), [categoryMapText]);
  const missingMappings = categoryNames.filter((name) => !categoryMap[name]);
  const isDirty = categoryMapText !== savedCategoryMapText;

  useEffect(() => {
    let cancelled = false;
    setIsLoadingMap(true);
    getCMSConfig()
      .then((config) => {
        if (cancelled) return;
        const text = mapToText(config.categoryMap || {});
        setCategoryMapText(text);
        setSavedCategoryMapText(text);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : '分类映射读取失败'))
      .finally(() => {
        if (!cancelled) setIsLoadingMap(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleGenerateMissing = () => {
    const next = { ...categoryMap };
    for (const name of missingMappings) next[name] = generateCategorySlug(name);
    setCategoryMapText(mapToText(next));
    toast.success('已为缺失分类生成 URL 路径，请检查后保存');
  };

  const handleSaveMap = async () => {
    setIsSavingMap(true);
    try {
      const nextMap = textToMap(categoryMapText);
      await saveCategoryMap(nextMap);
      const nextText = mapToText(nextMap);
      setCategoryMapText(nextText);
      setSavedCategoryMapText(nextText);
      toast.success('分类 URL 映射已保存');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '分类映射保存失败');
    } finally {
      setIsSavingMap(false);
    }
  };

  const handleRename = async () => {
    const from = renameFrom.trim();
    const to = renameTo.trim();
    if (!from || !to) {
      toast.error('请选择旧名称并填写新名称');
      return;
    }
    const confirmed = window.confirm(`确定把${renameTarget === 'category' ? '分类' : '标签'}“${from}”批量改成“${to}”吗？`);
    if (!confirmed) return;

    setIsRenaming(true);
    try {
      const result = await renameTaxonomy(renameTarget, from, to);
      toast.success(`已更新 ${result.changed} 篇文章`);
      setRenameFrom('');
      setRenameTo('');
      if (renameTarget === 'category') {
        const nextMap = { ...categoryMap };
        if (nextMap[from]) {
          nextMap[to] = nextMap[from];
          delete nextMap[from];
          const text = mapToText(nextMap);
          setCategoryMapText(text);
          setSavedCategoryMapText(text);
        }
      }
      await onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '重命名失败');
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg shadow-black/5">
        <div className="border-border border-b bg-gradient-to-r from-emerald-500/15 via-card to-card p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-300 text-xs">
                <Icon icon="ri:price-tag-3-line" className="size-4" />
                分类与标签
              </div>
              <h2 className="font-bold text-2xl">整理内容结构</h2>
              <p className="max-w-2xl text-muted-foreground text-sm leading-6">
                这里可以查看分类/标签使用次数、生成分类 URL 映射，也可以把旧分类或旧标签批量重命名。
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onChanged()}>
              <Icon icon="ri:refresh-line" className="mr-1.5 size-4" />
              刷新文章统计
            </Button>
          </div>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-[1.1fr_0.9fr] lg:p-6">
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">分类 URL 映射</h3>
                  <p className="mt-1 text-muted-foreground text-sm">左边是文章分类名，右边是前台 URL 路径。</p>
                </div>
                {missingMappings.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handleGenerateMissing}>
                    补齐 {missingMappings.length} 个
                  </Button>
                )}
              </div>
              <textarea
                value={categoryMapText}
                onChange={(event) => setCategoryMapText(event.target.value)}
                disabled={isLoadingMap}
                rows={12}
                spellCheck={false}
                className="w-full resize-y rounded-2xl border border-input bg-background px-3 py-3 font-mono text-sm leading-6 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder={'随笔: life\n笔记: note\n前端: front-end'}
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-muted-foreground text-xs">改 URL 路径会影响旧分类链接；只改分类显示名请使用右侧“批量重命名”。</p>
                <Button size="sm" onClick={handleSaveMap} disabled={!isDirty || isLoadingMap || isSavingMap}>
                  <Icon icon={isSavingMap ? 'ri:loader-4-line' : 'ri:save-3-line'} className={cn('mr-1.5 size-4', isSavingMap && 'animate-spin')} />
                  保存映射
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <h3 className="font-semibold">批量重命名</h3>
              <p className="mt-1 text-muted-foreground text-sm">会直接修改所有文章里的 frontmatter，保存后触发重新部署。</p>
              <div className="mt-4 grid gap-3 md:grid-cols-[140px_1fr_1fr_auto]">
                <select
                  value={renameTarget}
                  onChange={(event) => {
                    setRenameTarget(event.target.value as RenameTarget);
                    setRenameFrom('');
                  }}
                  className="rounded-2xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="category">分类</option>
                  <option value="tag">标签</option>
                </select>
                <select
                  value={renameFrom}
                  onChange={(event) => setRenameFrom(event.target.value)}
                  className="rounded-2xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">选择旧名称</option>
                  {renameOptions.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={renameTo}
                  onChange={(event) => setRenameTo(event.target.value)}
                  placeholder="输入新名称"
                  className="rounded-2xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <Button onClick={handleRename} disabled={isRenaming || !renameFrom || !renameTo.trim()}>
                  <Icon icon={isRenaming ? 'ri:loader-4-line' : 'ri:replace-line'} className={cn('mr-1.5 size-4', isRenaming && 'animate-spin')} />
                  重命名
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <h3 className="mb-3 font-semibold">分类使用情况</h3>
              <div className="space-y-2">
                {categoryStats.length === 0 && <p className="text-muted-foreground text-sm">暂无分类</p>}
                {categoryStats.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-xl bg-muted/25 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-sm">{item.name}</p>
                      <p className="text-muted-foreground text-xs">/{categoryMap[item.name] || generateCategorySlug(item.name)}</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-300 text-xs">{usageText(item.count)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <h3 className="mb-3 font-semibold">标签使用情况</h3>
              <div className="flex flex-wrap gap-2">
                {tagStats.length === 0 && <p className="text-muted-foreground text-sm">暂无标签</p>}
                {tagStats.map((item) => (
                  <span key={item.name} className="rounded-full border border-border bg-muted/20 px-3 py-1.5 text-sm">
                    {item.name} <span className="text-muted-foreground">{item.count}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}