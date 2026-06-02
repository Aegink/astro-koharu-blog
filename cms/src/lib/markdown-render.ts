/**
 * Markdown Rendering Utility
 *
 * Converts markdown to HTML with Shiki syntax highlighting.
 */

import { Marked, type MarkedExtension } from 'marked';
import { type BundledLanguage, type BundledTheme, codeToHtml, getSingletonHighlighter } from 'shiki';
import { createLinkEmbedExtension } from './marked-link-embed';

// Cache for shiki highlighter
let highlighterPromise: ReturnType<typeof getSingletonHighlighter> | null = null;

/**
 * Get or create the Shiki highlighter singleton
 */
async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = getSingletonHighlighter({
      themes: ['github-dark'],
      langs: [
        'javascript',
        'typescript',
        'html',
        'css',
        'json',
        'markdown',
        'bash',
        'yaml',
        'tsx',
        'jsx',
        'python',
        'go',
        'rust',
        'sql',
        'mermaid',
        'text',
      ],
    });
  }
  return highlighterPromise;
}

/**
 * Highlight code using Shiki
 */
async function highlightCode(code: string, lang: string): Promise<string> {
  try {
    const highlighter = await getHighlighter();
    const loadedLangs = highlighter.getLoadedLanguages();

    // Use 'text' if language not supported
    const language = loadedLangs.includes(lang as BundledLanguage) ? lang : 'text';

    const html = await codeToHtml(code, {
      lang: language as BundledLanguage,
      theme: 'github-dark' as BundledTheme,
    });

    return html;
  } catch {
    // Fallback to plain pre/code
    return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`;
  }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const CSS_IDENT = /^[a-zA-Z_-][a-zA-Z0-9_-]*$/;

function extractShokaClasses(rawAttrs?: string): string[] {
  if (!rawAttrs) return [];

  return rawAttrs
    .slice(1, -1)
    .split(/\s+/)
    .filter((token) => token.startsWith('.'))
    .map((token) => token.slice(1))
    .filter((className) => CSS_IDENT.test(className));
}

function classAttribute(classes: string[]): string {
  if (classes.length === 0) return '';
  return ` class="${classes.map(escapeHtml).join(' ')}"`;
}

function processOutsideProtectedRegions(text: string, transform: (segment: string) => string): string {
  const protectedRegex = /(^`{3,}.*\n[\s\S]*?^`{3,}\s*$|^~{3,}.*\n[\s\S]*?^~{3,}\s*$|`[^`\n]+`|\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/gm;
  let lastIndex = 0;
  const parts: string[] = [];

  for (let match = protectedRegex.exec(text); match !== null; match = protectedRegex.exec(text)) {
    if (match.index > lastIndex) {
      parts.push(transform(text.slice(lastIndex, match.index)));
    }
    parts.push(match[0]);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(transform(text.slice(lastIndex)));
  }

  return parts.length > 0 ? parts.join('') : transform(text);
}

function preprocessCmsShokaSyntax(content: string): string {
  return processOutsideProtectedRegions(content, (segment) => {
    let result = segment;

    result = result.replace(/\{([^{}^.][^{}^]*)\^([^{}]+)\}/g, (_, baseText: string, annotation: string) => {
      if (annotation === '*') {
        return `<span class="text-emphasis-dot">${escapeHtml(baseText)}</span>`;
      }

      const rubyText = annotation.startsWith('=') ? annotation.slice(1) : annotation;
      return `<ruby>${escapeHtml(baseText)}<rp>(</rp><rt>${escapeHtml(rubyText)}</rt><rp>)</rp></ruby>`;
    });

    result = result.replace(/\+\+([^+\n]+?)\+\+(\{[^}\n]+\})?/g, (_, inner: string, attrs?: string) => {
      return `<ins${classAttribute(extractShokaClasses(attrs))}>${escapeHtml(inner)}</ins>`;
    });

    result = result.replace(/==([^=\n]+?)==(\{[^}\n]+\})?/g, (_, inner: string, attrs?: string) => {
      return `<mark${classAttribute(extractShokaClasses(attrs))}>${escapeHtml(inner)}</mark>`;
    });

    result = result.replace(/!!([^!\n]+?)!!(\{[^}\n]+\})?/g, (_, inner: string, attrs?: string) => {
      const classes = ['spoiler', ...extractShokaClasses(attrs)];
      return `<span${classAttribute(classes)}>${escapeHtml(inner)}</span>`;
    });

    result = result.replace(/(?<![~\\])~([^~\s]+)~(?!~)/g, (_, inner: string) => `<sub>${escapeHtml(inner)}</sub>`);
    result = result.replace(/(?<![\\^])\^([^^\s]+)\^/g, (_, inner: string) => `<sup>${escapeHtml(inner)}</sup>`);

    return result;
  });
}
/**
 * Create Shiki extension for marked
 */
function createShikiExtension(): MarkedExtension {
  return {
    async: true,
    async walkTokens(token) {
      if (token.type === 'code') {
        const lang = token.lang || 'text';
        const code = token.text;

        // Store the highlighted HTML in a custom property
        const html = await highlightCode(code, lang);
        (token as unknown as { highlighted: string }).highlighted = html;
      }
    },
    renderer: {
      code({ text, lang, escaped }) {
        // Use the pre-computed highlighted HTML if available
        const token = this as unknown as { highlighted?: string };
        if (token.highlighted) {
          const language = lang || 'text';
          return `<div class="code-block-wrapper" data-language="${escapeHtml(language)}">${token.highlighted}</div>`;
        }

        // Fallback
        const language = lang || 'text';
        const escapedCode = escaped ? text : escapeHtml(text);
        return `<div class="code-block-wrapper" data-language="${escapeHtml(language)}"><pre class="shiki"><code>${escapedCode}</code></pre></div>`;
      },
    },
  };
}

/**
 * Create marked instance with Shiki extension
 */
function createMarkedInstance(): Marked {
  const marked = new Marked();
  marked.use(createShikiExtension());
  marked.use(createLinkEmbedExtension());
  marked.use({
    gfm: true,
    breaks: false,
  });
  return marked;
}

// Singleton marked instance
let markedInstance: Marked | null = null;

/**
 * Get or create the marked instance
 */
function getMarked(): Marked {
  if (!markedInstance) {
    markedInstance = createMarkedInstance();
  }
  return markedInstance;
}

/**
 * Render markdown to HTML with syntax highlighting
 */
export async function renderMarkdown(content: string): Promise<string> {
  const marked = getMarked();
  const html = await marked.parse(preprocessCmsShokaSyntax(content));
  return html;
}
