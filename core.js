/* Pure functions shared by the browser and automated checks. */
(function (root) {
  'use strict';
  function normalize(value) {
    return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
  function visibleAgents(agents, query, role) {
    const term = normalize(query);
    return agents.filter(agent => (!role || agent.role === role) && normalize(agent.name).includes(term));
  }
  function eligibleAgents(agents, selected) {
    return agents.filter(agent => selected.has(agent.id));
  }
  // Rejection sampling avoids the modulo bias when the pool size is not a power of two.
  function randomIndex(length, nextUint32) {
    if (!Number.isInteger(length) || length < 1 || length > 0x100000000) {
      throw new RangeError('A seleção precisa ter pelo menos um agente.');
    }
    const limit = Math.floor(0x100000000 / length) * length;
    let value;
    do { value = nextUint32(); } while (value >= limit);
    return value % length;
  }
  function restoreSelection(agents, saved) {
    const known = new Set(agents.map(agent => agent.id));
    if (!saved || saved.version !== 1 || !Array.isArray(saved.selected)) return known;
    return new Set(saved.selected.filter(id => typeof id === 'string' && known.has(id)));
  }
  const api = { normalize, visibleAgents, eligibleAgents, randomIndex, restoreSelection };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ShuffleCore = api;
})(globalThis);
