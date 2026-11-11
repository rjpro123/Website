# Requested module (design brief)

## HARD RULES (owner requirements - always apply)
1. **NO HYPHENS ANYWHERE** - no hyphens in any text, class name, id, attribute,
   file name or URL. Use camelCase or all lowercase joins instead
   (e.g. `pagehead` not `page-head`, `logofooter.png` not `logo-footer.png`).
   The only exceptions are HTML/ARIA spec names that cannot change
   (aria-label, http-equiv, apple-mobile-web-app-title, viewport-fit).
2. **Business scope:** soft landscaping and garden maintenance ONLY.
3. **Email address:** souwestgardening@gmail.com (single form, no address shown on page).
4. **Theme:** black background with green text. No yellow/ochre.
5. **Fonts:** Plus Jakarta Sans (headings) + Inter (body), loaded non-blocking.

## Business scope (important - keep on-spec)
Souwest Lawn & Garden Service does **soft landscaping and garden maintenance only**.
No hard landscaping (no paving, decking, retaining walls, structural work) and no
irrigation installation - irrigation was removed from the service list and replaced
with planting / garden bed renewal.

Services offered:
- Lawn Mowing & Edging
- Hedging & Pruning
- Weed Control & Seasonal Spraying
- Garden Clean-up / Green Waste Removal
- Planting & Garden Bed Renewal
- Getting Ready for Sale (kerbside appeal for a sale or rental)
- Turf Replacement (new Kikuyu or Couch laid to worn patches and bare areas)
- Mulching & Soil Conditioning (fresh mulch over garden beds)

Seasonal / turf options:
- Summer Heat / Drought Lawn Care (Kikuyu & Couch maintenance)
- Winter Weed & Patch Care
- Fire Season / Overgrowth Clearance

Brand line: "Soft Landscaping & Garden Maintenance Across Adelaide & Suburbs"

Mobile-first single-page quote request module for Souwest Lawn & Garden Service, Adelaide SA.
Kept alongside the code so future edits (incl. Google AI Studio) stay on-spec.

## Palette
- Deep Eucalyptus green (primary)
- Slate Charcoal / near-black backgrounds (dark theme, matches the logo's dark ground)
- Warm green highlights; no yellow/ochre (removed at owner's request)

Current palette: black background #070907, cards #0D100D, inputs #111511, green text #B9E8C4, primary green #63C084

## Header
- Business header: Souwest Lawn & Garden Service (white wordmark -> sits on charcoal)
- Tagline: Soft Landscaping & Garden Maintenance Across Adelaide & Suburbs
- Local info bar: Servicing Greater Adelaide & Surrounding Areas
- Quick contact: Email for a Quote (no phone/SMS calls to action)

## Form (single page, no multi-step)
Contact name, email, phone, subject, message and photo upload (up to 5 images), sent via FormSubmit.

## Original form steps (removed - the site now uses one simple form)
1. Contact & Suburb: full name (req), phone (req), email (optional), suburb/postcode (placeholder e.g. Marion, Brighton, Stirling) + helper copy
2. Property & Service Scope: property type (Residential / Commercial-Strata / Rental-End of Lease); service tiles (Lawn Mowing & Edging, Hedging & Pruning, Weed Control & Seasonal Spraying, Garden Clean-up / Green Waste Removal, Planting & Garden Bed Renewal); season/turf checkboxes (Summer Heat / Drought Kikuyu & Couch, Winter Weed & Patch Care, Fire Season / Overgrowth Clearance)
3. Job Details & Timing: yard size (Small Courtyard / Standard Suburban Lot / Large Acreage / Commercial); timing (ASAP-Urgent, Within 7 Days, Regular Scheduled Care); notes/access textarea
- Submit: Get My Free Adelaide Quote
- Real-time client-side validation; success: "Thanks mate! We'll review your property details and reach out within 24 hours."

## Assets
- assets/logo.png  - wide transparent wordmark (header)
- assets/logo-mark.png - square mark (footer / social)
- Files/Logo_00000 (1).png - original upload (black background)

## Delivery
- Quotes are emailed to souwestgardening@gmail.com (FormSubmit form post with photo attachments, plus the "Open email directly" fallback link)
