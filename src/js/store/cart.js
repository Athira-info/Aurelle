import { products } from "../data/products.js";
const KEY = "aurelle:cart";
let lines = [];
try { lines = JSON.parse(localStorage.getItem(KEY)) || []; } catch { lines = []; }
const subs = new Set();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch {} subs.forEach((f) => f(cart.items())); };
export const cart = {
  subscribe(f) { subs.add(f); f(cart.items()); },
  items: () => lines.map((l) => ({ ...l, p: products.find((p) => p.id === l.id) })).filter((l) => l.p),
  add(id) { const l = lines.find((x) => x.id === id); l ? l.qty++ : lines.push({ id, qty: 1 }); save(); },
  change(id, d) { const l = lines.find((x) => x.id === id); if (!l) return; l.qty += d; if (l.qty < 1) lines = lines.filter((x) => x !== l); save(); },
  remove(id) { lines = lines.filter((x) => x.id !== id); save(); },
  count: () => lines.reduce((n, l) => n + l.qty, 0),
  total: () => cart.items().reduce((n, l) => n + l.qty * l.p.price, 0),
};
