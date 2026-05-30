# AGENTS.md

## 项目概览

云平台开发前期准备助手 (lyaidol-prep-assistant) — 面向开发者的智能文档分析与准备工作台，帮助开发团队在启动 Lyaidol B端云平台开发前系统性地理解文档、提取重点、规划任务、答疑解惑。

## 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **SDK**: coze-coding-dev-sdk (LLM/Fetch/TTS/ASR/S3)

## 目录结构

```
├── src/
│   ├── app/
│   │   ├── api/                    # 21个API路由
│   │   │   ├── fetch-url/          # 文档抓取/粘贴
│   │   │   ├── summarize/          # SSE智能摘要
│   │   │   ├── checklist/          # SSE任务清单
│   │   │   ├── chat/               # SSE多轮问答
│   │   │   ├── tts/                # 文字转语音
│   │   │   ├── asr/                # 语音转文字
│   │   │   ├── voice/list/         # 音色列表
│   │   │   ├── voice/add/          # 添加自定义音色
│   │   │   ├── voice/preview/      # 试听音色
│   │   │   ├── document/save/      # 保存文档
│   │   │   ├── document/list/      # 文档列表
│   │   │   ├── document/[id]/      # 文档详情
│   │   │   ├── settings/           # 用户配置GET/POST
│   │   │   ├── analyze-modules/    # SSE模块矩阵分析
│   │   │   ├── analyze-idol/       # SSE idol专项分析
│   │   │   └── analyze-apis/       # SSE API追踪分析
│   │   ├── globals.css             # 全局样式(深色主题)
│   │   ├── layout.tsx              # 根布局
│   │   └── page.tsx                # 主页面(9视图)
│   ├── components/ui/              # shadcn/ui组件库
│   ├── hooks/
│   │   └── use-sse-stream.ts       # SSE流式读取Hook
│   └── lib/
│       ├── api.ts                  # API客户端封装
│       ├── storage.ts              # S3存储封装(索引管理)
│       ├── types.ts                # 类型定义
│       └── utils.ts                # 工具函数
├── SPEC.md                         # 完整规格文档
├── DESIGN.md                       # 设计规范
└── package.json
```

## 包管理规范

**仅允许使用 pnpm**，严禁 npm 或 yarn。

## 开发规范

### 编码规范

- TypeScript strict模式，禁止隐式 any 和 as any
- 函数参数、返回值、事件对象必须有明确类型
- JSX字符串中禁止使用ASCII双引号作为中文引号，改用「」或{'xxx'}表达式
- 清理未使用的变量和导入

### SSE流式接口规范

- 后端: ReadableStream + `text/event-stream` Content-Type
- 前端: fetch + body.getReader() 逐块读取
- useSSEStream Hook封装了完整的流式读取逻辑

### S3存储索引规范

- 文档保存时同时写入索引文件 (`documents/index_<hash>.json`)
- listDocuments/getDocument 通过索引查找，而非listFiles遍历
- 索引格式: `{ documents: [{ id, title, source, storageKey, createdAt }] }`

### Next.js配置

- 路径使用 path.resolve/__dirname 动态拼接
- 禁止在JSX中使用 typeof window / Date.now() / Math.random()
- 使用 'use client' + useEffect + useState 确保客户端渲染

## 构建与测试命令

- 安装依赖: `pnpm install`
- 类型检查: `pnpm ts-check`
- Lint: `pnpm lint`
- 构建: `pnpm build`
- 开发: `coze dev` (端口5000)
