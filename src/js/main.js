import { initScroll } from "./core/scroll.js";
import { initTransitions } from "./core/transitions.js";
import { runPreloader } from "./core/preloader.js";
import { initNav } from "./components/nav.js";
import { initShop } from "./components/shop.js";
import { initScenes } from "./animations/scenes.js";

// One failing module must never leave the preloader on screen: log it and carry on.
const safe = (name, fn) => {
  try { return fn(); } catch (err) { console.error(`[AURELLE] ${name} failed to start:`, err); }
};

function boot() {
  safe("scroll", initScroll);
  safe("nav", initNav);
  safe("shop", initShop);
  safe("scenes", initScenes);
  const t = safe("transitions", initTransitions);

  // Skip the preloader only when arriving through an in-site page transition.
  if (t?.revealed) {
    document.querySelector(".preloader")?.remove();
    document.body.classList.remove("is-loading");
  } else {
    runPreloader();
  }
}

document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
