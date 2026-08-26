/* =====================================================================
   ZONE GROUP — SJELLJA E FAQES
   ---------------------------------------------------------------------
   Gjithçka ndërtohet nga data.js. Ky skedar nuk përmban tekst që sheh
   vizitori, përveç etiketave të ndërfaqes më poshtë.
   ===================================================================== */
(function () {
  "use strict";

  var UI = {
    all:        "Të gjitha",
    open:       "Hap faqen",
    todo:       "Për plotësim"
  };

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var byId = {};
  COMPANIES.forEach(function (c) { byId[c.id] = c; });

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ================= 1. VITI + KONTAKTI ============================= */
  var y = $("#vit"); if (y) y.textContent = new Date().getFullYear();

  var tel = $("#ctaTel"), mail = $("#ctaMail");
  if (tel)  { tel.href = "tel:+" + CONTACT.callPhone; }
  if (mail) { mail.href = "mailto:" + CONTACT.email; }


  /* ================= 2. KOKA + MENYTË ============================== */
  var head = $("#head");
  var onScroll = function () {
    head.classList.toggle("head--stuck", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var mega = $("#mega"), megaBtn = $("#megaBtn");
  var drawer = $("#drawer"), burger = $("#burger");
  mega.removeAttribute("hidden");
  drawer.removeAttribute("hidden");

  var scrim = el("div", "scrim");
  document.body.appendChild(scrim);

  function closeMega() {
    mega.classList.remove("mega--open");
    scrim.classList.remove("scrim--on");
    megaBtn.setAttribute("aria-expanded", "false");
  }
  function openMega() {
    mega.classList.add("mega--open");
    scrim.classList.add("scrim--on");
    megaBtn.setAttribute("aria-expanded", "true");
  }
  megaBtn.addEventListener("click", function () {
    mega.classList.contains("mega--open") ? closeMega() : openMega();
  });
  scrim.addEventListener("click", closeMega);

  function closeDrawer() {
    drawer.classList.remove("drawer--open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Hap menynë");
    document.body.classList.remove("locked");
  }
  burger.addEventListener("click", function () {
    var open = drawer.classList.toggle("drawer--open");
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Mbyll menynë" : "Hap menynë");
    document.body.classList.toggle("locked", open);
  });
  drawer.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeDrawer();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeMega(); closeDrawer(); }
  });


  /* ================= 3. MEGA-MENYJA ================================ */
  var megaGrid = $("#megaGrid");
  CATEGORIES.forEach(function (cat) {
    var box = el("div", "mega__cat");
    box.appendChild(el("p", "mega__ct", esc(cat.name)));
    COMPANIES.filter(function (c) { return c.cat === cat.id; }).forEach(function (c) {
      var a = el("a", "mega__l");
      a.href = c.url; a.target = "_blank"; a.rel = "noopener";
      a.style.setProperty("--acc", c.color);
      a.innerHTML =
        '<i class="mega__dot" aria-hidden="true"></i>' +
        '<span><span class="mega__nm">' + esc(c.shortName) + '</span>' +
        '<span class="mega__fd">' + esc(c.field) + '</span></span>';
      box.appendChild(a);
    });
    megaGrid.appendChild(box);
  });

  /* lista e kompanive në sirtar */
  var dc = $("#drawerCos");
  COMPANIES.forEach(function (c) {
    var a = el("a", "drawer__co");
    a.href = c.url; a.target = "_blank"; a.rel = "noopener";
    a.style.setProperty("--acc", c.color);
    a.innerHTML = '<i aria-hidden="true"></i>' + esc(c.shortName) + '<em aria-hidden="true">↗</em>';
    dc.appendChild(a);
  });


  /* ================= 5. KATEGORITË ================================= */
  var cats = $("#cats");
  CATEGORIES.forEach(function (cat, i) {
    var list = COMPANIES.filter(function (c) { return c.cat === cat.id; });
    var box = el("div", "cat");
    box.innerHTML =
      '<p class="cat__n">0' + (i + 1) + '</p>' +
      '<h3 class="cat__t">' + esc(cat.name) + '</h3>' +
      '<p class="cat__l">' + esc(cat.desc) + '</p>' +
      '<div class="cat__dots" aria-hidden="true">' +
        list.map(function (c) { return '<i style="background:' + c.color + '"></i>'; }).join("") +
      '</div>' +
      '<p class="cat__c">' + list.length + ' kompani</p>';
    cats.appendChild(box);
  });


  /* ================= 6. EKSPLORUESI I KOMPANIVE ==================== */
  var filters = $("#filters"), grid = $("#grid");

  function mkFilter(label, val, on) {
    var b = el("button", "filt", esc(label));
    b.type = "button";
    b.setAttribute("aria-pressed", String(!!on));
    b.dataset.v = val;
    b.addEventListener("click", function () {
      $$(".filt", filters).forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", "true");
      $$(".co", grid).forEach(function (card) {
        if (!card.dataset.cat) return;
        card.classList.toggle("hide", val !== "all" && card.dataset.cat !== val);
      });
    });
    return b;
  }
  filters.appendChild(mkFilter(UI.all, "all", true));
  CATEGORIES.forEach(function (c) { filters.appendChild(mkFilter(c.name, c.id)); });

  /* prefiksi i emrit zyrtar: "Zone Group" ose "Zone", sipas markës reale */
  function prefixOf(c) {
    var i = c.name.lastIndexOf(c.shortName);
    return i > 0 ? c.name.slice(0, i).trim() : "";
  }

  COMPANIES.forEach(function (c) {
    var card = el("article", "co");
    card.dataset.cat = c.cat;
    card.style.setProperty("--acc", c.color);
    card.innerHTML =
      '<a class="co__in" href="' + c.url + '" target="_blank" rel="noopener">' +
        '<div class="co__top"><i class="co__dot" aria-hidden="true"></i>' +
        '<span class="co__fd">' + esc(c.field) + '</span></div>' +
        '<h3 class="co__nm"><span>' + esc(prefixOf(c)) + '</span><b>' + esc(c.shortName) + '</b></h3>' +
        '<p class="co__d">' + esc(c.desc) + '</p>' +
        '<div class="co__sv">' +
          c.services.slice(0, 4).map(function (s) { return '<span>' + esc(s) + '</span>'; }).join("") +
        '</div>' +
        '<span class="co__go">' + UI.open + ' <i aria-hidden="true">↗</i></span>' +
      '</a>';
    grid.appendChild(card);
  });

  var end = el("div", "co co--end");
  end.innerHTML =
    '<span>' + COMPANIES.length + ' kompani · ' + CATEGORIES.length + ' fusha</span>' +
    '<p>Nuk e dini cila kompani ju duhet? Filloni nga projekti.</p>' +
    '<a class="btn btn--line btn--sm" href="#kontakt">Diskuto projektin ' +
    '<span class="btn__a" aria-hidden="true">→</span></a>';
  grid.appendChild(end);

  /* ================= 7. CIKLI ====================================== */
  var rail = $("#rail"), pDesc = $("#phaseDesc"), pChips = $("#phaseChips");

  function showPhase(ph, btn) {
    $$(".phase", rail).forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
    if (btn) btn.setAttribute("aria-pressed", "true");
    pDesc.textContent = ph.desc;
    pChips.innerHTML = "";
    ph.companies.forEach(function (id) {
      var c = byId[id]; if (!c) return;
      var a = el("a", "chip");
      a.href = c.url; a.target = "_blank"; a.rel = "noopener";
      a.style.setProperty("--acc", c.color);
      a.innerHTML = '<i aria-hidden="true"></i>' + esc(c.shortName);
      pChips.appendChild(a);
    });
  }

  PHASES.forEach(function (ph, i) {
    var b = el("button", "phase");
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    b.innerHTML =
      '<span class="phase__bar" aria-hidden="true"></span>' +
      '<span class="phase__n">0' + (i + 1) + '</span>' +
      '<span class="phase__t">' + esc(ph.name) + '</span>';
    b.addEventListener("click", function () { showPhase(ph, b); });
    rail.appendChild(b);
  });
  showPhase(PHASES[0], rail.firstElementChild);


  /* ================= 8. PSE ======================================= */
  var why = $("#why");
  REASONS.forEach(function (r, i) {
    var box = el("div", "why__i");
    box.innerHTML =
      '<p class="why__n">0' + (i + 1) + '</p>' +
      '<h3 class="why__t">' + esc(r.title) + '</h3>' +
      '<p class="why__x">' + esc(r.text) + '</p>';
    why.appendChild(box);
  });


  /* ================= 10. SHFAQJA NË SKROLL ========================= */
  var ups = $$(".up");
  if (reduce || !("IntersectionObserver" in window)) {
    ups.forEach(function (n) { n.classList.add("in"); });
  } else {
    var obs = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .12 });
    ups.forEach(function (n) { obs.observe(n); });

    /* rrjetë sigurie: asgjë nuk mbetet e fshehur */
    setTimeout(function () { ups.forEach(function (n) { n.classList.add("in"); }); }, 3500);
  }

})();
