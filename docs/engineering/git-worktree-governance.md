# Git / Worktree 治理规范

**状态：** Active
**适用范围：** DailyHot 仓库的本地开发、PR、Vercel 生产交付与自动化执行

## 目标

DailyHot 采用 **trunk-based development + 显式 WIP 上限**。

Branch 和 worktree 是临时执行工具，不是长期项目管理层。默认保持一个 canonical checkout；只有存在真实隔离需求时才创建第二 worktree，并且必须在同一轮 closeout 中回收。

## 长期分支与稳态预算

- `main` 是唯一长期开发分支，也是 Vercel Production Branch。
- 不再保留 `live`、`develop`、`release/*` 等平行长期分支。
- 正常稳态：
  - **1 个 canonical worktree**；
  - **1 个长期本地分支：`main`**；
  - 实现期间最多额外存在 **1 个活动短期产品分支**。

旧 `live` 兼容部署线已经退休，最终提交保存在 `archive/live-final-20260817` tag。不得因为旧计划、旧聊天记录或历史部署文档重新创建 `live`。

## 分支生命周期

每条非 `main` 分支只能属于下面一种状态：

1. **active**：当前唯一获准推进的产品切片；
2. **merged / superseded**：合并或被替代后立即删除 branch 和 worktree；
3. **historical evidence**：用不可变 `archive/*` tag 保存 exact commit，然后删除 live branch。

不长期保留 `archive/*` branch。

`research/*`、`wip/*` 只允许作为有明确退出条件的临时现场。需要停车时，优先转成 archive tag，而不是无限期占用 branch budget。

## Single Native Checkout First

默认直接使用注册的 canonical checkout。

只有以下情况才允许创建第二 worktree：

- production/runtime `main` 必须持续运行，而另一条分支需要隔离写入；
- 并行验证会真实产生文件冲突或污染；
- 明确隔离的 hotfix / recovery；
- 用户或执行计划显式要求隔离。

不得因为“开启了新会话”“任务看起来比较大”或“习惯上想隔离”自动创建 worktree。

每个临时 worktree 必须同时有：

- owner branch；
- 创建原因；
- exit condition。

merge / supersede 后应在同一 closeout 回合删除，不把 `node_modules`、构建缓存等可再生目录当作保留 worktree 的理由。

## WIP 上限

同一时间只允许一条活动产品分支。

支持性 detour（文档、README、视觉微调、构建工具修复等）默认最多消耗一个 PR，达到预先定义的退出条件后立即 Return-to-Trunk；不能从 detour 再派生第二代 feature branch。

## Return-to-Trunk

每个 PR 合并后、开始下一条分支前，必须完成：

1. 确认 PR 已 merge，必要的 CI / build / preview 为 green；
2. squash merge 时不能只看 ancestry，必须核对 **PR 状态 + tree/patch 等价**；
3. canonical `main` fast-forward 到 `origin/main`；
4. 对 merged `main` 跑与改动相匹配的 smoke / build / 生产验证；
5. 删除 merged / superseded 的本地短期分支；
6. 删除对应远端短期分支；
7. 删除临时 worktree，并执行 `git worktree prune`；
8. 再次确认 branch / worktree budget；
9. 然后才允许开始下一条产品分支。

## Squash merge 审计

GitHub squash merge 会破坏普通 commit ancestry，因此：

- `git branch --merged` 不是唯一判断依据；
- 优先比较 feature tip 与 merge commit 的 tree hash；
- 或使用 PR merge state + patch equivalence 证明功能内容已进入主干。

确认等价后才能删除未显示为 ancestor 的本地 feature branch。

## Dirty / Unmerged 安全规则

任何清理动作前先运行：

```bash
git status --short --branch
git worktree list --porcelain
git branch --format='%(refname:short)|%(upstream:short)|%(worktreepath)'
```

规则：

- dirty worktree：只审计，不强删；
- unmerged branch：不能直接删除，除非已转为 archive tag 或有明确 superseded 证据；
- detached worktree：先确认 commit 是否已进入主干或已被 tag；
- 不使用 `git clean -fdx` 作为常规“治理”手段；
- 不为了整洁回退别人已有的未提交改动。

## 历史证据归档

需要保留但不再活跃的分支，使用：

```bash
git tag -a archive/<topic>-YYYYMMDD <commit> -m "<归档原因>"
git push origin archive/<topic>-YYYYMMDD
```

确认远端 tag 指向目标 commit 后，再删除对应 branch。

当前历史归档包括：

- `archive/live-final-20260817`
- `archive/research-source-taxonomy-v2-20260902`
- `archive/game-deals-source-recovery-20260908`

## 生产边界

- `main` 是 DailyHot 长期开发与 Vercel Production Branch。
- PR / Preview 只作为验证入口；生产完成必须以 merged `main` 的真实 Vercel 部署与公网冒烟为准。
- 不通过恢复旧 `live` 分支来解决一般部署问题。

## 日常检查

建议在开始和结束一轮开发时执行：

```bash
git fetch origin --prune
git status --short --branch
git worktree list
git branch --sort=-committerdate
git worktree prune
```

目标不是“零 branch 数量”本身，而是：**只有真实活跃工作占用 live branch/worktree，历史只以 commit/tag/doc 形式存在。**
