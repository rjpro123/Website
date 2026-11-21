# Souwest Lawn & Garden Service

Website for Souwest Lawn & Garden Service (Adelaide, SA) featuring a quote enquiry form with automatic photo resizing, services breakdown, photo gallery with lightbox and customer review slider, team page, and quick message popup.

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
├── gallery.html        # Photo gallery, lightbox & testimonial slider
├── staff.html          # Team profiles
├── thanks.html         # Submission confirmation page
├── 404.html            # Custom 404 page
├── css/
│   └── styles.css      # Site theme, layout, carousel & responsive styles
├── js/
│   ├── script.js          # Footer year, active nav, FormSubmit redirect & thanks countdown
│   ├── email.js           # Quote chips, suburb pills & client-side photo compression
│   ├── emailwindow.js     # Quick message floating widget
│   ├── gallery.js         # Full-screen photo lightbox with zoom, pan & swipe
│   ├── beforeafter.js     # Interactive Before & After comparison slider
│   ├── beforeaftermath.js # Math helpers for comparison split
│   ├── testimonials.js    # Customer review slider with swipe, keyboard & autoplay
│   └── transitions.js     # Smooth page transition overlay
├── assets/
│   ├── logo.png           # Header wordmark
│   ├── logofooter.png     # Footer mark
│   └── riley.jpg          # Team photo
├── gallery/
│   ├── adelaidelawn.jpg
│   ├── brightonbed.jpg
│   ├── gardencleanup.jpg
│   ├── hutchman.jpg
│   ├── lawnresetafter.jpg
│   ├── lawnresetbefore.jpg
│   ├── stirlinghedge.jpg
│   └── README.txt
├── backup/             # Timestamped site snapshots (blocked from web serving)
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
