const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const rules = require('../../progression.js');

const html = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf8');
const source = html.slice(html.indexOf('const KUKU_SAVE_KEY'), html.indexOf('// Explicit review mode'));

function openTabs(initial, useLocks = true) {
  let value = JSON.stringify(initial);
  let tail = Promise.resolve();
  const locks = {
    request(key, action) {
      assert.equal(key, 'kuku-save-v1');
      const turn = tail.then(action);
      tail = turn.catch(() => {});
      return turn;
    }
  };
  const storage = {
    getItem: () => value,
    setItem: (_, snapshot) => { value = snapshot; }
  };
  function tab(preview = false) {
    const context = vm.createContext({
      TEST_ALL_CHARACTERS: preview,
      localStorage: storage,
      navigator: {locks: useLocks ? locks : undefined},
      KukuRules: rules,
      window: {KukuRules: rules, addEventListener() {}},
      document: {dispatchEvent() {}},
      Event,
    });
    vm.runInContext(source, context);
    return script => vm.runInContext(script, context);
  }
  return {tab, saved: () => JSON.parse(value)};
}

function sample(points = 10) {
  return {points, owned: [0, 4], favorites: [4, 0], fragments: 7, clears: {}, rosterVersion: 1, settings: {effects: true}};
}

test('changing audio in a stale tab retains newly earned points and the ordered roster', async () => {
  for (const locks of [true, false]) {
    const {tab, saved} = openTabs(sample(), locks);
    const learner = tab(), settings = tab();
    await learner('withKukuSave(() => { KukuRules.answer(state, {d:2,n:1}, true); writeKukuSave(state); })()');
    await settings('withKukuSave(() => { state.settings.effects = false; writeKukuSave(state); })()');
    const result = saved();
    assert.equal(result.points, 20);
    assert.equal(result.settings.effects, false);
    assert.deepEqual(result.owned, [0, 4]);
    assert.deepEqual(result.favorites, [4, 0]);
    assert.equal(result.fragments, 7);
    assert.equal(tab()('state.points'), 20);
  }
});

test('two tabs cannot both spend the same 100 points', async () => {
  const {tab, saved} = openTabs(sample(100));
  const draw = "withKukuSave(() => { const result = KukuRules.draw(state, ['N','N','N','N','N'], () => 0); if (result) writeKukuSave(state); return Boolean(result); })()";
  const a = tab(), b = tab();
  const results = await Promise.all([a(draw), b(draw)]);
  assert.deepEqual(results, [true, false]);
  assert.equal(saved().points, 0);
  assert.equal(saved().drawCount, 1);
});
