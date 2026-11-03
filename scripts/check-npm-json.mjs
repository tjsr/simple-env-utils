import assert from 'node:assert/strict';
import { test } from 'node:test';
import { firstNpmRecord, npmVersions } from './npm-json.mjs';

const metadata = { name: '@tjsr/fs-utils', version: '0.0.9', dist: { integrity: 'sha512-example' } };
test('metadata accepts ordinary, array and npm12 keyed objects', () => {
  for (const input of [metadata, [metadata], { '@tjsr/fs-utils@0.0.9': metadata }]) {
    assert.deepEqual(firstNpmRecord(input), metadata);
  }
});
test('pack accepts ordinary, array and npm12 keyed objects', () => {
  const record = { filename: 'tjsr-fs-utils-0.0.9.tgz' };
  for (const input of [record, [record], { '@tjsr/fs-utils@0.0.9': record }]) {
    assert.deepEqual(firstNpmRecord(input), record);
  }
});
test('collision checks cover versions in all npm response shapes', () => {
  for (const input of ['0.0.9', ['0.0.8', '0.0.9'], { '@tjsr/fs-utils': ['0.0.8', '0.0.9'] }]) {
    assert.ok(npmVersions(input).includes('0.0.9'));
  }
});
