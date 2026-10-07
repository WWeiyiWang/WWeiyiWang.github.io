# Weiyi Wang — Portfolio

Primary website: **https://wweiyiwang.github.io/**

Repository: **WWeiyiWang/WWeiyiWang.github.io**

## Build and deploy

This project is a static HTML generator using Node.js built-in modules. It is not a Vite/React application and needs no dependency installation for its production build. Use Node.js 22 or newer.

```sh
npm run build:pages
npm run check:pages
```

If `npm` is not on your local PATH but Node.js is available, the equivalent commands are `node scripts/build-pages.mjs` and `node scripts/check-pages.mjs`.

The deployable output is `.pages-dist/`. The base path is `/`, because this is a GitHub user site. Every page has its own `index.html`, so direct visits to `/projects/bamor/`, `/writing/`, `/about/`, and the other routes work without a single-page-app redirect. The build preserves the JavaScript interactions, styles and media in `dist/`; do not delete `dist/` as a disposable build directory.

GitHub **Settings → Pages → Source** must be **GitHub Actions**. `.github/workflows/pages.yml` builds and deploys on every push to `main`. Deployment status is shown under **Actions → Deploy portfolio to GitHub Pages**. The published URL does not change when content is updated.

## Redeploy future updates

1. Update `content.json`, the relevant templates, or the website-ready assets in `dist/`.
2. Run the two build/check commands above.
3. Commit and push the changes to the repository's `main` branch. GitHub Actions publishes automatically.
4. Wait for the deployment to turn green before sharing the update. To redeploy the same source, use **Actions → Deploy portfolio to GitHub Pages → Run workflow**.

For the original local `portfolio website` workspace, material folders under `网站资料/` are originals and are not uploaded to GitHub. Import/convert changes into `content.json` and `dist/` first; simply replacing an original file does not publish it. Run `npm run audit:media` in that workspace to find originals that still need synchronization. The dedicated publishing checkout is `github-pages/`; `node scripts/sync-github-checkout.mjs` copies the current website source into it before committing and pushing from that folder.

No server, database or environment secrets are needed by the public site. Personal display preferences (day/night, flowers, wall notes, window image) are stored in the visitor's browser; preferences saved on the old domain do not transfer automatically to the GitHub domain.

The preserved homepage versions remain accessible at `/home-current/` and `/home-experimental/`.
