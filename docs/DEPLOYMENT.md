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

## What you need to do

Everything below happens in the Cloudflare dashboard — none of it can be done
from this repository.

### 1. Push this branch

```bash
git add .
git commit -m "docs: add documentation site"
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
bun run docs:dev        # dev server on :3000
bun run docs:build      # static build into docs/.output/public
bun --cwd docs run start   # serve the built output locally
```
