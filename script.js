/* ===================================================================
   ZONE GROUP — sjellja
   -------------------------------------------------------------------
   Pesë punë të vogla, pa varësi:
     1. Koka bëhet e ngurtë pasi dilni nga hero-ja
     2. Menyja në celular
     3. Shfaqja e përmbajtjes gjatë lëvizjes
     4. Numërimi i kompanive, një herë
     5. Ndërtimi i linjave të diagramit të integrimit
   =================================================================== */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s) { return document.querySelector(s); };

  /* ---------------------------------------------------------------
     1. Koka
     --------------------------------------------------------------- */
  var head = document.getElementById("head");

  function onScroll() {
    if (head) head.classList.toggle("stuck", window.pageYOffset > 40);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------
     2. Menyja në celular
     --------------------------------------------------------------- */
  var burger = document.getElementById("burger");
  var drawer = document.getElementById("drawer");

  function shutDrawer() {
    if (!drawer) return;
    drawer.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  }

  if (burger && drawer) {
    burger.addEventListener("click", function () {
      var open = drawer.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });

    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", shutDrawer);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") shutDrawer();
    });
  }

  /* ---------------------------------------------------------------
     5. Linjat e diagramit
     Ndërtohen këtu, jo në HTML, që të mos ketë trembëdhjetë rreshta
     të përsëritur në markup. Duhet të ekzekutohet para vëzhguesit.
     --------------------------------------------------------------- */
  var lines = document.getElementById("convLines");

  if (lines) {
    var NX = 330, NY = 230;     // nyja
    var frag = document.createDocumentFragment();

    for (var i = 0; i < 13; i++) {
      var y = 20 + i * 35;
      var ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
      ln.setAttribute("x1", "6");
      ln.setAttribute("y1", String(y));
      ln.setAttribute("x2", String(NX));
      ln.setAttribute("y2", String(NY));

      // Gjatësia e saktë, që vizatimi të mbarojë njësoj për çdo linjë
      var len = Math.round(Math.sqrt(Math.pow(NX - 6, 2) + Math.pow(NY - y, 2)));
      ln.style.setProperty("--len", len);
      ln.style.animationDelay = (i * 0.055).toFixed(3) + "s";

      frag.appendChild(ln);
    }

    lines.appendChild(frag);
  }

  /* ---------------------------------------------------------------
     3. Shfaqja gjatë lëvizjes
     --------------------------------------------------------------- */
  var items = document.querySelectorAll(".rise, .shead, .integ__fig");

  if (!("IntersectionObserver" in window) || reduced) {
    // Pa mbështetje, ose me lëvizje të reduktuar: shfaq gjithçka
    // menjëherë, që asgjë të mos mbetet e padukshme.
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var idx = el.parentElement
          ? Array.prototype.indexOf.call(el.parentElement.children, el)
          : 0;
        el.style.transitionDelay = Math.min(idx, 9) * 42 + "ms";
        el.classList.add("in");
        io.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });

    items.forEach(function (el) { io.observe(el); });

    // Rrjetë sigurie: nëse diçka mbetet e fshehur pas 3.5 sekondash,
    // shfaqe. Një faqe biznesi s'guxon të mbetet bosh.
    setTimeout(function () {
      document.querySelectorAll(".rise:not(.in), .shead:not(.in), .integ__fig:not(.in)")
        .forEach(function (el) { el.classList.add("in"); });
    }, 3500);
  }

  /* ---------------------------------------------------------------
     4. Numërimi
     --------------------------------------------------------------- */
  var counter = $("[data-count]");

  if (counter && !reduced && "IntersectionObserver" in window) {
    var target = parseInt(counter.getAttribute("data-count"), 10) || 0;
    var done = false;

    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || done) return;
        done = true;
        cio.disconnect();

        var t0 = null;
        var DUR = 1150;

        function step(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min(1, (ts - t0) / DUR);
          var v = Math.round((1 - Math.pow(1 - p, 3)) * target);
          counter.textContent = v < 10 ? "0" + v : String(v);
          if (p < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });

    cio.observe(counter);
  }

  /* ---------------------------------------------------------------
     Viti në fund
     --------------------------------------------------------------- */
  var vit = document.getElementById("vit");
  if (vit) vit.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------
     Kompanitë pa faqe: ndal kërcimin te "#"
     --------------------------------------------------------------- */
  document.querySelectorAll(".row--soon").forEach(function (row) {
    row.addEventListener("click", function (e) { e.preventDefault(); });
  });
})();

/* ===================================================================
   ZONE GROUP — motori i ujit
   -------------------------------------------------------------------
   DREJTIMI I RRJEDHËS: NGA JASHTË NGA BRENDA. Gjithçka bashkohet
   drejt qendrës — valët, rrymat, treguesi. E njëjta ide që e thotë
   diagrami, e kthyer në fizikën e faqes.

   Katër punë:
     1. Ndërton shtigjet e valëve (pa trembëdhjetë rreshta në markup)
     2. Shpejtësia e lëvizjes ushqen --churn: sa më shpejt, aq më
        trazuar bëhen valët
     3. Treguesi mbushet nga të dy skajet me sjellje sustë
     4. Valëzim nga pika e prekjes te rreshtat aktivë
   =================================================================== */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  /* ---------------------------------------------------------------
     1. Shtigjet e valëve
     Katër periudha brenda viewBox-it 2880, që zhvendosja prej -50%
     të bjerë saktësisht mbi të njëjtën fazë: cikli s'ka kërcim.
     --------------------------------------------------------------- */
  function wavePath(dip, rise) {
    var d = "M0,75";
    for (var i = 0; i < 4; i++) {
      var x = 720 * i;
      d += " C" + (x + 180) + "," + dip + " " + (x + 540) + "," + rise + " " + (x + 720) + ",75";
    }
    return d + " L2880,150 L0,150 Z";
  }

  var backD = wavePath(10, 140);
  var frontD = wavePath(134, 16);

  document.querySelectorAll(".tide__back").forEach(function (p) {
    p.setAttribute("d", backD);
  });
  document.querySelectorAll(".tide__front").forEach(function (p) {
    p.setAttribute("d", frontD);
  });

  // Faza të ndryshme për secilën valë, që të mos rrahin njësoj
  document.querySelectorAll(".tide").forEach(function (t, i) {
    var b = t.querySelectorAll(".tide__back");
    var f = t.querySelectorAll(".tide__front");
    b.forEach(function (el) { el.style.animationDelay = (-i * 4.3) + "s"; });
    f.forEach(function (el) { el.style.animationDelay = (-i * 2.7) + "s"; });
  });

  /* ---------------------------------------------------------------
     3b. Rryma që udhëton përgjatë linjave të diagramit
     --------------------------------------------------------------- */
  var lineGroup = document.getElementById("convLines");
  var convSvg = document.getElementById("conv");

  if (lineGroup && convSvg && !reduced) {
    // Një gjurmë drite mbi çdo linjë të tretë — jo mbi të gjitha,
    // përndryshe do të dukej si dekor e jo si rrjedhë.
    var all = lineGroup.querySelectorAll("line");
    for (var i = 0; i < all.length; i += 3) {
      var src = all[i];
      var flow = src.cloneNode(false);
      flow.setAttribute("class", "conv__flow");
      var len = src.style.getPropertyValue("--len") || 400;
      flow.style.setProperty("--len", len);
      flow.setAttribute("stroke-dasharray", (len * 0.22) + " " + len);
      flow.style.animationDelay = (i * 0.34).toFixed(2) + "s";
      lineGroup.appendChild(flow);
    }

    // Unaza që shpërndahet nga nyja
    var halo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    halo.setAttribute("class", "conv__halo");
    halo.setAttribute("cx", "330");
    halo.setAttribute("cy", "230");
    halo.setAttribute("r", "17");
    convSvg.appendChild(halo);
  }

  if (reduced) return;   // uji ndalet këtu

  /* ---------------------------------------------------------------
     2 + 3. Trazimi dhe treguesi
     Të dyja në të njëjtin cikël, që të mbeten të sinkronizuara.
     --------------------------------------------------------------- */
  var lastY = window.pageYOffset;
  var vel = 0;        // shpejtësi e zbutur
  var churn = 0;      // ajo që i jepet CSS-it

  var level = 0;      // ecuria e vërtetë 0..1
  var surf = 0;       // aty ku ndodhet vërtet sipërfaqja
  var surfVel = 0;

  var menL = document.getElementById("menL");
  var menR = document.getElementById("menR");

  function progress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    return max <= 0 ? 0 : Math.min(1, Math.max(0, window.pageYOffset / max));
  }

  window.addEventListener("scroll", function () {
    var y = window.pageYOffset;
    vel = Math.min(1, vel + Math.abs(y - lastY) / 210);
    lastY = y;
  }, { passive: true });

  (function tick() {
    // Trazimi ngrihet shpejt me lëvizjen dhe kullon ngadalë kur ndaloni
    vel *= 0.91;
    churn += (vel - churn) * 0.15;
    root.style.setProperty("--churn", churn.toFixed(3));

    // Sipërfaqja është sustë: e tejkalon nivelin dhe kthehet
    level = progress();
    surfVel = (surfVel + (level - surf) * 0.13) * 0.83;
    surf += surfVel;

    var pct = (Math.max(0, Math.min(1, surf)) * 50).toFixed(2) + "%";
    if (menL) menL.style.width = pct;
    if (menR) menR.style.width = pct;

    requestAnimationFrame(tick);
  })();

  /* ---------------------------------------------------------------
     4. Valëzimi te rreshtat aktivë
     --------------------------------------------------------------- */
  document.querySelectorAll(".row--live").forEach(function (row) {
    row.addEventListener("pointerenter", function (e) {
      var r = row.getBoundingClientRect();
      row.style.setProperty("--rip-x", (e.clientX - r.left) + "px");
      row.style.setProperty("--rip-y", (e.clientY - r.top) + "px");

      var rip = document.createElement("span");
      rip.className = "row__ripple";
      row.appendChild(rip);
      // forco rifillimin e animacionit
      void rip.offsetWidth;
      rip.classList.add("go");
      setTimeout(function () { rip.remove(); }, 1300);
    });
  });
})();
