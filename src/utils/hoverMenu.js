export const HOVER_MENU_OPEN_EVENT = "dailyhot:hover-menu-open";

export const announceHoverMenuOpen = (id) => {
  if (typeof window === "undefined" || !id) return;
  window.dispatchEvent(new CustomEvent(HOVER_MENU_OPEN_EVENT, { detail: { id } }));
};
