/**
 * Release configuration.
 *
 * Two release channels, matching the branch flow:
 *
 *   feature/*  → no release. PRs get a Storybook preview to review against.
 *   development → prerelease on the `dev` dist-tag: 0.2.1-dev.1, -dev.2, …
 *                 Install with `npm install m3you@dev`.
 *   master      → stable release on `latest`: 0.2.1, 0.3.0, 1.0.0.
 *
 * The version is derived from commit messages, so the type prefix is the
 * decision: `fix:` → patch, `feat:` → minor, `BREAKING CHANGE:` in the body (or
 * `feat!:`) → major. Commits of other types (`docs:`, `ci:`, `chore:`) do not
 * trigger a release on their own. commitlint enforces the format so a typo
 * cannot silently mean "no release".
 *
 * Note there is no @semantic-release/git plugin: the version in package.json is
 * deliberately not committed back. semantic-release sets it at publish time, and
 * committing from CI risks loops and fights with concurrent merges. Git tags and
 * GitHub Releases are the record of what shipped.
 *
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: ['master', { name: 'development', prerelease: 'dev' }],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    // Publishes to npm. Uses Trusted Publishing (OIDC) when the workflow grants
    // `id-token: write`, and falls back to NPM_TOKEN if the exchange fails.
    '@semantic-release/npm',
    [
      '@semantic-release/github',
      {
        // Don't comment on every issue and PR included in a release.
        successComment: false,
        failCommentCondition: false,
      },
    ],
  ],
};
