(() => {
  const grid = document.querySelector(".grid");
  const filters = [...document.querySelectorAll(".filter")];
  const empty = document.querySelector(".empty");
  if (!grid) return;

  // keep the original card order so layouts are stable
  const cards = [...grid.querySelectorAll(":scope > .card")];
  let current = "all";

  // how many columns fit the grid's current width
  const columnCount = () => {
    const w = grid.clientWidth;
    if (w >= 820) return 3;
    if (w >= 520) return 2;
    return 1;
  };

  // place each visible card into the currently shortest column
  const layout = () => {
    const n = columnCount();
    const cols = Array.from({ length: n }, () => {
      const col = document.createElement("div");
      col.className = "grid__col";
      return col;
    });

    grid.classList.add("is-masonry");
    grid.replaceChildren(...cols);

    const heights = new Array(n).fill(0);
    const visible = cards.filter((card) => !card.hidden);

    visible.forEach((card) => {
      const i = heights.indexOf(Math.min(...heights));
      cols[i].appendChild(card);
      heights[i] += card.getBoundingClientRect().height + 20;
    });

    // hidden cards stay in the DOM (last column) so they can come back
    cards
      .filter((card) => card.hidden)
      .forEach((card) => cols[n - 1].appendChild(card));

    if (empty)
      empty.hidden = visible.some((c) => c.dataset.category !== "always");
  };

  const applyFilter = (value) => {
    current = value;
    cards.forEach((card) => {
      const cat = card.dataset.category;
      card.hidden = !(value === "all" || cat === value || cat === "always");
    });
    filters.forEach((btn) =>
      btn.setAttribute("aria-pressed", String(btn.dataset.filter === value)),
    );
    layout();
  };

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.filter !== current) applyFilter(btn.dataset.filter);
    });
  });

  // re-flow on resize (only when the column count changes)
  let lastCount = columnCount();
  let raf = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const n = columnCount();
      if (n !== lastCount) {
        lastCount = n;
        layout();
      }
    });
  });

  // lay out once fonts + images have settled so heights are accurate
  const ready = [document.fonts ? document.fonts.ready : Promise.resolve()];
  grid.querySelectorAll("img").forEach((img) => {
    if (!img.complete)
      ready.push(
        new Promise((res) => img.addEventListener("load", res, { once: true })),
      );
  });
  applyFilter("all");
  Promise.all(ready).then(layout);

  // footer year
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
