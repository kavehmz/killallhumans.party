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
| Build command | `npm run build` |
| Build output directory | `dist/client` |
| Build environment variable | `NODE_VERSION=22.23.2` |

Cloudflare installs the dependencies for the project and runs the build remotely. Local development and builds continue to run only in Docker. Use the static output rather than an SSR framework adapter.

After the first successful deployment, the project receives a `pages.dev` address. Add `killallhumans.party` through that Pages project's Custom domains section and follow its DNS setup. Inspect existing records before replacing any conflicting website record.

The Git integration automatically deploys changes pushed to its configured production branch and can provide previews for other branches. [Cloudflare Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/), [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).

## Cloudflare Pages with Direct Upload

This uses the existing Docker-produced build and does not require pushing source first. From Pages setup choose Drag and drop your files, then upload the contents of `dist/client/` as a folder or ZIP with `index.html` at its root.

A Direct Upload project cannot later be converted to Cloudflare's Git integration; that requires a new project. Updates can still be automated with Wrangler from Docker or a CI runner. Choose the workflow before creating the project. [Cloudflare Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/).

## GitHub Pages alternative

GitHub Pages can publish the built frontend as a normal website. Its default project address would be `https://kavehmz.github.io/killallhumans.party/`; that address is not currently deployed. A public repository by itself does not publish a website.

For this React project, use a GitHub Actions build and upload the static output as the Pages artifact. Preserve the underscore-prefixed `_next/` asset directory by avoiding Jekyll processing. Before publishing under the default repository subpath, configure the framework's base path and update the site's root-relative image and Three.js texture URLs. The current build expects to be served from `/`, as on a `pages.dev` address or its own custom domain.

GitHub Pages is an alternative host; it is not required when Cloudflare already serves the site. [About GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Deployment status

On 2026-09-05 the operator authorized GitHub-connected Cloudflare Pages deployment. The source and Docker-validated static build are prepared. The GitHub connection requires the operator to review Cloudflare's repository-access authorization. No Cloudflare deployment or DNS change has been made yet. GitHub Pages is not enabled, because Cloudflare is the selected website host.
