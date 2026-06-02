import { Icon } from '@iconify/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { deleteMediaImage, listMediaImages, uploadImage } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { MediaImage } from '@/types';

function formatSize(size: number): string {
  if (!size) return '未知大小';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function isPreviewable(image: MediaImage): boolean {
  return ['avif', 'gif', 'jpg', 'jpeg', 'png', 'svg', 'webp'].includes(image.extension);
}

export function MediaLibrary() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<MediaImage[]>([]);
  const [directory, setDirectory] = useState('public/img/cms');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredImages = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return images;
    return images.filter((image) => `${image.name} ${image.path} ${image.extension}`.toLowerCase().includes(keyword));
  }, [images, search]);

  const loadImages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listMediaImages();
      setImages(result.images);
      setDirectory(result.directory);
    } catch (err) {
      const message = err instanceof Error ? err.message : '媒体库读取失败';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const copyText = async (text: string, message: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const handleUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await uploadImage(file);
      toast.success(`图片已上传：${result.url}`);
      await loadImages();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '图片上传失败');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (image: MediaImage) => {
    const confirmed = window.confirm(`确定删除这张图片吗？\n${image.path}\n\n如果文章正在使用它，前台图片会失效。`);
    if (!confirmed) return;
    setDeletingPath(image.path);
    try {
      await deleteMediaImage(image.path, image.sha);
      toast.success('图片已删除，等待 Cloudflare Pages 重新部署后生效');
      await loadImages();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '图片删除失败');
    } finally {
      setDeletingPath(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg shadow-black/5">
        <div className="border-border border-b bg-gradient-to-r from-sky-500/15 via-card to-card p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-sky-300 text-xs">
                <Icon icon="ri:image-2-line" className="size-4" />
                媒体库
              </div>
              <h2 className="font-bold text-2xl">统一管理文章图片</h2>
              <p className="max-w-2xl text-muted-foreground text-sm leading-6">
                上传后的图片会写入 GitHub 仓库的 <span className="font-mono text-foreground">{directory}</span>，文章里直接使用 <span className="font-mono text-foreground">/img/cms/...</span> 链接即可。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => handleUpload(event.target.files)}
              />
              <Button variant="outline" size="sm" onClick={loadImages} disabled={isLoading || isUploading}>
                <Icon icon={isLoading ? 'ri:loader-4-line' : 'ri:refresh-line'} className={cn('mr-1.5 size-4', isLoading && 'animate-spin')} />
                刷新
              </Button>
              <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                <Icon icon={isUploading ? 'ri:loader-4-line' : 'ri:upload-cloud-2-line'} className={cn('mr-1.5 size-4', isUploading && 'animate-spin')} />
                上传图片
              </Button>
            </div>
          </div>
        </div>

        <div className="p-5 lg:p-6">
          <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Icon icon="ri:search-line" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜索文件名、路径或格式..."
                className="w-full rounded-2xl border border-input bg-background/80 py-3 pr-3 pl-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex items-center rounded-2xl border border-border bg-muted/20 px-4 text-muted-foreground text-sm">
              共 {images.length} 张，当前显示 {filteredImages.length} 张
            </div>
          </div>

          {error && <div className="mb-5 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-destructive text-sm">{error}</div>}

          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center text-muted-foreground">
              <Icon icon="ri:loader-4-line" className="mr-2 size-5 animate-spin" />
              正在读取媒体库...
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-border border-dashed text-center text-muted-foreground">
              <Icon icon="ri:image-add-line" className="size-10" />
              <p className="mt-3 font-medium">还没有图片</p>
              <p className="mt-1 text-sm">点击右上角“上传图片”开始使用媒体库。</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredImages.map((image) => (
                <article key={image.path} className="group overflow-hidden rounded-2xl border border-border bg-background/60">
                  <div className="relative aspect-[4/3] bg-muted/40">
                    {isPreviewable(image) ? (
                      <img src={image.rawUrl} alt={image.name} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Icon icon="ri:file-image-line" className="size-10" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 rounded-full bg-black/55 px-2 py-1 font-medium text-white text-xs uppercase backdrop-blur">
                      {image.extension || 'image'}
                    </span>
                  </div>
                  <div className="space-y-3 p-4">
                    <div>
                      <h3 className="line-clamp-1 font-medium text-sm" title={image.name}>{image.name}</h3>
                      <p className="mt-1 line-clamp-1 font-mono text-muted-foreground text-xs" title={image.url}>{image.url}</p>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground text-xs">
                      <span>{formatSize(image.size)}</span>
                      <span>{image.sha.slice(0, 7)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyText(image.url, '站内图片链接已复制')}>
                        复制
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => window.open(image.rawUrl, '_blank', 'noopener,noreferrer')}>
                        查看
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(image)} disabled={deletingPath === image.path}>
                        {deletingPath === image.path ? <Icon icon="ri:loader-4-line" className="size-4 animate-spin" /> : '删除'}
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}