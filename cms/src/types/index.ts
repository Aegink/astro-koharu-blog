/**
 * CMS Type Definitions
 */

/**
 * Configuration for a single editor
 */
export interface EditorConfig {
  /** Unique identifier for the editor */
  id: string;
  /** Display name */
  name: string;
  /** Iconify icon identifier (e.g., 'ri:vscode-line') */
  icon: string;
  /** URL template with placeholders: {path}, {line}, {column} */
  urlTemplate: string;
}

/**
 * CMS configuration from cms.yaml
 */
export interface CMSConfig {
  /** Whether CMS features are enabled (dev only) */
  enabled: boolean;
  /** Absolute path to the local project directory */
  localProjectPath: string;
  /** Relative path from project root to content directory (default: 'src/content/blog') */
  contentRelativePath: string;
  /** List of configured editors */
  editors: EditorConfig[];
}

/**
 * Blog post frontmatter schema
 */
export interface BlogSchema {
  title: string;
  date?: Date;
  updated?: Date;
  description?: string;
  categories?: string | string[] | string[][];
  tags?: string[];
  cover?: string;
  link?: string;
  subtitle?: string;
  catalog?: boolean;
  draft?: boolean;
  deletedAt?: string;
  deletedDraft?: boolean;
  sticky?: boolean;
  tocNumbering?: boolean;
  excludeFromSummary?: boolean;
  math?: boolean;
  quiz?: boolean;
  password?: string;
  keywords?: string[];
}

/**
 * Result from reading a post
 */
export interface ReadPostResult {
  frontmatter: BlogSchema;
  content: string;
  sha: string;
}

export interface WritePostResponse {
  success: boolean;
  sha: string;
}

export interface PostHistoryEntry {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  date: string;
  url?: string;
}

/**
 * Post list item for dashboard display
 */
export interface PostListItem {
  id: string;
  slug: string;
  title: string;
  description?: string;
  date: string;
  updated?: string;
  categories: string[];
  tags: string[];
  draft: boolean;
  sticky: boolean;
  deleted: boolean;
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  total: number;
  published: number;
  draft: number;
  trash: number;
  categoryStats: { name: string; count: number }[];
  tagStats: { name: string; count: number }[];
  recentPosts: PostListItem[];
}

/**
 * Response from list posts API
 */
export interface ListPostsResponse {
  posts: PostListItem[];
  total: number;
  stats: DashboardStats;
  categories: string[];
  tags: string[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Parameters for listing posts
 */
export interface ListPostsParams {
  category?: string;
  tag?: string;
  status?: 'all' | 'draft' | 'published' | 'trash';
  search?: string;
  sort?: 'date' | 'title' | 'updated';
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/**
 * Parameters for creating a post
 */
export interface CreatePostParams {
  title: string;
  categories?: string[];
  tags?: string[];
  draft?: boolean;
  categoryMappings?: Record<string, string>;
}

/**
 * Response from create post API
 */
export interface CreatePostResponse {
  success: boolean;
  postId: string;
  message?: string;
}

/**
 * Response from toggle draft API
 */
export interface ToggleDraftResponse {
  success: boolean;
  draft: boolean;
}

/**
 * Response from toggle sticky API
 */
export interface ToggleStickyResponse {
  success: boolean;
  sticky: boolean;
}

export interface MediaImage {
  name: string;
  path: string;
  url: string;
  rawUrl: string;
  size: number;
  sha: string;
  extension: string;
  deletable: boolean;
  managed: boolean;
  group: string;
}

export interface MediaLibraryResponse {
  images: MediaImage[];
  directory: string;
  uploadDirectory?: string;
}

export interface TaxonomyRenameResponse {
  success: boolean;
  changed: number;
  files: string[];
}

export interface CommitInfo {
  sha: string;
  shortSha: string;
  message: string;
  url: string;
  author: string;
  date: string;
}

export interface CloudflareDeploymentInfo {
  id: string;
  url?: string;
  aliases: string[];
  environment: string;
  status: string;
  stage: string;
  createdOn: string;
  modifiedOn: string;
  commitHash: string;
  commitMessage: string;
  branch: string;
}

export interface DeployStatusResponse {
  repo: {
    owner: string;
    name: string;
    branch: string;
  };
  latestCommit: CommitInfo | null;
  commits: CommitInfo[];
  cloudflare: {
    configured: boolean;
    projectName: string;
    message: string;
    missingVariables?: string[];
    deployments: CloudflareDeploymentInfo[];
  };
}
