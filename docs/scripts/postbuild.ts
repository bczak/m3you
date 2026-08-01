/**
 * Emit `index.html` and `404.html` from the SPA shell.
 *
 * TanStack Start's SPA mode prerenders real HTML for every route except the
 * root, which it leaves to the client. Without an `index.html` the site's home
 * page depends entirely on the host being told to rewrite `/` to `_shell.html`.
 *
 * Copying the shell to both filenames makes the output portable: `/` resolves
 * on any static host, and unknown paths fall back to the shell so the router
 * can render its own not-found page.
 *
 * This is also why there is no `_redirects` file. A catch-all rewrite to
 * `/_shell.html` looks right but loops on Cloudflare Pages, which strips `.html`
 * and 308s to `/_shell` — which matches the catch-all again. Real `index.html`
 * and `404.html` files need no rewrite rules at all.
 */
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const publicDir = resolve(dirname(fileURLToPath(import.meta.url)), '../.output/public');
const shell = resolve(publicDir, '_shell.html');

if (!existsSync(shell)) {
  console.error('postbuild: _shell.html not found — did the build run?');
  process.exit(1);
}

for (const name of ['index.html', '404.html']) {
  const target = resolve(publicDir, name);
  if (existsSync(target)) continue; // never clobber a genuinely prerendered page
  copyFileSync(shell, target);
  console.log(`postbuild: wrote ${name} from _shell.html`);
}
