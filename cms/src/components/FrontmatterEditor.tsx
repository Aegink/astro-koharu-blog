/**
 * 文章属性 Editor
 *
 * Sidebar panel for editing post frontmatter fields.
 * Uses react-hook-form with Zod validation.
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify/react';
import { format, isValid, parse } from 'date-fns';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useForm } from 'react-hook-form';
import { uploadImage } from '@/lib/api';
import { type FrontmatterFormData, frontmatterSchema } from '@/lib/schemas';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { BlogSchema } from '@/types';

export interface FrontmatterEditorRef {
  getFormData: () => FrontmatterFormData;
  isDirty: () => boolean;
}

interface FrontmatterEditorProps {
  frontmatter: BlogSchema;
  onChange: (frontmatter: BlogSchema) => void;
  onCategoriesChange?: (categories: string[]) => void;
}

/**
 * Formats a Date to YYYY-MM-DD HH:mm:ss string
 */
function formatDate(date: Date | string | undefined): string {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (!isValid(d)) return '';
  return format(d, 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Parses a date string to Date object
 */
function parseDate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;
  // Try parsing with format pattern
  const parsed = parse(dateStr, 'yyyy-MM-dd HH:mm:ss', new Date());
  if (isValid(parsed)) return parsed;
  // Try ISO format
  const iso = new Date(dateStr);
  if (isValid(iso)) return iso;
  return undefined;
}

/**
 * Formats categories array to string
 */
function categoriesToString(categories?: string | string[] | string[][]): string {
  if (!categories) return '';
  if (typeof categories === 'string') return categories;

  // Handle nested array like [['笔记', '前端']]
  const flat = categories.flatMap((c) => (Array.isArray(c) ? c : [c]));
  return flat.join(' > ');
}

/**
 * Parses categories string to array
 */
function stringToCategories(str: string): string[] | undefined {
  if (!str.trim()) return undefined;
  return str
    .split('>')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Formats tags array to string
 */
function tagsToString(tags?: string[]): string {
  if (!tags || tags.length === 0) return '';
  return tags.join(', ');
}

/**
 * Parses tags string to array
 */
function stringToTags(str: string): string[] | undefined {
  if (!str.trim()) return undefined;
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Converts form data back to BlogSchema format
 */
function formDataToFrontmatter(data: FrontmatterFormData): BlogSchema {
  const result: BlogSchema = {
    title: data.title,
    draft: data.draft,
    sticky: data.sticky,
    tocNumbering: data.tocNumbering,
    excludeFromSummary: data.excludeFromSummary,
    math: data.math,
    quiz: data.quiz,
  };

  // Parse dates
  if (data.date) {
    result.date = parseDate(data.date);
  }
  if (data.updated) {
    result.updated = parseDate(data.updated);
  }

  // Parse categories
  const categories = stringToCategories(data.categories || '');
  if (categories && categories.length > 0) {
    // Store as nested array for proper YAML format
    result.categories = [categories];
  }

  // Parse tags
  const tags = stringToTags(data.tags || '');
  if (tags) {
    result.tags = tags;
  }

  // Optional string fields
  if (data.description?.trim()) result.description = data.description.trim();
  if (data.cover?.trim()) result.cover = data.cover.trim();
  if (data.link?.trim()) result.link = data.link.trim();
  if (data.subtitle?.trim()) result.subtitle = data.subtitle.trim();

  return result;
}

/**
 * Input field component
 */
function FormField({
  label,
  id,
  type = 'text',
  placeholder,
  error,
  className,
  ...props
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  error?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn('space-y-1', className)}>
      <label htmlFor={id} className="font-medium text-muted-foreground text-xs">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className={cn(
          'w-full rounded border border-input bg-background px-2 py-1.5 text-sm',
          'focus:outline-none focus:ring-1 focus:ring-ring',
          error && 'border-destructive',
        )}
        {...props}
      />
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}

/**
 * Textarea field component
 */
function FormTextarea({
  label,
  id,
  placeholder,
  error,
  className,
  ...props
}: {
  label: string;
  id: string;
  placeholder?: string;
  error?: string;
  className?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={cn('space-y-1', className)}>
      <label htmlFor={id} className="font-medium text-muted-foreground text-xs">
        {label}
      </label>
      <textarea
        id={id}
        placeholder={placeholder}
        className={cn(
          'w-full resize-none rounded border border-input bg-background px-2 py-1.5 text-sm',
          'focus:outline-none focus:ring-1 focus:ring-ring',
          error && 'border-destructive',
        )}
        {...props}
      />
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}

/**
 * Checkbox field component
 */
function FormCheckbox({
  label,
  id,
  description,
  ...props
}: {
  label: string;
  id: string;
  description?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex items-start gap-2">
      <input id={id} type="checkbox" className="mt-0.5 size-4 rounded border-input" {...props} />
      <div>
        <label htmlFor={id} className="cursor-pointer text-sm">
          {label}
        </label>
        {description && <p className="text-muted-foreground text-xs">{description}</p>}
      </div>
    </div>
  );
}

export const FrontmatterEditor = forwardRef<FrontmatterEditorRef, FrontmatterEditorProps>(function FrontmatterEditor(
  { frontmatter, onChange, onCategoriesChange },
  ref,
) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const form = useForm<FrontmatterFormData>({
    resolver: zodResolver(frontmatterSchema),
    defaultValues: {
      title: frontmatter.title || '',
      date: formatDate(frontmatter.date),
      updated: formatDate(frontmatter.updated),
      description: frontmatter.description || '',
      categories: categoriesToString(frontmatter.categories),
      tags: tagsToString(frontmatter.tags),
      cover: frontmatter.cover || '',
      link: frontmatter.link || '',
      subtitle: frontmatter.subtitle || '',
      draft: frontmatter.draft ?? true,
      sticky: frontmatter.sticky ?? false,
      tocNumbering: frontmatter.tocNumbering ?? true,
      excludeFromSummary: frontmatter.excludeFromSummary ?? false,
      math: frontmatter.math ?? false,
      quiz: frontmatter.quiz ?? false,
    },
  });

  const {
    register,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = form;

  // Expose form methods via ref
  useImperativeHandle(ref, () => ({
    getFormData: () => form.getValues(),
    isDirty: () => isDirty,
  }));

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const result = await uploadImage(file);
      setValue('cover', result.url, { shouldDirty: true, shouldValidate: true });
      toast.success('封面图已上传');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '图片上传失败');
    } finally {
      setIsUploadingCover(false);
    }
  };
  // Watch for changes and notify parent
  useEffect(() => {
    const subscription = watch((values) => {
      const fm = formDataToFrontmatter(values as FrontmatterFormData);
      onChange(fm);

      // Notify about categories change for new category detection
      if (onCategoriesChange) {
        const cats = stringToCategories(values.categories || '');
        onCategoriesChange(cats || []);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange, onCategoriesChange]);

  return (
    <div className="space-y-4 p-4">
      <h3 className="font-semibold text-sm">文章属性</h3>

      {/* Basic Fields */}
      <div className="space-y-3">
        <FormField label="标题" id="title" placeholder="文章标题" error={errors.title?.message} {...register('title')} />

        <div className="grid grid-cols-2 gap-2">
          <FormField
            label="Date"
            id="date"
            placeholder="YYYY-MM-DD HH:mm:ss"
            error={errors.date?.message}
            {...register('date')}
          />
          <FormField
            label="更新时间"
            id="updated"
            placeholder="YYYY-MM-DD HH:mm:ss"
            error={errors.updated?.message}
            {...register('updated')}
          />
        </div>

        <FormTextarea
          label="摘要"
          id="description"
          placeholder="文章摘要，用于列表和 SEO..."
          rows={2}
          error={errors.description?.message}
          {...register('description')}
        />

        <FormField
          label="分类"
          id="categories"
          placeholder="笔记 > 前端 > React"
          error={errors.categories?.message}
          {...register('categories')}
        />

        <FormField label="标签" id="tags" placeholder="标签1, 标签2, 标签3" error={errors.tags?.message} {...register('tags')} />

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="cover" className="font-medium text-muted-foreground text-xs">
              封面图
            </label>
            <label className="inline-flex cursor-pointer items-center rounded border border-input bg-background px-2 py-1 text-xs transition-colors hover:bg-background/70">
              <Icon
                icon={isUploadingCover ? 'ri:loader-4-line' : 'ri:upload-2-line'}
                className={cn('mr-1 size-3.5', isUploadingCover && 'animate-spin')}
              />
              {isUploadingCover ? '上传中' : '上传'}
              <input type="file" accept="image/*" className="hidden" disabled={isUploadingCover} onChange={handleCoverUpload} />
            </label>
          </div>
          <input
            id="cover"
            placeholder="/img/cms/cover.webp 或 https://example.com/image.jpg"
            className={cn(
              'w-full rounded border border-input bg-background px-2 py-1.5 text-sm',
              'focus:outline-none focus:ring-1 focus:ring-ring',
              errors.cover && 'border-destructive',
            )}
            {...register('cover')}
          />
          {errors.cover?.message && <p className="text-destructive text-xs">{errors.cover.message}</p>}
        </div>

        <FormField
          label="外部链接"
          id="link"
          placeholder="https://example.com"
          error={errors.link?.message}
          {...register('link')}
        />
      </div>

      {/* 高级选项 Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm transition-colors hover:bg-muted/50"
      >
        <span className="font-medium">高级选项</span>
        <Icon icon={showAdvanced ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'} className="size-5 text-muted-foreground" />
      </button>

      {/* Advanced Fields */}
      {showAdvanced && (
        <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
          <FormField
            label="副标题"
            id="subtitle"
            placeholder="文章副标题"
            error={errors.subtitle?.message}
            {...register('subtitle')}
          />

          <div className="space-y-2">
            <FormCheckbox label="草稿" id="draft" description="开启后不会在前台公开显示" {...register('draft')} />

            <FormCheckbox label="置顶" id="sticky" description="在文章列表中置顶显示" {...register('sticky')} />

            <FormCheckbox
              label="目录编号"
              id="tocNumbering"
              description="给标题目录自动编号"
              {...register('tocNumbering')}
            />

            <FormCheckbox
              label="不生成 AI 摘要"
              id="excludeFromSummary"
              description="跳过摘要生成"
              {...register('excludeFromSummary')}
            />

            <FormCheckbox label="数学公式（KaTeX）" id="math" description="启用数学公式渲染" {...register('math')} />

            <FormCheckbox label="测验模式" id="quiz" description="启用测验交互" {...register('quiz')} />
          </div>
        </div>
      )}
    </div>
  );
});
