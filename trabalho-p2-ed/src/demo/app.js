(() => {
  'use strict';
  // Simulador de BST. Cada operação gera uma lista de "quadros" (snapshots da árvore + destaque + log).
  // Play/Passo/Reset apenas navegam por esses quadros. Nó = { k: chave, l: filho esq, r: filho dir }.
  // Contagem de comparações: 1 por nó visitado (igual ao algoritmo.py).
  const $ = id => document.getElementById(id);
  const clone = t => (t ? JSON.parse(JSON.stringify(t)) : null);
  const count = t => (t ? 1 + count(t.l) + count(t.r) : 0);
  const height = t => (t ? 1 + Math.max(height(t.l), height(t.r)) : -1);
  const MEDIUM = [47, 21, 76, 13, 32, 58, 89, 5, 17, 27, 40, 66, 82, 95, 52];
  const SORTED = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

  let base = null, baseCmp = 0, frames = [], idx = 0, timer = null, reverted = false;

  // ---------- registro de quadros ----------
  const pathHl = (path, extra = {}) => {
    const h = Object.fromEntries(path.map(k => [k, 'path']));
    Object.assign(h, extra);
    Object.defineProperty(h, 'seq', { value: [...path] });
    return h;
  };
  const snap = (S, log, hl = {}, order = {}) =>
    S.f.push({ tree: clone(S.w), hl: { ...hl }, seq: hl.seq || [], order, log, cmp: S.c });

  // ---------- operações ----------
  function insert(S, k) {
    if (!S.w) { S.w = { k, l: null, r: null }; snap(S, `Árvore vazia: ${k} vira a raiz.`, { [k]: 'new' }); return; }
    let n = S.w; const path = [];
    while (true) {
      S.c++;
      if (k === n.k) { snap(S, `${k} == ${n.k}: chave duplicada, nada a inserir.`, pathHl(path, { [n.k]: 'cur' })); return; }
      const side = k < n.k ? 'l' : 'r';
      snap(S, `Compara ${k} com ${n.k}: ${side === 'l' ? 'menor, vai para a esquerda' : 'maior, vai para a direita'}.`, pathHl(path, { [n.k]: 'cur' }));
      path.push(n.k);
      if (!n[side]) {
        n[side] = { k, l: null, r: null };
        snap(S, `Posição vazia à ${side === 'l' ? 'esquerda' : 'direita'} de ${n.k}: ${k} é inserido aqui.`, pathHl(path, { [k]: 'new' }));
        return;
      }
      n = n[side];
    }
  }

  function search(S, k) {
    let n = S.w; const path = [];
    while (n) {
      S.c++;
      if (k === n.k) { snap(S, `${k} == ${n.k}: encontrado!`, pathHl(path, { [k]: 'found' })); return; }
      snap(S, `Compara ${k} com ${n.k}: ${k < n.k ? 'menor, desce à esquerda' : 'maior, desce à direita'}.`, pathHl(path, { [n.k]: 'cur' }));
      path.push(n.k);
      n = k < n.k ? n.l : n.r;
    }
    snap(S, `Chegou a um ponto vazio: ${k} não está na árvore.`, pathHl(path));
  }

  function del(S, k) {
    let p = null, n = S.w; const path = [];
    const replace = (x, y) => { if (!p) S.w = y; else if (p.l === x) p.l = y; else p.r = y; };
    while (n && n.k !== k) {
      S.c++;
      snap(S, `Compara ${k} com ${n.k}: ${k < n.k ? 'menor, desce à esquerda' : 'maior, desce à direita'}.`, pathHl(path, { [n.k]: 'cur' }));
      path.push(n.k); p = n; n = k < n.k ? n.l : n.r;
    }
    if (!n) { snap(S, `${k} não existe: nada a remover.`, pathHl(path)); return; }
    S.c++;
    const kids = (n.l ? 1 : 0) + (n.r ? 1 : 0);
    snap(S, `Encontrou ${k} (${kids} filho${kids === 1 ? '' : 's'}).`, pathHl(path, { [k]: 'del' }));
    if (kids < 2) {
      replace(n, n.l || n.r);
      snap(S, kids ? `${k} é removido e o seu filho sobe para o lugar dele.` : `${k} é folha: é só removê-lo.`, pathHl(path));
      return;
    }
    let sp = n, s = n.r; S.c++;
    snap(S, `Dois filhos: busca o sucessor (menor chave da subárvore direita), começando em ${s.k}.`, pathHl(path, { [k]: 'del', [s.k]: 'cur' }));
    while (s.l) {
      sp = s; s = s.l; S.c++;
      snap(S, `Desce à esquerda até ${s.k}.`, pathHl(path, { [k]: 'del', [s.k]: 'cur' }));
    }
    snap(S, `Sucessor encontrado: ${s.k}.`, pathHl(path, { [k]: 'del', [s.k]: 'found' }));
    if (sp === n) n.r = s.r; else sp.l = s.r;
    n.k = s.k;
    snap(S, `${s.k} é copiado para o lugar de ${k} e o nó sucessor original é removido.`, pathHl(path, { [n.k]: 'new' }));
  }

  function trav(S, kind) {
    const names = { in: 'em ordem (esq, raiz, dir)', pre: 'pré-ordem (raiz, esq, dir)', post: 'pós-ordem (esq, dir, raiz)' };
    const order = {}, seq = [];
    const visit = n => {
      order[n.k] = seq.length + 1;
      snap(S, `Visita ${n.k}: posição ${seq.length + 1} na travessia ${names[kind]}.`, pathHl(seq, { [n.k]: 'cur' }), { ...order });
      seq.push(n.k);
    };
    const go = n => {
      if (!n) return;
      if (kind === 'pre') visit(n);
      go(n.l);
      if (kind === 'in') visit(n);
      go(n.r);
      if (kind === 'post') visit(n);
    };
    if (!S.w) { snap(S, 'Árvore vazia: nada a visitar.'); return; }
    go(S.w);
    snap(S, `Resultado ${names[kind]}: [${seq.join(', ')}]`, pathHl(seq), { ...order });
  }

  // ---------- desenho ----------
  function drawTree(svg, f, dy = 62) {
    const pos = {}; let i = 0;
    (function go(n, d) { if (!n) return; go(n.l, d + 1); pos[n.k] = { x: i++, y: d, n }; go(n.r, d + 1); })(f.tree, 0);
    const need = 80 + Math.max(i - 1, 0) * 46, W = Math.max(520, need), H = 72 + Math.max(height(f.tree), 0) * dy;
    const X = x => (W - need) / 2 + 40 + x * 46, Y = d => 36 + d * dy;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    let s = '';
    Object.values(pos).forEach(({ x, y, n }) => [n.l, n.r].forEach(c => {
      if (c) s += `<line class="e" x1="${X(x)}" y1="${Y(y)}" x2="${X(pos[c.k].x)}" y2="${Y(pos[c.k].y)}"/>`;
    }));
    Object.entries(pos).forEach(([k, { x, y }]) => {
      const c = f.hl[k] || '';
      s += `<circle class="n ${c}" cx="${X(x)}" cy="${Y(y)}" r="18"/><text class="k${c ? ' hl' : ''}" x="${X(x)}" y="${Y(y)}">${k}</text>`;
      if (f.order[k]) s += `<text class="o" x="${X(x)}" y="${Y(y) - 23}">${f.order[k]}</text>`;
    });
    svg.innerHTML = s || `<text class="k" x="${W / 2}" y="40" style="fill:var(--muted)">Árvore vazia</text>`;
  }

  const draw = f => drawTree($('tree'), f);

  function render() {
    const f = frames[idx];
    draw(f);
    $('log').textContent = f.log;
    $('mStep').textContent = `${idx}/${frames.length - 1}`;
    $('mCmp').textContent = f.cmp;
    $('mNH').textContent = `${count(f.tree)} / ${height(f.tree)}`;
    const cur = Object.keys(f.hl).filter(k => f.hl[k] === 'cur');
    $('mCur').textContent = cur.length ? cur.join(', ') : '-';
    $('mPath').textContent = f.seq.length ? f.seq.join(' → ') : '-';
  }

  // ---------- controle de execução ----------
  const start = log => ({ tree: clone(base), hl: {}, seq: [], order: {}, cmp: baseCmp, log: log || 'Pronto: use Play ou Próximo passo.' });

  function stop() { clearInterval(timer); timer = null; }
  function commit() { // a operação anterior vira o novo estado base, se o usuário já a executou
    if (!reverted && frames.length > 1) { const l = frames[frames.length - 1]; base = clone(l.tree); baseCmp = l.cmp; }
  }
  function queue(fn) {
    stop(); commit();
    const S = { w: clone(base), c: baseCmp, f: [] };
    fn(S);
    frames = [start(), ...S.f]; idx = 0; reverted = false;
    $('compare').innerHTML = '';
    render();
  }
  function step() {
    if (idx < frames.length - 1) { idx++; reverted = false; render(); }
    if (idx >= frames.length - 1) stop();
  }
  function play() {
    if (timer || idx >= frames.length - 1) return;
    timer = setInterval(step, +$('speed').value);
  }
  function load(keys, label) {
    stop(); base = null; baseCmp = 0; frames = []; idx = 0;
    queue(S => { keys.forEach(k => insert(S, k)); snap(S, `${label}: ${keys.length} chaves inseridas, ${S.c} comparações no total.`); });
  }
  function compare() {
    const run = keys => { const S = { w: null, c: 0, f: [] }; keys.forEach(k => insert(S, k)); return { t: S.w, h: height(S.w), c: S.c }; };
    const a = run(MEDIUM), o = run([...MEDIUM].sort((x, y) => x - y)), n = MEDIUM.length;
    $('compare').innerHTML = `<table><tr><th>n = ${n}</th><th>Altura</th><th>Comparações</th></tr>
      <tr><td>Aleatória</td><td>${a.h}</td><td>${a.c}</td></tr><tr><td>Ordenada</td><td>${o.h}</td><td>${o.c}</td></tr></table>
      <div class="pair"><figure><svg id="cA" role="img" aria-label="Árvore da inserção aleatória"></svg><figcaption>Inserção aleatória: árvore baixa, O(log n) por operação.</figcaption></figure>
      <figure><svg id="cO" role="img" aria-label="Árvore da inserção ordenada"></svg><figcaption>Inserção ordenada: árvore degenerada, O(n) por operação.</figcaption></figure></div>`;
    const fr = t => ({ tree: t, hl: {}, order: {} });
    drawTree($('cA'), fr(a.t), 40); drawTree($('cO'), fr(o.t), 40);
    $('log').textContent = `Aleatória: altura perto de log₂ n. Ordenada: a árvore vira uma lista (altura n-1); inserir n chaves custa n(n-1)/2 = ${o.c} comparações.`;
  }

  // ---------- eventos ----------
  const withKey = fn => () => {
    const k = parseInt($('key').value, 10);
    if (Number.isNaN(k) || k < -99 || k > 999) { $('log').textContent = 'Digite um número inteiro entre -99 e 999.'; return; }
    queue(S => fn(S, k));
  };
  $('bIns').onclick = withKey(insert);
  $('bSea').onclick = withKey(search);
  $('bDel').onclick = withKey(del);
  $('key').onkeydown = e => { if (e.key === 'Enter') $('bIns').click(); };
  $('bIn').onclick = () => queue(S => trav(S, 'in'));
  $('bPre').onclick = () => queue(S => trav(S, 'pre'));
  $('bPost').onclick = () => queue(S => trav(S, 'post'));
  $('bAvg').onclick = () => load(MEDIUM, 'Caso médio (ordem embaralhada)');
  $('bWorst').onclick = () => load(SORTED, 'Pior caso (ordem crescente, árvore degenerada)');
  $('bCustom').onclick = () => {
    const keys = $('custom').value.split(/[\s,;]+/).filter(s => s !== '').map(Number).filter(k => Number.isInteger(k) && k >= -99 && k <= 999).slice(0, 40);
    if (keys.length) load(keys, 'Exemplo customizado'); else $('log').textContent = 'Informe inteiros entre -99 e 999 separados por vírgula.';
  };
  $('bCmp').onclick = compare;
  $('bPlay').onclick = play;
  $('bStep').onclick = () => { stop(); step(); };
  $('bPause').onclick = stop;
  $('bReset').onclick = () => { stop(); idx = 0; reverted = true; render(); }; // desfaz a operação atual
  $('bClear').onclick = () => { stop(); base = null; baseCmp = 0; frames = [start('Árvore vazia.')]; idx = 0; $('compare').innerHTML = ''; render(); };
  $('speed').onchange = () => { if (timer) { stop(); play(); } };

  frames = [start('Escolha uma operação ou um cenário.')];
  render();
})();
