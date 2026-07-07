import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function getCardAnchors() {
  return [...html.matchAll(/<a class="col [^"]+" href="([^"]+)"[^>]*aria-label="([^"]+)"/g)].map(
    ([, href, label]) => ({ href, label }),
  );
}

function getCards() {
  return [...html.matchAll(/<a class="([^"]*)" href="[^"]+"[^>]*aria-label="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(
    ([, className, label, body]) => ({
      className,
      label,
      status: body.match(/<span class="status">([^<]+)<\/span>/)?.[1],
    }),
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
    'Life is a Fairy Tale',
    'Two',
    'Literary',
  ]);
  assert.deepEqual(getCardAnchors(), [
    { label: 'Connections', href: 'https://cereels-dev.github.io/game-hub/connections/' },
    { label: 'Coupang', href: 'https://cereels-gamedev.github.io/coupang/' },
    { label: 'Escape Room', href: 'https://cereels-gamedev.github.io/escape-room/' },
    { label: 'Life is a Fairy Tale', href: './demo/' },
    { label: 'Two', href: 'https://cereels-dev.github.io/two/' },
    { label: 'Literary', href: 'https://cereels-dev.github.io/literary/' },
  ]);
  assert.equal(html.includes('Smoothie Bar'), false);
  assert.equal(html.includes('COMING SOON'), false);
});

test('marks only the newly added cards as new', () => {
  const cards = getCards();
  const newCards = cards.filter((card) => card.className.includes('is-new'));

  assert.deepEqual(
    newCards.map((card) => card.label),
    ['Life is a Fairy Tale', 'Two', 'Literary'],
  );
  assert.deepEqual(
    newCards.map((card) => card.status),
    ['NEW', 'NEW', 'NEW'],
  );
  assert.deepEqual(
    cards.filter((card) => !card.className.includes('is-new')).map((card) => card.status),
    ['LIVE', 'LIVE', 'LIVE'],
  );
});

test('publishes the local demo as a repo-relative static site', () => {
  const demoIndexUrl = new URL('../demo/index.html', import.meta.url);
  assert.ok(existsSync(demoIndexUrl));

  const demoHtml = readFileSync(demoIndexUrl, 'utf8');
  const scriptMatch = demoHtml.match(/src="(\.\/assets\/index-[^"]+\.js)"/);
  assert.ok(scriptMatch);

  const demoBundle = readFileSync(new URL(`../demo/${scriptMatch[1]}`, import.meta.url), 'utf8');
  assert.ok(demoBundle.includes('https://life-fairy-api.7hpym90yj95fy.ap-northeast-2.cs.amazonlightsail.com'));
  assert.ok(demoBundle.includes('./bgm.mp3'));
});
