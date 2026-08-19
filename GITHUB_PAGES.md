# GitHub Pages deployment

The custom domain `4dhotline.online` remains on GitHub Pages. Run the production build with the three public Vite variables configured, then run `pnpm build:github-pages`. Commit the generated root artifact files (`index.html`, `404.html`, `assets/`, `robots.txt`, `sitemap.xml`, and `CNAME`). The existing GitHub Pages source is the repository root on the `main` branch, so no GitHub Pages settings change is needed.

The repository also creates `docs/` as a reviewable artifact. Both the root artifact and `docs/` include the `4dhotline.online` CNAME and a duplicated single-page application entry point at `404.html`, so deep links such as `/login` and `/membership` continue to load on GitHub Pages. Managed visual assets are referenced using their publicly reachable absolute URLs.
