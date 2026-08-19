# GitHub Pages deployment

The custom domain `4dhotline.online` remains on GitHub Pages. Run the production build with the three public Vite variables configured, then run `pnpm build:github-pages`. Commit the generated `docs/` directory and configure GitHub Pages to publish from the `main` branch and the `/docs` folder.

The repository creates `docs/CNAME` for `4dhotline.online` and duplicates the single-page application entry point to `docs/404.html`, so deep links such as `/login` and `/membership` continue to load on GitHub Pages. Managed visual assets are referenced using their publicly reachable absolute URLs.
