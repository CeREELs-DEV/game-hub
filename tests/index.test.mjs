import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function getCardAnchors() {
  return [...html.matchAll(/<a class="col [^"]+" href="([^"]+)"[^>]*aria-label="([^"]+)"/g)].map(
    ([, href, label]) => ({ href, label }),
  );
}

function getCardTitles() {
  return [...html.matchAll(/<h2 class="title">([^<]+)<\/h2>/g)].map(([, title]) => title);
}

test('renders the six playable game cards and removes coming soon content', () => {
  assert.ok(html.includes('6 / 6 PLAYABLE'));
  assert.deepEqual(getCardTitles(), [
    'Connections',
    'Coupang',
    'Escape Room',
    'Demo',
    'Two',
    'Literary',
  ]);
  assert.deepEqual(getCardAnchors(), [
    { label: 'Connections', href: 'https://cereels-dev.github.io/game-hub/connections/' },
    { label: 'Coupang', href: 'https://cereels-gamedev.github.io/coupang/' },
    { label: 'Escape Room', href: 'https://cereels-gamedev.github.io/escape-room/' },
    { label: 'Demo', href: './demo/' },
    { label: 'Two', href: 'https://cereels-dev.github.io/two/' },
    { label: 'Literary', href: 'https://cereels-dev.github.io/literary/' },
  ]);
  assert.equal(html.includes('Smoothie Bar'), false);
  assert.equal(html.includes('COMING SOON'), false);
});

test('publishes the local demo as a repo-relative static site', () => {
  assert.ok(existsSync(new URL('../demo/index.html', import.meta.url)));
});
