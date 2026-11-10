# Southwest Lawn & Garden Service

Professional lawn mowing, fertilization, garden design and landscaping website.

## Local Development

No build step required — plain HTML, CSS and JavaScript.

1. Open `index.html` in a browser, **or**
2. Run a local server:

```bash
# from D:\Website
npx serve .
# or
python -m http.server 8080
```

## Project Structure

```
D:\Website
├── index.html   # Site markup
├── styles.css   # All styles (plain CSS, CSS variables, responsive)
├── script.js    # Interactions (nav, header, form)
├── README.md
└── .gitignore
```

## Publishing to GitHub

The site is ready to publish to GitHub Pages.

1. Create a repo on GitHub (e.g. `southwest-lawn-garden`)
2. From `D:\Website`:

```bash
git init
git add .
git commit -m "Initial site: Southwest Lawn & Garden Service"
git branch -M main
git remote add origin https://github.com/<your-username>/southwest-lawn-garden.git
git push -u origin main
```

3. In GitHub repo settings → **Pages**, set source to `main` / `/ (root)`.

## Editing with Google AI Studio (Gemini)

The site uses **plain HTML/CSS/JavaScript with no build step**, which makes it
perfectly suited for AI-assisted design and edits via Google AI Studio.

**To edit the site with Gemini in AI Studio:**

1. Open [Google AI Studio](https://aistudio.google.com) and open a chat / canvas session.
2. Paste one of the prompts below (or just describe changes conversationally):

```
Redesign the hero section of D:\Website\index.html for a lawn & garden business.
New headline: "Your Lawn, Our Passion". Keep the green theme, update copy.
```

```
Change the primary color scheme of D:\Website/styles.css to blue tones.
```

```
Add a new service card to D:\Website/index.html for "Irrigation Repair".
```

3. Copy the generated code back into the files in `D:\Website`.
4. Preview by opening `index.html` or running `npx serve .`.

Because there is no framework or bundler, AI edits map 1:1 to simple file edits.

## TODO / Next Steps

- [ ] Replace placeholder phone number `(555) 310-2245` and email
- [ ] Update hero copy / stats with real business details
- [ ] Add real before/after photos
- [ ] Connect form to a real backend or CRM
- [ ] Add booking integration
