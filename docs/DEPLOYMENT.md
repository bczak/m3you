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

## Authentication without a browser

`wrangler login` uses an OAuth callback, which needs a browser on the same
machine. Everything below avoids it by using an API token instead — the same
mechanism CI uses, and the only option over SSH or on a headless box.

### Create the token

At [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
→ **Create Token** → **Custom token**, grant exactly:

| Scope | Permission | Access |
|---|---|---|
| Account | Cloudflare Pages | Edit |

Nothing else is required to deploy. Copy the token — it is shown once.

Your **account ID** is in the right-hand sidebar of any domain's overview page.

### Use it

```bash
export CLOUDFLARE_API_TOKEN=...
export CLOUDFLARE_ACCOUNT_ID=...

bun run deploy:docs          # builds, then creates/deploys m3you-docs
bun run deploy:storybook     # builds, then creates/deploys m3you-storybook
```

Wrangler picks both variables up automatically; there is no login step. The
first run of each creates the project — accept the suggested name, which matches
the `--project-name` flag in the script.

## Option A — release from CI (recommended)

`.github/workflows/release.yml` handles everything on every push to
`development`:

| Job | What it does |
|---|---|
| `verify` | Library tests, documentation-coverage tests, docs type-check |
| `docs` | Builds and deploys the site to `m3you-docs` |
| `storybook` | Builds and deploys Storybook to `m3you-storybook` |
| `npm` | Publishes the library — **only if `package.json` carries a version that is not on the registry** |

That last condition is what makes the workflow safe to run on every push.
Bumping the version in `package.json` *is* the release trigger; pushes that
leave it alone redeploy the two sites and skip npm entirely.

Add three repository secrets — **Settings → Secrets and variables → Actions →
New repository secret**:

| Secret | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | the token created above |
| `CLOUDFLARE_ACCOUNT_ID` | your account ID |

npm needs no secret — see [Trusted Publishing](#publishing-to-npm) below.

Jobs whose credentials are missing skip rather than fail, so the workflow stays
green before the secrets exist — check the run summary for a note saying what
was skipped.

Nothing deploys until `verify` passes, so docs that have drifted from the
component exports, or a failing component test, block the release rather than
shipping.

Trigger the first run from **Actions → Release → Run workflow**, or just push.

## Option B — deploy from your machine

Use the `export` + `bun run deploy:*` commands above. This uploads a build made
locally and does not connect the project to Git, so pushes will not rebuild it.
Fine for a one-off; prefer Option A for anything ongoing.

## Option C — from the dashboard (with Git integration)

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

## Publishing to npm

The release workflow publishes with **Trusted Publishing**: npm verifies a
short-lived OIDC token minted by GitHub for that specific workflow run, so there
is no long-lived credential to store, leak or rotate. It also means npm attaches
a provenance attestation automatically — the package page shows which repository,
commit and workflow built it.

### One-time setup

At [npmjs.com/package/m3you/access](https://www.npmjs.com/package/m3you/access)
→ **Trusted Publisher** → **GitHub Actions**:

| Field | Value |
|---|---|
| Organization or user | `bczak` |
| Repository | `m3you` |
| Workflow filename | `release.yml` |
| Environment | *leave blank* |

The workflow filename must match exactly. If you set an environment here, the
`npm` job in `release.yml` must declare the same `environment:` name or the
exchange is rejected — it declares none, so leave the field empty.

Two things in the workflow make this work, and both are easy to lose in a
refactor:

- `permissions: id-token: write` on the `npm` job. Without it the runner cannot
  mint an OIDC token and publishing fails.
- `npm install -g npm@latest`. Trusted Publishing arrived in npm 11.5.1 and the
  npm bundled with Node is older.

### Publishing by hand

Trusted Publishing only works from CI. To publish from a laptop you still need a
token:

```bash
npm login --auth-type=legacy   # username, password and OTP in the terminal
npm publish
```

Prefer letting CI do it — bump the version in `package.json`, push, and the
workflow publishes.

## Local equivalents

```bash
bun run docs:dev           # dev server on :3000
bun run docs:build         # static build into docs/.output/public
bun run --cwd docs start   # serve the built output locally

bun run deploy:docs        # build + deploy to Cloudflare
bun run deploy:storybook   # build + deploy Storybook to Cloudflare
```
