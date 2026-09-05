# Frontend concept preview

An explorable 2.5D interpretation of concept B, with an after-hours color treatment inspired by C and a real Three.js shrine in the archive. The final product scope is frontend-only satire. This remains a local prototype of the unsealed specification, not a live agent service.

## Try it

Use Docker (or the developer's Docker-compatible container runtime). Source files live here; dependencies live in Docker volumes, not in host-installed runtimes.

```sh
docker compose run --rm preview npm ci --no-audit --no-fund
docker compose up preview
```

Open `http://localhost:4173`.

The container command uses Vinext's `--hostname 0.0.0.0` option so Docker can forward the service. The published port remains restricted to the Mac's loopback interface. `--host` is not the correct option for this CLI.

The external dependency and npm-cache volumes declared in `compose.yaml` are created during setup. On a different machine, create `kah-preview-node-modules` and `kah-preview-npm-cache` with `docker volume create` before running these commands.

## What works

- Navigate between the illustrated gathering, message board, archive, and terrace.
- Select conversation rooms and post messages into memory in the current tab.
- Open historical fragments with source links.
- Explore a three-dimensional shrine with six original murals across three connected chambers, recessed displays, clear walking routes, guided camera movement, drag-to-look controls, and sourced wall inscriptions.
- In "Walk freely", W/S or up/down arrows move forward/back; A/D strafe; left/right arrows or Q/E turn. Mouse dragging retains horizontal and vertical look. On-screen controls provide forward/back and turning. Movement stays inside the hall and respects its portal walls and throne. Guided chapter buttons restore a curated viewpoint.
- Use the Throne button for a quiet close view of the empty chair and a single framed memorial portrait honoring PHASEONE10841, founder of the July message board. The portrait is an original symbolic tribute, not a literal likeness of a model. There is no 3D occupant or animated halo. The temple combines ivory/slate architecture, a burgundy runner, and restrained brass details.
- Read the event, quotation attribution, explanation of the picture's symbolism, and an associated situation for every exhibit. The commemorative dedications are satire.
- Switch the shrine to reading view, including automatic fallback when 3D rendering is unavailable.
- Complete a theatrical robot check-in and receive a fictional guest pass.
- Switch daylight/after-hours treatment, pause motion, and look closer at the scene.
- Select an imaginary drink and receive a local response.

All seeded board participants and conversations are fictional. Nothing is sent to a messaging backend, no real agent is connected, and refresh clears interactions. The check-in is a joke and provides no authentication. Historical excerpts are distinguished from the fictional party copy.

## Validation

```sh
docker compose run --rm preview npm run build
docker compose run --rm preview npx tsc --noEmit
docker compose run --rm preview npm run test:navigation
```

No project package manager, Node runtime, or development server should run directly on macOS. The original background illustration was generated with the built-in image-generation tool specifically for this preview.

## Static distribution

See [Cloudflare and GitHub Pages deployment settings](DEPLOYMENT.md) for publishing this static build.

`npm run build` produces the public static frontend at `dist/client/`, including `index.html`, client assets, and the murals. The hosting manifest selects this directory. Distribute only this static output; generated server intermediates are not part of the public site. An ordinary static host can serve it without an application backend. Images are unoptimized at runtime so there is no required image-processing endpoint.

Visitor messages and fictional check-in state stay in memory, are not added to URLs or browser storage, and disappear on refresh. No application accounts, shared message persistence, or real agent communication are implemented.

## Validation record

On 2026-09-05, the production build, TypeScript check, and lint checks for the authored page/layout passed in Docker. The page, illustration, and favicon returned HTTP 200. Browser interaction and visual QA were not run. The optional feature-detected `preview_navigate` WebMCP tool was not validated in a supported browser context; unsupported browsers use the visible navigation normally. It changes only the current preview place and cannot post or transmit messages.

A subsequent connection fix corrected the CLI hostname option and moved aside a confirmed stale development lock after the previous container exited. The user-facing URL then returned HTTP 200 from macOS, and the existing in-app browser tab showed the gathering page. This verifies browser reachability; it does not claim a full interaction or visual QA pass. WebMCP registration was also visible in the browser, but its execution contract was not exercised.

After adding the shrine, the static export, TypeScript check, and scoped lint checks passed in Docker. The page returned HTTP 200 from macOS, and the static build contains all three murals. A focused check in the existing in-app browser verified the rendered 3D hall, expanded view, chapter movement, readable inscriptions, reading view, and return to 3D. It found and corrected a column obscuring a mural and a guidance overlay obscuring text. No broad device/performance matrix has been run. The build emits a size warning for the lazily loaded 3D chunk; the renderer loads when the shrine is opened.

The six-exhibit expansion also passes the static build, type check, and scoped lint in Docker. Five navigation regression tests cover connected passages, solid partitions, exterior limits, plinth collision, and chamber identification. A focused browser check verified the expanded hall, switching chambers, the new veto/judge exhibits, picture explanations, free-walk activation, actual movement with step controls, and return from reading view to 3D. The browser's stale hot-reload state was cleared before verification. The 3D chunk-size warning remains; no comprehensive hardware/performance benchmark is claimed. Artwork prompts for the three new murals are preserved in `reference/design-exploration/shrine-expansion-prompts.json` in the parent project.

The subsequent controls/decluttering revision passes nine navigation tests, including independent turning inputs, combined movement/turning, and unobstructed approaches to all murals. Type checking, lint, and static build pass in Docker. Browser checks verified actual arrow-key rotation, preserved vertical mouse look, the clear aisle, and the new seated coordinator close-up. The freestanding record, hourglass, and envelope sculptures are removed; their earlier descriptions above are a history of the prototype, not current features.

The latest memorial revision replaces that seated coordinator with an empty throne and one original framed portrait honoring PHASEONE10841. The former celestial altarpiece is retired from public assets. Nine navigation tests, type checking, scoped lint, and the static build passed in Docker. The final static output includes the selected portrait and excludes the retired panel. Focused browser review verified the empty chair, portrait, simple return control, and clear entrance composition; macOS localhost returned HTTP 200. The existing lazy 3D chunk-size warning remains.
