import { products } from "../data/products.js";
import { cart } from "../store/cart.js";

const $ = (s, r = document) => r.querySelector(s);
const fmt = (n) => "$" + n.toLocaleString("en-US");











const card = (p) => {
  console.log(p.name, p.image);

  return `
    <article class="card" data-id="${p.id}" data-tint="${p.gender}" tabindex="0">
      <div class="card__img">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
      </div>
      <div class="card__row">
        <h3>${p.name}</h3>
        <span class="price">${fmt(p.price)}</span>
      </div>
      <p class="card__meta">${p.collection} collection, ${p.material.toLowerCase()}</p>
      <button class="link-line" data-add="${p.id}">Add to bag</button>
    </article>`;
};











// const card = (p) => `<article class="card" data-id="${p.id}" data-tint="${p.gender}" tabindex="0"><div class="card__img"><span>${p.name}</span></div><div class="card__row"><h3>${p.name}</h3><span class="price">${fmt(p.price)}</span></div><p class="card__meta">${p.collection} collection, ${p.material.toLowerCase()}</p><button class="link-line" data-add="${p.id}">Add to bag</button></article>`;
const list = (a, empty = "No watches match. Try clearing a filter.") => (a.length ? a.map(card).join("") : `<p class="empty">${empty}</p>`);

export function initShop() {
  ["men", "women"].forEach((g) => ($(`[data-rail=${g}]`).innerHTML = list(products.filter((p) => p.gender === g))));

  /* Filtering and search */
  const f = { g: "all", m: "all", q: "" };
  const grid = $("#grid");
  const render = () => (grid.innerHTML = list(products.filter((p) => (f.g === "all" || p.gender === f.g) && (f.m === "all" || p.material === f.m) && `${p.name} ${p.collection}`.toLowerCase().includes(f.q))));
  document.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => { f.g = b.dataset.g; document.querySelectorAll("[data-g]").forEach((x) => x.setAttribute("aria-pressed", x === b)); render(); }));
  $("#mat").addEventListener("change", (e) => { f.m = e.target.value; render(); });
  $("#q").addEventListener("input", (e) => { f.q = e.target.value.trim().toLowerCase(); render(); });
  render();

  /* Search overlay */
  const sd = $("#search"), sres = $("#sres");
  const sr = (q) => (sres.innerHTML = q ? list(products.filter((p) => `${p.name} ${p.collection} ${p.material}`.toLowerCase().includes(q.toLowerCase())), "Nothing found. Try a collection name.") : "");
  $("#sq").addEventListener("input", (e) => sr(e.target.value.trim()));

  /* Product details */
  const dd = $("#detail");
  const detail = (id) => { const p = products.find((x) => x.id === id); $("#dbody").innerHTML = `<div class="dbody"><h2>${p.name}</h2><p class="price">${fmt(p.price)}</p><p>${p.spec}</p><p class="card__meta">${p.collection} collection, ${p.material.toLowerCase()}</p><button class="btn" data-add="${p.id}">Add to bag</button></div>`; sd.open && sd.close(); dd.showModal(); };

  /* Cart drawer */
  const dr = $("#drawer");
  const setDrawer = (o) => { dr.classList.toggle("is-open", o); dr.setAttribute("aria-hidden", !o); };
  cart.subscribe((items) => {
    const n = cart.count(), b = $("[data-cart-count]");
    b.textContent = n; b.hidden = !n; b.parentElement.setAttribute("aria-label", `Shopping bag, ${n} items`);
    $("#items").innerHTML = items.length ? items.map((l) => `<div class="line"><div class="line__r"><h3>${l.p.name}</h3><span class="price">${fmt(l.p.price * l.qty)}</span></div><div class="line__r"><div class="qty"><button data-q="-1" data-id="${l.id}" aria-label="Decrease">-</button><span>${l.qty}</span><button data-q="1" data-id="${l.id}" aria-label="Increase">+</button></div><button class="link-line" data-rm="${l.id}">Remove</button></div></div>`).join("") : `<p class="empty">Your bag is empty. Browse the collection to add a watch.</p>`;
    $("#sub").textContent = fmt(cart.total());
  });
  $("#co").addEventListener("click", () => ($("#comsg").textContent = cart.count() ? "This is a front-end demo. No payment is taken and no order is placed." : "Add a watch to your bag first."));

  document.addEventListener("click", (e) => {
    const t = e.target;
    const add = t.closest("[data-add]"); if (add) { cart.add(+add.dataset.add); setDrawer(true); dd.open && dd.close(); return; }
    const q = t.closest("[data-q]"); if (q) return cart.change(+q.dataset.id, +q.dataset.q);
    const rm = t.closest("[data-rm]"); if (rm) return cart.remove(+rm.dataset.rm);
    const o = t.closest("[data-open]"); if (o) { o.dataset.open === "cart" ? setDrawer(true) : (sd.showModal(), $("#sq").focus()); return; }
    if (t.closest("[data-close]")) return setDrawer(false);
    const c = t.closest(".card"); if (c) detail(+c.dataset.id);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setDrawer(false); if (e.key === "Enter" && e.target.classList?.contains("card")) detail(+e.target.dataset.id); });

  /* Newsletter (demo: nothing is sent or stored) */
  $("#nl").addEventListener("submit", (e) => {
    e.preventDefault(); const em = $("#em"), m = $("#nlmsg");
    m.textContent = em.checkValidity() && em.value ? "Thank you. You are on the private list (demo, nothing was sent)." : "Enter a valid email address, for example name@example.com.";
    if (em.checkValidity() && em.value) em.value = "";
  });
}
