/**
 * Site Config Editor
 *
 * Raw YAML editor for config/site.yaml in the GitHub-backed online CMS.
 */

import { Icon } from '@iconify/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { readSiteConfig, writeSiteConfig } from '@/lib/api';

export function SiteConfigEditor() {
  const [content, setContent] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = content !== savedContent;

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await readSiteConfig();
      setContent(next);
      setSavedContent(next);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load site config';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await writeSiteConfig(content);
      setSavedContent(content);
      toast.success('Site config saved');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save site config';
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-lg">Site Configuration</h2>
            <p className="text-muted-foreground text-sm">Edit config/site.yaml directly. Save will commit the change to GitHub.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadConfig} disabled={isLoading || isSaving}>
              <Icon icon={isLoading ? 'ri:loader-4-line' : 'ri:refresh-line'} className={isLoading ? 'mr-1.5 size-4 animate-spin' : 'mr-1.5 size-4'} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => setContent(savedContent)} disabled={!isDirty || isSaving}>
              Reset
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!isDirty || isLoading || isSaving}>
              <Icon icon={isSaving ? 'ri:loader-4-line' : 'ri:save-3-line'} className={isSaving ? 'mr-1.5 size-4 animate-spin' : 'mr-1.5 size-4'} />
              Save Config
            </Button>
          </div>
        </div>
        {error && <p className="mt-3 text-destructive text-sm">{error}</p>}
      </div>

      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        disabled={isLoading}
        spellCheck={false}
        className="min-h-[560px] w-full resize-y rounded-xl border border-border bg-background p-4 font-mono text-sm leading-6 outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
        placeholder={isLoading ? 'Loading config/site.yaml...' : 'config/site.yaml'}
      />

      <p className="text-muted-foreground text-xs">
        Server will validate the YAML before saving. After saving, GitHub and Cloudflare Pages need to rebuild before the public site changes.
      </p>
    </div>
  );
}
