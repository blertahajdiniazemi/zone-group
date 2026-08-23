# ZONE GROUP — faqja kryesore korporative (me lëvizje uji)

Faqe një-faqëshe për zonegroup-ks.com. HTML, CSS dhe JavaScript të
thjeshtë. Pa mjete ndërtimi, pa varësi, pa pagesa mujore.

Hapeni `index.html` me dy klikime për ta parë.

---

## Skedarët

| Skedari | Çfarë është | E redaktoni? |
|---|---|---|
| `index.html` | Tërë përmbajtja, përfshirë rreshtat e kompanive | **Po — teksti dhe lidhjet janë këtu** |
| `style.css` | Sistemi vizual dhe ngjyra e markës | Vetëm për pamjen |
| `script.js` | Koka, menyja, shfaqjet, diagrami | Jo |

Nuk ka skedar të dhënash me qëllim. Një faqe korporative ndryshon disa
herë në vit, prandaj teksti drejtpërdrejt në `index.html` është më i
thjeshtë për mirëmbajtje dhe më i mirë për motorët e kërkimit.

---

## Sistemi i ngjyrave — një numër për secilën kompani

Kjo është pjesa më e rëndësishme e sistemit.

Në krye të `style.css` gjendet:

```css
--brand-h: 176;   /* nuanca */
--brand-s: 34%;   /* ngopja */
--brand-l: 48%;   /* ndriçimi */
```

Çdo gradient, buton, kufi, ndriçim dhe efekt në tërë faqen rrjedh nga
këto tri vlera. **Për të krijuar faqen e një kompanie të grupit,
kopjoni këta tre skedarë dhe ndryshoni vetëm `--brand-h`.** Asgjë
tjetër nuk duhet prekur.

Nuancat e propozuara janë në listë brenda `style.css`, p.sh.:

| Kompania | `--brand-h` |
|---|---|
| ZONE GROUP (prindi) | 176 — patinë bakri |
| Zone Group Security | 356 |
| Zone Group Elevators | 210 |
| Zone Group Smart & Automation | 265 |
| Zone Group IT & Telecom | 194 |
| Zone Group Electrical & Energy | 42 |
| Zone Group Fire & Safety | 18 |
| Zone Group Building Systems | 152 |
| Zone Group Engineering & Construction | 28 |
| Zone Group Facility Management | 232 |
| Zone Group Real Estate | 38 |
| Zone Group Trading & Distribution | 300 |
| Zone Group Investments & Consulting | 88 |
| Zone Sanitary Systems | 188 |

### Pse patina e bakrit për prindin

Ngjyra e ZONE GROUP është patina që merr bakri me kohë — e ftohtë,
minerale, arkitekturore. Është ngjyrë materiali, jo modë, prandaj nuk
vjetërsohet. Real Estate është i ngrohtë (ar dhe magenta), kështu që
prindi qëndron qartë veç, brenda të njëjtit sistem.

---

## Si të lidhet një kompani me faqen e vet

Çdo kompani është një rresht në seksionin **02 · Kompanitë**. Në versionin aktual të gjitha katërmbëdhjetë kompanitë kanë lidhje aktive drejt nën-domeneve të tyre.

Kur një kompani të ketë adresën e vet, bëni katër ndryshime te ai
rresht. Përdorni rreshtin e Real Estate (numri 10) si model — është
tashmë në formën përfundimtare.

1. `href="#"` → adresa e vërtetë
2. klasa `row--soon` → `row--live`
3. shtoni `target="_blank" rel="noopener"`
4. `<span class="row__soon">Së shpejti</span>` →
   ```html
   <span class="row__go">
     Hap faqen <span class="row__arw" aria-hidden="true">↗</span>
   </span>
   ```

Përditësoni edhe listën në fund të faqes nëse doni lidhje aty.

---

## Lidhja me Zone Group Real Estate

Rreshti i Real Estate përdor nën-domenin `https://realestate.zonegroup-ks.com`.

Zone Sanitary Systems përdor `https://sanitary-systems.zonegroup-ks.com` dhe është shtuar si kompania nr. 14, si në regjistrin kryesor ashtu edhe në footer.

---

## Vendosja online

1. Krijoni një depo të re **publike** në GitHub, p.sh. `zonegroup`.
   Mbajeni të ndarë nga `zone-real-estate`.
2. Ngarkoni `index.html`, `style.css` dhe `script.js`.
3. **Settings → Pages**, burimi `Deploy from a branch`, dega `main`,
   dosja `/ (root)`.
4. Për domenin: shtoni një skedar `CNAME` me një rresht,
   `zonegroup-ks.com`, pastaj drejtoni domenin te GitHub sipas
   https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site
5. Te **Settings → Pages** shënoni domenin dhe aktivizoni
   **Enforce HTTPS**.

---

## Të dhëna për t'u zëvendësuar para publikimit

- **`info@zonegroup-ks.com`** — vendmbajtëse. Shfaqet te kontakti dhe
  në fund. Krijoni adresën e vërtetë ose ndryshojeni.
- **Adresa e selisë** — tani vetëm "Prishtinë, Kosovë". Shtoni rrugën
  kur të doni ta bëni publike.
- **Orari** — tani E hënë – E premte, 08:00 – 17:00.
- **Përshkrimet e kompanive** — një rresht për secilën, të shkruara si
  përmbledhje e besueshme e fushës. Lexojini dhe korrigjoni çdo gjë që
  nuk pasqyron saktë atë që ofroni.

Numri `+383 49 588 211` është i saktë dhe thirret me një prekje në
celular.

---

## Vendimet e dizajnit

**Regjistër, jo katërmbëdhjetë kartela.** Kompanitë janë rreshta me numër,
emër dhe një rresht përshkrimi. Katërmbëdhjetë kartela do të dukeshin si
mur reklamash; një regjistër lexohet si grup serioz dhe lë faqen të
marrë frymë.

**Ngjyra si ngjarje, jo dekor.** Patina shfaqet vetëm te numrat e
seksioneve, butonat, nyja e diagramit dhe rreshti aktiv. Kur hapni një
rresht aktiv, ngjyra hyn nga e majta. Pikërisht sepse është e rrallë,
lexohet si veprim e jo si zbukurim.

**Diagrami i integrimit.** Katërmbëdhjetë linja që vizatohen dhe bashkohen
në një nyje të vetme. E thotë vizualisht atë që teksti do ta pohonte
me fjalë. Të gjitha linjat përfaqësojnë kompanitë aktive dhe bashkohen në një nyje të vetme.

**Tipografia.** Outfit dhe DM Mono vijnë nga Real Estate, që faqet të
ndihen familje. Titujt janë Newsreader e jo Fraunces, që prindi të ketë
zërin e vet — më i qetë dhe më institucional se dega.

Gjithçka ndalet me `prefers-reduced-motion`, me përmbajtjen e dukshme.



---

## Lëvizja e ujit

**Drejtimi i rrjedhës: nga jashtë nga brenda.** Gjithçka bashkohet
drejt qendrës — valët udhëtojnë nga të dy skajet dhe takohen në mes,
rrymat rrëshqasin nga brenda, treguesi i lëvizjes mbushet nga të dy
anët njëkohësisht. Kjo është e njëjta ide që e thotë diagrami:
katërmbëdhjetë kompani, një pikë. Nëse shtoni diçka më vonë, bëjeni të
rrjedhë njësoj — pikërisht kjo e mban faqen si një trup i vetëm uji e
jo si një grumbull efektesh.

**Stili: ujë i thellë e i qetë, jo llavë.** Real Estate rrjedh poshtë
e djathtas, i ngrohtë dhe i shpejtë. Prindi rrjedh nga brenda, i ftohtë
dhe i ngadaltë. E njëjta familje, histori tjetër. Hipnotike përmes
durimit, jo përmes intensitetit — periudha të gjata dhe tejdukshmëri e
ulët, që teksti të mbetet i lexueshëm.

| Efekti | Ku | Si |
|---|---|---|
| Rrymat | Pas gjithçkaje | Katër masa të turbullta në cikle 53s–89s. Periudhat janë të pabarabarta me qëllim, që modeli të mos përsëritet dukshëm. |
| Valët | Mes seksioneve | Dy gjysma: e majta udhëton djathtas, e djathta është pasqyruar. Takohen në mes. |
| Trazimi | Valët | Shpejtësia e lëvizjes ushqen `--churn`. Sa më shpejt lëvizni, aq më të larta bëhen valët. |
| Treguesi | Kreu i faqes | Sustë e vërtetë: e tejkalon nivelin dhe kthehet, si sipërfaqja e lëngut. |
| Dalja në sipërfaqe | Përmbajtja | Ngrihet dhe fokusohet përmes turbullimit, si diçka që del mbi ujë. |
| Valëzimi | Rreshtat aktivë | Niset nga pika ku e prekni, jo nga qendra. |
| Nyja | Diagrami | Rrahje e ngadaltë me unazë që shpërndahet, dhe gjurmë drite që udhëtojnë përgjatë linjave drejt saj. |

Gjithçka ndalet me `prefers-reduced-motion`: uji fshihet, turbullimi
hiqet, përmbajtja mbetet e plotë dhe e dukshme.

**Uji e ndjek markën.** Të gjitha ngjyrat e lëvizjes rrjedhin nga
`--brand-h`, prandaj faqja e çdo kompanie e merr ujin e vet me të
njëjtin numër të vetëm.

### Për ta qetësuar

- **Më pak valë:** te `.tide__back` dhe `.tide__front` ulni vlerat e
  fundit (`0.13` dhe `0.085`).
- **Pa reagim ndaj lëvizjes:** te `.tide__svg` ndryshoni
  `scaleY(calc(1 + var(--churn) * 0.42))` në `scaleY(1)`.
- **Pa rryma:** fshini `<div class="currents">` nga `index.html`.
- **Pa turbullim gjatë daljes:** te `.js .rise` hiqni `filter: blur(7px)`.

---

## Shënime për mirëmbajtësin

Dy gabime u kapën gjatë ndërtimit të versionit të parë dhe janë
shmangur këtu. Vlen t'i dini nëse e zgjeroni faqen:

1. **Mos vendosni `clip-path` te një element me klasën `.rise`.**
   Chromium e llogarit `clip-path`-in e vetë elementit te
   IntersectionObserver, prandaj një element i prerë raporton zero
   sipërfaqe dhe nuk shfaqet kurrë — e tërë faqja mbetet bosh. Këtu
   përdoret vetëm `opacity` dhe `transform`. Ka edhe një rrjetë sigurie
   në `script.js` që pas 3.5 sekondash shfaq çdo gjë të mbetur.

2. **`.head__cta` ka nevojë për `.head` para vetes** në media query.
   Rregulli `.btn` vjen më vonë me të njëjtën specifikë, prandaj pa
   këtë butoni do të mbetej i dukshëm në celular dhe do të thyhej në
   tri rreshta.
