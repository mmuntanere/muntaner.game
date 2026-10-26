# muntaner.game

Portfolio de serious games de Miquel Muntaner. React + Vite + Tailwind, amb dos components de 21st.dev adaptats:

- **Horizon Hero Section** → `src/components/ui/horizon-hero.tsx` (React) + `horizon-scene.ts` (three.js, es carrega sota demanda)
- **Scroll Gallery** → `src/components/ui/scroll-gallery.tsx` (galeria de projectes fixada amb GSAP)

## Treballar en local

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # genera dist/ (i 404.html, rutes de projectes i sitemap)
npm run preview    # serveix dist/
```

## On és cada cosa

| Vull canviar… | Fitxer |
|---|---|
| Textos de la interfície (ca/es/en) | `src/i18n/ui.ts` |
| Projectes: textos, estat, imatges, enllaços | `src/content/projects.ts` |
| Correu, LinkedIn, CV | `src/content/site.ts` |
| Colors i tipografies | `src/index.css` (bloc `@theme`) |
| Imatges | `public/img/projects/` |

### Estat dels projectes
Cada projecte té `status: "concept" | "prototype" | "playable"`. Quan tinguis captures reals, substitueix les imatges i posa `conceptArt: false`; l'etiqueta «Concept art» desapareix sola.

### Foto i CV
- Foto: substitueix el requadre de `src/components/sections/About.tsx` per una `<img>` (p. ex. `public/img/miquel.jpg`, 4:5).
- CV: copia el PDF a `public/cv/miquel-muntaner-cv.pdf` i posa `available: true` a `src/content/site.ts`.

### Imatges generades
`tools/og-image.html` és la font de `public/og-image.jpg` (1200×630; obre-la al navegador i fes-ne una captura a aquesta mida). El concept art es va generar amb Nano Banana; els originals a 2K són a `art-src/` (no es publiquen).

## Publicar a GitHub Pages

1. Crea el repositori i puja-hi aquesta carpeta a `main`.
2. Settings → Pages → Source: **GitHub Actions**. El workflow `.github/workflows/deploy.yml` compila i publica a cada push.
3. Custom domain: `muntaner.game` (`public/CNAME` ja hi és).
4. DNS al proveïdor del domini:
   - `A` @ → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `AAAA` @ → `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - `CNAME` www → `<usuari>.github.io`
5. Activa **Enforce HTTPS** (recomanat).

La versió anterior (HTML pur) és a `_v1/` com a còpia de seguretat; no es publica.
