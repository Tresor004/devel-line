import { useState } from 'react'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../nav'
import { Logo, Avatar } from '../components/ui'
import { USERS, PERSONAS, LANG_NAMES } from '../data'

const COUNTRIES = [['SN', 'Sénégal'], ['CI', 'Côte d’Ivoire'], ['CM', 'Cameroun'], ['GH', 'Ghana'], ['NG', 'Nigeria'], ['KE', 'Kenya'], ['TZ', 'Tanzanie'], ['ET', 'Éthiopie'], ['MA', 'Maroc'], ['TN', 'Tunisie'], ['AO', 'Angola'], ['MZ', 'Mozambique'], ['RW', 'Rwanda'], ['BJ', 'Bénin'], ['CD', 'RD Congo'], ['ZA', 'Afrique du Sud']]

export default function Auth() {
  const { t, dispatch, state, toast } = useStore()
  const { go } = useNav()
  const x = t.x
  const [mode, setMode] = useState('demo')
  const [f, setF] = useState({ name: '', email: '', country: 'CI', level: 'Junior', langs: ['fr'], ui: state.lang })

  const login = (id) => {
    dispatch({ type: 'login', userId: id })
    go('dashboard')
    toast(x(`Bienvenue, ${USERS[id].name.split(' ')[0]}`, `Welcome, ${USERS[id].name.split(' ')[0]}`), 'ok')
  }
  const register = (e) => {
    e.preventDefault()
    if (!f.name.trim() || !/.+@.+\..+/.test(f.email)) { toast(x('Renseignez un nom et une adresse e-mail valide.', 'Enter a name and a valid email address.'), 'bad'); return }
    const c = COUNTRIES.find((k) => k[0] === f.country)
    USERS.u_new = { id: 'u_new', name: f.name.trim(), handle: f.name.trim().toLowerCase().replace(/\s+/g, '.'), city: '', country: c[0], countryName: c[1], tz: 0, langs: f.langs, uiLang: f.ui, level: f.level, title: 'Développeur·se', skills: [], color: '#2457F5', bio: '' }
    dispatch({ type: 'login', userId: 'u_new', lang: f.ui })
    go('dashboard')
    toast(x('Compte créé. Rejoignez un projet pour commencer.', 'Account created. Join a project to get started.'), 'ok')
  }
  const toggleLang = (l) => setF((s) => ({ ...s, langs: s.langs.includes(l) ? s.langs.filter((x) => x !== l) : [...s.langs, l] }))

  return (
    <div className="auth">
      <aside className="auth-side">
        <a className="row" href="#landing" onClick={(e) => { e.preventDefault(); go('landing') }} style={{ color: '#fff', gap: 10, fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 18 }}><Logo /> DEVEL line</a>
        <div>
          <h2>{x('Le code que vous livrez parle mieux que votre CV.', 'The code you ship speaks louder than your CV.')}</h2>
          <p style={{ marginTop: 16, maxWidth: 30 + 'em', lineHeight: 1.6 }}>{x('52 développeurs de 11 pays avancent en ce moment dans la cohorte Novembre.', '52 developers from 11 countries are shipping in the November cohort right now.')}</p>
          <div className="stack" style={{ marginTop: 24 }}>
            {Object.keys(USERS).filter((k) => k !== 'u_new').map((id) => <Avatar key={id} id={id} />)}
          </div>
        </div>
        <p className="small">{x('Sénégal, Ghana, Nigeria, Kenya, Maroc, Angola, Éthiopie…', 'Senegal, Ghana, Nigeria, Kenya, Morocco, Angola, Ethiopia…')}</p>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <button className="btn quiet sm" onClick={() => go('landing')} style={{ marginBottom: 22, paddingInline: 6 }}><ArrowLeft size={15} />{t('a.back')}</button>
          <h1>{mode === 'demo' ? x('Se connecter', 'Sign in') : x('Créer un compte', 'Create an account')}</h1>
          <p className="muted" style={{ marginTop: 6 }}>{mode === 'demo' ? x('Choisissez un profil de démonstration pour suivre le parcours complet.', 'Pick a demo profile to follow the full flow.') : x('Deux minutes, sans carte bancaire.', 'Two minutes, no card needed.')}</p>

          <div className="seg" style={{ margin: '22px 0' }}>
            <button className={mode === 'demo' ? 'on' : ''} onClick={() => setMode('demo')}>{x('Profils de démo', 'Demo profiles')}</button>
            <button className={mode === 'new' ? 'on' : ''} onClick={() => setMode('new')}>{x('Nouveau compte', 'New account')}</button>
          </div>

          {mode === 'demo' ? (
            <div className="col" style={{ gap: 10 }}>
              {PERSONAS.map((p) => {
                const u = USERS[p.id]
                return (
                  <button key={p.id} className="persona" onClick={() => login(p.id)}>
                    <Avatar id={p.id} showCountry />
                    <span className="grow">
                      <b>{u.name}</b>
                      <span className="small muted" style={{ display: 'block' }}>{u.title}, {u.city}</span>
                      <span className="tiny" style={{ color: 'var(--cobalt)' }}>{p.role}</span>
                    </span>
                    <ChevronRight size={18} color="var(--muted)" className="flip" />
                  </button>
                )
              })}
              <p className="tiny muted" style={{ marginTop: 8 }}>{x('Vous pourrez changer de profil à tout moment depuis la barre du haut.', 'You can switch profiles anytime from the top bar.')}</p>
            </div>
          ) : (
            <form className="col" style={{ gap: 16 }} onSubmit={register}>
              <div className="field"><label htmlFor="n">{x('Nom complet', 'Full name')}</label><input id="n" className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></div>
              <div className="field"><label htmlFor="e">E-mail</label><input id="e" type="email" className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></div>
              <div className="grid g-2" style={{ gap: 12 }}>
                <div className="field"><label htmlFor="c">{x('Pays', 'Country')}</label>
                  <select id="c" className="select" value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })}>{COUNTRIES.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
                </div>
                <div className="field"><label htmlFor="l">{x('Niveau', 'Level')}</label>
                  <select id="l" className="select" value={f.level} onChange={(e) => setF({ ...f, level: e.target.value })}>
                    <option>Débutant</option><option>Junior</option><option>Intermédiaire</option><option>Senior</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>{x('Langues que vous parlez', 'Languages you speak')}</label>
                <div className="chipsel">
                  {['fr', 'en', 'sw', 'pt', 'ar', 'ha', 'yo', 'wo', 'am'].map((l) => <button type="button" key={l} className={f.langs.includes(l) ? 'on' : ''} onClick={() => toggleLang(l)}>{LANG_NAMES[l]}</button>)}
                </div>
                <span className="hint">{x('Les messages dans les autres langues vous seront traduits automatiquement.', 'Messages in other languages will be translated for you automatically.')}</span>
              </div>
              <button className="btn primary lg" type="submit">{x('Créer mon compte', 'Create my account')}</button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
