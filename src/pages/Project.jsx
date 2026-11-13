import { useState, useMemo, useEffect } from 'react'
import JSZip from 'jszip'
import {
  ExternalLink, Download, Upload, UserPlus, Lock, Globe, FileText, Folder, History, RotateCcw, Eye, GitBranch,
  Users, FileArchive, Check, ShieldCheck, Languages, BookOpen, Clock, ChevronRight, ArrowLeft,
} from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../nav'
import { Avatar, PermBadge, Modal, ago, Empty } from '../components/ui'
import { USERS, COHORTS, LANG_NAMES } from '../data'
import { fmtSize, hash, computeChanges, diffStats } from '../engine'
import { CohortTrack } from './Dashboard'
import Members from './project/Members'
import Contribs from './project/Contribs'
import Discussion from './project/Discussion'
import SubmitModal from './project/SubmitModal'

export default function Project() {
  const { route, go } = useNav()
  const { t, state, perm, pendingInvite, dispatch, toast, me } = useStore()
  const x = t.x
  const p = state.projects.find((pp) => pp.id === route.params.id)
  const [tab, setTab] = useState(route.params.tab || 'overview')
  const [modal, setModal] = useState(null)
  useEffect(() => { setTab(route.params.tab || 'overview') }, [route.params.tab, route.params.id, route.params.contrib])

  if (!p) return <Empty icon={<Folder size={26} />} title={x('Projet introuvable', 'Project not found')} action={<button className="btn ghost" onClick={() => go('explore')}>{t('nav.explore')}</button>} />

  const my = perm(p.id)
  const versions = state.versions[p.id] ?? []
  const cur = versions.at(-1)
  const members = (state.members[p.id] ?? []).filter((m) => m.status === 'active')
  const contribs = state.contribs.filter((c) => c.projectId === p.id)
  const pending = contribs.filter((c) => c.status === 'pending').length
  const invited = pendingInvite(p.id)
  const requested = state.joinRequests.some((r) => r.projectId === p.id && r.userId === me.id)
  const canSeeProject = p.visibility === 'public' || my || invited

  if (!canSeeProject) {
    return (
      <div className="lock">
        <span className="ic"><Lock size={30} /></span>
        <h2>{x('Ce projet est privé', 'This project is private')}</h2>
        <p className="muted">{x('Seuls les membres invités peuvent le consulter. Votre demande a été vérifiée côté serveur et refusée.', 'Only invited members can view it. Your request was checked server-side and denied.')}</p>
        <code className="tiny muted">403 project.view denied for {me.handle}</code>
        <button className="btn ghost" onClick={() => go('explore')}>{t('nav.explore')}</button>
      </div>
    )
  }

  const tabs = [
    ['overview', t('tab.overview')],
    ['files', t('tab.files')],
    ['contribs', t('tab.contribs'), pending || null],
    ['versions', t('tab.versions'), versions.length],
    ['members', t('tab.members'), members.length],
    ['discussion', t('tab.discussion'), (state.messages[p.id] ?? []).length || null],
    ['journal', t('tab.journal')],
  ]

  return (
    <>
      <button className="btn quiet sm" style={{ marginBottom: 14, paddingInline: 6 }} onClick={() => go(my ? 'projects' : 'explore')}><ArrowLeft size={15} className="flip" />{my ? t('nav.projects') : t('nav.explore')}</button>

      <div className="grid g-main" style={{ marginBottom: 22 }}>
        <div className="panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="row" style={{ alignItems: 'flex-start', gap: 16 }}>
            <span className="logo-tile" style={{ width: 56, height: 56, fontSize: 24, padding: 0, border: 0, cursor: 'default' }}>{p.name[0]}</span>
            <div className="grow">
              <div className="row wrap" style={{ gap: 8 }}>
                <h1 style={{ fontSize: 26 }}>{p.name}</h1>
                {p.visibility === 'public' ? <span className="badge"><Globe size={12} />{x('Public', 'Public')}</span> : <span className="badge"><Lock size={12} />{x('Privé', 'Private')}</span>}
                {my && <PermBadge perm={my} />}
              </div>
              <p className="muted" style={{ marginTop: 4 }}>{p.tagline}</p>
              <div className="row wrap" style={{ gap: 6, marginTop: 12 }}>
                {p.stack.map((s) => <span key={s} className="tag">{s}</span>)}
                {p.level === 'Débutants bienvenus' && <span className="badge ok">{t('lvl.beginner')}</span>}
              </div>
            </div>
          </div>
          <div className="row wrap" style={{ gap: 8, borderTop: '1px solid var(--line)', paddingTop: 18 }}>
            {p.demoUrl && <a className="btn ghost sm" href={p.demoUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} />{x('Démo en ligne', 'Live demo')}</a>}
            <span className="grow" />
            {my === 'owner' && <button className="btn ghost sm" onClick={() => setModal('invite')}><UserPlus size={15} />{t('a.invite')}</button>}
            {my && <button className="btn ghost sm" onClick={() => setModal('download')}><Download size={15} />{t('a.download')}</button>}
            {(my === 'contribute') && <button className="btn primary sm" onClick={() => setModal('submit')}><Upload size={15} />{t('a.submit')}</button>}
            {!my && invited && (
              <>
                <span className="small muted">{x('Vous êtes invité·e sur ce projet', 'You are invited to this project')}</span>
                <button className="btn ghost sm" onClick={() => dispatch({ type: 'member.respond', projectId: p.id, accept: false })}>{t('a.decline')}</button>
                <button className="btn primary sm" onClick={() => { dispatch({ type: 'member.respond', projectId: p.id, accept: true }); toast(x(`Vous avez rejoint ${p.name}`, `You joined ${p.name}`), 'ok'); setTab('files') }}>{t('a.accept')}</button>
              </>
            )}
            {!my && !invited && (
              <button className="btn primary sm" disabled={requested} onClick={() => { dispatch({ type: 'join.request', projectId: p.id }); toast(x('Demande envoyée au propriétaire', 'Request sent to the owner'), 'ok') }}>
                {requested ? x('Demande envoyée', 'Request sent') : t('a.join')}
              </button>
            )}
          </div>
        </div>

        <div className="navy-panel">
          <div className="stat"><div><div className="stat-l">{x('Version officielle', 'Official version')}</div><div className="stat-v">v{cur?.n}<small>{cur && ago(cur.at, state.lang)}</small></div></div><span className="chip"><GitBranch size={16} /></span></div>
          <div className="stat"><div><div className="stat-l">{x('Contributions en attente', 'Pending contributions')}</div><div className="stat-v">{pending}</div></div><span className="chip light"><FileArchive size={16} /></span></div>
          <div className="stat"><div><div className="stat-l">{x('Membres actifs', 'Active members')}</div><div className="stat-v">{members.length}<small>{x(`, ${new Set(members.map((m) => USERS[m.userId].country)).size} pays`, `, ${new Set(members.map((m) => USERS[m.userId].country)).size} countries`)}</small></div></div><span className="chip"><Users size={16} /></span></div>
        </div>
      </div>

      <div className="panel">
        <div className="tabs" role="tablist" style={{ padding: '0 12px' }}>
          {tabs.map(([k, label, n]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => { setTab(k); go('project', { id: p.id, tab: k }) }}>
              {label}{n ? <span className="n">{n}</span> : null}
            </button>
          ))}
        </div>
        <div className="panel-b" style={{ padding: 24 }}>
          {tab === 'overview' && <Overview p={p} />}
          {tab === 'files' && <Files p={p} my={my} />}
          {tab === 'members' && <Members p={p} onInvite={() => setModal('invite')} />}
          {tab === 'contribs' && <Contribs p={p} onSubmit={() => setModal('submit')} />}
          {tab === 'versions' && <Versions p={p} my={my} />}
          {tab === 'discussion' && <Discussion p={p} />}
          {tab === 'journal' && <Journal p={p} my={my} />}
        </div>
      </div>

      {modal === 'download' && <DownloadModal p={p} onClose={() => setModal(null)} />}
      {modal === 'submit' && <SubmitModal p={p} onClose={() => setModal(null)} onDone={(cid) => { setModal(null); go('project', { id: p.id, tab: 'contribs', contrib: cid }) }} />}
      {modal === 'invite' && <Members.InviteModal p={p} onClose={() => setModal(null)} />}
    </>
  )
}

function Overview({ p }) {
  const { t, state } = useStore()
  const x = t.x
  const owner = USERS[p.ownerId]
  const cohort = p.cohort ? COHORTS[p.cohort] : null
  const [showTr, setShowTr] = useState(state.lang !== 'fr')
  const ctxEn = p.id === 'teranga' ? 'Dakar artisans sell mostly through WhatsApp, with no catalogue or order tracking. Teranga Market gives them a lightweight storefront, readable on an entry-level phone and usable on a 3G connection.' : null
  const docsEn = p.id === 'teranga' ? 'The cart and catalogue are built in React. The Laravel API exposes /products and /orders. Amounts are stored in CFA francs (XOF), without decimals. Contributions must stay compatible with offline mode.' : null
  const tr = showTr && state.lang !== 'fr' && ctxEn
  return (
    <div className="grid g-main-l" style={{ gap: 32 }}>
      <div className="col" style={{ gap: 26 }}>
        {ctxEn && state.lang !== 'fr' && (
          <div className="row" style={{ gap: 8 }}>
            <span className="tr-tag"><Languages size={12} />{tr ? `${t('tr.from')} Français` : 'Français'}</span>
            <button className="linkish" onClick={() => setShowTr(!showTr)}>{tr ? t('tr.original') : t('tr.translation')}</button>
          </div>
        )}
        <section><h3 style={{ marginBottom: 8 }}>{x('Contexte', 'Context')}</h3><p style={{ color: 'var(--ink-2)', lineHeight: 1.65, maxWidth: '62ch' }}>{tr ? ctxEn : p.context}</p></section>
        <section><h3 style={{ marginBottom: 8 }}>Documentation</h3>
          {p.docs ? <p style={{ color: 'var(--ink-2)', lineHeight: 1.65, maxWidth: '62ch' }}>{tr ? docsEn : p.docs}</p> : <p className="muted small">{x('Pas encore de documentation.', 'No documentation yet.')}</p>}
        </section>
        {cohort && <section><h3>{cohort.name}</h3><CohortTrack cohort={{ ...cohort, current: p.week }} /></section>}
      </div>
      <div className="col" style={{ gap: 18 }}>
        <dl className="kv">
          <dt>{t('p.owner')}</dt><dd className="row" style={{ gap: 8 }}><Avatar id={owner.id} size="sm" />{owner.name}, {owner.city}</dd>
          <dt>{x('Démo externe', 'External demo')}</dt><dd>{p.demoUrl ? <a href={p.demoUrl} target="_blank" rel="noreferrer">{p.demoUrl.replace('https://', '')}</a> : '—'}</dd>
          <dt>{x('Langues de l’équipe', 'Team languages')}</dt><dd>{p.langs.map((l) => LANG_NAMES[l]).join(', ')}</dd>
          <dt>{x('Niveau', 'Level')}</dt><dd>{p.level}</dd>
          <dt>{x('Créé', 'Created')}</dt><dd>{ago(p.createdAt, state.lang)}</dd>
        </dl>
        {p.lookingFor.length > 0 && (
          <div className="note"><Users size={17} /><div><b>{x('L’équipe recherche', 'The team is looking for')}</b><div className="row wrap" style={{ gap: 6, marginTop: 8 }}>{p.lookingFor.map((l) => <span key={l} className="tag">{l}</span>)}</div></div></div>
        )}
        <div className="note"><ShieldCheck size={17} /><span>{x('Les contributions arrivent par archive ZIP. Elles sont vérifiées puis comparées, jamais appliquées sans votre accord.', 'Contributions arrive as ZIP archives. They are checked and compared, never applied without the owner’s approval.')}</span></div>
      </div>
    </div>
  )
}

function buildTree(paths) {
  return [...paths].sort((a, b) => {
    const da = a.split('/').length, db = b.split('/').length
    const fa = a.includes('/') ? a.slice(0, a.lastIndexOf('/')) : '', fb = b.includes('/') ? b.slice(0, b.lastIndexOf('/')) : ''
    return fa === fb ? a.localeCompare(b) : fa.localeCompare(fb) || da - db
  })
}

export function CodeView({ text }) {
  const lines = (text ?? '').replace(/\n$/, '').split('\n')
  return (
    <div className="code"><table><tbody>
      {lines.map((l, i) => <tr key={i}><td className="ln">{i + 1}</td><td>{l || ' '}</td></tr>)}
    </tbody></table></div>
  )
}

function Files({ p, my }) {
  const { t, state, dispatch } = useStore()
  const x = t.x
  const versions = state.versions[p.id] ?? []
  const [vn, setVn] = useState(versions.at(-1)?.n)
  const v = versions.find((vv) => vv.n === vn) ?? versions.at(-1)
  const paths = useMemo(() => buildTree(Object.keys(v?.files ?? {})), [v])
  const [sel, setSel] = useState(paths.find((pp) => pp.endsWith('Cart.jsx')) ?? paths[0])
  useEffect(() => { if (!my) dispatch({ type: 'demoFlag', key: 'deniedSeen' }) }, [my, dispatch])

  if (!my) {
    return (
      <div className="lock" style={{ margin: '20px auto' }}>
        <span className="ic"><Lock size={30} /></span>
        <h2>{x('Fichiers réservés aux membres', 'Files are for members only')}</h2>
        <p className="muted">{x('Le projet est public, mais son code ne l’est pas. Demandez à collaborer pour obtenir l’accès en lecture ou en contribution.', 'The project is public, but its code is not. Ask to collaborate to get view or contribute access.')}</p>
        <code className="tiny muted">403 files.read denied, aucune permission sur « {p.name} »</code>
      </div>
    )
  }
  const content = v.files[sel] ?? ''
  return (
    <div className="grid" style={{ gridTemplateColumns: 'minmax(220px, 280px) minmax(0, 1fr)', gap: 20 }}>
      <div className="col" style={{ gap: 12 }}>
        <div className="field">
          <label htmlFor="vsel">Version</label>
          <select id="vsel" className="select" value={v.n} onChange={(e) => setVn(+e.target.value)}>
            {[...versions].reverse().map((vv) => <option key={vv.n} value={vv.n}>v{vv.n}, {vv.message.slice(0, 32)}{vv.n === versions.at(-1).n ? x(' (courante)', ' (current)') : ''}</option>)}
          </select>
        </div>
        <div className="tree panel" style={{ padding: 6, borderRadius: 12 }}>
          {paths.map((path) => (
            <button key={path} className={sel === path ? 'on' : ''} onClick={() => setSel(path)} style={{ paddingInlineStart: 10 + (path.split('/').length - 1) * 12 }}>
              <FileText size={14} style={{ flex: 'none' }} /><span className="ellipsis">{path.split('/').length > 1 ? <span className="muted">{path.slice(0, path.lastIndexOf('/') + 1)}</span> : null}{path.split('/').pop()}</span>
            </button>
          ))}
        </div>
        <p className="tiny muted">{x(`${paths.length} fichiers, ${fmtSize(Object.values(v.files).join('').length)} au total`, `${paths.length} files, ${fmtSize(Object.values(v.files).join('').length)} total`)}</p>
      </div>
      <div className="col" style={{ gap: 10, minWidth: 0 }}>
        <div className="row sp"><b className="mono small ellipsis">{sel}</b><span className="tiny muted mono">sha {hash(content)}</span></div>
        <CodeView text={content} />
      </div>
    </div>
  )
}

function Versions({ p, my }) {
  const { t, state, dispatch, toast } = useStore()
  const x = t.x
  const versions = state.versions[p.id] ?? []
  const [confirm, setConfirm] = useState(null)
  const list = [...versions].reverse()
  return (
    <div className="grid g-main-l" style={{ gap: 32 }}>
      <div className="vline">
        {list.map((v, i) => {
          const prev = versions.find((vv) => vv.n === v.n - 1)
          const changes = prev ? computeChanges(prev.files, v.files) : []
          const st = diffStats(changes)
          return (
            <div key={v.n} className={'vnode' + (i === 0 ? ' current' : '') + (v.source === 'restore' ? ' restore' : '')}>
              <span className="knob">{v.source === 'restore' ? <RotateCcw size={11} /> : i === 0 ? <Check size={12} strokeWidth={3} /> : null}</span>
              <div className="vcard">
                <div className="row sp wrap" style={{ gap: 8 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <b className="mono">v{v.n}</b>
                    {i === 0 && <span className="badge blue">{x('Courante', 'Current')}</span>}
                    {v.source === 'contribution' && <span className="badge">{x('Contribution', 'Contribution')}</span>}
                    {v.source === 'restore' && <span className="badge warn">{x(`Restaurée depuis v${v.restoredFrom}`, `Restored from v${v.restoredFrom}`)}</span>}
                  </div>
                  <span className="tiny muted">{ago(v.at, state.lang)}</span>
                </div>
                <p style={{ marginTop: 6 }}>{v.message}</p>
                <div className="row wrap sp" style={{ marginTop: 10, gap: 8 }}>
                  <span className="row small muted" style={{ gap: 8 }}>
                    <Avatar id={v.authorId} size="sm" />{USERS[v.authorId].name}{v.approvedBy && <span className="tiny">{x(`, validée par ${USERS[v.approvedBy].name.split(' ')[0]}`, `, approved by ${USERS[v.approvedBy].name.split(' ')[0]}`)}</span>}
                    {prev && <span><span className="plus">+{st.add}</span> <span className="minus">−{st.del}</span></span>}
                  </span>
                  {my === 'owner' && i !== 0 && <button className="btn ghost sm" onClick={() => setConfirm(v)}><RotateCcw size={14} />{t('a.restore')}</button>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="col" style={{ gap: 14 }}>
        <div className="note"><History size={17} /><div><b>{x('Restauration non destructive', 'Non-destructive restore')}</b><p style={{ marginTop: 4 }}>{x('Restaurer une version crée une nouvelle version identique à l’ancienne. Les versions suivantes restent dans l’historique et peuvent être restaurées à leur tour.', 'Restoring creates a new version identical to the old one. Later versions stay in history and can be restored in turn.')}</p></div></div>
        {my !== 'owner' && <div className="note"><Lock size={17} /><span>{x('Seul le propriétaire peut restaurer une version.', 'Only the owner can restore a version.')}</span></div>}
      </div>
      {confirm && (
        <Modal title={x(`Restaurer la version ${confirm.n} ?`, `Restore version ${confirm.n}?`)} sub={confirm.message} onClose={() => setConfirm(null)}
          footer={<><button className="btn ghost" onClick={() => setConfirm(null)}>{t('a.cancel')}</button><button className="btn primary" onClick={() => { dispatch({ type: 'version.restore', projectId: p.id, n: confirm.n }); toast(x(`Version ${confirm.n} restaurée comme version ${versions.at(-1).n + 1}`, `Version ${confirm.n} restored as version ${versions.at(-1).n + 1}`), 'ok'); setConfirm(null) }}><RotateCcw size={15} />{x(`Restaurer comme v${versions.at(-1).n + 1}`, `Restore as v${versions.at(-1).n + 1}`)}</button></>}>
          {(() => {
            const ch = computeChanges(versions.at(-1).files, confirm.files)
            return (
              <div className="col" style={{ gap: 14 }}>
                <p>{x(`La version courante v${versions.at(-1).n} reste dans l’historique. Une nouvelle version v${versions.at(-1).n + 1} sera créée avec le contenu de la v${confirm.n}.`, `Current version v${versions.at(-1).n} stays in history. A new version v${versions.at(-1).n + 1} will be created with the content of v${confirm.n}.`)}</p>
                <div className="checks">
                  {ch.length === 0 && <div className="check ok"><span className="ci"><Check size={13} /></span>{x('Aucune différence de contenu', 'No content difference')}</div>}
                  {ch.map((c) => <div key={c.path} className="check ok" style={{ alignItems: 'center' }}><span className={'k ' + c.type} style={{ width: 22, height: 22, borderRadius: 6, display: 'grid', placeItems: 'center', fontFamily: 'var(--f-mono)', fontSize: 12, fontWeight: 600 }}>{c.type === 'added' ? 'A' : c.type === 'deleted' ? 'D' : 'M'}</span><span className="mono small">{c.path}</span></div>)}
                </div>
              </div>
            )
          })()}
        </Modal>
      )}
    </div>
  )
}

function Journal({ p, my }) {
  const { t, state } = useStore()
  const x = t.x
  if (!my) return <div className="lock"><span className="ic"><Lock size={30} /></span><h2>{x('Journal réservé aux membres', 'Audit log is for members only')}</h2></div>
  const logs = state.logs.filter((l) => l.projectId === p.id)
  const label = { 'project.create': x('Création', 'Created'), 'member.invite': x('Invitation', 'Invitation'), 'member.accept': x('Adhésion', 'Joined'), 'member.decline': x('Refus', 'Declined'), 'member.perm': x('Permission', 'Permission'), 'member.remove': x('Retrait', 'Removed'), 'member.request': x('Demande', 'Request'), 'copy.download': x('Téléchargement', 'Download'), 'contrib.submit': x('Soumission', 'Submission'), 'contrib.blocked': x('Archive bloquée', 'Archive blocked'), 'contrib.accept': x('Acceptation', 'Accepted'), 'contrib.reject': x('Rejet', 'Rejected'), 'version.restore': x('Restauration', 'Restore') }
  const tone = (a) => (a.includes('blocked') || a.includes('reject') ? 'bad' : a.includes('accept') || a.includes('restore') ? 'ok' : a.includes('invite') || a.includes('perm') ? 'blue' : '')
  return (
    <div style={{ overflowX: 'auto' }}>
      <p className="small muted" style={{ marginBottom: 14 }}>{x('Les actions sensibles sont journalisées : invitations, soumissions, décisions, restaurations. Ce journal ne peut pas être modifié.', 'Sensitive actions are logged: invitations, submissions, decisions, restores. This log cannot be edited.')}</p>
      <table className="table responsive">
        <thead><tr><th>{x('Action', 'Action')}</th><th>{x('Détail', 'Detail')}</th><th>{x('Par', 'By')}</th><th>{x('Quand', 'When')}</th></tr></thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id}>
              <td data-l={x('Action', 'Action')}><span className={'badge ' + tone(l.action)}>{label[l.action] ?? l.action}</span></td>
              <td className="full">{l.detail}</td>
              <td data-l={x('Par', 'By')}><span className="row" style={{ gap: 8 }}><Avatar id={l.actorId} size="sm" />{USERS[l.actorId]?.name}</span></td>
              <td data-l={x('Quand', 'When')} className="small muted">{ago(l.at, state.lang)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DownloadModal({ p, onClose }) {
  const { t, state, dispatch, toast } = useStore()
  const x = t.x
  const v = state.versions[p.id].at(-1)
  const files = Object.entries(v.files)
  const total = files.reduce((s, [, c]) => s + c.length, 0)
  const name = `${p.id}-market-v${v.n}.zip`.replace('-market-market', '-market')
  const download = async () => {
    dispatch({ type: 'copy.download', projectId: p.id, version: v.n })
    try {
      const zip = new JSZip()
      const root = zip.folder(`${p.name.toLowerCase().replace(/\s+/g, '-')}`)
      files.forEach(([path, c]) => root.file(path, c))
      root.file('DEVEL-LINE.txt', `Copie de travail de ${p.name}, version ${v.n}.\nModifiez puis renvoyez le dossier complet en ZIP depuis l'onglet Contributions.\nN'incluez pas node_modules, .env ni de clés.`)
      const blob = await zip.generateAsync({ type: 'blob' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob); a.download = `${p.id}-v${v.n}.zip`; document.body.appendChild(a); a.click(); a.remove()
    } catch { /* téléchargement bloqué par le cadre de prévisualisation */ }
    toast(x(`Copie de travail v${v.n} prête (${fmtSize(total)})`, `Working copy v${v.n} ready (${fmtSize(total)})`), 'ok')
    onClose()
  }
  return (
    <Modal title={t('a.download')} sub={x(`Version ${v.n} : ${v.message}`, `Version ${v.n}: ${v.message}`)} onClose={onClose}
      footer={<><button className="btn ghost" onClick={onClose}>{t('a.cancel')}</button><button className="btn primary" onClick={download}><Download size={16} />{x(`Télécharger ${fmtSize(total)}`, `Download ${fmtSize(total)}`)}</button></>}>
      <div className="col" style={{ gap: 16 }}>
        <div className="note"><BookOpen size={17} /><span>{x('Travaillez sur ces fichiers en local, puis renvoyez le dossier complet en ZIP. Les fichiers retirés seront proposés comme suppressions.', 'Work on these files locally, then send the full folder back as a ZIP. Removed files will be proposed as deletions.')}</span></div>
        <div className="checks">
          {files.map(([path, c]) => (
            <div key={path} className="check ok" style={{ alignItems: 'center' }}>
              <FileText size={15} color="var(--muted)" /><span className="mono small grow ellipsis">{path}</span><span className="tiny muted mono">{fmtSize(c.length)}</span>
            </div>
          ))}
        </div>
        {state.lowData && <p className="small muted">{x('Mode éco-données : archive compressée au maximum, sans images.', 'Data saver: maximum compression, no images.')}</p>}
      </div>
    </Modal>
  )
}
