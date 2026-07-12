import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import type { BlogSchema } from '@/types';

export type MarkdownSnippet = {
  id: string;
  label: string;
  description: string;
  icon: string;
  template: string;
  frontmatterPatch?: Partial<BlogSchema>;
};

type SnippetGroup = {
  title: string;
  snippets: MarkdownSnippet[];
};

const SNIPPET_GROUPS: SnippetGroup[] = [
  {
    title: 'Shoka 容器',
    snippets: [
      {
        id: 'note-info',
        label: '提醒块',
        description: '插入 :::info 提醒块',
        icon: 'ri:information-line',
        template: `:::info
这里写提示内容，支持 **Markdown**。
:::`,
      },
      {
        id: 'collapse-primary',
        label: '折叠块',
        description: '插入可展开内容块',
        icon: 'ri:collapse-diagonal-line',
        template: `+++primary 点击展开详细内容
这里写折叠内容。

- 支持列表
- 支持 **Markdown**
+++`,
      },
      {
        id: 'tabs',
        label: '标签卡',
        description: '插入多语言/多方案标签页',
        icon: 'ri:tabs-line',
        template: `;;;demo JavaScript
\`\`\`js
console.log('Hello, World!');
\`\`\`
;;;

;;;demo Python
\`\`\`python
print('Hello, World!')
\`\`\`
;;;`,
      },
      {
        id: 'links',
        label: '友链卡',
        description: '插入文章内友链网格',
        icon: 'ri:links-line',
        template: `{% links %}
- site: 示例博客
  url: https://example.com
  owner: Alice
  desc: 一个热爱技术的博客
  image: https://api.dicebear.com/7.x/avataaars/svg?seed=Alice
  color: '#BEDCFF'
{% endlinks %}`,
      },
    ],
  },
  {
    title: '图表与媒体',
    snippets: [
      {
        id: 'mermaid',
        label: 'Mermaid',
        description: '插入流程图代码块',
        icon: 'ri:flow-chart',
        template: `\`\`\`mermaid
flowchart TD
  A[开始] --> B{判断}
  B -->|是| C[执行方案]
  B -->|否| D[调整输入]
\`\`\``,
      },
      {
        id: 'infographic',
        label: '信息图',
        description: '插入 infographic 模板',
        icon: 'ri:bar-chart-box-line',
        template: `\`\`\`infographic
infographic list-grid-badge-card
title: 示例信息图
items:
  - title: 第一步
    description: 说明关键动作
    badge: 01
  - title: 第二步
    description: 说明输出结果
    badge: 02
\`\`\``,
      },
      {
        id: 'media-audio',
        label: '音频',
        description: '插入音频/歌单播放器',
        icon: 'ri:music-2-line',
        template: `{% media audio %}
- title: 示例歌单
  list:
    - https://music.163.com/#/playlist?id=8676645748
{% endmedia %}`,
      },
      {
        id: 'media-video',
        label: '视频',
        description: '插入视频播放器',
        icon: 'ri:video-line',
        template: `{% media video %}
- name: 示例视频
  url: https://example.com/video.mp4
{% endmedia %}`,
      },
    ],
  },
  {
    title: '互动与加密',
    snippets: [
      {
        id: 'encrypted-block',
        label: '加密块',
        description: '插入构建期加密内容块',
        icon: 'ri:lock-password-line',
        template: `:::encrypted{password="demo"}
这里写需要加密的内容，支持完整 Markdown。

\`\`\`js
console.log('encrypted content');
\`\`\`
:::`,
      },
      {
        id: 'quiz-single',
        label: '单选题',
        description: '插入交互式单选题，并开启 quiz',
        icon: 'ri:question-answer-line',
        frontmatterPatch: { quiz: true },
        template: `- 下列哪个是 JavaScript 的基本数据类型？{.quiz}
  - Object{.options}
  - Array{.options}
  - Symbol{.correct}
  - Function{.options}

> 解析：Symbol 是 ES6 引入的基本数据类型。`,
      },
      {
        id: 'quiz-multi',
        label: '多选题',
        description: '插入交互式多选题，并开启 quiz',
        icon: 'ri:list-check-3',
        frontmatterPatch: { quiz: true },
        template: `- 以下哪些是 CSS 布局方式？{.quiz .multi}
  - Flexbox{.correct}
  - jQuery{.options}
  - Grid{.correct}
  - Float{.correct}

> 解析：Flexbox、Grid 和 Float 都是 CSS 布局方式。`,
      },
      {
        id: 'quiz-fill',
        label: '填空题',
        description: '插入填空题，并开启 quiz',
        icon: 'ri:input-field',
        frontmatterPatch: { quiz: true },
        template: `- CSS 中，[Flexbox]{.gap} 适合一维布局，[Grid]{.gap} 适合二维布局。{.quiz .fill}

> 解析：Flexbox 是一维布局，Grid 是二维布局。常见错误答案是 [Float]{.mistake}。`,
      },
    ],
  },
  {
    title: '行内效果',
    snippets: [
      {
        id: 'inline-effects',
        label: '文字特效',
        description: '插入下划线、高亮、剧透、标签',
        icon: 'ri:font-size-2',
        template: `++下划线++{.primary} ==高亮文字== !!剧透内容!! [标签]{.label .success}`,
      },
      {
        id: 'ruby',
        label: '注音',
        description: '插入 ruby 注音语法',
        icon: 'ri:translate',
        template: `{漢字^かんじ}`,
      },
      {
        id: 'math',
        label: '数学公式',
        description: '插入 KaTeX 公式，并开启 math',
        icon: 'ri:function-line',
        frontmatterPatch: { math: true },
        template: `行内公式：$E = mc^2$

块级公式：

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$`,
      },
      {
        id: 'code-meta',
        label: '代码增强',
        description: '插入带标题和高亮行的代码块',
        icon: 'ri:code-box-line',
        template: `\`\`\`ts title="example.ts" mark:2
const message = 'Hello';
console.log(message);
\`\`\``,
      },
    ],
  },
];

export function MarkdownSnippetPanel({ onInsert }: { onInsert: (snippet: MarkdownSnippet) => void }) {
  return (
    <section className="rounded-xl border border-border bg-card/70 p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-semibold text-sm">
            <Icon icon="ri:magic-line" className="size-4 text-primary" />
            前台增强语法
          </h2>
          <p className="mt-1 text-muted-foreground text-xs leading-5">
            一键插入前台支持的 Shoka、图表、媒体、测验和加密模板，避免手写语法出错。
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-1 text-primary text-xs">源码模式专用</span>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {SNIPPET_GROUPS.map((group) => (
          <div key={group.title} className="space-y-2">
            <h3 className="text-muted-foreground text-xs">{group.title}</h3>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {group.snippets.map((snippet) => (
                <Button
                  key={snippet.id}
                  type="button"
                  variant="outline"
                  className="h-auto justify-start gap-2 rounded-xl px-3 py-2 text-left"
                  title={snippet.description}
                  onClick={() => onInsert(snippet)}
                >
                  <Icon icon={snippet.icon} className="size-4 shrink-0 text-primary" />
                  <span className="min-w-0">
                    <span className="block font-medium text-sm">{snippet.label}</span>
                    <span className="line-clamp-1 text-muted-foreground text-xs">{snippet.description}</span>
                  </span>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
