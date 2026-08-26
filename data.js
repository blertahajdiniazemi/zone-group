/* =====================================================================
   ZONE GROUP — SKEDARI I PËRMBAJTJES
   ---------------------------------------------------------------------
   Ky është i vetmi skedar që duhet ta redaktoni për të ndryshuar
   përmbajtjen e faqes: kontaktin, kompanitë, kategoritë, llojet e
   objekteve, fazat e projektit dhe shifrat.

   Struktura (index.html), dizajni (style.css) dhe sjellja (app.js)
   nuk kanë nevojë të preken.

   RREGULL: asnjë shifër në këtë skedar nuk duhet të jetë e sajuar.
   Çdo vlerë e paverifikuar shënohet me  verified: false  dhe shfaqet
   në faqe si vendmbajtëse e dukshme, që të mos publikohet gabimisht.
   ===================================================================== */


/* ---------------------------------------------------------------------
   1. KONTAKTI
   --------------------------------------------------------------------- */
const CONTACT = {
  displayPhone: "+383 49 588 211",
  callPhone:    "+38349588211",
  whatsapp:     "38349588211",
  email:        "info@zonegroup-ks.com",
  website:      "zonegroup-ks.com",
  bases:        "Prishtinë & Mitrovicë, Kosovë",
  coverage:     "Kosovë dhe rajon",
  hours:        "E hënë – E shtunë, 09:00 – 18:00"
};


/* ---------------------------------------------------------------------
   2. KATEGORITË E EKOSISTEMIT
   Katër fusha të nxjerra nga aktiviteti real i kompanive.
   --------------------------------------------------------------------- */
const CATEGORIES = [
  {
    id: "ndertim",
    name: "Ndërtim & Inxhinieri",
    line: "Struktura, instalimet dhe sistemet që formojnë objektin.",
    desc: "Nga punimet civile dhe konstrukcionet metalike te instalimet elektrike, hidraulike, ngrohja, ftohja, hyrjet dhe ashensorët — pjesa e objektit që ndërtohet, montohet dhe vihet në punë."
  },
  {
    id: "teknologji",
    name: "Teknologji & Rrjete",
    line: "Infrastruktura dixhitale dhe kontrolli i objektit.",
    desc: "Rrjete, kabllim strukturor, Wi-Fi, dhoma serverësh, automatizim, BMS dhe software i ndërtuar posaçërisht — shtresa që i lidh sistemet mes vete dhe i bën të menaxhueshme."
  },
  {
    id: "siguri",
    name: "Siguri & Operim",
    line: "Mbrojtja e objektit dhe funksionimi i tij i përditshëm.",
    desc: "Detektim dhe mbrojtje nga zjarri, videosurvejim, kontroll qasjeje, alarme, si dhe mirëmbajtja teknike që i mban këto sisteme në gjendje pune pas dorëzimit."
  },
  {
    id: "investime",
    name: "Investime & Furnizim",
    line: "Kapitali, pajisjet dhe prona rreth projektit.",
    desc: "Këshillim dhe strukturim investimesh, menaxhim projektesh, furnizim me pajisje teknike dhe portofol pronash — funksionet që e mbështesin objektin para dhe pas ndërtimit."
  }
];


/* ---------------------------------------------------------------------
   3. KOMPANITË  —  14 kompani
   ---------------------------------------------------------------------
   name    emri zyrtar (mos e ndryshoni pa arsye)
   url     nën-domeni zyrtar
   color   ngjyra e markës, marrë nga faqja e vet e kompanisë
   cat     id-ja e kategorisë më lart
   --------------------------------------------------------------------- */
const COMPANIES = [
  {
    id: "engineering",
    name: "Zone Group Engineering & Construction",
    shortName: "Engineering & Construction",
    field: "Inxhinieri dhe ndërtim",
    url: "https://engineering-construction.zonegroup-ks.com",
    color: "#C78157",
    cat: "ndertim",
    desc: "Koordinim teknik, punime ndërtimore, konstrukcione metalike, montime dhe përfundim i objektit deri te dorëzimi.",
    services: ["Inxhinieri", "Punime ndërtimore", "Konstrukcione metalike", "HVAC", "Montime teknike", "Fit-out dhe përfundim", "Renovim dhe modernizim"]
  },
  {
    id: "electrical",
    name: "Zone Group Electrical & Energy",
    shortName: "Electrical & Energy",
    field: "Elektrike dhe energji",
    url: "https://electrical-energy.zonegroup-ks.com",
    color: "#F2C14E",
    cat: "ndertim",
    desc: "Instalime elektrike, tabela, furnizim rezervë me UPS dhe bateri, panele solare dhe karikues për automjete elektrike.",
    services: ["Instalime elektrike", "Tabela elektrike", "Sisteme UPS", "Bateri dhe ruajtje energjie", "Panele solare", "EV chargers", "Efikasitet energjetik"]
  },
  {
    id: "building-systems",
    name: "Zone Group Building Systems",
    shortName: "Building Systems",
    field: "Hyrje dhe sisteme ndërtese",
    url: "https://building-systems.zonegroup-ks.com",
    color: "#4CB5A7",
    cat: "ndertim",
    desc: "Dyer automatike, kontroll i qasjes, sisteme parkingu, barriera, porta, turnstile dhe interfon për hyrjet e objektit.",
    services: ["Dyer automatike", "Kontroll i qasjes", "Sisteme parkingu", "Barriera automatike", "Porta automatike", "Turnstile", "Interfon dhe hyrje"]
  },
  {
    id: "sanitary",
    name: "Zone Sanitary Systems",
    shortName: "Sanitary Systems",
    field: "Sisteme sanitare",
    url: "https://sanitary-systems.zonegroup-ks.com",
    color: "#27BFC4",
    cat: "ndertim",
    desc: "Instalime sanitare dhe hidraulike, ujësjellës, kanalizim, tubacione, bojlerë dhe pika sanitare, me riparime e mirëmbajtje.",
    services: ["Instalime sanitare", "Instalime hidraulike", "Ujësjellës", "Kanalizim", "Tubacione", "Bojlerë dhe ujë i ngrohtë", "Kontroll i rrjedhjeve"]
  },
  {
    id: "elevators",
    name: "Zone Group Elevators",
    shortName: "Elevators",
    field: "Ashensorë",
    url: "https://elevators.zonegroup-ks.com",
    color: "#6F9FBC",
    cat: "ndertim",
    desc: "Instalim, mirëmbajtje, modernizim dhe servisim ashensorësh për ndërtesa banimi, objekte komerciale dhe publike.",
    services: ["Instalim ashensorësh", "Mirëmbajtje", "Modernizim", "Servis dhe riparim", "Zgjidhje të personalizuara"]
  },

  {
    id: "it-telecom",
    name: "Zone Group IT & Telecom",
    shortName: "IT & Telecom",
    field: "Rrjete dhe telekomunikim",
    url: "https://it-telecom.zonegroup-ks.com",
    color: "#4F78E8",
    cat: "teknologji",
    desc: "Rrjete kompjuterike, Wi-Fi profesional, fibër optike, kabllim strukturor, serverë dhe dhoma teknike.",
    services: ["Rrjete kompjuterike", "Wi-Fi profesional", "Fibra optike", "Kabllim strukturor", "Serverë dhe rack", "Telekomunikim", "Testim dhe diagnostikim"]
  },
  {
    id: "smart",
    name: "Zone Group Smart & Automation",
    shortName: "Smart & Automation",
    field: "Automatizim dhe BMS",
    url: "https://smart.zonegroup-ks.com",
    color: "#876CFF",
    cat: "teknologji",
    desc: "Ndërtesa dhe shtëpi inteligjente: BMS, IoT, ndriçim, klimë, perde dhe energji të menaxhuara nga një platformë e vetme.",
    services: ["Smart Home", "Smart Building", "BMS", "IoT", "Automatizim", "Ndriçim inteligjent", "Menaxhim energjie", "Integrim sistemesh"]
  },
  {
    id: "software",
    name: "Zone Group Software & Development",
    shortName: "Software & Development",
    field: "Software dhe integrime",
    url: "https://software-development.zonegroup-ks.com",
    color: "#B7F34A",
    cat: "teknologji",
    desc: "Aplikacione web dhe mobile, sisteme të personalizuara, API, databaza, cloud, DevOps dhe automatizim për operimin e biznesit.",
    services: ["Zhvillim software", "Aplikacione web", "Aplikacione mobile", "API dhe integrime", "Databaza", "Cloud", "DevOps", "Automatizim software"]
  },

  {
    id: "security",
    name: "Zone Group Security",
    shortName: "Security",
    field: "Siguri teknike",
    url: "https://zonesecurity.zonegroup-ks.com",
    color: "#2FB0D4",
    cat: "siguri",
    desc: "Kamera CCTV, video-mbikëqyrje, sisteme alarmi, interfonë dhe kontroll i qasjes, të përshtatura sipas objektit.",
    services: ["Kamera CCTV", "Video-mbikëqyrje", "Sisteme alarmi", "Interfonë dhe video-interfonë", "Kontroll i qasjes", "Mirëmbajtje teknike"]
  },
  {
    id: "fire",
    name: "Zone Group Fire & Safety",
    shortName: "Fire & Safety",
    field: "Mbrojtje nga zjarri",
    url: "https://fire-safety.zonegroup-ks.com",
    color: "#E55353",
    cat: "siguri",
    desc: "Detektim zjarri dhe tymi, alarm, ndriçim emergjent, sinjalistikë evakuimi dhe pajisje, me inspektim e testim periodik.",
    services: ["Detektim zjarri", "Detektim tymi", "Alarm për zjarr", "Ndriçim emergjent", "Sinjalistikë dhe evakuim", "Pajisje kundër zjarrit", "Inspektim dhe testim"]
  },
  {
    id: "facility",
    name: "Zone Group Facility Management",
    shortName: "Facility Management",
    field: "Mirëmbajtje dhe operim",
    url: "https://facility-management.zonegroup-ks.com",
    color: "#7FA46D",
    cat: "siguri",
    desc: "Mirëmbajtje teknike dhe preventive, ndërhyrje, pastrim profesional, inspektime dhe menaxhim i përditshëm i objektit.",
    services: ["Mirëmbajtje teknike", "Mirëmbajtje preventive", "Servisim dhe ndërhyrje", "Mirëmbajtje elektrike", "Pastrim profesional", "Inspektime dhe raportim"]
  },

  {
    id: "investments",
    name: "Zone Group Investments & Consulting",
    shortName: "Investments & Consulting",
    field: "Investime dhe këshillim",
    url: "https://investments-consulting.zonegroup-ks.com",
    color: "#43856E",
    cat: "investime",
    desc: "Analizë mundësish, strukturim investimesh, këshillim biznesor e teknik dhe menaxhim projektesh nga vlerësimi te realizimi.",
    services: ["Investime", "Këshillim biznesor", "Këshillim teknik", "Menaxhim projektesh", "Analizë fizibiliteti", "Due diligence", "Optimizim operacional"]
  },
  {
    id: "trading",
    name: "Zone Group Trading & Distribution",
    shortName: "Trading & Distribution",
    field: "Tregti dhe furnizim",
    url: "https://trading-distribution.zonegroup-ks.com",
    color: "#5E80BC",
    cat: "investime",
    desc: "Furnizim me shumicë dhe pakicë: elektronikë, pajisje telekomunikuese, kompjuterë, networking dhe pajisje industriale e teknike.",
    services: ["Elektronikë", "Pajisje telekomunikuese", "Kompjuterë dhe IT", "Networking", "Pajisje industriale", "Furnizim projektesh", "Logjistikë"]
  },
  {
    id: "realestate",
    name: "Zone Group Real Estate",
    shortName: "Real Estate",
    field: "Patundshmëri",
    url: "https://realestate.zonegroup-ks.com",
    color: "#F6C56B",
    cat: "investime",
    desc: "Shtëpi dhe banesa për shitje dhe me qira në Kosovë, me portofol që përditësohet dhe kontakt të drejtpërdrejtë.",
    services: ["Shitje pronash", "Qiradhënie", "Portofol banimi", "Prezantim i pronave"]
  }
];


/* ---------------------------------------------------------------------
   4. CIKLI I PROJEKTIT
   Fazat dhe kompanitë që marrin pjesë në secilën.
   --------------------------------------------------------------------- */
const PHASES = [
  {
    id: "projektim",
    name: "Projektim",
    desc: "Vlerësim i objektit, zgjidhje teknike dhe koordinim mes disiplinave para se të nisë puna në terren.",
    companies: ["engineering", "electrical", "smart", "fire", "it-telecom", "investments"]
  },
  {
    id: "furnizim",
    name: "Furnizim",
    desc: "Sigurimi i pajisjeve dhe materialeve sipas specifikimit, me logjistikë të organizuar drejt objektit.",
    companies: ["trading", "electrical", "building-systems", "sanitary", "elevators"]
  },
  {
    id: "instalim",
    name: "Instalim",
    desc: "Punimet në objekt: struktura, instalimet, sistemet e sigurisë, rrjetet dhe pajisjet.",
    companies: ["engineering", "electrical", "sanitary", "elevators", "building-systems", "fire", "security", "it-telecom"]
  },
  {
    id: "integrim",
    name: "Integrim",
    desc: "Sistemet lidhen mes vete: alarmi flet me ashensorin, qasja me videosurvejimin, energjia me automatizimin.",
    companies: ["smart", "it-telecom", "security", "fire", "software"]
  },
  {
    id: "venie",
    name: "Vënie në punë",
    desc: "Testim, matje, dokumentim dhe trajnim i personelit para dorëzimit të objektit.",
    companies: ["engineering", "fire", "elevators", "electrical", "smart"]
  },
  {
    id: "operim",
    name: "Operim dhe mirëmbajtje",
    desc: "Mirëmbajtje preventive, ndërhyrje, inspektime periodike dhe mbështetje teknike pas dorëzimit.",
    companies: ["facility", "elevators", "fire", "security", "electrical", "software"]
  }
];


/* ---------------------------------------------------------------------
   5. SHIFRAT
   verified: true   → vlera është e saktë dhe publikohet
   verified: false  → shfaqet si vendmbajtëse e dukshme
                      (zëvendësojeni vlerën dhe vendoseni në true)
   --------------------------------------------------------------------- */
const STATS = [
  { value: "14", label: "kompani të specializuara",       verified: true },
  { value: "4",  label: "fusha kryesore veprimi",         verified: true },
  { value: "10", label: "sisteme brenda një objekti",     verified: true },
  { value: "6",  label: "faza nga projektimi te operimi", verified: true },
  { value: "2",  label: "baza operative në Kosovë",       verified: true }
];




/* ---------------------------------------------------------------------
   6. ARSYET  —  seksioni "Pse ZONE GROUP"
   --------------------------------------------------------------------- */
const REASONS = [
  {
    title: "Një pikë përgjegjësie",
    text: "Kur sistemet vijnë nga i njëjti grup, nuk ka nevojë të përcaktohet se cili kontraktor e ka fajin. Adresa është një."
  },
  {
    title: "Sistemet projektohen bashkë",
    text: "Alarmi komunikon me ashensorin. Kontrolli i qasjes njeh vizitorin. Furnizimi rezervë përcakton cilat sisteme duhet të mbajë aktive. Këto lidhje përcaktohen që në fazën e projektimit, që sistemet të funksionojnë të koordinuara si një tërësi."
  },
  {
    title: "Ekipe të specializuara, jo gjeneraliste",
    text: "Secila kompani ka fushën e saj të ekspertizës, ekipin teknik dhe strukturën e vet, me përgjegjësi dhe ekspertizë të dedikuar."
  },
  {
    title: "Sisteme të koordinuara",
    text: "Të gjitha palët veprojnë sipas të njëjtit plan dhe të njëjtave standarde, me një pikë të qartë përgjegjësie edhe pas dorëzimit."
  },
  {
    title: "Mbështetje pas dorëzimit",
    text: "Objekti nuk mbaron kur ndizet sistemi i fundit. Mirëmbajtja dhe servisimi vijnë nga i njëjti grup që e instaloi."
  },
  {
    title: "Prezencë në terren",
    text: "Baza në Prishtinë dhe Mitrovicë, me ekipe që dalin në objekt në Kosovë dhe rajon."
  }
];
