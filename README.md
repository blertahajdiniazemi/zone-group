# ZONE GROUP — faqja kryesore e grupit

Ridizajn i plotë i `zonegroup-ks.com`. HTML, CSS dhe JavaScript të thjeshtë.
Pa mjete ndërtimi, pa varësi, pa pagesa mujore. Hapeni `index.html` me dy
klikime për ta parë.

E gjithë përmbajtja që sheh vizitori është në shqip. Kodi, emrat e
variablave dhe komentet teknike janë në anglisht — si te faqet e degëve.

---

## Skedarët

| Skedari | Çfarë është | E redaktoni? |
|---|---|---|
| `data.js` | Kompanitë, kategoritë, llojet e objekteve, fazat, shifrat, kontakti | **Po — gjithçka është këtu** |
| `index.html` | Struktura e faqes dhe vizatimi i objektit | Rrallë |
| `style.css` | Sistemi vizual | Vetëm për pamjen |
| `app.js` | Ndërton faqen nga `data.js` | Jo |
| `make_bldg.py` | Gjeneron prerjen e objektit | Vetëm për gjeometrinë |
| `CNAME` | Domeni për GitHub Pages | Jo |

**Rregull i vetëm i rëndësishëm: teksti nuk shkruhet në `index.html`.**
Gjithçka që lexohet vjen nga `data.js`. Nëse ndryshoni një emër kompanie
atje, ai ndryshon njëkohësisht te mega-menyja, sirtari, regjistri i
kompanive, miksi i projektit, cikli dhe fundfaqja.

Përjashtim i vetëm: lista e kompanive te **fundfaqja** është e shkruar
drejtpërdrejt në `index.html`. Kjo është me qëllim — motorët e kërkimit
dhe shfletuesit pa JavaScript duhet t'i shohin të katërmbëdhjetë lidhjet.
Nëse shtoni ose hiqni një kompani, përditësojeni edhe atje.

---

## Koncepti

**Faqja është një fletë vizatimi teknik.**

Korniza me vijë flokëzuese, shenjat në qoshe, referenca vertikale në të
majtë dhe blloku i titullit në fund vijnë nga vizatimi teknik — artefakti
që të katërmbëdhjetë kompanitë e prodhojnë dhe e lexojnë çdo ditë. Kjo e
ndan prindin nga çdo faqe holdingu me shabllon.

**Nënshkrimi është prerja e objektit.**

Vizatimi është prerje e vërtetë arkitekturore, jo skemë instalimesh.
Kjo është arritur me tri gjëra, dhe të tria janë të domosdoshme:

- **Poché** — muret, pllakat dhe themeli janë sipërfaqe të mbushura me
  kontur, jo vija. Kjo është konventa që e bën një prerje të lexohet si
  prerje. Pa të, vizatimi mbetet diagram.
- **Brendësia më e ndritshme se qielli** — vëllimi i brendshëm ka mbushje
  `#131A1E` mbi të zezën. Objekti bëhet trup i ngurtë, jo skelet.
- **Shkalla njerëzore** — njëmbëdhjetë figura njerëzore, shkallë me gjashtë
  shkallare për kat, dritare, mobilim. Pa këto asgjë nuk e thotë se sa i
  lartë është një kat.

Sistemet e ngjyrosura vijnë **mbi** arkitekturën dhe janë më të holla se
ajo. Struktura vizatohet gjithnjë në gri neutrale; bronzi i Engineering &
Construction shfaqet vetëm kur ajo kompani theksohet.

Një vizatim i vetëm, i përdorur dy herë:

- **Në hero** objekti ndërtohet vetë: dheu, themeli, pllakat një nga një
  nga poshtë lart, muret, lëkura me dritare, bërthama me shkallë, pastaj
  njerëzit. Vetëm pasi ndërtesa qëndron, sistemet ndizen një nga një.
  Rendi është i njëjti si në një kantier, dhe pikërisht kjo e bën të
  lexueshëm. Pas ndezjes, nëpër tuba dhe kabllo udhëtojnë pika drite —
  energjia lart, uji poshtë, të dhënat lart — dhe kabina e ashensorit
  lëviz nëpër bosht.
- **Te seksioni 04** e drejton vizitori: zgjidhni llojin e objektit dhe
  ndizen pikërisht sistemet që ai objekt kërkon.

Legjenda është e klikueshme, prandaj çdo sjellje me hover ka barasvlerën
e vet me prekje në celular.

### Ndarja 10 + 4

Kjo nuk është e sajuar — del nga shërbimet reale të degëve:

- **Dhjetë kompani janë sisteme fizike brenda objektit** dhe kanë secila
  një shtresë në vizatim.
- **Katër kompani rrethojnë objektin** — Software, Trading, Investments,
  Real Estate. Ato nuk janë tuba a kabllo, prandaj nuk kanë shtresë.

Prandaj një hotel tregon *10 sisteme · 10 kompani*, kurse një objekt
industrial tregon *8 sisteme · 9 kompani*: aty hyn edhe Trading për
furnizim, që nuk është sistem në mur.

---

## Ngjyrat

### Prindi është metal, jo ngjyrë

```css
--steel: #C4BEB2;   /* metal i furçuar */
```

Zgjedhja është e qëllimshme. Patina e bakrit (nuanca 176) e versionit të
vjetër binte pikërisht mbi Building Systems `#4CB5A7` dhe Sanitary
`#27BFC4` — prindi dukej si degë e pesëmbëdhjetë. Metali i furçuar është
i pangopur, prandaj nuk konkurron me asnjë nga të katërmbëdhjetat dhe
qëndron dukshëm **mbi** ekosistemin.

### Degët janë të dhëna, jo temë

Të katërmbëdhjetë ngjyrat janë marrë nga `--primary` i secilës faqe dege,
jo të supozuara:

| Kompania | Ngjyra |
|---|---|
| Engineering & Construction | `#C78157` |
| Electrical & Energy | `#F2C14E` |
| Building Systems | `#4CB5A7` |
| Zone Sanitary Systems | `#27BFC4` |
| Elevators | `#6F9FBC` |
| IT & Telecom | `#4F78E8` |
| Smart & Automation | `#876CFF` |
| Software & Development | `#B7F34A` |
| Security | `#2FB0D4` |
| Fire & Safety | `#E55353` |
| Facility Management | `#7FA46D` |
| Investments & Consulting | `#43856E` |
| Trading & Distribution | `#5E80BC` |
| Real Estate | `#F6C56B` |

Ngjyra e degës shfaqet vetëm kur një kompani, sistem ose disiplinë po
theksohet — kurrë si dekor. Prandaj lexohet si informacion.

Për tekst të vogël ngjyra ndriçohet pak me `color-mix`, që të kalojë
pragun e kontrastit. Pikat, vijat dhe kufijtë mbajnë ngjyrën e saktë të
markës.

---

## Tipografia

| Roli | Fonti | Pse |
|---|---|---|
| Titujt | **Archivo** (gjerësi e ndryshueshme) | Tipografi sinjalistike, inxhinierike. Përdoret në gjerësi 104–112%. |
| Teksti | **Outfit** | Lidhja me familjen — e përdorin 12 nga 14 degët. |
| Të dhënat | **DM Mono** | Referencat, numrat, etiketat teknike. |

Të tria i mbajnë saktë **ë** dhe **ç**, me shkronjë të madhe dhe të vogël.

Prindi nuk përdor më Newsreader. Titulli serif e bënte faqen të dukej
redaksionale; kjo është faqe inxhinierie.

---

## Si të ndryshoni gjërat

### Të dhënat e kontaktit
Krye e `data.js`, blloku `CONTACT`.

### Një kompani
Blloku `COMPANIES`. Fushat:

```js
{
  id:        "electrical",              // përdoret nga fazat dhe llojet e objekteve
  name:      "Zone Group Electrical & Energy",   // emri zyrtar i plotë
  shortName: "Electrical & Energy",     // si shfaqet te kartelat
  field:     "Elektrike dhe energji",   // etiketa e vogël mbi emër
  url:       "https://electrical-energy.zonegroup-ks.com",
  color:     "#F2C14E",                 // nga faqja e vet e kompanisë
  cat:       "ndertim",                 // id nga CATEGORIES
  layer:     "elektrike",               // shtresa në vizatim, ose null
  desc:      "…",                       // një ose dy fjali
  services:  ["…"]                      // katër të parat dalin si etiketa
}
```

Prefiksi mbi emrin llogaritet vetvetiu: `name` minus `shortName`. Prandaj
Sanitary shfaqet si **Zone / Sanitary Systems** e jo *Zone Group*, sepse
emri i saj zyrtar është *Zone Sanitary Systems*.

### Një lloj objekti
Blloku `PROJECT_TYPES`. Listoni id-të e kompanive që marrin pjesë
realisht. **Numrat në ekran llogariten nga kjo listë** — mos i shkruani
me dorë, sepse ndryshe do të mbeten të pasakta pas çdo redaktimi.

### Shifrat
Blloku `STATS`.

```js
{ value: "14", label: "kompani të specializuara", verified: true }
```

Në këtë bllok publikohen vetëm shifrat e konfirmuara.


### Dy mospërputhje emrash për t'u konfirmuar

- **Software.** Faqja e vjetër e prindit e quan *Software Development*;
  `<title>` i degës thotë *Zone Software & Development*; komenti brenda
  `content.js` thotë *ZONE GROUP SOFTWARE & DEVELOPMENT*. Këtu është
  përdorur **Zone Group Software & Development**. Zgjidhni njërin dhe
  bëjeni të njëjtë kudo.
- **Sanitary.** Faqja e degës thotë *Zone Sanitary Systems*, kurse teksti
  brenda saj thotë *Zone Group Sanitary Systems*. Këtu është përdorur
  **Zone Sanitary Systems**, sipas titullit zyrtar.

---

## Qasshmëria

- Çdo tekst kalon pragun **WCAG AA** (4.5:1). Vlera më e ulët në faqe
  është 4.54:1.
- Fokusi i tastierës është i dukshëm kudo, me kontur metalik.
- Legjenda, filtrat, llojet e objekteve dhe fazat janë butona të vërtetë
  me `aria-pressed`, jo elemente dekorative.
- Titujt janë hierarkikë: një `h1`, pastaj `h2` për secilin seksion.
- `prefers-reduced-motion` ndal çdo lëvizje. Vizatimi shfaqet i plotë
  menjëherë, me të dhjetë sistemet të ndezura.
- Vizatimi ka `aria-label` që përshkruan të dhjetë sistemet.

---

## Performanca

- Tre skedarë teksti, zero varësi, zero korniza.
- Vizatimi është SVG i shkruar me dorë — pa WebGL, pa Canvas, pa modele 3D.
- Animacioni i vizatimit nis vetëm kur hyn në pamje.
- Fontet ngarkohen me `preconnect` dhe `display=swap`.
- Rrjetë sigurie: pas 3.5 sekondash çdo element i mbetur i fshehur
  shfaqet, që faqja të mos mbetet bosh nëse `IntersectionObserver`
  dështon.

---

## Vendosja online

1. Ngarkoni `index.html`, `style.css`, `data.js`, `app.js` dhe `CNAME`
   në depon publike të GitHub.
2. **Settings → Pages**, burimi `Deploy from a branch`, dega `main`,
   dosja `/ (root)`.
3. Drejtoni `zonegroup-ks.com` te GitHub sipas
   <https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site>
4. Te **Settings → Pages** shënoni domenin dhe aktivizoni
   **Enforce HTTPS**.

Nën-domenet e degëve nuk preken. Ato mbeten ashtu siç janë.

---

## Shënime për mirëmbajtësin

**Mos e ktheni tekstin në `index.html`.** Numrat te seksioni 04 dhe te
cikli llogariten nga `data.js`. Nëse dikush i shkruan me dorë në HTML,
ata do të bëhen të pasaktë me redaktimin e parë dhe askush nuk do ta
vërejë.

**Vizatimi gjenerohet nga `make_bldg.py`.** Elementet përsëritëse —
dritaret, shkallët, figurat, detektorët, kuotat — shkruhen nga skripti,
që koordinatat të mbeten të sakta. Nëse ndryshoni gjeometrinë, redaktoni
skriptin dhe rigjeneroni; mos e redaktoni SVG-në me dorë brenda
`index.html`. Kuotat kryesore janë në krye të skriptit: `XL/XR` faqet e
jashtme, `SLABS` pllakat, `FLOORS` katet, `EL_L/ST_L/SH_L` bërthama.

**Vizatimi e ndryshon kuadrin në celular.** Nën 640px `app.js` ia ngushton
`viewBox`-in në `44 80 512 416` dhe CSS-ja fsheh tekstin e kuotave, që
objekti të mos zvogëlohet. Elementet jashtë asaj zone priten në celular.

**Sekuenca e ndërtimit është `data-b` te grupet `.bld`.** Numri është
radha, jo rendi i vizatimit. Rendi në dokument përcakton se çfarë mbulon
çfarë; `data-b` përcakton se çfarë shfaqet e para. Të dyja janë të ndara
me qëllim.

**Gjatësia e vijave llogaritet me `getTotalLength()`.** Prandaj çdo vijë e
re brenda një grupi `.sys--draw` vizatohet vetvetiu, pa numra të shkruar
me dorë në CSS.

**Kartela mbyllëse e regjistrit** nuk ka `data-cat`, prandaj filtrat e
lënë gjithnjë të dukshme. Kjo e mban rrjetën pa vrimë kur kompanitë janë
katërmbëdhjetë — numër që nuk pjesëtohet me tre.
