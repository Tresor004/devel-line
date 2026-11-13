import { useState, useRef } from 'react'
import { Check, Globe, Lock, Upload, FileText, ArrowLeft, ShieldCheck } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../nav'
import { Avatar } from '../components/ui'
import { LANG_NAMES } from '../data'
import { readZipFile, validateArchive, fmtSize } from '../engine'
import { CheckList } from './project/SubmitModal'

const STACKS = ['React', 'Next.js', 'Vue', 'Laravel', 'Node.js', 'Django', 'FastAPI', 'Flutter', 'React Native', 'MySQL', 'PostgreSQL', 'Firebase', 'Tailwind', 'Docker']

export default function NewProject() {
  const { t, dispatch, toast, me, state } = useStore()
  const { go } = useNav()
  const x = t.x
  const [step, setStep] = useState(0)
  const [f, setF] = useState({ name: '', tagline: '', visibility: 'public', context: '', docs: '', stack: [], level: 'Débutants bienvenus', langs: me.langs.filter((l) => LANG_NAMES[l]).slice(0, 2), lookingFor: '', demoUrl: '' })
  const [files, setFiles] = useState(null)
  const [check, setCheck] = useState(null)
  const fileRef = useRef(null)
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))
  const toggle = (k, v) => setF((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((y) => y !== v) : [...s[k], v] }))

  const steps = [x('L’essentiel', 'Basics'), x('Contexte et documentation', 'Context and docs'), x('Stack et équipe', 'Stack and team'), x('Démo et fichiers', 'Demo and files')]
  const errors = [
    !f.name.trim() ? x('Donnez un nom au projet.', 'Give the project a name.') : null,
    f.context.trim().length < 20 ? x('Décrivez le contexte en une ou deux phrases (20 caractères minimum).', 'Describe the context in a sentence or two (20 characters minimum).') : null,
    f.stack.length === 0 ? x('Choisissez au moins une technologie.', 'Pick at least one technology.') : null,
    f.demoUrl && !/^https?:\/\/.+\..+/.test(f.demoUrl) ? x('Le lien de démo doit commencer par https://', 'The demo link must start with https://') : check?.blocked ? x('L’archive initiale contient des éléments interdits.', 'The initial archive contains forbidden items.') : null,
  ]
  const next = () => {
    if (errors[step]) { toast(errors[step], 'bad'); return }
    if (step < 3) setStep(step + 1)
    else create()
  }
  const create = () => {
    const slug = f.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36).slice(-3)
    const initial = files ?? { 'README.md': `# ${f.name}\n\n${f.tagline}\n\n## Contexte\n${f.context}\n` }
    dispatch({ type: 'project.create', project: { id: slug, name: f.name.trim(), tagline: f.tagline.trim() || x('Nouveau projet', 'New project'), visibility: f.visibility, context: f.context, docs: f.docs, stack: f.stack, level: f.level, langs: f.langs, demoUrl: f.demoUrl, lookingFor: f.lookingFor.split(',').map((s) => s.trim()).filter(Boolean) }, files: initial })
    toast(x(`Projet ${f.name} créé, version 1 publiée`, `Project ${f.name} created, version 1 published`), 'ok')
    go('project', { id: slug, tab: 'overview' })
  }
  const pick = async (file) => {
    if (!file) return
    try {
      const entries = await readZipFile(file)
      const v = validateArchive(entries, file.size)
      setCheck({ ...v, name: file.name, size: file.size })
      setFiles(v.blocked ? null : v.files)
    } catch { setCheck({ blocked: true, checks: [{ id: 'fmt', label: x('Format ZIP valide', 'Valid ZIP format'), status: 'fail', items: [file.name] }], name: file.name }) }
  }

  return (
    <>
      <button className="btn quiet sm" style={{ marginBottom: 14, paddingInline: 6 }} onClick={() => go('projects')}><ArrowLeft size={15} className="flip" />{t('nav.projects')}</button>
      <div className="page-h"><div><h1>{t('nav.new')}</h1><p className="sub">{x('Quatre étapes. Vous pourrez tout modifier ensuite.', 'Four steps. You can edit everything later.')}</p></div></div>

      <div className="grid g-main">
        <div className="panel">
          <div className="track" style={{ gridTemplateColumns: 'repeat(4, 1fr)', margin: 0, padding: '22px 10px 18px', borderBottom: '1px solid var(--line)' }}>
            <span className="fill" style={{ width: (step / 3) * 76 + '%', left: '12%', insetInlineStart: '12%' }} />
            {steps.map((s, i) => (
              <button key={s} className={'st' + (i < step ? ' done' : i === step ? ' now' : '')} style={{ border: 0, background: 'none', cursor: i < step ? 'pointer' : 'default' }} onClick={() => i < step && setStep(i)}>
                <i>{i < step && <Check size={11} strokeWidth={3} />}</i><span>{s}</span>
              </button>
            ))}
          </div>
          <div className="panel-b col" style={{ gap: 18, padding: 26 }}>
            {step === 0 && <>
              <div className="field"><label htmlFor="pn">{x('Nom du projet', 'Project name')}</label><input id="pn" className="input" autoFocus value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex. Teranga Market" /></div>
              <div className="field"><label htmlFor="pt">{x('Accroche', 'Tagline')}</label><input id="pt" className="input" value={f.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder={x('Ce que fait le projet, en une phrase', 'What the project does, in one sentence')} /></div>
              <div className="field"><label>{x('Visibilité', 'Visibility')}</label>
                <div className="grid g-2" style={{ gap: 10 }}>
                  {[['public', Globe, x('Public', 'Public'), x('Fiche et démo visibles par tous, code réservé aux membres.', 'Page and demo visible to all, code for members only.')], ['private', Lock, x('Privé', 'Private'), x('Visible uniquement par les membres invités.', 'Visible to invited members only.')]].map(([k, I, l, h]) => (
                    <button key={k} className={'preset' + (f.visibility === k ? ' on' : '')} style={{ alignItems: 'flex-start' }} onClick={() => set('visibility', k)}><I size={18} color="var(--cobalt)" /><span><b>{l}</b><span className="small muted" style={{ display: 'block' }}>{h}</span></span></button>
                  ))}
                </div>
              </div>
            </>}
            {step === 1 && <>
              <div className="field"><label htmlFor="pc">{x('Contexte', 'Context')}</label><textarea id="pc" className="textarea" value={f.context} onChange={(e) => set('context', e.target.value)} placeholder={x('Quel problème, pour qui, dans quelle ville ou quel pays ?', 'What problem, for whom, in which city or country?')} /><span className="hint">{x('Écrivez dans votre langue : la fiche sera traduite pour les autres membres.', 'Write in your language: the page will be translated for other members.')}</span></div>
              <div className="field"><label htmlFor="pd">Documentation</label><textarea id="pd" className="textarea" style={{ minHeight: 140 }} value={f.docs} onChange={(e) => set('docs', e.target.value)} placeholder={x('Architecture, conventions, comment lancer le projet…', 'Architecture, conventions, how to run the project…')} /></div>
            </>}
            {step === 2 && <>
              <div className="field"><label>Stack</label><div className="chipsel">{STACKS.map((s) => <button key={s} className={f.stack.includes(s) ? 'on' : ''} onClick={() => toggle('stack', s)}>{f.stack.includes(s) && <Check size={13} />}{s}</button>)}</div></div>
              <div className="field"><label>{x('Niveau attendu', 'Expected level')}</label>
                <div className="seg">{['Débutants bienvenus', 'Intermédiaire', 'Avancé'].map((l, i) => <button key={l} className={f.level === l ? 'on' : ''} onClick={() => set('level', l)}>{[t('lvl.beginner'), x('Intermédiaire', 'Intermediate'), x('Avancé', 'Advanced')][i]}</button>)}</div>
              </div>
              <div className="field"><label>{x('Langues de travail', 'Working languages')}</label><div className="chipsel">{['fr', 'en', 'sw', 'pt', 'ar', 'ha', 'yo', 'wo', 'am'].map((l) => <button key={l} className={f.langs.includes(l) ? 'on' : ''} onClick={() => toggle('langs', l)}>{LANG_NAMES[l]}</button>)}</div><span className="hint">{x('Les membres parlant d’autres langues pourront quand même participer grâce à la traduction automatique.', 'Members speaking other languages can still take part thanks to auto-translation.')}</span></div>
              <div className="field"><label htmlFor="pl">{x('Profils recherchés', 'Roles wanted')}</label><input id="pl" className="input" value={f.lookingFor} onChange={(e) => set('lookingFor', e.target.value)} placeholder={x('Frontend junior, Testeur mobile', 'Junior frontend, Mobile tester')} /><span className="hint">{x('Séparés par des virgules', 'Comma-separated')}</span></div>
            </>}
            {step === 3 && <>
              <div className="field"><label htmlFor="pu">{x('Lien de démo externe', 'External demo link')}</label><input id="pu" className="input" value={f.demoUrl} onChange={(e) => set('demoUrl', e.target.value)} placeholder="https://mon-projet.vercel.app" inputMode="url" /><span className="hint">{x('DEVEL line n’héberge pas votre code : indiquez où la démo tourne (Vercel, Netlify, Render…).', 'DEVEL line does not host your code: link to where the demo runs (Vercel, Netlify, Render…).')}</span></div>
              <div className="field"><label>{x('Fichiers de la version 1', 'Version 1 files')}</label>
                <div className="drop" role="button" tabIndex={0} onClick={() => fileRef.current?.click()} onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}>
                  <Upload size={22} color="var(--cobalt)" />
                  <b>{check ? check.name : x('Importer un ZIP du projet (facultatif)', 'Import a project ZIP (optional)')}</b>
                  <span className="small muted">{check && !check.blocked ? x(`${Object.keys(files).length} fichiers retenus`, `${Object.keys(files).length} files kept`) : x('Sans fichier, un README est créé à partir du contexte.', 'Without a file, a README is created from the context.')}</span>
                  <input ref={fileRef} type="file" accept=".zip" hidden onChange={(e) => pick(e.target.files[0])} />
                </div>
              </div>
              {check && <CheckList checks={check.checks} />}
            </>}
            <div className="row sp" style={{ borderTop: '1px solid var(--line)', paddingTop: 18, marginTop: 4 }}>
              <button className="btn ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>{t('a.back')}</button>
              <button className="btn primary" onClick={next}>{step === 3 ? t('a.create') : x('Continuer', 'Continue')}</button>
            </div>
          </div>
        </div>

        <div className="col" style={{ gap: 14 }}>
          <p className="small muted">{x('Aperçu de la fiche', 'Page preview')}</p>
          <div className="pcard" style={{ cursor: 'default' }}>
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <span className="logo">{(f.name || '?')[0].toUpperCase()}</span>
              <div className="grow"><h3>{f.name || x('Nom du projet', 'Project name')}</h3><p className="small muted">{f.tagline || x('Votre accroche apparaîtra ici', 'Your tagline appears here')}</p></div>
              {f.visibility === 'private' ? <Lock size={15} color="var(--muted)" /> : <Globe size={15} color="var(--muted)" />}
            </div>
            <div className="row wrap" style={{ gap: 6 }}>{(f.stack.length ? f.stack : ['Stack']).map((s) => <span key={s} className="tag">{s}</span>)}</div>
            <div className="row sp" style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}><Avatar id={me.id} size="sm" /><span className="tiny muted">{f.langs.map((l) => l.toUpperCase()).join(' ')}</span></div>
            {f.level === 'Débutants bienvenus' && <span className="badge ok" style={{ alignSelf: 'flex-start' }}>{t('lvl.beginner')}</span>}
          </div>
          <div className="note"><ShieldCheck size={17} /><span>{x('Vous serez propriétaire : vous seul·e accepterez les contributions et pourrez restaurer les versions.', 'You will be the owner: only you accept contributions and restore versions.')}</span></div>
        </div>
      </div>
    </>
  )
}
