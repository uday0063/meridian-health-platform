# Meridian Health

A centralized healthcare management platform front end. One connected health record, multiple specialists, a complete view of patient wellness.

Frontend only: no backend, no API, no database. All data is fictional.

## Structure
```
index.html          page shell, loads the files below in order
css/styles.css      design tokens (Marina palette), layout, motion, components
js/data.js          fictional patients, reports, consultations, roles and permissions
js/state.js         shared state, helpers, action registry
js/charts.js        small SVG chart helpers (bars, sparkline, ring)
js/views.js         page views (landing, dashboard, patients, profile, reports, ...)
js/features.js      interactive features (palette, booking, upload, breathing, tooltips)
js/main.js          rendering, routing and event wiring
build.js            optional: bundles everything into dist/index.html
.github/workflows   GitHub Pages deployment
```

## Features
- Role-based demo (Admin, Doctor, Patient, Nutritionist, Yoga Instructor) driven by one permissions map
- Dashboard with animated KPIs, 7/30/90 day trend with hover tooltips, activity feed
- Patient list and centralized profile: overview, history (search and filters), reports, consultations, nutrition, wellness
- Command palette: press Ctrl+K (Cmd+K on Mac) to jump to any page, patient or report
- Booking wizard, add patient form, report upload with drag and drop and progress
- Notifications with read state, guided breathing exercise, live vitals trace
- Motion: animated logo, morphing and liquid shapes, animated gradients, doodles, faux 3D, scroll story, skeleton screens, page transitions, cursor spotlight
- Dark mode (remembered), keyboard support, reduced-motion support

## Run locally
Open `index.html`, or run `npm start`.

## Palette (Marina)
Cream #FFF1E7, sky #B5D2E6, deep blue #326080, brown #805232.

## Deploy
Push to GitHub, then Settings > Pages > Source: GitHub Actions. The workflow publishes on every push to `main`.
