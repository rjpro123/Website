# Souwest Lawn & Garden Service

Website for Souwest Lawn & Garden Service (Adelaide, SA) featuring a quote enquiry form with automatic photo compression and preview thumbnails, services breakdown, gallery slideshow, interactive before & after comparison slider, customer review carousel, team page, and quick message popup.

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
├── gallery.html        # Photo slideshow, before & after comparison & review slider
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
│   ├── testimonials.js    # Customer review slider with swipe, keyboard & autoplay
│   └── transitions.js     # Smooth page transition overlay
├── assets/
│   ├── logo.png           # Header wordmark
│   ├── logofooter.png     # Footer mark
│   └── riley.jpg          # Team photo
├── gallery/
│   ├── beforeandafterphotos/
│   │   ├── lawnresetbefore.jpg / lawnresetafter.jpg
│   │   ├── hedgeresetbefore.jpg / hedgeresetafter.jpg
│   │   └── bedresetbefore.jpg / bedresetafter.jpg
│   ├── adelaidelawn.jpg
│   ├── brightonbed.jpg
│   ├── courtyardhedge.jpg
│   ├── gardencleanup.jpg
│   ├── hutchman.jpg
│   ├── stirlinghedge.jpg
│   └── villahedge.jpg
├── server.js           # Express static server for local & preview hosting
├── robots.txt
├── sitemap.xml
├── brief.md
└── package.json
```

## Notes

- **Naming rule:** Keep custom file names, class names, IDs, and URLs free of hyphens (per `brief.md`).
- **Forms:** Quote and quick-message forms submit via FormSubmit (`https://formsubmit.co/7178a5f9a528161930af43634bad8f39`) and redirect to `thanks.html`.
- **Publishing:** GitHub Pages serves directly from `main` branch root (`https://rjpro123.github.io/Website/`).
