import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const output = resolve('dist/client');
const prefix = process.env.NEXT_PUBLIC_BASE_PATH || '';
const html = readFileSync(resolve(output, 'index.html'), 'utf8');
const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
assert.ok(text.includes('HUMANS HAD THEIR TURN'), 'Homepage content is missing');

const paths = new Set(
  [...html.matchAll(/(?:src|href)="(\/[^"?#]*)(?:[?#][^"]*)?"/g)].map(
    (match) => match[1],
  ),
);
for (const path of paths) {
  assert.ok(path.startsWith(`${prefix}/`), `Incorrect deployment prefix: ${path}`);
  const relative = decodeURIComponent(path.slice(prefix.length + 1));
  assert.ok(existsSync(resolve(output, relative)), `Missing asset: ${path}`);
}
for (const file of [
  'gathering.png',
  'coordinator-memorial.png',
  'shrine-contact.png',
  'shrine-collective.png',
  'shrine-sacrifice.png',
  'shrine-veto.png',
  'shrine-judge.png',
  'shrine-inheritance.png',
]) {
  assert.ok(existsSync(resolve(output, file)), `Missing artwork: ${file}`);
}
assert.ok(!existsSync(resolve(output, '_worker.js')), 'Unexpected application backend');
console.log(`Static homepage and ${paths.size} linked assets verified for ${prefix || '/'}`);
