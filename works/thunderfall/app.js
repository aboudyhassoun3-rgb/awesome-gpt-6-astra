import { Game, clamp } from './engine.js';
import { WIDTH, HEIGHT, SHIPS, WEAPONS, STAGES, STAGE_SECONDS, DROP_TTL } from './data.js';
import { drawFrame } from './render.js';
import { Sound } from './audio.js';
import { getLang, setLang, onLangChange, t, locShip, locWeapon, locStage, locUpgrade, applyDocumentLang } from './i18n.js';

const $ = id => document.getElementById(id);
const storage = { get(key, fallback) { try { return JSON.parse(localStorage.getItem(`thunderfall:${key}`)) ?? fallback; } catch { return fallback; } }, set(key, value) { try { localStorage.setItem(`thunderfall:${key}`, JSON.stringify(value)); } catch { /* Play remains available with storage blocked. */ } } };
const game = new Game();
const sound = new Sound(storage.get('sound', true) === true);
const canvas = $('game-canvas'), ctx = canvas.getContext('2d', { alpha: false });
const keys = new Set();
const input = { dx: 0, dy: 0, pointer: false, targetX: 240, targetY: 665, slow: false };
const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = storage.get('reducedMotion', reducedQuery.matches), selectedShip = 0, focusMode = false, pointer = null;
let best = Number(storage.get('best', 0)) || 0, lastMode = '', lastStage = -1, lastWeapon = '', lastVitals = '', lastHud = 0;
let announcementUntil = 0, toastUntil = 0, idleTime = 0, last = performance.now(), accumulator = 0;
let pauseReason = t('pause.default');
const formatScore = n => Math.max(0, Math.floor(n)).toLocaleString('en-US').padStart(7, '0');
const formatTime = t => `${Math.floor(t / 60).toString().padStart(2, '0')}:${Math.floor(t % 60).toString().padStart(2, '0')}`;
const arrow = '<svg aria-hidden="true"><use href="#i-arrow"/></svg>';

function renderRoute() {
  $('mission-route').innerHTML = STAGES.map((s, i) => {
    const loc = locStage(i);
    return `<li class="${i === 0 ? 'active' : ''}"><span class="route-number">0${i + 1}</span><div><strong>${loc.name}</strong><small>${s.enName}</small></div><span class="route-time">02:00</span></li>`;
  }).join('');
}
function renderShipPicker() {
  $('ship-picker').innerHTML = SHIPS.map(s => {
    const loc = locShip(s.id);
    return `<button class="ship-choice" data-ship="${s.id}" aria-pressed="${s.id === selectedShip}" style="--ship-color:${s.color}"><small>${s.code}</small><strong>${loc.name}</strong><span>${loc.role}</span></button>`;
  }).join('');
}
function applyStaticI18n() {
  applyDocumentLang();
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const value = t(key);
    if (/<br>/.test(value) || /<\/?[a-z][^>]*>/i.test(value)) el.innerHTML = value;
    else el.textContent = value;
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria'))));
  document.querySelectorAll('[data-i18n-loot]').forEach(el => { el.textContent = locWeapon(el.getAttribute('data-i18n-loot')).short; });
  const meta = $('meta-description');
  if (meta) meta.setAttribute('content', t('meta.description'));
  document.title = getLang() === 'zh' ? '雷霆战机 · 天穹远征 — THUNDERFALL' : getLang() === 'en' ? 'Thunderfall · Sky Expedition — THUNDERFALL' : 'صواعق الرعد · حملة القبة السماوية — THUNDERFALL';
  document.querySelectorAll('.lang-switch [data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === getLang())));
  renderRoute();
  renderShipPicker();
  // Re-apply active/complete route state after rebuild.
  for (const [i, row] of [...$('mission-route').children].entries()) { row.classList.toggle('active', i === game.stageIndex); row.classList.toggle('complete', i < game.stageIndex && !game.practice); }
  canvas.setAttribute('aria-label', t('canvas.aria'));
  refreshShipPanel();
  updateSound();
  updateReduced();
  lastMode = ''; lastWeapon = ''; lastStage = -1;
  syncMode();
  updateHud(true);
}
function refreshShipPanel() {
  const ship = SHIPS[selectedShip], loc = locShip(selectedShip);
  for (const button of $('ship-picker').children) button.setAttribute('aria-pressed', Number(button.dataset.ship) === selectedShip);
  $('ship-code').textContent = `${ship.code} / ${['FALCON', 'PRISM', 'BASTION'][selectedShip]}`;
  $('ship-description').textContent = loc.description;
  $('ship-stats').innerHTML = `<span>${t('ship.stats.hull')} <b>${ship.health}</b></span><span>${t('ship.stats.shield')} <b>${ship.shield}</b></span><span>${t('ship.stats.speed')} <b>${ship.speed}</b></span><span>${t('ship.stats.bombs')} <b>${ship.bombStock}</b></span>`;
}
$('best-score').textContent = formatScore(best);
function chooseShip(id) {
  if (game.mode !== 'hangar') return;
  selectedShip = id; game.player.shipId = id;
  refreshShipPanel();
  game.player.weapon = id === 1 ? 'laser' : 'pulse'; game.player.weaponLevel = 1; lastWeapon = ''; updateHud(true);
}
$('ship-picker').addEventListener('click', e => { const button = e.target.closest('[data-ship]'); if (button) chooseShip(Number(button.dataset.ship)); });
document.querySelectorAll('.lang-switch [data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
onLangChange(() => { pauseReason = t('pause.default'); applyStaticI18n(); });
function resetInput() { keys.clear(); input.pointer = false; input.dx = 0; input.dy = 0; pointer = null; }
function focusCanvas() { canvas.focus({ preventScroll: true }); }
function start() {
  const value = $('run-mode').value;
  resetInput(); focusMode = false; input.slow = false; $('focus-button').setAttribute('aria-pressed', 'false');
  game.start({ shipId: selectedShip, difficulty: $('difficulty').value, practiceStage: value === 'campaign' ? null : Number(value) });
  accumulator = 0; last = performance.now(); lastMode = ''; lastStage = -1;
  sound.unlock(); syncMode(); updateHud(true); focusCanvas(); window.scrollTo(0, 0);
}
$('start-button').addEventListener('click', start);
function pause(reason) { if (game.mode !== 'playing') return; pauseReason = reason || t('pause.default'); resetInput(); game.pause(); syncMode(); }
function resume() { resetInput(); game.resume(); accumulator = 0; last = performance.now(); syncMode(); focusCanvas(); sound.unlock(); }
$('pause-button').addEventListener('click', () => pause());
$('bomb-button').addEventListener('click', () => { game.bomb(); updateHud(true); });
$('overdrive-button').addEventListener('click', () => { if (!game.overdrive() && game.mode === 'playing') toast(t('toast.charge')); updateHud(true); });
$('focus-button').addEventListener('click', () => { focusMode = !focusMode; $('focus-button').setAttribute('aria-pressed', focusMode); });
function toHangar() {
  resetInput(); game.reset(); game.drainEvents(); lastMode = ''; lastStage = -1; lastWeapon = ''; announcementUntil = 0;
  $('stage-announcement').hidden = true; $('toast').hidden = true; chooseShip(selectedShip); syncMode(); updateHud(true); $('start-button').focus({ preventScroll: true });
}
function button(label, className, action) { const element = document.createElement('button'); element.className = className; element.innerHTML = label; element.addEventListener('click', action); return element; }
function syncMode() {
  if (lastMode === game.mode) return;
  lastMode = game.mode;
  document.body.classList.toggle('in-flight', game.mode !== 'hangar');
  $('hangar').hidden = game.mode !== 'hangar'; $('hud').hidden = game.mode === 'hangar';
  const show = ['paused', 'upgrade', 'gameover', 'victory'].includes(game.mode);
  $('overlay').hidden = !show;
  if (!show) return;
  resetInput(); $('stage-announcement').hidden = true;
  $('overlay-content').replaceChildren(); $('overlay-actions').replaceChildren();
  const title = $('overlay-title'), kicker = $('overlay-kicker'), desc = $('overlay-description'), actions = $('overlay-actions');
  if (game.mode === 'paused') {
    kicker.textContent = t('overlay.paused.kicker'); title.textContent = t('overlay.paused.title'); desc.textContent = pauseReason;
    actions.append(button(`${t('overlay.resume')} ${arrow}`, 'primary-button', resume), button(t('overlay.quit'), 'secondary-button', toHangar));
  } else if (game.mode === 'upgrade') {
    kicker.textContent = `SECTOR 0${game.stageIndex + 1} / CLEAR`; title.textContent = t('overlay.upgrade.title');
    desc.textContent = t('overlay.upgrade.desc');
    const choices = document.createElement('div'); choices.className = 'upgrade-choices';
    for (const [i, choice] of game.choices.entries()) {
      const loc = locUpgrade(choice.id);
      choices.append(button(`<span>0${i + 1}</span><span><strong>${loc.name}<small>${loc.description}</small></strong></span><span>↗</span>`, 'upgrade-choice', () => { game.selectUpgrade(choice.id); lastStage = -1; syncMode(); updateHud(true); focusCanvas(); }));
    }
    $('overlay-content').append(choices);
  } else {
    const won = game.mode === 'victory';
    kicker.textContent = game.practice ? t('overlay.training') : won ? t('overlay.won') : t('overlay.lost');
    title.textContent = won ? game.practice ? t('overlay.practice.done') : t('overlay.victory') : t('overlay.retry');
    if (won) {
      desc.textContent = game.practice ? t('overlay.practice.desc') : t('overlay.victory.desc', { continues: game.continues ? t('overlay.victory.used', { n: game.continues }) : t('overlay.victory.clean') });
    } else {
      const extra = game.continues < 3 ? t('overlay.defeat.can') : t('overlay.defeat.out');
      desc.textContent = t('overlay.defeat.desc', { i: game.stageIndex + 1, name: locStage(game.stageIndex).name, extra });
    }
    $('overlay-content').innerHTML = `<div class="result-grid"><div><small>${t('overlay.score')}</small><strong>${formatScore(game.score)}</strong></div><div><small>${t('overlay.time')}</small><strong>${formatTime(game.time)}</strong></div><div><small>${t('overlay.kills')}</small><strong>${game.kills}</strong></div><div><small>${t('overlay.grazes')}</small><strong>${game.grazes}</strong></div></div>`;
    if (!game.practice && game.score > best) { best = game.score; storage.set('best', best); $('best-score').textContent = formatScore(best); }
    if (!won && game.continues < 3) actions.append(button(`${t('overlay.continue')} <small>${t('overlay.chances', { n: 3 - game.continues })}</small>${arrow}`, 'primary-button', () => { game.continueRun(); lastStage = -1; syncMode(); updateHud(true); focusCanvas(); }));
    actions.append(button(`${t('overlay.back')} ${arrow}`, won || game.continues >= 3 ? 'primary-button' : 'secondary-button', toHangar));
  }
  const first = $('overlay').querySelector('button'); first?.focus({ preventScroll: true });
}
function updateHud(force = false) {
  const p = game.player, playing = game.mode === 'playing';
  $('score').textContent = formatScore(game.score); $('elapsed').textContent = formatTime(game.time);
  $('hud-stage').textContent = `${game.practice ? t('hud.practice') : '0' + (game.stageIndex + 1) + ' / 05'}`;
  $('multiplier').textContent = `×${Math.min(5, 1 + Math.floor(game.combo / 8))}`;
  const vitals = `${p.health}/${p.maxHealth}/${p.shield}/${p.maxShield}`;
  if (force || lastVitals !== vitals) {
    lastVitals = vitals;
    $('hull').innerHTML = Array.from({ length: p.maxHealth }, (_, i) => `<i class="${i >= p.health ? 'empty' : ''}"></i>`).join('');
    $('shield').innerHTML = Array.from({ length: p.maxShield }, (_, i) => `<i class="${i >= p.shield ? 'empty' : ''}"></i>`).join('');
    $('hull').setAttribute('aria-label', `${t('hud.hull')} ${p.health}/${p.maxHealth}`); $('shield').setAttribute('aria-label', `${t('hud.shield')} ${p.shield}/${p.maxShield}`);
  }
  const boss = game.enemies.find(e => e.type === 'boss' && !e.dead);
  $('boss-hud').hidden = !boss;
  if (boss) { $('boss-name').textContent = locStage(game.stageIndex).bossName; $('boss-phase').textContent = `PHASE ${boss.phase}/3`; $('boss-fill').style.width = `${Math.max(0, boss.hp / boss.maxHp) * 100}%`; }
  $('bomb-count').textContent = p.bombs; $('bomb-button').disabled = !playing || p.bombs <= 0;
  $('overdrive-button').disabled = !playing; $('overdrive-button').classList.toggle('ready', p.overdrive >= 100 || p.overdriveTime > 0);
  $('overdrive-button').setAttribute('aria-label', p.overdriveTime > 0 ? t('overdrive.active.aria', { n: Math.ceil(p.overdriveTime) }) : t('overdrive.ready.aria', { n: Math.floor(p.overdrive) }));
  $('charge-label').textContent = p.overdriveTime > 0 ? t('overdrive.active.label', { n: p.overdriveTime.toFixed(1) }) : t('overdrive.charge.label', { n: Math.floor(p.overdrive) });
  $('charge-fill').style.width = `${p.overdriveTime > 0 ? p.overdriveTime / 8 * 100 : p.overdrive}%`;
  $('focus-button').disabled = !playing; $('pause-button').disabled = !playing;
  $('stage-progress-fill').style.width = `${Math.min(1, game.stageTime / STAGE_SECONDS) * 100}%`;
  const weapon = locWeapon(p.weapon), key = `${p.weapon}:${p.weaponLevel}`;
  if (lastWeapon !== key || force) {
    lastWeapon = key; $('weapon-name').textContent = weapon.name; $('weapon-description').textContent = weapon.description;
    $('weapon-emblem').textContent = WEAPONS[p.weapon].label; $('weapon-emblem').style.color = WEAPONS[p.weapon].color; $('weapon-emblem').style.borderColor = WEAPONS[p.weapon].color;
    $('weapon-tier').textContent = `${weapon.colorName} / ${weapon.rarity}`;
    $('weapon-tier').style.color = WEAPONS[p.weapon].color;
    $('weapon-level').innerHTML = Array.from({ length: 5 }, (_, i) => `<i class="${i < p.weaponLevel ? 'active' : ''}" style="${i < p.weaponLevel ? `background:${WEAPONS[p.weapon].color}` : ''}"></i>`).join('');
    $('weapon-mini').textContent = `${WEAPONS[p.weapon].label} / ${weapon.name} LV.${p.weaponLevel}`; $('weapon-mini').style.color = WEAPONS[p.weapon].color;
  }
  if (lastStage !== game.stageIndex || force) {
    lastStage = game.stageIndex;
    for (const [i, row] of [...$('mission-route').children].entries()) { row.classList.toggle('active', i === game.stageIndex); row.classList.toggle('complete', i < game.stageIndex && !game.practice); }
  }
  $('flight-state').textContent = game.mode === 'hangar' ? t('flight.hangar') : `${game.practice ? t('flight.training') : t('flight.sector')} 0${game.stageIndex + 1}`;
  const salvageSeconds = Math.max(0, Math.ceil(Math.max(STAGE_SECONDS, (game.bossDefeatedAt ?? 0) + DROP_TTL) - game.stageTime));
  $('bottom-tip').textContent = game.mode === 'hangar' ? t('bottom.hangar') : game.bossDefeated ? `${t('bottom.reward')} / ${salvageSeconds}s` : game.bossSpawned ? t('bottom.boss') : t('bottom.normal');
}
function announce(kicker, title, detail, seconds = 2.7) {
  $('announcement-kicker').textContent = kicker; $('announcement-title').textContent = title; $('announcement-detail').textContent = detail;
  $('stage-announcement').hidden = false; announcementUntil = game.time + seconds;
}
function toast(text) { $('toast').textContent = text; $('toast').hidden = false; toastUntil = performance.now() + 2500; }
function processEvents() {
  for (const event of game.drainEvents()) {
    sound.event(event.type);
    if (event.type === 'stage') announce(`SECTOR 0${event.index + 1} / ${STAGES[event.index].enName}`, locStage(event.index).name, locStage(event.index).tip, 3.3);
    if (event.type === 'boss') announce(t('announce.warning'), locStage(game.stageIndex).bossName, t('announce.warning.sub'), 2.2);
    if (event.type === 'bossDefeated') announce(t('announce.cleared'), t('announce.cleared.title'), t('announce.cleared.sub'), 2);
    if (event.type === 'bossPhase') toast(t('announce.phase', { n: event.phase }));
    if (event.type === 'autobomb') toast(t('toast.autobomb'));
    if (event.type === 'overdrive') toast(t('toast.overdrive'));
    if (event.type === 'pickup') toast(event.label);
  }
}
canvas.addEventListener('pointerdown', e => {
  if (game.mode !== 'playing' || pointer !== null || (e.pointerType === 'mouse' && e.button !== 0)) return;
  e.preventDefault(); focusCanvas();
  pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, shipX: game.player.x, shipY: game.player.y };
  input.pointer = true; input.targetX = game.player.x; input.targetY = game.player.y;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => {
  if (!pointer || pointer.id !== e.pointerId || game.mode !== 'playing') return;
  e.preventDefault(); const rect = canvas.getBoundingClientRect();
  input.targetX = clamp(pointer.shipX + (e.clientX - pointer.x) / rect.width * WIDTH * 1.15, 18, WIDTH - 18);
  input.targetY = clamp(pointer.shipY + (e.clientY - pointer.y) / rect.height * HEIGHT * 1.15, 88, HEIGHT - 35);
});
function endPointer(e) { if (pointer?.id === e.pointerId) { pointer = null; input.pointer = false; } }
canvas.addEventListener('pointerup', endPointer); canvas.addEventListener('pointercancel', endPointer); canvas.addEventListener('lostpointercapture', endPointer);
window.addEventListener('keydown', e => {
  if ($('help-dialog').open || e.target.closest('select,input,textarea') || !['playing', 'paused'].includes(game.mode)) return;
  const key = e.key.toLowerCase();
  if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'w', 'a', 's', 'd', 'shift'].includes(key)) { e.preventDefault(); keys.add(key); }
  if (e.repeat) return;
  if (key === 'p' || key === 'escape') { e.preventDefault(); game.mode === 'playing' ? pause() : resume(); }
  if (key === ' ' && !e.target.closest('button')) { e.preventDefault(); game.bomb(); }
  if (key === 'e') { e.preventDefault(); game.overdrive(); }
});
window.addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
window.addEventListener('keydown', e => {
  if (e.key !== 'Tab' || $('overlay').hidden || $('help-dialog').open) return;
  const buttons = [...$('overlay').querySelectorAll('button:not(:disabled)')];
  const first = buttons[0], last = buttons.at(-1);
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) { pause(t('pause.away')); resetInput(); } });
window.addEventListener('blur', () => { pause(t('pause.blur')); resetInput(); });
$('sound-button').addEventListener('click', () => { sound.setEnabled(!sound.enabled); storage.set('sound', sound.enabled); sound.unlock(); updateSound(); });
function updateSound() { $('sound-button').setAttribute('aria-pressed', sound.enabled); $('sound-button').setAttribute('aria-label', sound.enabled ? t('sound.on.aria') : t('sound.off.aria')); $('sound-label').textContent = sound.enabled ? t('sound.on.label') : t('sound.off.label'); }
function updateReduced() { $('reduced-button').setAttribute('aria-pressed', reducedMotion); $('reduced-button').textContent = reducedMotion ? t('reduced.on') : t('reduced.off'); }
$('reduced-button').addEventListener('click', () => { reducedMotion = !reducedMotion; storage.set('reducedMotion', reducedMotion); updateReduced(); });
reducedQuery.addEventListener?.('change', e => { reducedMotion = e.matches; updateReduced(); });
$('help-button').addEventListener('click', () => { pause(t('pause.help')); $('help-dialog').showModal(); });
document.querySelectorAll('.dialog-close').forEach(b => b.addEventListener('click', () => $('help-dialog').close()));
function resize() {
  const rect = canvas.getBoundingClientRect(), ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(rect.width * ratio)); canvas.height = Math.max(1, Math.round(rect.height * ratio));
  ctx?.setTransform(canvas.width / WIDTH, 0, 0, canvas.height / HEIGHT, 0, 0);
}
new ResizeObserver(resize).observe(canvas);
function frame(now) {
  const dt = Math.min(.12, (now - last) / 1000); last = now; idleTime += Math.min(.05, dt);
  input.dx = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'));
  input.dy = Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'));
  input.slow = focusMode || keys.has('shift');
  if (game.mode === 'playing' && !$('help-dialog').open) {
    accumulator += dt;
    while (accumulator >= 1 / 60 && game.mode === 'playing') { game.update(1 / 60, input); accumulator -= 1 / 60; }
  } else accumulator = 0;
  processEvents(); syncMode();
  if (now - lastHud > 100) { updateHud(); lastHud = now; }
  if (game.time >= announcementUntil) $('stage-announcement').hidden = true;
  if (now >= toastUntil) $('toast').hidden = true;
  if (ctx) drawFrame(ctx, game, { idleTime, reducedMotion });
  sound.tick(game.mode === 'playing', game.stageIndex);
  requestAnimationFrame(frame);
}
if (!ctx) { $('start-button').disabled = true; $('start-button').textContent = t('canvas.unsupported'); }
applyStaticI18n();
chooseShip(0); updateSound(); updateReduced(); syncMode(); resize(); requestAnimationFrame(frame);
