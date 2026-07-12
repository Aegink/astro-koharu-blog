/**
 * Dashboard State Hook
 *
 * Manages the main dashboard state including posts data, filters, sorting, and actions.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { bulkUpdatePosts, getCMSConfig, listPosts, setPostDeleted, toggleDraft, toggleSticky } from '@/lib/api';
import { buildEditorUrl, buildFilePath, getDefaultEditor } from '@/lib/editor-url';
import type { ListPostsResponse } from '@/types';

export type Tab = 'overview' | 'posts' | 'media' | 'taxonomy' | 'config' | 'deploy';
export type StatusFilter = 'all' | 'draft' | 'published' | 'trash';
export type SortField = 'date' | 'updated' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface UseDashboardStateResult {
  // Tab state
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;

  // Data state
  data: ListPostsResponse | null;
  isLoading: boolean;
  error: string | null;

  // Dialog state
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
  editingPostId: string | null;

  // Filter state
  search: string;
  setSearch: (search: string) => void;
  category: string;
  setCategory: (category: string) => void;
  status: StatusFilter;
  setStatus: (status: StatusFilter) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  page: number;
  setPage: (page: number) => void;

  // Actions
  fetchData: () => Promise<void>;
  handleSort: (field: SortField) => void;
  handleToggleDraft: (postId: string) => Promise<void>;
  handleToggleSticky: (postId: string) => Promise<void>;
  handleTrashPost: (postId: string) => Promise<void>;
  handleRestorePost: (postId: string) => Promise<void>;
  handleBulkAction: (postIds: string[], action: 'publish' | 'draft' | 'trash' | 'restore') => Promise<void>;
  handleCreatePostSuccess: (postId: string) => void;
  handleEditPost: (postId: string) => void;
  handleOpenInEditor: (postId: string) => void;
  handleEditorClose: () => void;
  handleEditorSaved: () => void;
}

export function useDashboardState(): UseDashboardStateResult {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [data, setData] = useState<ListPostsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog/Editor state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Config state
  const [projectRoot, setProjectRoot] = useState<string>('');

  // Filter state
  const [search, setSearchState] = useState('');
  const [category, setCategoryState] = useState('');
  const [status, setStatusState] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const hasLoaded = useRef(false);
  const requestId = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const setSearch = useCallback((value: string) => setSearchState(value), []);
  const setCategory = useCallback((value: string) => {
    setCategoryState(value);
    setPage(1);
  }, []);
  const setStatus = useCallback((value: StatusFilter) => {
    setStatusState(value);
    setPage(1);
  }, []);

  const params = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      category: category || undefined,
      status: status === 'all' ? undefined : status,
      sort: sortField,
      order: sortOrder,
      page,
      pageSize: 20,
    }),
    [debouncedSearch, category, status, sortField, sortOrder, page],
  );

  const fetchData = useCallback(async () => {
    const currentRequest = ++requestId.current;
    if (!hasLoaded.current) setIsLoading(true);
    setError(null);
    try {
      const result = await listPosts(params);
      if (currentRequest !== requestId.current) return;
      setData(result);
      hasLoaded.current = true;
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      const message = err instanceof Error ? err.message : '文章列表读取失败';
      if (hasLoaded.current) toast.error(message);
      else setError(message);
    } finally {
      if (currentRequest === requestId.current) setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch CMS config for project root (needed for editor URLs)
  useEffect(() => {
    getCMSConfig()
      .then((config) => setProjectRoot(config.projectRoot))
      .catch((err) => console.error('Failed to load CMS config:', err));
  }, []);

  const handleSort = useCallback(
    (field: SortField) => {
      setPage(1);
      if (field === sortField) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortOrder('desc');
      }
    },
    [sortField],
  );

  const handleToggleDraft = useCallback(
    async (postId: string) => {
      try {
        const result = await toggleDraft(postId);
        toast.success(result.draft ? '已设为草稿' : '文章已发布');
        fetchData();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '文章发布状态切换失败');
      }
    },
    [fetchData],
  );

  const handleToggleSticky = useCallback(
    async (postId: string) => {
      try {
        const result = await toggleSticky(postId);
        toast.success(result.sticky ? '文章已置顶' : '已取消置顶');
        fetchData();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '文章置顶状态切换失败');
      }
    },
    [fetchData],
  );

  const handleTrashPost = useCallback(
    async (postId: string) => {
      if (!window.confirm('确定把这篇文章移入回收站吗？文章会立即转为草稿，并可随时恢复。')) return;
      try {
        await setPostDeleted(postId, true);
        toast.success('文章已移入回收站');
        await fetchData();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '文章移入回收站失败');
      }
    },
    [fetchData],
  );

  const handleRestorePost = useCallback(
    async (postId: string) => {
      try {
        await setPostDeleted(postId, false);
        toast.success('文章已从回收站恢复');
        await fetchData();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '文章恢复失败');
      }
    },
    [fetchData],
  );

  const handleBulkAction = useCallback(
    async (postIds: string[], action: 'publish' | 'draft' | 'trash' | 'restore') => {
      const labels = { publish: '发布', draft: '转为草稿', trash: '移入回收站', restore: '恢复' };
      if (!window.confirm(`确定对选中的 ${postIds.length} 篇文章执行“${labels[action]}”吗？`)) return;
      try {
        const changed = await bulkUpdatePosts(postIds, action);
        toast.success(`已处理 ${changed} 篇文章`);
        await fetchData();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '批量操作失败');
      }
    },
    [fetchData],
  );

  const handleCreatePostSuccess = useCallback(
    (postId: string) => {
      toast.success('文章已创建，正在打开编辑器');
      setIsCreateDialogOpen(false);
      setEditingPostId(postId);
      fetchData();
    },
    [fetchData],
  );

  const handleEditPost = useCallback((postId: string) => {
    setEditingPostId(postId);
  }, []);

  const handleOpenInEditor = useCallback(
    (postId: string) => {
      if (!projectRoot) {
        toast.error('项目根目录未配置，请刷新后重试');
        return;
      }
      const editor = getDefaultEditor();
      const filePath = buildFilePath(projectRoot, postId);
      const url = buildEditorUrl(editor, filePath);
      window.open(url, '_blank');
    },
    [projectRoot],
  );

  const handleEditorClose = useCallback(() => {
    setEditingPostId(null);
  }, []);

  const handleEditorSaved = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
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
    handleOpenInEditor,
    handleEditorClose,
    handleEditorSaved,
  };
}
