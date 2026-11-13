import { useState, useRef, useEffect } from 'react'
import { Upload, FileArchive, Check, X, AlertTriangle, Loader2, ShieldCheck, ShieldAlert, Info } from 'lucide-react'
import { useStore } from '../../store'
import { Modal } from '../../components/ui'
import { PRESET_ARCHIVES } from '../../data'
import { validateArchive, readZipFile, computeChanges, diffStats, fmtSize } from '../../engine'

export function CheckList({ checks, revealed = 999 }) {
  return (
    <div className="checks">
      {checks.map((c, i) => {
        const st = i < revealed ? c.status : 'wait'
        return (
          <div key={c.id} className={'check ' + st}>
            <span className="ci">{st === 'ok' ? <Check size={13} strokeWidth={2.6} /> : st === 'fail' ? <X size={13} strokeWidth={2.6} /> : st === 'warn' ? <AlertTriangle size={12} /> : <Loader2 size={13} className="spin" />}</span>
            <div className="grow">
              <div className="row sp" style={{ gap: 8 }}><b style={{ fontWeight: 550 }}>{c.label}</b>{c.detail && st !== 'wait' && <span className="tiny muted">{c.detail}</span>}</div>
              {st !== 'wait' && c.items.length > 0 && <ul>{c.items.slice(0, 6).map((it) => <li key={it}>{it}</li>)}{c.items.length > 6 && <li>+{c.items.length - 6}</li>}</ul>}
              {st === 'warn' && c.hint && <p className="tiny" style={{ color: 'var(--warn)', marginTop: 4 }}>{c.hint}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function SubmitModal({ p, onClose, onDone }) {
  const { t, state, dispatch, toast, me } = useStore()
  const x = t.x
  const versions = state.versions[p.id]
  const cur = versions.at(-1)
  const used = new Set(state.contribs.filter((c) => c.projectId === p.id).map((c) => c.archiveName))
  const firstPreset = PRESET_ARCHIVES.find((a) => !used.has(a.name)) ?? PRESET_ARCHIVES[0]

  const [src, setSrc] = useState({ kind: 'preset', preset: firstPreset })
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [base, setBase] = useState(cur.n)
  const [partial, setPartial] = useState(false)
  const [phase, setPhase] = useState('form')
  const [result, setResult] = useState(null)
  const [revealed, setRevealed] = useState(0)
  const [over, setOver] = useState(false)
  const fileRef = useRef(null)

  // L'auteur écrit dans sa propre langue ; le propriétaire lira une traduction
  const authorLang = ['fr', 'en'].includes(me.langs[0]) ? me.langs[0] : 'en'
  const fillFrom = (preset) => {
    setTitle(authorLang === 'fr' ? preset.title : preset.titleEn)
    setSummary(authorLang === 'fr' ? preset.summary : preset.summaryEn)
  }
  useEffect(() => { if (src.kind === 'preset') fillFrom(src.preset) }, []) // eslint-disable-line

  const pickFile = (file) => {
    if (!file) return
    setSrc({ kind: 'file', file })
    if (!title) setTitle(file.name.replace(/\.zip$/i, '').replace(/[-_]/g, ' '))
  }

  const run = async () => {
    if (!title.trim()) { toast(x('Donnez un titre à votre contribution.', 'Give your contribution a title.'), 'bad'); return }
    setPhase('checking'); setRevealed(0)
    let entries, size, name
    try {
      if (src.kind === 'preset') { entries = src.preset.entries(); name = src.preset.name }
      else {
        name = src.file.name; size = src.file.size
        if (!/\.zip$/i.test(name)) throw new Error('format')
        entries = await readZipFile(src.file)
      }
    } catch {
      const checks = [{ id: 'fmt', label: x('Format ZIP valide', 'Valid ZIP format'), status: 'fail', items: [name ?? '?'], detail: x('Le fichier n’est pas une archive ZIP lisible', 'The file is not a readable ZIP archive') }]
      setResult({ checks, blocked: true, name, changes: [] }); setRevealed(1); setPhase('result')
      dispatch({ type: 'contrib.submit', contrib: { projectId: p.id, title, summary, baseVersion: base, archiveName: name, checks, blocked: true, changes: [], lang: state.lang } })
      return
    }
    const v = validateArchive(entries, size)
    const baseFiles = versions.find((vv) => vv.n === base).files
    const changes = v.blocked ? [] : computeChanges(baseFiles, v.files, partial)
    const res = { ...v, name, changes }
    setResult(res)
    const step = state.lowData ? 0 : 110
    for (let i = 1; i <= v.checks.length; i++) { await new Promise((r) => setTimeout(r, step)); setRevealed(i) }
    setPhase('result')
    if (v.blocked) {
      dispatch({ type: 'contrib.submit', contrib: { projectId: p.id, title, summary, baseVersion: base, archiveName: name, checks: v.checks, blocked: true, changes: [], lang: state.lang } })
      toast(x('Archive refusée : elle contient des éléments interdits.', 'Archive refused: it contains forbidden items.'), 'bad')
    }
  }

  const confirm = () => {
    const pr = src.kind === 'preset' ? src.preset : null
    const tr = pr ? { fr: { title: pr.title, summary: pr.summary }, en: { title: pr.titleEn, summary: pr.summaryEn } } : null
    const cid = 'c' + Date.now()
    dispatch({ type: 'contrib.submit', contrib: { cid, projectId: p.id, title, summary, baseVersion: base, archiveName: result.name, checks: result.checks, blocked: false, changes: result.changes, lang: pr ? authorLang : state.lang, tr, partial } })
    toast(x('Contribution envoyée. Le propriétaire a été notifié.', 'Contribution sent. The owner has been notified.'), 'ok')
    onDone(cid)
  }

  const stats = result && !result.blocked ? diffStats(result.changes) : null
  const counts = result ? { added: result.changes.filter((c) => c.type === 'added').length, modified: result.changes.filter((c) => c.type === 'modified').length, deleted: result.changes.filter((c) => c.type === 'deleted').length } : null

  const footer = phase === 'form'
    ? <><button className="btn ghost" onClick={onClose}>{t('a.cancel')}</button><button className="btn primary" onClick={run}><ShieldCheck size={16} />{x('Vérifier et envoyer', 'Check and send')}</button></>
    : phase === 'checking' ? <button className="btn ghost" disabled><Loader2 size={16} className="spin" />{x('Vérification…', 'Checking…')}</button>
      : result.blocked
        ? <><button className="btn ghost" onClick={onClose}>{t('a.cancel')}</button><button className="btn primary" onClick={() => { setPhase('form'); setResult(null); const nx = PRESET_ARCHIVES.find((a) => a.id === 'p3'); if (src.kind === 'preset') { setSrc({ kind: 'preset', preset: nx }); fillFrom(nx) } }}>{x('Choisir une autre archive', 'Choose another archive')}</button></>
        : <><button className="btn ghost" onClick={() => { setPhase('form'); setResult(null) }}>{t('a.back')}</button><button className="btn primary" disabled={result.changes.length === 0} onClick={confirm}><Upload size={16} />{x('Envoyer la proposition', 'Send proposal')}</button></>

  return (
    <Modal title={t('a.submit')} sub={x(`${p.name}, version courante v${cur.n}`, `${p.name}, current version v${cur.n}`)} onClose={onClose} footer={footer}>
      {phase === 'form' && (
        <div className="col" style={{ gap: 18 }}>
          <div className="field">
            <label>{x('Archive', 'Archive')}</label>
            <div
              className={'drop' + (over ? ' over' : '') + (src.kind === 'file' ? ' over' : '')}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)}
              onDrop={(e) => { e.preventDefault(); setOver(false); pickFile(e.dataTransfer.files[0]) }}
              role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
            >
              <Upload size={22} color="var(--cobalt)" />
              {src.kind === 'file' ? <b>{src.file.name} <span className="muted small">({fmtSize(src.file.size)})</span></b> : <b>{x('Déposez votre ZIP ici ou cliquez pour choisir', 'Drop your ZIP here or click to choose')}</b>}
              <span className="small muted">{x('10 Mo maximum, 200 fichiers. Sans node_modules, .env ni clés.', '10 MB max, 200 files. No node_modules, .env or keys.')}</span>
              <input ref={fileRef} type="file" accept=".zip,application/zip" hidden onChange={(e) => pickFile(e.target.files[0])} />
            </div>
          </div>
          <div className="field">
            <label>{x('Ou utilisez une archive de démonstration', 'Or use a demo archive')}</label>
            <div className="col" style={{ gap: 8 }}>
              {PRESET_ARCHIVES.map((a) => (
                <button key={a.id} className={'preset' + (src.kind === 'preset' && src.preset.id === a.id ? ' on' : '')} onClick={() => { setSrc({ kind: 'preset', preset: a }); fillFrom(a) }}>
                  {a.id === 'p2' ? <ShieldAlert size={18} color="var(--bad)" /> : <FileArchive size={18} color="var(--cobalt)" />}
                  <span className="grow"><b className="mono small">{a.name}</b><span className="tiny muted" style={{ display: 'block' }}>{x(a.note, { p1: 'Valid archive, first proposal', p2: 'Dangerous archive, must be refused', p3: 'Valid archive, revised proposal' }[a.id])}</span></span>
                  {used.has(a.name) && <span className="badge">{x('Déjà envoyée', 'Already sent')}</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="field"><label htmlFor="ct">{x('Titre', 'Title')}</label><input id="ct" className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="field">
            <label htmlFor="cs">{x('Ce que vous avez changé et pourquoi', 'What you changed and why')}</label>
            <textarea id="cs" className="textarea" value={summary} onChange={(e) => setSummary(e.target.value)} />
            <span className="hint">{x('Écrivez dans votre langue, le propriétaire lira une traduction automatique.', 'Write in your own language, the owner will read an automatic translation.')}</span>
          </div>
          <div className="grid g-2" style={{ gap: 12 }}>
            <div className="field">
              <label htmlFor="cb">{x('Version de base', 'Base version')}</label>
              <select id="cb" className="select" value={base} onChange={(e) => setBase(+e.target.value)}>
                {[...versions].reverse().map((v) => <option key={v.n} value={v.n}>v{v.n}{v.n === cur.n ? x(' (courante)', ' (current)') : ''}</option>)}
              </select>
            </div>
            <div className="field">
              <label>{x('Contenu de l’archive', 'Archive content')}</label>
              <div className="seg">
                <button className={!partial ? 'on' : ''} onClick={() => setPartial(false)}>{x('Dossier complet', 'Full folder')}</button>
                <button className={partial ? 'on' : ''} onClick={() => setPartial(true)}>{x('Fichiers modifiés', 'Changed files')}</button>
              </div>
            </div>
          </div>
          {base !== cur.n && <div className="note warn"><Info size={17} /><span>{x(`Vous partez de la v${base} alors que la version courante est la v${cur.n}. Le propriétaire verra cet écart.`, `You are starting from v${base} while the current version is v${cur.n}. The owner will see this gap.`)}</span></div>}
        </div>
      )}

      {phase !== 'form' && result && (
        <div className="col" style={{ gap: 16 }}>
          <div className="row" style={{ gap: 10 }}><FileArchive size={18} color="var(--muted)" /><b className="mono small">{result.name}</b><span className="muted small">{result.count} {x('fichiers', 'files')}</span></div>
          <CheckList checks={result.checks} revealed={revealed} />
          {phase === 'result' && result.blocked && (
            <div className="note bad"><ShieldAlert size={17} /><div><b>{x('Archive refusée, rien n’a été transmis au propriétaire', 'Archive refused, nothing was sent to the owner')}</b><p style={{ marginTop: 4 }}>{x('Retirez les éléments signalés, recréez le ZIP depuis la copie de travail et réessayez. La tentative est enregistrée dans le journal du projet.', 'Remove the flagged items, rebuild the ZIP from the working copy and try again. The attempt is recorded in the project log.')}</p></div></div>
          )}
          {phase === 'result' && !result.blocked && (
            result.changes.length === 0
              ? <div className="note warn"><Info size={17} /><span>{x('L’archive est valide mais identique à la version de base. Aucune proposition à envoyer.', 'The archive is valid but identical to the base version. Nothing to send.')}</span></div>
              : <div className="note ok"><ShieldCheck size={17} /><div><b>{x('Archive valide', 'Valid archive')}</b><p style={{ marginTop: 4 }}>
                {x(`${counts.modified} modifié(s), ${counts.added} ajouté(s), ${counts.deleted} supprimé(s) par rapport à la v${base}.`, `${counts.modified} modified, ${counts.added} added, ${counts.deleted} deleted compared to v${base}.`)} <span className="plus">+{stats.add}</span> <span className="minus">−{stats.del}</span></p></div></div>
          )}
        </div>
      )}
    </Modal>
  )
}
