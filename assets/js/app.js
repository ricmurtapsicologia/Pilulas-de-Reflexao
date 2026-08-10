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
    needs: $('#need-grid'),
    tracks: $('#track-grid'),
    filters: $('#filters'),
    catalog: $('#catalog'),
    search: $('#search'),
    resultCount: $('#result-count'),
    recommendation: $('#recommendation-card'),
    progressPanel: $('#progress-panel'),
    progressLabel: $('#progress-label'),
    progressBar: $('#progress-bar'),
    dialog: $('#pill-dialog'),
    dialogContent: $('#dialog-content'),
    player: $('#player'),
    audio: $('#global-audio'),
    playerTitle: $('#player-title'),
    playerSubtitle: $('#player-subtitle'),
    playPause: $('#play-pause'),
    back10: $('#back-10'),
    forward10: $('#forward-10'),
    seek: $('#seek'),
    currentTime: $('#current-time'),
    duration: $('#duration'),
    speed: $('#speed'),
    toast: $('#toast')
  };

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    try {
      const response = await fetch('./data/pilulas.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Falha ao carregar catálogo: ${response.status}`);
      state.data = await response.json();
      state.items = state.data.items || [];
      state.tracks = state.data.tracks || [];
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
      if (els.catalog) {
        els.catalog.innerHTML = '<div class="empty-state">Não foi possível carregar a biblioteca agora. Tente atualizar a página.</div>';
      }
    }
  }

  function bindEvents() {
    els.search?.addEventListener('input', (event) => {
      state.query = event.target.value.trim().toLocaleLowerCase('pt-BR');
      renderCatalog();
    });

    $('#dialog-close')?.addEventListener('click', closeDialog);
    els.dialog?.addEventListener('click', (event) => {
      if (event.target === els.dialog) closeDialog();
    });
    els.dialog?.addEventListener('close', () => {
      if (location.hash.startsWith('#pilula=')) history.replaceState(null, '', location.pathname + location.search);
    });

    window.addEventListener('hashchange', openFromHash);

    els.playPause?.addEventListener('click', toggleAudio);
    els.back10?.addEventListener('click', () => jumpAudio(-10));
    els.forward10?.addEventListener('click', () => jumpAudio(10));
    els.seek?.addEventListener('input', () => {
      if (!Number.isFinite(els.audio.duration)) return;
      els.audio.currentTime = Number(els.seek.value);
    });
    els.speed?.addEventListener('change', () => {
      els.audio.playbackRate = Number(els.speed.value || 1);
    });

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
      button.className = 'chip';
      button.type = 'button';
      button.textContent = need.label;
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        $$('.chip', els.needs).forEach((item) => item.setAttribute('aria-pressed', 'false'));
        button.setAttribute('aria-pressed', 'true');
        renderNeedRecommendation(need);
        $('#recomendacao')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      });
      els.needs.appendChild(button);
    });
  }

  function renderNeedRecommendation(need) {
    const candidates = need.items.map(findItem).filter(Boolean);
    const firstIncomplete = candidates.find((item) => !state.completed.has(item.id)) || candidates[0];
    if (!firstIncomplete) return;
    renderRecommendation(firstIncomplete, `Para “${need.label}”`);
  }

  function renderDailyRecommendation() {
    if (!state.items.length) return;
    const dayIndex = Math.floor(Date.now() / 86400000) % state.items.length;
    const ordered = [...state.items.slice(dayIndex), ...state.items.slice(0, dayIndex)];
    const item = ordered.find((candidate) => !state.completed.has(candidate.id)) || ordered[0];
    renderRecommendation(item, 'Para hoje');
  }

  function renderRecommendation(item, eyebrow) {
    if (!els.recommendation) return;
    els.recommendation.innerHTML = `
      <div>
        <div class="section-kicker">${escapeHTML(eyebrow)}</div>
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.description)}</p>
      </div>
      <button class="secondary-button" type="button" data-open="${escapeAttr(item.id)}">Abrir pílula</button>`;
    $('[data-open]', els.recommendation)?.addEventListener('click', () => openItem(item.id));
  }

  function renderTracks() {
    if (!els.tracks) return;
    els.tracks.innerHTML = '';
    state.tracks.forEach((track) => {
      const count = state.items.filter((item) => item.track === track.id).length;
      const done = state.items.filter((item) => item.track === track.id && state.completed.has(item.id)).length;
      const article = document.createElement('article');
      article.className = 'track-card';
      article.innerHTML = `
        <div>
          <div class="track-meta">${done}/${count} experiências concluídas</div>
          <h3>${escapeHTML(track.name)}</h3>
          <p>${escapeHTML(track.description)}</p>
        </div>
        <button type="button" class="ghost-button" data-track="${escapeAttr(track.id)}">Explorar trilha →</button>`;
      $('[data-track]', article).addEventListener('click', () => {
        setTrack(track.id);
        $('#biblioteca')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      });
      els.tracks.appendChild(article);
    });
  }

  function renderFilters() {
    if (!els.filters) return;
    const options = [{ id: 'all', name: 'Todas' }, ...state.tracks];
    els.filters.innerHTML = '';
    options.forEach((track) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter-button';
      button.textContent = track.name;
      button.dataset.track = track.id;
      button.setAttribute('aria-pressed', String(track.id === state.activeTrack));
      button.addEventListener('click', () => setTrack(track.id));
      els.filters.appendChild(button);
    });
  }

  function setTrack(trackId) {
    state.activeTrack = trackId;
    $$('.filter-button', els.filters).forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.track === trackId));
    });
    renderCatalog();
  }

  function getFilteredItems() {
    return state.items.filter((item) => {
      const matchTrack = state.activeTrack === 'all' || item.track === state.activeTrack;
      const haystack = [item.title, item.shortTitle, item.description, item.skill, trackName(item.track)]
        .filter(Boolean).join(' ').toLocaleLowerCase('pt-BR');
      const matchQuery = !state.query || haystack.includes(state.query);
      return matchTrack && matchQuery;
    });
  }

  function renderCatalog() {
    if (!els.catalog) return;
    const items = getFilteredItems();
    els.catalog.innerHTML = '';
    if (els.resultCount) els.resultCount.textContent = `${items.length} ${items.length === 1 ? 'pílula' : 'pílulas'}`;

    if (!items.length) {
      els.catalog.innerHTML = '<div class="empty-state">Nenhuma pílula corresponde a esse filtro. Tente outro termo ou explore todas as trilhas.</div>';
      return;
    }

    items.forEach((item) => {
      const completed = state.completed.has(item.id);
      const article = document.createElement('article');
      article.className = 'pill-card';
      article.innerHTML = `
        <div class="pill-top">
          <span class="pill-tag">${escapeHTML(trackName(item.track))}</span>
          <span class="pill-status">${completed ? '<span class="completed-dot"></span>concluída' : formatLabel(item.format)}</span>
        </div>
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.description)}</p>
        <div class="pill-meta">
          <span>${escapeHTML(item.duration)}</span>
          <span>·</span>
          <span>${escapeHTML(item.skill)}</span>
        </div>
        <div class="card-actions">
          <button class="card-action" type="button" data-open="${escapeAttr(item.id)}">${item.audioUrl ? 'Ouvir / ler' : 'Abrir'}</button>
        </div>`;
      $('[data-open]', article).addEventListener('click', () => openItem(item.id));
      els.catalog.appendChild(article);
    });
  }

  function openItem(id) {
    const item = findItem(id);
    if (!item || !els.dialog) return;
    state.activeItem = item;
    const reading = (item.reading || []).map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join('');
    const audioButton = item.audioUrl ? `<button class="primary-button" type="button" id="dialog-play">▶ Ouvir áudio</button>` : '';
    const transcriptNote = item.audioUrl && item.transcriptStatus === 'review'
      ? '<p class="transcript-note">A transcrição integral deste áudio está em revisão editorial. O resumo para leitura abaixo não é uma transcrição literal.</p>'
      : '';
    const visual = item.visual ? renderVisual(item.visual) : '';
    const completed = state.completed.has(item.id);

    els.dialogContent.innerHTML = `
      <div class="section-kicker">${escapeHTML(trackName(item.track))}</div>
      <h2 class="dialog-title">${escapeHTML(item.title)}</h2>
      <div class="dialog-meta">${escapeHTML(item.duration)} · ${escapeHTML(item.skill)} · ${escapeHTML(formatLabel(item.format))}</div>
      <p>${escapeHTML(item.description)}</p>
      ${audioButton}
      ${visual}
      <section class="reading" aria-labelledby="read-${escapeAttr(item.id)}">
        <h3 id="read-${escapeAttr(item.id)}">Para ler</h3>
        ${transcriptNote}
        ${reading}
      </section>
      <aside class="reflection-box">
        <h3>Para refletir</h3>
        <p>${escapeHTML(item.reflection || '')}</p>
      </aside>
      <button class="complete-button ${completed ? 'is-complete' : ''}" id="complete-item" type="button">${completed ? '✓ Concluída' : 'Marcar como concluída'}</button>`;

    $('#dialog-play', els.dialogContent)?.addEventListener('click', () => playItem(item.id));
    $('#complete-item', els.dialogContent)?.addEventListener('click', () => toggleCompleted(item.id));

    if (!els.dialog.open) els.dialog.showModal();
    history.replaceState(null, '', `${location.pathname}${location.search}#pilula=${encodeURIComponent(item.slug)}`);
  }

  function renderVisual(visual) {
    const steps = (visual.steps || []).map((step) => `<div class="visual-step">${escapeHTML(step)}</div>`).join('');
    return `<section class="visual-block" aria-label="Microvisual: ${escapeAttr(visual.title)}"><h3>${escapeHTML(visual.title)}</h3><div class="visual-flow">${steps}</div></section>`;
  }

  function closeDialog() {
    els.dialog?.close();
  }

  function toggleCompleted(id) {
    if (state.completed.has(id)) state.completed.delete(id);
    else state.completed.add(id);
    persistCompleted();
    renderCatalog();
    renderTracks();
    updateProgress();
    if (state.activeItem?.id === id) openItem(id);
  }

  function markCompleted(id) {
    if (state.completed.has(id)) return;
    state.completed.add(id);
    persistCompleted();
    renderCatalog();
    renderTracks();
    updateProgress();
    showToast('Pílula concluída.');
  }

  function persistCompleted() {
    localStorage.setItem('pr_completed', JSON.stringify([...state.completed]));
  }

  function updateProgress() {
    if (!els.progressPanel || !state.items.length) return;
    const done = state.items.filter((item) => state.completed.has(item.id)).length;
    const total = state.items.length;
    els.progressPanel.classList.toggle('is-visible', done > 0);
    if (els.progressLabel) els.progressLabel.textContent = `${done} de ${total} experiências concluídas`;
    if (els.progressBar) {
      const percentage = Math.round((done / total) * 100);
      els.progressBar.style.width = `${percentage}%`;
      els.progressBar.parentElement?.setAttribute('aria-valuenow', String(percentage));
    }
  }

  function playItem(id) {
    const item = findItem(id);
    if (!item?.audioUrl || !els.audio) return;
    const changed = state.currentAudioId !== item.id;
    state.currentAudioId = item.id;
    els.playerTitle.textContent = item.title;
    els.playerSubtitle.textContent = trackName(item.track);
    els.player.classList.add('is-visible');

    if (changed) {
      els.audio.src = item.audioUrl;
      els.audio.load();
      els.audio.addEventListener('loadedmetadata', () => {
        const saved = Number(state.positions[item.id] || 0);
        if (saved > 0 && saved < els.audio.duration - 5) els.audio.currentTime = saved;
        els.audio.play().catch(() => showToast('Toque em reproduzir para iniciar o áudio.'));
      }, { once: true });
    } else {
      els.audio.play().catch(() => {});
    }
    closeDialog();
  }

  function toggleAudio() {
    if (!els.audio.src) return;
    if (els.audio.paused) els.audio.play().catch(() => {});
    else els.audio.pause();
  }

  function jumpAudio(seconds) {
    if (!Number.isFinite(els.audio.duration)) return;
    els.audio.currentTime = clamp(els.audio.currentTime + seconds, 0, els.audio.duration);
  }

  function onMetadata() {
    els.seek.max = String(Math.floor(els.audio.duration || 0));
    els.duration.textContent = formatTime(els.audio.duration);
  }

  function onTimeUpdate() {
    els.seek.value = String(Math.floor(els.audio.currentTime || 0));
    els.currentTime.textContent = formatTime(els.audio.currentTime);
    state.saveTick += 1;
    if (state.currentAudioId && state.saveTick % 5 === 0) {
      state.positions[state.currentAudioId] = Math.floor(els.audio.currentTime || 0);
      localStorage.setItem('pr_positions', JSON.stringify(state.positions));
    }
  }

  function onAudioEnded() {
    if (!state.currentAudioId) return;
    const id = state.currentAudioId;
    state.positions[id] = 0;
    localStorage.setItem('pr_positions', JSON.stringify(state.positions));
    markCompleted(id);
    syncPlayButton();
  }

  function syncPlayButton() {
    if (!els.playPause) return;
    const paused = els.audio.paused;
    els.playPause.textContent = paused ? '▶' : 'Ⅱ';
    els.playPause.setAttribute('aria-label', paused ? 'Reproduzir' : 'Pausar');
  }

  function openFromHash() {
    if (!state.items.length || !location.hash.startsWith('#pilula=')) return;
    const slug = decodeURIComponent(location.hash.replace('#pilula=', ''));
    const item = state.items.find((candidate) => candidate.slug === slug);
    if (item) openItem(item.id);
  }

  function findItem(id) {
    return state.items.find((item) => item.id === id);
  }

  function trackName(id) {
    return state.tracks.find((track) => track.id === id)?.name || id;
  }

  function formatLabel(value = '') {
    const labels = {
      audio: 'Áudio + leitura',
      texto: 'Texto',
      'texto+microvisual': 'Texto + microvisual'
    };
    return labels[value] || value.replaceAll('+', ' + ');
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '0:00';
    const total = Math.max(0, Math.floor(seconds));
    const min = Math.floor(total / 60);
    const sec = String(total % 60).padStart(2, '0');
    return `${min}:${sec}`;
  }

  function showToast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.add('is-visible');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => els.toast.classList.remove('is-visible'), 2200);
  }

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function escapeHTML(value = '') {
    return String(value).replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
  }

  function escapeAttr(value = '') {
    return escapeHTML(value);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function prefersReducedMotion() {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }
})();
