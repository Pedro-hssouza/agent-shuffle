/* No server or installation required: open index.html to use this app. */
(() => {
  'use strict';
  const agents = window.AGENTS;
  const { visibleAgents, eligibleAgents, randomIndex, restoreSelection } = window.ShuffleCore;
  const $ = id => document.getElementById(id);
  const storageKey = 'agent-shuffle.preferences.v1';
  const roleLabels = [['', 'Todos'], ['Duelista', 'Duelistas'], ['Iniciador', 'Iniciadores'], ['Controlador', 'Controladores'], ['Sentinela', 'Sentinelas']];
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(storageKey)); }
  catch { $('storage-message').hidden = false; }
  const selected = restoreSelection(agents, saved);
  let currentRole = '';
  let lastResult = agents.find(agent => agent.id === saved?.result && selected.has(agent.id)) || null;
  let drawing = false;

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ version: 1, selected: [...selected], result: lastResult?.id || null }));
    } catch { $('storage-message').hidden = false; }
  }

  function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#' + name);
    svg.append(use);
    return svg;
  }

  const cards = new Map();
  for (const agent of agents) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'agent';
    card.dataset.agentId = agent.id;
    card.setAttribute('aria-label', agent.name + ', ' + agent.role);
    card.title = agent.name + ' · ' + agent.role;
    const image = document.createElement('img');
    image.src = agent.icon;
    image.alt = '';
    image.width = 130;
    image.height = 84;
    image.draggable = false;
    const name = document.createElement('span');
    name.className = 'agent-name';
    name.textContent = agent.name;
    const mark = document.createElement('span');
    mark.className = 'agent-mark';
    card.append(image, name, mark);
    card.addEventListener('click', () => {
      if (selected.has(agent.id)) selected.delete(agent.id);
      else selected.add(agent.id);
      selectionChanged();
    });
    cards.set(agent.id, card);
    $('agent-grid').append(card);
  }

  for (const [role, label] of roleLabels) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.role = role;
    button.textContent = role ? label : label + ' · ' + agents.length;
    button.setAttribute('aria-pressed', String(!role));
    button.addEventListener('click', () => {
      currentRole = role;
      for (const item of $('role-filters').children) item.setAttribute('aria-pressed', String(item === button));
      filterGrid();
    });
    $('role-filters').append(button);
  }

  function filterGrid() {
    const visible = new Set(visibleAgents(agents, $('search').value, currentRole).map(agent => agent.id));
    for (const [id, card] of cards) card.hidden = !visible.has(id);
    $('no-results').hidden = visible.size > 0;
    $('agent-grid').hidden = visible.size === 0;
  }

  function updateSelection() {
    for (const [id, card] of cards) {
      const included = selected.has(id);
      card.setAttribute('aria-pressed', String(included));
      card.querySelector('.agent-mark').replaceChildren(icon(included ? 'check' : 'cross'));
    }
    const count = selected.size;
    const excluded = agents.length - count;
    $('selection-count').textContent = `${count} de ${agents.length} agentes`;
    $('excluded-count').textContent = `${excluded} ${excluded === 1 ? 'excluído' : 'excluídos'}`;
    $('draw').disabled = count === 0 || drawing;
    $('select-all').disabled = count === agents.length;
    $('clear-selection').disabled = count === 0;
    $('draw-odds').textContent = count === 0 ? 'Nenhum agente selecionado' : `${count} ${count === 1 ? 'agente no sorteio' : 'agentes no sorteio'} · chances iguais para todos`;
    $('selection-warning').hidden = count > 0;
  }

  function showResult(agent, animate = false) {
    const resultPanel = document.querySelector('.result');
    resultPanel.classList.remove('reveal');
    $('empty-art').hidden = Boolean(agent);
    $('portrait-stage').hidden = !agent;
    const status = $('draw-status').querySelector('span');
    const buttonText = $('draw').querySelector('span');
    if (!agent) {
      $('result-role').textContent = 'DEIXE O DESTINO ESCOLHER';
      $('result-title').replaceChildren(document.createTextNode('Quem vai'), document.createElement('br'), document.createTextNode('pra partida?'));
      $('result-copy').textContent = 'Sua seleção, uma surpresa. Bora descobrir?';
      status.textContent = selected.size ? 'Pronto para sortear' : 'Aguardando seleção';
      buttonText.textContent = 'Sortear agente';
      $('result-image').removeAttribute('src');
      $('result-image').alt = '';
      return;
    }
    $('result-image').src = agent.portrait;
    $('result-image').alt = 'Retrato de ' + agent.name;
    $('portrait-name').textContent = agent.name.toUpperCase();
    $('portrait-name').style.fontSize = agent.name.length > 7 ? '84px' : agent.name.length > 5 ? '112px' : '';
    $('result-role').textContent = agent.role.toLocaleUpperCase('pt-BR');
    $('result-title').textContent = 'Vai de ' + agent.name + '.';
    $('result-copy').textContent = 'O destino escolheu. Agora é com a sua mira.';
    status.textContent = 'Sorteio concluído';
    buttonText.textContent = 'Sortear novamente';
    if (animate) {
      // Flush the previous animation so consecutive draws animate too.
      void resultPanel.offsetWidth;
      resultPanel.classList.add('reveal');
    }
  }

  function selectionChanged() {
    if (lastResult && !selected.has(lastResult.id)) lastResult = null;
    updateSelection();
    showResult(lastResult);
    persist();
    $('announcement').textContent = `${selected.size} agentes selecionados.`;
  }

  $('select-all').addEventListener('click', () => {
    agents.forEach(agent => selected.add(agent.id));
    selectionChanged();
  });
  $('clear-selection').addEventListener('click', () => {
    selected.clear();
    selectionChanged();
  });
  $('search').addEventListener('input', filterGrid);
  $('reset-filters').addEventListener('click', () => {
    $('search').value = '';
    currentRole = '';
    for (const item of $('role-filters').children) item.setAttribute('aria-pressed', String(!item.dataset.role));
    filterGrid();
    $('search').focus();
  });
  $('draw').addEventListener('click', () => {
    const pool = eligibleAgents(agents, selected);
    if (!pool.length || drawing) return;
    drawing = true;
    updateSelection();
    try {
      const numbers = new Uint32Array(1);
      const index = randomIndex(pool.length, () => {
        crypto.getRandomValues(numbers);
        return numbers[0];
      });
      lastResult = pool[index];
      showResult(lastResult, true);
      persist();
      $('announcement').textContent = `Agente sorteado: ${lastResult.name}. Função: ${lastResult.role}.`;
    } finally {
      drawing = false;
      updateSelection();
    }
  });

  updateSelection();
  filterGrid();
  showResult(lastResult);
})();
