import { useState } from 'react'
import { Check, PlayCircle, X, RotateCcw } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../nav'
import { INITIAL_PROJECTS, USERS } from '../data'

export default function DemoGuide() {
  const { t, state, dispatch, toast } = useStore()
  const { go } = useNav()
  const x = t.x
  const [open, setOpen] = useState(false)
  const contribs = state.contribs.filter((c) => c.projectId === 'teranga' && c.authorId === 'u_kwame')
  const kwame = (state.members.teranga ?? []).find((m) => m.userId === 'u_kwame')

  const steps = [
    { who: 'u_amina', label: x('Créer un projet (ou utiliser Teranga Market)', 'Create a project (or use Teranga Market)'), done: state.projects.length > INITIAL_PROJECTS.length || !!kwame, to: ['new'] },
    { who: 'u_amina', label: x('Inviter Kwame avec le droit de contribuer', 'Invite Kwame with contribute access'), done: kwame?.perm === 'contribute', to: ['project', { id: 'teranga', tab: 'members' }] },
    { who: 'u_kwame', label: x('Accepter l’invitation et télécharger la copie de travail', 'Accept the invitation and download the working copy'), done: state.demo.downloaded && kwame?.status === 'active', to: ['project', { id: 'teranga', tab: 'files' }] },
    { who: 'u_kwame', label: x('Soumettre une archive ZIP', 'Submit a ZIP archive'), done: contribs.some((c) => c.status !== 'blocked'), to: ['project', { id: 'teranga', tab: 'contribs' }] },
    { who: 'u_kwame', label: x('Voir une archive dangereuse refusée', 'See a dangerous archive refused'), done: contribs.some((c) => c.status === 'blocked'), to: ['project', { id: 'teranga', tab: 'contribs' }] },
    { who: 'u_amina', label: x('Examiner les fichiers ajoutés, modifiés, supprimés', 'Review added, modified, deleted files'), done: state.demo.reviewed, to: ['project', { id: 'teranga', tab: 'contribs' }] },
    { who: 'u_amina', label: x('Rejeter la première proposition', 'Reject the first proposal'), done: contribs.some((c) => c.status === 'rejected'), to: ['project', { id: 'teranga', tab: 'contribs' }] },
    { who: 'u_amina', label: x('Accepter la seconde, la version 4 est créée', 'Accept the second, version 4 is created'), done: contribs.some((c) => c.status === 'accepted'), to: ['project', { id: 'teranga', tab: 'contribs' }] },
    { who: 'u_amina', label: x('Restaurer une version précédente', 'Restore a previous version'), done: state.demo.restored, to: ['project', { id: 'teranga', tab: 'versions' }] },
    { who: 'u_tunde', label: x('Vérifier qu’un non-membre ne voit pas les fichiers', 'Check a non-member cannot see files'), done: state.demo.deniedSeen, to: ['project', { id: 'teranga', tab: 'files' }] },
  ]
  const nextIdx = steps.findIndex((s) => !s.done)
  const doneCount = steps.filter((s) => s.done).length

  const jump = (s) => {
    if (state.userId !== s.who) { dispatch({ type: 'login', userId: s.who }); toast(x(`Profil : ${USERS[s.who].name}`, `Profile: ${USERS[s.who].name}`)) }
    go(...s.to)
  }

  return (
    <>
      {open && (
        <div className="guide" role="dialog" aria-label={x('Parcours de démonstration', 'Demo walkthrough')}>
          <div className="popover-h" style={{ padding: '14px 16px', alignItems: 'center' }}>
            <div><b>{x('Parcours jury', 'Jury walkthrough')}</b><span className="tiny muted" style={{ display: 'block', fontWeight: 400 }}>{x(`${doneCount} étapes sur 10, moins de 4 minutes`, `${doneCount} of 10 steps, under 4 minutes`)}</span></div>
            <div className="row" style={{ gap: 4 }}>
              <button className="icon-btn" style={{ width: 32, height: 32 }} title={x('Réinitialiser', 'Reset')} onClick={() => { dispatch({ type: 'reset' }); toast(x('Démo réinitialisée', 'Demo reset')) }}><RotateCcw size={14} /></button>
              <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => setOpen(false)} aria-label="Fermer"><X size={15} /></button>
            </div>
          </div>
          <div className="progress" style={{ margin: '0 16px', borderRadius: 4 }}><i style={{ width: doneCount * 10 + '%' }} /></div>
          <ol>
            {steps.map((s, i) => (
              <li key={i} className={(s.done ? 'done' : '') + (i === nextIdx ? ' next' : '')}>
                <span className="n">{s.done ? <Check size={12} strokeWidth={3} /> : i + 1}</span>
                <div className="grow">
                  <div className="lbl">{s.label}</div>
                  <div className="who">{USERS[s.who].name}</div>
                </div>
                {!s.done && <button className="btn sm ghost" onClick={() => jump(s)}>{x('Y aller', 'Go')}</button>}
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="guide-fab">
        <button className="btn navy" onClick={() => setOpen(!open)} style={{ boxShadow: '0 10px 30px rgba(8,20,52,.25)' }}>
          <PlayCircle size={17} />{x('Parcours jury', 'Jury walkthrough')}<span className="badge" style={{ background: 'var(--navy-2)', color: '#fff', borderColor: 'transparent', height: 20 }}>{doneCount}/10</span>
        </button>
      </div>
    </>
  )
}
