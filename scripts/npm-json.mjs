// npm 12 may key JSON records by package identifier; older npm uses arrays/objects.
export function firstNpmRecord(value) {
  if (Array.isArray(value)) return value[0];
  if (value && typeof value === 'object' && ('name' in value || 'filename' in value)) return value;
  return Object.values(value)[0];
}

export function npmVersions(value) {
  if (typeof value === 'string') return [value];
  return (Array.isArray(value) ? value : Object.values(value)).flat(Infinity);
}
