/**
 * Post Table Component
 *
 * Displays a sortable table of blog posts with actions.
 */

import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import type { SortField, SortOrder } from '@/hooks';
import { cn } from '@/lib/utils';
import type { PostListItem } from '@/types';

interface SortableHeaderProps {
  label: string;
  field: SortField;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

function SortableHeader({ label, field, sortField, sortOrder, onSort }: SortableHeaderProps) {
  const isActive = field === sortField;
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={cn('flex items-center gap-1 font-medium text-xs uppercase tracking-wide', isActive && 'text-primary')}
    >
      {label}
      <Icon
        icon={isActive ? (sortOrder === 'asc' ? 'ri:arrow-up-s-fill' : 'ri:arrow-down-s-fill') : 'ri:arrow-up-down-line'}
        className={cn('size-4', !isActive && 'opacity-50')}
      />
    </button>
  );
}

function formatPostDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return format(date, 'yyyy-MM-dd');
}

interface PostTableProps {
  posts: PostListItem[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onToggleDraft: (postId: string) => void;
  onToggleSticky?: (postId: string) => void;
  onEdit?: (postId: string) => void;
  onOpenInEditor?: (postId: string) => void;
  onTrash?: (postId: string) => void;
  onRestore?: (postId: string) => void;
  onBulkAction?: (postIds: string[], action: 'publish' | 'draft' | 'trash' | 'restore') => Promise<void>;
}

export function PostTable({
  posts,
  sortField,
  sortOrder,
  onSort,
  onToggleDraft,
  onToggleSticky,
  onEdit,
  onOpenInEditor,
  onTrash,
  onRestore,
  onBulkAction,
}: PostTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => posts.some((post) => post.id === id)));
  }, [posts]);

  const allSelected = posts.length > 0 && posts.every((post) => selectedIds.includes(post.id));
  const selectedPosts = posts.filter((post) => selectedIds.includes(post.id));
  const hasSelectedActive = selectedPosts.some((post) => !post.deleted);
  const hasSelectedDeleted = selectedPosts.some((post) => post.deleted);
  const toggleSelected = (postId: string) => {
    setSelectedIds((current) => (current.includes(postId) ? current.filter((id) => id !== postId) : [...current, postId]));
  };
  const runBulkAction = async (action: 'publish' | 'draft' | 'trash' | 'restore') => {
    if (!onBulkAction || selectedIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      await onBulkAction(selectedIds, action);
      setSelectedIds([]);
    } finally {
      setIsBulkUpdating(false);
    }
  };
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border border-dashed p-8 text-center">
        <Icon icon="ri:file-list-3-line" className="size-12 text-muted-foreground" />
        <p className="mt-2 font-medium text-muted-foreground">没有找到文章</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {onBulkAction && selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
          <span className="mr-1 text-sm">已选择 {selectedIds.length} 篇</span>
          {hasSelectedActive && (
            <>
              <button
                type="button"
                className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
                disabled={isBulkUpdating}
                onClick={() => runBulkAction('publish')}
              >
                发布
              </button>
              <button
                type="button"
                className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
                disabled={isBulkUpdating}
                onClick={() => runBulkAction('draft')}
              >
                转草稿
              </button>
              <button
                type="button"
                className="rounded-lg border border-destructive/30 px-3 py-1.5 text-destructive text-sm hover:bg-destructive/10"
                disabled={isBulkUpdating}
                onClick={() => runBulkAction('trash')}
              >
                移入回收站
              </button>
            </>
          )}
          {hasSelectedDeleted && (
            <button
              type="button"
              className="rounded-lg border border-emerald-500/30 px-3 py-1.5 text-emerald-400 text-sm hover:bg-emerald-500/10"
              disabled={isBulkUpdating}
              onClick={() => runBulkAction('restore')}
            >
              恢复
            </button>
          )}
          <button
            type="button"
            className="ml-auto text-muted-foreground text-sm hover:text-foreground"
            disabled={isBulkUpdating}
            onClick={() => setSelectedIds([])}
          >
            取消选择
          </button>
        </div>
      )}
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-border border-b bg-muted/50">
              <tr>
                <th className="w-10 px-3 py-3 text-center">
                  <input
                    aria-label="全选当前页"
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => setSelectedIds(allSelected ? [] : posts.map((post) => post.id))}
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortableHeader label="标题" field="title" sortField={sortField} sortOrder={sortOrder} onSort={onSort} />
                </th>
                <th className="hidden px-4 py-3 text-left md:table-cell">
                  <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">分类</span>
                </th>
                <th className="hidden px-4 py-3 text-left lg:table-cell">
                  <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">标签</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <SortableHeader label="日期" field="date" sortField={sortField} sortOrder={sortOrder} onSort={onSort} />
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">状态</span>
                </th>
                <th className="px-4 py-3 text-right">
                  <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">操作</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((post) => (
                <tr key={post.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-3 py-3 text-center">
                    <input
                      aria-label={`选择 ${post.title}`}
                      type="checkbox"
                      checked={selectedIds.includes(post.id)}
                      onChange={() => toggleSelected(post.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="min-w-56 space-y-1">
                      <div className="flex items-center gap-2">
                        {post.sticky && (
                          <span title="置顶文章">
                            <Icon icon="ri:pushpin-fill" className="size-4 shrink-0 text-orange-500" />
                          </span>
                        )}
                        <span className="line-clamp-1 font-medium text-sm">{post.title}</span>
                      </div>
                      <p className="line-clamp-1 text-muted-foreground text-xs">{post.description || post.id}</p>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className="text-muted-foreground text-sm">{post.categories.join(' > ') || '-'}</span>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-md bg-muted px-2 py-0.5 text-xs">
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="rounded-md bg-muted px-2 py-0.5 text-muted-foreground text-xs">
                          +{post.tags.length - 3}
                        </span>
                      )}
                      {post.tags.length === 0 && <span className="text-muted-foreground text-xs">-</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-muted-foreground text-sm">{formatPostDate(post.date)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-xs',
                        post.draft ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500',
                      )}
                    >
                      {post.deleted ? '回收站' : post.draft ? '草稿' : '已发布'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && !post.deleted && (
                        <button
                          type="button"
                          onClick={() => onEdit(post.id)}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          title="编辑文章"
                        >
                          <Icon icon="ri:edit-line" className="size-4" />
                        </button>
                      )}
                      {onOpenInEditor && !post.deleted && (
                        <button
                          type="button"
                          onClick={() => onOpenInEditor(post.id)}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          title="在 VS Code 打开"
                        >
                          <Icon icon="ri:vscode-line" className="size-4" />
                        </button>
                      )}
                      {onToggleSticky && !post.deleted && (
                        <button
                          type="button"
                          onClick={() => onToggleSticky(post.id)}
                          className={cn(
                            'rounded-md p-1.5 transition-colors hover:bg-accent hover:text-foreground',
                            post.sticky ? 'text-orange-500' : 'text-muted-foreground',
                          )}
                          title={post.sticky ? '取消置顶' : '置顶文章'}
                        >
                          <Icon icon={post.sticky ? 'ri:pushpin-fill' : 'ri:pushpin-line'} className="size-4" />
                        </button>
                      )}
                      {!post.deleted && (
                        <button
                          type="button"
                          onClick={() => onToggleDraft(post.id)}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          title={post.draft ? '发布文章' : '设为草稿'}
                        >
                          <Icon icon={post.draft ? 'ri:check-line' : 'ri:draft-line'} className="size-4" />
                        </button>
                      )}
                      {post.deleted && onRestore ? (
                        <button
                          type="button"
                          onClick={() => onRestore(post.id)}
                          className="rounded-md p-1.5 text-emerald-400 transition-colors hover:bg-emerald-500/10"
                          title="恢复文章"
                        >
                          <Icon icon="ri:arrow-go-back-line" className="size-4" />
                        </button>
                      ) : onTrash ? (
                        <button
                          type="button"
                          onClick={() => onTrash(post.id)}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          title="移入回收站"
                        >
                          <Icon icon="ri:delete-bin-line" className="size-4" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
