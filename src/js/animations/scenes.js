import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { mountScene } from "../three/watch.js";
gsap.registerPlugin(ScrollTrigger);

const caps = ["The case, polished and brushed by hand.", "A dial finished with a fine sunburst grain.", "Four hundred and twelve parts, assembled in one room.", "Taken apart: crystal, hands, dial, case and strap."];

export function initScenes() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Hero: live 3D watch, pointer parallax, camera dolly on scroll */
  const hero = mountScene(document.querySelector(".hero__canvas"), { z: 7 });
  if (hero) {
    const m = { x: 0 };
    addEventListener("pointermove", (e) => { m.x = e.clientX / innerWidth - 0.5; });
    hero.pivot.rotation.x = -0.35;
    let spin = 0;
    hero.onFrame = () => {
      if (!reduce) spin += 0.004;
      hero.pivot.rotation.y += (spin + m.x * 0.8 - hero.pivot.rotation.y) * 0.05;
      const wide = innerWidth > 960;
      hero.pivot.position.set(wide ? 2.1 : 0, wide ? 0 : -1.2, 0);
    };
    if (!reduce) {
      gsap.to(hero.camera.position, { z: 3.6, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.from(".hero__copy > *", { yPercent: 30, opacity: 0, duration: 1.4, ease: "expo.out", stagger: 0.15, delay: 1.2 });
    }
  }

  /* Showcase: pinned. Scroll rotates the watch; the last stretch explodes it. Drag adds rotation. */
  const cv = document.querySelector(".show__canvas");
  const sc = mountScene(cv, { z: 6 });
  if (sc) {
    sc.pivot.rotation.x = -0.35;
    const cap = document.querySelector(".show__cap");
    let drag = 0, last = 0, ci = -1, p = 0;
    const apply = () => {
      sc.pivot.rotation.y = p * Math.PI * 2 + drag;
      sc.watch.explode(Math.min(1, Math.max(0, (p - 0.6) / 0.35)));
      const i = Math.min(3, Math.floor(p * 4));
      if (i !== ci) { ci = i; cap.textContent = caps[i]; }
    };
    ScrollTrigger.create({ trigger: ".show", start: "top top", end: reduce ? "+=100%" : "+=250%", pin: true, scrub: true, onUpdate: (s) => { p = s.progress; apply(); } });
    cv.addEventListener("pointerdown", (e) => {
      last = e.clientX; cv.setPointerCapture(e.pointerId);
      cv.onpointermove = (ev) => { drag += (ev.clientX - last) * 0.01; last = ev.clientX; apply(); };
    });
    cv.addEventListener("pointerup", () => (cv.onpointermove = null));
    document.querySelectorAll("[data-finish]").forEach((b) => b.addEventListener("click", () => {
      sc.watch.setFinish(b.dataset.finish);
      document.querySelectorAll("[data-finish]").forEach((x) => x.setAttribute("aria-pressed", x === b));
    }));
  }

  /* Craft counters */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const end = +el.dataset.count, o = { v: 0 };
    if (reduce) { el.textContent = end; return; }
    ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => gsap.to(o, { v: end, duration: 2, ease: "power2.out", onUpdate: () => (el.textContent = Math.round(o.v)) }) });
  });
}
