# Souwest Lawn & Garden Service

Website for Souwest Lawn & Garden Service (Adelaide, SA) featuring a quote enquiry form with automatic photo compression and preview thumbnails, services breakdown, gallery slideshow, interactive before & after comparison slider, team page, and quick message popup.

## Local Development

```bash
npm install
npm run dev
```

Runs on `http://localhost:3000`.

## Project Structure

```text
.
├── index.html          # Quote request page with option chips & photo upload
├── services.html       # Services & FAQ page
├── gallery.html        # Photo slideshow & before & after comparison
├── staff.html          # Team profiles
├── thanks.html         # Submission confirmation page
├── 404.html            # Custom 404 page
├── css/
│   └── styles.css      # Site theme, layout, slideshow & responsive styles
├── js/
│   ├── script.js          # Footer year, active nav, FormSubmit redirect & thanks countdown
│   ├── email.js           # Quote chips, suburb pills & client-side photo compression/preview
│   ├── emailwindow.js     # Quick message floating popup (desktop)
│   ├── gallerypreload.js  # Image preloader & async decode helper
│   ├── previewwindow.js   # Smooth crossfade photo slideshow with touch & hover controls
│   ├── beforeafter.js     # Interactive Before & After slider with 5s smooth auto-cycling
│   └── transitions.js     # Smooth page transition overlay
├── assets/
│   ├── logo.png           # Header wordmark & social icon
│   ├── logofooter.webp    # Footer mark
│   └── riley.webp         # Team photo
├── gallery/
│   ├── beforeandafterphotos/
│   │   ├── lawnresetbefore.webp / lawnresetafter.webp
│   │   ├── hedgeresetbefore.webp / hedgeresetafter.webp
│   │   └── bedresetbefore.webp / bedresetafter.webp
│   ├── adelaidelawn.webp
│   ├── brightonbed.webp
│   ├── courtyardhedge.webp
│   ├── gardencleanup.webp
│   ├── hutchman.webp
│   ├── rosebed.webp
│   ├── stirlinghedge.webp
│   └── villahedge.webp
├── server.js           # Express static server for local & preview hosting
├── robots.txt
├── sitemap.xml
├── brief.md
└── package.json
```

## Notes

- **Naming rule:** Keep custom file names, class names, IDs, and URLs free of hyphens (per `brief.md`).
- **Photo rule:** Any uploaded photo added to `gallery/` or `assets/` must be converted to optimized WebP (`.webp`, auto-oriented, stripped, max `1200x1600`, quality `82`, `method=6`; see `brief.md` and `gallery/README.txt`).
- **Forms:** Quote and quick-message forms submit via FormSubmit (`https://formsubmit.co/7178a5f9a528161930af43634bad8f39`) and redirect to `thanks.html`.
- **Publishing:** GitHub Pages serves directly from `main` branch root (`https://rjpro123.github.io/Website/`).
