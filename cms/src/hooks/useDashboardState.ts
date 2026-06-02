/**
 * Dashboard State Hook
 *
 * Manages the main dashboard state including posts data, filters, sorting, and actions.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getCMSConfig, listPosts, toggleDraft, toggleSticky } from '@/lib/api';
import { buildEditorUrl, buildFilePath, getDefaultEditor } from '@/lib/editor-url';
import type { ListPostsResponse } from '@/types';

export type Tab = 'overview' | 'posts' | 'media' | 'taxonomy' | 'config' | 'deploy';
export type StatusFilter = 'all' | 'draft' | 'published';
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

  // Actions
  fetchData: () => Promise<void>;
  handleSort: (field: SortField) => void;
  handleToggleDraft: (postId: string) => Promise<void>;
  handleToggleSticky: (postId: string) => Promise<void>;
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
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const params = useMemo(
    () => ({
      search: search || undefined,
      category: category || undefined,
      status: status === 'all' ? undefined : status,
      sort: sortField,
      order: sortOrder,
    }),
    [search, category, status, sortField, sortOrder],
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listPosts(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '文章列表读取失败');
    } finally {
      setIsLoading(false);
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
    fetchData,
    handleSort,
    handleToggleDraft,
    handleToggleSticky,
    handleCreatePostSuccess,
    handleEditPost,
    handleOpenInEditor,
    handleEditorClose,
    handleEditorSaved,
  };
}
