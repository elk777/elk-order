TRELLIS:START
# Trellis 说明

以下说明适用于在本项目中工作的 AI 助手。

本项目由 Trellis 管理。你需要的工作知识位于 `.trellis/` 目录下：

- `.trellis/workflow.md` — 开发阶段、何时创建任务、技能路由
- `.trellis/spec/` — 按包和层级划分的编码规范（在某个层级编写代码前先阅读）
- `.trellis/workspace/` — 每位开发者的日志和会话轨迹
- `.trellis/tasks/` — 活跃和已归档任务（PRD、调研、jsonl 上下文）

如果你的平台提供 Trellis 命令（例如 `/trellis:finish-work`、`/trellis:continue`），优先使用命令而不是手动步骤。并非每个平台都会暴露所有命令。

如果你使用 Codex 或其他支持代理的工具，项目范围内的额外辅助内容可能位于：
- `.agents/skills/` — 可复用的 Trellis 技能
- `.codex/agents/` — 可选的自定义子代理

由 Trellis 管理。此块之外的编辑会被保留；此块之内的编辑可能会在未来执行 `trellis update` 时被覆盖。

TRELLIS:END
