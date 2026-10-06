'use client';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Undo2,
  Lightbulb,
  Move3D,
  MousePointer2,
  Check,
  Box,
  Grid2X2,
  Expand,
  Minimize,
  Leaf,
  Sparkles,
  CircleHelp,
  Save,
  Target,
  Timer,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import PuzzleScene from '@/components/PuzzleScene';
import {
  GAMES,
  NAMES,
  canSlide,
  canRemove,
  nextRemoval,
  solvedBoard,
} from '@/lib/game';
import { useLang, LangSwitcher, gameText, pieceName } from '@/lib/i18n';
import type { GameId, Snapshot, LockPiece } from '@/lib/game';
import boardData from '@/lib/boards.json';
import lockData from '@/lib/lock.json';
const PIECES = lockData as LockPiece[];
const initial = (id: GameId): Snapshot => ({
  removed: [],
  exits: {},
  board: structuredClone(
    id === 'huarong-classic' ? boardData.classic : boardData.beginner,
  ),
  moves: 0,
});
const formatTime = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const directionName = (axis: number, sign: number) =>
  ['X', 'Y', 'Z'][axis] + (sign > 0 ? '＋' : '－');
type Hint = { id: string; dx: number; dy: number };
function validSave(s: unknown): s is Snapshot {
  if (!s || typeof s !== 'object') return false;
  const a = s as Snapshot;
  if (
    !Array.isArray(a.removed) ||
    a.removed.some((id) => !PIECES.some((p) => p.id === id)) ||
    new Set(a.removed).size !== a.removed.length ||
    !a.exits ||
    typeof a.exits !== 'object' ||
    !Number.isInteger(a.moves) ||
    a.moves < 0 ||
    !Array.isArray(a.board) ||
    a.board.length !== 10
  )
    return false;
  const cells = new Set<string>();
  const ids = new Set<string>();
  for (const p of a.board) {
    const base = boardData.classic.find((q) => q.id === p.id);
    if (
      !base ||
      ids.has(p.id) ||
      p.w !== base.w ||
      p.h !== base.h ||
      !Number.isInteger(p.x) ||
      !Number.isInteger(p.y) ||
      p.x < 0 ||
      p.y < 0 ||
      p.x + p.w > 4 ||
      p.y + p.h > 5
    )
      return false;
    ids.add(p.id);
    for (let x = p.x; x < p.x + p.w; x++)
      for (let y = p.y; y < p.y + p.h; y++) {
        const k = x + ',' + y;
        if (cells.has(k)) return false;
        cells.add(k);
      }
  }
  return true;
}
export default function Home() {
  const { lang, setLang, t } = useLang();
  const [gameId, setGameId] = useState<GameId>('lock');
  const [snap, setSnap] = useState<Snapshot>(() => initial('lock'));
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [selected, setSelected] = useState<number | string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');
  const [hint, setHint] = useState<Hint | null>(null);
  const [thinking, setThinking] = useState(false);
  const [dialog, setDialog] = useState<'help' | 'culture' | 'success' | null>(
    null,
  );
  const [view, setView] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const requestRef = useRef(0);
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const game = GAMES.find((g) => g.id === gameId)!;
  const isLock = gameId === 'lock';
  const complete = isLock
    ? snap.removed.length === PIECES.length
    : solvedBoard(snap.board);
  const selectedPiece = isLock ? PIECES.find((p) => p.id === selected) : null;
  const tell = useCallback((text: string) => {
    setMessage(text);
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(''), 4400);
  }, []);
  // Read device-local progress after hydration; ignore a pending read after unmount.
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const data = JSON.parse(
          localStorage.getItem('sunjing:last-game') || 'null',
        );
        if (
          data &&
          GAMES.some((g) => g.id === data.gameId) &&
          validSave(data.snap)
        ) {
          setGameId(data.gameId);
          setSnap(data.snap);
          setSeconds(
            Number.isFinite(data.seconds)
              ? Math.max(0, Math.floor(data.seconds))
              : 0,
          );
          setStarted(data.snap.moves > 0);
        }
      } catch {}
      setHydrated(true);
    });
    return () => {
      active = false;
      if (messageTimer.current) clearTimeout(messageTimer.current);
    };
  }, []);
  // Persist the current position and report storage availability.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        'sunjing:last-game',
        JSON.stringify({ gameId, snap, seconds }),
      );
      queueMicrotask(() => setSaved(true));
    } catch {
      queueMicrotask(() => setSaved(false));
    }
  }, [gameId, snap, seconds, hydrated]);
  useEffect(() => {
    if (!started || complete || dialog) return;
    const t = setInterval(() => {
      if (!document.hidden) setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [started, complete, dialog]);
  useEffect(() => {
    const listener = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', listener);
    return () => document.removeEventListener('fullscreenchange', listener);
  }, []);
  useEffect(() => () => workerRef.current?.terminate(), []);
  function cancelHint() {
    requestRef.current++;
    workerRef.current?.terminate();
    workerRef.current = null;
    setThinking(false);
    setHint(null);
  }
  function record(next: Snapshot) {
    cancelHint();
    setHistory((h) => [...h, snap]);
    setSnap(next);
    setStarted(true);
    if (
      isLock ? next.removed.length === PIECES.length : solvedBoard(next.board)
    )
      setDialog('success');
  }
  function select(id: number | string) {
    setSelected(id);
    setMessage('');
    setStarted(true);
  }
  function remove(sign: number) {
    if (!isLock || complete) return;
    if (typeof selected !== 'number') {
      tell(t('msg.pick.lock'));
      return;
    }
    const result = canRemove(PIECES, snap.removed, selected, sign);
    if (!result.ok) {
      tell(
        `${t('msg.blocked')} ${String((result.blocker ?? 0) + 1).padStart(2, '0')} ${t('msg.blocked.tail')}`,
      );
      return;
    }
    record({
      ...snap,
      removed: [...snap.removed, selected],
      exits: { ...snap.exits, [selected]: sign },
      moves: snap.moves + 1,
    });
    setSelected(null);
    tell(
      `${t('msg.out')} ${String(selected + 1).padStart(2, '0')} ${t('msg.out.tail')}`,
    );
  }
  function slide(id: string, dx: number, dy: number) {
    if (isLock || complete) return;
    if (!canSlide(snap.board, id, dx, dy)) {
      tell(t('msg.nospace'));
      return;
    }
    record({
      ...snap,
      board: snap.board.map((p) =>
        p.id === id ? { ...p, x: p.x + dx, y: p.y + dy } : p,
      ),
      moves: snap.moves + 1,
    });
    setSelected(id);
    setMessage('');
  }
  function moveSelected(dx: number, dy: number) {
    if (typeof selected === 'string') slide(selected, dx, dy);
    else tell(t('msg.pick.board'));
  }
  function undo() {
    if (!history.length) return;
    cancelHint();
    const last = history[history.length - 1];
    setSnap(last);
    setHistory((h) => h.slice(0, -1));
    setSelected(null);
    setMessage('');
    setDialog(null);
  }
  function reset() {
    cancelHint();
    setSnap(initial(gameId));
    setHistory([]);
    setSelected(null);
    setSeconds(0);
    setStarted(false);
    setMessage('');
    setDialog(null);
    setView((v) => v + 1);
  }
  function switchGame(id: GameId) {
    if (id === gameId) {
      stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    cancelHint();
    setGameId(id);
    setSnap(initial(id));
    setHistory([]);
    setSelected(null);
    setSeconds(0);
    setStarted(false);
    setMessage('');
    setZoom(100);
    setView((v) => v + 1);
  }
  function showHint() {
    if (complete) return;
    if (isLock) {
      const next = nextRemoval(PIECES, snap.removed);
      if (next) {
        setSelected(next.id);
        const p = PIECES.find((p) => p.id === next.id)!;
        tell(
          `${t('msg.hint.lock')} ${String(next.id + 1).padStart(2, '0')} · ${directionName(p.axis, next.sign)} ${t('msg.hint.dir')}`,
        );
      }
      return;
    }
    if (hint) {
      slide(hint.id, hint.dx, hint.dy);
      return;
    }
    cancelHint();
    setThinking(true);
    const request = ++requestRef.current;
    try {
      const worker = new Worker('/solver-worker.js');
      workerRef.current = worker;
      worker.onmessage = ({ data }) => {
        if (data.request !== requestRef.current) return;
        setThinking(false);
        worker.terminate();
        workerRef.current = null;
        const next = data.result?.moves?.[0];
        if (next) {
          setHint(next);
          setSelected(next.id);
        } else
          tell(
            data.error ? t('msg.nohint') : t('msg.nosolve'),
          );
      };
      worker.onerror = () => {
        setThinking(false);
        worker.terminate();
        workerRef.current = null;
        tell(t('msg.noavail'));
      };
      worker.postMessage({ request, board: snap.board });
    } catch {
      setThinking(false);
      tell(t('msg.no browser'));
    }
  }
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (stageRef.current?.requestFullscreen)
        await stageRef.current.requestFullscreen();
      else tell(t('msg.nofull'));
    } catch {
      tell(t('msg.nofull2'));
    }
  }
  useEffect(() => {
    function keydown(e: KeyboardEvent) {
      if (
        dialog ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        (e.target instanceof HTMLElement &&
          (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) ||
            e.target.closest('[role="slider"]')))
      )
        return;
      if (e.key === 'Escape') {
        setSelected(null);
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        reset();
        return;
      }
      if (e.key === 'z' || e.key === 'Z') {
        undo();
        return;
      }
      if (isLock) {
        if (/^[1-6]$/.test(e.key)) {
          const id = Number(e.key) - 1;
          if (PIECES.some((p) => p.id === id) && !snap.removed.includes(id))
            select(id);
        }
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          remove(1);
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          remove(-1);
        }
      } else {
        const d: Record<string, number[]> = {
          ArrowUp: [0, -1],
          ArrowDown: [0, 1],
          ArrowLeft: [-1, 0],
          ArrowRight: [1, 0],
        };
        if (d[e.key] && typeof selected === 'string') {
          e.preventDefault();
          moveSelected(d[e.key][0], d[e.key][1]);
        }
      }
    }
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  });
  const dirName = (dx: number, dy: number) =>
    dx > 0
      ? t('dir.right')
      : dx < 0
        ? t('dir.left')
        : dy > 0
          ? t('dir.down')
          : t('dir.up');
  const hintText = hint
    ? `${pieceName(hint.id, lang, NAMES[hint.id])} ${dirName(hint.dx, hint.dy)} ${t('hint.move.one')}`
    : '';
  return (
    <div className="shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label={t('brand.home')}>
          <span className="brand-mark">榫</span>
          <div>
            <div className="brand-name serif">{t('brand.name')}</div>
            <div className="brand-en">{t('brand.sub')}</div>
          </div>
        </Link>
        <nav className="topnav" aria-label={lang === 'ar' ? 'التنقل الرئيسي' : lang === 'en' ? 'Main navigation' : '主导航'}>
          <button
            className="nav-item active"
            onClick={() =>
              stageRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              })
            }
          >
            {t('nav.workshop')}
          </button>
          <button
            className="nav-item nav-culture"
            onClick={() => setDialog('culture')}
          >
            {t('nav.culture')}
          </button>
          <button className="nav-item" onClick={() => setDialog('help')}>
            {t('nav.help')} <ArrowUpRight size={13} />
          </button>
        </nav>
        <div className="header-meta">
          <LangSwitcher lang={lang} setLang={setLang} t={t} />
          <i className="status-dot" />
          <span>{t('nav.slogan')}</span>
          <button
            className="round-button"
            aria-label={t('nav.help')}
            onClick={() => setDialog('help')}
          >
            <CircleHelp size={16} />
          </button>
        </div>
      </header>
      <main>
        <div className="intro">
          <div>
            <div className="eyebrow">{t('intro.eyebrow')}</div>
            <h1 className="serif">{t('intro.h1')}</h1>
            <p>{t('intro.p')}</p>
          </div>
          <div className="intro-note">
            <Leaf size={14} /> {t('intro.note')}
          </div>
        </div>
        <div className="workbench">
          <section
            className={`stage ${isLock ? '' : 'board-stage'}`}
            ref={stageRef}
            aria-label={lang === 'ar' ? 'منطقة اللعب ثلاثية الأبعاد' : lang === 'en' ? '3D play area' : '三维游戏区域'}
          >
            <div className="stage-top">
              <span className="stage-pill">
                <i className="status-dot" />{' '}
                {isLock ? t('stage.lock') : t('stage.board')}
              </span>
              <span className="stage-pill">
                {isLock ? t('stage.free') : t('stage.wood')}
              </span>
            </div>
            <span className="stage-overline">{game.label}</span>
            <span className="stage-watermark" aria-hidden="true">
              {gameText(game.id, 'stage', lang, game.stage)}
            </span>
            <PuzzleScene
              pieces={PIECES}
              mode={isLock ? 'lock' : 'huarong'}
              removed={snap.removed}
              exits={snap.exits}
              board={snap.board}
              selected={selected}
              onSelect={select}
              onSlide={slide}
              resetView={view}
              zoom={zoom}
            />
            <div className="scene-tools">
              <button
                className="scene-tool"
                aria-label={t('stage.zoom.out')}
                title={t('stage.zoom.out')}
                onClick={() => setZoom((z) => Math.max(70, z - 10))}
                disabled={zoom <= 70}
              >
                <span>−</span>
              </button>
              <button
                className="scene-tool"
                aria-label={t('stage.zoom.in')}
                title={t('stage.zoom.in')}
                onClick={() => setZoom((z) => Math.min(140, z + 10))}
                disabled={zoom >= 140}
              >
                <span>＋</span>
              </button>
              <button
                className="scene-tool"
                aria-label={fullscreen ? t('stage.unfull') : t('stage.full')}
                title={t('stage.full')}
                onClick={toggleFullscreen}
              >
                {fullscreen ? <Minimize /> : <Expand />}
              </button>
            </div>
            <div className="stage-caption">
              {gameText(game.id, 'stage', lang, game.stage)}
              <small>{game.english}</small>
            </div>
            {message && <output className="stage-status">{message}</output>}
            <div className="zoom-slider">
              <div className="zoom-label">
                {t('stage.zoom')} {zoom}%
              </div>
              <Slider
                aria-label={t('stage.model')}
                min={70}
                max={140}
                step={5}
                value={[zoom]}
                onValueChange={(v) => setZoom(Array.isArray(v) ? v[0] : v)}
              />
            </div>
            <div className="stage-bottom">
              <span className="gesture-note">
                <MousePointer2 size={14} />
                {isLock ? t('stage.gesture.lock') : t('stage.gesture.board')}
              </span>
              <button
                className="view-reset"
                onClick={() => {
                  setView((v) => v + 1);
                  setZoom(100);
                }}
              >
                <RotateCcw />
                {t('stage.view.reset')}
              </button>
            </div>
          </section>
          <aside
            className={`panel ${isLock ? '' : 'huarong-panel'}`}
            aria-label={lang === 'ar' ? 'لوحة التحكم' : lang === 'en' ? 'Puzzle console' : '解谜控制台'}
          >
            <div className="panel-head-section">
              <div className="panel-heading">
                <span className="eyebrow">
                  {t('panel.puzzle')}{' '}
                  {GAMES.findIndex((g) => g.id === gameId) + 1 < 10 ? '0' : ''}
                  {GAMES.findIndex((g) => g.id === gameId) + 1}
                </span>
                <span className="level-tag">
                  {gameText(game.id, 'level', lang, game.level)}
                </span>
              </div>
              <h2 className="serif">
                {isLock ? t('panel.lock.name') : t('panel.board.name')}
              </h2>
              <p className="panel-desc">
                {gameText(game.id, 'objective', lang, game.objective)}
              </p>
              <div className="stats">
                <div className="stat">
                  <span className="stat-label">
                    {isLock ? t('stat.wood') : t('stat.moves')}
                  </span>
                  <span className="stat-value">
                    {isLock ? snap.removed.length : snap.moves}
                    <small>
                      {isLock ? `/ ${PIECES.length}` : t('unit.step')}
                    </small>
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">{t('stat.time')}</span>
                  <span className="stat-value">{formatTime(seconds)}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">
                    {isLock ? t('stat.steps') : t('stat.goal')}
                  </span>
                  <span className="stat-value">
                    {isLock ? snap.moves : <Target size={18} />}
                  </span>
                </div>
              </div>
            </div>
            <div className="panel-controls">
              <div className="section-label">
                {isLock ? t('panel.pick.lock') : t('panel.pick.board')}
                <span>
                  {isLock
                    ? t('panel.range')
                    : t('panel.click')}
                </span>
              </div>
              {isLock ? (
                <>
                  <div className="piece-grid">
                    {PIECES.map((p) => (
                      <button
                        key={p.id}
                        aria-label={`#${String(p.id + 1).padStart(2, '0')}${snap.removed.includes(p.id) ? ' ✓' : ''}`}
                        aria-pressed={selected === p.id}
                        disabled={snap.removed.includes(p.id) || complete}
                        className={`piece-button ${selected === p.id ? 'selected' : ''} ${snap.removed.includes(p.id) ? 'removed' : ''}`}
                        onClick={() => select(p.id)}
                      >
                        {snap.removed.includes(p.id) ? (
                          <Check />
                        ) : (
                          String(p.id + 1).padStart(2, '0')
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="move-controls">
                    <button
                      className="move-button"
                      disabled={!selectedPiece || complete}
                      onClick={() => remove(-1)}
                    >
                      <ArrowLeft />{' '}
                      {selectedPiece
                        ? directionName(selectedPiece.axis, -1)
                        : t('move.neg')}{' '}
                      {t('move.out')}
                    </button>
                    <button
                      className="move-button"
                      disabled={!selectedPiece || complete}
                      onClick={() => remove(1)}
                    >
                      {selectedPiece
                        ? directionName(selectedPiece.axis, 1)
                        : t('move.pos')}{' '}
                      {t('move.out')} <ArrowRight />
                    </button>
                  </div>
                  <p className="selected-label">
                    {selectedPiece
                      ? `${t('pick.piece')} ${String(selectedPiece.id + 1).padStart(2, '0')} ${t('pick.hint.lock')}`
                      : t('pick.hint')}
                  </p>
                </>
              ) : (
                <>
                  <div className="huarong-selector">
                    {snap.board.map((p) => (
                      <button
                        key={p.id}
                        aria-pressed={selected === p.id}
                        className={selected === p.id ? 'selected' : ''}
                        disabled={complete}
                        onClick={() => select(p.id)}
                      >
                        {pieceName(p.id, lang, NAMES[p.id])}
                      </button>
                    ))}
                  </div>
                  <div className="direction-pad">
                    {[
                      { dx: 0, dy: -1, label: t('dir.up'), icon: <ArrowUp /> },
                      { dx: -1, dy: 0, label: t('dir.left'), icon: <ArrowLeft /> },
                      { dx: 0, dy: 1, label: t('dir.down'), icon: <ArrowDown /> },
                      { dx: 1, dy: 0, label: t('dir.right'), icon: <ArrowRight /> },
                    ].map((d) => (
                      <button
                        key={d.label}
                        aria-label={d.label}
                        className="move-button"
                        disabled={typeof selected !== 'string' || complete}
                        onClick={() => moveSelected(d.dx, d.dy)}
                      >
                        {d.icon}
                      </button>
                    ))}
                  </div>
                  {hint && (
                    <output className="hint-detail">
                      {hintText}
                      {t('hint.detail.try')}
                    </output>
                  )}
                </>
              )}
            </div>
            <div className="panel-actions">
              <button
                className="hint-button"
                onClick={complete ? () => setDialog('success') : showHint}
                disabled={thinking}
              >
                {complete ? <Check /> : thinking ? <Timer /> : <Lightbulb />}
                {complete
                  ? t('hint.btn.done')
                  : thinking
                    ? t('hint.btn.thinking')
                    : hint
                      ? t('hint.btn.go')
                      : t('hint.btn.need')}
              </button>
              <div className="sub-actions">
                <button
                  className="text-action"
                  disabled={!history.length}
                  onClick={undo}
                >
                  <Undo2 />
                  {t('btn.undo')}
                </button>
                <button className="text-action" onClick={reset}>
                  <RotateCcw />
                  {t('btn.reset')}
                </button>
              </div>
            </div>
            <div className="panel-foot">
              <Sparkles />
              {complete ? t('panel.done') : t('panel.try')}
            </div>
          </aside>
        </div>
        <div className="under-stage">
          <div className="step-guide">
            <span>
              <b>1</b>
              {isLock ? t('steps.1.lock') : t('steps.1.board')}
            </span>
            <span>
              <b>2</b>
              {isLock ? t('steps.2.lock') : t('steps.2.board')}
            </span>
            <span>
              <b>3</b>
              {isLock ? t('steps.3.lock') : t('steps.3.board')}
            </span>
          </div>
          <div className="auto-save">
            <Save />
            {saved ? t('save.ok') : t('save.no')}
          </div>
        </div>
        <section className="collection" aria-label={lang === 'ar' ? 'اختيار اللعبة' : lang === 'en' ? 'Choose a game' : '选择游戏'}>
          <div className="collection-head">
            <div className="collection-title">
              <h3 className="serif">{t('collection.h1')}</h3>
              <span>{t('collection.en')}</span>
            </div>
            <span className="collection-note">
              {t('collection.levels').replace('3', String(GAMES.length))}
            </span>
          </div>
          <div className="cards">
            {GAMES.map((g, i) => (
              <button
                className={`game-card ${gameId === g.id ? 'active' : ''}`}
                key={g.id}
                onClick={() => switchGame(g.id)}
                aria-pressed={gameId === g.id}
              >
                <div className="card-emblem">
                  {i === 0 ? <Box /> : i === 1 ? <Grid2X2 /> : <Move3D />}
                </div>
                <div className="card-main">
                  <div className="card-top">
                    {i === 0
                      ? t('card.0.tag')
                      : i === 1
                        ? t('card.1.tag')
                        : t('card.2.tag')}
                    <span
                      className="difficulty"
                      aria-label={`${lang === 'ar' ? 'الصعوبة' : lang === 'en' ? 'Difficulty' : '难度'} ${g.difficulty}`}
                    >
                      {[1, 2, 3].map((n) => (
                        <i className={n <= g.difficulty ? 'on' : ''} key={n} />
                      ))}
                    </span>
                  </div>
                  <h4>{gameText(g.id, 'title', lang, g.title)}</h4>
                  <div className="card-sub">
                    {gameText(g.id, 'desc', lang, g.desc)}
                  </div>
                </div>
                {gameId === g.id ? (
                  <Check className="card-arrow" />
                ) : (
                  <ArrowUpRight className="card-arrow" />
                )}
              </button>
            ))}
          </div>
        </section>
      </main>
      <footer className="footer">
        <span className="footer-brand">
          <Leaf /> {t('footer.brand')}
        </span>
        <span className="footer-text">{t('footer.a')}</span>
        <span>{t('footer.b')}</span>
      </footer>
      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      >
        <DialogContent
          className={`modal-content ${dialog === 'success' ? 'success-content' : ''}`}
        >
          {dialog === 'help' && (
            <>
              <DialogTitle>{t('help.title')}</DialogTitle>
              <DialogDescription>{t('help.desc')}</DialogDescription>
              <Tabs
                defaultValue={isLock ? 'lock' : 'board'}
                className="settings-tabs"
              >
                <TabsList>
                  <TabsTrigger value="lock">{t('help.tab.lock')}</TabsTrigger>
                  <TabsTrigger value="board">{t('help.tab.board')}</TabsTrigger>
                </TabsList>
                <TabsContent value="lock">
                  <div className="help-list">
                    <div className="help-step">
                      <b>1</b>
                      <div>
                        <strong>{t('help.lock.1.t')}</strong>
                        {t('help.lock.1.d')}
                      </div>
                    </div>
                    <div className="help-step">
                      <b>2</b>
                      <div>
                        <strong>{t('help.lock.2.t')}</strong>
                        {t('help.lock.2.d')}
                      </div>
                    </div>
                    <div className="help-step">
                      <b>3</b>
                      <div>
                        <strong>{t('help.lock.3.t')}</strong>
                        {t('help.lock.3.d')}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="board">
                  <div className="help-list">
                    <div className="help-step">
                      <b>1</b>
                      <div>
                        <strong>{t('help.board.1.t')}</strong>
                        {t('help.board.1.d')}
                      </div>
                    </div>
                    <div className="help-step">
                      <b>2</b>
                      <div>
                        <strong>{t('help.board.2.t')}</strong>
                        {t('help.board.2.d')}
                      </div>
                    </div>
                    <div className="help-step">
                      <b>3</b>
                      <div>
                        <strong>{t('help.board.3.t')}</strong>
                        {t('help.board.3.d')}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <p className="note-block">{t('help.note')}</p>
            </>
          )}
          {dialog === 'culture' && (
            <>
              <span className="eyebrow">{t('culture.eyebrow')}</span>
              <DialogTitle>{t('culture.title')}</DialogTitle>
              <DialogDescription>{t('culture.desc')}</DialogDescription>
              <div className="help-list">
                <div className="help-step">
                  <b>
                    <Box size={14} />
                  </b>
                  <div>
                    <strong>{t('culture.lock.t')}</strong>
                    {t('culture.lock.d')}
                  </div>
                </div>
                <div className="help-step">
                  <b>
                    <Grid2X2 size={14} />
                  </b>
                  <div>
                    <strong>{t('culture.board.t')}</strong>
                    {t('culture.board.d')}
                  </div>
                </div>
              </div>
              <p className="note-block">{t('culture.note')}</p>
            </>
          )}
          {dialog === 'success' && (
            <>
              <div className="success-icon">
                <Check size={30} />
              </div>
              <span className="eyebrow">BEAUTIFULLY UNLOCKED</span>
              <DialogTitle>{t('success.done')}</DialogTitle>
              <DialogDescription>
                {t('success.you')}
                {gameText(game.id, 'title', lang, game.title)} —
                <br />
                {t('success.moves')} {snap.moves} · {formatTime(seconds)}
              </DialogDescription>
              <button
                className="hint-button"
                onClick={() => {
                  setDialog(null);
                  switchGame(
                    GAMES[
                      (GAMES.findIndex((g) => g.id === gameId) + 1) %
                        GAMES.length
                    ].id,
                  );
                }}
              >
                {t('success.next')} <ArrowRight />
              </button>
              <button
                className="text-action"
                style={{ justifyContent: 'center' }}
                onClick={reset}
              >
                <RotateCcw />
                {t('success.again')}
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
      <output className="sr-only" aria-live="polite">
        {isLock
          ? `${snap.removed.length} ${t('sr.lock')}`
          : `${snap.moves} ${t('sr.board')}`}
      </output>
    </div>
  );
}
