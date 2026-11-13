import { useState, useRef, useEffect } from 'react'
import {
  LayoutDashboard, FolderGit2, Compass, Users, Award, Settings, BookOpen, Plus, Bell, Search, Menu, Clock,
  WifiOff, Signal, Gauge, Check, LogOut, Languages, ShieldCheck, Lock, X,
} from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../nav'
import { Logo, Avatar, ago } from './ui'
import { USERS, PERSONAS, COHORTS } from '../data'
import { UI_LANGS } from '../i18n'

function useOutside(ref, cb) {
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && cb()
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [ref, cb])
}

export function Sidebar({ open, onClose }) {
  const { t, state, perm } = useStore()
  const { route, go } = useNav()
  const pendingReviews = state.contribs.filter((c) => c.status === 'pending' && perm(c.projectId) === 'owner').length
  const items = [
    ['dashboard', LayoutDashboard, t('nav.dashboard')],
    ['projects', FolderGit2, t('nav.projects'), pendingReviews],
    ['explore', Compass, t('nav.explore')],
    ['people', Users, t('nav.people')],
    ['profile', Award, t('nav.profile')],
  ]
  const second = [
    ['glossary', BookOpen, t('nav.glossary')],
    ['settings', Settings, t('nav.settings')],
  ]
  const active = route.name === 'project' ? 'projects' : route.name
  const click = (k) => { go(k); onClose() }
  return (
    <>
      {open && <div className="scrim mobile-only" style={{ zIndex: 65 }} onClick={onClose} />}
      <aside className={'rail' + (open ? ' open' : '')} aria-label="Navigation principale">
        <a className="brand" href="#dashboard" onClick={(e) => { e.preventDefault(); click('dashboard') }}>
          <Logo />
          <span className="col" style={{ gap: 0 }}>DEVEL line<small>Shippez ensemble</small></span>
        </a>
        <nav className="nav">
          {items.map(([k, Icon, label, count]) => (
            <button key={k} className={active === k ? 'on' : ''} onClick={() => click(k)} aria-current={active === k ? 'page' : undefined}>
              <Icon size={18} strokeWidth={1.8} />{label}{count > 0 && <span className="count">{count}</span>}
            </button>
          ))}
          <div className="nav-group">{t.x('Ressources', 'Resources')}</div>
          {second.map(([k, Icon, label]) => (
            <button key={k} className={active === k ? 'on' : ''} onClick={() => click(k)}>
              <Icon size={18} strokeWidth={1.8} />{label}
            </button>
          ))}
          <div style={{ marginTop: 'auto', padding: '18px 4px 4px' }}>
            <button className="btn primary" style={{ width: '100%', justifyContent: 'center', color: '#fff' }} onClick={() => click('new')}>
              <Plus size={17} />{t('nav.new')}
            </button>
          </div>
        </nav>
        <div className="rail-foot">
          <ShieldCheck size={15} /> <span>{t.x('Archives vérifiées, jamais exécutées', 'Archives checked, never executed')}</span>
        </div>
      </aside>
    </>
  )
}

function NotifText({ n }) {
  const { state, t } = useStore()
  const p = state.projects.find((x) => x.id === n.projectId)
  const from = USERS[n.from]?.name
  const c = state.contribs.find((x) => x.id === n.contribId)
  switch (n.kind) {
    case 'invite': return <>{t.x(<><b>{from}</b> vous invite sur <b>{p.name}</b> ({n.perm === 'contribute' ? 'contribuer' : 'consulter'})</>, <><b>{from}</b> invited you to <b>{p.name}</b> ({n.perm === 'contribute' ? 'contribute' : 'view'})</>)}</>
    case 'invite.accepted': return <>{t.x(<><b>{from}</b> a rejoint <b>{p.name}</b></>, <><b>{from}</b> joined <b>{p.name}</b></>)}</>
    case 'invite.declined': return <>{t.x(<><b>{from}</b> a refusé l’invitation</>, <><b>{from}</b> declined the invitation</>)}</>
    case 'contrib': return <>{t.x(<>Nouvelle contribution de <b>{from}</b> : {c?.title}</>, <>New contribution from <b>{from}</b>: {c?.title}</>)}</>
    case 'contrib.accepted': return <>{t.x(<>Votre contribution « {c?.title} » est acceptée, version {c?.resultVersion}</>, <>Your contribution “{c?.title}” was accepted, version {c?.resultVersion}</>)}</>
    case 'contrib.rejected': return <>{t.x(<>Votre contribution « {c?.title} » a été rejetée</>, <>Your contribution “{c?.title}” was rejected</>)}</>
    case 'join': return <>{t.x(<><b>{from}</b> demande à collaborer sur <b>{p.name}</b></>, <><b>{from}</b> asks to collaborate on <b>{p.name}</b></>)}</>
    default: return null
  }
}

export function Topbar({ onMenu }) {
  const { t, state, dispatch, me, toast } = useStore()
  const { go } = useNav()
  const [pop, setPop] = useState(null)
  const [online, setOnline] = useState(true)
  const ref = useRef(null)
  useOutside(ref, () => setPop(null))
  const mine = state.notifs.filter((n) => n.to === state.userId)
  const unread = mine.filter((n) => !n.read).length
  const cohort = COHORTS.nov26

  const openNotif = (n) => {
    setPop(null)
    if (n.kind === 'contrib' || n.kind === 'contrib.accepted' || n.kind === 'contrib.rejected') go('project', { id: n.projectId, tab: 'contribs', contrib: n.contribId })
    else go('project', { id: n.projectId, tab: n.kind === 'join' ? 'members' : 'overview' })
  }

  return (
    <header className="topbar" ref={ref}>
      <button className="icon-btn mobile-only" onClick={onMenu} aria-label="Menu"><Menu size={18} /></button>
      <div className="cohort-pill">
        <Clock size={15} />
        <span><b>{t('d.week')} {cohort.current}/{cohort.weeks}</b> <span className="long">{t.x('de la cohorte Novembre, démo publique le 18 déc.', 'of the November cohort, public demo on Dec 18')}</span></span>
      </div>
      <label className="search">
        <Search size={16} />
        <input placeholder={t('top.search')} onKeyDown={(e) => e.key === 'Enter' && go('explore', { q: e.currentTarget.value })} />
      </label>
      <div className="top-actions">
        <button className={'icon-btn' + (!online ? ' on' : '')} title={online ? t('top.online') : t('top.offline')} aria-label={online ? t('top.online') : t('top.offline')}
          onClick={() => { setOnline(!online); toast(online ? t('top.offline') : t('top.online')) }}>
          {online ? <Signal size={17} /> : <WifiOff size={17} />}
        </button>
        <button className={'icon-btn' + (state.lowData ? ' on' : '')} title={t('top.lowData')} aria-pressed={state.lowData}
          onClick={() => { dispatch({ type: 'lowData' }); toast(state.lowData ? t.x('Mode éco-données désactivé', 'Data saver off') : t.x('Mode éco-données activé : animations et médias réduits', 'Data saver on: fewer animations and media')) }}>
          <Gauge size={17} />
        </button>
        <div className="rel">
          <button className="icon-btn" onClick={() => setPop(pop === 'lang' ? null : 'lang')} aria-label="Langue" style={{ width: 'auto', padding: '0 10px', gap: 6, display: 'flex' }}>
            <Languages size={17} /><span className="small" style={{ fontWeight: 600 }}>{UI_LANGS.find((l) => l.code === state.lang).short}</span>
          </button>
          {pop === 'lang' && (
            <div className="popover" style={{ width: 240 }}>
              <div className="popover-h">{t.x('Langue de l’interface', 'Interface language')}</div>
              {UI_LANGS.map((l) => (
                <button key={l.code} className={'item' + (l.code === state.lang ? ' on' : '')} onClick={() => { dispatch({ type: 'lang', lang: l.code }); setPop(null) }}>
                  <span className="grow">{l.label}</span>{l.code === state.lang && <Check size={16} color="var(--cobalt)" />}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="rel">
          <button className="icon-btn" aria-label={t('top.notifications')} onClick={() => { setPop(pop === 'notif' ? null : 'notif') }}>
            <Bell size={17} />{unread > 0 && <span className="dot" />}
          </button>
          {pop === 'notif' && (
            <div className="popover">
              <div className="popover-h">{t('top.notifications')}{unread > 0 && <button className="linkish" onClick={() => dispatch({ type: 'notif.read' })}>{t.x('Tout marquer lu', 'Mark all read')}</button>}</div>
              {mine.length === 0 && <p className="muted small" style={{ padding: 16 }}>{t.x('Rien de nouveau pour l’instant.', 'Nothing new yet.')}</p>}
              {mine.slice(0, 6).map((n) => (
                <button key={n.id} className="item" onClick={() => openNotif(n)} style={{ alignItems: 'flex-start' }}>
                  <Avatar id={n.from} size="sm" />
                  <span className="grow small"><NotifText n={n} /><span className="tiny muted" style={{ display: 'block', marginTop: 2 }}>{ago(n.at, state.lang)}</span></span>
                  {!n.read && <span className="pip" style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--cobalt)', marginTop: 6 }} />}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="rel">
          <button className="icon-btn" style={{ width: 'auto', padding: '0 6px 0 4px', gap: 8, display: 'flex' }} onClick={() => setPop(pop === 'me' ? null : 'me')} aria-label={t('top.switch')}>
            <Avatar id={me.id} size="sm" /><span className="small" style={{ fontWeight: 600, paddingInlineEnd: 6 }}>{me.name.split(' ')[0]}</span>
          </button>
          {pop === 'me' && (
            <div className="popover" style={{ width: 300 }}>
              <div className="popover-h">{t('top.switch')}<span className="muted tiny">{t.x('Démo jury', 'Jury demo')}</span></div>
              {PERSONAS.map((p) => (
                <button key={p.id} className={'item' + (p.id === me.id ? ' on' : '')} onClick={() => { dispatch({ type: 'login', userId: p.id }); setPop(null); toast(t.x(`Connecté en tant que ${USERS[p.id].name}`, `Signed in as ${USERS[p.id].name}`)) }}>
                  <Avatar id={p.id} showCountry />
                  <span className="grow"><b className="small">{USERS[p.id].name}</b><span className="tiny muted" style={{ display: 'block' }}>{p.role}</span></span>
                  {p.id === me.id && <Check size={16} color="var(--cobalt)" />}
                </button>
              ))}
              <button className="item" style={{ borderTop: '1px solid var(--line)' }} onClick={() => { dispatch({ type: 'logout' }); go('landing') }}>
                <LogOut size={16} /><span className="small">{t('top.logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  const { t } = useStore()
  return (
    <footer className="footer">
      <span>© 2026 DEVEL line, {t.x('pour les devs africains, par les devs africains', 'for African devs, by African devs')}</span>
      <span className="row">
        <span className="row" style={{ gap: 6 }}><Check size={14} />{t.x('Archives sans exécution', 'No-execution archives')}</span>
        <span className="row" style={{ gap: 6 }}><Check size={14} />{t.x('Historique restaurable', 'Restorable history')}</span>
        <span className="row" style={{ gap: 6 }}><Lock size={14} />{t.x('Permissions vérifiées côté serveur', 'Server-side permissions')}</span>
      </span>
    </footer>
  )
}

export { X }
