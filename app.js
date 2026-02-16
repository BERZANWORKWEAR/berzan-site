// app.js (module)
import { supabase } from "./assets/js/supabaseClient.js";

const els = {
  pills: document.getElementById("categoryPills"),
  grid: document.getElementById("grid"),
  empty: document.getElementById("empty"),
  error: document.getElementById("errorBox"),
  chips: Array.from(document.querySelectorAll(".chip")),
};

const state = {
  categories: [],
  products: [],
  activeCat: "all",
  season: "all",
};

function showError(msg){
  els.error.style.display = "block";
  els.error.textContent = msg;
}
function clearError(){
  els.error.style.display = "none";
  els.error.textContent = "";
}

function fmtTRY(n){
  if (n === null || n === undefined || n === "") return "";
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return new Intl.NumberFormat("tr-TR", { style:"currency", currency:"TRY", maximumFractionDigits: 0 }).format(num);
}

function pillHTML({ slug, name }){
  const active = state.activeCat === slug ? "is-active" : "";
  return `<button class="pill ${active}" data-cat="${slug}">${name}</button>`;
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, (c)=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

function cardHTML(p){
  const img = p.cover_image_url
    ? `<img src="${p.cover_image_url}" alt="${escapeHtml(p.name)}" loading="lazy"/>`
    : `<div class="small">Görsel yok</div>`;
  return `
    <div class="card" data-id="${p.id}">
      <a href="./urun.html?slug=${encodeURIComponent(p.slug || p.id)}">
        <div class="thumb">${img}</div>
        <div class="meta">
          <p class="title">${escapeHtml(p.name || "")}</p>
          <p class="desc">${escapeHtml(p.short_desc || "")}</p>
          <div class="row">
            <div class="price">${fmtTRY(p.price_try)}</div>
            <button class="btn" type="button">İncele</button>
          </div>
        </div>
      </a>
    </div>
  `;
}

function renderPills(){
  const base = [{ slug:"all", name:"Tümü" }, ...state.categories];
  els.pills.innerHTML = base.map(pillHTML).join("");
}

function applyFilters(){
  const byCat = (p) => state.activeCat === "all" ? true : (p.category_slug === state.activeCat);
  const bySeason = (p) => {
    if (state.season === "all") return true;
    const hay = ((p.slug||"") + " " + (p.name||"")).toLowerCase();
    return hay.includes(state.season);
  };
  const items = state.products.filter(byCat).filter(bySeason);

  els.grid.innerHTML = items.map(cardHTML).join("");
  els.empty.style.display = items.length ? "none" : "block";
}

function wireUI(){
  els.pills.addEventListener("click", (e)=>{
    const btn = e.target.closest(".pill");
    if (!btn) return;
    state.activeCat = btn.dataset.cat;
    renderPills();
    applyFilters();
  });

  els.chips.forEach(ch=>{
    ch.addEventListener("click", ()=>{
      els.chips.forEach(x=>x.classList.remove("is-active"));
      ch.classList.add("is-active");
      state.season = ch.dataset.season;
      applyFilters();
    });
  });
}

async function loadData(){
  clearError();

  const { data: cats, error: catsErr } = await supabase
    .from("categories")
    .select("id, slug, name, sort, is_active")
    .order("sort", { ascending: true });

  if (catsErr) {
    console.error(catsErr);
    showError("Supabase categories okunamadı. RLS / key kontrol et.");
    return;
  }

  state.categories = (cats || [])
    .filter(c => c.is_active ?? true)
    .map(c => ({ slug: c.slug, name: c.name }));

  const { data: prods, error: prodErr } = await supabase
    .from("products")
    .select("id, slug, name, short_desc, price_try, cover_image_url, category_id, is_active, sort")
    .eq("is_active", true)
    .order("sort", { ascending: true });

  if (prodErr) {
    console.error(prodErr);
    showError("Supabase products okunamadı. RLS / key kontrol et.");
    return;
  }

  const catById = new Map((cats || []).map(c => [c.id, c.slug]));
  state.products = (prods || []).map(p => ({
    ...p,
    category_slug: catById.get(p.category_id) || "all"
  }));

  console.log("Loaded products:", state.products);
  renderPills();
  applyFilters();
}

document.addEventListener("DOMContentLoaded", ()=>{
  wireUI();
  loadData();
});
