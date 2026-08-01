# Deploying to Cloudflare Pages

Two Cloudflare Pages projects, both built from this one repository:

| Project | Domain | Build command | Output directory |
|---|---|---|---|
| `m3you-docs` | `material.you` | `bun install && bun run docs:build` | `docs/.output/public` |
| `m3you-storybook` | `storybook.material.you` | `bun install && bun run build-storybook` | `storybook-static` |

Cloudflare Pages allows several projects to point at the same repository with
different build settings, which is why this needs no second repo — and why
GitHub Pages does not fit: it permits only one custom domain per repository.

Both projects are free on Cloudflare's Free plan (unlimited sites, 500 builds a
month, unlimited bandwidth).

## Option A — from the command line (fastest)

`wrangler pages deploy` creates the project on first run, so there is no
dashboard navigation to hunt through. The only dashboard step left is attaching
the custom domains (step 4 below).

```bash
bunx wrangler login          # opens a browser once

bun run deploy:docs          # builds, then creates/deploys m3you-docs
bun run deploy:storybook     # builds, then creates/deploys m3you-storybook
```

The first run of each prompts to create the project — accept the name it
suggests, which matches the `--project-name` flag in the script.

This uploads a build made on your machine. It does not connect the project to
Git, so pushes will not trigger rebuilds. To add that afterwards, open the
project in the dashboard and use **Settings → Build → Connect to Git** with the
build settings from the table above.

## Option B — from the dashboard (with Git integration)

### Finding Workers & Pages

It lives at the **account** level, not inside a domain. If your sidebar shows
DNS, SSL/TLS, Caching and Workers Routes, you are inside the `material.you`
zone — click the account name in the top-left breadcrumb to go up a level.
Direct link:

```
https://dash.cloudflare.com/?to=/:account/workers-and-pages
```

Newer dashboards label this section **Compute (Workers)**; the Pages tab is
inside it either way.

### 1. Push this branch

```bash
git push
```

### 2. Create the docs project

**Workers & Pages → Create → Pages → Connect to Git**, pick `bczak/m3you`, then:

- **Project name:** `m3you-docs`
- **Production branch:** `development`
- **Framework preset:** None
- **Build command:** `bun install && bun run docs:build`
- **Build output directory:** `docs/.output/public`
- **Root directory:** *(leave as the repository root)*

Under **Settings → Environment variables**, add for both Production and Preview:

| Variable | Value |
|---|---|
| `BUN_VERSION` | `1.3.14` |

Cloudflare detects `bun.lock` and uses Bun, but pinning the version keeps CI
builds reproducible against the lockfile.

### 3. Create the Storybook project

Repeat **Create → Pages → Connect to Git** on the same repository:

- **Project name:** `m3you-storybook`
- **Production branch:** `development`
- **Build command:** `bun install && bun run build-storybook`
- **Build output directory:** `storybook-static`
- Same `BUN_VERSION` variable.

### 4. Attach the domains

(Required for both options.)

`material.you` is already in your Cloudflare account, so this is two clicks each
and no DNS records to copy by hand.

On **m3you-docs → Custom domains → Set up a custom domain**:

- Add `material.you`
- Add `www.material.you` (optional — Cloudflare offers a redirect to the apex)

On **m3you-storybook → Custom domains**:

- Add `storybook.material.you`

Cloudflare creates and proxies the DNS records itself. The existing
`material.you` A record pointing at `162.255.119.164` is a parking-page record
and should be **deleted** once the Pages custom domain is attached, or it will
compete with it.

Certificates are issued automatically and usually take under a minute.

### 5. Check it

```
https://material.you                      → landing page
https://material.you/components           → gallery
https://material.you/showcase             → demo apps
https://material.you/docs/components/button
https://storybook.material.you            → Storybook
```

## Notes

**SPA routing.** `docs/public/_redirects` sends unmatched paths to
`/_shell.html` with a 200. Prerendered routes are real files and are served
directly, so this only catches deep links the prerenderer did not emit.

**Caching.** `docs/public/_headers` marks hashed assets immutable and leaves
HTML revalidating.

**Preview deployments.** Every branch and pull request gets its own URL
automatically — no configuration needed.

**The existing GitHub Pages workflow.** `.github/workflows/deploy.yml` still
publishes Storybook to `bczak.github.io/m3you`. It does no harm, but once
Cloudflare is live you can delete it — the Cloudflare project supersedes it.
`.github/workflows/docs.yml` is separate: it only verifies the docs build on
pull requests and does not deploy.

## Local equivalents

```bash
bun run docs:dev           # dev server on :3000
bun run docs:build         # static build into docs/.output/public
bun --cwd docs run start   # serve the built output locally

bun run deploy:docs        # build + deploy to Cloudflare
bun run deploy:storybook   # build + deploy Storybook to Cloudflare
```
