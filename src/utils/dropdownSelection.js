export const dropdownSelectionProps = (
  active,
  { current = false } = {},
) => ({
  class: ["app-dropdown-selection", active ? "is-active" : ""],
  ...(active && current ? { "aria-current": "page" } : {}),
  "data-selected": active ? "true" : "false",
});
