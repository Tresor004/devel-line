import { useState } from 'react'
import { Award, GitBranch, Check, Copy, Users, MapPin, Clock, Languages, RotateCcw, BookOpen, Bell, Gauge, Type } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../nav'
import { Avatar, ago, tzLabel, Empty } from '../components/ui'
import { USERS, LANG_NAMES, GLOSSARY } from '../data'
import { UI_LANGS } from '../i18n'
import { diffStats } from '../engine'

export function Profile() {
  const { t, state, me, perm, toast } = useStore()
  const { go } = useNav()
  const x = t.x
  const accepted = state.contribs.filter((c) => c.authorId === me.id && c.status === 'accepted')
  const owned = state.projects.filter((p) => perm(p.id) === 'owner')
  const joined = state.projects.filter((p) => perm(p.id) && perm(p.id) !== 'owner')
  const versionsAuthored = Object.entries(state.versions).flatMap(([pid, vs]) => vs.filter((v) => v.authorId === me.id).map((v) => ({ ...v, pid })))
  const lines = accepted.reduce((s, c) => s + (c.changes ? diffStats(c.changes).add : 0), 0)
  const copy = async () => {
    try { await navigator.clipboard.writeText(`https://devel-line.africa/@${me.handle}`); toast(x('Lien du profil copié', 'Profile link copied'), 'ok') } catch { toast(`devel-line.africa/@${me.handle}`) }
  }
  return (
    <>
      <div className="grid g-main" style={{ marginBottom: 22 }}>
        <div className="panel" style={{ padding: 26 }}>
          <div className="row" style={{ gap: 18, alignItems: 'flex-start' }}>
            <Avatar id={me.id} size="lg" showCountry />
            <div className="grow">
              <h1 style={{ fontSize: 26 }}>{me.name}</h1>
              <p className="muted">{me.title}, <span className="mono small">@{me.handle}</span></p>
              <div className="row wrap small" style={{ gap: 16, marginTop: 10, color: 'var(--ink-2)' }}>
                <span className="row" style={{ gap: 6 }}><MapPin size={14} />{me.city ? `${me.city}, ` : ''}{me.countryName}</span>
                <span className="row" style={{ gap: 6 }}><Clock size={14} />{tzLabel(me.tz)}</span>
                <span className="row" style={{ gap: 6 }}><Languages size={14} />{me.langs.map((l) => LANG_NAMES[l]).join(', ')}</span>
              </div>
              {me.bio && <p style={{ marginTop: 14, maxWidth: '60ch', color: 'var(--ink-2)' }}>{me.bio}</p>}
              <div className="row wrap" style={{ gap: 6, marginTop: 14 }}>{me.skills.map((s) => <span key={s} className="tag">{s}</span>)}<span className="badge blue">{me.level}</span></div>
            </div>
            <button className="btn ghost sm" onClick={copy}><Copy size={14} />{x('Partager', 'Share')}</button>
          </div>
        </div>
        <div className="navy-panel">
          <div className="stat"><div><div className="stat-l">{x('Contributions acceptées', 'Accepted contributions')}</div><div className="stat-v">{accepted.length}<small>{x(`, ${lines} lignes ajoutées`, `, ${lines} lines added`)}</small></div></div><span className="chip light"><Check size={16} /></span></div>
          <div className="stat"><div><div className="stat-l">{x('Versions signées', 'Versions authored')}</div><div className="stat-v">{versionsAuthored.length}</div></div><span className="chip"><GitBranch size={16} /></span></div>
          <div className="stat"><div><div className="stat-l">{x('Projets', 'Projects')}</div><div className="stat-v">{owned.length + joined.length}<small>{x(`dont ${owned.length} en propriété`, `${owned.length} owned`)}</small></div></div><span className="chip"><Users size={16} /></span></div>
        </div>
      </div>

      <div className="grid g-2">
        <section className="panel">
          <div className="panel-h"><h3>{x('Preuves vérifiables', 'Verifiable proof')}</h3><span className="tiny muted">{x('Chaque ligne renvoie à une version réelle', 'Each line links to a real version')}</span></div>
          {accepted.length === 0 && versionsAuthored.length === 0 ? (
            <Empty icon={<Award size={26} />} title={x('Votre première preuve vous attend', 'Your first proof is waiting')} action={<button className="btn ghost sm" onClick={() => go('explore')}>{t('nav.explore')}</button>}>{x('Une contribution acceptée apparaît ici avec le projet, la version créée et le nom de la personne qui l’a validée.', 'An accepted contribution shows up here with the project, the version it created and who approved it.')}</Empty>
          ) : (
            <div className="vline" style={{ padding: '10px 22px 10px 56px' }}>
              {versionsAuthored.slice().reverse().map((v) => {
                const p = state.projects.find((pp) => pp.id === v.pid)
                return (
                  <div key={v.pid + v.n} className="vnode">
                    <span className="knob"><Check size={11} strokeWidth={3} /></span>
                    <button className="vcard" style={{ width: '100%', textAlign: 'start', cursor: 'pointer' }} onClick={() => go('project', { id: v.pid, tab: 'versions' })}>
                      <div className="row sp"><b>{p.name} <span className="mono muted">v{v.n}</span></b><span className="tiny muted">{ago(v.at, state.lang)}</span></div>
                      <p className="small" style={{ marginTop: 4 }}>{v.message}</p>
                      {v.approvedBy && <p className="tiny muted" style={{ marginTop: 4 }}>{x(`Validée par ${USERS[v.approvedBy].name}`, `Approved by ${USERS[v.approvedBy].name}`)}</p>}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>
        <section className="panel">
          <div className="panel-h"><h3>{x('Cohortes', 'Cohorts')}</h3></div>
          <div className="panel-b col" style={{ gap: 14 }}>
            <div className="row sp"><div><b>{x('Cohorte Novembre 2026', 'November 2026 cohort')}</b><p className="small muted">{x('En cours, semaine 4 sur 6', 'In progress, week 4 of 6')}</p></div><span className="badge blue">{x('En cours', 'Active')}</span></div>
            <div className="progress"><i style={{ width: '66%' }} /></div>
            <p className="small muted">{x('Présence aux points hebdomadaires : 4 sur 4. La démo publique ajoutera un badge vérifié à ce profil.', 'Weekly check-in attendance: 4 of 4. The public demo will add a verified badge to this profile.')}</p>
          </div>
        </section>
      </div>
    </>
  )
}

function Toggle({ on, onChange, label, hint, icon }) {
  return (
    <div className="row" style={{ gap: 14, padding: '16px 0', borderTop: '1px solid var(--line)', alignItems: 'flex-start' }}>
      <span style={{ color: 'var(--cobalt)', marginTop: 2 }}>{icon}</span>
      <div className="grow"><b className="small" style={{ fontWeight: 600 }}>{label}</b>{hint && <p className="small muted">{hint}</p>}</div>
      <button role="switch" aria-checked={on} aria-label={label} onClick={onChange} style={{ width: 44, height: 26, borderRadius: 13, border: 0, background: on ? 'var(--cobalt)' : 'var(--line-strong)', position: 'relative', cursor: 'pointer', flex: 'none' }}>
        <span style={{ position: 'absolute', top: 3, insetInlineStart: on ? 21 : 3, width: 20, height: 20, borderRadius: 10, background: '#fff', transition: 'inset-inline-start .15s', boxShadow: '0 1px 2px rgba(0,0,0,.2)' }} />
      </button>
    </div>
  )
}

export function Settings() {
  const { t, state, dispatch, toast, me } = useStore()
  const x = t.x
  const [prefs, setPrefs] = useState({ autoTr: true, keepTerms: true, sms: true, whatsapp: false, digest: true, offline: true, large: false })
  const tg = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }))
  return (
    <>
      <div className="page-h"><div><h1>{t('nav.settings')}</h1><p className="sub">{x('Langue, connexion et notifications.', 'Language, connectivity and notifications.')}</p></div></div>
      <div className="grid g-2" style={{ alignItems: 'start' }}>
        <section className="panel">
          <div className="panel-h"><h3>{x('Langue et traduction', 'Language and translation')}</h3></div>
          <div className="panel-b" style={{ paddingTop: 10 }}>
            <div className="field" style={{ paddingBottom: 16 }}>
              <label>{x('Langue de l’interface', 'Interface language')}</label>
              <div className="chipsel">{UI_LANGS.map((l) => <button key={l.code} className={state.lang === l.code ? 'on' : ''} onClick={() => dispatch({ type: 'lang', lang: l.code })}>{l.label}</button>)}</div>
              <span className="hint">{x('L’arabe s’affiche de droite à gauche.', 'Arabic is displayed right to left.')}</span>
            </div>
            <Toggle icon={<Languages size={18} />} on={prefs.autoTr} onChange={() => tg('autoTr')} label={x('Traduire automatiquement les échanges', 'Auto-translate conversations')} hint={x('Messages, résumés de contribution et retours de revue.', 'Messages, contribution summaries and review feedback.')} />
            <Toggle icon={<BookOpen size={18} />} on={prefs.keepTerms} onChange={() => tg('keepTerms')} label={x('Conserver les termes techniques', 'Keep technical terms')} hint={x('« diff », « commit » ou « API » ne sont pas traduits.', '“diff”, “commit” or “API” are not translated.')} />
            <div className="field" style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
              <label>{x('Langues que je comprends', 'Languages I understand')}</label>
              <p className="small">{me.langs.map((l) => LANG_NAMES[l]).join(', ')}</p>
              <span className="hint">{x('Les messages dans ces langues ne sont pas traduits.', 'Messages in these languages are not translated.')}</span>
            </div>
          </div>
        </section>
        <section className="panel">
          <div className="panel-h"><h3>{x('Connexion et accessibilité', 'Connectivity and accessibility')}</h3></div>
          <div className="panel-b" style={{ paddingTop: 0 }}>
            <Toggle icon={<Gauge size={18} />} on={state.lowData} onChange={() => dispatch({ type: 'lowData' })} label={t('top.lowData')} hint={x('Pas d’animations ni d’images, archives compressées au maximum.', 'No animations or images, maximum archive compression.')} />
            <Toggle icon={<Clock size={18} />} on={prefs.offline} onChange={() => tg('offline')} label={x('Brouillons hors ligne', 'Offline drafts')} hint={x('Vos messages et retours sont gardés si la connexion coupe, puis envoyés au retour du réseau.', 'Messages and feedback are kept if the connection drops, then sent when it returns.')} />
            <Toggle icon={<Type size={18} />} on={prefs.large} onChange={() => { tg('large'); document.documentElement.style.fontSize = prefs.large ? '' : '112%'; document.body.style.fontSize = prefs.large ? '' : '16px' }} label={x('Texte agrandi', 'Larger text')} />
          </div>
        </section>
        <section className="panel">
          <div className="panel-h"><h3>Notifications</h3></div>
          <div className="panel-b" style={{ paddingTop: 0 }}>
            <Toggle icon={<Bell size={18} />} on={prefs.sms} onChange={() => tg('sms')} label={x('SMS pour les décisions importantes', 'SMS for key decisions')} hint={x('Invitation reçue, contribution acceptée ou rejetée. Fonctionne sans données mobiles.', 'Invitation received, contribution accepted or rejected. Works without mobile data.')} />
            <Toggle icon={<Bell size={18} />} on={prefs.whatsapp} onChange={() => tg('whatsapp')} label="WhatsApp" hint={x('Résumé quotidien de l’activité de vos projets.', 'Daily summary of your projects’ activity.')} />
            <Toggle icon={<Bell size={18} />} on={prefs.digest} onChange={() => tg('digest')} label={x('E-mail hebdomadaire de cohorte', 'Weekly cohort email')} />
          </div>
        </section>
        <section className="panel">
          <div className="panel-h"><h3>{x('Démonstration', 'Demo')}</h3></div>
          <div className="panel-b col" style={{ gap: 12 }}>
            <p className="small muted">{x('Remet les données de démonstration à leur état initial pour rejouer le parcours devant le jury.', 'Reset demo data to its initial state to replay the flow for the jury.')}</p>
            <button className="btn ghost" style={{ alignSelf: 'flex-start' }} onClick={() => { dispatch({ type: 'reset' }); toast(x('Démo réinitialisée', 'Demo reset'), 'ok') }}><RotateCcw size={15} />{x('Réinitialiser la démo', 'Reset demo')}</button>
          </div>
        </section>
      </div>
    </>
  )
}

export function Glossary() {
  const { t, state } = useStore()
  const x = t.x
  const [l2, setL2] = useState(state.lang === 'fr' ? 'sw' : 'fr')
  const l1 = state.lang
  return (
    <>
      <div className="page-h">
        <div><h1>{t('nav.glossary')}</h1><p className="sub">{x('Les mots de DEVEL line expliqués simplement, pour parler le même langage technique.', 'DEVEL line terms explained simply, so everyone shares the same technical vocabulary.')}</p></div>
        <label className="row small" style={{ gap: 8 }}>{x('Comparer avec', 'Compare with')}
          <select className="select" style={{ width: 'auto' }} value={l2} onChange={(e) => setL2(e.target.value)}>{UI_LANGS.filter((l) => l.code !== l1).map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}</select>
        </label>
      </div>
      <div className="panel" style={{ overflowX: 'auto' }}>
        <table className="table responsive">
          <thead><tr><th>{x('Terme', 'Term')}</th><th>{UI_LANGS.find((l) => l.code === l1).label}</th><th>{UI_LANGS.find((l) => l.code === l2).label}</th></tr></thead>
          <tbody>
            {GLOSSARY.map((g) => (
              <tr key={g.term}>
                <td className="full"><b>{g.term}</b></td>
                <td className="full" dir={l1 === 'ar' ? 'rtl' : 'ltr'}>{g[l1]}</td>
                <td className="full muted" dir={l2 === 'ar' ? 'rtl' : 'ltr'}>{g[l2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
