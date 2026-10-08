/**
 * Router-agnostic navigation. Components call `go()`; the root route registers the real
 * router so moves are client-side. Without a router (tests, Next.js later) it falls back
 * to a full page load.
 */
type Navigator = (to: string, options?: { replace?: boolean }) => void;

let navigator: Navigator = (to, options) => {
  if (typeof window === "undefined") return;
  if (options?.replace) window.location.replace(to);
  else window.location.assign(to);
};

export function setNavigator(next: Navigator) {
  navigator = next;
}

export function go(to: string, options?: { replace?: boolean }) {
  navigator(to, options);
}
