# Dependency and CI maintenance

## npm verification and private dependencies

Follow the [shared TJSR policy][tjsr-npm-policy]. These essentials apply even when
the shared document cannot be fetched and qualify any install/test recipes below.

- Run safe local checks with existing access. If private dependencies need
  unavailable credentials, skip installation and dependent checks. After a
  401/403 authentication failure, stop retrying `npm ci` or `npm install` until
  access changes. Record an environment blocker, not a code failure.
- Do not ask for, copy, print, or provision tokens. An agent already running
  in authenticated Actions may use its configured job credentials.
  For now, assume local Codex on `tjsr-3700x` and GitHub-launched Codex agents
  lack private-package access unless explicitly configured otherwise; a GitHub
  launch alone does not establish Actions job authentication.
- Never stub private packages, invent dependency contents, use `--force` or
  `--legacy-peer-deps` to bypass resolution, disable checks, or fake success.
- Before pushing, inspect push/PR workflows and called actions for unintended
  package/image publishing, releases, or deployments. If unsafe, retain a local
  commit/patch and report the required gating change.
- When safe, commit and push authorized changes to a task/PR branch and open or
  update a draft PR. Verify through configured GitHub Actions using existing
  package grants; ordinary branches do not require Copilot delegation.
- Monitor the exact latest pushed SHA to a terminal result, inspect failed logs,
  and fix recoverable issues within scope. Report passed, failed, and unrun local
  and CI checks separately with head SHA and PR/run links. Missing workflows,
  package grants, job permissions, approvals, or Dependabot/fork secret access
  remain blockers; an older green run is insufficient.
- For new verification work, use Node 24 primarily, Node 22 where supported,
  and latest npm compatible with the declared engine floor. Check the actual
  supported matrix; this does not authorize CI/runtime/dependency changes.
- No direct-main push, approval/merge/auto-merge, release, deployment, settings
  change, or token provisioning is implied. Prior release authorization is not
  standing permission. If separately authorized to merge a repaired multi-commit
  Dependabot PR, prefer squash; a single-commit PR may use rebase.

[tjsr-npm-policy]: https://github.com/tjsr/tjsr/blob/251fd1d0606a6ce7e0c994190bbe8f318028fb9e/agent-policies/npm-ci-verification.md

- Keep all direct npm dependencies on their latest stable compatible releases. Do not remove or replace the personal `@tjsr/*` libraries, including `@tjsr/eslint-config` sourced from `github:tjsr/eslint-config#main`.
- This repository supports Node.js 24.21.0 or newer and npm 12.1.0 or newer. Keep `package.json`, lockfile, and GitHub Actions aligned with that baseline.
- TypeScript 7 must remain supported. Use the current stable TypeScript 7 release unless a newer stable release is available.
- `@tjsr/eslint-config` currently uses TypeScript-ESLint 8, which cannot run against TypeScript 7. Retain `scripts/eslint-typescript-compat.cjs`, which limits only the lint process to the config package's TypeScript 6 copy; remove that launcher once the personal config upgrades to TypeScript-ESLint with TypeScript 7 support.
- GitHub Actions must use the `NODE_VERSION`, `NPM_VERSION`, and `TYPESCRIPT_VERSION` repository variables. Never replace them with hard-coded workflow values, and never remove the `gh variable set` commands from the README. Keep the documented values aligned with `package.json` and `package-lock.json`.
- Keep the explicit `Cache node modules` npm-cache step in `.github/workflows/build.yml`; do not replace or remove it when updating `actions/setup-node` or other CI configuration. `actions/cache` must use a published action version (currently `v4`), never an assumed matching major version.
- After changing dependencies, regenerate `package-lock.json` with npm 12.1.0 and verify `npm ci`, `npm test`, and `npm run build`.
- Private GitHub Packages need `NODE_AUTH_TOKEN` in CI; retain the scoped registry configuration and npm 12's `allow-git=root` setting in `.npmrc`.
- Dependabot must retain both named registries in `.github/dependabot.yml`: `npm-github` for GitHub Packages and `npm-npmjs` for the public npm registry. The npm update entry must continue to reference both under `registries`; do not remove either registry or its credentials.

## TypeScript Style

- Format TypeScript and TSX with the repository's Prettier config. Use two spaces and spaces, never tabs.
- Use explicit relative extensions: `.ts` for TypeScript modules and `.tsx` for TSX modules.
- Keep imports in the order enforced by `@tjsr/eslint-config`'s `import/order` rule; do not use a separate alphabetic import sorter.
- Format and apply ESLint fixes on save. Run the repository's lint check after changing imports or formatting rules.

## Package Type Exports

- Keep `exports` type conditions aligned with both ESM and CommonJS runtime entries. Verify declaration files referenced by each condition are included in `npm pack --dry-run`.
- When source imports use explicit `.ts` extensions, verify emitted JavaScript and declaration specifiers resolve to files in the packed ESM and CJS folders.
- Before a dependent repo updates its lockfile, ensure the fixed package version is published to GitHub Packages; a workspace package version alone is not installable in CI.
- When a consumer CJS build fails to resolve this package's types, inspect its lockfile version and conditional `exports`; ensure both `import` and `require` resolve declaration files before publishing a fix.
- Keep the next unpublished fixed release at `0.1.11` unless another version has since been published; after publishing, update dependent lockfiles from the registry rather than checking in a local tarball reference.
