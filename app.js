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
    todo:       "Për plotësim",
    structure:  "Strukturë"
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


  /* ================= 4. VIZATIMI I OBJEKTIT ======================== */
  var tpl = $("#tplBldg");

  function mountBldg(host, opts) {
    opts = opts || {};
    var svg = tpl.content.firstElementChild.cloneNode(true);
    host.appendChild(svg);

    /* gjatësia e secilës vijë, që vizatimi të ndodhë realisht */
    $$(".sys--draw path, .sys--draw line, .sys--draw polyline", svg).forEach(function (p) {
      var len;
      try { len = p.getTotalLength(); } catch (e) { len = 300; }
      if (!len || !isFinite(len)) len = 300;
      p.style.setProperty("--len", Math.ceil(len));
    });

    /* gjatësia e rrjedhës: pika udhëton tërë gjatësinë e tubit */
    $$(".pulse", svg).forEach(function (p) {
      var len;
      try { len = p.getTotalLength(); } catch (e) { len = 400; }
      if (!len || !isFinite(len)) len = 400;
      p.style.setProperty("--fl", Math.ceil(len) + 16);
    });

    /* ndërtesa mund të jetë e ngritur që në fillim (seksioni 04) */
    svg.__built = false;
    if (opts.prebuilt || reduce) { buildNow(svg); }
    mounted.push(svg);
    frame();
    return svg;
  }

  /* në celular vizatimi kadrohet më ngushtë, që të mos humbë hapësirë */
  var mounted = [];
  var narrow  = window.matchMedia("(max-width: 640px)");

  function frame() {
    var box = narrow.matches ? "44 80 512 416" : "0 0 600 520";
    mounted.forEach(function (svg) { svg.setAttribute("viewBox", box); });
  }
  if (narrow.addEventListener) narrow.addEventListener("change", frame);
  else if (narrow.addListener) narrow.addListener(frame);

  /* ndërtimi: dheu, themeli, pllakat nga poshtë lart, muret, lëkura, njerëzit */
  function buildNow(svg) {
    if (svg.__built) return;
    svg.__built = true;
    $$(".bld", svg).forEach(function (g) { g.classList.add("on"); });
  }

  function buildSeq(svg, step, done) {
    if (svg.__built) { if (done) done(); return; }
    svg.__built = true;
    var groups = $$(".bld", svg);
    groups.forEach(function (g, i) {
      setTimeout(function () { g.classList.add("on"); }, i * step);
    });
    if (done) setTimeout(done, groups.length * step + 260);
  }

  function setLayers(svg, keys) {
    $$(".sys", svg).forEach(function (g) {
      g.classList.toggle("on", keys.indexOf(g.getAttribute("data-sys")) !== -1);
    });
  }

  /* ---- hero ---- */
  var heroSvg  = mountBldg($("#heroSvg"));
  var heroLive = $("#heroLive");
  var heroTxt  = $("#heroLiveTxt");
  var legend   = $("#heroLegend");

  var active = [];
  var manual = false;
  var timer  = null;

  var legendBtns = {};
  LAYERS.forEach(function (L) {
    var co = byId[L.company];
    var b = el("button", "legend__i");
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    b.style.setProperty("--acc", co.color);
    b.innerHTML = '<i aria-hidden="true"></i><span>' + esc(L.label) + '</span>';
    b.addEventListener("click", function () {
      manual = true;
      if (timer) { clearTimeout(timer); timer = null; }
      buildNow(heroSvg);
      var i = active.indexOf(L.key);
      if (i === -1) { active.push(L.key); } else { active.splice(i, 1); }
      paint();
    });
    legendBtns[L.key] = b;
    legend.appendChild(b);
  });

  function paint() {
    setLayers(heroSvg, active);
    LAYERS.forEach(function (L) {
      var on = active.indexOf(L.key) !== -1;
      legendBtns[L.key].classList.toggle("on", on);
      legendBtns[L.key].setAttribute("aria-pressed", String(on));
    });
    var last = active.length ? active[active.length - 1] : null;
    if (last) {
      var L = LAYERS.filter(function (x) { return x.key === last; })[0];
      var c = byId[L.company];
      heroTxt.textContent = L.label;
      heroLive.style.setProperty("--acc", c.color);
    } else {
      heroTxt.textContent = UI.structure;
      heroLive.style.setProperty("--acc", "#C4BEB2");
    }
  }

  function cycle(i) {
    if (manual) return;
    if (i >= LAYERS.length) {
      timer = setTimeout(function () {
        if (manual) return;
        active = [];
        paint();
        timer = setTimeout(function () { cycle(0); }, 700);
      }, 3600);
      return;
    }
    active.push(LAYERS[i].key);
    paint();
    timer = setTimeout(function () { cycle(i + 1); }, 680);
  }

  if (reduce) {
    buildNow(heroSvg);
    active = LAYERS.map(function (L) { return L.key; });
    paint();
  } else {
    /* nis vetëm kur vizatimi është në pamje */
    var started = false;
    var startObs = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting && !started) {
          started = true;
          buildSeq(heroSvg, 165, function () { if (!manual) cycle(0); });
          startObs.disconnect();
        }
      });
    }, { threshold: .3 });
    startObs.observe(heroSvg);
  }


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


  /* ================= 7. MIKSI I PROJEKTIT ========================== */
  var mixSvg   = mountBldg($("#mixSvg"), { prebuilt: true });
  var types    = $("#types");
  var mixChips = $("#mixChips");
  var mixNote  = $("#mixNote");
  var mixTitle = $("#mixTitle");
  var tSys = $("#tSys"), tCo = $("#tCo");

  function layersFor(ids) {
    return LAYERS.filter(function (L) { return ids.indexOf(L.company) !== -1; })
                 .map(function (L) { return L.key; });
  }

  function showType(t, btn) {
    $$(".type", types).forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
    if (btn) btn.setAttribute("aria-pressed", "true");

    var keys = layersFor(t.companies);
    setLayers(mixSvg, keys);

    tSys.textContent = keys.length;
    tCo.textContent  = t.companies.length;
    mixTitle.textContent = t.name + " · prerje tipike";
    mixNote.innerHTML = "<strong>" + esc(t.line) + "</strong> " + esc(t.note);

    mixChips.innerHTML = "";
    COMPANIES.forEach(function (c) {
      var on = t.companies.indexOf(c.id) !== -1;
      var a = el("a", "chip" + (on ? "" : " chip--off"));
      a.href = c.url; a.target = "_blank"; a.rel = "noopener";
      a.style.setProperty("--acc", on ? c.color : "#5E686E");
      a.innerHTML = '<i aria-hidden="true"></i>' + esc(c.shortName);
      mixChips.appendChild(a);
    });
  }

  PROJECT_TYPES.forEach(function (t, i) {
    var b = el("button", "type");
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    b.innerHTML =
      '<span class="type__n">0' + (i + 1) + '</span>' +
      '<span class="type__t">' + esc(t.name) + '</span>' +
      '<span class="type__c">' + layersFor(t.companies).length + ' sisteme</span>';
    b.addEventListener("click", function () { showType(t, b); });
    types.appendChild(b);
  });
  showType(PROJECT_TYPES[0], types.firstElementChild);



  /* ================= 8. SHIFRAT ==================================== */
  var figs = $("#figs");
  STATS.forEach(function (s) {
    var box = el("div", "fig" + (s.verified ? "" : " fig--todo"));
    box.innerHTML =
      '<p class="fig__v">' + esc(s.value) + '</p>' +
      '<p class="fig__l">' + esc(s.label) + '</p>' +
      (s.verified ? "" : '<span class="fig__todo">' + UI.todo + '</span>');
    figs.appendChild(box);
  });


  /* ================= 9. CIKLI ====================================== */
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


  /* ================= 10. PSE ======================================= */
  var why = $("#why");
  REASONS.forEach(function (r, i) {
    var box = el("div", "why__i");
    box.innerHTML =
      '<p class="why__n">0' + (i + 1) + '</p>' +
      '<h3 class="why__t">' + esc(r.title) + '</h3>' +
      '<p class="why__x">' + esc(r.text) + '</p>';
    why.appendChild(box);
  });


  /* ================= 11. SHFAQJA NË SKROLL ========================= */
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
