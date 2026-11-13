import { useState, useMemo, useEffect } from 'react'
import { ArrowLeft, Upload, FileArchive, Check, X, Lock, Languages, ShieldCheck, AlertTriangle, ChevronDown, ChevronRight, GitBranch, Inbox } from 'lucide-react'
import { useStore } from '../../store'
import { useNav } from '../../nav'
import { Avatar, StatusBadge, ago, Empty } from '../../components/ui'
import { USERS, LANG_NAMES } from '../../data'
import { lineDiff, diffStats } from '../../engine'
import { CheckList } from './SubmitModal'

const FEEDBACK = [
  {
    reject: true,
    fr: 'Merci ! Évitez la conversion manuelle en euros et utilisez Intl.NumberFormat avec XOF. Pensez aussi aux textes traduits (i18n).',
    en: 'Thanks! Avoid the manual euro conversion and use Intl.NumberFormat with XOF. Please also use the translated labels (i18n).',
  },
  { reject: false, fr: 'Parfait, propre et bien décrit. Merci pour la suppression de l’ancienne API.', en: 'Perfect, clean and well described. Thanks for removing the legacy API.' },
]

export function useCText() {
  const { state } = useStore()
  return (c) => {
    const lang = state.lang
    if (c.tr && c.lang !== lang) {
      const tt = c.tr[lang] ?? (lang !== 'fr' ? c.tr.en : null)
      if (tt) return { title: tt.title, summary: tt.summary, from: c.lang }
    }
    return { title: c.title, summary: c.summary, from: null }
  }
}

export default function Contribs({ p, onSubmit }) {
  const { t, state, perm } = useStore()
  const { route } = useNav()
  const x = t.x
  const [sel, setSel] = useState(route.params.contrib ?? null)
  useEffect(() => { setSel(route.params.contrib ?? null) }, [route.params.contrib])
  const my = perm(p.id)
  const ct = useCText()
  const list = state.contribs.filter((c) => c.projectId === p.id)
  const c = list.find((cc) => cc.id === sel)

  if (!my) return <div className="lock"><span className="ic"><Lock size={30} /></span><h2>{x('Contributions réservées aux membres', 'Contributions are for members only')}</h2><code className="tiny muted">403 contributions.list denied</code></div>
  if (c) return <Review c={c} p={p} onBack={() => setSel(null)} />

  return (
    <div className="col" style={{ gap: 18 }}>
      <div className="row sp wrap">
        <p className="small muted" style={{ maxWidth: '62ch' }}>{x('Chaque proposition est vérifiée puis comparée à sa version de base. Rien ne change dans la version officielle tant que le propriétaire n’a pas accepté.', 'Every proposal is checked, then compared with its base version. Nothing changes in the official version until the owner accepts.')}</p>
        {my === 'contribute' && <button className="btn primary sm" onClick={onSubmit}><Upload size={15} />{t('a.submit')}</button>}
      </div>
      {list.length === 0 ? <Empty icon={<Inbox size={26} />} title={x('Aucune contribution', 'No contributions yet')}>{x('Les propositions de l’équipe apparaîtront ici.', 'Team proposals will appear here.')}</Empty> : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table responsive">
            <thead><tr><th>{x('Proposition', 'Proposal')}</th><th>{x('Auteur', 'Author')}</th><th>{x('Base', 'Base')}</th><th>{x('Changements', 'Changes')}</th><th>{x('Statut', 'Status')}</th><th /></tr></thead>
            <tbody>
              {list.map((cc) => {
                const tx = ct(cc)
                const st = cc.changes ? diffStats(cc.changes) : null
                return (
                  <tr key={cc.id} style={{ cursor: 'pointer' }} onClick={() => setSel(cc.id)}>
                    <td className="full"><b>{tx.title}</b><span className="tiny muted mono" style={{ display: 'block' }}>{cc.archiveName}</span></td>
                    <td data-l={x('Auteur', 'Author')}><span className="row" style={{ gap: 8 }}><Avatar id={cc.authorId} size="sm" /><span className="small">{USERS[cc.authorId].name.split(' ')[0]}</span></span></td>
                    <td data-l={x('Base', 'Base')} className="mono small">v{cc.baseVersion}</td>
                    <td data-l={x('Changements', 'Changes')}>{st ? <span><span className="plus">+{st.add}</span> <span className="minus">−{st.del}</span></span> : <span className="muted small">—</span>}</td>
                    <td data-l={x('Statut', 'Status')}><StatusBadge status={cc.status} /></td>
                    <td className="small muted" style={{ textAlign: 'end', whiteSpace: 'nowrap' }}>{ago(cc.createdAt, state.lang)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Diff({ change }) {
  const { t } = useStore()
  const lines = useMemo(() => lineDiff(change.before, change.after), [change])
  // n'affiche que 3 lignes de contexte autour des changements
  const near = new Set()
  lines.forEach((l, i) => { if (l.t !== 'same') for (let k = i - 3; k <= i + 3; k++) near.add(k) })
  const rows = []
  let skipped = 0
  lines.forEach((l, i) => {
    if (near.has(i) || lines.length <= 12) { if (skipped) { rows.push({ fold: skipped }); skipped = 0 } rows.push({ l }) }
    else skipped++
  })
  if (skipped) rows.push({ fold: skipped })
  return (
    <div className="code"><table><tbody>
      {rows.map((r, i) => r.fold ? (
        <tr key={i} className="fold"><td colSpan={4}>{t.x(`${r.fold} lignes inchangées`, `${r.fold} unchanged lines`)}</td></tr>
      ) : (
        <tr key={i} className={r.l.t === 'add' ? 'add' : r.l.t === 'del' ? 'del' : ''}>
          <td className="ln">{r.l.a ?? ''}</td><td className="ln">{r.l.b ?? ''}</td>
          <td className="sig">{r.l.t === 'add' ? '+' : r.l.t === 'del' ? '−' : ' '}</td><td>{r.l.text || ' '}</td>
        </tr>
      ))}
    </tbody></table></div>
  )
}

function Review({ c, p, onBack }) {
  const { t, state, perm, dispatch, toast } = useStore()
  const x = t.x
  const ct = useCText()
  const tx = ct(c)
  const [showOrig, setShowOrig] = useState(false)
  const [file, setFile] = useState(c.changes?.[0]?.path)
  const [note, setNote] = useState('')
  const [noteTr, setNoteTr] = useState(null)
  const [showChecks, setShowChecks] = useState(c.status === 'blocked')
  const owner = perm(p.id) === 'owner'
  const versions = state.versions[p.id]
  const cur = versions.at(-1)
  const ch = c.changes?.find((cc) => cc.path === file)
  const author = USERS[c.authorId]
  useEffect(() => { if (owner && c.changes) dispatch({ type: 'demoFlag', key: 'reviewed' }) }, [owner, c.id]) // eslint-disable-line
  const decisionTr = c.decisionTr && c.decisionTr[state.lang] && c.decisionLang !== state.lang ? c.decisionTr[state.lang] : null

  const decide = (accept) => {
    if (!accept && !note.trim()) { toast(x('Expliquez pourquoi vous rejetez, cela aide le contributeur à progresser.', 'Explain why you reject, it helps the contributor improve.'), 'bad'); return }
    dispatch({ type: 'contrib.decide', contribId: c.id, accept, note, noteTr, noteLang: state.lang })
    toast(accept ? x(`Contribution acceptée, version ${cur.n + 1} créée`, `Contribution accepted, version ${cur.n + 1} created`) : x('Contribution rejetée, la version officielle reste inchangée', 'Contribution rejected, the official version is unchanged'), accept ? 'ok' : 'info')
  }

  return (
    <div className="col" style={{ gap: 20 }}>
      <button className="btn quiet sm" style={{ alignSelf: 'flex-start', paddingInline: 6 }} onClick={onBack}><ArrowLeft size={15} className="flip" />{t('tab.contribs')}</button>
      <div className="row sp wrap" style={{ alignItems: 'flex-start', gap: 16 }}>
        <div className="grow" style={{ minWidth: 260 }}>
          <div className="row wrap" style={{ gap: 10 }}><h2>{showOrig ? c.title : tx.title}</h2><StatusBadge status={c.status} /></div>
          <div className="row wrap small muted" style={{ gap: 10, marginTop: 8 }}>
            <span className="row" style={{ gap: 6 }}><Avatar id={c.authorId} size="sm" showCountry />{author.name}, {author.city}</span>
            <span className="mono">{c.archiveName}</span>
            <span>{x(`basée sur la v${c.baseVersion}`, `based on v${c.baseVersion}`)}</span>
            <span>{ago(c.createdAt, state.lang)}</span>
          </div>
        </div>
      </div>

      <div className="note" style={{ background: 'var(--paper)' }}>
        <Languages size={17} />
        <div className="grow">
          {tx.from && (
            <div className="row" style={{ gap: 8, marginBottom: 6 }}>
              <span className="tr-tag">{showOrig ? LANG_NAMES[c.lang] : `${t('tr.from')} ${LANG_NAMES[tx.from]}`}</span>
              <button className="linkish" onClick={() => setShowOrig(!showOrig)}>{showOrig ? t('tr.translation') : t('tr.original')}</button>
            </div>
          )}
          <p style={{ color: 'var(--ink)' }}>{(showOrig ? c.summary : tx.summary) || <span className="muted">{x('Pas de description.', 'No description.')}</span>}</p>
          {!tx.from && c.lang !== state.lang && <p className="tiny muted" style={{ marginTop: 6 }}>{x('Traduction automatique en attente (simulée dans la maquette).', 'Automatic translation pending (simulated in this mockup).')}</p>}
        </div>
      </div>

      {c.status !== 'blocked' && c.baseVersion !== cur.n && c.status === 'pending' && (
        <div className="note warn"><AlertTriangle size={17} /><span>{x(`Cette proposition part de la v${c.baseVersion}, la version courante est la v${cur.n}. Ses changements seront appliqués sur la v${cur.n} : vérifiez qu’ils restent cohérents.`, `This proposal starts from v${c.baseVersion}, the current version is v${cur.n}. Its changes will be applied on v${cur.n}: check that they still make sense.`)}</span></div>
      )}

      {c.status === 'blocked' ? (
        <div className="col" style={{ gap: 14 }}>
          <div className="note bad"><X size={17} /><span>{x('Cette archive a été refusée par la validation de sécurité. Elle n’a jamais été extraite ni proposée au propriétaire.', 'This archive was refused by the safety checks. It was never extracted or offered to the owner.')}</span></div>
          <CheckList checks={c.checks} />
        </div>
      ) : c.changes && (
        <>
          <div className="grid" style={{ gridTemplateColumns: 'minmax(220px, 290px) minmax(0, 1fr)', gap: 20 }}>
            <div className="col" style={{ gap: 6 }}>
              <div className="row sp" style={{ padding: '0 4px 6px' }}><b className="small">{x(`${c.changes.length} fichier(s)`, `${c.changes.length} file(s)`)}</b>{(() => { const s = diffStats(c.changes); return <span><span className="plus">+{s.add}</span> <span className="minus">−{s.del}</span></span> })()}</div>
              {c.changes.map((cc) => {
                const s = diffStats([cc])
                return (
                  <button key={cc.path} className={'chg' + (file === cc.path ? ' on' : '')} onClick={() => setFile(cc.path)}>
                    <span className={'k ' + cc.type}>{cc.type === 'added' ? 'A' : cc.type === 'deleted' ? 'D' : 'M'}</span>
                    <span className="grow mono small ellipsis" style={{ direction: 'ltr', textAlign: 'start' }}>{cc.path}</span>
                    <span className="tiny"><span className="plus">+{s.add}</span> <span className="minus">−{s.del}</span></span>
                  </button>
                )
              })}
              <div className="row tiny muted" style={{ gap: 12, padding: '10px 4px' }}>
                <span className="row" style={{ gap: 4 }}><span className="k added" style={{ width: 16, height: 16, borderRadius: 4, display: 'grid', placeItems: 'center', fontSize: 10 }}>A</span>{x('ajouté', 'added')}</span>
                <span className="row" style={{ gap: 4 }}><span className="k modified" style={{ width: 16, height: 16, borderRadius: 4, display: 'grid', placeItems: 'center', fontSize: 10 }}>M</span>{x('modifié', 'modified')}</span>
                <span className="row" style={{ gap: 4 }}><span className="k deleted" style={{ width: 16, height: 16, borderRadius: 4, display: 'grid', placeItems: 'center', fontSize: 10 }}>D</span>{x('supprimé', 'deleted')}</span>
              </div>
            </div>
            <div className="col" style={{ gap: 10, minWidth: 0 }}>
              {ch && <><div className="row sp"><b className="mono small ellipsis">{ch.path}</b><span className={'badge ' + (ch.type === 'added' ? 'ok' : ch.type === 'deleted' ? 'bad' : 'blue')}>{ch.type === 'added' ? x('Ajouté', 'Added') : ch.type === 'deleted' ? x('Supprimé', 'Deleted') : x('Modifié', 'Modified')}</span></div><Diff change={ch} /></>}
            </div>
          </div>

          <button className="btn quiet sm" style={{ alignSelf: 'flex-start' }} onClick={() => setShowChecks(!showChecks)}>
            {showChecks ? <ChevronDown size={15} /> : <ChevronRight size={15} className="flip" />}<ShieldCheck size={15} />{x('Rapport de validation de l’archive', 'Archive validation report')}
          </button>
          {showChecks && <CheckList checks={c.checks} />}
        </>
      )}

      {c.status === 'pending' && (
        owner ? (
          <div className="panel" style={{ borderColor: 'var(--sky-2)' }}>
            <div className="panel-h"><h3>{x('Votre décision', 'Your decision')}</h3><span className="small muted">{x(`Accepter crée la version ${cur.n + 1}`, `Accepting creates version ${cur.n + 1}`)}</span></div>
            <div className="panel-b col" style={{ gap: 12 }}>
              <div className="field">
                <label htmlFor="dn">{x('Retour au contributeur', 'Feedback for the contributor')}</label>
                <textarea id="dn" className="textarea" value={note} onChange={(e) => { setNote(e.target.value); setNoteTr(null) }} placeholder={x('Ce qui est bien, ce qui doit changer…', 'What works, what should change…')} />
                <span className="hint row" style={{ gap: 6 }}><Languages size={13} />{x(`${author.name.split(' ')[0]} le lira en ${LANG_NAMES[author.uiLang]}.`, `${author.name.split(' ')[0]} will read it in ${LANG_NAMES[author.uiLang]}.`)}</span>
              </div>
              <div className="row wrap" style={{ gap: 6 }}>
                {FEEDBACK.map((f, i) => <button key={i} className="tag" style={{ cursor: 'pointer', height: 'auto', padding: '6px 10px', textAlign: 'start' }} onClick={() => { setNote(state.lang === 'fr' ? f.fr : f.en); setNoteTr({ fr: f.fr, en: f.en }) }}>{(state.lang === 'fr' ? f.fr : f.en).slice(0, 58)}…</button>)}
              </div>
              <div className="row" style={{ justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                <button className="btn danger" onClick={() => decide(false)}><X size={16} />{t('a.reject')}</button>
                <button className="btn ok" onClick={() => decide(true)}><Check size={16} />{x(`Accepter et créer la v${cur.n + 1}`, `Accept and create v${cur.n + 1}`)}</button>
              </div>
            </div>
          </div>
        ) : <div className="note"><Lock size={17} /><span>{x('En attente de la décision du propriétaire. Vous serez notifié·e.', 'Waiting for the owner’s decision. You will be notified.')}</span></div>
      )}

      {(c.status === 'accepted' || c.status === 'rejected') && (
        <div className={'note ' + (c.status === 'accepted' ? 'ok' : 'bad')}>
          {c.status === 'accepted' ? <GitBranch size={17} /> : <X size={17} />}
          <div className="grow">
            <b>{c.status === 'accepted' ? x(`Acceptée${c.resultVersion ? `, version ${c.resultVersion} créée` : ''}`, `Accepted${c.resultVersion ? `, version ${c.resultVersion} created` : ''}`) : x('Rejetée, la version officielle n’a pas changé', 'Rejected, the official version did not change')}</b>
            {c.decisionNote && (
              <div style={{ marginTop: 6 }}>
                {decisionTr && <span className="tr-tag" style={{ marginBottom: 4 }}>{t('tr.from')} {LANG_NAMES[c.decisionLang]}</span>}
                <p>{decisionTr ?? c.decisionNote}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
