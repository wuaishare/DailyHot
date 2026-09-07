# Category Multiview Stream Contract

> Status: implemented in `codex/dailyhot-context-breadcrumb-multiview` and awaiting preview / production acceptance.

## Product intent

Category pages should support two different information-consumption jobs without turning the context toolbar into a second navigation bar:

1. **Card view** — scan sources as individual ranking cards, preserving source identity and the existing DailyHot mental model.
2. **List / Compact view** — merge multiple sources into one filterable stream for faster cross-source information retrieval.

The category hierarchy belongs to the breadcrumb context on the left. View, search, contextual management, and display controls belong to the action area on the right.

## Context toolbar contract

- Home does not render ContextToolbar.
- Header owns L1 category navigation.
- Category / ranking / topic routes use a compact breadcrumb path:
  - Home → L1 → L2 → L3 as real hierarchy exists.
  - Ranking routes continue from the owning category into source / subtype.
  - Topic routes use Home → Topics → current topic.
- Hovering a breadcrumb category opens its real sibling set for quick switching.
- Search is current-context search and persists through `?q=`.
- `⌘K` / `Ctrl+K` focuses current-context search.
- The toolbar Hotboard Manager entry opens the manager at the current category.
- The Header gear remains the global Hotboard Manager entry.

## Category view modes

URL contract:

- Card: no `view` query (canonical default)
- List: `?view=list`
- Compact: `?view=compact`

List and Compact consume the same category stream component and data collection. Switching List ↔ Compact must not refetch already-loaded rankings solely because presentation density changed.

## Shared ranking collection

`src/utils/rankingCollection.js` is the shared request layer for ranking reads.

Responsibilities:

- deduplicate identical in-flight requests;
- retain successful results for a short freshness window;
- distinguish normal cached reads from explicit force refresh;
- keep source API fallback behavior in the existing API layer;
- avoid hidden HotList components as a data-loading mechanism.

Card HotList, ranking detail List, and category stream should use this layer where their request contracts match.

## Category stream filters

The first production filter contract is intentionally small and real:

### Sources

- Empty `sources` means all sources in the current category.
- Explicit source selection serializes as comma-separated source names.
- Invalid / duplicate source names are removed.
- Selecting every available source canonicalizes back to no `sources` parameter.

### Per-source rank interval

- Default is Top 10, represented by no `from` / `to` query.
- Quick presets: Top 5 / Top 10 / Top 20.
- Custom interval supports 1–100 with `from` constrained to 1–99.
- Example: `from=6&to=15` means rank 6 through rank 15 **inside every selected source**, not global merged positions.
- Invalid values are clamped and canonicalized.
- If `from > to`, `to` is raised to the normalized `from`.

This is currently a presentation / aggregation projection. Upstream providers do not expose one consistent server-side range contract, so the UI must not claim that only those rows were fetched from every provider.

### Merge order

- Default `rank`: #1 from each source, then #2 from each source, etc.
- `order=source`: keep each source's selected interval together.
- Unknown order values canonicalize to the default and are removed from the URL.

Cross-source heat sorting is intentionally not offered because provider heat metrics are not normalized enough to make such ordering trustworthy.

### Search

`q` filters the current stream by available item fields including title, description, source, author, heat and market code / symbol where present.

## Display preferences

Existing real persisted preferences remain authoritative:

- compact card layout;
- cover visibility;
- list font size.

The category stream must honor list font size. Compact stream derives a slightly smaller row title size from that persisted preference rather than hard-coding an unrelated value.

## Failure and loading behavior

- Source loads are concurrency-limited.
- Fast source-filter changes must not leave previously started source requests permanently stuck in a local `loading` state.
- Failed sources remain visible as a count and an inspectable localized source list.
- Users can retry only failed sources.
- A provider failure must not block already successful sources from rendering.

## Timeline remains deferred — not deleted

Timeline / chronological cross-source feed is still part of the product direction, but must not be faked from ranking refresh timestamps.

Admission requirements:

1. reliable item-level timestamp coverage;
2. normalized timestamp semantics across sources;
3. a clear rule for items with no trustworthy event / publish time;
4. consumption through the shared collection / aggregation layer, not hidden card mounts or browser-side duplicate N+1 loading.

Until those are met, Card / List / Compact are the admitted real view modes.

## Acceptance

Required before merge:

- Home toolbar count = 0.
- Breadcrumb hierarchy and hover sibling switching work.
- Context search supports URL restore and keyboard focus.
- Contextual Hotboard Manager opens the current category.
- Card / List / Compact URL states restore on reload.
- Default List = Top 10 per source.
- Source selection, custom 6–15 interval, and source grouping work.
- List → Compact adds no ranking requests solely from the mode switch.
- Invalid source / rank / order query state canonicalizes.
- Persisted list font size affects List / Compact.
- 1440px and 1080px desktop widths have no horizontal overflow.
- i18n, feedback, fallback, production build, PWA, route-shell, and diff checks pass.
