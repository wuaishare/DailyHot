# DailyHot SEO Refresh Design

## Goal

Fix rank-route SEO label quality, ClawHub rank active state, and auto-refresh countdown behavior across ranking, category, and settings routes.

## Requirements

- Chinese raw HTML for rank detail routes must not leak untranslated ClawHub subtype words such as `Recommended`, `Featured`, or `Most installed` when a Chinese label already exists.
- Chinese rank SEO titles must avoid broken grammar such as `- 的 Skills 与 Plugins...`.
- ClawHub Chinese SEO must describe OpenClaw explicitly, for example `ClawHub 推荐插件榜 - OpenClaw插件推荐与工具生态榜单`.
- ClawHub subtype pages must not reuse one fixed tail such as `Skills 与 Plugins 聚合榜单入口`; each skill/plugin subtype needs a distinct Chinese intent phrase.
- `/rank/clawhub/plugins-recommended` must visibly activate the ClawHub source in the top rank source strip.
- The header must show language, refresh/countdown, theme, and settings controls on category pages, rank detail pages, and the settings page.
- Opening settings must pause automatic page refresh and freeze the remaining countdown time.
- Returning from settings to a refreshable route must resume from the frozen remaining time instead of resetting to the full interval.
- User-triggered manual pause remains a user pause and must not be auto-resumed by route changes.

## Design

Use the existing source subtype label map as the source of truth for user-facing subtype labels. Runtime SEO imports the same label resolver used by visible subtype bars. The static route shell generator mirrors the same mapping at build time by parsing `sourceLabels.js`, then generating route shells with localized Chinese subtype labels. ClawHub gets an additional Chinese SEO intent map so skill/plugin routes mention OpenClaw and vary the title tail by subtype.

For ClawHub active state, normalize source identity before comparing source tags. Current grouped sources such as `clawhub`, and legacy split routes such as `clawhub-skills` and `clawhub-plugins`, all resolve to the same visible source family.

For auto refresh, move route pause behavior to a small state machine in `App.vue`: active countdown target is preserved on normal refreshable routes, frozen into remaining milliseconds on settings routes, then restored on exit. `Header.vue` remains the display/control surface and reads the same global countdown target.

## Verification

- Run `pnpm build`.
- Inspect `dist/rank/clawhub/index.html`, `dist/rank/clawhub/plugins-recommended/index.html`, and `dist/rank/clawhub/skills-installs/index.html` for OpenClaw title/meta values.
- Browser-check `/category/ai`, `/category/tech`, `/rank/clawhub/plugins-recommended`, and `/setting` for header controls, ClawHub active state, and pause/resume countdown behavior.
