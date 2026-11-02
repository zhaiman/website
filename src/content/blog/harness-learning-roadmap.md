---
title: "Harness 学习路线图"
description: "掌握 Agent Harness 需要哪些知识？分层学习路径与官方教程清单：术语、架构、工具管线、能力接缝与插件实战。｜ 大模型实验室"
pubDate: "2026-09-11"
tags: ["AI", "Agent", "Harness"]
---

读完上一篇[《什么是 Agent Harness》](/blog/what-is-agent-harness/)，最常被问到的问题是：想真正掌握它，该从哪里下手？这篇文章给出一条分层学习路线。路线基于 DeepSeek Harness 的源码仓库与官方文档整理——它的 `docs/` 目录自带一套中英双语体系，本身就是最好的教程。

## 一、知识分四层

### 第 1 层：Agent 基础概念（先懂原理）

这一层不需要读任何源码，目标是理解三件事：

- **LLM 交互机制**：token 与上下文窗口、function calling 的 JSON Schema 约定；
- **agent loop**：模型思考 → 请求工具 → harness 执行 → 结果回传 → 再思考的循环；
- **职责边界**：模型只产出"决策文本"，文件读写、命令执行、网络访问全部由 harness 代劳，沙箱与审批是安全层。

背景资料可参考 Anthropic 的《Building Effective Agents》和 OpenAI 的 function calling / Agents SDK 文档，用来对照理解各家 harness 的共性设计。

### 第 2 层：工程基础（读懂 monorepo）

DeepSeek Harness 是一个 TypeScript monorepo，顶层结构大致如下：

```text
apps/        # cli、web UI 等应用入口
packages/    # 核心包
native/      # 原生沙箱模块
docs/        # 双语文档体系（本路线的主战场）
```

需要的基本功：JavaScript / TypeScript（ESM、async）、Node.js（`child_process`、流处理）、pnpm workspace 多包结构，以及 Web 界面部分的 Vite 构建链路。

### 第 3 层：核心机制（重点，按顺序读 docs/）

| 顺序 | 文档 | 内容 |
| --- | --- | --- |
| 1 | `glossary` | 术语表——先统一词汇 |
| 2 | `architecture` + `module-graph` / `graph-atlas` | 整体架构与模块关系图 |
| 3 | `agent-lifecycle` | Agent 生命周期：会话、恢复、fork |
| 4 | `tool-catalog` | 内置工具全集 |
| 5 | `tool-execution-pipeline` | **工具执行管线**：沙箱档位 → 审批策略 → 并行调用，安全设计的核心 |
| 6 | `capability-seams` | "能力接缝"——理解 everything-is-a-plugin 的关键 |
| 7 | `event-producer-consumer`、`persistence-catalog`、`session-format-status` | 会话事件流与持久化格式（跨版本兼容机制） |
| 8 | `defensive-patterns` | 防御性模式：提示词注入、数据/指令分离 |
| 9 | `cordis-primer` | 底层 Cordis 框架入门，配套论文见下文 |

此外，`docs/subsystems/` 下还有约六十篇子系统专文（approval、sandbox、subagent、workflow、goal、compaction……），不必通读，用到哪个系统再翻哪一篇。

### 第 4 层：动手与进阶

- **跑起来**：`npx @deepseek-ai/dsh web`；源码方式 `pnpm install && pnpm run build && dsh web`（细节见 `development`、测试体系见 `testing`）；
- **写插件**：`docs/cordis-tutorial/` 是七章编号教程，从 `01-first-plugin` 一路到 `07-into-the-harness`；
- **扩展 cookbook**：`adding-a-tool`、`adding-an-llm-adapter`、`adding-a-settings-card` 等"加一个 XX"系列，照着做即可；
- **读变更史**：仓库 `.agents/notes/implemented/feature/` 下每个功能都有带日期的实现设计笔记（sandbox、approval-seam、dynamic-workflows……），等于官方逐篇讲解内部机制。

## 二、参考教程与资料清单

1. **官方文档站**：[deepseek-harness.github.io/deepseek-harness](https://deepseek-harness.github.io/deepseek-harness/)（用户向指南）；
2. **GitHub 仓库**：[deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)——README.zh、`docs/`、`CONTRIBUTING.md`，以及运行前必读的 `SAFETY.md`；
3. **Cordis 论文**：[_A Programming Paradigm for Spatiotemporal Composability_](https://arxiv.org/abs/2608.25512) + [cordiverse/cordis](https://github.com/cordiverse/cordis)，架构范式的理论源头；
4. **社区**：[GitHub Discussions](https://github.com/deepseek-ai/deepseek-harness/discussions) 与 [Discord](https://discord.gg/Ycq5dCaS4)。

## 三、"掌握"的三级目标

| 级别 | 标志 |
| --- | --- |
| 用户级 | 会用 Web UI，会写 AGENTS.md / skill，懂沙箱档位含义，能安全地让 agent 干活 |
| 开发者级 | 读得懂 `capability-seams`，能写出自己的插件包（带 `dsh-plugin` topic） |
| 贡献者级 | 跟得动 `.agents/notes/implemented/` 的设计笔记，能给仓库提 PR |

大多数人只需要到用户级；想扩展 harness 就补开发者级；想参与源码再上贡献者级。

## 常见问题

### Q：完整走一遍要多久？

A：按每天一小时估算，第 1、2 层一周内可完成；第 3 层的九篇核心文档约需两周精读；第 4 层随项目推进持续进行。不必追求一次读完，subsystems 目录就是为"按需查阅"设计的。

### Q：英文源码读不动怎么办？

A：优先用 `.zh.md` 版本——整个 docs 体系都是中英双份的。术语表（glossary）先过一遍，代码里的命名基本都能对上。

### Q：只想使用、不改源码，需要学 Cordis 吗？

A：不需要。Cordis 是底层框架层，用户级完全绕开它也能正常工作；只有写插件或读 `capability-seams` 时才必须补上这一课（cordis-tutorial 七章就是为此准备的）。

### Q：如何判断自己"掌握"了？

A：一个实用标准——能否独立回答三个问题：一次工具调用从模型输出到落盘经过了哪些环节？审批被拒绝后 agent 会怎样？一个新插件挂在哪个接缝上、何时加载。能讲清楚这三件事，第 3 层就算过关。

## 写在最后

学习 harness 的正确姿势不是通读源码，而是**沿着"术语 → 架构 → 工具管线 → 能力接缝"的顺序精读官方文档，再用 cordis-tutorial 和 cookbook 把每层知识落到一次动手上**。

路线图已经画好，剩下的就是每天一小时。下一篇，我们打算从 `01-first-plugin` 开始，跟着官方教程写出第一个 DSH 插件。
