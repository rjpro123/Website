# Requested module (design brief)

Mobile-first single-page quote request module for Souwest Lawn & Garden Service, Adelaide SA.
Kept alongside the code so future edits (incl. Google AI Studio) stay on-spec.

## Palette
- Deep Eucalyptus green (primary)
- Slate Charcoal / near-black backgrounds (dark theme, matches the logo's dark ground)
- Warm green highlights; no yellow/ochre (removed at owner's request)

Current palette: page background deep green #0D2B18, cards #14351F, inputs #183C26, borders #29502F, primary green #63A87A

## Header
- Business header: Souwest Lawn & Garden Service (white wordmark -> sits on charcoal)
- Tagline: Reliable Lawn & Property Care Across Adelaide & Suburbs
- Local info bar: Servicing Greater Adelaide & Surrounding Areas
- Quick contact: Email for a Quote (no phone/SMS calls to action)

## Form steps
1. Contact & Suburb: full name (req), phone (req), email (optional), suburb/postcode (placeholder e.g. Marion, Brighton, Stirling) + helper copy
2. Property & Service Scope: property type (Residential / Commercial-Strata / Rental-End of Lease); service tiles (Lawn Mowing & Edging, Hedging & Pruning, Weed Control & Seasonal Spraying, Garden Clean-up / Green Waste Removal, Irrigation & Lawn Care Setup); season/turf checkboxes (Summer Heat / Drought Kikuyu & Couch, Winter Weed & Patch Care, Fire Season / Overgrowth Clearance)
3. Job Details & Timing: yard size (Small Courtyard / Standard Suburban Lot / Large Acreage / Commercial); timing (ASAP-Urgent, Within 7 Days, Regular Scheduled Care); notes/access textarea
- Submit: Get My Free Adelaide Quote
- Real-time client-side validation; success: "Thanks mate! We'll review your property details and reach out within 24 hours."

## Assets
- assets/logo.png  - wide transparent wordmark (header)
- assets/logo-mark.png - square mark (footer / social)
- Files/Logo_00000 (1).png - original upload (black background)

## Delivery
- Quotes are emailed to souwestlawnandgarden@gmail.com (mailto from the success screen, plus the "Send us an email copy" fallback link)
