# Farmer Horgásztó — weboldal

Statikus HTML/CSS/vanilla JS oldal (nincs build lépés). Nyelv: **kizárólag magyar**.
Deploy: Cloudflare Pages (root = a repó gyökere, build command nincs).

## Oldalak

```
index.html            főoldal (nagy hero + bevezető + 6 szolgáltatáskártya + horgászversenyek)
arak.html             napijegyek, halas jegy, halárak, szállásdíj, nyitvatartás
szolgaltatasok.html   6 szolgáltatáskártya + HORGÁSZVERSENYEK RENDEZÉSE
szallas.html          szobák + sátorozás, éjszakai horgászat, amit biztosítunk
rendezvenyterem.html  terem, ideális választás, felszereltség, bérleti díj
galeria.html          galéria 3 csoportban (tópart / terület / nyár)
rolunk.html           a tó bemutatása
kapcsolat.html        elérhetőségek, megközelítés, kapcsolati űrlap
impresszum.html       Moltax Kft. adatai
adatkezeles.html      adatkezelési tájékoztató (12 pont)
feltetelek.html       általános foglalási és szolgáltatási feltételek (20 pont)
assets/css/style.css  minden stílus, számozott szekciókkal
assets/js/main.js     mobil menü + görgetésre megjelenő animáció + űrlap beküldése
assets/img/icons.svg  SVG sprite, 30 ikon
assets/img/contours.svg  a tó mélységtérképének szintvonalai (maszk)
images/               nagy felbontású fotók (eredetik)
tools/serve.py        helyi előnézet
tools/optimize_images.py  web-méretű képek készítése
```

A fejléc és a lábléc minden oldalon azonos markup — ha módosítod, **mindegyik
HTML-fájlban** át kell vezetni (nincs template motor).

## Design

A tervek (Farmerto.docx mockupjai) alapján: sötétzöld fejléc/lábléc, krém
háttér, arany kiemelés, sűrű nagybetűs Oswald címek.

| Változó | Érték | Hol |
|---|---|---|
| `--dark` | `#1a2416` | fejléc, lábléc, sötét panelek |
| `--dark-2` | `#22301c` | jegykártyák alsó sávja |
| `--cream` | `#f1eae2` | oldal háttér |
| `--paper` | `#f8f4ec` | világos kártyák |
| `--sand` | `#e6dfd0` | tónusos panelek |
| `--gold` | `#c2a44b` | aktív menüpont, aláhúzások, kiemelt szöveg |
| `--haze` | `#e0e2d7` | párás, hűvös szekciósáv (`.sec--haze`) |
| `--deep` | `#111b12` | legmélyebb szekciósáv (`.sec--deep`) |

Betűk: **Oswald** (címek, menü, gombok, árak) · **Roboto** (folyószöveg) ·
**Great Vibes** (csak a rendezvényterem kézírásos alcíme).

### Atmoszféra

A háttér nem egyetlen lapos krém. A `body` négy réteget hordoz: két nagy,
lágy páraudvart, egy függőleges tónust és a papírszemcsét (`--grain`). A
páraudvarok `background-attachment:fixed`, ezért nem görögnek a
tartalommal — így az az érzés, hogy lefelé haladunk a vízoszlopban.
Kis kijelzőn és érintéses eszközön a rögzítés kikapcsol, mert minden
görgetésnél újrafestene.

A szekciók háromféle mezőn állnak, és egy lapon belül váltakoznak:
`.sec` (átlátszó, a légtér látszik át), `.sec--haze` (párás sáv fénylő
felső peremmel és leülő aljjal), `.sec--deep` (mélyzöld, szintvonalakkal).
A `.sec--sand` és `.sec--dark` változatlan.

**A szintvonalak** a `contours.svg`-ből jönnek, CSS-maszkként — így egy
fájl bármilyen színt fel tud venni. Csak a sötét mezőkben jelennek meg
(`.hl`, `.sec--deep`, `.ftr`, `.ctabar--dark`), halkan. A szabály
`@supports`-ban áll: maszk-támogatás híján a színréteg letakarná a
szekciót, így inkább elmarad a díszítés. Újragenerálás: a
`tools/gen_contours.py`.

### Fotósáv (`.band`)

Teljes szélességű képsáv, ami két szekció között választ el — ott, ahol a
szöveg megülne. Egy oldalon legfeljebb egy. A kép alja sűrűbb, ahogy a tó
tükre is besötétül a part felé. Jelenleg: `index` (DSC_5424),
`arak` (DSC_5421), `szallas` (DSC_5388), `kapcsolat` (DSC_5517).

A `szallas` sávja szándékosan a sötét, alkonyati kép (DSC_5388): ezen az
oldalon az éjszakázásról van szó. A napkelte (DSC_5424) ezért a főoldalra
került.

A sáv a képet teljes szélességben feszíti ki, ezért **2000 px-es fotó
kell hozzá** — ugyanaz a mérték, mint az aloldali fejléceknél. A főoldal
sávja egyelőre kivétel: a DSC_5424 csak 1600 px. Az eredetije 6016 px,
tehát újravágható.

A sávban álló szöveg **mindig a lapon már meglévő tény** — a sáv nem hoz
új állítást. Az `index` sávja a tó három adatát is kiírja
(`.band__m`); a többi csak egy sort.

### Mozgás

Egyetlen megkomponált pillanat van: a főoldal nyitása, ahol a hero képe
lassan leül, és a szöveg utána érkezik (22–23. szakasz). Minden más
visszafogott — a `.rv` megjelenés 22px/0.8s helyett 10px/0.5s, a galéria
csempéi pedig csoportosan jönnek, nem egyenként lépcsőzve. A korábbi
kaszkád a fotókról vitte el a figyelmet.

## Ikonok

Két forrás:

1. **SVG sprite** — `assets/img/icons.svg`, használat:

```html
<svg class="ico"><use href="assets/img/icons.svg#rod-fish"/></svg>
```

2. **PNG vektorgrafikák** az Árak oldal jegykártyáin (`.tico` osztály):
   `images/jegy-horgaszat.png`, `jegy-ejszaka.png`, `jegy-gyerek.png`,
   `jegy-nyugdijas.png`, `jegy-vendeg.png`.
   (Az eredeti ékezetes fájlnevek — horgászat.png, nyugdíjas.png,
   vendégjegy.png, 2.png, gyerek.png — át lettek nevezve, mert ékezetes
   fájlnevek egyes kiszolgálókon 404-et adnak.)

**FONTOS — az ikonok csak kiszolgálva látszanak.** A külső fájlra hivatkozó
`<use href="assets/img/icons.svg#...">` `file://` alatt blákkolva van (Chrome
és Firefox is tiltja), ezért ha duplán rákattintva nyitod meg a HTML-t, az
ikonok helyén üres foltok lesznek. Mindig így indítsd:

```
python tools/serve.py
```

Elérhető sprite id-k: `rod-fish`, `angler-child`, `angler-senior`, `group`,
`fish-two`, `fish-small`, `cabin`, `clock`, `id-card`, `camera`, `bed`,
`shower`, `toilet`, `tent`, `pines-water`, `calendar`, `moon-water`,
`cutlery`, `table-chairs`, `tag`, `chat`, `trophy`, `pot`, `oven`, `check`,
`pin`, `phone`, `mail`, `leaf`, `fish-logo`.

## Képek

Az `images/` mappa a **web-méretre optimalizált** képeket tartalmazza
(összesen ~11 MB). A fájlnevek megegyeznek az eredetiekkel, ezért a HTML-ben
nincs `images/web/` útvonal — minden `images/<név>` marad.

Méretek: hero 2560 px · aloldali fejlécek és nagy galéria-csempék 2000 px ·
a többi fotó 1600 px · jegyikonok 512 px. JPEG q82, progresszív.

**Az eredeti, nagy felbontású fotók (6016 px, ~446 MB) NEM a repóban vannak.**
Tartsd őket külön mappa alatt — nyomtatáshoz vagy újravágáshoz kellhetnek.

Újraoptimalizálás (ha új fotó jön):

```
python tools/optimize_images.py            # images/ -> images_web/
python tools/optimize_images.py --inplace  # helyben, előtte mentéssel
```

Miért fontos: egy 6016×4016-os JPEG kb. **96 MB memóriát** foglal dekódolás
után, függetlenül a fájlmérettől. 23 ilyen kép a galérián akadozó görgetést
okoz — innen jött a laggolás.

### Nem a DSC-sorozatból származó képek

Két fájl nem a farmeri fotósorozat része, ezért az `optimize_images.py`
újrafuttatása nem állítja elő őket. **Mindkettő a Parton-oldal
fotókészletéből származik** (`../parton_website/assets/img/`) — a
rendezvényterem ugyanaz a helyszín, ezért a termi fotók átvehetők:

- `images/szallas-szoba.jpg` — belső szobafotó (kétágyas szoba),
  forrás: `szallas-hero-1200.jpg`.
  A `szallas.html` és a szolgáltatáskártyák használják.
- `images/terem-elrendezes.jpg` — a terem négyszemélyes asztalokkal,
  forrás: `rend-5-2200.webp` → 1600 px JPEG q82. A farmeri termi
  sorozatban csak öt belső fotó van, a galéria hatodik csempéjéhez pedig
  kellett még egy — és ez a kép egyben a „többféle elrendezéssel"
  állítást is alátámasztja, mert a többi fotón hosszú, bankett-asztalok
  állnak.

  ```
  sips -s format jpeg -s formatOptions 82 \
       ../parton_website/assets/img/rend-5-2200.webp --out /tmp/r5.jpg
  sips /tmp/r5.jpg --resampleWidth 1600 -s format jpeg \
       -s formatOptions 82 --out images/terem-elrendezes.jpg
  ```

A Parton-készletben további, itt még nem használt termi fotók vannak:
`rend-3` (gyertyás-virágos asztaldísz közelről), `rend-4` (hosszú
bankett-asztalok másik szögből), `rend-hero` (a terem sarka képekkel).

## Nyitott kérdések a megbízónak

- **Terem befogadóképessége:** az ÁSZF szerint max **48 fő**, a rendezvényterem
  mockup szerint **50 fő**. Az oldalon most 48 fő szerepel (az ÁSZF alapján).
- **Hiányzó fotók:** belső kép a szobákról és a rendezvényteremről már van,
  a Parton-készletből átvéve (lásd „Nem a DSC-sorozatból származó képek").
  **Sátras fotó továbbra sincs** — a sátorozás-kártyákon most tóparti,
  füves terület látszik, nem felállított sátor.
- **Tárhelyszolgáltató adatai** hiányoznak az impresszumból.
- **Kameraszabályzat**: az adatkezelési tájékoztató 10. pontja utal rá,
  de a részletes szabályzat még nincs meg.
- A mockup láblécében `+36 20 123 4567` szerepel — ez placeholder volt.
  Az oldalon két valódi szám van, cél szerint szétválasztva:
  **horgászat 06 20 553 2113**, **rendezvény 06 70 326 2692**. A lábléc
  mindkettőt feliratozva hozza, az árak oldal CTA-ja a horgászati számot,
  a jogi oldalak (impresszum, adatkezelés, feltételek) mindkettőt.

## Kapcsolati űrlap

A `kapcsolat.html` alján lévő űrlap a **Web3Forms** végpontjára küld
(`https://api.web3forms.com/submit`). A statikus oldal magától nem tud
levelet küldeni, ezért kell hozzá külső szolgáltató.

**Beüzemelés — egy lépés:**

1. Regisztráció a web3forms.com oldalon. **Bármelyik olvasható e-mail-cím
   megteszi** — a kulcs nem a domainhez, hanem a fiókhoz tartozik. Amíg az
   `info@farmerhorgaszto.hu` postafiók nem él, jó egy személyes cím is; ha
   később elkészül, a címzettet a Web3Forms felületén kell átállítani, a
   kulcs marad, kódot nem kell módosítani.
2. A kulcsot a `kapcsolat.html`-ben a `WEB3FORMS_ACCESS_KEY` helyére kell
   beírni:

   ```html
   <input type="hidden" name="access_key" value="ide-jön-a-kulcs">
   ```

Amíg a helykitöltő ott van, az űrlap nem küld: a beküldésre magyar
hibaüzenettel a telefonszámra irányít, hogy egyetlen érdeklődés se menjen
a semmibe. (Szándékosan a telefonszámra, nem az e-mail-címre — az a
postafiók még nem él.) A kulcs nyilvános a HTML-ben — a
Web3Forms így működik, a szűrést a robotcsapda (`botcheck` mező) és a
szolgáltató oldali spamvédelem végzi.

**Amit érdemes még beállítani a Web3Forms felületén:** a beérkező levelek
címzettje, a válasz-cím (a `email` mező alapján), és — ha jön spam —
captcha (pl. Cloudflare Turnstile, ami a Pages-deployhoz amúgy is illik).

**Adatkezelés:** az `adatkezeles.html` 3. pontja már a weboldali űrlapot
is felsorolja adatfelvételi csatornaként, a 6. pont pedig az
űrlapszolgáltatót címzettként. Ha a szolgáltató változik, ezt a két
pontot is át kell írni. Az űrlapon kötelező jelölőnégyzet hivatkozik a
tájékoztatóra.

## Későbbi teendők

- **„Akvárium” szekció**: AI-generált tóháttér + úszkáló halak canvason,
  kattintásra kiúszik az aktuális, beúszik a következő, rövid leírással.
  A helye be van jelölve kommenttel az `index.html`-ben.
- Fotósáv a `szolgaltatasok`, `rendezvenyterem` és `galeria` oldalra is,
  ha jön hozzá alkalmas (fekvő, vízszint-központú) fotó.
- `images/DSC_5424.jpg` újravágása 2000 px-re az eredetiből
  (`python tools/optimize_images.py`), mert a főoldal fotósávja
  most 1600 px-es képet feszít ki.
- `sitemap.xml`, `robots.txt`, favicon, og kép.
- Saját logó (jelenleg SVG hal + Oswald wordmark).

## Helyi előnézet

```
python tools/serve.py
```

Aztán: http://localhost:8000
