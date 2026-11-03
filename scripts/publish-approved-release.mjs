import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const npm = (args) => execFileSync('npm', args, { encoding: 'utf8' }).trim();
import { firstNpmRecord as unpack, npmVersions } from './npm-json.mjs';
const sha512 = (path) => 'sha512-' + createHash('sha512').update(readFileSync(path)).digest('base64');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const verifyOnly = process.argv.includes('--verify-only');
const checkOnly = process.argv.includes('--check');
if ((!verifyOnly && !checkOnly && process.env.GITHUB_REF !== 'refs/heads/main') ||
    pkg.name !== '@tjsr/simple-env-utils' || pkg.version !== '0.1.11') {
  throw new Error('This release is authorized only for @tjsr/simple-env-utils 0.1.11 on main');
}
const registry = 'https://npm.pkg.github.com';
let expectedIntegrity;
if (!verifyOnly) {
  const versions = JSON.parse(npm(['view', pkg.name, 'versions', '--json', '--registry', registry]));
  if (npmVersions(versions).includes(pkg.version)) {
    throw new Error('Version already exists; refusing to publish or overwrite it');
  }
  if (checkOnly) {
    console.log('Verified unused release version ' + pkg.name + '@' + pkg.version);
    process.exit(0);
  }
  execFileSync('npm', ['run', 'prepack'], { stdio: 'inherit' });
  const entry = unpack(JSON.parse(npm(['pack', '--ignore-scripts', '--json'])));
  expectedIntegrity = sha512(entry.filename);
  npm(['publish', entry.filename, '--registry', registry, '--tag', 'latest']);
}
const raw = JSON.parse(npm(['view', pkg.name + '@' + pkg.version, '--json', '--registry', registry]));
const metadata = unpack(raw);
if (metadata.name !== pkg.name || metadata.version !== pkg.version) throw new Error('Wrong registry version');
console.log(JSON.stringify({ name: metadata.name, version: metadata.version, dist: metadata.dist,
  dependencies: metadata.dependencies, engines: metadata.engines, license: metadata.license }));
if (expectedIntegrity && metadata.dist.integrity !== expectedIntegrity) {
  throw new Error('Published tarball integrity does not match');
}
const temporary = mkdtempSync(join(tmpdir(), 'verify-simple-env-utils-release-'));
try {
  const entry = unpack(JSON.parse(npm(['pack', pkg.name + '@' + pkg.version,
    '--ignore-scripts', '--json', '--registry', registry, '--pack-destination', temporary])));
  if (sha512(join(temporary, entry.filename)) !== metadata.dist.integrity) {
    throw new Error('Downloaded tarball integrity does not match registry');
  }
  execFileSync(process.execPath, ['scripts/test-package.cjs'], {
    stdio: 'inherit', env: { ...process.env, PACKAGE_TEST_SPEC: join(temporary, entry.filename) },
  });
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
console.log('Verified published package ' + pkg.name + '@' + pkg.version + ' integrity, runtime and declarations');
