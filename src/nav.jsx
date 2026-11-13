import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const NavCtx = createContext(null)
const VIEWS = ['landing', 'auth', 'dashboard', 'projects', 'explore', 'people', 'profile', 'settings', 'glossary', 'new']

function parseHash() {
  const h = (location.hash || '').slice(1)
  if (h.startsWith('p-')) return { name: 'project', params: { id: h.slice(2), tab: 'overview' } }
  if (VIEWS.includes(h)) return { name: h, params: {} }
  return { name: 'landing', params: {} }
}

export function NavProvider({ children }) {
  const [route, setRoute] = useState(parseHash)
  useEffect(() => {
    const on = () => setRoute((r) => {
      const n = parseHash()
      return n.name === r.name && n.params.id === r.params.id ? r : n
    })
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const go = useCallback((name, params = {}) => {
    setRoute({ name, params })
    const h = name === 'project' ? 'p-' + params.id : name
    try { if (location.hash.slice(1) !== h) history.replaceState(null, '', '#' + h) } catch { /* cadre sandbox */ }
    window.scrollTo?.(0, 0)
  }, [])
  return <NavCtx.Provider value={{ route, go }}>{children}</NavCtx.Provider>
}

export const useNav = () => useContext(NavCtx)
