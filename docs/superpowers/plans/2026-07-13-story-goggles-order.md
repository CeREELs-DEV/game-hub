# Story Goggles Card Order Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 게임 허브에서 `STORY GOGGLES`를 첫 번째 카드로, `MATTER OF PERSPECTIVE`를 두 번째 카드로 표시한다.

**Architecture:** 정적 허브의 HTML DOM에서 두 카드 블록의 위치를 교환한다. 기존 Node 테스트의 제목·링크·이미지 기대 순서를 먼저 갱신하여 실패를 확인하고, 최소한의 마크업 변경으로 통과시킨다.

**Tech Stack:** HTML5, CSS, Node.js 내장 테스트 러너(`node:test`)

## Global Constraints

- `/two/` 저장소 또는 배포물은 수정하지 않는다.
- `STORY GOGGLES` 링크인 `https://cereels-dev.github.io/two/`는 변경하지 않는다.
- `20260713_Story Goggles_v5.html`은 이 저장소에 복사하지 않는다.
- 카드 이미지와 스타일은 변경하지 않는다.
- 나머지 네 카드의 순서, 번호, 링크 및 콘텐츠는 유지한다.

---

### Task 1: 카드 DOM 순서 변경

**Files:**
- Modify: `tests/index.test.mjs:30-62`
- Modify: `index.html:141-155`

**Interfaces:**
- Consumes: `index.html`의 `<a class="col ...">` 카드 마크업과 `getCardTitles()`, `getCardAnchors()`, `getCardImages()` 테스트 헬퍼
- Produces: 제목·링크·이미지 순서가 `STORY GOGGLES`, `MATTER OF PERSPECTIVE`, `Life is a Fairy Tale` 순으로 시작하는 정적 허브

- [x] **Step 1: 새 순서를 요구하도록 테스트 기대값 변경**

`tests/index.test.mjs`의 첫 번째 테스트에서 제목 배열의 시작을 다음처럼 변경한다.

```js
assert.deepEqual(getCardTitles(), [
  'STORY GOGGLES',
  'MATTER OF PERSPECTIVE',
  'Life is a Fairy Tale',
  'Connections',
  'Coupang',
  'Escape Room',
]);
```

링크 배열의 시작을 다음처럼 변경한다.

```js
assert.deepEqual(getCardAnchors(), [
  { label: 'STORY GOGGLES', href: 'https://cereels-dev.github.io/two/' },
  { label: 'MATTER OF PERSPECTIVE', href: 'https://cereels-dev.github.io/literary/' },
  { label: 'Life is a Fairy Tale', href: './demo/' },
  { label: 'Connections', href: 'https://cereels-dev.github.io/game-hub/connections/' },
  { label: 'Coupang', href: 'https://cereels-gamedev.github.io/coupang/' },
  { label: 'Escape Room', href: 'https://cereels-gamedev.github.io/escape-room/' },
]);
```

이미지 배열의 시작을 다음처럼 변경한다.

```js
assert.deepEqual(getCardImages().slice(0, 3), [
  {
    label: 'STORY GOGGLES',
    src: './assets/story-goggles-wide.png',
    alt: 'STORY GOGGLES preview',
  },
  {
    label: 'MATTER OF PERSPECTIVE',
    src: './assets/matter-of-perspective-wide.png',
    alt: 'MATTER OF PERSPECTIVE preview',
  },
  {
    label: 'Life is a Fairy Tale',
    src: './assets/life-fairytale-wide.png',
    alt: 'Life is a Fairy Tale preview',
  },
]);
```

- [x] **Step 2: 테스트를 실행하여 올바른 이유로 실패하는지 확인**

Run: `node --test tests/index.test.mjs`

Expected: 첫 번째 테스트가 실제 첫 카드 `MATTER OF PERSPECTIVE`와 기대값 `STORY GOGGLES`의 순서 불일치로 실패한다.

- [x] **Step 3: 최소 구현으로 두 카드의 HTML DOM 위치와 번호 변경**

`index.html`의 첫 두 카드 블록을 다음 순서로 배치한다.

```html
<!-- 01 · STORY GOGGLES -->
<a class="col c-two" href="https://cereels-dev.github.io/two/" target="_blank" rel="noopener" aria-label="STORY GOGGLES">
  <div class="col-top"><span class="idx">01</span><span class="status">LIVE</span></div>
  <div class="thumb"><img src="./assets/story-goggles-wide.png" alt="STORY GOGGLES preview"></div>
  <h2 class="title">STORY GOGGLES</h2>
  <div class="cta">PLAY<span class="bar"></span><span class="arrow">→</span></div>
</a>

<!-- 02 · MATTER OF PERSPECTIVE -->
<a class="col c-lit" href="https://cereels-dev.github.io/literary/" target="_blank" rel="noopener" aria-label="MATTER OF PERSPECTIVE">
  <div class="col-top"><span class="idx">02</span><span class="status">LIVE</span></div>
  <div class="thumb"><img src="./assets/matter-of-perspective-wide.png" alt="MATTER OF PERSPECTIVE preview"></div>
  <h2 class="title">MATTER OF PERSPECTIVE</h2>
  <div class="cta">PLAY<span class="bar"></span><span class="arrow">→</span></div>
</a>
```

- [x] **Step 4: 전체 Node 테스트 기준선 확인**

Run: `node --test tests/index.test.mjs`

Expected: 카드 순서 대상 테스트는 통과하고, 사용자가 진행을 승인한 기존 `demo` 관련 실패 4건 외에 새로운 실패가 없다.

- [x] **Step 5: 정적 구조와 로컬 HTTP 표시 검증**

Run: `git diff --check`

Expected: 출력 없이 종료 코드 `0`이다.

연결 가능한 브라우저가 없는 실행 환경이므로, Node DOM 테스트로 첫 번째 카드가 `STORY GOGGLES`와 번호 `01`, 두 번째 카드가 `MATTER OF PERSPECTIVE`와 번호 `02`인지 확인한다. 로컬 HTTP 서버의 응답과 `index.html`의 SHA-256이 동일한지도 확인한다.

- [x] **Step 6: 구현 커밋**

```bash
git add index.html tests/index.test.mjs docs/superpowers/plans/2026-07-13-story-goggles-order.md
git commit -m "feat: move Story Goggles to first card"
```
