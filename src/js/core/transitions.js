import { gsap } from "gsap";

const KEY = "aurelle:transition";
const COVER = "inset(0% 0 0 0)";      // curtain fully covering the screen
const BELOW = "inset(100% 0 0 0)";    // hidden, waiting below
const ABOVE = "inset(0 0 100% 0)";    // hidden, lifted above

/** Wipes up over the page, then navigates. The next page lifts the curtain away on load. */
export function initTransitions() {
  const curtain = document.querySelector(".curtain");
  if (!curtain || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return { revealed: false };

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const url = new URL(a.href, location.href);
    const internal = url.origin === location.origin && !a.target && !a.hasAttribute("download");
    const samePage = url.pathname === location.pathname && url.search === location.search;
    if (!internal || samePage) return;

    e.preventDefault();
    sessionStorage.setItem(KEY, "1");
    gsap.fromTo(curtain, { clipPath: BELOW }, { clipPath: COVER, duration: 0.8, ease: "expo.inOut",
      onComplete: () => { location.href = url.href; } });
  });

  const arrived = sessionStorage.getItem(KEY) === "1";
  sessionStorage.removeItem(KEY);
  if (arrived) {
    gsap.fromTo(curtain, { clipPath: COVER }, { clipPath: ABOVE, duration: 0.9, ease: "expo.inOut", delay: 0.1 });
  }
  return { revealed: arrived };
}
