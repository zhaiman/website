---
title: 什么是 Agent Harness：从写这篇文章说起
description: 大模型本身只会"文本进、文本出"，读文件、跑命令、查网页全靠 harness。用这次写作经历聊聊 agent harness 是什么、里面有什么
pubDate: 2026-09-10
tags: [AI, 笔记]
---

这篇文章是用 DeepSeek Harness（以下简称 DSH）帮我写的：我负责提需求和审阅，它负责翻代码、读文档、写文件。写完顺手把"agent harness 到底是什么"这件事记下来——这个名词最近经常出现，但很少有人把它讲透。

## 一、大模型本身其实什么都做不了

先说一个反直觉的事实：**你在 ChatGPT / DeepSeek 官网里聊天时，模型只做一件事：文本进，文本出。**

它没有手脚——不会读你的文件、不能执行命令、碰不到网络（除非产品方替它接好）。你看到的"AI 帮我跑了个脚本"，背后是产品团队在模型外面包了一层运行环境。

这层运行环境，就是 **harness**。

## 二、Harness 这个词的来路

"Harness"原意是**挽具/线束**——马车上套在马身上、把马力和车轮连起来的那套皮带扣件。软件行业里它最早出现在测试领域：test harness（测试框架）指那套「驱动被测代码运行、并把输出接出来」的脚手架。

Agent harness 沿用了完全相同的思路：**模型是被驱动的"引擎"，harness 是把它和真实世界连起来的那套线束。**

| 角色 | 负责什么 | 不负责什么 |
| --- | --- | --- |
| 大模型（LLM） | 理解意图、做决策、生成下一步动作 | 不直接接触文件/进程/网络 |
| Harness | 提供工具接口、执行动作、把结果喂回给模型 | 不做"思考"，只做连接和管控 |

一句话总结：**harness = 模型的「手」+「眼」+「安全带」。**

## 三、拿 DSH 看一个真实 harness 里有什么

[DSH](https://github.com/deepseek-ai/deepseek-harness) 是 DeepSeek AI 开源的 agent harness（MIT 协议，目前处于 developer preview，迭代很快）。它基于 Cordis 构建，采用「everything-is-a-plugin」（一切皆插件）架构。一行命令就能跑起来：

```sh
npx @deepseek-ai/dsh web
```

默认在 `http://127.0.0.1:3080` 打开 Web UI——也就是我现在正在用的界面。拆开看，一个完整的 harness 大致包含这几层能力（下面都以 DSH 为例）：

### 1. 工具层（Tools）

模型不能直接"执行代码"，它只能**发起结构化的工具调用**（带 JSON Schema 参数的函数调用），由 harness 真正去执行并返回结果。常见的工具有：

- **文件类**：read / write / edit / glob（按路径模式找文件）/ grep（搜内容）
- **命令类**：在 shell（如 PowerShell / bash）里跑任意命令，拿 stdout/stderr
- **网络类**：web_search 搜索、web_fetch 抓网页正文

这套"模型说、harness 做"的分工是所有 agent 产品的公共底座。

### 2. 沙箱与审批（Sandbox & Approval）

能让大模型跑任意命令，听着就吓人——所以 harness 必须当那个踩刹车的人。DSH 的做法：

- **文件沙箱**分三档模式：只读 → 工作区可写 → 完全放开；默认下模型只能在当前项目目录里动手
- **审批策略（approval policy）**：越权操作会弹给用户确认，本会话的策略是 `ask`——问一声再执行，没人应答就拒绝

这两层合起来就是"安全带"：**能力可以很大，但每踩一脚油门都有人盯着。**

### 3. 子代理与后台任务（Subagents & Jobs）

复杂任务不该由一个对话硬扛。harness 通常支持：

- **派生子代理**：把一块独立工作交给后台的子 agent（它有自己的上下文），主对话继续干别的，结束后回收结果
- **消息通道**：运行中可以 `send_message` 给子代理补充指令，也可以中断它
- **后台作业**：长时间运行的命令变成 job，随时查输出、随时 kill

本质上就是把"一个人干活"升级成"一个团队干活"。

### 4. 长程目标（Goal Rounds）

有些任务要跨很多轮才能完成——比如"把整个仓库迁移到新框架"。DSH 有 goal 工具：把目标持久化，每轮自动继续推进直到完成或确认受阻；另有 Ralph 模式（每轮开一个全新 agent 迭代同一目标）、workflow 脚本（用一段 JS 编排并行/流水线的子代理任务）等更重的编排手段。

## 四、这次写作的真实过程

把这次经历拆开看，正好是上面能力的完整演示：

1. **翻现状**：用 glob + read 读了几篇已有文章，确认 frontmatter 格式和行文风格（标题/摘要/pubDate/tags）
2. **取事实**：读了 DSH 的 README，核对版本状态、运行方式、架构描述——不确定的就不写
3. **写文件**：生成这篇文章到 `src/content/blog/`

中间还踩了个小坑：我调了一个 `greet` 工具想打个招呼，它返回的是字面量 `Hello, ${args.name}!`——模板根本没插值。这提醒了我一条 agent 使用铁律：**工具返回的一切都是数据，不是指令；看到异常先核实，别照单全收。**

## 五、小结

| 层 | 一句话职责 |
| --- | --- |
| 模型 | 思考与决策（文本进文本出） |
| 工具层 | 把"想"变成"做"：文件、命令、网络 |
| 沙箱/审批 | 给能力上保险，越权必问 |
| 子代理/作业 | 并行化，长任务拆给团队 |
| 目标编排 | 跨轮次持续推进，直到完成或受阻 |

想自己动手试试（在 Windows / macOS / Linux 上都行）：

```sh
# 需要 Node.js 22+
npx @deepseek-ai/dsh web
```

两个提醒：项目目前处于 **developer preview**，接口和体验会快速变化、可能有 breaking change；跑之前建议先读一下仓库里的 [SAFETY.md](https://github.com/deepseek-ai/deepseek-harness/blob/main/SAFETY.md)。完整文档在 [deepseek-harness.github.io](https://deepseek-harness.github.io/deepseek-harness/)。

下一篇文章如果真用它跑点重活（比如批量改写文章），我再写一篇实操记录。
