import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
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

function assetSha256(path) {
  return createHash('sha256').update(readFileSync(new URL(path, import.meta.url))).digest('hex');
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
      src: './assets/matter-of-perspective-wide.png',
      alt: 'MATTER OF PERSPECTIVE preview',
    },
    {
      label: 'STORY GOGGLES',
      src: './assets/story-goggles-wide.png',
      alt: 'STORY GOGGLES preview',
    },
    {
      label: 'Life is a Fairy Tale',
      src: './assets/life-fairytale-wide.png',
      alt: 'Life is a Fairy Tale preview',
    },
  ]);
  assert.ok(html.includes('.thumb{\n    width:100%;aspect-ratio:4/3;'));
  assert.ok(html.includes('.thumb img{width:100%;height:100%;object-fit:cover;display:block;}'));
  assert.equal(html.includes('aspect-ratio:16/9'), false);
  assert.equal(html.includes('object-fit:contain'), false);
  assert.ok(existsSync(new URL('../assets/life-fairytale-wide.png', import.meta.url)));
  assert.ok(existsSync(new URL('../assets/story-goggles-wide.png', import.meta.url)));
  assert.ok(existsSync(new URL('../assets/matter-of-perspective-wide.png', import.meta.url)));
  assert.equal(
    assetSha256('../assets/matter-of-perspective-wide.png'),
    '1d28f60aabef4a36ce1ed93388b4fafb3b3b6cd5336ba0e9363782e558f151c0',
  );
  assert.equal(
    assetSha256('../assets/story-goggles-wide.png'),
    '62cb4f2f077e29574a5d677bb891eb467559ae13dc8b2b5526ffe9e6ceeef119',
  );
  assert.equal(
    assetSha256('../assets/life-fairytale-wide.png'),
    '92cd276f77607e36531babc6e8a631b06c2dd47f146ad9fb071c6bc15e26d135',
  );
});

test('publishes the functional local demo as a repo-relative static app', () => {
  const demoIndexUrl = new URL('../demo/index.html', import.meta.url);
  assert.ok(existsSync(demoIndexUrl));

  const demoHtml = readFileSync(demoIndexUrl, 'utf8');
  const scriptMatch = demoHtml.match(/src="(\.\/assets\/index-[^"]+\.js)"/);
  assert.ok(scriptMatch);
  assert.notEqual(scriptMatch[1], './assets/index-CPTZC-Cd.js');
  assert.ok(demoHtml.includes('<div id="root"></div>'));
  assert.equal(demoHtml.includes('<div class="stage">'), false);

  const demoBundle = readFileSync(new URL(`../demo/${scriptMatch[1]}`, import.meta.url), 'utf8');
  assert.ok(demoBundle.includes('https://life-fairy-api.7hpym90yj95fy.ap-northeast-2.cs.amazonlightsail.com'));
  assert.ok(demoBundle.includes('./bgm.mp3'));
});

test('normalizes API-returned storage asset paths before rendering media', () => {
  const demoIndexUrl = new URL('../demo/index.html', import.meta.url);
  const demoHtml = readFileSync(demoIndexUrl, 'utf8');
  const scriptMatch = demoHtml.match(/src="(\.\/assets\/index-[^"]+\.js)"/);
  assert.ok(scriptMatch);

  const demoBundle = readFileSync(new URL(`../demo/${scriptMatch[1]}`, import.meta.url), 'utf8');
  assert.match(demoBundle, /startsWith\("\/"\)&&[a-zA-Z_$][\w$]*!==""\?`\$\{[a-zA-Z_$][\w$]*\}\$\{[a-zA-Z_$][\w$]*\}`:[a-zA-Z_$][\w$]*/);
  assert.match(demoBundle, /imageUrl:[a-zA-Z_$][\w$]*\([a-zA-Z_$][\w$]*\.imageUrl\),voiceUrl:[a-zA-Z_$][\w$]*\([a-zA-Z_$][\w$]*\.voiceUrl\),layers:[a-zA-Z_$][\w$]*\([a-zA-Z_$][\w$]*\.layers\)/);
  assert.match(demoBundle, /outputs:.*?\.map\([a-zA-Z_$][\w$]*=>\(\{\.\.\.[a-zA-Z_$][\w$]*,url:[a-zA-Z_$][\w$]*\([a-zA-Z_$][\w$]*\.url\)\}\)\),bgmUrl:[a-zA-Z_$][\w$]*\([a-zA-Z_$][\w$]*\.bgmUrl\)/);
});

test('verifies a backend story still exists before opening the animated watch view', () => {
  const demoIndexUrl = new URL('../demo/index.html', import.meta.url);
  const demoHtml = readFileSync(demoIndexUrl, 'utf8');
  const scriptMatch = demoHtml.match(/src="(\.\/assets\/index-[^"]+\.js)"/);
  assert.ok(scriptMatch);

  const demoBundle = readFileSync(new URL(`../demo/${scriptMatch[1]}`, import.meta.url), 'utf8');
  assert.match(demoBundle, /await [a-zA-Z_$][\w$]*\([a-zA-Z_$][\w$]*\),[a-zA-Z_$][\w$]*\(\{type:"SET_OVERLAY",overlay:"watch"\}\)/);
  assert.match(demoBundle, /\/404\|not found\/i\.test\([a-zA-Z_$][\w$]*\)\)\{[a-zA-Z_$][\w$]*\(\{type:"RESET_STORY"\}\);return\}/);
  assert.ok(demoBundle.includes('type:"RESET_STORY"'));
  assert.equal(demoBundle.includes('a!=null&&t({type:"SET_OVERLAY",overlay:"watch"})'), false);
});

test('does not automatically call heavy parallax layer generation after each image', () => {
  const demoIndexUrl = new URL('../demo/index.html', import.meta.url);
  const demoHtml = readFileSync(demoIndexUrl, 'utf8');
  const scriptMatch = demoHtml.match(/src="(\.\/assets\/index-[^"]+\.js)"/);
  assert.ok(scriptMatch);

  const demoBundle = readFileSync(new URL(`../demo/${scriptMatch[1]}`, import.meta.url), 'utf8');
  assert.equal(demoBundle.includes('typeof Hc=="function"'), false);
  assert.equal(demoBundle.includes('Hc(n,x)'), false);
  assert.equal(demoBundle.includes('/layers'), false);
});

test('sets the browser page title to Creverse Hub', () => {
  assert.ok(html.includes('<title>Creverse Hub</title>'));
  assert.equal(html.includes('<title>Supermarket Game Hub</title>'), false);
});
