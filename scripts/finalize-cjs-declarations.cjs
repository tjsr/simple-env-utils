const fs = require('node:fs');
const path = require('node:path');

// Keep runtime and declaration identities aligned in the CommonJS graph.
// Match extensions exactly: the old rewrite helper produced .js.cjs paths.
function finalize(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      finalize(file);
    } else if (entry.name.endsWith('.js')) {
      const contents = fs.readFileSync(file, 'utf8')
        .replace(/(require\(['"])(\.\.?\/[^'"]+)\.js(['"]\))/g, '$1$2.cjs$3')
        .replace(/\.js\.map/g, '.cjs.map');
      fs.writeFileSync(file.replace(/\.js$/, '.cjs'), contents);
      fs.unlinkSync(file);
    } else if (entry.name.endsWith('.js.map')) {
      const map = JSON.parse(fs.readFileSync(file, 'utf8'));
      map.file = map.file.replace(/\.js$/, '.cjs');
      fs.writeFileSync(file.replace(/\.js\.map$/, '.cjs.map'), JSON.stringify(map));
      fs.unlinkSync(file);
    } else if (entry.name.endsWith('.d.ts')) {
      const contents = fs.readFileSync(file, 'utf8')
        .replace(/(['"])(\.\.?\/[^'"]+)\.js\1/g, '$1$2.cjs$1')
        .replace(/\.d\.ts\.map/g, '.d.cts.map');
      fs.writeFileSync(file.replace(/\.d\.ts$/, '.d.cts'), contents);
      fs.unlinkSync(file);
    } else if (entry.name.endsWith('.d.ts.map')) {
      const map = JSON.parse(fs.readFileSync(file, 'utf8'));
      map.file = map.file.replace(/\.d\.ts$/, '.d.cts');
      fs.writeFileSync(file.replace(/\.d\.ts\.map$/, '.d.cts.map'), JSON.stringify(map));
      fs.unlinkSync(file);
    }
  }
}
finalize('dist/cjs');
