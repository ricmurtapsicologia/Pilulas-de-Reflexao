(() => {
  'use strict';

  const state = {
    data: null,
    items: [],
    tracks: [],
    activeTrack: 'all',
    query: '',
    activeItem: null,
    completed: new Set(readJSON('pr_completed', [])),
    positions: readJSON('pr_positions', {}),
    currentAudioId: null,
    saveTick: 0
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const els = {
    needs: $('#need-grid'), tracks: $('#track-grid'), filters: $('#filters'), catalog: $('#catalog'),
    search: $('#search'), resultCount: $('#result-count'), recommendation: $('#recommendation-card'),
    progressPanel: $('#progress-panel'), progressLabel: $('#progress-label'), progressBar: $('#progress-bar'),
    dialog: $('#pill-dialog'), dialogContent: $('#dialog-content'), player: $('#player'), audio: $('#global-audio'),
    playerTitle: $('#player-title'), playerSubtitle: $('#player-subtitle'), playPause: $('#play-pause'),
    back10: $('#back-10'), forward10: $('#forward-10'), seek: $('#seek'), currentTime: $('#current-time'),
    duration: $('#duration'), speed: $('#speed'), toast: $('#toast')
  };

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    try {
      const [catalogResponse, extraResponse, audioResponse] = await Promise.all([
        fetch('./data/pilulas.json?v=3.0.0', { cache: 'no-store' }),
        fetch('./data/pilulas-v3-extra.json?v=3.0.0', { cache: 'no-store' }),
        fetch('./data/audio-v3.json?v=3.0.0', { cache: 'no-store' })
      ]);
      if (!catalogResponse.ok) throw new Error(`Falha ao carregar catálogo: ${catalogResponse.status}`);
      state.data = await catalogResponse.json();
      const extras = extraResponse.ok ? await extraResponse.json() : { items: {} };
      const audio = audioResponse.ok ? await audioResponse.json() : { items: {} };
      state.items = (state.data.items || []).map((item) => {
        const extra = extras.items?.[item.id] || {};
        const audioV3 = audio.items?.[item.id];
        return {
          ...item,
          ...extra,
          audioUrl: audioV3?.url || item.audioUrl || null,
          audioVersion: audioV3 ? 'v3' : (item.audioUrl ? 'legado' : null),
          audioDuration: audioV3?.duration || item.duration
        };
      });
      state.tracks = state.data.tracks || [];
      injectExperienceStrip();
      renderNeeds();
      renderTracks();
      renderFilters();
      renderCatalog();
      renderDailyRecommendation();
      updateProgress();
      bindEvents();
      openFromHash();
    } catch (error) {
      console.error(error);
      if (els.catalog) els.catalog.innerHTML = '<div class="empty-state">Não foi possível carregar a biblioteca agora. Tente atualizar a página.</div>';
    }
  }

  function injectExperienceStrip() {
    const hero = $('.hero');
    if (!hero || $('.experience-strip')) return;
    const section = document.createElement('section');
    section.className = 'experience-strip';
    section.setAttribute('aria-label', 'Como funciona cada pílula');
    section.innerHTML = `<div class="shell"><div class="experience-grid">
      <div class="experience-item"><span class="experience-number">01</span><div><strong>Escute</strong><p>Áudios breves, com ritmo de conversa e sem introduções longas.</p></div></div>
      <div class="experience-item"><span class="experience-number">02</span><div><strong>Compreenda</strong><p>Leitura enxuta, exemplo cotidiano e um conceito psicológico por vez.</p></div></div>
      <div class="experience-item"><span class="experience-number">03</span><div><strong>Experimente</strong><p>Uma prática pequena para transformar reflexão em comportamento observável.</p></div></div>
    </div></div>`;
    hero.insertAdjacentElement('afterend', section);
  }

  function bindEvents() {
    els.search?.addEventListener('input', (event) => {
      state.query = event.target.value.trim().toLocaleLowerCase('pt-BR');
      renderCatalog();
    });
    $('#dialog-close')?.addEventListener('click', closeDialog);
    els.dialog?.addEventListener('click', (event) => { if (event.target === els.dialog) closeDialog(); });
    els.dialog?.addEventListener('close', () => {
      if (location.hash.startsWith('#pilula=')) history.replaceState(null, '', location.pathname + location.search);
    });
    window.addEventListener('hashchange', openFromHash);
    els.playPause?.addEventListener('click', toggleAudio);
    els.back10?.addEventListener('click', () => jumpAudio(-10));
    els.forward10?.addEventListener('click', () => jumpAudio(10));
    els.seek?.addEventListener('input', () => {
      if (Number.isFinite(els.audio?.duration)) els.audio.currentTime = Number(els.seek.value);
    });
    els.speed?.addEventListener('change', () => { if (els.audio) els.audio.playbackRate = Number(els.speed.value || 1); });
    els.audio?.addEventListener('play', syncPlayButton);
    els.audio?.addEventListener('pause', syncPlayButton);
    els.audio?.addEventListener('loadedmetadata', onMetadata);
    els.audio?.addEventListener('timeupdate', onTimeUpdate);
    els.audio?.addEventListener('ended', onAudioEnded);
    els.audio?.addEventListener('error', () => showToast('Não foi possível reproduzir este áudio.'));
  }

  function renderNeeds() {
    if (!els.needs) return;
    els.needs.innerHTML = '';
    (state.data.needs || []).forEach((need) => {
      const button = document.createElement('button');
      button.className = 'chip'; button.type = 'button'; button.textContent = need.label;
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        $$('.chip', els.needs).forEach((item) => item.setAttribute('aria-pressed', 'false'));
        button.setAttribute('aria-pressed', 'true');
        const candidates = need.items.map(findItem).filter(Boolean);
        const item = candidates.find((candidate) => !state.completed.has(candidate.id)) || candidates[0];
        if (item) renderRecommendation(item, `Para “${need.label}”`);
        $('#recomendacao')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      });
      els.needs.appendChild(button);
    });
  }

  function renderDailyRecommendation() {
    if (!state.items.length) return;
    const dayIndex = Math.floor(Date.now() / 86400000) % state.items.length;
    const ordered = [...state.items.slice(dayIndex), ...state.items.slice(0, dayIndex)];
    renderRecommendation(ordered.find((item) => !state.completed.has(item.id)) || ordered[0], 'Para hoje');
  }

  function renderRecommendation(item, eyebrow) {
    if (!els.recommendation || !item) return;
    els.recommendation.innerHTML = `<div><div class="section-kicker">${escapeHTML(eyebrow)}</div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.takeaway || item.description)}</p></div><button class="secondary-button" type="button" data-open="${escapeAttr(item.id)}">Abrir experiência</button>`;
    $('[data-open]', els.recommendation)?.addEventListener('click', () => openItem(item.id));
  }

  function renderTracks() {
    if (!els.tracks) return;
    els.tracks.innerHTML = '';
    state.tracks.forEach((track) => {
      const items = state.items.filter((item) => item.track === track.id);
      const done = items.filter((item) => state.completed.has(item.id)).length;
      const article = document.createElement('article');
      article.className = 'track-card';
      article.innerHTML = `<div><div class="track-meta">${done}/${items.length} experiências concluídas</div><h3>${escapeHTML(track.name)}</h3><p>${escapeHTML(track.description)}</p></div><button type="button" class="ghost-button" data-track="${escapeAttr(track.id)}">Explorar trilha →</button>`;
      $('[data-track]', article)?.addEventListener('click', () => { setTrack(track.id); $('#biblioteca')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' }); });
      els.tracks.appendChild(article);
    });
  }

  function renderFilters() {
    if (!els.filters) return;
    els.filters.innerHTML = '';
    [{ id: 'all', name: 'Todas' }, ...state.tracks].forEach((track) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'filter-button'; button.textContent = track.name; button.dataset.track = track.id;
      button.setAttribute('aria-pressed', String(track.id === state.activeTrack));
      button.addEventListener('click', () => setTrack(track.id));
      els.filters.appendChild(button);
    });
  }

  function setTrack(trackId) {
    state.activeTrack = trackId;
    $$('.filter-button', els.filters).forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.track === trackId)));
    renderCatalog();
  }

  function getFilteredItems() {
    return state.items.filter((item) => {
      const matchTrack = state.activeTrack === 'all' || item.track === state.activeTrack;
      const haystack = [item.title, item.shortTitle, item.description, item.skill, item.takeaway, item.example, trackName(item.track)].filter(Boolean).join(' ').toLocaleLowerCase('pt-BR');
      return matchTrack && (!state.query || haystack.includes(state.query));
    });
  }

  function renderCatalog() {
    if (!els.catalog) return;
    const items = getFilteredItems(); els.catalog.innerHTML = '';
    if (els.resultCount) els.resultCount.textContent = `${items.length} ${items.length === 1 ? 'pílula' : 'pílulas'}`;
    if (!items.length) {
      els.catalog.innerHTML = '<div class="empty-state">Nenhuma pílula corresponde a esse filtro. Tente outro termo ou explore todas as trilhas.</div>';
      return;
    }
    items.forEach((item) => {
      const completed = state.completed.has(item.id);
      const article = document.createElement('article'); article.className = 'pill-card';
      article.innerHTML = `<div class="pill-top"><span class="pill-tag">${escapeHTML(trackName(item.track))}</span><span class="pill-status">${completed ? '<span class="completed-dot"></span>concluída' : escapeHTML(item.duration || '')}</span></div>
        <div class="pill-format-row"><span class="format-pill">${item.audioUrl ? 'áudio + leitura' : 'leitura guiada'}</span><span class="format-pill subtle">prática breve</span></div>
        <h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.takeaway || item.description)}</p>
        <div class="pill-meta"><span>${escapeHTML(item.skill || '')}</span></div>
        <div class="card-actions"><button class="card-action" type="button" data-open="${escapeAttr(item.id)}">${item.audioUrl ? 'Ouvir, ler e praticar' : 'Ler e praticar'}</button></div>`;
      $('[data-open]', article)?.addEventListener('click', () => openItem(item.id));
      els.catalog.appendChild(article);
    });
  }

  function openItem(id) {
    const item = findItem(id); if (!item || !els.dialog) return;
    state.activeItem = item;
    const reading = (item.reading || []).map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join('');
    const visual = item.visual ? renderVisual(item.visual) : '';
    const completed = state.completed.has(item.id);
    const practice = item.practice ? `<section class="practice-box"><div class="box-label">Experimente agora</div><h3>${escapeHTML(item.practice.title)}</h3><div class="practice-steps">${(item.practice.steps || []).map((step) => `<div class="practice-step">${escapeHTML(step)}</div>`).join('')}</div></section>` : '';
    const example = item.example ? `<aside class="example-box"><div class="box-label">Exemplo cotidiano</div><p>${escapeHTML(item.example)}</p></aside>` : '';
    const takeaway = item.takeaway ? `<aside class="takeaway-box"><div class="box-label">Leve com você</div><p>${escapeHTML(item.takeaway)}</p></aside>` : '';
    const audioButton = item.audioUrl ? `<button class="primary-button" type="button" id="dialog-play">▶ Ouvir áudio</button><p class="audio-note">${item.audioVersion === 'v3' ? 'Narração V3 masterizada.' : 'Áudio original preservado enquanto a nova masterização é validada.'}</p>` : '';
    const next = relatedItem(item);
    els.dialogContent.innerHTML = `<div class="section-kicker">${escapeHTML(trackName(item.track))}</div><h2 class="dialog-title">${escapeHTML(item.title)}</h2>
      <div class="dialog-meta">${escapeHTML(item.audioDuration || item.duration || '')} · ${escapeHTML(item.skill || '')}</div>
      <p class="dialog-lead">${escapeHTML(item.description)}</p>${audioButton}${takeaway}${visual}
      <section class="reading" aria-labelledby="read-${escapeAttr(item.id)}"><h3 id="read-${escapeAttr(item.id)}">Entenda</h3>${reading}</section>
      ${example}${practice}
      <aside class="reflection-box"><h3>Para refletir</h3><p>${escapeHTML(item.reflection || '')}</p></aside>
      <div class="dialog-nav"><button class="complete-button ${completed ? 'is-complete' : ''}" id="complete-item" type="button">${completed ? '✓ Concluída' : 'Marcar como concluída'}</button>${next ? `<button class="next-pill" type="button" data-next="${escapeAttr(next.id)}">Próxima relacionada →<br><span>${escapeHTML(next.shortTitle || next.title)}</span></button>` : ''}</div>`;
    $('#dialog-play', els.dialogContent)?.addEventListener('click', () => playItem(item.id));
    $('#complete-item', els.dialogContent)?.addEventListener('click', () => toggleCompleted(item.id));
    $('[data-next]', els.dialogContent)?.addEventListener('click', () => openItem(next.id));
    if (!els.dialog.open) els.dialog.showModal();
    history.replaceState(null, '', `${location.pathname}${location.search}#pilula=${encodeURIComponent(item.slug)}`);
  }

  function renderVisual(visual) {
    return `<section class="visual-block" aria-label="Microvisual: ${escapeAttr(visual.title)}"><h3>${escapeHTML(visual.title)}</h3><div class="visual-flow">${(visual.steps || []).map((step) => `<div class="visual-step">${escapeHTML(step)}</div>`).join('')}</div></section>`;
  }

  function relatedItem(item) {
    const same = state.items.filter((candidate) => candidate.track === item.track && candidate.id !== item.id);
    if (!same.length) return null;
    const index = state.items.indexOf(item);
    return same.find((candidate) => state.items.indexOf(candidate) > index) || same[0];
  }

  function closeDialog() { els.dialog?.close(); }

  function toggleCompleted(id) {
    state.completed.has(id) ? state.completed.delete(id) : state.completed.add(id);
    localStorage.setItem('pr_completed', JSON.stringify([...state.completed]));
    renderCatalog(); renderTracks(); updateProgress();
    if (state.activeItem?.id === id) openItem(id);
  }

  function markCompleted(id) {
    if (state.completed.has(id)) return;
    state.completed.add(id); localStorage.setItem('pr_completed', JSON.stringify([...state.completed]));
    renderCatalog(); renderTracks(); updateProgress(); showToast('Pílula concluída.');
  }

  function updateProgress() {
    if (!els.progressPanel || !state.items.length) return;
    const done = state.items.filter((item) => state.completed.has(item.id)).length;
    const percentage = Math.round((done / state.items.length) * 100);
    els.progressPanel.classList.toggle('is-visible', done > 0);
    if (els.progressLabel) els.progressLabel.textContent = `${done} de ${state.items.length} experiências concluídas`;
    if (els.progressBar) { els.progressBar.style.width = `${percentage}%`; els.progressBar.parentElement?.setAttribute('aria-valuenow', String(percentage)); }
  }

  function playItem(id) {
    const item = findItem(id); if (!item?.audioUrl || !els.audio) return;
    const changed = state.currentAudioId !== item.id;
    state.currentAudioId = item.id; els.playerTitle.textContent = item.title; els.playerSubtitle.textContent = `${trackName(item.track)} · ${item.audioVersion === 'v3' ? 'áudio V3' : 'áudio preservado'}`; els.player.classList.add('is-visible');
    if (changed) {
      els.audio.src = item.audioUrl; els.audio.load();
      els.audio.addEventListener('loadedmetadata', () => {
        const saved = Number(state.positions[item.id] || 0);
        if (saved > 0 && saved < els.audio.duration - 5) els.audio.currentTime = saved;
        els.audio.play().catch(() => showToast('Toque em reproduzir para iniciar o áudio.'));
      }, { once: true });
    } else els.audio.play().catch(() => {});
    closeDialog();
  }

  function toggleAudio() { if (!els.audio?.src) return; els.audio.paused ? els.audio.play().catch(() => {}) : els.audio.pause(); }
  function jumpAudio(seconds) { if (Number.isFinite(els.audio?.duration)) els.audio.currentTime = clamp(els.audio.currentTime + seconds, 0, els.audio.duration); }
  function onMetadata() { els.seek.max = String(Math.floor(els.audio.duration || 0)); els.duration.textContent = formatTime(els.audio.duration); }
  function onTimeUpdate() {
    els.seek.value = String(Math.floor(els.audio.currentTime || 0)); els.currentTime.textContent = formatTime(els.audio.currentTime); state.saveTick += 1;
    if (state.currentAudioId && state.saveTick % 5 === 0) { state.positions[state.currentAudioId] = Math.floor(els.audio.currentTime || 0); localStorage.setItem('pr_positions', JSON.stringify(state.positions)); }
  }
  function onAudioEnded() { if (state.currentAudioId) { state.positions[state.currentAudioId] = 0; localStorage.setItem('pr_positions', JSON.stringify(state.positions)); markCompleted(state.currentAudioId); } }
  function syncPlayButton() { if (!els.playPause) return; const paused = els.audio.paused; els.playPause.textContent = paused ? '▶' : 'Ⅱ'; els.playPause.setAttribute('aria-label', paused ? 'Reproduzir' : 'Pausar'); }

  function openFromHash() {
    if (!location.hash.startsWith('#pilula=')) return;
    const slug = decodeURIComponent(location.hash.slice('#pilula='.length));
    const item = state.items.find((candidate) => candidate.slug === slug); if (item) openItem(item.id);
  }
  function findItem(id) { return state.items.find((item) => item.id === id); }
  function trackName(id) { return state.tracks.find((track) => track.id === id)?.name || id || ''; }
  function formatTime(value) { if (!Number.isFinite(value)) return '0:00'; const total = Math.max(0, Math.floor(value)); return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`; }
  function readJSON(key, fallback) { try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch { return fallback; } }
  function showToast(message) { if (!els.toast) return; els.toast.textContent = message; els.toast.classList.add('is-visible'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => els.toast.classList.remove('is-visible'), 2200); }
  function prefersReducedMotion() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function escapeHTML(value = '') { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
  function escapeAttr(value = '') { return escapeHTML(value); }
})();
