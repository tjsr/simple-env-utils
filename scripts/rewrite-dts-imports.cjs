const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || 'dist');
const sourceExtensions = new Map([
  ['ts', 'js'],
  ['tsx', 'jsx'],
  ['mts', 'mjs'],
  ['cts', 'cjs'],
]);

const visit = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      visit(filePath);
      continue;
    }
    if (!entry.name.endsWith('.d.ts')) {
      continue;
    }

    const contents = fs.readFileSync(filePath, 'utf8');
    const rewritten = contents.replace(/(["'])(\.\.?\/[^"']+)\.(ts|tsx|mts|cts)\1/g,
      (_match, quote, specifier, extension) => `${quote}${specifier}.${sourceExtensions.get(extension)}${quote}`);
    if (rewritten !== contents) {
      fs.writeFileSync(filePath, rewritten);
    }
  }
};

visit(root);
