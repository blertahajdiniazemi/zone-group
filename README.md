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
| `data.js` | Kompanitë, kategoritë, fazat, shifrat, kontakti | **Po — gjithçka është këtu** |
| `index.html` | Struktura e faqes | Rrallë |
| `style.css` | Sistemi vizual i faqes | Vetëm për pamjen |
| `app.js` | Ndërton faqen nga `data.js` | Jo |
| `tower.css` | Pamja e vizualizimit të kullës | Jo |
| `tower.js` | Sjellja e vizualizimit të kullës | Jo |
| `tower.jpg` | Renderi i kullës, 1024 × 576 | Jo |
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

**Nënshkrimi është kulla.**

Në hero qëndron një render i vetëm i objektit — nga dy nivelet e
parkingut nëntokësor te çatia — mbi të cilin vizatohen sistemet teknike.
Renderi është `tower.jpg`; gjithçka tjetër është SVG dhe HTML të
vizatuara sipër tij.

Blloku ka tri shtresa, të gjitha të mbyllura brenda `.zone-stage`, që
regjistrimi të mos zhvendoset kurrë:

- **Renderi** — fotografia e objektit, plus disa blloqe `.zone-relight`
  që barazojnë temperaturën e dritës në ato dritare që janë ndriçuar më
  ftohtë se dhoma së cilës i përkasin.
- **Mbivendosja SVG** — një kanavacë `1024 × 576` ku vizatohen tubat,
  kabllot, nyjet, dritaret e ndezura, konet e kamerave dhe alarmet.
- **Kabinat e ashensorëve** — dy elemente HTML që udhëtojnë nëpër dy
  boshtet e vazhdueshme, me ndalesa te dyert e secilit kat.

Të gjitha koordinatat janë në hapësirën `1024 × 576` të renderit dhe
pozicionohen në përqindje. Prandaj blloku është plotësisht responsiv pa
asnjë llogaritje gjatësie në JavaScript, dhe proporcioni `16:9` ruhet me
`aspect-ratio` në çdo gjerësi.

**Lista e degëve është kontrolli.**

Poshtë renderit qëndrojnë katërmbëdhjetë kartela, një për secilën
kompani. Zgjedhja e njërës luan sekuencën e sistemit të asaj dege brenda
objektit: sistemi vjen nga origjina e vet — tabela kryesore, dhoma e
serverëve, bërthama — dhe shtrihet nëpër katet. Kur zgjidhni një degë
tjetër, e para tërhiqet përgjatë të njëjtave vija nga të cilat erdhi.

Në pajisjet me mi, qëndrimi mbi një kartelë për 250 ms jep një parapamje
të shkurtër. Në celular kjo nuk ekziston — kartelat janë butona me
`role="button"` dhe `aria-pressed`, dhe funksionojnë me prekje e me
tastierë njësoj.

### Ndarja 10 + 4

Kjo nuk është e sajuar — del nga shërbimet reale të degëve:

- **Dhjetë kompani janë sisteme fizike brenda objektit** — tuba, kabllo,
  boshte, detektorë. Sekuenca e tyre shtrihet nëpër katet e kullës.
- **Katër kompani rrethojnë objektin** — Software, Trading, Investments,
  Real Estate. Ato nuk janë tuba a kabllo, prandaj sekuenca e tyre
  luhet rreth objektit: në rrugë, në lobi, në ekranet e tij.

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
  id:        "electrical",              // përdoret nga fazat e projektit
  name:      "Zone Group Electrical & Energy",   // emri zyrtar i plotë
  shortName: "Electrical & Energy",     // si shfaqet te kartelat
  field:     "Elektrike dhe energji",   // etiketa e vogël mbi emër
  url:       "https://electrical-energy.zonegroup-ks.com",
  color:     "#F2C14E",                 // nga faqja e vet e kompanisë
  cat:       "ndertim",                 // id nga CATEGORIES
  desc:      "…",                       // një ose dy fjali
  services:  ["…"]                      // katër të parat dalin si etiketa
}
```

Prefiksi mbi emrin llogaritet vetvetiu: `name` minus `shortName`. Prandaj
Sanitary shfaqet si **Zone / Sanitary Systems** e jo *Zone Group*, sepse
emri i saj zyrtar është *Zone Sanitary Systems*.


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
- Kartelat e degëve, filtrat dhe fazat janë butona të vërtetë me
  `aria-pressed`, jo elemente dekorative. Kartelat e degëve kanë
  `role="button"`, `tabindex` dhe përgjigjen te Enter e Space.
- Titujt janë hierarkikë: një `h1`, pastaj `h2` për secilin seksion.
- `prefers-reduced-motion` ndal çdo lëvizje: kamera nuk zhvendoset,
  vijat vizatohen menjëherë dhe kabinat nuk udhëtojnë. Sistemi i degës
  së zgjedhur shfaqet i plotë, thjesht pa animacion.
- Renderi ka `aria-label` që përshkruan objektin dhe sjelljen e bllokut;
  mbivendosjet dekorative janë `aria-hidden`.

---

## Performanca

- Pesë skedarë teksti dhe një fotografi. Zero varësi, zero korniza.
- Vizualizimi është SVG dhe HTML mbi një render të vetëm — pa WebGL,
  pa Canvas, pa modele 3D.
- Renderi është skedar i veçantë (`tower.jpg`, ~390 KB), jo `data:` i
  ngjitur brenda HTML-së, prandaj shfletuesi e ruan në cache dhe
  `index.html` mbetet nën 25 KB.
- Fontet ngarkohen me `preconnect` dhe `display=swap`.
- Rrjetë sigurie: pas 3.5 sekondash çdo element i mbetur i fshehur
  shfaqet, që faqja të mos mbetet bosh nëse `IntersectionObserver`
  dështon.

---

## Vendosja online

1. Ngarkoni `index.html`, `style.css`, `data.js`, `app.js`, `tower.css`,
   `tower.js`, `tower.jpg` dhe `CNAME` në depon publike të GitHub.
   **`tower.jpg` është i domosdoshëm** — pa të, blloku i kullës mbetet
   bosh.
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

**Vizualizimi i kullës është i izoluar me qëllim.** Çdo klasë e tij
fillon me `zone-` ose `zg-`, çdo `@keyframes` me `zg-`, dhe tokenët e
tij të ngjyrave rrinë te `#zone-animation-block`, jo te `:root`. Në JS,
çdo kërkim në DOM niset nga ai element. Prandaj `tower.css` dhe
`tower.js` nuk mund ta prekin pjesën tjetër të faqes — dhe anasjelltas.
Nëse shtoni diçka atje, ruajeni të njëjtën rregull.

**Gjeometria është në hapësirën `1024 × 576` të renderit.** Të gjitha
koordinatat te `G` në krye të `tower.js` janë matur drejtpërdrejt mbi
`tower.jpg`. Nëse renderi zëvendësohet me një tjetër, ato duhen matur
sërish; asgjë nuk llogaritet vetvetiu. Pozicionimi bëhet në përqindje,
prandaj asnjë nga këto nuk varet nga gjerësia e ekranit.

**Renderi mbahet i pinguar derisa lista e degëve kalon poshtë tij.**
Kjo është `position:sticky` te `.zone-scene`. Që të funksionojë, asnjë
prind nuk guxon të ketë `overflow:hidden` — prandaj `body` dhe `.hero`
te `style.css` përdorin `overflow:clip`, me `hidden` si rezervë. Nën
800px lartësi ekrani pingimi lirohet, sepse renderi nuk do të nxinte nën
kokën e faqes.

**Sekuenca e secilës degë është një funksion te `PLAYS` në `tower.js`,**
me të njëjtin rend si kartelat te `index.html` dhe si `KEYS`. Të tria
duhet të mbeten të njëjtin rend. Ngjyra merret nga `--acc` që shkruhet
inline te secila kartelë, jo nga `data.js`.

**Kartelat e degëve janë tekst i shkruar në `index.html`,** jo i
gjeneruar nga `data.js`. Ky është përjashtim i dytë nga rregulli i
përgjithshëm, bashkë me fundfaqen. Nëse ndryshoni një emër kompanie te
`data.js`, përditësojeni edhe këtu.

**Kartela mbyllëse e regjistrit** nuk ka `data-cat`, prandaj filtrat e
lënë gjithnjë të dukshme. Kjo e mban rrjetën pa vrimë kur kompanitë janë
katërmbëdhjetë — numër që nuk pjesëtohet me tre.
