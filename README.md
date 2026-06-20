# Taboo

A simple web app for generating cards for the **Taboo** board game.

> This is the initial scaffold — no game logic yet, just the React + Vite
> base and a deployment pipeline ready to build on.

## Tech stack

- [React 19](https://react.dev/)
- [Vite 6](https://vite.dev/)
- GitHub Actions → GitHub Pages

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build into dist/
npm run preview  # preview the production build locally
```

## Deployment

The app deploys automatically to GitHub Pages on every push to `main` via
[.github/workflows/deploy.yml](.github/workflows/deploy.yml).

It is served from the repo subpath:

```
https://<your-username>.github.io/taboo/
```

The Vite `base` is set to `/taboo/` in [vite.config.js](vite.config.js) to
match. If you rename the repository, update that value accordingly.

### One-time setup

In the repository settings, under **Settings → Pages**, set the
**Source** to **GitHub Actions**.
