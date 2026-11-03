import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const npm = (args) => execFileSync('npm', args, { encoding: 'utf8' }).trim();
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const checkOnly = process.argv.includes('--check');
if ((!checkOnly && process.env.GITHUB_REF !== 'refs/heads/main') ||
    pkg.name !== '@tjsr/simple-env-utils' || pkg.version !== '0.1.11') {
  throw new Error('This release is authorized only for @tjsr/simple-env-utils 0.1.11 on main');
}
const registry = 'https://npm.pkg.github.com';
const versions = JSON.parse(npm(['view', pkg.name, 'versions', '--json', '--registry', registry]));
if ([versions].flat().includes(pkg.version)) {
  throw new Error('Version already exists; refusing to publish or overwrite it');
}
if (checkOnly) {
  console.log('Verified unused release version ' + pkg.name + '@' + pkg.version);
  process.exit(0);
}
execFileSync('npm', ['run', 'prepack'], { stdio: 'inherit' });
const packed = JSON.parse(npm(['pack', '--ignore-scripts', '--json']));
const entry = Array.isArray(packed) ? packed[0] : Object.values(packed)[0];
const integrity = 'sha512-' + createHash('sha512').update(readFileSync(entry.filename)).digest('base64');
npm(['publish', entry.filename, '--registry', registry, '--tag', 'latest']);
const published = npm(['view', pkg.name + '@' + pkg.version, 'dist.integrity', '--registry', registry]);
if (published !== integrity) throw new Error('Published tarball integrity does not match');
execFileSync(process.execPath, ['scripts/test-package.cjs'], {
  stdio: 'inherit', env: { ...process.env, PACKAGE_TEST_SPEC: pkg.name + '@' + pkg.version },
});
console.log('Verified published package ' + pkg.name + '@' + pkg.version + ' integrity, runtime and declarations');

console.log('Published registry metadata: ' + npm(['view', pkg.name + '@' + pkg.version, '--json', '--registry', registry]));
