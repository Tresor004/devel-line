import { FileArchive, ShieldAlert, Languages, WifiOff, BookOpen, Clock, History, Users, Check, X, Award, Lock } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../nav'
import { Logo, Avatar } from '../components/ui'
import { UI_LANGS } from '../i18n'

export default function Landing() {
  const { t, state, dispatch } = useStore()
  const { go } = useNav()
  const x = t.x
  return (
    <div className="land">
      <header className="land-nav">
        <a className="row" href="#landing" style={{ gap: 10, color: 'var(--ink)', fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 18 }}><Logo /> DEVEL line</a>
        <nav className="links">
          <a href="#how" onClick={(e) => { e.preventDefault(); document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' }) }}>{x('Fonctionnement', 'How it works')}</a>
          <a href="#langs" onClick={(e) => { e.preventDefault(); document.getElementById('langs')?.scrollIntoView({ behavior: 'smooth' }) }}>{x('Langues', 'Languages')}</a>
          <a href="#safety" onClick={(e) => { e.preventDefault(); document.getElementById('safety')?.scrollIntoView({ behavior: 'smooth' }) }}>{x('Sécurité', 'Safety')}</a>
          <a href="#explore" onClick={(e) => { e.preventDefault(); go('auth') }}>{x('Projets publics', 'Public projects')}</a>
        </nav>
        <div className="row" style={{ marginInlineStart: 'auto' }}>
          <select className="select" style={{ height: 38, width: 'auto' }} value={state.lang} onChange={(e) => dispatch({ type: 'lang', lang: e.target.value })} aria-label="Langue">
            {UI_LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          <button className="btn quiet" onClick={() => go('auth')}>{x('Se connecter', 'Sign in')}</button>
          <button className="btn primary" onClick={() => go('auth')}>{x('Voir la démo', 'Try the demo')}</button>
        </div>
      </header>

      <section className="container hero">
        <div>
          <span className="badge blue" style={{ marginBottom: 22 }}><span className="pip" />{x('Cohorte Novembre 2026 en cours', 'November 2026 cohort in progress')}</span>
          <h1>{x('Shippez ensemble, gardez le contrôle, sortez avec des preuves.', 'Ship together, stay in control, leave with proof.')}</h1>
          <p className="lead">
            {x(
              'DEVEL line aide les développeurs africains, surtout les juniors, à terminer de vrais projets en équipe. On contribue avec une simple archive ZIP, le propriétaire valide chaque changement, et chaque version reste restaurable.',
              'DEVEL line helps African developers, juniors first, finish real projects as a team. Contribute with a plain ZIP archive, the owner approves every change, and every version stays restorable.'
            )}
          </p>
          <div className="ctas">
            <button className="btn primary lg" onClick={() => go('auth')}>{x('Rejoindre une cohorte', 'Join a cohort')}</button>
            <button className="btn ghost lg" onClick={() => go('auth')}>{x('Parcourir les projets', 'Browse projects')}</button>
          </div>
          <div className="hero-proof">
            <div><b>6 {x('semaines', 'weeks')}</b>{x('pour livrer un projet', 'to ship a project')}</div>
            <div><b>0 Git</b>{x('requis pour contribuer', 'needed to contribute')}</div>
            <div><b>5 {x('langues', 'languages')}</b>{x('traduites automatiquement', 'translated automatically')}</div>
          </div>
        </div>

        <div className="stage" aria-label={x('Illustration du parcours de contribution', 'Contribution flow illustration')}>
          <div className="row sp" style={{ marginBottom: 6 }}>
            <div className="row"><span className="logo-tile" style={{ padding: 0, width: 34, height: 34, fontSize: 14, border: 0, cursor: 'default' }}>T</span><b>Teranga Market</b></div>
            <span className="badge ok"><span className="pip" />{x('Version 4 publiée', 'Version 4 published')}</span>
          </div>
          <p className="stage-lbl" style={{ marginTop: 16 }}>{x('Version officielle', 'Official version')}</p>
          <div className="mainline">
            {['v1', 'v2', 'v3', 'v4'].map((v, i) => <span key={v} className={'v' + (i === 3 ? ' new' : '')} style={{ animationDelay: `${0.3 + i * 0.25}s` }}>{v}</span>)}
          </div>
          <p className="stage-lbl" style={{ margin: '18px 0 10px' }}>{x('Propositions de Kwame, Accra', 'Proposals from Kwame, Accra')}</p>
          <div className="col" style={{ gap: 10 }}>
            <div className="stage-card" style={{ animationDelay: '1.3s' }}>
              <FileArchive size={18} color="var(--muted)" />
              <span className="grow small"><b>panier-total-fcfa.zip</b><span className="muted tiny" style={{ display: 'block' }}>{x('2 fichiers modifiés', '2 files changed')}</span></span>
              <span className="badge bad"><X size={12} />{x('Rejetée', 'Rejected')}</span>
            </div>
            <div className="stage-card" style={{ animationDelay: '1.55s' }}>
              <ShieldAlert size={18} color="var(--bad)" />
              <span className="grow small"><b>correctif-urgent.zip</b><span className="tiny" style={{ display: 'block', color: 'var(--bad)' }}>.env, ../../server, deploy.sh</span></span>
              <span className="badge bad">{x('Bloquée', 'Blocked')}</span>
            </div>
            <div className="stage-card" style={{ animationDelay: '1.8s', borderColor: 'var(--sky-2)' }}>
              <FileArchive size={18} color="var(--cobalt)" />
              <span className="grow small"><b>panier-total-fcfa-v2.zip</b><span className="muted tiny" style={{ display: 'block' }}><span className="plus">+20</span> <span className="minus">−9</span></span></span>
              <span className="badge ok"><Check size={12} />{x('Acceptée, v4', 'Accepted, v4')}</span>
            </div>
          </div>
          <div className="stage-card" style={{ marginTop: 18, animationDelay: '2.1s', alignItems: 'flex-start' }}>
            <Avatar id="u_wanjiru" size="sm" />
            <span className="grow small">
              <span className="row" style={{ gap: 6 }}><b>Wanjiru</b><span className="tr-tag"><Languages size={12} />{x('Traduit du swahili', 'Translated from Swahili')}</span></span>
              <span style={{ display: 'block', marginTop: 4 }}>{x('J’ai remarqué que les prix s’affichent sans devise. On ajoute FCFA dans le panier ?', 'I noticed prices show without a currency. Should we add FCFA to the cart?')}</span>
            </span>
          </div>
        </div>
      </section>

      <section className="band tint" id="how">
        <div className="container">
          <h2>{x('Un parcours pensé pour livrer, pas pour discuter.', 'A flow built to ship, not to chat.')}</h2>
          <p className="intro">{x('Pas besoin de maîtriser Git. Le propriétaire garde la main, les collaborateurs proposent, et la plateforme garde la trace de tout.', 'No Git mastery needed. The owner stays in charge, collaborators propose, and the platform keeps track of everything.')}</p>
          <div className="steps">
            {[
              [x('Créez le projet', 'Create the project'), x('Contexte, stack, documentation et lien de démo. Indiquez si les débutants sont bienvenus.', 'Context, stack, docs and a demo link. Say whether beginners are welcome.')],
              [x('Invitez l’équipe', 'Invite the team'), x('Chaque membre reçoit un droit simple : consulter ou contribuer. Vous pouvez le changer à tout moment.', 'Each member gets one simple right: view or contribute. Change it anytime.')],
              [x('Contribuez par ZIP', 'Contribute with a ZIP'), x('Téléchargez la copie de travail, modifiez en local, renvoyez l’archive. Elle est vérifiée, jamais exécutée.', 'Download the working copy, edit locally, send the archive back. It is checked, never executed.')],
              [x('Validez et versionnez', 'Review and version'), x('Comparez ligne par ligne, acceptez ou rejetez. Chaque acceptation crée une version restaurable.', 'Compare line by line, accept or reject. Each acceptance creates a restorable version.')],
            ].map(([h, p], i) => (
              <div key={i}><div className="num">{i + 1}</div><h3>{h}</h3><p>{p}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="langs">
        <div className="container split">
          <div>
            <h2>{x('Des compétences communes, plus de barrière de langue.', 'Shared skills, no more language barrier.')}</h2>
            <p className="intro">{x('Une développeuse de Nairobi et un développeur de Dakar peuvent travailler sur le même panier sans parler la même langue.', 'A developer in Nairobi and one in Dakar can work on the same cart without sharing a language.')}</p>
            <div className="feat-list">
              <div><span className="fi"><Languages size={19} /></span><div><h4>{x('Traduction automatique des échanges', 'Auto-translated conversations')}</h4><p>{x('Messages, résumés de contribution et retours de revue, avec l’original toujours accessible.', 'Messages, contribution summaries and review feedback, with the original always one click away.')}</p></div></div>
              <div><span className="fi"><BookOpen size={19} /></span><div><h4>{x('Glossaire technique multilingue', 'Multilingual tech glossary')}</h4><p>{x('Les termes du métier expliqués simplement en français, anglais, swahili, portugais et arabe.', 'Core terms explained simply in French, English, Swahili, Portuguese and Arabic.')}</p></div></div>
              <div><span className="fi"><Clock size={19} /></span><div><h4>{x('Fuseaux horaires visibles', 'Time zones made visible')}</h4><p>{x('Les heures de travail communes entre membres sont affichées avant d’inviter.', 'Shared working hours between members are shown before you invite.')}</p></div></div>
              <div><span className="fi"><WifiOff size={19} /></span><div><h4>{x('Pensé pour les connexions variables', 'Built for patchy connections')}</h4><p>{x('Mode éco-données, brouillons conservés hors ligne, copies de travail légères.', 'Data saver mode, offline drafts, lightweight working copies.')}</p></div></div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-h"><h3>{x('Discussion du projet', 'Project discussion')}</h3><span className="tr-tag"><Languages size={12} />{x('Affiché en français', 'Shown in English')}</span></div>
            <div className="panel-b" style={{ paddingTop: 4 }}>
              {[
                ['u_wanjiru', 'Kiswahili', x('J’ai remarqué que les prix s’affichent sans devise. On ajoute FCFA dans le panier ?', 'I noticed prices are shown without a currency. Should we add FCFA to the cart?')],
                ['u_amina', null, x('Oui, bonne idée. Utilisez Intl.NumberFormat avec XOF, pas de calcul manuel.', 'Yes, good idea. Use Intl.NumberFormat with XOF, no manual calculation.')],
                ['u_youssef', 'العربية', x('Je vérifie le déploiement cette semaine. N’envoyez pas de fichiers .env dans les archives.', 'I’ll review deployment this week. Please don’t send .env files in archives.')],
              ].map(([u, from, text]) => (
                <div className="msg" key={u}>
                  <Avatar id={u} showCountry />
                  <div className="grow">
                    <div className="bubble-meta"><b>{u === 'u_amina' ? 'Amina' : u === 'u_wanjiru' ? 'Wanjiru' : 'Youssef'}</b>{from && <span className="tr-tag">{t('tr.from')} {from}</span>}</div>
                    <p style={{ marginTop: 4 }}>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="band tint" id="safety">
        <div className="container split">
          <div className="checks" style={{ background: 'var(--paper)' }}>
            {[
              ['ok', x('Taille totale : 7,2 Ko sur 10 Mo', 'Total size: 7.2 KB of 10 MB')],
              ['fail', x('Chemins traversants', 'Path traversal'), '../../server/config.php'],
              ['fail', x('Fichiers sensibles', 'Sensitive files'), 'teranga-market/.env'],
              ['fail', x('Scripts et exécutables', 'Scripts and executables'), 'scripts/deploy.sh'],
              ['ok', x('Formats autorisés', 'Allowed formats')],
              ['ok', x('Aucune exécution de code', 'No code execution')],
            ].map(([s, l, item], i) => (
              <div key={i} className={'check ' + s}>
                <span className="ci">{s === 'ok' ? <Check size={13} /> : <X size={13} />}</span>
                <div><b style={{ fontWeight: 550 }}>{l}</b>{item && <ul><li>{item}</li></ul>}</div>
              </div>
            ))}
          </div>
          <div>
            <h2>{x('Ouvrir son projet sans le mettre en danger.', 'Open your project without putting it at risk.')}</h2>
            <p className="intro">{x('Chaque archive est traitée comme une entrée non fiable. Les chemins piégés, les clés et les scripts sont bloqués avant que vous ne voyiez la proposition.', 'Every archive is treated as untrusted input. Trapped paths, keys and scripts are blocked before you ever see the proposal.')}</p>
            <div className="feat-list">
              <div><span className="fi"><Lock size={19} /></span><div><h4>{x('Personne ne modifie la version officielle', 'Nobody edits the official version')}</h4><p>{x('Tout passe par une proposition que seul le propriétaire peut accepter.', 'Everything goes through a proposal only the owner can accept.')}</p></div></div>
              <div><span className="fi"><History size={19} /></span><div><h4>{x('Restauration non destructive', 'Non-destructive restore')}</h4><p>{x('Revenir en arrière crée une nouvelle version. Rien n’est jamais effacé.', 'Going back creates a new version. Nothing is ever erased.')}</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="container split">
          <div>
            <h2>{x('Sortez avec un portfolio que les recruteurs peuvent vérifier.', 'Leave with a portfolio recruiters can verify.')}</h2>
            <p className="intro">{x('Chaque contribution acceptée, chaque version livrée et chaque démo de cohorte s’ajoutent à votre profil de preuves.', 'Every accepted contribution, shipped version and cohort demo is added to your proof profile.')}</p>
          </div>
          <div className="navy-panel">
            <div className="stat"><div><div className="stat-l">{x('Contributions acceptées', 'Accepted contributions')}</div><div className="stat-v">12</div></div><span className="chip"><Check size={16} /></span></div>
            <div className="stat"><div><div className="stat-l">{x('Projets livrés en cohorte', 'Projects shipped in cohorts')}</div><div className="stat-v">3</div></div><span className="chip light"><Award size={16} /></span></div>
            <div className="stat"><div><div className="stat-l">{x('Collaborateurs dans 5 pays', 'Collaborators across 5 countries')}</div><div className="stat-v">9 <small>{x('personnes', 'people')}</small></div></div><span className="chip"><Users size={16} /></span></div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="cta-band">
          <div>
            <h2>{x('La prochaine cohorte démarre le 4 janvier.', 'The next cohort starts January 4.')}</h2>
            <p>{x('Venez avec une idée ou rejoignez un projet existant. Tous les niveaux sont bienvenus.', 'Bring an idea or join an existing project. All levels welcome.')}</p>
          </div>
          <button className="btn lg" style={{ background: '#fff', color: 'var(--navy)' }} onClick={() => go('auth')}>{x('Créer mon compte', 'Create my account')}</button>
        </div>
      </section>

      <footer className="container land-foot row sp wrap">
        <span>© 2026 DEVEL line</span>
        <span>{x('Plateforme d’échange africaine, pour les devs, par les devs.', 'An African exchange platform, for devs, by devs.')}</span>
      </footer>
    </div>
  )
}
