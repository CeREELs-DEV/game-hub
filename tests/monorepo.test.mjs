import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const repositoryRoot = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', repositoryRoot), 'utf8');

const games = [
  ['STORY GOGGLES', './games/story-goggles/'],
  ['MATTER OF PERSPECTIVE', './games/perspective/'],
  ['Life is a Fairy Tale', './games/fairy-tale/'],
  ['Connections', './games/connections/'],
  ['Coupang', './games/coupang/'],
  ['Escape Room', './games/escape-room/'],
];

function cardLinks() {
  return [...html.matchAll(/<a class="col [^"]+" href="([^"]+)"[^>]*aria-label="([^"]+)"/g)]
    .map(([, href, label]) => [label, href]);
}

test('links every hub card to a repository-local game', () => {
  assert.deepEqual(cardLinks(), games);

  for (const [, href] of games) {
    assert.ok(
      existsSync(new URL(`${href.slice(2)}index.html`, repositoryRoot)),
      `missing entry point for ${href}`,
    );
  }
});

test('keeps all game routes relative to the GitHub Pages project root', () => {
  for (const [, href] of cardLinks()) {
    assert.match(href, /^\.\//);
    assert.equal(href.startsWith('/'), false);
    assert.equal(href.includes('github.io'), false);
  }
});

test('configures the Perspective build for a relocatable subdirectory', () => {
  const viteConfig = readFileSync(
    new URL('games/perspective/vite.config.js', repositoryRoot),
    'utf8',
  );

  assert.ok(viteConfig.includes("base: './'"));
});
