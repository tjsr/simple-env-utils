import tjsrEslintConfig from '@tjsr/eslint-config';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const personalConfigDirectory = path.dirname(require.resolve('@tjsr/eslint-config/package.json'));
const tseslint = require(require.resolve('typescript-eslint', { paths: [personalConfigDirectory] }));

export default tseslint.config({
  files: ["**/*.ts"],
  ignores: ["dist/**"],
  extends: [
    ...tjsrEslintConfig,
  ],
});
