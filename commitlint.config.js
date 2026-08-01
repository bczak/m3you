/**
 * Commit message rules.
 *
 * semantic-release reads these messages to decide the next version, so a
 * malformed message does not just look untidy — it means the change silently
 * ships no release. lefthook checks this on commit, and CI checks it on PRs.
 *
 * @type {import('@commitlint/types').UserConfig}
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // The types that map to a release, plus the housekeeping ones that do not.
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'perf', 'refactor', 'docs', 'style', 'test', 'build', 'ci', 'chore', 'revert'],
    ],
    // Long subjects get truncated in release notes and `git log --oneline`.
    'header-max-length': [2, 'always', 100],
    // The body is where BREAKING CHANGE: goes, so it must stay readable.
    'body-max-line-length': [1, 'always', 100],
  },
};
