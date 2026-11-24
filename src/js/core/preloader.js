import { gsap } from "gsap";

/**
 * Plays the intro, waits for `ready` (Stage 4+: the 3D model), then lifts the curtain.
 * Always ends by removing the overlay and the `is-loading` class, even if something fails.
 */
export function runPreloader({ ready = Promise.resolve() } = {}) {
  const el = document.querySelector(".preloader");
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    el?.remove();
    document.body.classList.remove("is-loading");
  };

  if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { finish(); return Promise.resolve(); }

  const failsafe = setTimeout(finish, 7000); // never trap the visitor behind a black screen

  const intro = new Promise((resolve) => {
    gsap.timeline({ onComplete: resolve })
      .to(".preloader__mark", { opacity: 1, duration: 0.9, ease: "power2.out" })
      .to(".preloader__line", { scaleX: 1, duration: 0.9, ease: "power3.inOut" }, "-=0.4");
  });

  return Promise.all([intro, Promise.resolve(ready).catch(() => {})])
    .then(() => new Promise((resolve) => {
      gsap.to(el, { yPercent: -100, duration: 1.1, ease: "expo.inOut", delay: 0.2,
        onComplete: () => { clearTimeout(failsafe); finish(); resolve(); } });
    }))
    .catch(finish);
}
