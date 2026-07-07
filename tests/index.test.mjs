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

function getCardImages() {
  return [...html.matchAll(/<a class="col [^"]+" href="[^"]+"[^>]*aria-label="([^"]+)"[^>]*>[\s\S]*?<img src="([^"]+)" alt="([^"]+)"/g)].map(
    ([, label, src, alt]) => ({ label, src, alt }),
  );
}

test('renders the six playable game cards and removes coming soon content', () => {
  assert.ok(html.includes('6 / 6 PLAYABLE'));
  assert.deepEqual(getCardTitles(), [
    'MATTER OF PERSPECTIVE',
    'STORY GOGGLES',
    'Life is a Fairy Tale',
    'Connections',
    'Coupang',
    'Escape Room',
  ]);
  assert.deepEqual(getCardAnchors(), [
    { label: 'MATTER OF PERSPECTIVE', href: 'https://cereels-dev.github.io/literary/' },
    { label: 'STORY GOGGLES', href: 'https://cereels-dev.github.io/two/' },
    { label: 'Life is a Fairy Tale', href: './demo/' },
    { label: 'Connections', href: 'https://cereels-dev.github.io/game-hub/connections/' },
    { label: 'Coupang', href: 'https://cereels-gamedev.github.io/coupang/' },
    { label: 'Escape Room', href: 'https://cereels-gamedev.github.io/escape-room/' },
  ]);
  assert.equal(html.includes('Smoothie Bar'), false);
  assert.equal(html.includes('COMING SOON'), false);
  assert.deepEqual(getCardImages().slice(0, 3), [
    {
      label: 'MATTER OF PERSPECTIVE',
      src: './assets/matter-of-perspective.png',
      alt: 'MATTER OF PERSPECTIVE preview',
    },
    {
      label: 'STORY GOGGLES',
      src: './assets/story-goggles.png',
      alt: 'STORY GOGGLES preview',
    },
    {
      label: 'Life is a Fairy Tale',
      src: './assets/life-is-a-fairytale.png',
      alt: 'Life is a Fairy Tale preview',
    },
  ]);
  assert.ok(existsSync(new URL('../assets/life-is-a-fairytale.png', import.meta.url)));
  assert.ok(existsSync(new URL('../assets/story-goggles.png', import.meta.url)));
  assert.ok(existsSync(new URL('../assets/matter-of-perspective.png', import.meta.url)));
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
