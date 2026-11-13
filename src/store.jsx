import { createContext, useContext, useReducer, useMemo, useState, useCallback, useEffect } from 'react'
import { INITIAL_PROJECTS, INITIAL_MEMBERS, INITIAL_VERSIONS, INITIAL_CONTRIBS, INITIAL_MESSAGES, USERS, T } from './data'
import { applyChanges } from './engine'
import { makeT } from './i18n'

const initialLogs = [
  { id: 'l1', projectId: 'teranga', actorId: 'u_amina', action: 'project.create', detail: 'Projet créé', at: T(24) },
  { id: 'l2', projectId: 'teranga', actorId: 'u_amina', action: 'member.invite', detail: 'Wanjiru Kamau invitée (contribuer)', at: T(19) },
  { id: 'l3', projectId: 'teranga', actorId: 'u_wanjiru', action: 'contrib.submit', detail: 'Contribution « Interface multilingue »', at: T(7) },
  { id: 'l4', projectId: 'teranga', actorId: 'u_amina', action: 'contrib.accept', detail: 'Contribution acceptée, version 3 créée', at: T(6) },
  { id: 'l5', projectId: 'teranga', actorId: 'u_amina', action: 'member.invite', detail: 'Youssef El Amrani invité (consulter)', at: T(10) },
]

export function initialState() {
  return {
    userId: null,
    lang: 'fr',
    lowData: false,
    projects: INITIAL_PROJECTS,
    members: INITIAL_MEMBERS,
    versions: INITIAL_VERSIONS,
    contribs: INITIAL_CONTRIBS,
    messages: INITIAL_MESSAGES,
    logs: initialLogs,
    notifs: [],
    joinRequests: [],
    demo: { downloaded: false, blockedSeen: false, restored: false, deniedSeen: false },
  }
}

let seq = 100
const id = (p) => p + ++seq
const nowIso = () => new Date().toISOString()

function log(state, projectId, action, detail) {
  return [{ id: id('l'), projectId, actorId: state.userId, action, detail, at: nowIso() }, ...state.logs]
}

function reducer(state, a) {
  switch (a.type) {
    case 'login': return { ...state, userId: a.userId, lang: a.lang ?? state.lang }
    case 'logout': return { ...state, userId: null }
    case 'lang': return { ...state, lang: a.lang }
    case 'lowData': return { ...state, lowData: !state.lowData }
    case 'demoFlag': return { ...state, demo: { ...state.demo, [a.key]: true } }
    case 'reset': return { ...initialState(), userId: state.userId, lang: state.lang }

    case 'project.create': {
      const p = { ...a.project, id: a.project.id, ownerId: state.userId, createdAt: nowIso(), cohort: 'nov26', week: 1, lookingFor: [] }
      return {
        ...state,
        projects: [p, ...state.projects],
        members: { ...state.members, [p.id]: [{ userId: state.userId, perm: 'owner', status: 'active', since: nowIso() }] },
        versions: { ...state.versions, [p.id]: [{ n: 1, files: a.files, authorId: state.userId, message: 'Version initiale', at: nowIso(), source: 'initial' }] },
        logs: log(state, p.id, 'project.create', 'Projet créé'),
      }
    }

    case 'member.invite': {
      const list = state.members[a.projectId] ?? []
      if (list.some((m) => m.userId === a.userId)) return state
      const u = USERS[a.userId]
      return {
        ...state,
        members: { ...state.members, [a.projectId]: [...list, { userId: a.userId, perm: a.perm, status: 'pending', since: nowIso() }] },
        notifs: [{ id: id('n'), to: a.userId, kind: 'invite', projectId: a.projectId, perm: a.perm, from: state.userId, at: nowIso(), read: false }, ...state.notifs],
        logs: log(state, a.projectId, 'member.invite', `${u.name} invité·e (${a.perm === 'contribute' ? 'contribuer' : 'consulter'})`),
      }
    }

    case 'member.respond': {
      const list = state.members[a.projectId].map((m) => (m.userId === state.userId ? { ...m, status: a.accept ? 'active' : 'declined' } : m)).filter((m) => m.status !== 'declined')
      const proj = state.projects.find((p) => p.id === a.projectId)
      return {
        ...state,
        members: { ...state.members, [a.projectId]: list },
        notifs: [
          { id: id('n'), to: proj.ownerId, kind: a.accept ? 'invite.accepted' : 'invite.declined', projectId: a.projectId, from: state.userId, at: nowIso(), read: false },
          ...state.notifs.map((n) => (n.to === state.userId && n.kind === 'invite' && n.projectId === a.projectId ? { ...n, read: true, done: true } : n)),
        ],
        logs: log(state, a.projectId, a.accept ? 'member.accept' : 'member.decline', a.accept ? 'Invitation acceptée' : 'Invitation refusée'),
      }
    }

    case 'member.perm': {
      const list = state.members[a.projectId].map((m) => (m.userId === a.userId ? { ...m, perm: a.perm } : m))
      return { ...state, members: { ...state.members, [a.projectId]: list }, logs: log(state, a.projectId, 'member.perm', `${USERS[a.userId].name} : ${a.perm === 'contribute' ? 'contribuer' : 'consulter'}`) }
    }

    case 'member.remove': {
      const list = state.members[a.projectId].filter((m) => m.userId !== a.userId)
      return { ...state, members: { ...state.members, [a.projectId]: list }, logs: log(state, a.projectId, 'member.remove', `${USERS[a.userId].name} retiré·e du projet`) }
    }

    case 'join.request': {
      const proj = state.projects.find((p) => p.id === a.projectId)
      return {
        ...state,
        joinRequests: [...state.joinRequests, { projectId: a.projectId, userId: state.userId, at: nowIso() }],
        notifs: [{ id: id('n'), to: proj.ownerId, kind: 'join', projectId: a.projectId, from: state.userId, at: nowIso(), read: false }, ...state.notifs],
        logs: log(state, a.projectId, 'member.request', 'Demande de collaboration'),
      }
    }

    case 'join.approve': {
      const list = state.members[a.projectId] ?? []
      return {
        ...state,
        members: { ...state.members, [a.projectId]: [...list, { userId: a.userId, perm: a.perm, status: 'active', since: nowIso() }] },
        joinRequests: state.joinRequests.filter((r) => !(r.projectId === a.projectId && r.userId === a.userId)),
        notifs: [{ id: id('n'), to: a.userId, kind: 'invite.accepted', projectId: a.projectId, from: state.userId, at: nowIso(), read: false }, ...state.notifs],
        logs: log(state, a.projectId, 'member.accept', `Demande de ${USERS[a.userId].name} acceptée (${a.perm === 'contribute' ? 'contribuer' : 'consulter'})`),
      }
    }

    case 'copy.download':
      return { ...state, demo: { ...state.demo, downloaded: true }, logs: log(state, a.projectId, 'copy.download', `Copie de travail v${a.version} téléchargée`) }

    case 'contrib.submit': {
      const c = { id: a.contrib.cid ?? id('c'), ...a.contrib, authorId: state.userId, createdAt: nowIso(), status: a.contrib.blocked ? 'blocked' : 'pending' }
      const proj = state.projects.find((p) => p.id === c.projectId)
      return {
        ...state,
        contribs: [c, ...state.contribs],
        demo: a.contrib.blocked ? { ...state.demo, blockedSeen: true } : state.demo,
        notifs: c.status === 'pending' ? [{ id: id('n'), to: proj.ownerId, kind: 'contrib', projectId: c.projectId, contribId: c.id, from: state.userId, at: nowIso(), read: false }, ...state.notifs] : state.notifs,
        logs: log(state, c.projectId, c.status === 'blocked' ? 'contrib.blocked' : 'contrib.submit', c.status === 'blocked' ? `Archive « ${c.archiveName} » refusée par la validation` : `Contribution « ${c.title} »`),
      }
    }

    case 'contrib.decide': {
      const c = state.contribs.find((x) => x.id === a.contribId)
      const versions = state.versions[c.projectId]
      let newVersions = versions
      let label = ''
      if (a.accept) {
        const cur = versions[versions.length - 1]
        const n = cur.n + 1
        newVersions = [...versions, { n, files: applyChanges(cur.files, c.changes), authorId: c.authorId, approvedBy: state.userId, message: c.title, at: nowIso(), source: 'contribution', contribId: c.id }]
        label = `Contribution acceptée, version ${n} créée`
      } else label = `Contribution « ${c.title} » rejetée, version principale inchangée`
      return {
        ...state,
        contribs: state.contribs.map((x) => (x.id === c.id ? { ...x, status: a.accept ? 'accepted' : 'rejected', decidedAt: nowIso(), decisionNote: a.note, decisionTr: a.noteTr, decisionLang: a.noteLang, decidedBy: state.userId, resultVersion: a.accept ? newVersions.at(-1).n : null } : x)),
        versions: { ...state.versions, [c.projectId]: newVersions },
        notifs: [{ id: id('n'), to: c.authorId, kind: a.accept ? 'contrib.accepted' : 'contrib.rejected', projectId: c.projectId, contribId: c.id, from: state.userId, at: nowIso(), read: false }, ...state.notifs],
        logs: log(state, c.projectId, a.accept ? 'contrib.accept' : 'contrib.reject', label),
      }
    }

    case 'version.restore': {
      const versions = state.versions[a.projectId]
      const src = versions.find((v) => v.n === a.n)
      const n = versions.at(-1).n + 1
      return {
        ...state,
        versions: { ...state.versions, [a.projectId]: [...versions, { n, files: src.files, authorId: state.userId, message: `Restauration de la version ${a.n}`, at: nowIso(), source: 'restore', restoredFrom: a.n }] },
        demo: { ...state.demo, restored: true },
        logs: log(state, a.projectId, 'version.restore', `Version ${a.n} restaurée comme version ${n}`),
      }
    }

    case 'message.post': {
      const list = state.messages[a.projectId] ?? []
      return { ...state, messages: { ...state.messages, [a.projectId]: [...list, { id: id('m'), authorId: state.userId, lang: a.lang, text: a.text, tr: a.tr ?? {}, at: nowIso(), pendingTr: !a.tr } ] } }
    }

    case 'notif.read': return { ...state, notifs: state.notifs.map((n) => (n.to === state.userId ? { ...n, read: true } : n)) }
    default: return state
  }
}

const Ctx = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const [toasts, setToasts] = useState([])
  const toast = useCallback((msg, kind = 'info') => {
    const tid = Math.random()
    setToasts((t) => [...t.slice(-1), { id: tid, msg, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== tid)), 4200)
  }, [])

  useEffect(() => {
    const rtl = state.lang === 'ar'
    document.documentElement.dir = rtl ? 'rtl' : 'ltr'
    document.documentElement.lang = state.lang
  }, [state.lang])

  const value = useMemo(() => {
    const t = makeT(state.lang)
    const me = state.userId ? USERS[state.userId] : null
    const perm = (projectId, userId = state.userId) => {
      const m = (state.members[projectId] ?? []).find((x) => x.userId === userId && x.status === 'active')
      return m ? m.perm : null
    }
    const pendingInvite = (projectId, userId = state.userId) => (state.members[projectId] ?? []).some((x) => x.userId === userId && x.status === 'pending')
    return { state, dispatch, t, me, perm, pendingInvite, toast }
  }, [state, toast])

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((x) => <div key={x.id} className={'toast ' + x.kind}>{x.msg}</div>)}
      </div>
    </Ctx.Provider>
  )
}

export const useStore = () => useContext(Ctx)
