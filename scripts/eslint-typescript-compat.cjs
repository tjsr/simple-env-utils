// @tjsr/eslint-config currently uses TypeScript-ESLint 8, which is not yet
// compatible with TypeScript 7. Limit its ESLint process to the TypeScript 6
// copy npm installs underneath that package; the project compiler stays on 7.
const Module = require('node:module');
const path = require('node:path');

const configPackage = require.resolve('@tjsr/eslint-config/package.json');
const configDirectory = path.dirname(configPackage);
const lintTypeScript = require.resolve('typescript', { paths: [configDirectory] });
const resolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveTypeScriptForLint(request, parent, ...args) {
  if (request === 'typescript') {
    return lintTypeScript;
  }
  return resolveFilename.call(this, request, parent, ...args);
};
