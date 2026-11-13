import { Clock, Check, GitBranch, Users, Inbox, FileArchive, Compass, ChevronRight, History, Mail, Target } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../nav'
import { Avatar, PermBadge, StatusBadge, ago, Empty } from '../components/ui'
import { USERS, COHORTS, MILESTONES } from '../data'

export function CohortTrack({ cohort }) {
  const { t } = useStore()
  const pct = ((cohort.current - 1) / (cohort.weeks - 1)) * 84
  return (
    <div className="track" aria-label={`${t('d.week')} ${cohort.current}/${cohort.weeks}`}>
      <span className="fill" style={{ width: pct + '%' }} />
      {MILESTONES.map((m) => (
        <div key={m.week} className={'st' + (m.week < cohort.current ? ' done' : m.week === cohort.current ? ' now' : '')}>
          <i>{m.week < cohort.current && <Check size={11} strokeWidth={3} />}</i>
          <span>{t.x(m.label, ['Scoping and team', 'First version', 'Contributions open', 'Review and iterate', 'Stabilize', 'Public demo'][m.week - 1])}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { t, state, me, perm, dispatch, toast } = useStore()
  const { go } = useNav()
  const x = t.x
  const cohort = COHORTS.nov26

  const myProjects = state.projects.filter((p) => perm(p.id))
  const invites = state.projects.filter((p) => (state.members[p.id] ?? []).some((m) => m.userId === me.id && m.status === 'pending'))
  const toReview = state.contribs.filter((c) => c.status === 'pending' && perm(c.projectId) === 'owner')
  const myContribs = state.contribs.filter((c) => c.authorId === me.id)
  const accepted = myContribs.filter((c) => c.status === 'accepted').length
  const versionsShipped = myProjects.filter((p) => perm(p.id) === 'owner').reduce((s, p) => s + (state.versions[p.id]?.length ?? 0), 0)
  const teammates = new Set(myProjects.flatMap((p) => (state.members[p.id] ?? []).filter((m) => m.status === 'active').map((m) => m.userId)))
  teammates.delete(me.id)
  const countries = new Set([...teammates].map((id) => USERS[id].country))
  const feed = state.logs.filter((l) => perm(l.projectId)).slice(0, 7)

  const todo = [
    ...invites.map((p) => ({ key: 'i' + p.id, icon: <Mail size={17} />, title: x(`Invitation sur ${p.name}`, `Invitation to ${p.name}`), sub: x(`De ${USERS[p.ownerId].name}`, `From ${USERS[p.ownerId].name}`), invite: p })),
    ...toReview.map((c) => ({ key: c.id, icon: <FileArchive size={17} />, title: c.title, sub: x(`Proposée par ${USERS[c.authorId].name}, basée sur la v${c.baseVersion}`, `Proposed by ${USERS[c.authorId].name}, based on v${c.baseVersion}`), action: () => go('project', { id: c.projectId, tab: 'contribs', contrib: c.id }), cta: t('a.review') })),
    ...myProjects.filter((p) => perm(p.id) === 'owner' && p.lookingFor.length && !(state.members[p.id] ?? []).some((m) => m.status === 'pending')).slice(0, 1).map((p) => ({ key: 'lf' + p.id, icon: <Users size={17} />, title: x(`${p.name} recherche : ${p.lookingFor.join(', ')}`, `${p.name} is looking for: ${p.lookingFor.join(', ')}`), sub: x('Invitez un collaborateur pour ouvrir les contributions', 'Invite a collaborator to open contributions'), action: () => go('project', { id: p.id, tab: 'members' }), cta: t('a.invite') })),
    ...myContribs.filter((c) => c.status === 'rejected').slice(0, 1).map((c) => ({ key: 'r' + c.id, icon: <History size={17} />, title: x(`Retravailler « ${c.title} »`, `Rework “${c.title}”`), sub: c.decisionNote || x('Rejetée par le propriétaire', 'Rejected by the owner'), action: () => go('project', { id: c.projectId, tab: 'contribs', contrib: c.id }), cta: t('a.open') })),
  ]

  return (
    <>
      <div className="page-h">
        <div>
          <h1>{t('d.hello')}, {me.name.split(' ')[0]}</h1>
          <p className="sub"><Clock size={14} />{x('Semaine 4 : revue et itérations. Prochain point d’équipe vendredi 17:00 GMT.', 'Week 4: review and iterate. Next team check-in Friday 17:00 GMT.')}</p>
        </div>
        <div className="navy-bar" style={{ minWidth: 300 }}>
          <Inbox size={20} />
          <span className="v">{toReview.length + invites.length}</span>
          <span className="l">{x('Actions qui vous attendent', 'Actions waiting for you')}</span>
        </div>
      </div>

      <div className="grid g-main">
        <div className="grid" style={{ alignContent: 'start' }}>
          <section className="panel">
            <div className="panel-h">
              <div><h3>{cohort.name}</h3><p className="tiny muted" style={{ marginTop: 2 }}>{x(`${cohort.projects} projets, ${cohort.members} membres, démo publique ${cohort.demoDay}`, `${cohort.projects} projects, ${cohort.members} members, public demo ${cohort.demoDay}`)}</p></div>
              <span className="badge blue">{t('d.week')} {cohort.current}/{cohort.weeks}</span>
            </div>
            <div className="panel-b"><CohortTrack cohort={cohort} /></div>
          </section>

          <section className="panel">
            <div className="panel-h"><h3>{x('À faire', 'To do')}</h3><span className="muted small">{todo.length}</span></div>
            {todo.length === 0 ? (
              <Empty icon={<Target size={26} />} title={x('Rien en attente', 'Nothing pending')} action={<button className="btn ghost sm" onClick={() => go('explore')}><Compass size={15} />{x('Trouver un projet à rejoindre', 'Find a project to join')}</button>}>
                {x('Rejoignez un projet de la cohorte ou proposez le vôtre pour commencer à accumuler des preuves.', 'Join a cohort project or start your own to begin building proof.')}
              </Empty>
            ) : (
              <div style={{ padding: 8 }}>
                {todo.map((it) => (
                  <div key={it.key} className="row" style={{ padding: '12px 14px', gap: 14, borderRadius: 10 }}>
                    <span className="logo-tile" style={{ width: 38, height: 38, padding: 0, border: 0, cursor: 'default' }}>{it.icon}</span>
                    <div className="grow"><b className="ellipsis" style={{ display: 'block' }}>{it.title}</b><span className="small muted ellipsis" style={{ display: 'block' }}>{it.sub}</span></div>
                    {it.invite ? (
                      <div className="row" style={{ gap: 6 }}>
                        <button className="btn ghost sm" onClick={() => { dispatch({ type: 'member.respond', projectId: it.invite.id, accept: false }); toast(x('Invitation refusée', 'Invitation declined')) }}>{t('a.decline')}</button>
                        <button className="btn primary sm" onClick={() => { dispatch({ type: 'member.respond', projectId: it.invite.id, accept: true }); toast(x(`Vous avez rejoint ${it.invite.name}`, `You joined ${it.invite.name}`), 'ok'); go('project', { id: it.invite.id, tab: 'files' }) }}>{t('a.accept')}</button>
                      </div>
                    ) : <button className="btn ghost sm" onClick={it.action}>{it.cta}</button>}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel-h"><h3>{t('nav.projects')}</h3><button className="btn quiet sm" onClick={() => go('projects')}>{x('Tout voir', 'See all')}<ChevronRight size={15} className="flip" /></button></div>
            {myProjects.length === 0 ? (
              <p className="muted small" style={{ padding: 22 }}>{x('Vous n’êtes membre d’aucun projet pour l’instant.', 'You are not a member of any project yet.')}</p>
            ) : (
              <div style={{ padding: '6px 10px 10px', overflowX: 'auto' }}>
                <table className="table responsive">
                  <thead><tr><th>{x('Projet', 'Project')}</th><th>{x('Rôle', 'Role')}</th><th>Version</th><th>{x('Équipe', 'Team')}</th><th>{x('Progression', 'Progress')}</th><th /></tr></thead>
                  <tbody>
                    {myProjects.map((p) => {
                      const v = state.versions[p.id]?.at(-1)
                      const mem = (state.members[p.id] ?? []).filter((m) => m.status === 'active')
                      return (
                        <tr key={p.id}>
                          <td className="full"><div className="row"><span className="logo-tile" style={{ width: 32, height: 32, fontSize: 14, padding: 0, border: 0 }}>{p.name[0]}</span><b>{p.name}</b></div></td>
                          <td data-l={x('Rôle', 'Role')}><PermBadge perm={perm(p.id)} /></td>
                          <td data-l="Version"><span className="mono">v{v?.n ?? 1}</span></td>
                          <td data-l={x('Équipe', 'Team')}><div className="stack">{mem.slice(0, 4).map((m) => <Avatar key={m.userId} id={m.userId} size="sm" />)}</div></td>
                          <td data-l={x('Progression', 'Progress')} style={{ minWidth: 110 }}><div className="progress"><i style={{ width: (p.week / 6) * 100 + '%' }} /></div><span className="tiny muted">{t('d.week')} {p.week}/6</span></td>
                          <td className="full" style={{ textAlign: 'end' }}><button className="btn ghost sm" onClick={() => go('project', { id: p.id })}>{t('a.open')}</button></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <div className="grid" style={{ alignContent: 'start' }}>
          <div className="navy-panel">
            <div className="stat"><div><div className="stat-l">{x('Versions livrées', 'Versions shipped')}</div><div className="stat-v">{versionsShipped}</div></div><span className="chip"><GitBranch size={16} /></span></div>
            <div className="stat"><div><div className="stat-l">{x('Contributions acceptées', 'Accepted contributions')}</div><div className="stat-v">{accepted}<small>/ {myContribs.filter((c) => c.status !== 'blocked').length || 0}</small></div></div><span className="chip light"><Check size={16} /></span></div>
            <div className="stat"><div><div className="stat-l">{x('Coéquipiers', 'Teammates')}</div><div className="stat-v">{teammates.size}<small>{x(`dans ${countries.size} pays`, `in ${countries.size} countries`)}</small></div></div><span className="chip"><Users size={16} /></span></div>
          </div>

          <section className="panel">
            <div className="panel-h"><h3>{t('d.activity')}</h3></div>
            <div style={{ padding: '6px 22px 14px' }}>
              {feed.length === 0 && <p className="muted small" style={{ padding: '12px 0' }}>{x('L’activité de vos projets apparaîtra ici.', 'Activity from your projects will appear here.')}</p>}
              {feed.map((l) => {
                const p = state.projects.find((pp) => pp.id === l.projectId)
                return (
                  <div key={l.id} className="row" style={{ padding: '10px 0', alignItems: 'flex-start', gap: 12 }}>
                    <Avatar id={l.actorId} size="sm" />
                    <div className="grow small">
                      <span><b>{USERS[l.actorId]?.name.split(' ')[0]}</b> <span className="muted">{p?.name}</span></span>
                      <span style={{ display: 'block' }}>{l.detail}</span>
                      <span className="tiny muted">{ago(l.at, state.lang)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
