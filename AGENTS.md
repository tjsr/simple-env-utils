# Dependency and CI maintenance

- Keep all direct npm dependencies on their latest stable compatible releases. Do not remove or replace the personal `@tjsr/*` libraries, including `@tjsr/eslint-config` sourced from `github:tjsr/eslint-config#main`.
- This repository supports Node.js 24.21.0 or newer and npm 12.1.0 or newer. Keep `package.json`, lockfile, and GitHub Actions aligned with that baseline.
- TypeScript 7 must remain supported. Use the current stable TypeScript 7 release unless a newer stable release is available.
- `@tjsr/eslint-config` currently uses TypeScript-ESLint 8, which cannot run against TypeScript 7. Retain `scripts/eslint-typescript-compat.cjs`, which limits only the lint process to the config package's TypeScript 6 copy; remove that launcher once the personal config upgrades to TypeScript-ESLint with TypeScript 7 support.
- GitHub Actions must use the `NODE_VERSION`, `NPM_VERSION`, and `TYPESCRIPT_VERSION` repository variables. Never replace them with hard-coded workflow values, and never remove the `gh variable set` commands from the README. Keep the documented values aligned with `package.json` and `package-lock.json`.
- Keep the explicit `Cache node modules` npm-cache step in `.github/workflows/build.yml`; do not replace or remove it when updating `actions/setup-node` or other CI configuration. `actions/cache` must use a published action version (currently `v4`), never an assumed matching major version.
- After changing dependencies, regenerate `package-lock.json` with npm 12.1.0 and verify `npm ci`, `npm test`, and `npm run build`.
- Private GitHub Packages need `NODE_AUTH_TOKEN` in CI; retain the scoped registry configuration and npm 12's `allow-git=root` setting in `.npmrc`.
- Dependabot must retain both named registries in `.github/dependabot.yml`: `npm-github` for GitHub Packages and `npm-npmjs` for the public npm registry. The npm update entry must continue to reference both under `registries`; do not remove either registry or its credentials.
