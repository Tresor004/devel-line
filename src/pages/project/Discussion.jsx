import { useState } from 'react'
import { Languages, Send, Lock } from 'lucide-react'
import { useStore } from '../../store'
import { Avatar, ago } from '../../components/ui'
import { USERS, LANG_NAMES, QUICK_REPLIES } from '../../data'

function Message({ m }) {
  const { t, state } = useStore()
  const [orig, setOrig] = useState(false)
  const u = USERS[m.authorId]
  const tr = m.lang !== state.lang ? (m.tr?.[state.lang] ?? (state.lang !== 'fr' && state.lang !== 'en' ? m.tr?.en : null)) : null
  const text = tr && !orig ? tr : m.text
  const rtl = (tr && !orig ? state.lang : m.lang) === 'ar'
  return (
    <div className="msg">
      <Avatar id={u.id} showCountry />
      <div className="grow">
        <div className="bubble-meta">
          <b>{u.name}</b><span>{u.city}</span><span>{ago(m.at, state.lang)}</span>
          {tr && <span className="tr-tag"><Languages size={11} />{orig ? LANG_NAMES[m.lang] : `${t('tr.from')} ${LANG_NAMES[m.lang]}`}</span>}
          {tr && <button className="linkish" onClick={() => setOrig(!orig)}>{orig ? t('tr.translation') : t('tr.original')}</button>}
        </div>
        <p style={{ marginTop: 4, lineHeight: 1.6, maxWidth: '68ch' }} dir={rtl ? 'rtl' : 'ltr'}>{text}</p>
        {!tr && m.lang !== state.lang && m.pendingTr && <p className="tiny muted" style={{ marginTop: 4 }}>{t.x('Traduction automatique simulée : dans le produit, ce message serait traduit à l’envoi.', 'Simulated auto-translation: in the product, this message would be translated on send.')}</p>}
      </div>
    </div>
  )
}

export default function Discussion({ p }) {
  const { t, state, perm, dispatch, me } = useStore()
  const x = t.x
  const my = perm(p.id)
  const [text, setText] = useState('')
  const [lang, setLang] = useState(me.langs.find((l) => ['fr', 'en', 'sw', 'pt', 'ar'].includes(l)) ?? 'en')
  const [quick, setQuick] = useState(null)
  const msgs = state.messages[p.id] ?? []
  if (!my) return <div className="lock"><span className="ic"><Lock size={30} /></span><h2>{x('Discussion réservée aux membres', 'Discussion is for members only')}</h2></div>

  const send = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    const trs = quick ? Object.fromEntries(Object.entries(quick).filter(([k]) => k !== lang)) : null
    dispatch({ type: 'message.post', projectId: p.id, lang, text: text.trim(), tr: trs })
    setText(''); setQuick(null)
  }

  return (
    <div className="grid g-main-l" style={{ gap: 32 }}>
      <div>
        <div className="note" style={{ marginBottom: 8 }}><Languages size={17} /><span>{x('Chacun écrit dans sa langue. Les messages sont affichés dans la langue de votre interface, avec l’original à un clic.', 'Everyone writes in their own language. Messages are shown in your interface language, with the original one click away.')}</span></div>
        {msgs.map((m) => <Message key={m.id} m={m} />)}
        <form onSubmit={send} className="col" style={{ gap: 10, marginTop: 14, borderTop: '1px solid var(--line)', paddingTop: 18 }}>
          <div className="row wrap" style={{ gap: 6 }}>
            {QUICK_REPLIES.map((q, i) => <button type="button" key={i} className="tag" style={{ cursor: 'pointer' }} onClick={() => { setText(q[lang] ?? q.en); setQuick(q) }}>{q[lang] ?? q.en}</button>)}
          </div>
          <textarea className="textarea" style={{ minHeight: 76 }} value={text} onChange={(e) => { setText(e.target.value); setQuick(null) }} placeholder={x('Écrire un message à l’équipe…', 'Write a message to the team…')} dir={lang === 'ar' ? 'rtl' : 'ltr'} />
          <div className="row sp wrap" style={{ gap: 10 }}>
            <label className="row small muted" style={{ gap: 8 }}>{x('J’écris en', 'I write in')}
              <select className="select" style={{ height: 34, width: 'auto' }} value={lang} onChange={(e) => setLang(e.target.value)}>
                {['fr', 'en', 'sw', 'pt', 'ar'].map((l) => <option key={l} value={l}>{LANG_NAMES[l]}</option>)}
              </select>
            </label>
            <button className="btn primary sm" type="submit" disabled={!text.trim()}><Send size={15} className="flip" />{t('a.send')}</button>
          </div>
        </form>
      </div>
      <div className="col" style={{ gap: 14 }}>
        <h3>{x('Langues de l’équipe', 'Team languages')}</h3>
        {(state.members[p.id] ?? []).filter((m) => m.status === 'active').map((m) => {
          const u = USERS[m.userId]
          return (
            <div key={u.id} className="row" style={{ gap: 10 }}>
              <Avatar id={u.id} size="sm" />
              <span className="grow small"><b>{u.name.split(' ')[0]}</b> <span className="muted">{u.langs.map((l) => LANG_NAMES[l]).join(', ')}</span></span>
            </div>
          )
        })}
        <p className="tiny muted">{x('Les termes techniques (diff, version, archive) sont conservés tels quels et liés au glossaire.', 'Technical terms (diff, version, archive) are kept as-is and linked to the glossary.')}</p>
      </div>
    </div>
  )
}
