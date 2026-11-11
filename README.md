# Souwest Lawn & Garden Service

Adelaide lawn & garden care website - landing page, quote dashboard and gallery.
Static HTML/CSS/JS, no build step.

## Local Development

Open `index.html` in a browser, or run a local server from `D:\Website`:

```bash
npx serve .
# or
python -m http.server 8080
```

## Pages

| Page | File | Purpose |
|---|---|---|
| Quote (root) | `index.html` | 3-step quote form + live dashboard with indicative pricing |
| Gallery | `gallery.html` | Recent job photos (placeholders until you add images) |
| Quote (old link) | `quote.html` | Redirect stub -> `index.html` (keeps old bookmarks working) |

There is no separate home page - the site opens straight on the quote form at
`https://rjpro123.github.io/Website/`. Navigation is the two-tab bar
(Quote / Gallery) in the header of every page.

## Project Structure

```
D:\Website
├── index.html      # Quote form + live dashboard (the site root)
├── quote.html      # Redirect stub to index.html
├── gallery.html    # Gallery page
├── styles.css      # All styles (CSS variables, mobile-first, dark theme)
├── script.js       # Form validation, step nav, success message, footer year
├── quote.js        # Live quote summary + indicative price estimate
├── assets/
│   ├── logo.png        # Wide wordmark (header)
│   ├── logo-footer.png # Tight crop (footer)
│   └── logo-mark.png   # Square mark
├── gallery/        # Drop job photos here (jpg/png)
├── brief.md        # Design brief - keeps AI Studio edits on-spec
├── README.md
└── .gitignore
```

## Quotes & Email

All quotes send to **souwestlawnandgarden@gmail.com**.
Submission opens the visitor's email client with the quote pre-filled
(`mailto:`), so no backend is required. To collect submissions server-side
instead, point the form at a service such as FormSubmit or a Google Form.

## Publishing to GitHub

Repo: `https://github.com/rjpro123/Website` (branch `main`)

```bash
git add .
git commit -m "Your message"
git push origin main
```

GitHub Pages is enabled via repo settings -> **Pages** -> branch `main`, folder `/ (root)`.

## Adding Photos to the Gallery

1. Drop the image into `D:\Website\gallery\`
2. In `gallery.html`, replace the placeholder block:

```html
<div class="gframe" role="img" aria-label="Front lawn reset - Marion">
  <span class="gicon">&#127807;</span>
  <span class="gph">Coming soon</span>
</div>
```

with:

```html
<div class="gframe"><img src="gallery/marion-lawn.jpg" alt="Front lawn reset in Marion"></div>
```

## Editing with Google AI Studio (Gemini)

The site is plain HTML/CSS/JS, so AI edits map 1:1 to simple file edits.

1. Open [Google AI Studio](https://aistudio.google.com)
2. Paste a prompt, e.g.

```
Rewrite the hero section of D:\Website\index.html for an Adelaide lawn and garden
business. Keep the black and green theme and the two tab navigation.
```

```
Change the indicative pricing in D:\Website\quote.js - base rates should be
$60 for a small courtyard, $95 standard lot, $180 acreage.
```

```
Add a "Before & After" slider to the gallery placeholders in D:\Website\gallery.html
```

3. Copy the generated code back into the files in `D:\Website`
4. Check `brief.md` so the AI keeps the palette, brand and page structure intact

## TODO / Next Steps

- [ ] Add real job photos to `gallery/`
- [ ] Set real pricing in `quote.js` (currently indicative placeholder rates)
- [ ] Consider a form backend so quotes arrive without the visitor's mail client
- [ ] Add a business email address and/or phone number to the header
- [ ] Add opening hours, ABN and service area map
