RULE: Always convert any uploaded photo to optimized WebP before adding it here (lowercase filename without hyphens, auto-oriented, metadata stripped, resized within 1200x1600):

  convert input.jpg -auto-orient -resize '1200x1600>' -strip -define webp:method=6 -quality 82 gallery/yourphoto.webp

Then add an entry to GALLERY_PHOTOS in js/previewwindow.js:

  {
    src: "gallery/yourphoto.webp",
    thumb: "gallery/yourphoto.webp",
    alt: "Job description in Suburb, SA",
    title: "Job title",
    sub: "Suburb, SA"
  }

Before and after comparison pairs belong in gallery/beforeandafterphotos/ and are added as .beforeafterpair blocks in gallery.html.
Best results: 4:3 ratio, around 1200px wide, compressed WebP under 400KB.
