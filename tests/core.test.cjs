const { test } = require('node:test');
const assert = require('node:assert/strict');
const { visibleAgents, eligibleAgents, randomIndex, restoreSelection } = require('../core.js');
const agents = [
  { id: 'j', name: 'Jett', role: 'Duelista' },
  { id: 'k', name: 'KAY/O', role: 'Iniciador' },
  { id: 's', name: 'Sage', role: 'Sentinela' }
];
test('search and role filtering combine without changing the draw pool', () => {
  const selected = new Set(['j', 's']);
  assert.deepEqual(visibleAgents(agents, ' jÉTt ', 'Duelista'), [agents[0]]);
  assert.deepEqual(visibleAgents(agents, 'jett', 'Sentinela'), []);
  assert.deepEqual(visibleAgents(agents, 'KAY/', ''), [agents[1]]);
  assert.deepEqual(eligibleAgents(agents, selected), [agents[0], agents[2]]);
});
test('empty and single-agent selections are handled', () => {
  assert.deepEqual(eligibleAgents(agents, new Set()), []);
  assert.equal(randomIndex(1, () => 4294967295), 0);
  assert.throws(() => randomIndex(0, () => 0), RangeError);
});
test('random sampling rejects out-of-range values and covers every eligible slot', () => {
  const draws = [4294967295, 4];
  assert.equal(randomIndex(3, () => draws.shift()), 1);
  assert.equal(draws.length, 0);
  for (let i = 0; i < 25; i++) assert.equal(randomIndex(25, () => i), i);
});
test('saved preferences preserve intentional empty selections and discard unknown IDs', () => {
  assert.deepEqual([...restoreSelection(agents, null)], ['j', 'k', 's']);
  assert.deepEqual([...restoreSelection(agents, { version: 1, selected: [] })], []);
  assert.deepEqual([...restoreSelection(agents, { version: 1, selected: ['j', 'unknown', 'j', 1] })], ['j']);
  assert.equal(restoreSelection(agents, { version: 5, selected: [] }).size, 3);
});
