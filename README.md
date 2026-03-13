# Closet

Offline-first wardrobe organizer PWA built with React + Vite + Dexie.

## What it does

- Manage clothes with photos (camera or gallery)
- Save color, season, category, and memo metadata
- Build outfit combinations from saved clothes
- Filter and search clothes/outfits locally in browser storage
- Work offline with a PWA shell and local IndexedDB data

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Dexie (IndexedDB)
- vite-plugin-pwa (Workbox)
- Vitest (unit tests)
- Playwright (E2E smoke flow)

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - type-check and create production build
- `npm run lint` - run ESLint
- `npm run test` - run unit tests
- `npm run test:watch` - run unit tests in watch mode
- `npm run e2e` - run Playwright E2E tests

## PWA install and permissions

- Install on mobile using browser menu -> Add to Home Screen
- Camera capture requires browser camera permission
- If camera capture fails, use gallery upload as fallback
- Offline mode keeps browsing local data, but new upload can be limited by browser support

## Regression checklist

Offline and release checklist is documented in `docs/offline-regression-checklist.md`.

## GitHub Pages deployment

- CI/CD workflow: `.github/workflows/deploy-pages.yml`
- Trigger: push to `main` (or manual `workflow_dispatch`)
- Build base path is set automatically from repository name via `VITE_BASE_PATH`
- In GitHub repository settings, set **Pages** source to **GitHub Actions**
