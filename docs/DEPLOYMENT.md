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

## Release flow

```
feature/*  ──PR──▶  development  ──PR──▶  master
    │                    │                  │
 Storybook           prerelease          release
 preview URL         0.2.1-dev.1         0.2.1
                     npm tag: dev        npm tag: latest
```

**On a pull request** (`.github/workflows/pr.yml`) the change is verified —
commit messages, lint, library tests, docs coverage, types — and Storybook is
deployed to a unique preview URL, posted as a single comment that updates in
place on each push.

**On a push to `development`** (`.github/workflows/release.yml`) semantic-release
publishes a prerelease on the `dev` dist-tag:

```bash
npm install m3you@dev      # whatever the latest 0.x.y-dev.N is
```

**On a push to `master`** the same workflow publishes a stable release on
`latest`. Both branches redeploy the documentation site and Storybook.

### The version comes from your commit messages

| Commit | Result |
|---|---|
| `fix: keep the portal inside its container` | patch — 0.2.0 → 0.2.1 |
| `feat: add Carousel` | minor — 0.2.0 → 0.3.0 |
| `feat!: drop asChild` or `BREAKING CHANGE:` in the body | major — 0.2.0 → 1.0.0 |
| `docs:`, `ci:`, `chore:`, `test:` | no release; sites still redeploy |

This is why commit messages are linted rather than merely encouraged: a typo in
the prefix does not fail loudly, it silently ships nothing. `lefthook` checks the
message as you commit, and the PR workflow checks every commit in the range.

`lefthook` installs itself through the `prepare` script on `bun install`. If the
hooks ever go missing, `bunx lefthook install` restores them.

### Cutting a stable release

Open a PR from `development` to `master` and merge it. Everything already
released as `-dev.N` is rolled into one stable version.

### Nothing is committed back

semantic-release sets the version at publish time and does not commit it, so
`package.json` in git stays at whatever it was. Git tags and GitHub Releases are
the record of what shipped — deliberately, since committing from CI invites loops
and conflicts with concurrent merges.

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

`.github/workflows/release.yml` verifies, releases and deploys on every push to
`development` and `master`; `pr.yml` verifies and previews on every pull request.
See [Release flow](#release-flow) for what each branch produces.

Two repository secrets, in the **`development` environment** — not at repository
level, since that is where the deploy jobs read them from:

| Secret | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | the token created above |
| `CLOUDFLARE_ACCOUNT_ID` | your account ID |

Environment-scoped secrets are invisible to jobs that do not declare that
environment — worth remembering if a deploy job ever reports missing
credentials.

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

Releases are automated — see [Release flow](#release-flow). npm needs no secret:
`@semantic-release/npm` exchanges the workflow's GitHub OIDC token for a
short-lived publish token (Trusted Publishing) and attaches a provenance
attestation. Verified working — the run log reads *"OIDC token exchange with the
npm registry succeeded"*.

Two things the release job depends on:

- `permissions: id-token: write`, without which no OIDC token can be minted.
- `npm install -g npm@latest`. Trusted Publishing needs npm 11.5.1 or newer and
  the npm bundled with Node is older.

If the exchange ever fails, the plugin falls back to `NPM_TOKEN`, which is still
passed through as a safety net.

### One-time npm setup

npmjs.com → m3you → **Settings → Trusted Publisher → GitHub Actions**:

| Field | Value |
|---|---|
| Organization or user | `bczak` |
| Repository | `m3you` |
| Workflow filename | `release.yml` |
| Environment | *leave blank* |

The filename must match exactly, and the environment field must stay empty
because the release job declares no environment.

## Local equivalents

```bash
bun run docs:dev           # dev server on :3000
bun run docs:build         # static build into docs/.output/public
bun run --cwd docs start   # serve the built output locally

bun run deploy:docs        # build + deploy to Cloudflare
bun run deploy:storybook   # build + deploy Storybook to Cloudflare
```
