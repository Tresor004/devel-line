import { useState } from 'react'
import { Search, Plus, Lock, Clock, Languages, UserPlus, Check, Users, FolderGit2 } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../nav'
import { Avatar, PermBadge, Empty, overlap, tzLabel } from '../components/ui'
import { USERS, LANG_NAMES } from '../data'

export function ProjectCard({ p }) {
  const { t, state, perm } = useStore()
  const { go } = useNav()
  const x = t.x
  const mem = (state.members[p.id] ?? []).filter((m) => m.status === 'active')
  const v = state.versions[p.id]?.at(-1)
  const my = perm(p.id)
  return (
    <button className="pcard" onClick={() => go('project', { id: p.id })}>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <span className="logo">{p.name[0]}</span>
        <div className="grow">
          <div className="row sp" style={{ gap: 8 }}><h3 className="ellipsis">{p.name}</h3>{p.visibility === 'private' ? <Lock size={14} color="var(--muted)" /> : my ? <PermBadge perm={my} /> : null}</div>
          <p className="small muted" style={{ marginTop: 3, lineHeight: 1.45 }}>{p.tagline}</p>
        </div>
      </div>
      <div className="row wrap" style={{ gap: 6 }}>{p.stack.slice(0, 3).map((s) => <span key={s} className="tag">{s}</span>)}</div>
      <div className="col" style={{ gap: 6 }}>
        <div className="row sp tiny muted"><span>{t('d.week')} {p.week}/6</span><span className="mono">v{v?.n ?? 1}</span></div>
        <div className="progress"><i style={{ width: (p.week / 6) * 100 + '%' }} /></div>
      </div>
      <div className="row sp" style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
        <div className="stack">{mem.slice(0, 4).map((m) => <Avatar key={m.userId} id={m.userId} size="sm" />)}</div>
        <span className="tiny muted row" style={{ gap: 5 }}><Languages size={13} />{p.langs.map((l) => l.toUpperCase()).join(' ')}</span>
      </div>
      {p.level === 'Débutants bienvenus' && <span className="badge ok" style={{ alignSelf: 'flex-start' }}>{t('lvl.beginner')}</span>}
    </button>
  )
}

export function Projects() {
  const { t, state, perm } = useStore()
  const { go } = useNav()
  const x = t.x
  const mine = state.projects.filter((p) => perm(p.id))
  const owned = mine.filter((p) => perm(p.id) === 'owner')
  const joined = mine.filter((p) => perm(p.id) !== 'owner')
  return (
    <>
      <div className="page-h">
        <div><h1>{t('nav.projects')}</h1><p className="sub">{x(`${owned.length} en propriété, ${joined.length} en collaboration`, `${owned.length} owned, ${joined.length} collaborating`)}</p></div>
        <button className="btn primary" onClick={() => go('new')}><Plus size={17} />{t('nav.new')}</button>
      </div>
      {mine.length === 0 ? (
        <div className="panel"><Empty icon={<FolderGit2 size={26} />} title={x('Aucun projet pour l’instant', 'No projects yet')} action={<div className="row"><button className="btn ghost" onClick={() => go('explore')}>{t('nav.explore')}</button><button className="btn primary" onClick={() => go('new')}>{t('nav.new')}</button></div>}>{x('Créez votre projet ou rejoignez celui d’une équipe de la cohorte.', 'Create your own project or join a cohort team.')}</Empty></div>
      ) : (
        <>
          {owned.length > 0 && <><h2 style={{ marginBottom: 14 }}>{x('Mes projets', 'Owned')}</h2><div className="grid g-3" style={{ marginBottom: 32 }}>{owned.map((p) => <ProjectCard key={p.id} p={p} />)}</div></>}
          {joined.length > 0 && <><h2 style={{ marginBottom: 14 }}>{x('Projets rejoints', 'Joined')}</h2><div className="grid g-3">{joined.map((p) => <ProjectCard key={p.id} p={p} />)}</div></>}
        </>
      )}
    </>
  )
}

export function Explore() {
  const { t, state } = useStore()
  const { route } = useNav()
  const x = t.x
  const [q, setQ] = useState(route.params.q ?? '')
  const [lvl, setLvl] = useState('all')
  const [lang, setLang] = useState('all')
  const list = state.projects.filter((p) => p.visibility === 'public')
    .filter((p) => (p.name + p.tagline + p.stack.join(' ')).toLowerCase().includes(q.toLowerCase()))
    .filter((p) => lvl === 'all' || (lvl === 'beg' ? p.level === 'Débutants bienvenus' : p.level !== 'Débutants bienvenus'))
    .filter((p) => lang === 'all' || p.langs.includes(lang))
  return (
    <>
      <div className="page-h">
        <div><h1>{t('nav.explore')}</h1><p className="sub">{x('Projets publics de la communauté. Les démos sont accessibles à tous, le code aux membres.', 'Public community projects. Demos are open to all, code to members.')}</p></div>
      </div>
      <div className="row wrap" style={{ gap: 12, marginBottom: 22 }}>
        <label className="search" style={{ display: 'flex', background: 'var(--paper)', maxWidth: 360 }}><Search size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={x('Nom, techno…', 'Name, tech…')} /></label>
        <div className="seg">
          <button className={lvl === 'all' ? 'on' : ''} onClick={() => setLvl('all')}>{x('Tous niveaux', 'All levels')}</button>
          <button className={lvl === 'beg' ? 'on' : ''} onClick={() => setLvl('beg')}>{t('lvl.beginner')}</button>
          <button className={lvl === 'adv' ? 'on' : ''} onClick={() => setLvl('adv')}>{x('Confirmés', 'Experienced')}</button>
        </div>
        <select className="select" style={{ width: 'auto' }} value={lang} onChange={(e) => setLang(e.target.value)} aria-label={x('Langue de l’équipe', 'Team language')}>
          <option value="all">{x('Toutes les langues', 'All languages')}</option>
          {['fr', 'en', 'sw', 'pt', 'ar', 'wo', 'yo'].map((l) => <option key={l} value={l}>{LANG_NAMES[l]}</option>)}
        </select>
      </div>
      {list.length === 0 ? <div className="panel"><Empty icon={<Search size={26} />} title={x('Aucun projet ne correspond', 'No matching project')}>{x('Élargissez les filtres ou lancez votre propre projet.', 'Widen the filters or start your own project.')}</Empty></div>
        : <div className="grid g-3">{list.map((p) => <ProjectCard key={p.id} p={p} />)}</div>}
      <p className="tiny muted" style={{ marginTop: 18 }}>{x('Une barrière de langue n’en est pas une : les échanges sont traduits automatiquement.', 'Language is not a barrier: conversations are auto-translated.')}</p>
    </>
  )
}

export function People() {
  const { t, state, me, perm, dispatch, toast } = useStore()
  const x = t.x
  const [skill, setSkill] = useState('all')
  const [minOverlap, setMinOverlap] = useState(0)
  const ownedProjects = state.projects.filter((p) => perm(p.id) === 'owner')
  const target = ownedProjects[0]
  const others = Object.values(USERS).filter((u) => u.id !== me.id && u.id !== 'u_new')
  const skills = [...new Set(others.flatMap((u) => u.skills))].sort()
  const list = others.filter((u) => (skill === 'all' || u.skills.includes(skill)) && overlap(me.tz, u.tz) >= minOverlap)
    .map((u) => ({ u, score: u.skills.filter((s) => me.skills.includes(s)).length * 2 + overlap(me.tz, u.tz) / 2 + (u.level === 'Junior' ? 1 : 0) }))
    .sort((a, b) => b.score - a.score)
  return (
    <>
      <div className="page-h">
        <div><h1>{t('nav.people')}</h1><p className="sub">{x('Suggestions basées sur vos technologies, vos horaires communs et le niveau recherché.', 'Suggestions based on your tech, shared hours and target level.')}</p></div>
      </div>
      <div className="row wrap" style={{ gap: 12, marginBottom: 22 }}>
        <select className="select" style={{ width: 'auto' }} value={skill} onChange={(e) => setSkill(e.target.value)} aria-label={x('Compétence', 'Skill')}>
          <option value="all">{x('Toutes les compétences', 'All skills')}</option>
          {skills.map((s) => <option key={s}>{s}</option>)}
        </select>
        <div className="seg">
          {[0, 6, 8].map((h) => <button key={h} className={minOverlap === h ? 'on' : ''} onClick={() => setMinOverlap(h)}>{h === 0 ? x('Tous fuseaux', 'Any time zone') : x(`${h} h communes et +`, `${h}+ h overlap`)}</button>)}
        </div>
      </div>
      <div className="grid g-3">
        {list.map(({ u }) => {
          const ov = overlap(me.tz, u.tz)
          const common = u.langs.filter((l) => me.langs.includes(l))
          const inTarget = target && (state.members[target.id] ?? []).some((m) => m.userId === u.id)
          return (
            <div key={u.id} className="pcard" style={{ cursor: 'default' }}>
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <Avatar id={u.id} size="lg" showCountry />
                <div className="grow"><h3>{u.name}</h3><p className="small muted">{u.title}</p><p className="tiny muted">{u.city}, {u.countryName}</p></div>
              </div>
              <p className="small" style={{ color: 'var(--ink-2)' }}>{u.bio}</p>
              <div className="row wrap" style={{ gap: 6 }}>{u.skills.map((s) => <span key={s} className={'tag'} style={me.skills.includes(s) ? { borderColor: 'var(--sky-2)', background: 'var(--sky)', color: 'var(--cobalt)' } : null}>{s}</span>)}</div>
              <div className="col small" style={{ gap: 6, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                <span className="row" style={{ gap: 8 }}><Clock size={14} color="var(--muted)" />{tzLabel(u.tz)}, {x(`${ov} h de travail en commun`, `${ov} h of shared working time`)}</span>
                <span className="row" style={{ gap: 8 }}><Languages size={14} color="var(--muted)" />{common.length ? x(`Langue commune : ${common.map((l) => LANG_NAMES[l]).join(', ')}`, `Shared language: ${common.map((l) => LANG_NAMES[l]).join(', ')}`) : x(`Parle ${u.langs.map((l) => LANG_NAMES[l]).join(', ')}, traduction auto`, `Speaks ${u.langs.map((l) => LANG_NAMES[l]).join(', ')}, auto-translated`)}</span>
              </div>
              <div className="row sp">
                <span className="badge">{u.level}</span>
                {target ? (
                  <button className="btn ghost sm" disabled={inTarget} onClick={() => { dispatch({ type: 'member.invite', projectId: target.id, userId: u.id, perm: 'contribute' }); toast(x(`Invitation sur ${target.name} envoyée à ${u.name}`, `Invitation to ${target.name} sent to ${u.name}`), 'ok') }}>
                    {inTarget ? <><Check size={14} />{x('Dans l’équipe', 'In team')}</> : <><UserPlus size={14} />{x(`Inviter sur ${target.name}`, `Invite to ${target.name}`)}</>}
                  </button>
                ) : <span className="tiny muted">{x('Créez un projet pour inviter', 'Create a project to invite')}</span>}
              </div>
            </div>
          )
        })}
      </div>
      {list.length === 0 && <div className="panel"><Empty icon={<Users size={26} />} title={x('Personne ne correspond', 'Nobody matches')}>{x('Réduisez le nombre d’heures communes demandées.', 'Lower the required shared hours.')}</Empty></div>}
    </>
  )
}
