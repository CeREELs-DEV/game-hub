import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
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
  assert.notEqual(scriptMatch[1], './assets/index-DvNkIyDb.js');
  assert.ok(demoHtml.includes('<div id="root"></div>'));
  assert.equal(demoHtml.includes('<div class="stage">'), false);

  const demoBundle = readFileSync(new URL(`../demo/${scriptMatch[1]}`, import.meta.url), 'utf8');
  assert.ok(demoBundle.includes('https://life-fairy-api.7hpym90yj95fy.ap-northeast-2.cs.amazonlightsail.com'));
  assert.ok(demoBundle.includes('./bgm.mp3'));
});

test('publishes the v3 fairy tale prototype diary samples and journal image', () => {
  const demoIndexUrl = new URL('../demo/index.html', import.meta.url);
  const demoHtml = readFileSync(demoIndexUrl, 'utf8');
  const scriptMatch = demoHtml.match(/src="(\.\/assets\/index-[^"]+\.js)"/);
  assert.ok(scriptMatch);

  const demoBundle = readFileSync(new URL(`../demo/${scriptMatch[1]}`, import.meta.url), 'utf8');
  assert.ok(demoBundle.includes('A Boring Day'));
  assert.ok(demoBundle.includes('The Worst Luck'));
  assert.ok(demoBundle.includes('kimchi fried rice'));
  assert.ok(demoBundle.includes('Ooh, a bookstore adventure!'));
  assert.ok(demoBundle.includes('Not sure what to write? Tap an example diary entry:'));
  assert.equal(demoBundle.includes('Jonah Pickett'), false);
  assert.equal(demoBundle.includes('Computer Book'), false);

  const sampleImages = readdirSync(new URL('../demo/assets/', import.meta.url))
    .filter((name) => /^sample-moment-.*\.jpg$/.test(name))
    .sort();
  assert.equal(sampleImages.length, 3);
  assert.deepEqual(
    sampleImages.map((name) => assetSha256(`../demo/assets/${name}`)).sort(),
    [
      '031fa2acdc174646913f69a057f45d912f96a11f805a493b46f7b564ae7f9b39',
      '21321328cf38e7eaaf9c083d9a17eb616112de971c80a34bccc3c0ca8a5ae87b',
      'd8b2b22ee87abd13957a928b1838a97ce552bf480a624109da9ee237db6b7902',
    ],
  );
});

test('publishes the prototype photo step instead of the camera overlay entry state', () => {
  const demoIndexUrl = new URL('../demo/index.html', import.meta.url);
  const demoHtml = readFileSync(demoIndexUrl, 'utf8');
  const scriptMatch = demoHtml.match(/src="(\.\/assets\/index-[^"]+\.js)"/);
  const cssMatch = demoHtml.match(/href="(\.\/assets\/index-[^"]+\.css)"/);
  assert.ok(scriptMatch);
  assert.ok(cssMatch);

  const demoBundle = readFileSync(new URL(`../demo/${scriptMatch[1]}`, import.meta.url), 'utf8');
  const demoCss = readFileSync(new URL(`../demo/${cssMatch[1]}`, import.meta.url), 'utf8');
  assert.ok(demoBundle.includes('Tap to add a photo'));
  assert.ok(demoBundle.includes('No photo? Drag one of these up into the box:'));
  assert.ok(demoBundle.includes('a game you played'));
  assert.ok(demoBundle.includes('something yummy you ate'));
  assert.ok(demoBundle.includes('Frames'));
  assert.ok(demoBundle.includes('0 0 40 40'));
  assert.ok(demoBundle.includes('photoclear'));
  assert.ok(demoBundle.includes('exarrow left'));
  assert.ok(demoBundle.includes('exarrow right'));
  assert.ok(demoBundle.includes('capture:"environment"'));
  assert.equal(demoBundle.includes('Open camera'), false);
  assert.ok(demoCss.includes('.chosen .swatch{width:64px;height:64px'));
  assert.ok(demoCss.includes('.chosen .swatch.swatch-svg'));
  assert.ok(demoCss.includes('.chosen .swatch.swatch-svg svg{width:100%;height:100%;padding:8px;box-sizing:border-box}'));
  assert.ok(
    demoCss.includes(
      '.canvaszone{flex:1;padding:16px 22px 12px;background:linear-gradient(180deg,#b6e1ed,#d6eff3 60%,#e9f7fa);',
    ),
  );
  assert.ok(demoCss.includes('box-shadow:none'));
});

test('publishes the prototype arc board shell and backdrop styling', () => {
  const demoIndexUrl = new URL('../demo/index.html', import.meta.url);
  const demoHtml = readFileSync(demoIndexUrl, 'utf8');
  const scriptMatch = demoHtml.match(/src="(\.\/assets\/index-[^"]+\.js)"/);
  const cssMatch = demoHtml.match(/href="(\.\/assets\/index-[^"]+\.css)"/);
  assert.ok(scriptMatch);
  assert.ok(cssMatch);

  const demoBundle = readFileSync(new URL(`../demo/${scriptMatch[1]}`, import.meta.url), 'utf8');
  const demoCss = readFileSync(new URL(`../demo/${cssMatch[1]}`, import.meta.url), 'utf8');
  assert.ok(demoBundle.includes('Rags to Riches'));
  assert.ok(demoBundle.includes('SUPERNOVA'));
  assert.equal(demoBundle.includes('The Ugly Duckling'), false);
  assert.equal(demoBundle.includes('Paper Cutout'), false);
  assert.ok(demoBundle.includes('boardArea'));
  assert.ok(demoBundle.includes('emptytap'));
  assert.ok(demoBundle.includes('tap to add'));
  assert.ok(demoBundle.includes('hintbob'));
  assert.ok(demoCss.includes('background:#e9f7fa'));
  assert.ok(demoCss.includes('white-space:nowrap'));
  assert.ok(
    demoCss.includes(
      '@media (min-width:1040px){.storyhead{position:relative;padding-right:210px}.storyhead .animatebtn{position:absolute;top:10px;right:4px;margin:0}}',
    ),
  );
  assert.ok(demoCss.includes('.homesteps .storyfytile.current .step-hd{background:var(--pp);border-bottom-color:var(--pp)}'));
  assert.ok(demoCss.includes('background-image:url(./arc-backdrop-BIPnPopZ.jpg)'));
  assert.ok(demoCss.includes('background-image:url(./arc-angel-DMO2vD6j.png)'));
  assert.ok(demoCss.includes('background-image:url(./arc-devil-BEMTLZk7.png)'));
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

test('sends only the main journal paragraph from the prototype diary sample', () => {
  const demoIndexUrl = new URL('../demo/index.html', import.meta.url);
  const demoHtml = readFileSync(demoIndexUrl, 'utf8');
  const scriptMatch = demoHtml.match(/src="(\.\/assets\/index-[^"]+\.js)"/);
  assert.ok(scriptMatch);

  const demoBundle = readFileSync(new URL(`../demo/${scriptMatch[1]}`, import.meta.url), 'utf8');
  assert.ok(demoBundle.includes('journalMainCrop={x:.05,y:.245,w:.9,h:.51}'));
  assert.ok(demoBundle.includes('doc:!0,crop:journalMainCrop'));
  assert.equal(demoBundle.includes(',xA={x:.05,y:.245,w:.9,h:.51}'), false);
  assert.ok(demoBundle.includes('toDataURL("image/jpeg",.9)'));
  assert.match(demoBundle, /onClick:\(\)=>void [a-zA-Z_$][\w$]*\([a-zA-Z_$][\w$]*\.src,[a-zA-Z_$][\w$]*\.crop\)/);
});

test('structures typed samples through dump mode and uses the fairy-tale photo genre', () => {
  const demoIndexUrl = new URL('../demo/index.html', import.meta.url);
  const demoHtml = readFileSync(demoIndexUrl, 'utf8');
  const scriptMatch = demoHtml.match(/src="(\.\/assets\/index-[^"]+\.js)"/);
  assert.ok(scriptMatch);

  const demoBundle = readFileSync(new URL(`../demo/${scriptMatch[1]}`, import.meta.url), 'utf8');
  assert.ok(demoBundle.includes('await Xc(x,{text:y.momentText.trim(),panelCount:y.count,arcId:A})'));
  assert.ok(demoBundle.includes('await i0(x,"magical",m,y.count,A)'));
  assert.equal(demoBundle.includes('await Xc(x,{text:y.momentText,panelCount:y.count})'), false);
  assert.equal(demoBundle.includes('await i0(x,"adventure",m,y.count)'), false);
});

test('applies the selected step-three arc to story structuring payloads and panels', () => {
  const demoIndexUrl = new URL('../demo/index.html', import.meta.url);
  const demoHtml = readFileSync(demoIndexUrl, 'utf8');
  const scriptMatch = demoHtml.match(/src="(\.\/assets\/index-[^"]+\.js)"/);
  assert.ok(scriptMatch);

  const demoBundle = readFileSync(new URL(`../demo/${scriptMatch[1]}`, import.meta.url), 'utf8');
  assert.ok(demoBundle.includes('const storyArcBeatsForStructuring='));
  assert.ok(demoBundle.includes('function applySelectedStoryArcToStructuredStory(e,t){'));
  assert.ok(demoBundle.includes('Selected story arc: ${ru[t].name}. Arc beat: ${l}.'));
  assert.ok(demoBundle.includes('const A=y.guideArc??"rags"'));
  assert.ok(demoBundle.includes('text:y.momentText.trim(),panelCount:y.count,arcId:A'));
  assert.ok(demoBundle.includes('analysis:m,panelCount:y.count,arcId:A'));
  assert.ok(demoBundle.includes('await i0(x,"magical",m,y.count,A)'));
});

test('sets the browser page title to Creverse Hub', () => {
  assert.ok(html.includes('<title>Creverse Hub</title>'));
  assert.equal(html.includes('<title>Supermarket Game Hub</title>'), false);
});
