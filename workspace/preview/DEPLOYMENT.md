# Static hosting

The website exports HTML, CSS, browser JavaScript, and images. Its 3D rendering and fictional interactions run in the visitor's browser. No application server, Pages Functions, database, or shared message service is required.

The deployable folder is `workspace/preview/dist/client/` relative to the repository root. It already contains `index.html`. Do not upload `dist/server/`, the source repository, or the parent `dist/` directory as the website.

## Cloudflare Pages with GitHub

The selected setup uses the public repository `kavehmz/killallhumans.party`. The frontend source is under `workspace/preview`; connect this repository to Cloudflare Pages.

In Cloudflare, open Workers & Pages → Create application → Continue to Pages → Import an existing Git repository. The dashboard currently labels Pages as its legacy workflow; Pages remains available for static sites.

| Setting | Value |
| --- | --- |
| Repository | `kavehmz/killallhumans.party` |
| Production branch | `main` |
| Framework preset | None |
| Root directory | `workspace/preview` |
| Build command | `npm run build && npm run check:static` |
| Build output directory | `dist/client` |
| Build environment variable | `NODE_VERSION=22.23.2` |

Cloudflare installs the dependencies for the project and runs the build remotely. Local development and builds continue to run only in Docker. Use the static output rather than an SSR framework adapter.

After the first successful deployment, the project receives a `pages.dev` address. Add `killallhumans.party` through that Pages project's Custom domains section and follow its DNS setup. Inspect existing records before replacing any conflicting website record.

The Git integration automatically deploys changes pushed to its configured production branch and can provide previews for other branches. [Cloudflare Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/), [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).

## Cloudflare Pages with Direct Upload

This uses the existing Docker-produced build and does not require pushing source first. From Pages setup choose Drag and drop your files, then upload the contents of `dist/client/` as a folder or ZIP with `index.html` at its root.

A Direct Upload project cannot later be converted to Cloudflare's Git integration; that requires a new project. Updates can still be automated with Wrangler from Docker or a CI runner. Choose the workflow before creating the project. [Cloudflare Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/).

## GitHub Pages mirror

The operator also selected a GitHub Pages mirror at `https://kavehmz.github.io/killallhumans.party/`. GitHub Pages uses the repository's GitHub Actions publishing source and the workflow at `.github/workflows/pages.yml`.

The workflow builds in a Node Docker container with `NEXT_PUBLIC_BASE_PATH=/killallhumans.party`, prefixes framework assets and public artwork, and uploads only the static output. The application has one route. It uses `assetPrefix` rather than `basePath` because Vinext 1.0.0-beta.5 skips the homepage during static export with a route base path. Vinext writes prefixed assets into a nested directory; the workflow moves `_next/` to the artifact root to match GitHub's repository mount. A static-output check verifies the homepage, linked files, and shrine artwork before publication. No Jekyll processing is used.

Cloudflare builds without `NEXT_PUBLIC_BASE_PATH` and serves the domain root. The two deployments use the same source with separate build-time paths. Keep GitHub's custom domain field empty so its mirror retains the `github.io` address. [About GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Deployment status

Published on 2026-09-05:

- Custom domain: https://killallhumans.party/
- GitHub Pages: https://kavehmz.github.io/killallhumans.party/
- Cloudflare project address: https://killallhumans-party.pages.dev/

Both providers successfully deployed application commit `eeb4b9a`. Cloudflare's GitHub app is installed with only `kavehmz/killallhumans.party` selected. GitHub Pages uses the GitHub Actions source with no custom domain. Cloudflare created the apex CNAME to `killallhumans-party.pages.dev`; there were no pre-existing DNS records to replace. Both requested HTTPS addresses returned HTTP 200 and rendered the interactive site in browser checks.

Both static build variants pass the Docker build and linked-asset checks. Frontend changes on `main` trigger the two publishing pipelines. Development remains Docker-only on the Mac, and both public sites remain static frontends without a messaging backend.
