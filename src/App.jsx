import { useState } from 'react'
import { StoreProvider, useStore } from './store'
import { NavProvider, useNav } from './nav'
import { Sidebar, Topbar, Footer } from './components/Shell'
import DemoGuide from './components/DemoGuide'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Project from './pages/Project'
import NewProject from './pages/NewProject'
import { Projects, Explore, People } from './pages/Community'
import { Profile, Settings, Glossary } from './pages/Account'

function Routes() {
  const { route } = useNav()
  const { state } = useStore()
  const [menu, setMenu] = useState(false)
  if (route.name === 'landing') return <Landing />
  if (!state.userId || route.name === 'auth') return <Auth />
  const pages = { dashboard: Dashboard, projects: Projects, explore: Explore, people: People, profile: Profile, settings: Settings, glossary: Glossary, new: NewProject, project: Project }
  const Page = pages[route.name] ?? Dashboard
  return (
    <div className={'app' + (state.lowData ? ' lowdata' : '')}>
      <Sidebar open={menu} onClose={() => setMenu(false)} />
      <div className="main">
        <Topbar onMenu={() => setMenu(true)} />
        <main className="content" key={route.name + (route.params.id ?? '')}><Page /></main>
        <Footer />
      </div>
      <DemoGuide />
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <NavProvider><Routes /></NavProvider>
    </StoreProvider>
  )
}
