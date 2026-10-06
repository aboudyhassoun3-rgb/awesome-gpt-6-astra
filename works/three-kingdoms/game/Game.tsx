'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  Map,
  Users,
  ScrollText,
  HelpCircle,
  Flag,
  Coins,
  Wheat,
  Castle,
  Swords,
  Shield,
  TrendingUp,
  ChevronRight,
  ArrowRight,
  Save,
  RotateCcw,
  Check,
  Compass,
  Sun,
  Volume2,
  VolumeX,
  Download,
  Upload,
  Maximize,
  Minimize,
  Plus,
  Minus,
  LocateFixed,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import * as E from './engine';
import Portrait from './Portrait';
import { Input } from '@/components/ui/input';
import type { Game as State, Playable, Action } from './engine';
import {
  useLang,
  LangSwitcher,
  cityName,
  factionName,
  specialtyName,
} from '@/lib/i18n';
const fmt = (n: number) => Math.round(n).toLocaleString('zh-CN');
const compactFor = (lang: 'ar' | 'zh' | 'en', n: number) =>
  n >= 10000
    ? lang === 'zh'
      ? `${(n / 10000).toFixed(1)}万`
      : lang === 'ar'
        ? `${(n / 1000).toFixed(1)} ألف`
        : `${(n / 1000).toFixed(1)}K`
    : fmt(n);
const icons = {
  farm: Wheat,
  market: TrendingUp,
  recruit: Users,
  train: Swords,
  wall: Shield,
};
declare const __TERRAIN_URL__: string;
const terrain =
  typeof __TERRAIN_URL__ !== 'undefined' ? __TERRAIN_URL__ : '/terrain.jpg';
const gameFileName = 'three-kingdoms-save.json';
export default function Game() {
  const { lang, setLang, t } = useLang();
  const [g, setG] = useState<State>(() => E.newGame());
  const [query, setQuery] = useState('');
  const [rosterFilter, setRosterFilter] = useState('mine');
  const [detail, setDetail] = useState<E.Officer | null>(null);
  const [administrator, setAdministrator] = useState('auto');
  const [selected, setSelected] = useState('chengdu');
  const [view, setView] = useState('map');
  const [setup, setSetup] = useState(false);
  const [faction, setFaction] = useState<Playable>('shu');
  const [ready, setReady] = useState(false);
  const [help, setHelp] = useState(false);
  const [restart, setRestart] = useState(false);
  const [attack, setAttack] = useState(false);
  const [target, setTarget] = useState('');
  const [requestedTroops, setTroops] = useState(8000);
  const [officer, setOfficer] = useState('guan');
  const [notice, setNotice] = useState('طوّر مدنك أولًا، ثم قُد جيوشك لتوحيد العالم.');
  const [saving, setSaving] = useState('حفظ تلقائي محلي');
  const [sound, setSound] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(false);
  const [full, setFull] = useState(false);
  const imported = useRef<HTMLInputElement>(null);
  const lock = useRef(false);
  const shell = useRef<HTMLDivElement>(null);
  const mapScroll = useRef<HTMLDivElement>(null);
  // Hydration and save feedback synchronize with browser-only local storage.
  /* eslint-disable react/react-compiler */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(E.STORAGE_KEY);
      if (raw) {
        const saved = E.loadGame(raw);
        setG(saved);
        setFaction(saved.player);
        setAdministrator('auto');
        setSelected(E.owned(saved, saved.player)[0]?.id || 'chengdu');
        setNotice(t('notice.resume'));
      } else setSetup(true);
    } catch {
      setSetup(true);
      setSaving(t('saving.unavail'));
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || setup) return;
    try {
      localStorage.setItem(E.STORAGE_KEY, JSON.stringify(g));
      setSaving(t('saving.auto'));
    } catch {
      setSaving(t('saving.export'));
    }
  }, [g, ready, setup]);
  /* eslint-enable react/react-compiler */
  useEffect(() => {
    const onFull = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFull);
    return () => document.removeEventListener('fullscreenchange', onFull);
  }, []);
  const city = E.getCity(g, selected);
  const mine = city.owner === g.player;
  const me = E.FACTIONS[g.player];
  const resources = g.resources[g.player];
  const income = E.income(g);
  const myCities = E.owned(g, g.player);
  const totalTroops =
    myCities.reduce((n, c) => n + c.troops, 0) +
    g.armies
      .filter((a) => a.owner === g.player)
      .reduce((n, a) => n + a.troops, 0);
  const visibleOfficers = (
    rosterFilter === 'mine'
      ? me.officers
      : rosterFilter === 'all'
        ? E.ALL_OFFICERS
        : E.FACTIONS[rosterFilter as Playable].officers
  ).filter((o) => `${o.name}${o.role}${o.specialty}`.includes(query.trim()));
  const available = me.officers.filter((o) => E.officerAvailable(g, o.id));
  const targets = E.neighbors(selected).map((id) => E.getCity(g, id));
  const targetCity = g.cities.find((c) => c.id === target);
  const chosenOfficer = E.getOfficer(officer);
  const marchLimit = Math.max(
    1000,
    Math.floor(
      Math.min(
        city.troops - 1000,
        chosenOfficer ? E.leaderCapacity(chosenOfficer) : 1000,
      ) / 500,
    ) * 500,
  );
  const troops = Math.max(1000, Math.min(requestedTroops, marchLimit));
  const forecast =
    targetCity && mine ? E.predict(g, selected, target, troops, officer) : null;
  function ping(low = false) {
    if (!sound) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const context = new AudioCtx();
      const osc = context.createOscillator(),
        gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(low ? 220 : 540, context.currentTime);
      gain.gain.setValueAtTime(0.045, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2);
      osc.start();
      osc.stop(context.currentTime + 0.2);
      osc.onended = () => {
        void context.close();
      };
    } catch {}
  }
  function update(fn: (state: State) => State, success: string) {
    if (lock.current) return;
    lock.current = true;
    try {
      const next = fn(g);
      setG(next);
      setNotice(success);
      ping();
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      lock.current = false;
    }
  }
  function start() {
    setAdministrator('auto');
    const fresh = E.newGame(faction);
    setG(fresh);
    setSelected(E.FACTIONS[faction].capital);
    setView('map');
    setSetup(false);
    setNotice(t('notice.suggest'));
    ping();
  }
  function openMarch(destination?: string) {
    const origin = E.getCity(g, selected);
    if (origin.owner !== g.player) return;
    setTarget(
      destination ||
        E.neighbors(selected).find(
          (id) => E.getCity(g, id).owner !== g.player,
        ) ||
        E.neighbors(selected)[0],
    );
    setOfficer(
      available.slice().sort((a, b) => E.combatSkill(b) - E.combatSkill(a))[0]
        ?.id || '',
    );
    setTroops(
      Math.max(
        1000,
        Math.floor(
          Math.min(origin.troops - 1000, origin.troops * 0.75) / 1000,
        ) * 1000,
      ),
    );
    setAttack(true);
  }
  function nextTurn() {
    if (lock.current || busy) return;
    lock.current = true;
    setBusy(true);
    setTimeout(() => {
      try {
        const next = E.endTurn(g);
        setG(next);
        setNotice(
          next.status === 'playing'
            ? t('notice.turn').replace('{n}', String(next.turn))
            : next.status === 'won'
              ? t('notice.won')
              : t('notice.lost'),
        );
        ping(true);
      } catch (error) {
        setNotice((error as Error).message);
      } finally {
        setBusy(false);
        lock.current = false;
      }
    }, 420);
  }
  function exportSave() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(g, null, 2)], { type: 'application/json' }),
    );
    a.download = gameFileName;
    a.click();
    URL.revokeObjectURL(a.href);
    setNotice(t('notice.exported'));
  }
  async function importSave(file?: File) {
    if (!file) return;
    try {
      const saved = E.loadGame(await file.text());
      setG(saved);
      setFaction(saved.player);
      setAdministrator('auto');
      setSelected(E.owned(saved, saved.player)[0]?.id || 'chengdu');
      setNotice(t('notice.imported'));
      setHelp(false);
    } catch (error) {
      setNotice((error as Error).message);
    }
    if (imported.current) imported.current.value = '';
  }
  function selectCity(id: string) {
    setSelected(id);
    setAdministrator('auto');
    ping();
  }
  const actionDisabled = (type: Action) =>
    E.actionError(g, type, selected, g.player, g.ap, administrator) || busy;
  return (
    <div className="game-shell" ref={shell}>
      <header className="topbar">
        <div className="brand">
          <span className="brand-seal">
            {t('brand.seal').split('').join('\n')}
          </span>
          <div>
            <h1>{t('brand.title')}</h1>
            <span>{t('brand.sub')}</span>
          </div>
        </div>
        <div className="top-divider" />
        <div className="ruler">
          <Portrait officer={me.officers[0]} className="ruler-avatar" />
          <span
            className="mini-seal"
            style={{ color: me.color, borderColor: me.color }}
          >
            {me.seal}
          </span>
          <div>
            <strong>
              {factionName(g.player, lang)} {lang === 'zh' ? '势力' : ''}
            </strong>
            <small>{me.title}</small>
          </div>
        </div>
        <div className="treasury">
          <div>
            <Coins />
            <span>
              <small>{t('res.gold')}</small>
              <strong>{fmt(resources.gold)}</strong>
            </span>
            <em>+{fmt(income.gold)}</em>
          </div>
          <div>
            <Wheat />
            <span>
              <small>{t('res.food')}</small>
              <strong>{fmt(resources.food)}</strong>
            </span>
            <em>
              {income.food >= 0 ? '+' : ''}
              {fmt(income.food)}
            </em>
          </div>
          <div className="troop-total">
            <Users />
            <span>
              <small>{t('res.troops')}</small>
              <strong>{fmt(totalTroops)}</strong>
            </span>
          </div>
        </div>
        <LangSwitcher lang={lang} setLang={setLang} t={t} />
        <button
          className="icon-button"
          aria-label={sound ? t('sound.on') : t('sound.off')}
          title={sound ? t('sound.on') : t('sound.off')}
          onClick={() => setSound(!sound)}
        >
          {sound ? <Volume2 /> : <VolumeX />}
        </button>
        <button
          className="icon-button help-icon"
          aria-label={t('help.open')}
          title={t('help.open')}
          onClick={() => setHelp(true)}
        >
          <HelpCircle />
        </button>
      </header>
      <div className="game-body">
        <nav className="rail" aria-label={t('nav.view')}>
          {[
            ['map', t('view.map'), Map],
            ['officers', t('view.officers'), Users],
            ['chronicle', t('view.chronicle'), ScrollText],
          ].map(([id, label, Icon]) => {
            const I = Icon as typeof Map;
            return (
              <button
                key={id as string}
                className={view === id ? 'active' : ''}
                onClick={() => setView(id as string)}
                aria-label={label as string}
              >
                <I />
                <span>{label as string}</span>
              </button>
            );
          })}
          <div className="rail-spacer" />
          <button onClick={exportSave} aria-label={t('nav.save')}>
            <Save />
            <span>{t('nav.save')}</span>
          </button>
          <button onClick={() => setRestart(true)} aria-label={t('nav.new')}>
            <RotateCcw />
            <span>{t('nav.new')}</span>
          </button>
          <span className="rail-bottom">{t('era')}</span>
        </nav>
        <main className="world">
          <div className="world-head">
            <div>
              <span className="eyebrow">{t('world.trend')}</span>
              <h2>
                {view === 'map'
                  ? t('world.map')
                  : view === 'officers'
                    ? t('world.officers')
                    : t('world.chronicle')}
              </h2>
            </div>
            <div className="scenario">
              <span className="live-dot" /> {t('scenario.a')}{' '}
              <span className="scenario-sep">/</span>
              <span>{t('scenario.b')}</span>
            </div>
          </div>
          <div
            className={`map-viewport ${view === 'map' ? '' : 'map-hidden'}`}
            ref={mapScroll}
          >
            <div
              className="world-map"
              style={{
                width: `${zoom * 100}%`,
                height: `${zoom * 100}%`,
                backgroundImage: `url(${terrain})`,
              }}
            >
              <div className="map-shade" />
              <span className="region region-west">
                {lang === 'zh' ? '益 州' : t('region.west')}
              </span>
              <span className="region region-north">
                {lang === 'zh' ? '司 隶' : t('region.north')}
              </span>
              <span className="region region-east">
                {lang === 'zh' ? '扬 州' : t('region.east')}
              </span>
              <span className="region region-center">
                {lang === 'zh' ? '荆 州' : t('region.center')}
              </span>
              <svg
                className="road-map"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {E.ROADS.map(([a, b]) => {
                  const c = E.getCity(g, a),
                    d = E.getCity(g, b),
                    highlight = selected === a || selected === b;
                  return (
                    <line
                      key={`${a}-${b}`}
                      x1={c.x}
                      y1={c.y}
                      x2={d.x}
                      y2={d.y}
                      className={highlight ? 'road active-road' : 'road'}
                    />
                  );
                })}
                {g.armies.map((a) => {
                  const c = E.getCity(g, a.from),
                    d = E.getCity(g, a.to);
                  return (
                    <line
                      key={a.id}
                      x1={c.x}
                      y1={c.y}
                      x2={d.x}
                      y2={d.y}
                      className="march-road"
                      style={{ stroke: E.FACTIONS[a.owner].color }}
                    />
                  );
                })}
              </svg>
              {g.cities.map((c) => (
                <button
                  key={c.id}
                  className={`city ${c.id === selected ? 'selected' : ''} ${c.owner === g.player ? 'owned' : ''}`}
                  style={
                    {
                      left: `${c.x}%`,
                      top: `${c.y}%`,
                      '--faction': E.FACTIONS[c.owner].color,
                    } as CSSProperties
                  }
                  onClick={() => selectCity(c.id)}
                  aria-label={`${cityName(c.id, c.name, lang)} · ${factionName(c.owner, lang)} · ${fmt(c.troops)} ${t('unit.soldier')}`}
                  aria-pressed={c.id === selected}
                >
                  <span className="city-halo" />
                  <span className="city-pin">
                    <Castle size={20} />
                  </span>
                  <span className="city-banner">
                    <i>{E.FACTIONS[c.owner].seal}</i>
                    <strong>{c.name}</strong>
                  </span>
                  <span className="city-troops">{compactFor(lang, c.troops)}</span>
                </button>
              ))}
              {g.armies.map((a) => {
                const c = E.getCity(g, a.from),
                  d = E.getCity(g, a.to);
                return (
                  <div
                    className="march-token"
                    key={a.id}
                    style={{
                      left: `${(c.x + d.x) / 2}%`,
                      top: `${(c.y + d.y) / 2}%`,
                      color: E.FACTIONS[a.owner].color,
                    }}
                    title={`${compactFor(lang, a.troops)} ${t('unit.soldier')} → ${cityName(d.id, d.name, lang)}`}
                  >
                    <Flag size={16} />
                    <span>{compactFor(lang, a.troops)}</span>
                  </div>
                );
              })}
              <div className="compass">
                <Compass />
                <span>{t('compass.north')}</span>
              </div>
            </div>
          </div>
          {view === 'map' && (
            <>
              <div className="map-caption">
                <span className="caption-line" />
                {t('map.caption')}
                <small>{t('map.caption.small')}</small>
              </div>
              <div className="map-tools">
                <button
                  aria-label={t('map.zoom.in')}
                  disabled={zoom >= 1.8}
                  onClick={() => setZoom(Math.min(1.8, zoom + 0.2))}
                >
                  <Plus />
                </button>
                <button
                  aria-label={t('map.zoom.out')}
                  disabled={zoom <= 1}
                  onClick={() => setZoom(Math.max(1, zoom - 0.2))}
                >
                  <Minus />
                </button>
                <button
                  aria-label={t('map.zoom.reset')}
                  onClick={() => {
                    setZoom(1);
                    mapScroll.current?.scrollTo(0, 0);
                  }}
                >
                  <LocateFixed />
                </button>
                <button
                  aria-label={full ? t('map.exitFullscreen') : t('map.fullscreen')}
                  onClick={() => {
                    if (document.fullscreenElement)
                      void document.exitFullscreen();
                    else
                      void shell.current
                        ?.requestFullscreen?.()
                        .catch(() => setNotice(t('notice.nofull')));
                  }}
                >
                  {full ? <Minimize /> : <Maximize />}
                </button>
              </div>
            </>
          )}
          {view === 'officers' && (
            <section className="officer-view">
              <div className="roster-heading">
                <div>
                  <span className="eyebrow">{t('officer.encyclopedia')}</span>
                  <p className="section-intro">{t('officer.intro')}</p>
                </div>
                <span className="roster-count">
                  {visibleOfficers.length}
                  <small> {t('officer.count')}</small>
                </span>
              </div>
              <div className="roster-controls">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('officer.search')}
                  aria-label={t('officer.search')}
                />
                <Select
                  value={rosterFilter}
                  onValueChange={(v) => setRosterFilter(v || 'mine')}
                >
                  <SelectTrigger className="game-select">
                    <SelectValue>
                      {
                        {
                          mine: t('filter.mine'),
                          all: t('filter.all'),
                          wei: t('filter.wei'),
                          shu: t('filter.shu'),
                          wu: t('filter.wu'),
                        }[rosterFilter]
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      [
                        ['mine', t('filter.mine')],
                        ['all', t('filter.all')],
                        ['wei', t('filter.wei')],
                        ['shu', t('filter.shu')],
                        ['wu', t('filter.wu')],
                      ] as [string, string][]
                    ).map(([v, label]) => (
                      <SelectItem key={v} value={v}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="officer-grid">
                {visibleOfficers.map((o) => (
                  <button
                    className="officer-card"
                    key={o.id}
                    onClick={() => setDetail(o)}
                    aria-label={`${o.name} · ${t('stat.command')}${o.command} ${t('stat.war')}${o.war} ${t('stat.int')}${o.int}`}
                  >
                    <div className="officer-portrait">
                      <Portrait officer={o} />
                      <small>{o.specialty}</small>
                    </div>
                    <div className="officer-card-info">
                      <span
                        className="eyebrow"
                        style={{ color: E.FACTIONS[o.faction].color }}
                      >
                        {factionName(o.faction, lang)} · {o.role}
                      </span>
                      <h3>
                        {o.name}
                        {lang !== 'zh' && (
                          <small
                            style={{
                              display: 'block',
                              fontSize: 12,
                              letterSpacing: 0,
                              opacity: 0.7,
                            }}
                          >
                            {specialtyName(o.specialty, t)}
                          </small>
                        )}
                      </h3>
                      <div className="officer-stats">
                        <span>
                          {t('stat.command')} <b>{o.command}</b>
                        </span>
                        <span>
                          {t('stat.war')} <b>{o.war}</b>
                        </span>
                        <span>
                          {t('stat.int')} <b>{o.int}</b>
                        </span>
                      </div>
                      <p
                        className={
                          E.officerAvailable(g, o.id) ? 'available' : 'away'
                        }
                      >
                        <span className="live-dot" />
                        {g.armies.some((a) => a.officer === o.id)
                          ? t('status.marching')
                          : E.officerAvailable(g, o.id)
                            ? t('status.ready')
                            : `${t('status.rest')} ${E.restRemaining(g, o.id)} ${t('status.rest.unit')}`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              {!visibleOfficers.length && (
                <div className="roster-empty">{t('officer.empty')}</div>
              )}
              <div className="note-panel">
                <Flag />
                <p>{t('officer.note')}</p>
              </div>
            </section>
          )}
          {view === 'chronicle' && (
            <section className="chronicle-view">
              {g.logs.map((l) => (
                <div className={`chronicle-item ${l.kind}`} key={l.id}>
                  <span>
                    {t('turn.round')} {l.turn}
                  </span>
                  <i />
                  <p>{l.text}</p>
                </div>
              ))}
            </section>
          )}
          <div className="world-bottom">
            <div className="legend">
              {(['wei', 'shu', 'wu', 'qun'] as const).map((f) => (
                <span key={f}>
                  <i style={{ background: E.FACTIONS[f].color }} />
                  {factionName(f, lang)}
                  <b>{E.owned(g, f).length}</b>
                </span>
              ))}
            </div>
            <span className="map-note">{t('legend.map')}</span>
          </div>
        </main>
        <aside className="city-panel">
          <div className="city-panel-title">
            <span className="eyebrow">{t('city.intel')}</span>
            <span className={`ownership ${mine ? 'friendly' : ''}`}>
              {mine
                ? t('city.mine')
                : city.owner === 'qun'
                  ? t('city.contested')
                  : t('city.enemy')}
            </span>
          </div>
          <div className="city-name-row">
            <div>
              <h2>{cityName(city.id, city.name, lang)}</h2>
              <p>
                <Flag size={13} /> {factionName(city.owner, lang)}
                {city.occupation > 0 && (
                  <span className="occupation">
                    {lang === 'ar'
                      ? 'تهدئة · نصف إنتاج'
                      : lang === 'en'
                        ? 'Pacifying · half output'
                        : '安民中 · 产出减半'}
                  </span>
                )}
              </p>
            </div>
            <div
              className="city-emblem"
              style={{ color: E.FACTIONS[city.owner].color }}
            >
              <Castle size={36} />
            </div>
          </div>
          <div className="garrison">
            <div>
              <span>{t('city.garrison')}</span>
              <strong>
                {fmt(city.troops)}
                <small>{t('unit.soldier')}</small>
              </strong>
            </div>
            <Users />
          </div>
          <div className="city-stats">
            <Stat label={t('stat.morale')} value={city.morale} />
            <Stat label={t('stat.wall')} value={city.wall} />
            <div className="economy-row">
              <span>
                <Wheat />
                {t('stat.farm')} <b>Lv.{city.farm}</b>
              </span>
              <span>
                <Coins />
                {t('stat.market')} <b>Lv.{city.market}</b>
              </span>
            </div>
          </div>
          <div className="command-title">
            <h3>{mine ? t('cmd.title.mine') : t('cmd.title.enemy')}</h3>
            <span>{mine ? t('cmd.sub.mine') : t('cmd.sub.enemy')}</span>
          </div>
          {mine && (
            <div className="advisor-picker">
              <label htmlFor="administrator-select">{t('exec.officer')}</label>
              <Select
                value={administrator}
                onValueChange={(v) => setAdministrator(v || 'auto')}
              >
                <SelectTrigger
                  id="administrator-select"
                  className="game-select"
                >
                  <SelectValue>
                    {administrator === 'auto'
                      ? t('exec.auto')
                      : E.getOfficer(administrator)?.name || t('exec.choose')}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">{t('exec.auto')}</SelectItem>
                  {available.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      <Portrait officer={o} className="option-avatar" />
                      {o.name} · {t('stat.int')} {o.int}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {mine ? (
            <div className="actions">
              {(Object.keys(E.ACTIONS) as Action[]).map((type) => {
                const a = E.ACTIONS[type],
                  Icon = icons[type],
                  error = actionDisabled(type),
                  quote = E.actionQuote(
                    g,
                    type,
                    selected,
                    g.player,
                    administrator,
                  );
                const actionLabel =
                  type === 'farm'
                    ? t('action.farm')
                    : type === 'market'
                      ? t('action.market')
                      : type === 'recruit'
                        ? t('action.recruit')
                        : type === 'train'
                          ? t('action.train')
                          : t('action.wall');
                void a;
                return (
                  <button
                    className="action-button"
                    disabled={!!error}
                    title={
                      typeof error === 'string'
                        ? error
                        : `${actionLabel} · ${quote.officer?.name || t('action.wait')} · ${quote.discount}%`
                    }
                    key={type}
                    onClick={() =>
                      update(
                        (s) => E.act(s, type, selected, administrator),
                        `${quote.officer?.name}：${actionLabel}。`,
                      )
                    }
                  >
                    <span className="action-icon">
                      <Icon size={18} />
                    </span>
                    <span>
                      <strong>{actionLabel}</strong>
                      <small>
                        {quote.officer?.name || t('action.wait')} ·{' '}
                        {type === 'farm'
                          ? t('action.effect.farm')
                          : type === 'market'
                            ? t('action.effect.market')
                            : type === 'recruit'
                              ? t('action.effect.recruit')
                              : type === 'train'
                                ? t('action.effect.train')
                                : t('action.effect.wall')}
                      </small>
                    </span>
                    <span className="action-cost">
                      {quote.gold}
                      <Coins size={12} />
                    </span>
                  </button>
                );
              })}
              <button
                className="march-button"
                disabled={
                  g.ap < 1 ||
                  city.troops < 2000 ||
                  !available.length ||
                  g.status !== 'playing' ||
                  busy
                }
                onClick={() => openMarch()}
              >
                <Swords size={18} /> {t('btn.march')} <ArrowRight size={17} />
              </button>
            </div>
          ) : (
            <div className="enemy-actions">
              <p>{t('enemy.hint')}</p>
              {myCities
                .filter((c) => E.neighbors(c.id).includes(selected))
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      const destination = selected;
                      setSelected(c.id);
                      setTarget(destination);
                      const best = available
                        .slice()
                        .sort((a, b) => E.combatSkill(b) - E.combatSkill(a))[0];
                      setOfficer(best?.id || '');
                      setTroops(
                        Math.max(
                          1000,
                          Math.floor(((c.troops - 1000) * 0.8) / 1000) * 1000,
                        ),
                      );
                      setAttack(true);
                    }}
                  >
                    <Swords size={17} />
                    <span>
                      {t('enemy.from')}
                      {cityName(c.id, c.name, lang)}
                    </span>
                    <ChevronRight size={16} />
                  </button>
                ))}
              {!myCities.some((c) => E.neighbors(c.id).includes(selected)) && (
                <small>{t('enemy.none')}</small>
              )}
            </div>
          )}
          <div className="domination">
            <div>
              <span>{t('domination')}</span>
              <b>
                {myCities.length}
                <small> / 15 {t('domination.city')}</small>
              </b>
            </div>
            <div className="domination-track">
              <i style={{ width: `${(myCities.length / 15) * 100}%` }} />
            </div>
            <p>{t('domination.goal')}</p>
          </div>
        </aside>
      </div>
      <footer className="command-bar">
        <div className="date-block">
          <Sun />
          <div>
            <strong>{E.dateLabel(g.turn)}</strong>
            <span>
              {t('turn.round')} {g.turn}
            </span>
          </div>
        </div>
        <div className="latest-report">
          <span>
            <ScrollText size={14} /> {t('report')}
          </span>
          <p title={g.logs[0]?.text}>
            {g.logs.find((l) => l.kind === 'war')?.text || g.logs[0]?.text}
          </p>
        </div>
        <div className="ap-block">
          <span>
            {t('ap.left')}{' '}
            <b>
              {g.ap}
              <small> / {E.maxAP(g)}</small>
            </b>
          </span>
          <div>
            {Array.from({ length: E.maxAP(g) }, (_, i) => (
              <i key={i} className={i < g.ap ? 'filled' : ''} />
            ))}
          </div>
        </div>
        <button
          className="end-turn"
          disabled={busy || setup || g.status !== 'playing'}
          onClick={nextTurn}
        >
          <span>{busy ? t('btn.busy') : t('btn.end')}</span>
          <ChevronRight size={20} />
        </button>
      </footer>
      <div className="status-bar">
        <output aria-live="polite">{notice}</output>
        <span>
          <Check size={12} />
          {saving}
        </span>
      </div>
      <Dialog open={setup} onOpenChange={setSetup}>
        <DialogContent
          className="game-dialog setup-dialog"
          showCloseButton={false}
        >
          <div className="setup-top">
            <span className="eyebrow">{t('setup.eyebrow')}</span>
            <DialogTitle>{t('setup.title')}</DialogTitle>
            <DialogDescription>{t('setup.desc')}</DialogDescription>
          </div>
          <div className="faction-options">
            {E.PLAYABLE.map((f) => (
              <button
                key={f}
                className={f === faction ? 'chosen' : ''}
                style={{ '--faction': E.FACTIONS[f].color } as CSSProperties}
                onClick={() => setFaction(f)}
                aria-pressed={f === faction}
              >
                <Portrait
                  officer={E.FACTIONS[f].officers[0]}
                  className="faction-portrait"
                />
                <h3>
                  {factionName(f, lang)}
                  {lang === 'ar' && (
                    <small style={{ display: 'block', opacity: 0.75 }}>
                      {E.FACTIONS[f].name}
                    </small>
                  )}
                </h3>
                <small>{E.FACTIONS[f].title}</small>
                <p>{E.FACTIONS[f].desc}</p>
                <span className="faction-choice">
                  {f === faction ? (
                    <>
                      <Check size={14} />
                      {t('setup.chosen')}
                    </>
                  ) : (
                    t('setup.choose')
                  )}
                </span>
              </button>
            ))}
          </div>
          <button className="gold-button" onClick={start}>
            {t('setup.start')} <ArrowRight size={18} />
          </button>
          <p className="setup-footnote">{t('setup.footnote')}</p>
        </DialogContent>
      </Dialog>
      <Dialog open={attack} onOpenChange={setAttack}>
        <DialogContent className="game-dialog march-dialog">
          <DialogTitle>
            <Swords size={22} /> {t('march.title')}
          </DialogTitle>
          <DialogDescription>
            {t('march.desc.from')}
            {cityName(city.id, city.name, lang)}
            {t('march.desc.tail')}
          </DialogDescription>
          <label className="field-label" htmlFor="march-target">
            {t('march.target')}
          </label>
          <Select value={target} onValueChange={(v) => setTarget(v || '')}>
            <SelectTrigger id="march-target" className="game-select">
              <SelectValue>
                {targetCity
                  ? `${cityName(targetCity.id, targetCity.name, lang)} · ${targetCity.owner === g.player ? t('march.friendly') : factionName(targetCity.owner as 'wei' | 'shu' | 'wu' | 'qun', lang)} · ${fmt(targetCity.troops)}`
                  : t('march.target.choose')}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {targets.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {cityName(c.id, c.name, lang)} ·{' '}
                  {c.owner === g.player
                    ? t('march.friendly')
                    : factionName(c.owner as 'wei' | 'shu' | 'wu' | 'qun', lang)}{' '}
                  · {fmt(c.troops)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="field-label" htmlFor="march-officer">
            {t('march.officer')}
          </label>
          <Select value={officer} onValueChange={(v) => setOfficer(v || '')}>
            <SelectTrigger id="march-officer" className="game-select">
              <SelectValue>
                {available.find((o) => o.id === officer)?.name ||
                  t('march.nofficer')}
                {available.find((o) => o.id === officer)
                  ? ` · ${t('stat.command')} ${available.find((o) => o.id === officer)?.command}`
                  : ''}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {available.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  <Portrait officer={o} className="option-avatar" />
                  {o.name} · {t('stat.command')}
                  {o.command} {t('stat.war')}
                  {o.war} {t('stat.int')}
                  {o.int}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {chosenOfficer && (
            <div className="commander-summary">
              <Portrait officer={chosenOfficer} />
              <div>
                <b>{chosenOfficer.name}</b>
                <span>
                  {specialtyName(chosenOfficer.specialty, t)} ·{' '}
                  {chosenOfficer.role}
                </span>
                <small>
                  {t('detail.cap')} {fmt(E.leaderCapacity(chosenOfficer))} ·{' '}
                  {t('detail.save')} {Math.round(chosenOfficer.int * 0.2)}%
                </small>
              </div>
            </div>
          )}
          <div className="troop-picker">
            <span className="troop-label">{t('march.troops')}</span>
            <strong>
              {fmt(troops)}
              <small> {t('unit.soldier')}</small>
            </strong>
          </div>
          <Slider
            aria-label={t('march.troops')}
            value={[troops]}
            onValueChange={(v) => setTroops(Array.isArray(v) ? v[0] : v)}
            min={1000}
            max={marchLimit}
            step={500}
            disabled={city.troops < 2000}
          />
          <div className="slider-labels">
            <span>1,000</span>
            <span>
              {t('march.keep')} {fmt(city.troops - troops)}
            </span>
          </div>
          {targetCity && (
            <div
              className={`forecast ${targetCity.owner === g.player || forecast?.win ? 'favorable' : 'risky'}`}
            >
              <span>
                {targetCity.owner === g.player
                  ? t('march.friendly')
                  : forecast?.win
                    ? t('march.fav')
                    : t('march.risk')}
              </span>
              <strong>
                {targetCity.owner === g.player
                  ? t('march.join')
                  : forecast?.win
                    ? `${t('march.survive')} ${fmt(forecast.survivors)}`
                    : `${t('march.retreat')} ${fmt(forecast?.retreat || 0)}`}
              </strong>
              <small>
                {t('march.food')}{' '}
                {fmt(chosenOfficer ? E.marchFood(troops, chosenOfficer) : 0)} ·{' '}
                {t('march.ap')}
              </small>
              <p>{t('march.note')}</p>
            </div>
          )}
          <button
            className="gold-button"
            disabled={
              !!E.marchError(g, selected, target, troops, officer) || busy
            }
            onClick={() => {
              update(
                (s) => E.march(s, selected, target, troops, officer),
                t('march.confirm'),
              );
              setAttack(false);
            }}
          >
            {t('march.confirm')} <Flag size={17} />
          </button>
          {E.marchError(g, selected, target, troops, officer) && (
            <p className="form-error">
              {E.marchError(g, selected, target, troops, officer)}
            </p>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent className="game-dialog help-dialog">
          <DialogTitle>{t('help.title')}</DialogTitle>
          <DialogDescription>{t('help.desc')}</DialogDescription>
          <Tabs defaultValue="rules">
            <TabsList>
              <TabsTrigger value="rules">{t('help.tab.rules')}</TabsTrigger>
              <TabsTrigger value="saves">{t('help.tab.saves')}</TabsTrigger>
            </TabsList>
            <TabsContent value="rules">
              <ol className="rules">
                <li>
                  <b>{t('help.r1.t')}</b>
                  <p>{t('help.r1.d')}</p>
                </li>
                <li>
                  <b>{t('help.r2.t')}</b>
                  <p>{t('help.r2.d')}</p>
                </li>
                <li>
                  <b>{t('help.r3.t')}</b>
                  <p>{t('help.r3.d')}</p>
                </li>
                <li>
                  <b>{t('help.r4.t')}</b>
                  <p>{t('help.r4.d')}</p>
                </li>
              </ol>
              <p className="prototype-note">{t('help.proto')}</p>
            </TabsContent>
            <TabsContent value="saves">
              <div className="save-panel">
                <Save size={30} />
                <h3>{t('save.title')}</h3>
                <p>{t('save.desc')}</p>
                <button className="gold-button" onClick={exportSave}>
                  <Download size={17} />
                  {t('save.export')}
                </button>
                <button
                  className="outline-button"
                  onClick={() => imported.current?.click()}
                >
                  <Upload size={17} />
                  {t('save.import')}
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      >
        <DialogContent className="game-dialog officer-detail-dialog">
          {detail && (
            <>
              <div className="officer-detail-top">
                <Portrait officer={detail} />
                <div>
                  <span className="eyebrow">
                    {factionName(detail.faction, lang)} ·{' '}
                    {specialtyName(detail.specialty, t)}
                  </span>
                  <DialogTitle>{detail.name}</DialogTitle>
                  <DialogDescription>{detail.role}</DialogDescription>
                  <span className="detail-status">
                    {E.officerAvailable(g, detail.id)
                      ? t('status.ready')
                      : `${t('detail.rest.until')} ${g.officerReadyAt[detail.id] || g.turn + 1}`}
                  </span>
                </div>
              </div>
              <div className="detail-stats">
                {(
                  [
                    [t('stat.command'), detail.command],
                    [t('stat.war'), detail.war],
                    [t('stat.int'), detail.int],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                    <div>
                      <i style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="detail-benefits">
                <p>
                  <b>{t('detail.cap')}</b>
                  <span>
                    {fmt(E.leaderCapacity(detail))} {t('unit.soldier')}
                  </span>
                </p>
                <p>
                  <b>{t('detail.skill')}</b>
                  <span>{E.combatSkill(detail).toFixed(1)} / 99</span>
                </p>
                <p>
                  <b>{t('detail.save')}</b>
                  <span>{Math.round(detail.int * 0.2)}%</span>
                </p>
                <p>
                  <b>{t('detail.discount')}</b>
                  <span>
                    {Math.round(
                      Math.min(0.2, Math.max(0, detail.int - 50) * 0.004) * 100,
                    )}
                    %
                  </span>
                </p>
              </div>
              <p className="prototype-note">{t('detail.note')}</p>
            </>
          )}
        </DialogContent>
      </Dialog>
      <input
        type="file"
        accept=".json,application/json"
        hidden
        ref={imported}
        onChange={(event) => void importSave(event.target.files?.[0])}
      />
      <AlertDialog open={restart} onOpenChange={setRestart}>
        <AlertDialogContent className="game-dialog">
          <AlertDialogTitle>{t('restart.title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('restart.desc')}</AlertDialogDescription>
          <div className="confirm-buttons">
            <AlertDialogCancel>{t('restart.stay')}</AlertDialogCancel>
            <button
              className="gold-button"
              onClick={() => {
                setRestart(false);
                setSetup(true);
              }}
            >
              {t('restart.go')}
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={g.status !== 'playing' && !setup} onOpenChange={() => {}}>
        <DialogContent
          className="game-dialog result-dialog"
          showCloseButton={false}
        >
          <Flag size={44} />
          <DialogTitle>
            {g.status === 'won' ? t('result.win') : t('result.lose')}
          </DialogTitle>
          <DialogDescription>
            {g.status === 'won'
              ? `${factionName(g.player, lang)} · ${t('turn.round')} ${g.turn - 1}`
              : t('result.lose')}
          </DialogDescription>
          <button className="gold-button" onClick={() => setSetup(true)}>
            {t('result.again')} <ArrowRight size={18} />
          </button>
          <button className="outline-button" onClick={exportSave}>
            {t('result.export')}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-row">
      <span>{label}</span>
      <div>
        <i style={{ width: `${value}%` }} />
      </div>
      <b>
        {value}
        <small> / 100</small>
      </b>
    </div>
  );
}
