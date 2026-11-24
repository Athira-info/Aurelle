import { gsap } from "gsap";
import { stopScroll, startScroll, getLenis } from "../core/scroll.js";

export function initNav() {
  const nav = document.querySelector("[data-nav]");
  if (!nav) return;

  /* Solid background, hide on scroll down, show on scroll up */
  let last = 0;
  const onScroll = (y) => {
    nav.classList.toggle("is-solid", y > 40);
    const down = y > last && y > 160;
    nav.classList.toggle("is-hidden", down && !document.body.classList.contains("menu-open"));
    last = y;
  };
  const lenis = getLenis();
  if (lenis) lenis.on("scroll", ({ scroll }) => onScroll(scroll));
  else window.addEventListener("scroll", () => onScroll(window.scrollY), { passive: true });
  onScroll(window.scrollY);

  /* Collections panel: hover and keyboard */
  const item = nav.querySelector("[data-mega]");
  if (item) {
    const btn = item.querySelector("button");
    const set = (open) => { item.classList.toggle("is-open", open); btn.setAttribute("aria-expanded", String(open)); };
    item.addEventListener("mouseenter", () => set(true));
    item.addEventListener("mouseleave", () => set(false));
    btn.addEventListener("click", () => set(!item.classList.contains("is-open")));
    item.addEventListener("focusout", (e) => { if (!item.contains(e.relatedTarget)) set(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  }

  /* Mobile menu */
  const burger = nav.querySelector(".nav__burger");
  const menu = document.getElementById("mobile-menu");
  if (!burger || !menu) return;
  const items = menu.querySelectorAll(".mobile-menu__nav a, .mobile-menu__note");
  let open = false;

  const toggle = (next) => {
    open = next;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("menu-open", open);
    open ? stopScroll() : startScroll();
    if (open) menu.classList.add("is-open");
    gsap.to(menu, { clipPath: open ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)", duration: 0.9, ease: "expo.inOut",
      onComplete: () => { if (!open) menu.classList.remove("is-open"); } });
    if (open) gsap.fromTo(items, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.07, delay: 0.3 });
  };

  burger.addEventListener("click", () => toggle(!open));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) toggle(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && open) toggle(false); });
  window.matchMedia("(min-width: 961px)").addEventListener("change", (m) => { if (m.matches && open) toggle(false); });
}
