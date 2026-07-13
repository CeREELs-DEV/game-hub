# Card Update Date Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a trustworthy, consistently formatted update date directly below every game-card title.

**Architecture:** Keep the hub as a dependency-free static page. Add one semantic `<time class="updated">` element to each existing card and one shared CSS rule; extend the current Node test to validate card-to-date mapping, ISO metadata, visible formatting, placement, and styling.

**Tech Stack:** Static HTML/CSS, Node.js built-in test runner, `node:assert/strict`

## Global Constraints

- Visible copy must use the exact format `UPDATED · YYYY.MM.DD`.
- Machine-readable values must use `<time datetime="YYYY-MM-DD">`.
- Each date must have a unique `updated-NN` ID referenced by its card link's `aria-describedby`.
- Date values are fixed snapshots derived from the latest default-branch commit in `Asia/Seoul`; do not add runtime GitHub API calls.
- Use `IBM Plex Mono`, `10px`, `500`, `.08em`, and `var(--ink-soft)` for the date text.
- Preserve all six card titles, order, links, images, `LIVE` statuses, and `PLAY` CTAs.

---

## File Structure

- Modify `tests/index.test.mjs`: parse each title/date pair and verify exact data, semantics, placement, and shared styling.
- Modify `index.html`: define `.updated` styling and add six semantic date elements after the matching titles.

### Task 1: Add semantic update dates to all game cards

**Files:**

- Modify: `tests/index.test.mjs`
- Modify: `index.html`

**Interfaces:**

- Consumes: the existing static card structure `<h2 class="title">…</h2>` in `index.html`.
- Produces: six `<time class="updated" id="updated-NN" datetime="YYYY-MM-DD">UPDATED · YYYY.MM.DD</time>` elements and a test helper returning `{ title, id, datetime, text }` records.

- [x] **Step 1: Write the failing update-date test**

Add this helper below `getCardTitles()` in `tests/index.test.mjs`:

```js
function getCardUpdates() {
  return [...html.matchAll(/<h2 class="title">([^<]+)<\/h2>\s*<time class="updated" id="([^"]+)" datetime="([0-9]{4}-[0-9]{2}-[0-9]{2})">([^<]+)<\/time>/g)].map(
    ([, title, id, datetime, text]) => ({ title, id, datetime, text }),
  );
}
```

Add this test immediately after `renders the six playable game cards and removes coming soon content`:

```js
test('shows a semantic fixed update date directly below every card title', () => {
  assert.deepEqual(getCardUpdates(), [
    { title: 'STORY GOGGLES', id: 'updated-01', datetime: '2026-07-13', text: 'UPDATED · 2026.07.13' },
    { title: 'MATTER OF PERSPECTIVE', id: 'updated-02', datetime: '2026-07-07', text: 'UPDATED · 2026.07.07' },
    { title: 'Life is a Fairy Tale', id: 'updated-03', datetime: '2026-07-09', text: 'UPDATED · 2026.07.09' },
    { title: 'Connections', id: 'updated-04', datetime: '2026-06-12', text: 'UPDATED · 2026.06.12' },
    { title: 'Coupang', id: 'updated-05', datetime: '2026-06-12', text: 'UPDATED · 2026.06.12' },
    { title: 'Escape Room', id: 'updated-06', datetime: '2026-06-12', text: 'UPDATED · 2026.06.12' },
  ]);
  for (const { label, index } of getCardLabelsWithIndexes()) {
    assert.ok(html.includes(`aria-label="${label}" aria-describedby="updated-${index}"`));
  }
  assert.ok(html.includes(".updated{\n    display:block;font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:500;"));
  assert.ok(html.includes('letter-spacing:.08em;color:var(--ink-soft);margin-top:8px;white-space:nowrap;'));
});
```

- [x] **Step 2: Run the focused test to verify it fails**

Run:

```bash
node --test --test-name-pattern="semantic fixed update date" tests/index.test.mjs
```

Expected: FAIL because `getCardUpdates()` returns `[]` while six records are expected.

- [x] **Step 3: Add the shared date style**

In `index.html`, replace the existing `.title` bottom margin and add the `.updated` rule directly below it:

```css
  .title{
    font-family:'Oswald',sans-serif;font-weight:600;font-size:clamp(20px,2.1vw,30px);
    line-height:1.15;letter-spacing:.02em;text-transform:uppercase;
  }
  .updated{
    display:block;font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:500;
    letter-spacing:.08em;color:var(--ink-soft);margin-top:8px;white-space:nowrap;
  }
```

- [x] **Step 4: Add the six date elements**

Add `aria-describedby="updated-NN"` to each card link and insert the matching line directly after each card title in `index.html`:

```html
<h2 class="title">STORY GOGGLES</h2>
<time class="updated" id="updated-01" datetime="2026-07-13">UPDATED · 2026.07.13</time>

<h2 class="title">MATTER OF PERSPECTIVE</h2>
<time class="updated" id="updated-02" datetime="2026-07-07">UPDATED · 2026.07.07</time>

<h2 class="title">Life is a Fairy Tale</h2>
<time class="updated" id="updated-03" datetime="2026-07-09">UPDATED · 2026.07.09</time>

<h2 class="title">Connections</h2>
<time class="updated" id="updated-04" datetime="2026-06-12">UPDATED · 2026.06.12</time>

<h2 class="title">Coupang</h2>
<time class="updated" id="updated-05" datetime="2026-06-12">UPDATED · 2026.06.12</time>

<h2 class="title">Escape Room</h2>
<time class="updated" id="updated-06" datetime="2026-06-12">UPDATED · 2026.06.12</time>
```

- [x] **Step 5: Run the focused test to verify it passes**

Run:

```bash
node --test --test-name-pattern="semantic fixed update date" tests/index.test.mjs
```

Expected: PASS for the update-date test; unrelated tests are reported as skipped because of the name filter.

- [x] **Step 6: Run the full regression suite**

Run:

```bash
node --test tests/index.test.mjs
```

Observed baseline: the two card tests pass. The full suite has the same four pre-existing `demo/` failures confirmed before this change; the user approved continuing with those failures outside this task's scope.

- [x] **Step 7: Check patch hygiene**

Run:

```bash
git diff --check
```

Expected: no output and exit code 0.

- [ ] **Step 8: Visually inspect responsive layout**

Serve the repository root, inspect desktop and mobile widths, and confirm each date remains one line below the title without covering the CTA. Automated browser discovery returned no available browser, so this check could not be completed in the current environment. `white-space:nowrap` and the responsive width constraints were verified in source and tests.

- [x] **Step 9: Commit the implementation**

```bash
git add index.html tests/index.test.mjs docs/superpowers/plans/2026-07-13-card-update-date.md
git commit -m "feat: show card update dates"
```
