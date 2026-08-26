/* =====================================================================
   ZONE GROUP — VIZUALIZIMI I KULLËS (sjellja)
   ---------------------------------------------------------------------
   Portuar nga ZONE_GROUP_tower.html, pa ndryshime në gjeometri apo në
   sekuencat e degëve. Dy dallime nga burimi, të dyja për izolim:

     · çdo kërkim në DOM niset nga #zone-animation-block
     · emrat e klasave dhe të @keyframes kanë prefiksin `zg-`

   Të gjitha koordinatat janë në hapësirën 1024 × 576 të renderit dhe
   pozicionimi bëhet në përqindje, prandaj blloku është plotësisht
   responsiv pa asnjë llogaritje gjatësie në JavaScript.
   ===================================================================== */

/* ═══════════════════════════════════════════════════════════════════
   ZONE GROUP — building animation system
   -------------------------------------------------------------------
   All coordinates are in the scene's own 1024 × 576 space, measured
   off the rendered building, so every overlay stays registered to the
   photograph at any viewport width.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";

  /* Every lookup below is rooted at the block, never at the document,
     so this script can only ever touch its own markup. If the block is
     absent the whole thing bails out and the page is unaffected. */
  var ROOT = document.getElementById("zone-animation-block");
  if (!ROOT) return;
  function q(sel) { return ROOT.querySelector(sel); }

  var scene = q(".zone-scene");
  var svg = q(".zone-animation-svg");
  var statusEl = q(".zone-status");
  if (!statusEl) return;
  var statusTxt = statusEl.querySelector("span");
  var statusDot = statusEl.querySelector("i");
  var core = q(".zone-core");
  var liftA = q(".zone-lift--a");
  var liftB = q(".zone-lift--b");
  if (!svg || !liftA) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ═══════════════════════════════════════════════════════════════
     ROOM LIGHT HARMONISATION
     -------------------------------------------------------------------
     Each entry is [x, y, w, h] in scene units and covers the glazing of
     the bays that are lit coolly despite belonging to a room that is
     otherwise warm — measured off the render, so each block starts and
     ends on a mullion and the correction has no visible edge.

     Grouped by room, they are:
       floors 6 and 5, left block   — the single bay at x 250
       floors 4, 2 and 1, left block — the three-bay room from x 250
       floor 6, right block          — the bay at x 669
       floors 5, 4 and 2, right block — the bay at x 717
     Everything in one entry gets one identical correction, so a room is
     never half-corrected.
     ═══════════════════════════════════════════════════════════════ */
  var RELIGHT = [
    [250,  52,  53, 35], [250,  98,  53, 36],
    [250, 145, 123, 37], [250, 241, 123, 35], [250, 288, 123, 35],
    [669,  53,  48, 36],
    [717, 100,  43, 35], [717, 147,  43, 36], [717, 243,  43, 35]
  ];
  (function harmoniseRooms() {
    var stageEl = q(".zone-stage");
    var img = q(".zone-scene__image");
    if (!stageEl || !img) return;
    var frag = document.createDocumentFragment();
    RELIGHT.forEach(function (r) {
      ["zone-relight--warm", "zone-relight--lift"].forEach(function (cls) {
        var b = document.createElement("span");
        b.className = "zone-relight " + cls;
        b.setAttribute("aria-hidden", "true");
        b.style.left   = (r[0] / 1024 * 100) + "%";
        b.style.top    = (r[1] / 576  * 100) + "%";
        b.style.width  = (r[2] / 1024 * 100) + "%";
        b.style.height = (r[3] / 576  * 100) + "%";
        frag.appendChild(b);
      });
    });
    /* appended last, but with z-index:auto — so they paint over the
       photograph and under the z-indexed animation and lift layers */
    stageEl.appendChild(frag);
  })();

  /* ───────────────────────── GEOMETRY ─────────────────────────
     Measured directly off the render in its own 1024 × 576 space.
     The two lift shafts were verified to occupy identical columns at
     the tower rows and at B1, so the core really is continuous here. */
  var G = {
    towerL: 142, towerR: 934,
    frameL: 146, frameR: 932,
    roof: 36,
    slabs: [44, 92, 139, 187, 235, 282, 331],

    /* floors[].y is the exact vertical centre of the lift door opening
       on that level, read off the render itself. The landings sit on a
       47.3 px pitch — the earlier 46 px pitch drifted a little further
       out of register on every floor down the tower, which is why cars
       used to berth slightly high or low. branch/slab are the glazing
       and spandrel lines used by the service runs. */
    floors: [
      { n: "6", y: 71,    slab: 44,  branch: 52 },
      { n: "5", y: 118.5, slab: 92,  branch: 98 },
      { n: "4", y: 165.5, slab: 139, branch: 145 },
      { n: "3", y: 212.5, slab: 187, branch: 193 },
      { n: "2", y: 260,   slab: 235, branch: 241 },
      { n: "1", y: 307.5, slab: 282, branch: 288 }
    ],
    lobbyTop: 335, lobbyBot: 401, grade: 402, lobbyMid: 378,
    b1: { ceil: 421, deck: 470, lane: 468, mid: 451 },
    b2: { ceil: 482, deck: 525, lane: 521, mid: 504 },
    pit: 537,

    /* the lift bank — identical columns top to bottom, measured from
       the lit cab openings in both shafts */
    coreL: 478, coreR: 614,
    shaftL: 484, shaftR: 610,
    liftAX: 486, liftBX: 550, liftW: 58, liftH: 42,
    stairL: 412, stairR: 478,

    /* vertical service zones: the dark bands flanking the lift bank,
       which run unbroken from the basement to the roof */
    riser: 616, riser2: 545,
    fiX: 470, fiLab: 466,

    /* window grid, two blocks either side of the core */
    winLx: 155, winLcols: 8, winLstep: 31.8,
    winRx: 620, winRcols: 8, winRstep: 39,
    winW: 30, winH: 35,

    /* ROOMS — the real interior compartments behind the glazing, taken
       from the structural bays. A room can span several panes, and every
       pane of one room must always be lit as a single unit: one colour
       temperature, one exposure, one opacity. Nothing lights a lone pane. */
    rooms: [
      [155, 95], [251, 51], [303, 70], [374, 35],
      [620, 48], [669, 47], [717, 43], [761, 35],
      [797, 39], [837, 33], [871, 60]
    ],
    /* the show apartment used by the Real Estate sequence — a whole room */
    unit: { x: 669, w: 47, floor: 2 },
    unitAlt: [[797, 39, 4], [251, 51, 3]],

    /* horizontal extents for floor service runs */
    wLeft: 188, wRight: 901,
    colX: [192, 337, 492, 592, 748, 892],
    footL: 103, footR: 974,

    /* basement technical rooms */
    mainLV: { x: 182, y: 488, w: 78, h: 34 },
    pumps:  { x: 278, y: 488, w: 62, h: 34 },
    server: { x: 700, y: 428, w: 78, h: 34 },
    plant:  { x: 700, y: 488, w: 86, h: 34 },

    /* main entrance. doorL/doorR are the glazed entrance bay; entry is
       the physical doorway opening inside it, measured off the render,
       which is what the automatic leaves have to fill exactly. */
    doorL: 484, doorR: 606, doorY: 362, doorH: 39,
    entry: { l: 507, r: 589, top: 362, bot: 401 },

    /* the two ramp mouths where the forecourt road turns down under the
       ground slab towards B1 */
    rampLx: 182, rampRx: 936,

    /* node anchor points used by the branch sequences */
    nA: 248, nB: 348, nC: 681, nD: 814, nE: 303, nF: 748
  };

  /* elevator stops, bottom to top */
  var STOPS = [
    { n: "B2", y: G.b2.mid }, { n: "B1", y: G.b1.mid }, { n: "G", y: G.lobbyMid }
  ];
  for (var fi = G.floors.length - 1; fi >= 0; fi--) {
    STOPS.push({ n: G.floors[fi].n, y: G.floors[fi].y });
  }
  var TOP = STOPS.length - 1;

  /* ───────────────────────── SVG HELPERS ───────────────────────── */
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    }
    (parent || svg).appendChild(n);
    return n;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }

  /* layer order matters: shaft behind, systems in front */
  var lyDefs  = el("defs", { "class": "ly-defs" });
  var lyShaft = el("g", { "class": "ly-shaft" });
  var lyPark  = el("g", { "class": "ly-park" });

  /* ── ROAD OCCLUSION MASK ──────────────────────────────────────────
     The car is a real object in the building, so the building has to be
     able to hide it. This mask blanks the structures it drives behind —
     the two ramp heads and the columns and core along the B1 aisle. It
     also clips anything outside the 1024×576 scene, so the car can never
     be seen waiting off the edge of the photograph. Everything is in
     scene units, so it scales with the overlay. */
  var roadMask = el("mask", {
    id: "zg-road-mask", maskUnits: "userSpaceOnUse",
    x: 0, y: 0, width: 1024, height: 576
  }, lyDefs);
  el("rect", { x: 0, y: 0, width: 1024, height: 576, fill: "#fff" }, roadMask);

  /* ── the structures the car passes BEHIND ──────────────────────────
     One block per marked area, measured off the reference: the ramp
     head the car comes out from at Point 1, the four B1 columns, the
     lift-and-stair core, and the ramp head it leaves through at
     Point 2. The car is hidden completely for the width of each of
     these and picks up again the moment it clears them, so the drive
     reads as one continuous pass behind real concrete. In scene units,
     so the occlusion stays registered at any viewport size. */
  [
    [ 58, 372,  78,  50],   /* Point 1 — left ramp head */
    [260, 421,  24,  51],   /* column */
    [295, 421,  17,  44],   /* column */
    [384, 421,  17,  51],   /* column */
    [416, 421, 203,  53],   /* lift + stair core */
    [688, 423,  21,  51],   /* column */
    [831, 425,  22,  50],   /* column */
    [908, 360, 124,  64]    /* Point 2 — right ramp head */
  ].forEach(function (o) {
    el("rect", { x: o[0], y: o[1], width: o[2], height: o[3], fill: "#000" }, roadMask);
  });

  var lyCars  = el("g", { "class": "ly-cars", mask: "url(#zg-road-mask)" });
  var lyPeople = el("g", { "class": "ly-people", mask: "url(#zg-road-mask)" });
  var lyFI    = el("g", { "class": "ly-fi" });
  var lyExit  = el("g", { "class": "ly-exit" });   /* the branch on its way out */
  var lyKeep  = el("g", { "class": "ly-keep" });   /* persistent branch state */
  var lyAnim  = el("g", { "class": "ly-anim" });   /* temporary branch content */

  /* ───────────────────────── TIMERS & TWEENS ─────────────────────────
     A single session token invalidates every delayed callback from a
     previous branch, so rapid switching can never leave a stray
     sequence running.                                                  */
  var token = 0;
  var bTimers = [];
  var bTweens = [];
  var aTweens = [];

  function after(ms, fn) {
    /* With reduced motion the sequence still has to run in order, but it
       must land on its finished state almost immediately rather than
       playing a six-second journey. Scaling preserves ordering. */
    if (reduce) ms = ms * 0.045;
    var my = token;
    var id = setTimeout(function () { if (my === token) fn(); }, ms);
    bTimers.push(id);
    return id;
  }

  var running = [];
  function tick(now) {
    for (var i = running.length - 1; i >= 0; i--) {
      var t = running[i];
      if (t.dead) { running.splice(i, 1); continue; }
      if (t.start == null) t.start = now + (t.delay || 0);
      if (now < t.start) continue;
      var p = t.dur <= 0 ? 1 : Math.min(1, (now - t.start) / t.dur);
      t.on(t.ease ? t.ease(p) : p, p);
      if (p >= 1) { t.dead = true; running.splice(i, 1); if (t.done) t.done(); }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  function tween(o) {
    /* with reduced motion every tween still runs, but effectively
       instantly, so the finished state appears without the journey */
    if (reduce && o.dur) o.dur = Math.max(1, o.dur * 0.04);
    o.start = null; o.dead = false;
    running.push(o);
    (o.amb ? aTweens : bTweens).push(o);
    return o;
  }
  function killList(list) {
    /* A tween that is torn down mid-flight gets one last word. An
       elevator interrupted half way between two landings has to be put
       back onto a real landing, otherwise the cab is left hanging in
       the shaft between floors — which is exactly what used to happen
       when a branch was switched during a ride. */
    list.forEach(function (t) {
      if (t.dead) return;
      t.dead = true;
      if (t.cancel) { try { t.cancel(); } catch (e) {} }
    });
    list.length = 0;
  }

  var ease = {
    out:  function (p) { return 1 - Math.pow(1 - p, 3); },
    in:   function (p) { return p * p * p; },
    both: function (p) { return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; },
    lin:  function (p) { return p; },
    /* elevator profile: gentle start, cruise, gentle stop */
    lift: function (p) { return p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; },
    /* water is heavy: eased at both ends, never snappy */
    water: function (p) { return p * p * (3 - 2 * p); },
    /* mechanical travel: slow start, slow stop */
    mech: function (p) { return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  };

  /* ═══════════════════════════════════════════════════════════════
     MOTION SIGNATURES
     -------------------------------------------------------------------
     Fourteen different systems were all moving on one curve, which made
     them read as fourteen versions of the same thing. Each branch now
     has its own physics, and every line and node it draws inherits it:

       curve  the timing function runs are drawn with
       k      duration multiplier — how quick or how laboured
       pop    the curve nodes arrive on
       popDur how long that arrival takes

     Electricity gets there before you see it move and overshoots.
     Water is heavy and never snaps. Packets are staccato — short bursts
     with dead air between. Concrete is reluctant. Alarms do not ease.
     ═══════════════════════════════════════════════════════════════ */
  var SIG_DEF = { curve: "cubic-bezier(.4,0,.2,1)", k: 1, pop: "cubic-bezier(.3,1.5,.5,1)", popDur: .5 };
  var SIG = [
    /*  0 construction  */ { curve: "cubic-bezier(.7,0,.3,1)",     k: 1.35, pop: "cubic-bezier(.34,1.12,.64,1)", popDur: .64 },
    /*  1 electrical    */ { curve: "cubic-bezier(.12,.9,.2,1)",   k: .62,  pop: "cubic-bezier(.2,1.85,.4,1)",   popDur: .36 },
    /*  2 bldg systems  */ { curve: "cubic-bezier(.45,0,.25,1)",   k: 1.00, pop: "cubic-bezier(.3,1.4,.5,1)",    popDur: .50 },
    /*  3 sanitary      */ { curve: "cubic-bezier(.55,.06,.35,1)", k: 1.50, pop: "cubic-bezier(.4,1.04,.6,1)",   popDur: .72 },
    /*  4 elevators     */ { curve: "cubic-bezier(.5,0,.3,1)",     k: 1.15, pop: "cubic-bezier(.3,1.3,.55,1)",   popDur: .55 },
    /*  5 telecom       */ { curve: "cubic-bezier(.05,.85,.15,1)", k: .55,  pop: "cubic-bezier(.2,1.95,.45,1)",  popDur: .32 },
    /*  6 BMS           */ { curve: "cubic-bezier(.4,0,.2,1)",     k: 1.05, pop: "cubic-bezier(.3,1.4,.5,1)",    popDur: .50 },
    /*  7 software      */ { curve: "cubic-bezier(.08,.8,.2,1)",   k: .60,  pop: "cubic-bezier(.2,1.8,.45,1)",   popDur: .34 },
    /*  8 security      */ { curve: "cubic-bezier(.3,0,.15,1)",    k: .80,  pop: "cubic-bezier(.25,1.6,.5,1)",   popDur: .42 },
    /*  9 fire          */ { curve: "cubic-bezier(.2,0,.05,1)",    k: .50,  pop: "cubic-bezier(.15,2,.4,1)",     popDur: .28 },
    /* 10 facility      */ { curve: "cubic-bezier(.42,0,.3,1)",    k: 1.20, pop: "cubic-bezier(.32,1.22,.55,1)", popDur: .60 },
    /* 11 investments   */ { curve: "cubic-bezier(.38,0,.2,1)",    k: 1.00, pop: "cubic-bezier(.3,1.35,.5,1)",   popDur: .50 },
    /* 12 trading       */ { curve: "cubic-bezier(.25,0,.2,1)",    k: .78,  pop: "cubic-bezier(.25,1.55,.5,1)",  popDur: .44 },
    /* 13 real estate   */ { curve: "cubic-bezier(.5,0,.25,1)",    k: 1.25, pop: "cubic-bezier(.35,1.18,.6,1)",  popDur: .62 }
  ];
  var sig = SIG_DEF;                       /* the signature now in force */

  /* ───────────────────────── DRAWING PRIMITIVES ───────────────────────── */

  /* a line that draws itself on */
  function draw(d, o) {
    o = o || {};
    var p = el("path", {
      d: d, fill: "none", stroke: o.color || "#fff",
      "stroke-width": o.w || 1.2, "stroke-linecap": o.cap || "round",
      "stroke-linejoin": "round", opacity: o.opacity == null ? 1 : o.opacity,
      "stroke-dasharray": o.dash || null
    }, o.parent || lyAnim);
    /* tagged so the outgoing branch can retract its runs along their own
       geometry instead of simply vanishing */
    p.setAttribute("data-run", "1");
    if (reduce || o.instant) return p;
    var L = p.getTotalLength() || 1;
    p.style.strokeDasharray = L;
    p.style.strokeDashoffset = L;
    /* the branch's own physics, unless the caller pins it with raw:true */
    var dd = (o.dur || .9) * (o.raw ? 1 : sig.k);
    p.style.transition = "stroke-dashoffset " + dd.toFixed(3) + "s " + sig.curve + " " +
                         (o.delay || 0) + "s, opacity .45s ease " + (o.delay || 0) + "s";
    requestAnimationFrame(function () { p.style.strokeDashoffset = 0; });
    return p;
  }

  /* a bright packet travelling along a path */
  function zap(d, o) {
    o = o || {};
    if (reduce) return null;
    var p = el("path", {
      "class": "zg-zap", d: d, stroke: o.color || "#fff",
      "stroke-width": o.w || 2.6, opacity: o.opacity == null ? .95 : o.opacity
    }, o.parent || lyAnim);
    var L = p.getTotalLength() || 1;
    var seg = o.len || 26;
    p.style.strokeDasharray = seg + " " + (L + seg);
    p.style.setProperty("--L2", (L + seg));
    p.style.strokeDashoffset = (L + seg);
    var zd = (o.dur || 1.5) * (o.raw ? 1 : sig.k);
    p.style.animation = "zg-zapFlow " + zd.toFixed(3) + "s " + (o.timing || "linear") +
                        " " + (o.delay || 0) + "s " + (o.repeat || 1) +
                        " " + (o.reverse ? "reverse" : "normal") + " both";
    if (o.repeat !== "infinite") {
      var life = ((o.delay || 0) + zd * (o.repeat || 1)) * 1000 + 90;
      after(life, function () { if (p.parentNode) p.parentNode.removeChild(p); });
    }
    return p;
  }

  /* small system node */
  function node(x, y, o) {
    o = o || {};
    var c = el("circle", {
      "class": o.live ? "zg-node zg-node--live" : "zg-node",
      cx: x, cy: y, r: o.r || 2.6,
      fill: o.fill || o.color || "#fff",
      opacity: o.opacity == null ? .92 : o.opacity
    }, o.parent || lyAnim);
    if (!reduce) {
      /* a live node runs two animations — the arrival pop and the slow
         breathe — so every timing property has to carry both values, or
         the breathe inherits the pop's duration and starts strobing */
      if (o.live) {
        c.style.animationDuration = sig.popDur + "s, 2.6s";
        c.style.animationTimingFunction = sig.pop + ", ease-in-out";
        if (o.delay) c.style.animationDelay = o.delay + "s, " + (o.delay + 1) + "s";
      } else {
        c.style.animationDuration = sig.popDur + "s";
        c.style.animationTimingFunction = sig.pop;
        if (o.delay) c.style.animationDelay = o.delay + "s";
      }
    }
    if (o.halo) {
      el("circle", {
        cx: x, cy: y, r: (o.r || 2.6) + 3.4, fill: "none",
        stroke: o.color || "#fff", "stroke-width": .8, opacity: .3
      }, o.parent || lyAnim);
    }
    return c;
  }

  /* lit window cell */
  function win(x, y, o) {
    o = o || {};
    var r = el("rect", {
      "class": "zg-win", x: x, y: y, width: o.w || G.winW, height: o.h || G.winH,
      fill: o.color || "rgba(255,214,150,.5)", opacity: 0
    }, o.parent || lyAnim);
    r.style.setProperty("--o", o.o == null ? .62 : o.o);
    if (reduce) { r.style.opacity = o.o == null ? .62 : o.o; r.style.animation = "none"; }
    else if (o.delay) r.style.animationDelay = o.delay + "s";
    return r;
  }

  /* every room on a floor.
     One rect per ROOM, not per pane: a room that is two or three bays
     wide is lit by a single element, so its colour temperature, opacity
     and fade-in are identical right across it. Two panes of the same
     interior can never end up on different lighting states. */
  function floorWindows(f, o) {
    o = o || {};
    var out = [];
    G.rooms.forEach(function (rm, i) {
      out.push(win(rm[0], f.branch, {
        color: o.color, o: o.o, w: rm[1], h: o.h || G.winH,
        delay: (o.delay || 0) + i * (o.stagger || 0), parent: o.parent
      }));
    });
    return out;
  }

  /* horizontal service branch across a floor, both directions from the riser */
  function branchRun(f, o) {
    o = o || {};
    var x = o.x || G.riser;
    draw("M" + x + " " + f.branch + " H " + (o.left || 196), o);
    draw("M" + x + " " + f.branch + " H " + (o.right || 838), o);
  }

  function rect(x, y, w, h, o) {
    o = o || {};
    return el("rect", {
      x: x, y: y, width: w, height: h, rx: o.rx || 0,
      fill: o.fill || "none", stroke: o.color || null,
      "stroke-width": o.w || 1, opacity: o.opacity == null ? 1 : o.opacity
    }, o.parent || lyAnim);
  }

  function status(text, color) {
    /* Anchored at the end, because several of the new wordings contain a
       terminal word inside a mid-sequence one: "AKTIVIZOHET" contains
       "AKTIV", "PËRGATITET" contains "GATI". Without the anchor a branch
       would report itself finished on its first beat. */
    var done = /(?:ONLINE|RREGULLT|KONTROLL|KONSOLIDUAR|PREZANTIM|PËRFUNDUAR|OPERIM|FUNKSION|OPTIMIZUAR|AKTIV)$/.test(text);
    statusEl.classList.toggle("zone-status--busy", !done);
    statusTxt.textContent = text;
    statusDot.style.background = color || "#9ed8ef";
    statusDot.style.boxShadow = "0 0 9px " + (color || "#9ed8ef");
    statusEl.style.borderColor = color ? "color-mix(in srgb," + color + " 34%,transparent)" : "";
  }

  /* ═══════════════════════════════════════════════════════════════
     PHASE 1A — CONTINUOUS ELEVATOR SHAFT, B2 → ROOF
     The shaft is drawn as one uninterrupted vertical element that
     passes straight through the lobby band, so the tower and the
     basement read as a single structure rather than two pictures.
     ═══════════════════════════════════════════════════════════════ */
  (function buildShaft() {
    var top = G.slabs[0] - 4, bot = G.pit;

    var defs = el("defs", null, lyShaft);
    /* warm, like the lit cabs in the basement — not a cold technical overlay */
    var lg = el("linearGradient", { id: "zg-shaft", x1: "0", y1: "0", x2: "1", y2: "0" }, defs);
    el("stop", { offset: "0",   "stop-color": "#f0d6a8", "stop-opacity": "0" }, lg);
    el("stop", { offset: ".5",  "stop-color": "#f6e2be", "stop-opacity": ".055" }, lg);
    el("stop", { offset: "1",   "stop-color": "#f0d6a8", "stop-opacity": "0" }, lg);

    el("rect", {
      x: G.shaftL, y: top, width: G.shaftR - G.shaftL, height: bot - top,
      fill: "url(#zg-shaft)"
    }, lyShaft);

    /* shaft edges: the line that proves continuity through Ground.
       Kept faint so the concrete reads first and the line second. */
    [G.shaftL, G.shaftR].forEach(function (x) {
      el("line", {
        x1: x, y1: top, x2: x, y2: bot,
        stroke: "rgba(232,206,166,.16)", "stroke-width": .8
      }, lyShaft);
    });

    /* the shaft crosses the lobby: lift that short span only, so the eye
       follows it down instead of stopping at the ground slab */
    el("rect", {
      x: G.shaftL, y: G.lobbyTop, width: G.shaftR - G.shaftL, height: G.grade - G.lobbyTop,
      fill: "rgba(246,226,190,.055)"
    }, lyShaft);

    /* landing sills, only at the stops that actually have doors */
    STOPS.forEach(function (s) {
      el("line", {
        x1: G.shaftL + 1, y1: s.y + G.liftH / 2 + 2, x2: G.shaftR - 1, y2: s.y + G.liftH / 2 + 2,
        stroke: "rgba(232,206,166,.10)", "stroke-width": .7
      }, lyShaft);
    });

    /* pit and overrun, so the shaft terminates in structure */
    el("line", { x1: G.shaftL - 3, y1: bot, x2: G.shaftR + 3, y2: bot,
      stroke: "rgba(232,206,166,.24)", "stroke-width": 1.1 }, lyShaft);
    el("line", { x1: G.shaftL - 3, y1: top, x2: G.shaftR + 3, y2: top,
      stroke: "rgba(232,206,166,.20)", "stroke-width": 1 }, lyShaft);
  })();

  /* ═══════════════════════════════════════════════════════════════
     PHASE 1C — FLOOR INDICATORS
     Understated markers integrated into the shaft edge, not a panel.
     ═══════════════════════════════════════════════════════════════ */
  var FI = STOPS.map(function (s) {
    var y = s.y + 1;
    var dot = el("circle", {
      "class": "zg-fi-dot", cx: G.fiX, cy: y, r: 1.2,
      fill: "#e8c89a", opacity: .13
    }, lyFI);
    var lab = el("text", {
      "class": "zg-fi-lab", x: G.fiLab, y: y + 1.9, "text-anchor": "end",
      fill: "#e8c89a", opacity: .14
    }, lyFI);
    lab.textContent = s.n;
    return { dot: dot, lab: lab, y: s.y, n: s.n };
  });

  function fiFlash(i, hold, color) {
    if (i < 0 || i >= FI.length) return;
    var f = FI[i];
    f.dot.setAttribute("fill", color || "#cfe9f5");
    f.lab.setAttribute("fill", color || "#cfe9f5");
    f.dot.style.opacity = 1;
    f.dot.setAttribute("r", 2.1);
    f.lab.style.opacity = .95;
    after(hold || 320, function () {
      f.dot.style.opacity = .13;
      f.dot.setAttribute("r", 1.2);
      f.lab.style.opacity = .14;
      f.dot.setAttribute("fill", "#e8c89a");
      f.lab.setAttribute("fill", "#e8c89a");
    });
  }

  /* door-opening light at a stop */
  function doorLight(x, stopIdx, color, life) {
    var y = STOPS[stopIdx].y;
    var g = el("g", null, lyPark);
    var r = el("rect", {
      x: x, y: y - G.liftH / 2, width: G.liftW, height: G.liftH,
      fill: color || "rgba(255,226,176,.34)"
    }, g);
    r.style.transition = "opacity .3s ease";
    r.style.opacity = 0;
    requestAnimationFrame(function () { r.style.opacity = 1; });
    after(life || 900, function () {
      r.style.opacity = 0;
      after(360, function () { if (g.parentNode) g.parentNode.removeChild(g); });
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     PHASE 1B/1C — ELEVATOR CARS
     The original .zone-lift elements are kept and restyled; their CSS
     keyframes are dropped so JavaScript can drive them across the full
     B2 → roof range and keep the indicators honest.
     ═══════════════════════════════════════════════════════════════ */
  function pct(v, total) { return (v / total * 100) + "%"; }

  core.style.left = pct(G.coreL, 1024);
  core.style.width = pct(G.coreR - G.coreL, 1024);
  core.style.top = pct(G.slabs[0] - 6, 576);
  core.style.height = pct(G.pit - G.slabs[0] + 6, 576);
  core.style.overflow = "visible";

  var CORE_TOP = G.slabs[0] - 6;
  var CORE_H = G.pit - CORE_TOP;

  function setupCar(node, x) {
    node.style.animation = "none";
    node.style.left = ((x - G.coreL) / (G.coreR - G.coreL) * 100) + "%";
    node.style.width = (G.liftW / (G.coreR - G.coreL) * 100) + "%";
    node.style.height = (G.liftH / CORE_H * 100) + "%";
    return { el: node, x: x, at: 0, moving: false };
  }
  var CARS = [setupCar(liftA, G.liftAX), setupCar(liftB, G.liftBX)];

  /* The only two ways a cab is ever positioned.
     placeCar() takes a stop INDEX and is the single source of truth for
     a berthed car: the cab centre is put on STOPS[i].y, which is the
     measured centre of that level's door opening, so a berthed cab is
     aligned with its landing by construction. placeCarY() is used only
     while travelling. Nothing else writes .top. */
  function placeCar(car, stopIdx) {
    stopIdx = Math.max(0, Math.min(TOP, stopIdx | 0));
    var y = STOPS[stopIdx].y - G.liftH / 2;
    car.el.style.top = ((y - CORE_TOP) / CORE_H * 100) + "%";
    car.at = stopIdx;
    car.y = STOPS[stopIdx].y;
  }
  function placeCarY(car, y) {
    car.y = y;
    car.el.style.top = ((y - G.liftH / 2 - CORE_TOP) / CORE_H * 100) + "%";
  }
  /* nearest legal landing to a height — used when a ride is interrupted */
  function nearestStop(y) {
    var best = 0, bd = Infinity;
    for (var i = 0; i < STOPS.length; i++) {
      var d = Math.abs(STOPS[i].y - y);
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }

  /* travel between stops, lighting each indicator on the way past */
  function ride(car, to, opts, done) {
    opts = opts || {};
    to = Math.max(0, Math.min(TOP, to | 0));
    if (to === car.at) { if (done) done(); return; }
    var fromY = STOPS[car.at].y, toY = STOPS[to].y;
    var dist = Math.abs(to - car.at);
    var dur = opts.dur || Math.min(4200, 620 + dist * 300);
    var dir = to > car.at ? 1 : -1;
    var passed = {};
    car.moving = true;

    if (reduce) {
      placeCar(car, to); car.moving = false;
      fiFlash(to, 900, opts.color);
      if (done) done();
      return;
    }

    var rideTween = tween({
      dur: dur, ease: ease.lift, amb: opts.amb,
      /* if this ride is torn down — a branch switch, an ambient pause —
         the cab settles onto the landing it was closest to instead of
         being abandoned between floors */
      cancel: function () {
        car.moving = false;
        placeCar(car, nearestStop(car.y == null ? toY : car.y));
        car.el.classList.remove("zone-lift--stop");
      },
      on: function (t) {
        var y = fromY + (toY - fromY) * t;
        placeCarY(car, y);
        for (var i = 0; i < STOPS.length; i++) {
          if (passed[i]) continue;
          var sy = STOPS[i].y;
          if ((dir > 0 && sy >= y - 3 && i > car.at) || (dir < 0 && sy <= y + 3 && i < car.at)) {
            if (Math.abs(sy - y) < 14) { passed[i] = 1; fiFlash(i, 300, opts.color); }
          }
        }
      },
      done: function () {
        placeCar(car, to);                 /* snap to the exact landing */
        car.moving = false;
        fiFlash(to, opts.hold || 1100, opts.color);
        /* arrival: the cab brightens, doors dwell, then it dims again */
        car.el.classList.add("zone-lift--stop");
        after((opts.doorLife || 800) + 220, function () {
          car.el.classList.remove("zone-lift--stop");
        });
        if (opts.doors !== false) doorLight(car.x, to, opts.doorColor, opts.doorLife || 800);
        if (done) done();
      }
    });
  }

  placeCar(CARS[0], Math.min(5, TOP));
  placeCar(CARS[1], 2);

  /* ═══════════════════════════════════════════════════════════════
     PHASE 1 — UNDERGROUND VEHICLES
     Real silhouettes with attached lighting, moving along the actual
     circulation lanes of B1 and B2. Never more than one at a time.
     ═══════════════════════════════════════════════════════════════ */
  function makeCar(parent) {
    var g = el("g", { opacity: 0 }, parent);
    var uid = Math.random().toString(36).slice(2, 7);
    var HL = "zg-hl-" + uid, BODY = "zg-bd-" + uid, GLS = "zg-gl-" + uid,
        RFL = "zg-rf-" + uid;

    var defs = el("defs", null, g);

    /* headlight falloff, so the beam reads as light rather than a shape */
    var lg = el("linearGradient", { id: HL, x1: "0", y1: "0", x2: "1", y2: "0" }, defs);
    el("stop", { offset: "0",   "stop-color": "#ffeec6", "stop-opacity": ".50" }, lg);
    el("stop", { offset: ".40", "stop-color": "#ffdda2", "stop-opacity": ".21" }, lg);
    el("stop", { offset: "1",   "stop-color": "#ffd190", "stop-opacity": "0" }, lg);

    /* bodywork: the garage downlights catch the shoulder, the flank falls
       away below it and the sill is almost black — that vertical fall-off
       is most of what makes a small silhouette read as a solid object */
    var bg = el("linearGradient", { id: BODY, x1: "0", y1: "0", x2: "0", y2: "1" }, defs);
    el("stop", { offset: "0",   "stop-color": "#4f4a42" }, bg);
    el("stop", { offset: ".22", "stop-color": "#34322e" }, bg);
    el("stop", { offset: ".55", "stop-color": "#1e2023" }, bg);
    el("stop", { offset: ".82", "stop-color": "#121417" }, bg);
    el("stop", { offset: "1",   "stop-color": "#090b0d" }, bg);

    /* glass is darker at the top and picks the room up along the base */
    var gl = el("linearGradient", { id: GLS, x1: "0", y1: "0", x2: "0", y2: "1" }, defs);
    el("stop", { offset: "0",   "stop-color": "#0b0f12", "stop-opacity": ".86" }, gl);
    el("stop", { offset: ".62", "stop-color": "#2b2e30", "stop-opacity": ".60" }, gl);
    el("stop", { offset: "1",   "stop-color": "#8a7f6a", "stop-opacity": ".40" }, gl);

    /* the reflection in the polished slab, fading out as it drops away */
    var rf = el("linearGradient", { id: RFL, x1: "0", y1: "0", x2: "0", y2: "1" }, defs);
    el("stop", { offset: "0",   "stop-color": "#6b6152", "stop-opacity": ".30" }, rf);
    el("stop", { offset: ".45", "stop-color": "#433d34", "stop-opacity": ".12" }, rf);
    el("stop", { offset: "1",   "stop-color": "#2b2721", "stop-opacity": "0" }, rf);

    /* ── light the car throws ────────────────────────────────────── */
    var pool = el("ellipse", { cx: 56, cy: 15.8, rx: 23, ry: 4.0, fill: "url(#" + HL + ")" }, g);
    var beam = el("path", { d: "M40 9.6 L76 4.0 L76 16.2 L40 13.4 Z", fill: "url(#" + HL + ")" }, g);

    /* ── reflection first, then the shell straight over it ─────────
       The body silhouette mirrored about the contact line at y = 16.05
       and filled with a gradient that dies away within a couple of
       units, which is what a wet-looking concrete slab actually does
       with a car standing on it. */
    el("path", {
      d: "M1.8 17.9 L1.6 21.4 Q1.7 23.2 3.3 23.6 L10.9 24.3 L16.4 28.3 " +
         "Q17.3 28.9 19.3 28.95 L26.6 29.0 Q28.5 28.95 29.3 28.15 L33.2 23.7 " +
         "L38.6 22.9 Q40.7 22.4 40.9 20.7 L41.0 17.9 " +
         "L36.2 17.9 Q32 22.7 27.8 17.9 L15.2 17.9 Q11 22.7 6.8 17.9 Z",
      fill: "url(#" + RFL + ")"
    }, g);
    /* the two lamps smear furthest down the slab */
    el("ellipse", { cx: 40.0, cy: 19.6, rx: 2.6, ry: 3.4, fill: "rgba(255,238,196,.20)" }, g);
    el("ellipse", { cx:  2.3, cy: 19.9, rx: 2.2, ry: 3.0, fill: "rgba(236,86,64,.16)" }, g);
    /* contact shadow — the car is sitting on the slab, not floating */
    el("ellipse", { cx: 21, cy: 16.1, rx: 20.5, ry: 2.5, fill: "rgba(0,0,0,.50)" }, g);
    el("ellipse", { cx: 21, cy: 15.9, rx: 14, ry: 1.5, fill: "rgba(0,0,0,.38)" }, g);

    /* ── the shell ──────────────────────────────────────────────── */
    var shell = el("g", null, g);

    /* body: bonnet, raked screen, cabin, short boot, arches cut over the
       wheels — the arches are what stop it reading as a slab */
    el("path", {
      d: "M1.8 14.2 L1.6 10.7 Q1.7 8.9 3.3 8.5 L10.9 7.8 L16.4 3.8 " +
         "Q17.3 3.2 19.3 3.15 L26.6 3.1 Q28.5 3.15 29.3 3.95 L33.2 8.4 " +
         "L38.6 9.2 Q40.7 9.7 40.9 11.4 L41.0 14.2 " +
         "L36.2 14.2 Q32 9.4 27.8 14.2 L15.2 14.2 Q11 9.4 6.8 14.2 Z",
      fill: "url(#" + BODY + ")", stroke: "rgba(228,198,152,.26)", "stroke-width": .45
    }, shell);
    /* roof and shoulder — the two highlights that give it volume */
    el("path", { d: "M16.9 3.7 Q17.9 3.1 19.6 3.05 L26.5 3.0 Q28.3 3.05 29.1 3.8",
                 fill: "none", stroke: "rgba(255,230,184,.62)", "stroke-width": .65 }, shell);
    el("path", { d: "M3.6 9.6 L11.4 8.9 L33.0 8.9 L39.4 9.9", fill: "none",
                 stroke: "rgba(240,214,168,.24)", "stroke-width": .5 }, shell);
    el("path", { d: "M4.6 12.9 L38.0 12.9", fill: "none",
                 stroke: "rgba(180,158,126,.14)", "stroke-width": .45 }, shell);
    /* glazing, split by the B-pillar, with a door shut line below it */
    el("path", { d: "M23.4 3.45 L23.4 8.1 L32.2 8.2 L28.8 4.05 Q28.2 3.5 26.9 3.45 Z",
                 fill: "url(#" + GLS + ")" }, shell);
    el("path", { d: "M22.5 3.5 L19.4 3.5 Q17.8 3.55 17.2 4.05 L12.4 7.95 L22.5 8.05 Z",
                 fill: "url(#" + GLS + ")" }, shell);
    el("path", { d: "M22.9 3.5 L22.9 8.1", fill: "none",
                 stroke: "rgba(226,206,172,.36)", "stroke-width": .45 }, shell);
    el("path", { d: "M21.8 9.1 L21.8 13.6", fill: "none",
                 stroke: "rgba(184,164,134,.20)", "stroke-width": .4 }, shell);
    el("path", { d: "M19.2 10.0 L21.0 10.0", fill: "none",
                 stroke: "rgba(232,210,172,.38)", "stroke-width": .5 }, shell);
    /* wheel arch lips */
    el("path", { d: "M27.9 14.1 Q32 9.7 36.1 14.1", fill: "none",
                 stroke: "rgba(198,174,140,.26)", "stroke-width": .5 }, shell);
    el("path", { d: "M6.9 14.1 Q11 9.7 15.1 14.1", fill: "none",
                 stroke: "rgba(198,174,140,.26)", "stroke-width": .5 }, shell);
    /* front grille and the lamp clusters */
    el("path", { d: "M39.4 11.6 L40.9 11.7", fill: "none",
                 stroke: "rgba(150,132,108,.45)", "stroke-width": .65 }, shell);

    /* wheels: tyre, rim and a spoke cross that actually turns */
    function wheel(cx) {
      var w = el("g", null, shell);
      el("circle", { cx: cx, cy: 12.9, r: 3.3, fill: "#05090c",
                     stroke: "rgba(186,164,132,.34)", "stroke-width": .5 }, w);
      var rim = el("g", null, w);
      el("circle", { cx: cx, cy: 12.9, r: 1.85, fill: "#15161a",
                     stroke: "rgba(216,196,160,.46)", "stroke-width": .45 }, rim);
      el("path", { d: "M" + (cx - 1.6) + " 12.9 H" + (cx + 1.6) +
                     " M" + cx + " 11.3 V14.5" +
                     " M" + (cx - 1.15) + " 11.75 L" + (cx + 1.15) + " 14.05" +
                     " M" + (cx - 1.15) + " 14.05 L" + (cx + 1.15) + " 11.75",
                   fill: "none", stroke: "rgba(212,194,162,.38)", "stroke-width": .36 }, rim);
      el("circle", { cx: cx, cy: 12.9, r: .5, fill: "rgba(226,208,176,.62)" }, rim);
      return { rim: rim, cx: cx };
    }
    var wf = wheel(32), wr = wheel(11);

    /* lamps sit above the shell so they are never dimmed by it */
    el("ellipse", { cx: 40.0, cy: 10.7, rx: 1.9, ry: 1.25, fill: "rgba(255,248,228,.98)" }, g);
    el("ellipse", { cx: 40.0, cy: 10.7, rx: 4.2, ry: 2.9, fill: "rgba(255,238,196,.26)" }, g);
    var tail = el("ellipse", { cx: 2.3, cy: 10.4, rx: 1.7, ry: 1.2, fill: "rgba(240,96,72,.88)" }, g);
    var tailGlow = el("ellipse", { cx: 2.3, cy: 10.4, rx: 3.4, ry: 2.3, fill: "rgba(236,86,64,.20)" }, g);

    /* the rolling road: wheel angle follows distance actually covered, at
       a radius of 3.3 units — about 0.3 m once the car is placed in the
       scene, which is a real wheel, so the spin rate matches the speed */
    function spin(distLocal) {
      var a = distLocal / 3.3 * 57.2958;
      wf.rim.setAttribute("transform", "rotate(" + a.toFixed(1) + " " + wf.cx + " 12.9)");
      wr.rim.setAttribute("transform", "rotate(" + a.toFixed(1) + " " + wr.cx + " 12.9)");
    }

    return { g: g, beam: beam, pool: pool, tail: tail, tailGlow: tailGlow,
             spin: spin, w: 41 };
  }

  var carPool = [makeCar(lyCars)];
  var ambientOn = true;
  var ambientTimer = null;

  /* ═══════════════════════════════════════════════════════════════
     THE UNDERGROUND TRANSIT — POINT 1 → POINT 2
     -------------------------------------------------------------------
     One vehicle, one continuous run. It comes down the left-hand ramp
     out of Point 1, drops onto the B1 aisle, tracks that aisle the whole
     width of the basement and climbs away up the right-hand ramp into
     Point 2. It passes behind each marked structure on the way and comes
     straight back out the far side — the drive itself never stops or
     restarts, only the view of it is interrupted.

     The control points are sampled directly off the marked green path:
     Both ends are curves, not straight runs. The car leaves Point 1
     still travelling LEFT, sweeps round the bottom of the near ramp and
     comes back out to the right — a C opening to the right. It then
     tracks the aisle, sagging to y≈465 around x≈196, easing up to
     y≈453.5 through the middle of the deck and back down to y≈463.5 near
     x≈840. At the far end it climbs the second ramp, turns at x≈998 and
     runs back to the LEFT into Point 2 — the same C, mirrored. Both
     reversals are read off the path itself, so the body swings through
     each of them rather than snapping round.

     They become one Catmull-Rom spline and the car is placed with
     getPointAtLength(), so it never leaves the road surface.

     Everything is in scene units, so the drive stays registered to the
     architecture at any viewport size and through the camera move.
     ═══════════════════════════════════════════════════════════════ */
  var ROUTE_PTS = [
    /* Point 1 — dropping out of the ramp head, still travelling LEFT */
    [ 100, 406  ], [  97, 412  ], [  92, 419  ],
    /* the C: round the bottom of the ramp and back out to the right */
    [  86, 427  ], [  82, 436  ], [  86, 443  ], [  95, 447.5],
    /* onto the B1 aisle */
    [ 107, 453  ], [ 119, 456.8], [ 131, 459.6], [ 143, 461.6], [ 155, 463.1],
    [ 167, 464.4], [ 185, 464.9], [ 197, 464.9], [ 209, 464.2], [ 221, 463.1],
    [ 236, 461.5], [ 256, 458.5], [ 280, 456.5], [ 312, 456.4], [ 344, 456.4],
    [ 376, 455.8], [ 412, 455.6], [ 470, 455  ], [ 520, 454.4], [ 570, 453.9],
    [ 616, 453.5], [ 648, 453.5], [ 680, 453.5], [ 712, 454  ], [ 744, 458  ],
    [ 776, 461.5], [ 808, 463  ], [ 840, 463.5], [ 872, 462.5], [ 889, 461.7],
    [ 901, 460.3], [ 913, 459.2], [ 925, 457.4], [ 937, 455.7], [ 949, 453.5],
    [ 961, 450.7], [ 973, 447.8], [ 985, 442.8],
    /* the mirrored C: up round the far ramp and back to the LEFT */
    [ 993, 437  ], [ 998, 431  ], [ 997, 425.5], [ 990, 420.5],
    /* Point 2 — climbing away into the ramp head */
    [ 980, 415  ], [ 968, 409  ], [ 956, 402  ], [ 946, 396  ]
  ];

  /* Catmull-Rom through the control points, emitted as cubic Béziers so
     the car follows a continuous curve rather than a chain of corners */
  function smoothPath(pts) {
    var d = "M" + pts[0][0] + " " + pts[0][1];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i > 0 ? i - 1 : 0], p1 = pts[i], p2 = pts[i + 1],
          p3 = pts[i + 2 < pts.length ? i + 2 : pts.length - 1];
      d += " C " + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(2) + " " +
                   (p1[1] + (p2[1] - p0[1]) / 6).toFixed(2) + ", " +
                   (p2[0] - (p3[0] - p1[0]) / 6).toFixed(2) + " " +
                   (p2[1] - (p3[1] - p1[1]) / 6).toFixed(2) + ", " +
                   p2[0] + " " + p2[1];
    }
    return d;
  }

  function makeRoute(pts) {
    var p = el("path", { d: smoothPath(pts), fill: "none", stroke: "none" }, lyCars);
    var L = p.getTotalLength() || 1;
    /* Locate EVERY reversal in x. This route has two — the C as the car
       drops into the basement and the mirrored C as it climbs out — and
       the body has to swing through each one, so a single turn is not
       enough. The list is read off the geometry, so adding or reshaping
       a curve needs no further bookkeeping. */
    var prev = p.getPointAtLength(0), sgn = 0, turns = [];
    for (var q = 4; q <= L; q += 2) {
      var pt = p.getPointAtLength(q), dx = pt.x - prev.x;
      if (Math.abs(dx) > .4) {
        var ns = dx > 0 ? 1 : -1;
        if (sgn === 0) sgn = ns;
        else if (ns !== sgn) { turns.push(q); sgn = ns; }
        prev = pt;
      }
    }
    /* dir is the facing the car sets off with, before any turn applies:
       this route leaves Point 1 travelling left, so it starts at -1 */
    var p0 = p.getPointAtLength(0), p1 = p.getPointAtLength(Math.min(L, 12));
    var r = { p: p, L: L, turns: turns, dir: p1.x >= p0.x ? 1 : -1 };

    /* ── speed profile ───────────────────────────────────────────────
       A car does not cross a car park at a constant rate. This builds a
       speed curve — pulling away off the ramp, cruising the deck, easing
       right down through the turn at the far end, then away again — and
       inverts it, so a linear tween produces that motion. Acceleration
       and braking are therefore continuous: no snaps, no dead stops. */
    var N = 260, sp = [], i, k, u, v;
    var tfs = turns.map(function (t) { return t / L; });
    for (i = 0; i <= N; i++) {
      u = i / N;
      v = 1;
      /* slow right down for each curve, and pick up again coming out */
      for (k = 0; k < tfs.length; k++) {
        var dturn = Math.abs(u - tfs[k]);
        if (dturn < .085) v *= .32 + .68 * (dturn / .085);
      }
      v *= .40 + .60 * Math.min(1, u / .05);           /* rolling in */
      v *= 1 - .58 * Math.max(0, (u - .95) / .05);     /* rolling out */
      sp.push(Math.max(.12, v));
    }
    var cum = [0];
    for (i = 1; i <= N; i++) cum.push(cum[i - 1] + 2 / (sp[i] + sp[i - 1]));
    var T = cum[N];
    r.arcAt = function (t) {
      var target = t * T, lo = 0, hi = N, mid;
      while (hi - lo > 1) { mid = (lo + hi) >> 1; if (cum[mid] < target) lo = mid; else hi = mid; }
      var f = (target - cum[lo]) / ((cum[hi] - cum[lo]) || 1);
      return (lo + f) / N * L;
    };
    /* how hard it is working at a given progress — drives the brake lights */
    r.speedAt = function (t) {
      var i2 = Math.max(0, Math.min(N, Math.round(t * N)));
      return sp[i2];
    };
    return r;
  }

  var ROUTE = makeRoute(ROUTE_PTS);

  /* Put the car on the route at arc position s.
     Heading comes from the local tangent, so the body always lies along
     the deck; the pitch is clamped so the steep projected ramp slope can
     never stand it on its nose. At the head of the exit ramp the
     horizontal scale runs +1 → 0 → −1, which foreshortens the body the
     way a real car looks swinging through its turn instead of flipping.
     Scale is keyed to depth so the vehicle matches the perspective of
     the deck it is standing on. */
  function placeOnRoute(c, r, s) {
    s = Math.max(0, Math.min(r.L, s));
    var pt = r.p.getPointAtLength(s);
    var a = r.p.getPointAtLength(Math.max(0, s - 6));
    var b = r.p.getPointAtLength(Math.min(r.L, s + 6));
    var dx = b.x - a.x, dy = b.y - a.y;

    /* The body faces its direction of travel and flips at each reversal.
       Through a curve the horizontal scale runs +1 → 0 → −1, which
       foreshortens the car the way a real one looks swinging round,
       instead of snapping to the other side. Turns are far enough apart
       that only one is ever in transition. */
    var half = 34, f = 1, ti;
    for (ti = 0; ti < r.turns.length; ti++) {
      var u = (s - (r.turns[ti] - half / 2)) / half;
      f *= u <= 0 ? 1 : (u >= 1 ? -1 : Math.cos(Math.PI * u));
    }
    var face = (f >= 0 ? 1 : -1) * Math.max(.16, Math.abs(f)) * r.dir;

    var ax = Math.abs(dx) < .001 ? .001 : Math.abs(dx);
    var tilt = Math.atan2(dy, ax) * 180 / Math.PI;
    tilt = Math.max(-13, Math.min(13, tilt));
    /* weight transfer: the nose drops under braking and lifts as it
       pulls away, which is most of what sells a vehicle as having mass */
    tilt = (tilt + (c.pitch || 0)) * (face >= 0 ? 1 : -1);

    /* the B1 deck is ~3 m floor to soffit and reads about 49 px tall
       here; the aisle sits a little further back than the deck edge, so
       the car is built at roughly 1.55× to sit correctly in it */
    var depth = Math.min(1, Math.max(0, (pt.y - 414) / 54));
    var sc = 1.56 - depth * .10;

    c.g.setAttribute("transform",
      "translate(" + pt.x.toFixed(2) + "," + pt.y.toFixed(2) + ")" +
      " rotate(" + tilt.toFixed(2) + ")" +
      " scale(" + (sc * face).toFixed(3) + "," + sc.toFixed(3) + ")" +
      " translate(-21,-16)");
    /* the wheels turn on distance covered, not on elapsed time, so they
       slow with the car and stop dead when it stops */
    if (c.spin) c.spin(s / sc);
    c.s = s;
  }

  /* Drive the car the whole way through: left ramp head → B1 deck →
     right ramp head. The signature is unchanged so the branch sequences
     that ask for a vehicle keep working; there is only one car now, so
     idx, level and leftRamp no longer select anything. */
  function driveCar(idx, level, leftRamp, done, opts) {
    opts = opts || {};
    var c = carPool[0];
    var r = ROUTE;
    c.route = r;

    placeOnRoute(c, r, 0);
    c.g.style.transition = "opacity .45s ease";
    c.g.style.opacity = 1;
    c.beam.style.transition = c.pool.style.transition = "opacity .5s ease";
    c.beam.style.opacity = 1;
    c.pool.style.opacity = 1;
    c.tail.setAttribute("opacity", ".5");
    c.tailGlow.setAttribute("opacity", ".3");

    if (reduce) {
      c.pitch = 0;
      placeOnRoute(c, r, r.L * .42);      /* parked mid-deck, clear of the core */
      c.g.style.opacity = .9;
      if (done) done();
      return;
    }

    if (c.driving) return;
    c.driving = true;

    var dur = opts.dur || (opts.approach ? 11400 : 15200);
    /* the brake lights simply follow the speed profile: whenever the car
       is working below cruise — coming down the ramp, easing up the exit
       — they come on, and they go out again as it picks up */
    var lit = false;

    tween({
      dur: dur, ease: ease.lin, amb: true,
      cancel: function () { c.driving = false; },
      on: function (t) {
        var v0 = r.speedAt(Math.max(0, t - .008)), v1 = r.speedAt(Math.min(1, t + .008));
        c.pitch = Math.max(-2.4, Math.min(2.4, (v0 - v1) * 11));
        placeOnRoute(c, r, r.arcAt(t));
        var braking = r.speedAt(t) < .72;
        if (braking !== lit) {
          lit = braking;
          c.tail.setAttribute("opacity", braking ? "1" : ".5");
          c.tailGlow.setAttribute("opacity", braking ? ".85" : ".3");
        }
      },
      done: function () {
        c.driving = false;
        hideCar(0);
        if (done) done();
      }
    });
  }

  function hideCar(idx) {
    var c = carPool[0];
    c.driving = false;
    c.g.style.opacity = 0;
    c.beam.style.opacity = 1;
    c.pool.style.opacity = 1;
    c.tail.setAttribute("opacity", ".5");
    c.tailGlow.setAttribute("opacity", ".3");
  }

  /* ── A PERSON ─────────────────────────────────────────────────────
     A walking figure, built at 24 units tall with its feet on y = 24 and
     then scaled to whatever the level it is standing on demands: the
     basement is nearer the camera than the offices, so the same person
     is bigger down there. Legs and arms swing off the distance actually
     covered, and the body rises and falls twice per stride, so the walk
     is tied to the travel rather than to a timer. */
  function walker(x0, x1, y, o) {
    o = o || {};
    var h = o.h || 26, col = o.color || "rgba(14,17,20,.94)";
    var host = o.parent || lyPeople;
    var g = el("g", { opacity: 0 }, host);
    g.style.transition = "opacity .45s ease";
    var b = el("g", null, g);
    el("circle", { cx: 4, cy: 3.1, r: 2.4, fill: col }, b);
    el("path", { d: "M4 5.6 L4 14.4", stroke: col, "stroke-width": 3.6,
                 "stroke-linecap": "round", fill: "none" }, b);
    function limb(w) {
      return el("path", { d: "M4 8 L4 14", stroke: col, "stroke-width": w,
                          "stroke-linecap": "round", fill: "none" }, b);
    }
    var armF = limb(1.5), armB = limb(1.5), legF = limb(2.0), legB = limb(2.0);
    var dir = x1 >= x0 ? 1 : -1, sc = h / 24;

    function pose(px, phase) {
      var sw = Math.sin(phase), bob = Math.abs(Math.cos(phase)) * .5;
      legF.setAttribute("d", "M4 14 L" + (4 + sw * 2.6).toFixed(2) + " 24");
      legB.setAttribute("d", "M4 14 L" + (4 - sw * 2.6).toFixed(2) + " 24");
      armF.setAttribute("d", "M4 8 L" + (4 - sw * 1.9).toFixed(2) + " 13");
      armB.setAttribute("d", "M4 8 L" + (4 + sw * 1.9).toFixed(2) + " 13");
      g.setAttribute("transform",
        "translate(" + px.toFixed(2) + "," + (y + bob).toFixed(2) + ")" +
        " scale(" + (sc * dir).toFixed(3) + "," + sc.toFixed(3) + ")" +
        " translate(-4,-24)");
    }
    pose(x0, 0);
    requestAnimationFrame(function () { g.style.opacity = o.o == null ? .92 : o.o; });

    var span = Math.abs(x1 - x0);
    var dur = o.dur || Math.max(700, span * 26);
    function finish() {
      if (o.stay) { if (o.done) o.done(g); return; }
      g.style.opacity = 0;
      afterA(500, function () { if (g.parentNode) g.parentNode.removeChild(g); });
      if (o.done) o.done(g);
    }
    if (reduce) { pose(x1, 0); afterA(300, finish); return g; }
    tween({
      dur: dur, ease: ease.both, amb: o.amb !== false,
      cancel: function () { if (g.parentNode) g.parentNode.removeChild(g); },
      on: function (t) {
        var px = x0 + (x1 - x0) * t;
        pose(px, Math.abs(px - x0) / 4.6);
      },
      done: finish
    });
    return g;
  }

  /* ═══════════════════════════════════════════════════════════════
     PHASE 1A/1D — AMBIENT BUILDING LIFE
     A car arrives, parks, calls a lift, the lift comes down and takes
     it up. Restrained, sequential, and pausable.
     ═══════════════════════════════════════════════════════════════ */
  /* Ambient life runs on its own clock. after() writes into bTimers,
     which resetScene() wipes on every branch selection — so the whole
     arrival used to die silently the first time anyone clicked a branch
     and never came back. These timers are cleared only by ambientPause,
     so the building keeps living underneath whatever branch is running. */
  var aTimers = [];
  function afterA(ms, fn) {
    if (reduce) ms = ms * 0.045;
    var id = setTimeout(function () {
      var k = aTimers.indexOf(id);
      if (k >= 0) aTimers.splice(k, 1);
      if (ambientOn) fn();
    }, ms);
    aTimers.push(id);
    return id;
  }

  var ambStep = 0;
  var DEST = [5, 6, 7, 4];              /* STOPS index — floors 3, 4, 5, 2 */

  /* ── THE JOURNEY ──────────────────────────────────────────────────
     One continuous arrival, told in beats rather than as separate
     demonstrations. A car comes down the ramp and crosses the deck. A
     figure walks the B1 aisle to the lift core, passing behind the
     columns on the way. The call registers, a cab comes down to B1, its
     doors light. The figure steps in and the cab climbs, the indicator
     counting the floors off as it passes them. The doors light again up
     in the tower, the figure walks out into the office — and the light
     comes on in the room they walked into.

     Nothing here is new machinery: it is the car, the lifts, the floor
     indicators and the room lighting that already existed, finally
     chained into one story instead of running as four unrelated loops.
     ═══════════════════════════════════════════════════════════════ */
  function ambientCycle() {
    if (!ambientOn || reduce) return;
    var slot = 0, B1 = 1;
    var dest = DEST[ambStep % DEST.length];
    ambStep++;

    /* beat 1 — the car comes down the ramp and crosses the basement */
    driveCar(slot, 1, true, function () { hideCar(slot); });

    /* beat 2 — a figure walks the aisle to the lift core */
    ambientTimer = afterA(8600, function () {
      if (!ambientOn) return;
      walker(772, 634, G.b1.lane + 2, { h: 29, dur: 3400 });

      /* beat 3 — the call registers and a cab comes down to B1 */
      ambientTimer = afterA(3300, function () {
        if (!ambientOn) return;
        var car = CARS[0].moving ? CARS[1] : CARS[0];
        if (car.moving) { ambientTimer = afterA(2600, ambientCycle); return; }
        fiFlash(B1, 800);
        ride(car, B1, { amb: true, doorLife: 1100 }, function () {
          if (!ambientOn) return;

          /* beat 4 — they board, and the cab climbs the tower */
          ambientTimer = afterA(1250, function () {
            if (!ambientOn) return;
            ride(car, dest, { amb: true, doorLife: 1200 }, function () {
              if (!ambientOn) return;

              /* beat 5 — out into the office, and the room lights up */
              var f = G.floors[G.floors.length - (dest - 2)];
              if (!f) { ambientTimer = afterA(3000, ambientCycle); return; }
              var rm = G.rooms[5];
              ambientTimer = afterA(420, function () {
                if (!ambientOn) return;
                walker(622, rm[0] + 16, f.branch + G.winH, {
                  h: 23, dur: 2600, parent: lyPark,
                  done: function () {
                    if (!ambientOn) return;
                    var lit = roomLight(rm[0], f.branch, rm[1], G.winH,
                      "rgba(255,214,156,.42)", { o: .5, dur: 900, parent: lyPark });
                    /* it stays on for a while, then the room settles back */
                    ambientTimer = afterA(5200, function () {
                      lit.style.transition = "opacity 1.6s ease";
                      lit.style.opacity = 0;
                      afterA(1800, function () {
                        if (lit.parentNode) lit.parentNode.removeChild(lit);
                      });
                      ambientTimer = afterA(2200, ambientCycle);
                    });
                  }
                });
              });
            });
          });
        });
      });
    });

    /* the second cab keeps its own independent rhythm underneath */
    afterA(5200, function () {
      if (!ambientOn) return;
      var other = CARS[1].moving ? CARS[0] : CARS[1];
      if (other.moving) return;
      var t = Math.floor(Math.random() * (TOP + 1));
      ride(other, t, { amb: true });
    });
  }

  function ambientPause() {
    ambientOn = false;
    killList(aTweens);
    aTimers.forEach(clearTimeout);
    aTimers.length = 0;
    clear(lyPeople);
    carPool.forEach(function (c, i) { hideCar(i); });
  }
  function ambientResume() {
    if (reduce) return;
    ambientOn = true;
    after(900, ambientCycle);
  }

  if (reduce) {
    placeCar(CARS[0], Math.min(6, TOP));
    placeCar(CARS[1], 1);
    driveCar(0, 1, true);
    FI[1].dot.style.opacity = .8;
  } else {
    setTimeout(ambientCycle, 1400);
  }


  /* ═══════════════════════════════════════════════════════════════════
     MOTION VOCABULARY
     -------------------------------------------------------------------
     Each discipline gets its own physics. A water front is not a data
     packet; a mechanical door is not an electrical pulse. These helpers
     exist so the branch sequences below never fall back on the same
     "draw a line, send a glow along it" pattern.
     ═══════════════════════════════════════════════════════════════════ */

  /* ── cinematic camera ──────────────────────────────────────────────
     The stage holds the photograph, the SVG overlay and the lift cars,
     so moving it can never break registration between them. */
  var stage = q(".zone-stage");
  var camT = null;

  function camera(dx, dy, sc, dur) {
    if (!stage || reduce) return;
    stage.style.transitionDuration = (dur || 1100) + "ms";
    stage.style.transform = "translate3d(" + (dx || 0) + "px," + (dy || 0) + "px,0) scale(" + (sc || 1) + ")";
  }
  function cameraReset(dur) { camera(0, 0, 1, dur || 700); }

  /* two-stage camera: settle on the origin of a system, then release */
  function cameraThen(a, b, at) {
    camera(a[0], a[1], a[2], a[3] || 1000);
    after(at || 1600, function () { camera(b[0], b[1], b[2], b[3] || 1400); });
  }

  /* ── architectural label with leader line ─────────────────────────
     Small, uppercase, fades in only once its object is already live. */
  function labelAt(x, y, text, color, o) {
    o = o || {};
    var dir = o.dir || 1;                     /* 1 = label to the right */
    var lx = x + dir * (o.lead || 18);
    var g = el("g", { opacity: 0 }, o.parent || lyAnim);
    el("line", { x1: x, y1: y, x2: lx, y2: y, stroke: color,
                 "stroke-width": .7, opacity: .55 }, g);
    el("circle", { cx: x, cy: y, r: 1.4, fill: color }, g);
    var t = el("text", {
      x: lx + dir * 3, y: y + 2.2, fill: color,
      "text-anchor": dir > 0 ? "start" : "end",
      style: "font:600 6.4px Inter,Arial,sans-serif;letter-spacing:.13em"
    }, g);
    t.textContent = text;
    g.style.transition = "opacity .34s ease, transform .34s cubic-bezier(.2,.8,.3,1)";
    g.style.transform = "translate(" + (dir * -4) + "px,0)";
    requestAnimationFrame(function () {
      g.style.opacity = o.opacity == null ? .96 : o.opacity;
      g.style.transform = "translate(0,0)";
    });
    if (o.life) after(o.life, function () { g.style.opacity = 0; });
    return g;
  }

  /* ── FLUID: a pipe that visibly fills ─────────────────────────────
     Water is heavy. The whole column of liquid advances behind a
     front, rather than a short highlight racing along an empty pipe. */
  function fillPipe(d, o) {
    o = o || {};
    var host = o.parent || lyAnim;
    el("path", { d: d, fill: "none", stroke: o.color, "stroke-width": (o.w || 3) + 1.6,
                 opacity: .13, "stroke-linecap": "round" }, host);
    var p = el("path", {
      d: d, fill: "none", stroke: o.color, "stroke-width": o.w || 3,
      "stroke-linecap": "round", opacity: o.opacity == null ? .85 : o.opacity
    }, host);
    var L = p.getTotalLength() || 1;
    p.style.strokeDasharray = L + " " + L;
    p.style.strokeDashoffset = o.reverse ? -L : L;
    if (reduce) { p.style.strokeDashoffset = 0; return p; }
    tween({
      dur: o.dur || 1200, delay: o.delay || 0, ease: ease.water,
      on: function (t) { p.style.strokeDashoffset = (o.reverse ? -L : L) * (1 - t); }
    });
    /* the leading meniscus, slightly brighter than the column behind it */
    if (o.front !== false) {
      var f = el("circle", { r: (o.w || 3) * .8, fill: o.front2 || "#cfefff", opacity: .9 }, host);
      tween({
        dur: o.dur || 1200, delay: o.delay || 0, ease: ease.water,
        on: function (t) {
          var pt = p.getPointAtLength(L * t);
          f.setAttribute("cx", pt.x); f.setAttribute("cy", pt.y);
        },
        done: function () { f.style.transition = "opacity .4s"; f.style.opacity = 0; }
      });
    }
    return p;
  }

  /* ── DATA: short, hard-edged packets ──────────────────────────────
     Crisp squares stepping along the route. Nothing glows or trails. */
  function packet(d, o) {
    o = o || {};
    if (reduce) return;
    var host = o.parent || lyAnim;
    var guide = el("path", { d: d, fill: "none", stroke: "none" }, host);
    var L = guide.getTotalLength() || 1;
    var n = o.count || 3;
    for (var i = 0; i < n; i++) {
      (function (k) {
        var s = o.size || 3.2;
        var r = el("rect", { width: s, height: s, fill: o.color, opacity: .95,
                             rx: .4 }, host);
        tween({
          dur: o.dur || 620, delay: (o.delay || 0) + k * (o.gap || 110), ease: ease.lin,
          on: function (t) {
            var pt = guide.getPointAtLength(L * (o.reverse ? 1 - t : t));
            r.setAttribute("x", pt.x - s / 2);
            r.setAttribute("y", pt.y - s / 2);
          },
          done: function () { if (r.parentNode) r.parentNode.removeChild(r); }
        });
      })(i);
    }
  }

  /* ── AIR: soft continuous streams ─────────────────────────────────
     Long, low-contrast dashes drifting slowly; no defined head. */
  function airStream(d, o) {
    o = o || {};
    var p = el("path", {
      d: d, fill: "none", stroke: o.color, "stroke-width": o.w || 2.4,
      "stroke-linecap": "round", opacity: 0
    }, o.parent || lyAnim);
    var L = p.getTotalLength() || 1;
    p.style.strokeDasharray = "14 26";
    p.style.transition = "opacity .6s ease " + ((o.delay || 0) / 1000) + "s";
    requestAnimationFrame(function () { p.style.opacity = o.opacity == null ? .5 : o.opacity; });
    if (!reduce) {
      p.style.setProperty("--L", L);
      p.style.animation = "zg-airDrift " + (o.dur || 2600) + "ms linear " +
                          (o.delay || 0) + "ms infinite";
    }
    return p;
  }

  /* ── SMOKE: irregular puffs that rise, drift, spread and thin ───── */
  function puff(x, y, o) {
    o = o || {};
    if (reduce) return;
    var r0 = 3 + Math.random() * 4;
    var c = el("circle", {
      cx: x, cy: y, r: r0, fill: o.color || "rgba(198,206,212,.30)", opacity: 0
    }, o.parent || lyAnim);
    var drift = (Math.random() - .35) * 26;
    var rise = 26 + Math.random() * 26;
    var life = 2200 + Math.random() * 1400;
    tween({
      dur: life, delay: o.delay || 0, ease: ease.out,
      on: function (t) {
        c.setAttribute("cx", x + drift * t);
        c.setAttribute("cy", y - rise * t);
        c.setAttribute("r", r0 + t * (9 + Math.random() * .4));
        c.setAttribute("opacity", (o.max || .34) * Math.sin(Math.PI * t));
      },
      done: function () { if (c.parentNode) c.parentNode.removeChild(c); }
    });
    return c;
  }

  /* ── ROOM LIGHT: the façade itself responds ─────────────────────── */
  function roomLight(x, y, w, h, color, o) {
    o = o || {};
    var r = el("rect", { x: x, y: y, width: w, height: h, fill: color, opacity: 0 },
               o.parent || lyAnim);
    r.style.transition = "opacity " + (o.dur || 460) + "ms ease " + (o.delay || 0) + "ms";
    requestAnimationFrame(function () { r.style.opacity = o.o == null ? .5 : o.o; });
    return r;
  }

  /* light every room on a floor, with a short sweep across the plan.
     Again one element per room: the sweep staggers ROOMS, never the
     panes inside a room, so a single interior always reads as one
     coherent lighting environment. */
  function floorRooms(f, color, o) {
    o = o || {};
    var out = [];
    G.rooms.forEach(function (rm, i) {
      out.push(roomLight(rm[0], f.branch, rm[1], G.winH, color,
        { o: o.o, delay: (o.delay || 0) + i * (o.stagger || 26),
          parent: o.parent, dur: o.dur }));
    });
    return out;
  }

  /* ── small mechanical indicator that snaps on ───────────────────── */
  function breaker(x, y, color, delay) {
    var g = el("g", null, lyAnim);
    el("rect", { x: x, y: y, width: 7, height: 4, fill: "none",
                 stroke: color, "stroke-width": .7, opacity: .6 }, g);
    var lv = el("rect", { x: x + 1, y: y + 2.4, width: 5, height: 1.4, fill: color, opacity: .35 }, g);
    lv.style.transition = "y .16s cubic-bezier(.3,1.6,.5,1) " + delay + "ms, opacity .16s linear " + delay + "ms";
    requestAnimationFrame(function () { lv.setAttribute("y", y + .6); lv.style.opacity = 1; });
    return g;
  }

  /* ── two-stage status: activating, then online ──────────────────── */
  function finish(text, color) { after(3500, function () { status(text, color); }); }

  /* ═══════════════════════════════════════════════════════════════
     PHASE 2 — BRANCH ANIMATIONS
     Every sequence is anchored to real building geometry: risers run
     in the core, plant starts in the basement, cameras sit at the
     entrances, structure follows the tower grid.
     ═══════════════════════════════════════════════════════════════ */

  var RISER = "M" + G.riser + " " + G.b2.lane + " V " + G.slabs[0];
  function riserPath(x, fromY, toY) { return "M" + x + " " + fromY + " V " + toY; }

  /* ── FOCUS ────────────────────────────────────────────────────────
     The veil darkens the render, but a flat dim buries the very thing
     the branch is about. Instead it is masked with a soft hole over the
     part of the building that branch actually occupies: the core for the
     lifts, the ground and ramp for access control, the whole frame for
     construction. Everything outside falls back, the active system keeps
     its full contrast, and the eye is put where the text is talking
     about. The hole glides between branches rather than resetting, so
     switching reads as the attention moving, not as a reset. */
  var focusG = el("radialGradient", { id: "zg-focus-g" }, lyDefs);
  el("stop", { offset: "0",   "stop-color": "#000" }, focusG);
  el("stop", { offset: ".54", "stop-color": "#000" }, focusG);
  el("stop", { offset: "1",   "stop-color": "#fff" }, focusG);
  var focusMask = el("mask", { id: "zg-focus", maskUnits: "userSpaceOnUse",
                               x: 0, y: 0, width: 1024, height: 576 }, lyDefs);
  el("rect", { x: 0, y: 0, width: 1024, height: 576, fill: "#fff" }, focusMask);
  var focusHole = el("ellipse", { cx: 512, cy: 288, rx: 900, ry: 620,
                                  fill: "url(#zg-focus-g)" }, focusMask);

  var veil = el("rect", {
    x: 0, y: 0, width: 1024, height: 576, fill: "#02070c", opacity: 0,
    mask: "url(#zg-focus)"
  }, lyShaft);
  veil.style.transition = "opacity .9s ease";
  function dim(v) { veil.style.opacity = v; }

  /* where each branch lives, as [cx, cy, rx, ry] in scene units */
  var FOCUS = [
    [538, 240, 500, 300],   /*  0 construction — the whole frame       */
    [520, 290, 470, 300],   /*  1 electrical — switchroom to roof      */
    [500, 400, 360, 130],   /*  2 building systems — entrance and ramp */
    [520, 400, 400, 190],   /*  3 sanitary — risers and plant          */
    [546, 280, 190, 290],   /*  4 elevators — the core only            */
    [620, 300, 400, 270],   /*  5 telecom — server room and floors     */
    [540, 270, 440, 250],   /*  6 BMS — facade and core                */
    [545, 260, 410, 230],   /*  7 software — core and floors           */
    [520, 395, 420, 140],   /*  8 security — lobby and basement        */
    [538, 290, 480, 290],   /*  9 fire — building wide                 */
    [538, 300, 460, 280],   /* 10 facility — building wide             */
    [538, 210, 450, 220],   /* 11 investments — the tower              */
    [520, 430, 430, 140],   /* 12 trading — ground and basement        */
    [700, 240, 320, 230]    /* 13 real estate — the show apartment     */
  ];
  var focusCur = { cx: 512, cy: 288, rx: 900, ry: 620 };
  function setHole(h) {
    focusHole.setAttribute("cx", h.cx.toFixed(1));
    focusHole.setAttribute("cy", h.cy.toFixed(1));
    focusHole.setAttribute("rx", h.rx.toFixed(1));
    focusHole.setAttribute("ry", h.ry.toFixed(1));
    focusCur = h;
  }
  function focusOn(i) {
    var f = FOCUS[i];
    if (!f) { dim(0); return; }
    var to = { cx: f[0], cy: f[1], rx: f[2], ry: f[3] }, from = focusCur;
    dim(.40);
    if (reduce) { setHole(to); return; }
    tween({
      dur: 760, ease: ease.both,
      cancel: function () { setHole(to); },
      on: function (t) {
        setHole({ cx: from.cx + (to.cx - from.cx) * t, cy: from.cy + (to.cy - from.cy) * t,
                  rx: from.rx + (to.rx - from.rx) * t, ry: from.ry + (to.ry - from.ry) * t });
      }
    });
  }


  /* ═══════════════════════════════════════════════════════════════════
     BRANCH SEQUENCES
     -------------------------------------------------------------------
     Timing contract for every branch:
       0.0–0.4s  immediate response at the origin of the system
       0.4–2.5s  the system does its work
       2.5–3.5s  reveal / fully operational
       3.5s+     quiet persistent state, status flips to ONLINE
     ═══════════════════════════════════════════════════════════════════ */

  /* ─────────────── 1. ENGINEERING & CONSTRUCTION ───────────────
     Physics: structural growth. Columns extend, slabs propagate.
     Nothing travels along anything. */
  function playConstruction(c) {
    status("STRUKTURA NDËRTOHET", c);
    cameraThen([0, 10, 1.014], [0, 0, 1.008], 1900);

    /* foundation */
    draw("M" + G.footL + " " + G.pit + " H " + G.footR,
      { color: c, w: 2.2, dur: .5 });
    labelAt(G.footL + 40, G.pit, "THEMELI", c, { dir: 1, life: 2200 });

    /* levels stack upward: B2 → B1 → Ground → tower → roof */
    var lv = [G.pit, G.b2.deck, G.b1.deck, G.grade].concat(G.slabs.slice().reverse());
    var step = 210;

    for (var i = 0; i < lv.length - 1; i++) {
      (function (base, top, k) {
        var t0 = 280 + k * step;
        /* columns extend upward — a real vertical growth, not a draw-on */
        G.colX.forEach(function (x, j) {
          var ln = el("line", { x1: x, y1: base, x2: x, y2: base,
                                stroke: c, "stroke-width": 1.3, opacity: .8 }, lyAnim);
          tween({
            dur: 260, delay: t0 + j * 22, ease: ease.out,
            on: function (t) { ln.setAttribute("y2", base + (top - base) * t); }
          });
        });
        /* slab lands once the columns are up */
        after(t0 + 240, function () {
          draw("M" + G.frameL + " " + top + " H " + G.frameR,
            { color: c, w: 1.9, dur: .34 });
        });
      })(lv[i], lv[i + 1], i);
    }

    var done = 280 + (lv.length - 1) * step;

    /* façade envelope resolves last */
    after(done + 200, function () {
      draw("M" + G.frameL + " " + G.grade + " V " + G.roof + " H " + G.frameR + " V " + G.grade,
        { color: c, w: 1.6, dur: .8 });
      labelAt(G.frameR - 6, G.roof + 26, "ENVELOPA", c, { dir: -1, life: 1600 });
    });

    after(done + 900, function () {
      rect(G.frameL, G.roof, G.frameR - G.frameL, G.grade - G.roof,
        { color: c, w: 1, opacity: .24, parent: lyKeep });
      G.slabs.forEach(function (s) {
        draw("M" + G.frameL + " " + s + " H " + G.frameR,
          { color: c, w: .8, opacity: .18, instant: true, parent: lyKeep });
      });
      draw("M" + G.footL + " " + G.pit + " H " + G.footR,
        { color: c, w: 1.2, opacity: .28, instant: true, parent: lyKeep });
    });

    finish("STRUKTURA E PËRFUNDUAR", c);
  }

  /* ─────────────── 2. ELECTRICAL & ENERGY ───────────────
     Physics: one energisation event, then a stable circuit.
     The travelling pulse fires once — it does not loop. */
  function playElectrical(c) {
    status("SISTEMI ELEKTRIK ENERGJIZOHET", c);
    cameraThen([0, -14, 1.022], [0, 6, 1.010], 1500);

    dim(.46);

    /* main switchboard wakes */
    rect(G.mainLV.x, G.mainLV.y, G.mainLV.w, G.mainLV.h, { color: c, w: 1.2, opacity: .95 });
    labelAt(G.mainLV.x + G.mainLV.w, G.mainLV.y + 8, "MAIN LV", c, { dir: 1, life: 2600 });

    /* breakers snap on one after another — mechanical, not glowing */
    for (var b = 0; b < 5; b++) breaker(G.mainLV.x + 8 + b * 13, G.mainLV.y + 22, c, 180 + b * 90);

    /* single energisation surge up the riser */
    var rise = "M" + G.riser + " " + (G.mainLV.y + 16) + " H " + (G.riser + 0) +
               " V " + G.slabs[0];
    var feed = "M" + (G.mainLV.x + G.mainLV.w) + " " + (G.mainLV.y + 16) + " H " + G.riser;
    after(680, function () {
      draw(feed, { color: c, w: 1.5, dur: .3 });
      zap(feed, { color: "#ffeec2", dur: .34, len: 22, w: 3 });
    });
    after(900, function () {
      draw("M" + G.riser + " " + (G.mainLV.y + 16) + " V " + G.slabs[0],
        { color: c, w: 1.7, dur: .9 });
      zap("M" + G.riser + " " + (G.mainLV.y + 16) + " V " + G.slabs[0],
        { color: "#fff3d2", dur: .95, len: 62, w: 4.2, reverse: true });
    });

    /* floors energise from the bottom as the surge passes them */
    var order = G.floors.slice().reverse();
    order.forEach(function (f, i) {
      after(1180 + i * 130, function () {
        branchRun(f, { color: c, w: 1.1, dur: .26, opacity: .8 });
        floorRooms(f, "rgba(255,214,150,.42)", { o: .46, stagger: 22, parent: lyKeep });
      });
    });

    /* lobby, then roof plant */
    after(1120, function () {
      roomLight(G.doorL - 46, G.lobbyTop + 14, 214, 54, "rgba(255,216,158,.22)",
        { o: .5, parent: lyKeep });
    });
    after(2200, function () {
      dim(0);
      draw("M" + (G.riser - 90) + " " + (G.roof + 12) + " H " + (G.riser + 6),
        { color: c, w: 1.3, dur: .4 });
      node(G.riser - 90, G.roof + 12, { color: c, r: 2.6, live: true, parent: lyKeep });
      labelAt(G.riser - 90, G.roof + 12, "ÇATI", c, { dir: -1, life: 1400 });
    });

    /* the circuit settles: thin, steady, no more travelling light */
    after(2800, function () {
      draw("M" + G.riser + " " + (G.mainLV.y + 16) + " V " + G.slabs[0],
        { color: c, w: 1.1, opacity: .32, instant: true, parent: lyKeep });
      node(G.mainLV.x + 14, G.mainLV.y + 16, { color: c, r: 2.4, live: true, parent: lyKeep });
    });

    finish("SISTEMI ELEKTRIK NË OPERIM", c);
  }

  /* ─────────────── 3. BUILDING SYSTEMS ───────────────
     Physics: mechanical translation and rotation. Doors slide, arms
     rotate, turnstiles index. Nothing flows. */
  function playBuildingSystems(c) {
    status("SISTEMI I QASJES AKTIVIZOHET", c);
    cameraThen([0, -18, 1.026], [0, -8, 1.012], 1800);

    var rx = G.doorL - 20, ry = G.doorY + 16;
    node(rx, ry, { color: c, r: 3, halo: true });
    labelAt(rx, ry - 12, "LEXUESI", c, { dir: -1, life: 2200 });

    /* badge presented → controller authorises */
    after(320, function () {
      var d = "M" + rx + " " + ry + " V " + (G.b1.mid - 6) + " H " + (G.server.x - 8);
      draw(d, { color: c, w: .9, dur: .34, opacity: .7 });
      packet(d, { color: "#ffe9a8", count: 2, dur: 300, gap: 90, size: 3 });
      after(420, function () {
        node(G.server.x - 8, G.b1.mid - 6, { color: c, r: 2.6, halo: true });
        packet(d, { color: "#b6f0c4", count: 2, dur: 300, gap: 90, size: 3, reverse: true });
      });
    });

    /* ENTRANCE LEAVES.
       The pair is built from the measured doorway opening, not from the
       width of the glazed bay around it: two leaves of exactly half the
       opening, laid side by side from the left reveal, so closed they
       meet on the centre line and cover the doorway edge to edge with no
       gap anywhere between them. Opening slides each leaf back into its
       sidelight pocket, symmetrically about that same centre line. */
    after(1080, function () {
      var E = G.entry;
      var span = E.r - E.l, leaf = span / 2, h = E.bot - E.top;
      /* a bi-parting pair: each leaf slides back roughly half its own
         width into the sidelight, which keeps both of them inside the
         glazed entrance bay instead of sliding out past its columns */
      var travel = Math.round(leaf * .44);

      /* the door frame sitting in the reveal */
      rect(E.l - 1.5, E.top - 1.5, span + 3, h + 3,
        { color: c, w: 1.1, opacity: .85 });

      var glass = "rgba(255,226,170,.20)";
      var lLeaf = rect(E.l, E.top, leaf, h, { fill: glass, color: c, w: .9 });
      var rLeaf = rect(E.l + leaf, E.top, leaf, h, { fill: glass, color: c, w: .9 });
      /* meeting stiles: the realistic centre joint of a sliding pair */
      var lStile = rect(E.l + leaf - 1.1, E.top + 1, 1.1, h - 2,
        { fill: "rgba(255,240,206,.55)" });
      var rStile = rect(E.l + leaf, E.top + 1, 1.1, h - 2,
        { fill: "rgba(255,240,206,.55)" });

      [lLeaf, rLeaf, lStile, rStile].forEach(function (n) {
        n.style.transition = "transform .62s cubic-bezier(.35,0,.15,1)";
      });
      requestAnimationFrame(function () {
        lLeaf.style.transform = lStile.style.transform = "translateX(" + (-travel) + "px)";
        rLeaf.style.transform = rStile.style.transform = "translateX(" + travel + "px)";
      });
      after(1200, function () {
        lLeaf.style.transform = rLeaf.style.transform =
        lStile.style.transform = rStile.style.transform = "translateX(0)";
      });
    });

    /* barrier arm rotates up at the ramp mouth, vehicle passes, arm lowers */
    after(1500, function () {
      var bx = G.rampLx, by = G.grade + 6;
      draw("M" + bx + " " + (by + 8) + " V " + (by - 14), { color: c, w: 1.7, dur: .2 });
      var arm = el("line", { x1: bx, y1: by - 12, x2: bx + 46, y2: by - 12,
                             stroke: c, "stroke-width": 2.2, opacity: .95 }, lyAnim);
      arm.style.transformOrigin = bx + "px " + (by - 12) + "px";
      arm.style.transition = "transform .55s cubic-bezier(.3,0,.2,1)";
      node(bx - 6, by - 18, { color: c, r: 2.2, live: true });
      labelAt(bx - 6, by - 25, "BARRIERA", c, { dir: -1, life: 1800 });
      after(160, function () { arm.style.transform = "rotate(-74deg)"; });
      /* the car is dropped onto the left route just short of the mouth,
         so it reaches the raised arm at the moment it is fully up */
      after(200, function () {
        driveCar(0, 1, true, function () { after(900, function () { hideCar(0); }); },
                 { approach: 2400 });
      });
      after(3400, function () { arm.style.transform = "rotate(0deg)"; });
    });

    after(2900, function () {
      [[rx, ry], [G.doorR + 16, ry], [G.rampLx - 6, G.grade - 6],
       [G.rampRx, G.grade - 6], [G.server.x - 8, G.b1.mid - 6]]
        .forEach(function (p, i) {
          node(p[0], p[1], { color: c, r: 2.1, delay: i * .07, live: true, parent: lyKeep });
        });
    });

    finish("SISTEMI I QASJES AKTIV", c);
  }

  /* ─────────────── 4. SANITARY / PLUMBING ───────────────
     Physics: fluid. Pipes fill behind an advancing front. Heavier and
     slower than electrical or data. */
  function playSanitary(c) {
    status("FURNIZIMI ME UJË AKTIVIZOHET", c);
    cameraThen([0, -12, 1.020], [0, 0, 1.008], 1900);

    var hot = "#e8a765", drainC = "#5b7f96";
    var py = G.pumps.y + 16;

    rect(G.pumps.x, G.pumps.y, G.pumps.w, G.pumps.h, { color: c, w: 1.2, opacity: .95 });
    labelAt(G.pumps.x, G.pumps.y + 6, "PUMP ROOM", c, { dir: -1, life: 2600 });

    /* pump impeller spins up, then settles to a steady rate */
    var imp = el("g", null, lyAnim);
    el("circle", { cx: G.pumps.x + 16, cy: py, r: 6, fill: "none",
                   stroke: c, "stroke-width": 1.1, opacity: .9 }, imp);
    el("path", { d: "M" + (G.pumps.x + 16) + " " + (py - 6) + " V " + (py + 6) +
                    " M" + (G.pumps.x + 10) + " " + py + " H " + (G.pumps.x + 22),
                 stroke: c, "stroke-width": 1.1, opacity: .9 }, imp);
    if (!reduce) {
      imp.style.transformOrigin = (G.pumps.x + 16) + "px " + py + "px";
      imp.style.animation = "zg-spinUp 3.4s cubic-bezier(.3,0,.5,1) forwards";
    }

    /* cold water climbs the riser */
    after(420, function () {
      fillPipe("M" + (G.pumps.x + G.pumps.w) + " " + py + " H " + (G.riser - 5),
        { color: c, w: 3, dur: 420 });
      fillPipe("M" + (G.riser - 5) + " " + py + " V " + G.slabs[0],
        { color: c, w: 3.2, dur: 1250, delay: 380, front2: "#d6f6ff" });
    });

    /* each floor branch fills once the column reaches it */
    G.floors.slice().reverse().forEach(function (f, i) {
      after(900 + i * 175, function () {
        fillPipe("M" + (G.riser - 5) + " " + f.branch + " H " + G.nF,
          { color: c, w: 2.2, dur: 460, front: false });
        fillPipe("M" + (G.riser - 5) + " " + f.branch + " H " + G.nE,
          { color: c, w: 2.2, dur: 620, front: false });
      });
    });

    /* hot loop follows, amber and slower */
    after(1750, function () {
      fillPipe("M" + (G.riser + 4) + " " + py + " V " + G.slabs[2],
        { color: hot, w: 2.4, dur: 1100, front2: "#ffd9a4" });
      labelAt(G.riser + 4, G.slabs[2] + 14, "UJË I NGROHTË", hot, { dir: -1, life: 1600 });
    });

    /* drainage runs the other way, darker and heavier */
    after(2350, function () {
      fillPipe("M" + (G.riser2 + 8) + " " + G.slabs[1] + " V " + (G.b2.deck - 8),
        { color: drainC, w: 3.4, dur: 1000, front2: "#9fc0d4" });
      after(950, function () {
        fillPipe("M" + (G.riser2 + 8) + " " + (G.b2.deck - 8) + " H " + G.plant.x,
          { color: drainC, w: 2.8, dur: 420, front: false });
        node(G.plant.x, G.b2.deck - 8, { color: drainC, r: 2.6, live: true, parent: lyKeep });
      });
    });

    after(3400, function () {
      draw("M" + (G.riser - 5) + " " + py + " V " + G.slabs[0],
        { color: c, w: 1.1, opacity: .3, instant: true, parent: lyKeep });
      node(G.pumps.x + 16, py, { color: c, r: 2.3, live: true, parent: lyKeep });
    });

    finish("SISTEMI SANITAR NË FUNKSION", c);
  }

  /* ─────────────── 5. ELEVATORS ───────────────
     Physics: mass. Acceleration, cruise, deceleration, dwell with
     doors. The two cars are deliberately out of step. */
  function playElevators(c) {
    status("ASHENSORËT NISEN", c);
    camera(0, 0, 1.030, 1200);
    ambientPause();

    var top = G.slabs[0] - 4;
    draw("M" + (G.shaftL - 4) + " " + G.pit + " V " + top, { color: c, w: 1.3, dur: .6, opacity: .75 });
    draw("M" + (G.shaftR + 4) + " " + G.pit + " V " + top, { color: c, w: 1.3, dur: .6, opacity: .75 });
    labelAt(G.shaftR + 4, top + 30, "BËRTHAMA", c, { dir: 1, life: 2200 });

    /* landing sills brighten in sequence, bottom to top */
    STOPS.forEach(function (s, i) {
      after(120 + i * 45, function () {
        draw("M" + (G.shaftL - 4) + " " + (s.y + G.liftH / 2 + 2) + " H " + (G.shaftR + 4),
          { color: c, w: .8, dur: .2, opacity: .5 });
      });
    });

    /* car A works upward out of the basement */
    placeCar(CARS[0], 0);
    fiFlash(0, 700, c);
    after(420, function () {
      ride(CARS[0], 1, { color: c, dur: 620, doorLife: 480 }, function () {
        after(260, function () {
          ride(CARS[0], 2, { color: c, dur: 700, doorLife: 620 }, function () {
            after(320, function () { ride(CARS[0], TOP - 1, { color: c, dur: 1150, doorLife: 700 }); });
          });
        });
      });
    });

    /* car B comes down, offset so they never mirror each other */
    placeCar(CARS[1], TOP);
    after(980, function () {
      ride(CARS[1], 2, { color: c, dur: 1250, doorLife: 560 }, function () {
        after(300, function () { ride(CARS[1], 0, { color: c, dur: 900, doorLife: 700 }); });
      });
    });

    after(3400, function () {
      draw("M" + (G.shaftL - 4) + " " + G.pit + " V " + top,
        { color: c, w: 1, opacity: .28, instant: true, parent: lyKeep });
      draw("M" + (G.shaftR + 4) + " " + G.pit + " V " + top,
        { color: c, w: 1, opacity: .28, instant: true, parent: lyKeep });
    });

    finish("ASHENSORËT NË OPERIM", c);
  }

  /* ─────────────── 6. IT & TELECOM ───────────────
     Physics: discrete packets. Small, hard-edged, very fast. */
  function playTelecom(c) {
    status("RRJETI I TË DHËNAVE AKTIVIZOHET", c);
    cameraThen([-18, -14, 1.024], [0, 0, 1.010], 1700);

    var s = G.server;
    rect(s.x, s.y, s.w, s.h, { color: c, w: 1.2, opacity: .95 });
    labelAt(s.x, s.y + 6, "SERVER", c, { dir: -1, life: 2400 });

    /* rack LEDs wake, each on its own rhythm */
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 5; j++) {
        (function (r, k) {
          var n = el("rect", { x: s.x + 8 + k * 12, y: s.y + 7 + r * 7, width: 3, height: 2.4,
                               fill: c, opacity: 0 }, lyAnim);
          n.style.transition = "opacity .18s linear " + (90 + r * 60 + k * 26) + "ms";
          requestAnimationFrame(function () { n.style.opacity = .9; });
          if (!reduce) n.style.animation = "zg-led " + (900 + Math.random() * 1400) + "ms steps(2,end) " +
                                           (400 + Math.random() * 600) + "ms infinite";
        })(i, j);
      }
    }

    /* fibre backbone, then packets up it */
    var back = "M" + s.x + " " + (s.y + 18) + " H " + G.riser + " V " + G.slabs[0];
    after(560, function () {
      draw(back, { color: c, w: 1.1, dur: .45, opacity: .55 });
      packet(back, { color: "#b6f7ff", count: 5, dur: 560, gap: 80, size: 3.4 });
    });

    /* floor distribution, endpoints light as packets land */
    G.floors.forEach(function (f, k) {
      after(1050 + k * 120, function () {
        branchRun(f, { color: c, w: .9, dur: .22, opacity: .6 });
        packet("M" + G.riser + " " + f.branch + " H " + G.wLeft,
          { color: "#b6f7ff", count: 2, dur: 380, gap: 70, size: 3 });
        [G.nA, G.nB, G.nC, G.nD].forEach(function (x, q) {
          node(x, f.branch, { color: c, r: 1.8, delay: .28 + q * .04, live: true, parent: lyKeep });
        });
      });
    });

    /* restrained Wi-Fi indication on two floors */
    after(1900, function () {
      [G.floors[1], G.floors[4]].forEach(function (f, k) {
        [1, 2, 3].forEach(function (r) {
          var a = el("path", {
            d: "M" + (G.nE + k * 380 - r * 5) + " " + (f.branch + 16) +
               " a " + (r * 5) + " " + (r * 5) + " 0 0 1 " + (r * 10) + " 0",
            fill: "none", stroke: c, "stroke-width": .9, opacity: 0
          }, lyAnim);
          a.style.transition = "opacity .3s ease " + (r * .1 + k * .16) + "s";
          requestAnimationFrame(function () { a.style.opacity = .7; });
        });
      });
    });

    /* traffic returns to the rack */
    after(2500, function () {
      G.floors.forEach(function (f, k) {
        packet("M" + G.wRight + " " + f.branch + " H " + G.riser,
          { color: "#8fe6f5", count: 1, dur: 340, delay: k * 60, size: 2.8 });
      });
      after(420, function () { packet(back, { color: "#d8fdff", count: 3, dur: 480, gap: 70, reverse: true }); });
    });

    after(3300, function () {
      draw(back, { color: c, w: 1, opacity: .28, instant: true, parent: lyKeep });
      node(s.x + s.w - 10, s.y + 8, { color: c, r: 2.2, live: true, parent: lyKeep });
    });

    finish("RRJETI I TË DHËNAVE ONLINE", c);
  }

  /* ─────────────── 7. SMART & AUTOMATION / BMS ───────────────
     Physics: cause and effect. sense → analyse → command → respond. */
  function playBMS(c) {
    /* ═══════════════════════════════════════════════════════════════
       SMART & AUTOMATION / BMS
       -------------------------------------------------------------------
       The point of this sequence is that nothing in it is an independent
       effect. One controller in the ground-floor technical core comes up,
       puts a data spine through the building, and everything that happens
       afterwards happens BECAUSE the signal arrived: the lights, the
       sensors, the air, the blinds, the lifts and the basement zones are
       all downstream of the same hub, and they respond in the order the
       signal reaches them — bottom of the tower to the top.

       Restraint is the brief. No neon, no holograms, no random flashing.
       The intelligence is shown through coordinated, believable changes
       to systems the building actually has.
       ═══════════════════════════════════════════════════════════════ */
    var data = "#8fd8ea";                    /* the data network — blue-cyan */
    var warm = "rgba(255,214,156,";          /* light being added           */
    var cool = "rgba(10,17,24,";             /* light being taken away      */

    var net = el("g", null, lyAnim);         /* everything that fades at the end */
    var sensors = [];                        /* what stays lit afterwards        */

    /* The controller sits on the ground-floor technical core wall beside
       the lift bank — measured to clear the entrance glazing, which
       starts at x 484 — and links up to the building's own riser. Every
       run in this sequence leaves from that riser, not from the hub, so
       the network follows the shaft the building actually has. */
    var hubX = 462, hubY = 372, spX = G.riser2;
    var link = "M" + hubX + " " + hubY + " V " + (G.lobbyTop + 10) + " H " + spX;

    status("BMS INICIALIZOHET", c);
    cameraThen([0, -8, 1.022], [0, 0, 1.012], 2600);

    /* ── 1. the controller comes online ───────────────────────────── */
    rect(hubX - 22, hubY - 12, 44, 24, { color: c, w: 1.1, opacity: .9, parent: net });
    node(hubX, hubY, { color: c, r: 3.2, halo: true, live: true });
    labelAt(hubX - 22, hubY - 7, "BMS", c, { dir: -1, life: 3000 });
    function ring(x, y, r0, r1, dur, col, w) {
      var k = el("circle", { cx: x, cy: y, r: r0, fill: "none", stroke: col || c,
                             "stroke-width": w || 1.2, opacity: .85 }, net);
      if (reduce) { k.setAttribute("opacity", 0); return; }
      tween({ dur: dur, ease: ease.out,
        on: function (t) {
          k.setAttribute("r", r0 + (r1 - r0) * t);
          k.setAttribute("opacity", (.85 * (1 - t)).toFixed(3));
        } });
    }
    after(120, function () { ring(hubX, hubY, 4, 17, 620); });

    /* ── 2. the data spine, up the core and down to the basement ──── */
    var spineUp = "M" + spX + " " + (G.lobbyTop + 10) + " V " + (G.slabs[0] + 4);
    var spineDn = "M" + spX + " " + (G.lobbyTop + 10) + " V " + G.b2.lane;
    after(260, function () {
      draw(link, { color: data, w: 1.1, dur: .34, opacity: .6, parent: net });
      draw(spineUp, { color: data, w: 1.1, dur: .62, delay: .2, opacity: .62, parent: net });
      draw(spineDn, { color: data, w: 1.1, dur: .46, opacity: .5, parent: net });
      packet(spineUp, { color: data, count: 3, dur: 620, gap: 110, size: 2.6, parent: net });
      packet(spineDn, { color: data, count: 2, dur: 460, gap: 110, size: 2.6, parent: net });
    });

    /* ── 3. floor by floor, bottom to top ─────────────────────────── */
    var SENS  = [[1, 5, 8], [2, 6, 9], [0, 4, 7], [3, 6, 10], [1, 5, 9], [2, 7, 8]];
    var LIT   = [[5, 8], [6, 9], [4, 7], [6, 10], [5, 9], [7, 8]];
    var DIMD  = [[1], [2], [0], [3], [1], [2]];

    for (var k = 0; k < 6; k++) (function (k) {
      var f = G.floors[5 - k];               /* floors[5] is level 1 */
      var t0 = 620 + k * 250;

      /* the run reaches the floor, and the packet with it */
      after(t0, function () {
        branchRun(f, { x: spX, color: data, w: .8, dur: .3, opacity: .5, parent: net });
        packet("M" + spX + " " + f.branch + " H " + G.rooms[8][0],
          { color: data, count: 2, dur: 420, gap: 80, size: 2.4, parent: net });
        packet("M" + spX + " " + f.branch + " H " + G.rooms[1][0],
          { color: data, count: 2, dur: 420, gap: 80, size: 2.4, parent: net });
      });

      /* sensors acknowledge, then settle to a quiet live indicator */
      after(t0 + 220, function () {
        SENS[k].forEach(function (ri, q) {
          var rm = G.rooms[ri], sx = rm[0] + rm[1] * .5, sy = f.branch + 6;
          after(q * 70, function () {
            ring(sx, sy, 1.5, 7, 460, data, .8);
            sensors.push(node(sx, sy, { color: data, r: 1.5, live: true,
                                        opacity: .8, parent: lyKeep }));
          });
        });
      });

      /* lighting control: some zones come up, others are trimmed back */
      after(t0 + 340, function () {
        LIT[k].forEach(function (ri, q) {
          var rm = G.rooms[ri];
          roomLight(rm[0], f.branch, rm[1], G.winH, warm + ".40)",
            { o: .44, dur: 1100, delay: q * 130, parent: net });
        });
        DIMD[k].forEach(function (ri) {
          var rm = G.rooms[ri];
          roomLight(rm[0], f.branch, rm[1], G.winH, cool + ".55)",
            { o: .30, dur: 1300, delay: 180, parent: net });
        });
      });

      /* motorised blinds — the two façades are given different orders */
      if (k === 1 || k === 5) after(t0 + 420, function () {   /* left: lowering */
        [0, 1, 2, 3].forEach(function (ri, q) {
          var rm = G.rooms[ri];
          var bl = rect(rm[0], f.branch, rm[1], 2,
            { fill: "rgba(190,222,236,.30)", parent: net });
          if (reduce) { bl.setAttribute("height", 17); return; }
          bl.style.transition = "height .78s cubic-bezier(.35,0,.2,1) " + (q * 110) + "ms";
          requestAnimationFrame(function () { bl.setAttribute("height", 17); });
        });
      });
      if (k === 2 || k === 4) after(t0 + 420, function () {   /* right: tilting */
        [5, 7, 9].forEach(function (ri, q) {
          var rm = G.rooms[ri];
          for (var sl = 0; sl < 5; sl++) (function (sl) {
            var ly = f.branch + 5 + sl * 6;
            var slat = el("line", { x1: rm[0] + 2, y1: ly, x2: rm[0] + rm[1] - 2, y2: ly,
                                    stroke: "rgba(190,222,236,.42)", "stroke-width": .4 }, net);
            if (reduce) { slat.setAttribute("stroke-width", 1.7); return; }
            slat.style.transition = "stroke-width .6s cubic-bezier(.4,0,.2,1) " +
                                    (q * 110 + sl * 40) + "ms";
            requestAnimationFrame(function () { slat.setAttribute("stroke-width", 1.7); });
          })(sl);
        });
      });

      /* climate: air moving through the plan, kept architectural */
      if (k === 1 || k === 4) after(t0 + 480, function () {
        airStream("M" + spX + " " + (f.branch + 17) + " C " + (spX + 90) + " " +
          (f.branch + 9) + ", " + (G.rooms[8][0] - 40) + " " + (f.branch + 25) + ", " +
          G.rooms[9][0] + " " + (f.branch + 15),
          { color: c, w: 1.8, opacity: .34, dur: 3000, parent: net });
        airStream("M" + spX + " " + (f.branch + 20) + " C " + (spX - 100) + " " +
          (f.branch + 12) + ", " + (G.rooms[1][0] + 60) + " " + (f.branch + 26) + ", " +
          G.rooms[0][0] + " " + (f.branch + 16),
          { color: c, w: 1.8, opacity: .28, dur: 3200, parent: net });
      });
    })(k);

    after(900, function () { status("BMS ANALIZON", c); });

    /* ── 4. energy management ─────────────────────────────────────── */
    after(2280, function () {
      var eF = G.floors[2], eB = G.floors[4];
      draw("M" + spX + " " + hubY + " V " + eF.branch + " H " + G.rooms[7][0],
        { color: "#b9e6c8", w: .8, dur: .5, opacity: .5, parent: net });
      draw("M" + spX + " " + hubY + " V " + eB.branch + " H " + G.rooms[2][0],
        { color: "#b9e6c8", w: .8, dur: .5, opacity: .5, parent: net });
      packet("M" + spX + " " + hubY + " V " + eF.branch + " H " + G.rooms[7][0],
        { color: "#b9e6c8", count: 2, dur: 720, gap: 120, size: 2.4, parent: net });
      after(420, function () {
        labelAt(G.rooms[7][0] + G.rooms[7][1], eF.branch + 8, "−18% ENERGJI", "#b9e6c8",
          { dir: 1, life: 2400, parent: net });
        labelAt(G.rooms[2][0], eB.branch + 8, "HVAC OPTIMIZUAR", "#b9e6c8",
          { dir: -1, life: 2400, parent: net });
      });
    });

    /* ── 5. vertical transport is on the same network ─────────────── */
    after(2600, function () {
      draw("M" + spX + " " + hubY + " H " + (G.liftBX + G.liftW / 2),
        { color: data, w: .8, dur: .3, opacity: .5, parent: net });
      [6, 4, 2].forEach(function (st, q) {
        after(q * 190, function () {
          fiFlash(st, 900, data);
          doorLight(q % 2 ? G.liftAX : G.liftBX, st, "rgba(143,216,234,.26)", 800);
        });
      });
    });

    /* ── 6. basement and common areas, zone by zone ───────────────── */
    after(2900, function () {
      [[160, G.b1.ceil + 4, 96], [286, G.b1.ceil + 4, 100],
       [640, G.b1.ceil + 4, 100], [762, G.b1.ceil + 4, 96],
       [180, G.b2.ceil + 6, 110], [660, G.b2.ceil + 6, 110]].forEach(function (z, q) {
        roomLight(z[0], z[1], z[2], 36, warm + ".26)",
          { o: .34, dur: 900, delay: q * 200, parent: net });
        after(q * 200, function () {
          sensors.push(node(z[0] + z[2] * .5, z[1] + 6,
            { color: data, r: 1.4, live: true, opacity: .75, parent: lyKeep }));
        });
      });
    });

    after(3250, function () { status("BMS KOMANDON", c); });

    /* ── 7. occupancy: one zone taken from standby to active ──────── */
    after(3750, function () {
      var f = G.floors[1], rm = G.rooms[6];
      var sx = rm[0] + rm[1] * .5;
      ring(sx, f.branch + 6, 1.6, 11, 620, data, 1);
      labelAt(sx, f.branch + 6, "PREZENCË", data, { dir: 1, life: 2000, parent: net });
      after(360, function () {                       /* lights fade up */
        roomLight(rm[0], f.branch, rm[1], G.winH, warm + ".46)",
          { o: .52, dur: 1200, parent: net });
      });
      after(760, function () {                       /* then the climate */
        airStream("M" + spX + " " + (f.branch + 18) + " C " + (spX + 70) + " " +
          (f.branch + 10) + ", " + (rm[0] - 24) + " " + (f.branch + 24) + ", " +
          (rm[0] + 8) + " " + (f.branch + 16),
          { color: c, w: 1.8, opacity: .36, dur: 2800, parent: net });
      });
      after(1080, function () {                      /* and the blind trims */
        var bl = rect(rm[0], f.branch, rm[1], 2,
          { fill: "rgba(190,222,236,.28)", parent: net });
        if (reduce) { bl.setAttribute("height", 11); return; }
        bl.style.transition = "height .7s cubic-bezier(.35,0,.2,1)";
        requestAnimationFrame(function () { bl.setAttribute("height", 11); });
      });
    });

    /* ── 8. one synchronisation across the whole building ─────────── */
    after(5300, function () {
      status("BMS SINKRONIZON", c);
      ring(hubX, hubY, 10, 470, 1150, data, 1.4);
      /* every node the network reached answers at the same instant */
      sensors.forEach(function (n) {
        if (!n || reduce) return;
        var r0 = parseFloat(n.getAttribute("r")) || 1.5;
        tween({ dur: 760, ease: ease.both,
          on: function (t) {
            var g = Math.sin(Math.PI * t);
            n.setAttribute("r", (r0 + g * 1.9).toFixed(2));
            n.setAttribute("opacity", (.75 + g * .25).toFixed(3));
          },
          done: function () { n.setAttribute("r", r0); n.setAttribute("opacity", .8); }
        });
      });
      var glow = el("rect", { x: G.towerL, y: G.roof, width: G.towerR - G.towerL,
                              height: G.pit - G.roof, fill: data, opacity: 0 }, net);
      if (!reduce) tween({ dur: 1100, ease: ease.both,
        on: function (t) { glow.setAttribute("opacity", (.07 * Math.sin(Math.PI * t)).toFixed(3)); } });
    });

    /* ── 9. the network recedes; the optimised building remains ───── */
    after(6350, function () {
      net.style.transition = "opacity 1.5s ease";
      net.style.opacity = .1;
      draw(spineUp, { color: data, w: .7, opacity: .16, instant: true, parent: lyKeep });
      draw("M" + spX + " " + (G.lobbyTop + 10) + " V " + G.b1.lane,
        { color: data, w: .7, opacity: .14, instant: true, parent: lyKeep });
      node(hubX, hubY, { color: c, r: 2.4, live: true, parent: lyKeep });
    });

    after(7100, function () { status("BMS ONLINE · I OPTIMIZUAR", c); });
  }

  /* ─────────────── 8. SOFTWARE & DEVELOPMENT ───────────────
     Physics: discrete logic. Modules appear as cards, one request
     steps through them and returns. No continuous flow. */
  function playSoftware(c) {
    status("KËRKESA GJENEROHET NË APLIKACION", c);
    cameraThen([0, -6, 1.014], [0, 0, 1.008], 1700);

    /* module cards placed on real technical areas of the building */
    var mods = [
      { x: G.nA - 30, y: G.floors[5].branch - 4, w: 60, h: 20, l: "APP" },
      { x: G.riser2 - 34, y: G.lobbyTop + 16, w: 68, h: 20, l: "API" },
      { x: 470, y: G.roof - 26, w: 74, h: 20, l: "CLOUD" },
      { x: G.server.x - 4, y: G.server.y + 4, w: 86, h: 20, l: "BACKEND" },
      { x: G.plant.x - 2, y: G.plant.y + 6, w: 90, h: 20, l: "BUILDING API" }
    ];

    mods.forEach(function (m, i) {
      after(120 + i * 150, function () {
        var g = el("g", { opacity: 0 }, lyAnim);
        el("rect", { x: m.x, y: m.y, width: m.w, height: m.h, rx: 2,
                     fill: "rgba(47,176,212,.08)", stroke: c, "stroke-width": .9 }, g);
        var t = el("text", { x: m.x + m.w / 2, y: m.y + 13, fill: c, "text-anchor": "middle",
                             style: "font:600 6.6px Inter,Arial,sans-serif;letter-spacing:.16em" }, g);
        t.textContent = m.l;
        g.style.transition = "opacity .3s ease, transform .3s cubic-bezier(.2,.9,.3,1)";
        g.style.transform = "translate(0,5px)";
        requestAnimationFrame(function () { g.style.opacity = .95; g.style.transform = "translate(0,0)"; });
      });
    });

    /* one request walks the chain, node by node */
    function centre(m) { return [m.x + m.w / 2, m.y + m.h / 2]; }
    after(900, function () {
      for (var i = 0; i < mods.length - 1; i++) {
        (function (a, b, k) {
          var p1 = centre(a), p2 = centre(b);
          var d = "M" + p1[0] + " " + p1[1] + " L" + p2[0] + " " + p2[1];
          after(k * 300, function () {
            draw(d, { color: c, w: .8, opacity: .3, dur: .26 });
            packet(d, { color: "#c8f2ff", count: 1, dur: 260, size: 3.6 });
          });
        })(mods[i], mods[i + 1], i);
      }
    });

    /* response returns along the same chain */
    /* One beat per hop, timed to the link that is drawing at that moment:
       the forward chain runs at 900 + k*300, so each status lands as its
       own connection completes. */
    after(1180, function () { status("API E PRANON KËRKESËN", c); });
    after(1480, function () { status("KËRKESA PËRCILLET PËRMES CLOUD-IT", c); });
    after(1780, function () { status("SISTEMI QENDROR E PËRPUNON KËRKESËN", c); });
    after(2060, function () { status("TË DHËNAT PËRPUNOHEN", c); });
    after(2820, function () { status("PËRGJIGJJA KTHEHET NË APLIKACION", c); });

    after(2250, function () {
      status("PËRGJIGJJA GJENEROHET", c);
      for (var i = mods.length - 1; i > 0; i--) {
        (function (a, b, k) {
          var p1 = centre(a), p2 = centre(b);
          var d = "M" + p2[0] + " " + p2[1] + " L" + p1[0] + " " + p1[1];
          after(k * 190, function () {
            packet(d, { color: "#e6faff", count: 1, dur: 200, size: 3.2, reverse: true });
          });
        })(mods[i - 1], mods[i], mods.length - 1 - i);
      }
    });

    after(3150, function () {
      mods.forEach(function (m) {
        var p = centre(m);
        node(p[0], p[1], { color: c, r: 2, live: true, parent: lyKeep });
      });
      for (var i = 0; i < mods.length - 1; i++) {
        var a = centre(mods[i]), b = centre(mods[i + 1]);
        draw("M" + a[0] + " " + a[1] + " L" + b[0] + " " + b[1],
          { color: c, w: .7, opacity: .18, instant: true, parent: lyKeep });
      }
    });

    finish("SISTEMI SOFTUERIK AKTIV", c);
  }

  /* ─────────────── 9. SECURITY ───────────────
     Physics: slow mechanical sweeps, then a lock-on. Deliberately
     unsynchronised — real cameras never move in unison. */
  function playSecurity(c) {
    status("SISTEMI I SIGURISË MONITORON", c);
    cameraThen([0, -16, 1.024], [0, -6, 1.012], 1800);
    dim(.42);

    var cams = [
      { x: G.doorL - 26, y: G.lobbyTop + 8, d: 1,  ph: 0 },
      { x: G.doorR + 26, y: G.lobbyTop + 8, d: -1, ph: 1.4 },
      { x: G.nA, y: G.b1.ceil + 8, d: 1,  ph: .7 },
      { x: G.nD, y: G.b1.ceil + 8, d: -1, ph: 2.1 },
      { x: G.nA, y: G.b2.ceil + 8, d: 1,  ph: 1.1 },
      { x: G.nD, y: G.b2.ceil + 8, d: -1, ph: 2.8 },
      { x: 165, y: G.lobbyTop + 8, d: 1,  ph: 1.8 }
    ];
    var cones = [];

    cams.forEach(function (cm, i) {
      after(120 + i * 170, function () {
        rect(cm.x - 5, cm.y - 3, 10, 5, { fill: c, opacity: .95 });
        var cone = el("path", {
          d: "M" + cm.x + " " + (cm.y + 2) + " L" + (cm.x + cm.d * 40) + " " + (cm.y + 44) +
             " L" + (cm.x + cm.d * 4) + " " + (cm.y + 44) + " Z",
          fill: "color-mix(in srgb," + c + " 12%,transparent)",
          stroke: c, "stroke-width": .6, opacity: 0
        }, lyAnim);
        cone.style.transformOrigin = cm.x + "px " + cm.y + "px";
        cone.style.transition = "opacity .4s ease";
        requestAnimationFrame(function () { cone.style.opacity = .8; });
        /* each camera sweeps at its own rate and phase */
        if (!reduce) {
          cone.style.animation = "zg-camSweep " + (4600 + i * 520) + "ms ease-in-out infinite";
          cone.style.animationDelay = (-cm.ph) + "s";
        }
        cones.push(cone);
      });
    });

    after(900, function () {
      labelAt(G.doorL - 26, G.lobbyTop + 2, "CCTV", c, { dir: -1, life: 1800 });
      [[G.doorL - 16, G.doorY + 16], [G.doorR + 14, G.doorY + 16]].forEach(function (p, i) {
        node(p[0], p[1], { color: c, r: 2.3, delay: i * .1, halo: true, live: true });
      });
    });

    /* perimeter arms */
    after(1400, function () {
      var per = "M" + G.frameL + " " + G.lobbyTop + " H " + G.frameR +
                " V " + G.grade + " H " + G.frameL + " Z";
      draw(per, { color: c, w: 1, opacity: .35, dur: .8 });
    });

    /* one camera detects, stops sweeping and locks on */
    after(2100, function () {
      var target = cones[2];
      if (!target) return;
      target.style.animation = "none";
      target.style.transition = "transform .55s cubic-bezier(.3,0,.2,1), opacity .3s";
      target.style.transform = "rotate(12deg)";
      target.style.opacity = 1;
      var tx = G.nA + 26, ty = G.b1.lane;
      var box = rect(tx - 11, ty - 12, 22, 20, { color: "#ff8a72", w: 1.2, opacity: 0 });
      box.style.transition = "opacity .3s ease .25s";
      requestAnimationFrame(function () { box.style.opacity = .95; });
      labelAt(tx, ty - 14, "OBJEKT", "#ff8a72", { dir: 1, life: 1500 });
      status("LËVIZJE E DETEKTUAR", c);

      after(500, function () {
        var d = "M" + tx + " " + ty + " H " + (G.server.x + 30) + " V " + (G.server.y + 16);
        draw(d, { color: c, w: .8, opacity: .5, dur: .3 });
        packet(d, { color: "#d6e6ff", count: 2, dur: 320, gap: 80, size: 3 });
        after(400, function () {
          rect(G.server.x, G.server.y, G.server.w, G.server.h, { color: c, w: 1.2, opacity: .95 });
          node(G.server.x + 30, G.server.y + 16, { color: c, r: 3, halo: true, live: true });
          labelAt(G.server.x, G.server.y + 6, "MONITORIMI", c, { dir: -1, life: 1600 });
        });
      });
    });

    /* the verification beat lands with the feed reaching the monitoring
       rack, at 2100 + 500 + 400 */
    after(3000, function () { status("NGJARJA VERIFIKOHET", c); });

    after(3400, function () {
      dim(.16);
      cams.forEach(function (cm) { node(cm.x, cm.y, { color: c, r: 1.9, live: true, parent: lyKeep }); });
      node(G.server.x + 30, G.server.y + 16, { color: c, r: 2.4, live: true, parent: lyKeep });
    });

    finish("SISTEMI I SIGURISË AKTIV", c);
  }

  /* ─────────────── 10. FIRE & SAFETY ───────────────
     Physics: an incident and a controlled response. Smoke is
     irregular; suppression water is heavy and blue, never a pulse. */
  function playFireSafety(c) {
    status("ALARM — TYMI U DETEKTUA", "#e0574f");
    var red = "#e0574f", amber = "#f0a860", water = "#7fc0e8";
    var f = G.floors[3];
    var sx = G.nC;
    cameraThen([0, 14, 1.024], [0, 2, 1.010], 2200);

    /* smoke: varied sizes, drift and lifetimes */
    if (!reduce) {
      for (var i = 0; i < 14; i++) puff(sx + (Math.random() - .5) * 24, f.branch + 22, { delay: i * 170, max: .32 });
    }

    /* detector reacts */
    after(420, function () {
      node(sx, f.branch + 4, { color: red, r: 3, halo: true });
      var d = el("circle", { cx: sx, cy: f.branch + 4, r: 3.2, fill: red,
                             "class": reduce ? "" : "zg-alarm" }, lyAnim);
      labelAt(sx, f.branch + 4, "DETEKTOR", red, { dir: 1, life: 1600 });
    });

    /* alarm signal reaches the panel */
    after(760, function () {
      var px = G.doorR + 32, py = G.lobbyTop + 24;
      var d = "M" + sx + " " + (f.branch + 4) + " H " + G.riser2 + " V " + py + " H " + px;
      draw(d, { color: red, w: 1.1, dur: .3 });
      packet(d, { color: "#ffc0b6", count: 3, dur: 300, gap: 60, size: 3.4 });
      after(360, function () {
        rect(px - 11, py - 13, 24, 28, { color: red, w: 1.3, opacity: .95 });
        el("circle", { cx: px, cy: py, r: 2.8, fill: red, "class": reduce ? "" : "zg-alarm" }, lyAnim);
        labelAt(px + 13, py, "FIRE PANEL", red, { dir: 1, life: 2000 });
        dim(.5);
      });
    });

    /* emergency lighting and the evacuation route */
    after(1350, function () {
      G.floors.forEach(function (ff, i) {
        after(i * 60, function () {
          el("circle", { cx: G.wLeft, cy: ff.branch + 6, r: 2, fill: amber,
                         "class": reduce ? "" : "zg-alarm" }, lyAnim);
          roomLight(G.winLx, ff.branch, 24, 7, "rgba(240,180,110,.55)", { o: .7 });
        });
      });
    });
    after(1650, function () {
      var route = "M" + sx + " " + (f.branch + 14) + " H " + (G.stairR - 8) +
                  " V " + G.lobbyMid + " H " + (G.doorL + 12) + " V " + (G.grade - 4);
      draw(route, { color: amber, w: 1.6, dash: "7 5", dur: .8, opacity: .95 });
      packet(route, { color: "#ffe0ad", count: 3, dur: 900, gap: 200, size: 4 });
      labelAt(G.doorL + 12, G.grade - 10, "DALJA", amber, { dir: -1, life: 1800 });
    });

    /* the wet riser charges — water, not light */
    after(2050, function () {
      status("SHUARJA AKTIVIZOHET", "#e0574f");
      rect(G.pumps.x, G.pumps.y, G.pumps.w, G.pumps.h, { color: water, w: 1.2, opacity: .9 });
      labelAt(G.pumps.x, G.pumps.y + 6, "POMPA", water, { dir: -1, life: 1600 });
      fillPipe("M" + (G.pumps.x + G.pumps.w) + " " + (G.b2.deck - 10) + " H " + (G.riser + 10),
        { color: water, w: 3, dur: 320, front: false });
      fillPipe("M" + (G.riser + 10) + " " + (G.b2.deck - 10) + " V " + f.branch,
        { color: water, w: 3.4, dur: 900, delay: 280, front2: "#d6f2ff" });
    });

    /* local sprinklers only, around the incident */
    after(3150, function () {
      fillPipe("M" + (G.riser + 10) + " " + f.branch + " H " + (sx + 34),
        { color: water, w: 2.4, dur: 300, front: false });
      [sx - 24, sx, sx + 24].forEach(function (x, i) {
        after(200 + i * 90, function () {
          node(x, f.branch + 6, { color: "#d6f2ff", r: 2 });
          fillPipe("M" + x + " " + (f.branch + 6) + " V " + (f.branch + 22),
            { color: water, w: 1.6, dur: 420, front: false, opacity: .6 });
        });
      });
    });

    after(3900, function () {
      dim(.14);
      G.floors.forEach(function (ff) {
        node(G.wLeft, ff.branch + 6, { color: red, r: 1.6, opacity: .5, live: true, parent: lyKeep });
      });
      draw("M" + (G.riser + 10) + " " + (G.b2.deck - 10) + " V " + G.slabs[1],
        { color: water, w: 1, opacity: .26, instant: true, parent: lyKeep });
      node(G.doorR + 32, G.lobbyTop + 24, { color: red, r: 2.2, live: true, parent: lyKeep });
      status("SITUATA NËN KONTROLL", c);
    });
  }

  /* ─────────────── 11. FACILITY MANAGEMENT ───────────────
     Physics: an inspection pass with status states, not surveillance.
     checking → attention → serviced → healthy. */
  function playFacility(c) {
    status("INSPEKTIMI NË VAZHDIM", c);
    cameraThen([0, 0, 1.012], [0, 0, 1.006], 2000);

    var checks = [
      { y: G.floors[0].branch, x: G.nE, l: "NDRIÇIM" },
      { y: G.floors[2].branch, x: G.nF, l: "KLIMË" },
      { y: G.floors[4].branch, x: G.nE, l: "ELEKTRIKE", warn: true },
      { y: G.lobbyMid,         x: G.shaftR + 26, l: "ASHENSORË" },
      { y: G.b1.lane,          x: G.nF, l: "SANITARE" },
      { y: G.b2.lane,          x: G.nE, l: "PAJISJE", warn: true }
    ];

    var bar = el("g", null, lyAnim);
    var line = el("line", { x1: G.frameL, y1: G.roof, x2: G.frameR, y2: G.roof,
                            stroke: c, "stroke-width": 1.3, opacity: .9 }, bar);
    var glow = el("rect", { x: G.frameL, y: G.roof - 9, width: G.frameR - G.frameL, height: 18,
                            fill: "color-mix(in srgb," + c + " 13%,transparent)" }, bar);

    var span = G.b2.deck + 4 - G.roof, dur = 2600;
    if (!reduce) {
      tween({
        dur: dur, ease: ease.both,
        on: function (t) {
          var y = G.roof + span * t;
          line.setAttribute("y1", y); line.setAttribute("y2", y);
          glow.setAttribute("y", y - 9);
        },
        done: function () { bar.style.transition = "opacity .5s"; bar.style.opacity = 0; }
      });
    } else { bar.setAttribute("opacity", 0); }

    checks.forEach(function (ck) {
      var at = Math.max(100, (ck.y - G.roof) / span * dur);
      after(at, function () {
        var col = ck.warn ? "#e8b271" : c;
        var n = node(ck.x, ck.y, { color: col, r: 2.6, halo: true });
        var g = labelAt(ck.x, ck.y, ck.l + (ck.warn ? " · KONTROLL" : " · OK"), col,
                        { dir: 1, life: 2400 });
        if (ck.warn) {
          /* a maintenance route is proposed, then the item is cleared */
          after(500, function () {
            draw("M" + G.plant.x + " " + G.plant.y + " L" + ck.x + " " + ck.y,
              { color: "#e8b271", w: .8, dash: "4 4", opacity: .5, dur: .5 });
          });
          after(1200, function () {
            n.setAttribute("fill", c);
            var t = g.querySelector("text");
            if (t) { t.textContent = ck.l + " · SERVISUAR"; t.setAttribute("fill", c); }
          });
        }
      });
    });

    after(3200, function () {
      checks.forEach(function (ck, i) {
        node(ck.x, ck.y, { color: c, r: 2, delay: i * .05, live: true, parent: lyKeep });
      });
      node(G.plant.x + 22, G.plant.y + 16, { color: c, r: 2.4, live: true, parent: lyKeep });
    });

    finish("OBJEKTI NË GJENDJE TË RREGULLT", c);
  }

  /* ─────────────── 12. INVESTMENTS ───────────────
     Physics: capital entering the asset, then value accruing.
     Segments of the real building reveal as holdings. */
  function playInvestments(c) {
    /* Eight beats spread over the sequence the branch already plays: the
       five value bands land at 400 + i*320, the growth line at 2100 and
       the portfolio frame at 3400, so the wording tracks what is being
       drawn rather than running ahead of it. */
    status("MUNDËSIA E INVESTIMIT ANALIZOHET", c);
    cameraThen([0, 4, 1.014], [0, 0, 1.008], 2000);
    after(520,  function () { status("RREZIKU DHE POTENCIALI VLERËSOHEN", c); });
    after(1020, function () { status("KAPITALI ALOKOHET", c); });
    after(1560, function () { status("INVESTIMET STRUKTUROHEN", c); });

    /* capital enters at the ground and distributes into the asset */
    var src = [G.frameL - 26, G.grade + 14];
    node(src[0], src[1], { color: c, r: 3.4, halo: true });
    labelAt(src[0], src[1], "KAPITALI", c, { dir: 1, life: 1800 });

    /* the building reveals as stacked holdings, bottom to top */
    var segs = [
      { y: G.b2.ceil, h: G.pit - G.b2.ceil, l: "PARKING" },
      { y: G.grade, h: G.b2.ceil - G.grade, l: "" },
      { y: G.lobbyTop, h: G.grade - G.lobbyTop, l: "LOBI" },
      { y: G.slabs[3], h: G.lobbyTop - G.slabs[3], l: "" },
      { y: G.roof, h: G.slabs[3] - G.roof, l: "ZYRA" }
    ];

    segs.forEach(function (s, i) {
      after(400 + i * 320, function () {
        var r = rect(G.frameL, s.y, G.frameR - G.frameL, s.h,
          { color: c, w: 1, opacity: 0, fill: "color-mix(in srgb," + c + " 7%,transparent)" });
        r.style.transition = "opacity .5s ease";
        requestAnimationFrame(function () { r.style.opacity = .8; });
        packet("M" + src[0] + " " + src[1] + " L" + (G.frameL + 30) + " " + (s.y + s.h / 2),
          { color: c, count: 1, dur: 340, size: 3.6 });
        if (s.l) labelAt(G.frameL + 14, s.y + 12, s.l, c, { dir: 1, life: 2200, opacity: .8 });
      });
    });

    /* a restrained value trajectory following the tower profile */
    after(2100, function () {
      status("ASETET INTEGROHEN NË PORTOFOL", c);
      var pts = [[G.colX[0], G.grade - 12], [300, G.floors[5].slab], [440, G.floors[3].slab],
                 [600, G.floors[2].slab], [760, G.floors[1].slab], [900, G.roof + 14]];
      var d = "M" + pts[0][0] + " " + pts[0][1];
      pts.slice(1).forEach(function (p) { d += " L" + p[0] + " " + p[1]; });
      draw(d, { color: c, w: 2, dur: 1.1 });
      pts.forEach(function (p, i) {
        node(p[0], p[1], { color: c, r: 2.2, delay: .18 + i * .17 });
      });
      after(1150, function () {
        labelAt(900, G.roof + 14, "PORTOFOL", c, { dir: -1, life: 2000 });
      });
    });

    after(2720, function () { status("PERFORMANCA MONITOROHET", c); });

    after(3400, function () {
      status("PORTOFOLI KONSOLIDOHET", c);
      rect(G.frameL, G.roof, G.frameR - G.frameL, G.pit - G.roof,
        { color: c, w: 1, opacity: .22, parent: lyKeep });
      node(900, G.roof + 14, { color: c, r: 2.4, live: true, parent: lyKeep });
    });

    /* the eighth beat needs room after the seventh, so it is placed
       explicitly rather than on finish()'s fixed 3500ms */
    after(4200, function () { status("PORTOFOLI I KONSOLIDUAR", c); });
  }

  /* ─────────────── 13. TRADING & DISTRIBUTION ───────────────
     Physics: consignments moving along routes, in and out. */
  function playTrading(c) {
    status("FURNIZIMI NË RRUGË", c);
    cameraThen([-16, -14, 1.022], [0, -4, 1.010], 1900);

    var dock = [G.rampRx - 96, G.grade - 12];
    rect(dock[0] - 14, dock[1] - 20, 74, 28, { color: c, w: 1.1, opacity: .9 });
    labelAt(dock[0] - 14, dock[1] - 22, "PRANIMI", c, { dir: -1, life: 2200 });
    after(200, function () { driveCar(1, 1, false, null, { approach: 3200 }); });

    /* the spine along B1 into the core */
    var spine = "M" + (dock[0] - 14) + " " + dock[1] + " H " + G.riser2;
    after(700, function () {
      draw(spine, { color: c, w: 1.3, dur: .45, opacity: .7 });
      packet(spine, { color: "#bcd2f4", count: 3, dur: 520, gap: 110, size: 4 });
    });

    /* consignments break out to technical destinations */
    var dests = [
      { x: G.mainLV.x + 30, y: G.mainLV.y + 8 },
      { x: G.server.x + 30, y: G.server.y + 8 },
      { x: G.plant.x + 22, y: G.plant.y + 8 },
      { x: G.nE, y: G.floors[4].branch },
      { x: G.nF, y: G.floors[2].branch }
    ];
    after(1300, function () {
      draw("M" + G.riser2 + " " + dock[1] + " V " + G.slabs[2],
        { color: c, w: 1.2, dur: .7, opacity: .75 });
      packet("M" + G.riser2 + " " + dock[1] + " V " + G.slabs[2],
        { color: "#bcd2f4", count: 3, dur: 700, gap: 130, size: 4, reverse: true });
    });
    dests.forEach(function (d, i) {
      after(1700 + i * 200, function () {
        var p = "M" + G.riser2 + " " + d.y + " H " + d.x;
        draw(p, { color: c, w: .9, dur: .26, opacity: .7 });
        packet(p, { color: "#d2e2ff", count: 1, dur: 280, size: 3.6 });
        after(300, function () { node(d.x, d.y, { color: c, r: 2.2, live: true, parent: lyKeep }); });
      });
    });

    /* outbound routes, kept minimal */
    after(2900, function () {
      status("DËRGESAT SHPËRNDAHEN", c);
      [[G.rampLx - 46, G.b1.lane - 22], [G.rampRx + 62, G.b1.lane - 22]].forEach(function (p, i) {
        var d = "M" + G.riser2 + " " + dock[1] + " H " + p[0];
        draw(d, { color: c, w: .8, dash: "5 4", opacity: .45, dur: .5, delay: i * .16 });
        packet(d, { color: "#bcd2f4", count: 1, dur: 520, delay: 220 + i * 160, size: 3.4 });
      });
    });

    after(3500, function () {
      draw(spine, { color: c, w: 1, opacity: .26, instant: true, parent: lyKeep });
      draw("M" + G.riser2 + " " + dock[1] + " V " + G.slabs[2],
        { color: c, w: 1, opacity: .24, instant: true, parent: lyKeep });
      hideCar(1);
    });

    finish("ZINXHIRI I FURNIZIMIT AKTIV", c);
  }

  /* ─────────────── 14. REAL ESTATE ───────────────
     Physics: light and warmth, not engineering. No packets, no risers.
     The camera pushes gently onto one apartment. */
  function playRealEstate(c) {
    status("PRONA PËRZGJIDHET", c);
    var warm = "rgba(255,214,158,.55)";

    var ux = G.unit.x, uw = G.unit.w, uf = G.floors[G.unit.floor];
    var ucx = ux + uw / 2, ucy = uf.branch + G.winH / 2;

    dim(.30);
    /* start wide, then push toward the selected apartment */
    camera(0, 0, 1.006, 800);
    after(1900, function () {
      camera(-(ucx - 512) * .10, -(ucy - 288) * .10, 1.032, 1500);
    });

    /* entrance warms first */
    after(180, function () {
      roomLight(G.doorL - 46, G.lobbyTop + 14, 214, 54, "rgba(255,208,146,.26)",
        { o: .75, dur: 700, parent: lyKeep });
      node(G.doorL + 61, G.grade - 6, { color: "#ffd9a0", r: 2.4, live: true });
    });

    /* interiors come on floor by floor, bottom to top */
    G.floors.slice().reverse().forEach(function (f, i) {
      after(320 + i * 230, function () {
        floorRooms(f, warm, { o: .5, stagger: 34, dur: 620, parent: lyKeep });
      });
    });
    after(900, function () { dim(.12); });

    /* a few available units outlined, quietly */
    after(1750, function () {
      G.unitAlt.forEach(function (u) {
        var af = G.floors[u[2]];
        rect(u[0] - 3, af.branch - 3, u[1] + 6, G.winH + 6,
          { color: c, w: .9, opacity: .5 });
      });
    });

    /* the selected apartment: brighter, with interior depth */
    after(2200, function () {
      status("PREZANTIMI PËRGATITET", c);
      rect(ux - 4, uf.branch - 4, uw + 8, G.winH + 8,
        { color: c, w: 1.4, opacity: .95, parent: lyKeep });
      /* one light for the whole flat — every pane of it at the same level */
      roomLight(ux, uf.branch, uw, G.winH, "rgba(255,232,190,.55)",
        { o: .82, dur: 800, parent: lyKeep });
      /* curtain edges */
      rect(ux + 2, uf.branch + 1, 4, G.winH - 2, { fill: "rgba(255,200,140,.4)", parent: lyKeep });
      rect(ux + uw - 6, uf.branch + 1, 4, G.winH - 2,
        { fill: "rgba(255,200,140,.4)", parent: lyKeep });
    });

    /* two small silhouettes, so the room reads as lived in */
    after(2700, function () {
      [[ux + 16, 9], [ux + 29, 10]].forEach(function (s, i) {
        var g = el("path", {
          d: "M" + s[0] + " " + (uf.branch + G.winH) + " v-" + s[1] +
             " a3 3 0 0 1 6 0 v" + s[1] + " Z",
          fill: "rgba(58,40,24,.62)", opacity: 0
        }, lyKeep);
        g.style.transition = "opacity .5s ease " + (i * .16) + "s";
        requestAnimationFrame(function () { g.style.opacity = 1; });
      });
    });

    /* minimal marker, only at the very end */
    after(3200, function () {
      var mx = ucx, my = uf.branch - 14;
      var g = el("g", { opacity: 0 }, lyKeep);
      el("path", { d: "M" + mx + " " + my + " l4.4 -6.6 a5 5 0 1 0 -8.8 0 Z",
                   fill: "none", stroke: c, "stroke-width": 1.1 }, g);
      el("circle", { cx: mx, cy: my - 9, r: 1.6, fill: c }, g);
      g.style.transition = "opacity .7s ease";
      requestAnimationFrame(function () { g.setAttribute("opacity", .92); });
    });

    finish("PRONA GATI PËR PREZANTIM", c);
  }

  /* ═══════════════════════════════════════════════════════════════════
     CONTROLLER
     Soft switching: the outgoing system fades before it is cleared, the
     camera recentres, and only then does the new sequence begin. The
     session token still invalidates every pending callback, so rapid
     clicking cannot leave an old sequence running.
     ═══════════════════════════════════════════════════════════════════ */
  var PLAYS = [
    playConstruction, playElectrical, playBuildingSystems, playSanitary,
    playElevators, playTelecom, playBMS, playSoftware, playSecurity,
    playFireSafety, playFacility, playInvestments, playTrading, playRealEstate
  ];
  var KEYS = [
    "construction", "electrical", "buildingSystems", "sanitary", "elevators",
    "telecom", "bms", "software", "security", "fire", "facility",
    "investments", "trading", "realEstate"
  ];
  var IDLE = "BËRTHAMA E ASHENSORËVE AKTIVE";

  var branches = Array.prototype.slice.call(ROOT.querySelectorAll(".zone-branch"));
  var current = -1;
  var startTimer = null;

  function accentOf(b) {
    var m = (b.getAttribute("style") || "").match(/--acc:\s*(#[0-9a-fA-F]{3,8})/);
    return m ? m[1] : "#e8c89a";
  }

  function hardClear() {
    /* lyExit is deliberately untouched — it is still winding the previous
       branch back and clears itself when it is done */
    clear(lyAnim);
    clear(lyKeep);
    lyAnim.style.transition = "none";
    lyKeep.style.transition = "none";
    lyAnim.style.opacity = 1;
    lyKeep.style.opacity = 1;
  }

  /* ── RETRACT ──────────────────────────────────────────────────────
     A branch is a system, and a system should leave the way it arrived.
     Rather than dissolving the outgoing layers, every run drawn by
     draw() is wound back along its own path — and in reverse order, so
     the far ends of the network withdraw first and the trunk goes last.
     Nodes, labels and fills stay up while that happens and only fade
     once the lines are mostly gone, which reads as the system powering
     down instead of the screen being wiped. */
  function retract(dur, root) {
    var runs = [].slice.call(root.querySelectorAll('path[data-run]'));
    if (!runs.length) return;
    runs.reverse();
    var step = Math.min(14, 190 / runs.length), lens = [];

    /* pass 1 — pin every run to its drawn state with no transition, so a
       line still drawing on cannot fight the withdrawal */
    runs.forEach(function (p) {
      var L;
      try { L = p.getTotalLength() || 0; } catch (e) { L = 0; }
      lens.push(L);
      if (!L) return;
      p.style.transition = "none";
      p.style.strokeDasharray = L;
      p.style.strokeDashoffset = 0;
    });
    /* one forced layout commits those start values for the whole set */
    root.getBoundingClientRect();
    /* pass 2 — wind them back out */
    runs.forEach(function (p, i) {
      if (!lens[i]) return;
      p.style.transition = "stroke-dashoffset " + dur +
        "ms cubic-bezier(.55,0,.85,.25) " + (i * step).toFixed(0) + "ms";
      p.style.strokeDashoffset = lens[i];
    });
  }

  /* ── HANDOVER ─────────────────────────────────────────────────────
     The outgoing branch is moved wholesale into its own layer, which
     then winds its runs back and fades. Because lyKeep and lyAnim are
     emptied immediately, the incoming branch can fire its first beat at
     the origin while the old system is still withdrawing behind it. The
     two cross rather than queue, so the switch feels roughly twice as
     quick while actually being gentler. */
  var exitTimer = null;
  function handOff(dur) {
    if (exitTimer) { clearTimeout(exitTimer); exitTimer = null; }
    clear(lyExit);                       /* a pending exit gives way at once */
    var kids = [].slice.call(lyKeep.childNodes).concat([].slice.call(lyAnim.childNodes));
    if (!kids.length) return;
    kids.forEach(function (n) { lyExit.appendChild(n); });
    lyExit.style.transition = "none";
    lyExit.style.opacity = 1;
    retract(dur, lyExit);
    lyExit.style.transition = "opacity 240ms ease " + Math.max(0, dur - 140) + "ms";
    lyExit.style.opacity = 0;
    exitTimer = setTimeout(function () {
      exitTimer = null;
      clear(lyExit);
      lyExit.style.transition = "none";
      lyExit.style.opacity = 1;
    }, dur + 300);
  }

  function resetScene() {
    token++;                                  /* invalidates pending callbacks */
    if (startTimer) { clearTimeout(startTimer); startTimer = null; }
    bTimers.forEach(clearTimeout);
    bTimers.length = 0;
    killList(bTweens);
    if (!ambientOn) ambientResume();
  }

  function select(i) {
    var b = branches[i];
    if (!b) return;
    var color = accentOf(b);

    stopHover();
    resetScene();
    branches.forEach(function (x, j) { x.setAttribute("aria-pressed", j === i ? "true" : "false"); });

    var lead = (current === -1 || reduce) ? 0 : 130;
    if (lead) {
      handOff(400);                      /* the old system withdraws behind */
      cameraReset(560);
    }
    current = i;
    sig = SIG[i] || SIG_DEF;             /* the new branch's physics */

    startTimer = setTimeout(function () {
      startTimer = null;
      hardClear();
      focusOn(i);
      PLAYS[i](color);
    }, lead);
  }

  /* ── hover previews (pointer devices only) ─────────────────────────
     A 250 ms dwell shows a one-shot hint of the system. It draws into
     its own layer and is wiped the moment the pointer leaves, so it can
     never collide with a running branch sequence. */
  var lyHover = el("g", { "class": "ly-hover" });
  var hoverTimer = null, hoverTweens = [];
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function hTween(o) { o.amb = false; var t = tween(o); hoverTweens.push(t); return t; }

  function stopHover() {
    if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
    hoverTweens.forEach(function (t) { t.dead = true; });
    hoverTweens.length = 0;
    clear(lyHover);
  }

  function preview(i, c) {
    clear(lyHover);
    var P = lyHover;
    switch (i) {
      case 1:   /* electrical — a pulse leaves the switchboard */
        el("rect", { x: G.mainLV.x, y: G.mainLV.y, width: G.mainLV.w, height: G.mainLV.h,
                     fill: "none", stroke: c, "stroke-width": 1, opacity: .8 }, P);
        zap("M" + (G.mainLV.x + G.mainLV.w) + " " + (G.mainLV.y + 16) + " H " + G.riser,
          { color: c, dur: .5, len: 20, w: 2.6, parent: P });
        break;
      case 4:   /* elevators — the shaft breathes */
        var sh = el("rect", { x: G.shaftL, y: G.slabs[0], width: G.shaftR - G.shaftL,
                              height: G.pit - G.slabs[0], fill: c, opacity: 0 }, P);
        hTween({ dur: 900, ease: ease.both,
                 on: function (t) { sh.setAttribute("opacity", .10 * Math.sin(Math.PI * t)); } });
        break;
      case 8:   /* security — one camera nudges */
        var cone = el("path", {
          d: "M" + (G.doorL - 26) + " " + (G.lobbyTop + 10) + " L" + (G.doorL + 14) + " " +
             (G.lobbyTop + 52) + " L" + (G.doorL - 22) + " " + (G.lobbyTop + 52) + " Z",
          fill: "color-mix(in srgb," + c + " 12%,transparent)", stroke: c,
          "stroke-width": .6, opacity: .85 }, P);
        cone.style.transformOrigin = (G.doorL - 26) + "px " + (G.lobbyTop + 8) + "px";
        cone.style.transition = "transform .7s cubic-bezier(.4,0,.3,1)";
        requestAnimationFrame(function () { cone.style.transform = "rotate(13deg)"; });
        break;
      case 9:   /* fire — one detector blinks */
        var f9 = G.floors[3];
        el("circle", { cx: G.nC, cy: f9.branch + 4, r: 3.2, fill: "#e0574f",
                       "class": "zg-alarm" }, P);
        break;
      case 13:  /* real estate — one apartment warms */
        var ux = G.unit.x, uf = G.floors[G.unit.floor];
        var w = el("rect", { x: ux, y: uf.branch, width: G.unit.w, height: G.winH,
                             fill: "rgba(255,226,178,.55)", opacity: 0 }, P);
        w.style.transition = "opacity .5s ease";
        requestAnimationFrame(function () { w.style.opacity = .7; });
        break;
      case 5:   /* telecom — one packet */
        packet("M" + G.server.x + " " + (G.server.y + 18) + " H " + G.riser + " V " + G.slabs[2],
          { color: c, count: 1, dur: 520, size: 3.4, parent: P });
        break;
      case 3:   /* sanitary — the riser takes a sip */
        fillPipe("M" + (G.riser - 5) + " " + (G.b2.deck - 12) + " V " + G.slabs[4],
          { color: c, w: 2.6, dur: 700, parent: P });
        break;
      default:  /* everything else: a quiet accent on its own home area */
        var home = [G.frameL + 40, G.grade - 20];
        if (i === 0) home = [G.footL + 60, G.pit];
        if (i === 2) home = [G.doorL - 20, G.doorY + 16];
        if (i === 6) home = [G.plant.x + 22, G.plant.y + 16];
        if (i === 7) home = [G.riser2, G.lobbyTop + 26];
        if (i === 10) home = [G.plant.x + 22, G.plant.y + 16];
        if (i === 11) home = [G.frameL - 26, G.grade + 14];
        if (i === 12) home = [G.rampRx - 96, G.grade - 12];
        var r0 = el("circle", { cx: home[0], cy: home[1], r: 3, fill: c, opacity: .9 }, P);
        var r1 = el("circle", { cx: home[0], cy: home[1], r: 3, fill: "none",
                                stroke: c, "stroke-width": 1 }, P);
        hTween({ dur: 800, ease: ease.out,
                 on: function (t) { r1.setAttribute("r", 3 + t * 13); r1.setAttribute("opacity", 1 - t); } });
    }
  }

  branches.forEach(function (b, i) {
    b.setAttribute("role", "button");
    b.setAttribute("tabindex", "0");
    b.setAttribute("aria-pressed", "false");
    b.setAttribute("data-branch", KEYS[i]);

    b.addEventListener("click", function () { select(i); });
    b.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        select(i);
      }
    });

    if (canHover && !reduce) {
      b.addEventListener("mouseenter", function () {
        if (current === i) return;              /* already playing in full */
        stopHover();
        hoverTimer = setTimeout(function () { preview(i, accentOf(b)); }, 250);
      });
      b.addEventListener("mouseleave", stopHover);
      b.addEventListener("focus", stopHover);
    }
  });

  status(IDLE);
})();
