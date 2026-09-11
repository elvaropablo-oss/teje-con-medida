---
name: TejeConMedida Pattern Lab
status: canonical
updated: 2026-09-11
---

# Design direction

**North star:** a modern pattern worksheet spread across a cutting table. The interface should feel precise and tactile: stitch notation, bold annotations and visible arithmetic.

The system deliberately avoids the warm editorial recipe-book language used by Horno Exacto. TejeConMedida uses a technical cobalt, fluorescent chartreuse, square geometry and dense display type to create its own identity.

## Foundations

- Paper: `#fbfaf4`; deep paper: `#f0eee5`
- Ink: `#17152b`; secondary ink: `#494761`
- Cobalt action/result: `#3046d3`; dark cobalt: `#1f2f9d`
- Chartreuse highlight: `#d9fa54`; coral focus/accent: `#ff675d`
- Display type: heavy system grotesk, uppercase, tightly tracked
- Body type: Segoe UI Variable/Aptos with platform fallbacks
- Labels and measurements: Cascadia Mono/Consolas
- Corners remain square. Depth uses hard offset shadows rather than blur.

## Composition

- Heroes pair an oversized statement with a tilted gauge swatch.
- Tool cards use explicit borders, compact labels and large numerical outcomes.
- Directory cards occupy uneven spans on a 12-column grid to resemble pinned pattern pieces.
- Motion is limited to physical button presses and smooth scrolling, with reduced-motion support.

## Accessibility and responsive behavior

- All interactive controls keep a 48 px minimum height and a coral focus ring.
- Cobalt result panels use white text and chartreuse labels.
- Below 840 px the hero, cards and tool layout become a single readable column.
- Below 560 px navigation and form fields remain usable without horizontal scrolling.
- Print removes navigation and decorative grids while preserving calculations.
