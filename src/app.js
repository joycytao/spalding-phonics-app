import { playAudio } from './audio.js';
import { groups, phonograms } from './phonograms.js';
import { createProgressStore } from './progress-store.js';
import { advance, createSession, getPracticeNavigationAction, recordExamDecision } from './session.js';
import { isExamCheckDisabled, isPracticeNextDisabled } from './audio-controls.js';
import { schedulePracticePlayback, shouldShowPracticePlaybackControl } from './practice-playback.js';

const app = document.querySelector('#app');
const store = createProgressStore(window.localStorage);
let state = { screen: 'home', mode: null, group: null, selectedIds: [], session: null, heard: false, audioState: 'idle', checked: false, error: '' };
let cancelAutoPlay = () => {};

const icon = { listen: '♪', replay: '↻', home: '⌂', next: '→', check: '✓' };
const esc = (text) => String(text).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);

function groupItems(groupId) {
  return groupId === 'all' ? phonograms : phonograms.filter((item) => item.group === groupId);
}

function renderShell(content, kicker = 'SOUND STEPS') {
  app.innerHTML = `<section class="shell"><header><span class="eyebrow">${kicker}</span><h1>Phonograms</h1><p>Hear it. Write it. Remember it.</p></header>${content}</section>`;
}

function renderHome() {
  renderShell(`<div class="home-grid">
    <button class="mode-card practice" data-action="choose-mode" data-mode="practice"><span>01</span><strong>Start Practice</strong><small>See the phonogram and hear its sound.</small></button>
    <button class="mode-card exam" data-action="choose-mode" data-mode="exam"><span>02</span><strong>Start Exam</strong><small>Listen first, then reveal and self-check.</small></button>
    <button class="mode-card review" data-action="start-review"><span>03</span><strong>Review</strong><small>Practice the sounds that need another turn.</small></button>
  </div><p class="footer-note">Built for grown-ups learning alongside kids.</p>`);
}

function renderGroups() {
  renderShell(`<div class="step"><button class="text-button" data-action="home">← Home</button><p class="step-label">${state.mode === 'exam' ? 'EXAM' : 'PRACTICE'} · STEP 1 OF 2</p><h2>Choose a set</h2><div class="group-list">${groups.map((group) => `<button class="group-card" data-action="choose-group" data-group="${group.id}"><strong>${group.label}</strong><span>${group.detail}</span><b>→</b></button>`).join('')}</div></div>`);
}

function renderPicker() {
  const items = groupItems(state.group);
  const checked = new Set(state.selectedIds);
  renderShell(`<div class="step"><button class="text-button" data-action="groups">← Back</button><p class="step-label">STEP 2 OF 2</p><h2>Choose phonograms</h2><div class="picker-toolbar"><button class="pill" data-action="select-all">${checked.size === items.length ? 'Clear all' : 'Select all'}</button><span>${checked.size} selected</span></div><div class="phonogram-picker">${items.map((item) => `<label class="choice"><input type="checkbox" data-id="${item.id}" ${checked.has(item.id) ? 'checked' : ''}/><span>${item.id}</span><strong>${esc(item.symbol)}</strong></label>`).join('')}</div><button class="primary-button" data-action="start-session" ${checked.size ? '' : 'disabled'}>Start ${state.mode === 'exam' ? 'exam' : 'practice'} <span>→</span></button></div>`);
}

function renderCard() {
  const item = state.session.items[state.session.index];
  const isExam = state.session.mode === 'exam' || state.session.mode === 'review-exam';
  const shown = !isExam || state.checked;
  const final = state.session.index === state.session.items.length - 1;
  const practiceNavigation = getPracticeNavigationAction(state.session);
  const isPractice = state.session.mode === 'practice';
  const showPlaybackControl = !isPractice || shouldShowPracticePlaybackControl(state.audioState);
  const action = state.heard ? 'replay' : 'listen';
  const label = state.heard ? 'Play again' : 'Listen to sounds';
  const nextDisabled = isPracticeNextDisabled(state.audioState);
  const checkDisabled = state.checked || isExamCheckDisabled(state.audioState);
  renderShell(`<div class="session"><div class="progress"><span>${state.session.index + 1} / ${state.session.items.length}</span><i style="width:${((state.session.index + 1) / state.session.items.length) * 100}%"></i></div><section class="sound-card ${shown ? 'shown' : 'hidden-answer'}"><span class="card-number">PHONOGRAM ${item.id}</span><div class="symbol">${shown ? esc(item.symbol) : '<span class="question-mark">?</span>'}</div>${showPlaybackControl ? `<button class="listen-button" data-action="${action}" aria-label="${label}"><span>${icon[state.heard ? 'replay' : 'listen']}</span>${label}</button>` : ''}${state.error ? `<p class="audio-error">${esc(state.error)}</p>` : ''}</section><nav class="session-nav"><button class="round-button" data-action="home" aria-label="Home">${icon.home}<small>Home</small></button>${isExam ? `<button class="round-button ${checkDisabled ? 'is-disabled' : ''}" data-action="check" ${checkDisabled ? 'disabled' : ''} aria-label="Check answer">${icon.check}<small>Check</small></button>` : '<span class="nav-spacer"></span>'}${state.checked || !isExam ? (final && practiceNavigation === 'finish' ? `<button class="round-button next" data-action="finish" ${nextDisabled ? 'disabled' : ''} aria-label="Finish practice">${icon.next}<small>Finish</small></button>` : `<button class="round-button next" data-action="next" ${nextDisabled ? 'disabled' : ''} aria-label="Next phonogram">${icon.next}<small>Next</small></button>`) : '<span class="nav-spacer"></span>'}</nav></div>`);
}

function renderResult() {
  const { correct, total } = state.session.score;
  renderShell(`<div class="result"><p class="step-label">EXAM COMPLETE</p><h2>${correct} / ${total}</h2><p>You finished the set. Choose what comes next.</p><div class="result-actions"><button class="primary-button" data-action="start-review">Review missed sounds <span>→</span></button><button class="secondary-button" data-action="home">Home</button></div></div>`);
}

function renderReviewEmpty() {
  renderShell(`<div class="result empty"><p class="step-label">REVIEW</p><h2>All clear.</h2><p>There are no phonograms waiting for another try on this browser.</p><div class="result-actions"><button class="primary-button" data-action="home">Home</button><button class="secondary-button" data-action="choose-mode" data-mode="practice">Start practice</button></div></div>`);
}

function renderDecision() {
  const item = state.session.items[state.session.index];
  const dialog = document.createElement('dialog');
  dialog.className = 'decision-dialog';
  dialog.innerHTML = `<form method="dialog"><p class="step-label">SELF CHECK</p><h2>Did you write <strong>${esc(item.symbol)}</strong>?</h2><p>Choose honestly. Missed sounds will come back in Review.</p><div><button value="incorrect" class="secondary-button">Not yet</button><button value="correct" class="primary-button">Correct</button></div></form>`;
  document.body.append(dialog);
  dialog.addEventListener('close', () => { if (dialog.returnValue) decide(dialog.returnValue === 'correct'); dialog.remove(); });
  dialog.showModal();
}

function render() {
  if (state.screen === 'home') return renderHome();
  if (state.screen === 'groups') return renderGroups();
  if (state.screen === 'picker') return renderPicker();
  if (state.screen === 'session') return renderCard();
  if (state.screen === 'result') return renderResult();
  return renderReviewEmpty();
}

async function listen() {
  if (state.audioState === 'playing') return;
  const item = state.session.items[state.session.index];
  state = { ...state, audioState: 'playing', error: '' };
  render();
  try { await playAudio(item); state = { ...state, heard: true, audioState: 'complete', error: '' }; } catch { state = { ...state, heard: true, audioState: 'failed', error: 'Audio is not ready yet. Generate the Voicebox files, then try again.' }; }
  render();
}

function decide(correct) {
  const item = state.session.items[state.session.index];
  state = { ...state, session: recordExamDecision(state.session, correct), checked: true };
  if (correct && state.session.mode === 'review-exam') store.removeReviewedCorrect(item.id);
  if (!correct) store.recordIncorrect(item.id);
  render();
}

function startSession(ids, mode) {
  state = { screen: 'session', mode, group: null, selectedIds: ids, session: createSession(ids, phonograms, mode), heard: false, audioState: 'idle', checked: false, error: '' };
  render();
  schedulePracticeAutoPlay();
}

function schedulePracticeAutoPlay() {
  cancelAutoPlay();
  if (state.session?.mode !== 'practice') return;
  cancelAutoPlay = schedulePracticePlayback(() => {
    cancelAutoPlay = () => {};
    if (state.screen === 'session' && state.session?.mode === 'practice' && state.audioState === 'idle') listen();
  });
}

function leaveSession() {
  cancelAutoPlay();
  cancelAutoPlay = () => {};
  stopAudio();
}

app.addEventListener('change', (event) => {
  if (!event.target.matches('input[type="checkbox"]')) return;
  const id = Number(event.target.dataset.id);
  state.selectedIds = event.target.checked ? [...state.selectedIds, id] : state.selectedIds.filter((selectedId) => selectedId !== id);
  render();
});

app.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const { action } = button.dataset;
  if (action === 'home') { leaveSession(); state = { ...state, screen: 'home' }; render(); }
  if (action === 'choose-mode') { state = { ...state, mode: button.dataset.mode, screen: 'groups' }; render(); }
  if (action === 'choose-group') { state = { ...state, group: button.dataset.group, selectedIds: groupItems(button.dataset.group).map((item) => item.id), screen: 'picker' }; render(); }
  if (action === 'groups') { state = { ...state, screen: 'groups' }; render(); }
  if (action === 'select-all') { const ids = groupItems(state.group).map((item) => item.id); state.selectedIds = state.selectedIds.length === ids.length ? [] : ids; render(); }
  if (action === 'start-session') startSession(state.selectedIds, state.mode);
  if (action === 'listen' || action === 'replay') listen();
  if (action === 'check') renderDecision();
  if (action === 'finish') { leaveSession(); state = { ...state, screen: 'home', session: null }; render(); }
  if (action === 'next') { cancelAutoPlay(); stopAudio(); const next = advance(state.session); if (next.isComplete) { if (next.mode === 'review-practice') { startSession(next.items.map((item) => item.id), 'review-exam'); return; } state = { ...state, session: next, screen: next.mode === 'practice' ? 'home' : 'result' }; } else { state = { ...state, session: next, heard: false, audioState: 'idle', checked: false, error: '' }; } render(); schedulePracticeAutoPlay(); }
  if (action === 'start-review') { const ids = store.getReviewQueue(); if (!ids.length) { state = { ...state, screen: 'review-empty' }; render(); } else startSession(ids, 'review-practice'); }
});

render();
