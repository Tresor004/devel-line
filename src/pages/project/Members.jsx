import { useState } from 'react'
import { UserPlus, Search, Clock, Languages, Trash2, Lock, Check } from 'lucide-react'
import { useStore } from '../../store'
import { Avatar, PermBadge, Modal, overlap, tzLabel, ago } from '../../components/ui'
import { USERS, LANG_NAMES } from '../../data'

function commonLangs(a, b) {
  return USERS[a].langs.filter((l) => USERS[b].langs.includes(l))
}

export default function Members({ p, onInvite }) {
  const { t, state, perm, dispatch, toast, me } = useStore()
  const x = t.x
  const my = perm(p.id)
  const list = state.members[p.id] ?? []
  const requests = state.joinRequests.filter((r) => r.projectId === p.id)
  const owner = my === 'owner'

  return (
    <div className="col" style={{ gap: 20 }}>
      <div className="row sp wrap">
        <p className="small muted" style={{ maxWidth: '60ch' }}>{x('Deux permissions simples : Consulter (lire les fichiers et la discussion) et Contribuer (en plus, soumettre des archives). Seul le propriétaire accepte les contributions.', 'Two simple permissions: View (read files and discussion) and Contribute (also submit archives). Only the owner accepts contributions.')}</p>
        {owner && <button className="btn primary sm" onClick={onInvite}><UserPlus size={15} />{t('a.invite')}</button>}
      </div>

      {owner && requests.length > 0 && (
        <div className="panel" style={{ borderColor: 'var(--sky-2)', background: '#FBFCFF' }}>
          <div className="panel-h"><h3>{x('Demandes de collaboration', 'Collaboration requests')}</h3></div>
          {requests.map((r) => (
            <div key={r.userId} className="row" style={{ padding: '14px 22px', gap: 12 }}>
              <Avatar id={r.userId} showCountry />
              <div className="grow"><b>{USERS[r.userId].name}</b><span className="small muted" style={{ display: 'block' }}>{USERS[r.userId].title}, {ago(r.at, state.lang)}</span></div>
              <button className="btn ghost sm" onClick={() => { dispatch({ type: 'join.approve', projectId: p.id, userId: r.userId, perm: 'view' }); toast(x('Ajouté·e en consultation', 'Added with view access'), 'ok') }}>{t('p.view')}</button>
              <button className="btn primary sm" onClick={() => { dispatch({ type: 'join.approve', projectId: p.id, userId: r.userId, perm: 'contribute' }); toast(x('Ajouté·e en contribution', 'Added with contribute access'), 'ok') }}>{t('p.contribute')}</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table className="table responsive">
          <thead><tr><th>{x('Membre', 'Member')}</th><th>{x('Langues', 'Languages')}</th><th>{x('Fuseau', 'Time zone')}</th><th>Permission</th><th /></tr></thead>
          <tbody>
            {list.map((m) => {
              const u = USERS[m.userId]
              const common = commonLangs(me.id, u.id)
              return (
                <tr key={m.userId}>
                  <td className="full">
                    <div className="row"><Avatar id={u.id} showCountry /><div><b>{u.name}</b>{m.userId === me.id && <span className="muted small"> ({x('vous', 'you')})</span>}<span className="small muted" style={{ display: 'block' }}>{u.title}, {u.city}</span></div></div>
                  </td>
                  <td data-l={x('Langues', 'Languages')}>
                    <span className="small">{u.langs.map((l) => LANG_NAMES[l]).join(', ')}</span>
                    {m.userId !== me.id && common.length === 0 && <span className="tr-tag" style={{ marginTop: 4 }}><Languages size={11} />{x('Traduction auto', 'Auto-translate')}</span>}
                  </td>
                  <td data-l={x('Fuseau', 'Time zone')} className="small">{tzLabel(u.tz)}{m.userId !== me.id && <span className="muted tiny" style={{ display: 'block' }}>{x(`${overlap(me.tz, u.tz)} h en commun`, `${overlap(me.tz, u.tz)} h overlap`)}</span>}</td>
                  <td data-l="Permission">
                    {m.status === 'pending' ? <span className="badge warn"><span className="pip" />{x('Invitation envoyée', 'Invitation sent')}</span>
                      : owner && m.perm !== 'owner' ? (
                        <div className="seg" style={{ width: 'max-content' }}>
                          <button className={m.perm === 'view' ? 'on' : ''} onClick={() => dispatch({ type: 'member.perm', projectId: p.id, userId: m.userId, perm: 'view' })}>{t('p.view')}</button>
                          <button className={m.perm === 'contribute' ? 'on' : ''} onClick={() => dispatch({ type: 'member.perm', projectId: p.id, userId: m.userId, perm: 'contribute' })}>{t('p.contribute')}</button>
                        </div>
                      ) : <PermBadge perm={m.perm} />}
                  </td>
                  <td style={{ textAlign: 'end' }}>
                    {owner && m.perm !== 'owner' && <button className="icon-btn" style={{ width: 34, height: 34 }} aria-label={x('Retirer', 'Remove')} onClick={() => { dispatch({ type: 'member.remove', projectId: p.id, userId: m.userId }); toast(x(`${u.name} retiré·e`, `${u.name} removed`)) }}><Trash2 size={15} /></button>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {!owner && <div className="note"><Lock size={17} /><span>{x('Seul le propriétaire peut inviter des membres et changer les permissions.', 'Only the owner can invite members and change permissions.')}</span></div>}
    </div>
  )
}

function InviteModal({ p, onClose }) {
  const { t, state, dispatch, toast, me } = useStore()
  const x = t.x
  const [q, setQ] = useState('')
  const [sel, setSel] = useState('u_kwame')
  const [perm, setPerm] = useState('contribute')
  const inProject = new Set((state.members[p.id] ?? []).map((m) => m.userId))
  const candidates = Object.values(USERS).filter((u) => !inProject.has(u.id) && u.id !== 'u_new' && (u.name + u.city + u.skills.join(' ')).toLowerCase().includes(q.toLowerCase()))
  const chosen = USERS[sel] && !inProject.has(sel) ? USERS[sel] : candidates[0]
  const send = () => {
    if (!chosen) return
    dispatch({ type: 'member.invite', projectId: p.id, userId: chosen.id, perm })
    toast(x(`Invitation envoyée à ${chosen.name}`, `Invitation sent to ${chosen.name}`), 'ok')
    onClose()
  }
  return (
    <Modal title={x(`Inviter sur ${p.name}`, `Invite to ${p.name}`)} sub={x('La personne recevra une notification et devra accepter.', 'They will get a notification and must accept.')} onClose={onClose}
      footer={<><button className="btn ghost" onClick={onClose}>{t('a.cancel')}</button><button className="btn primary" disabled={!chosen} onClick={send}><UserPlus size={15} />{x('Envoyer l’invitation', 'Send invitation')}</button></>}>
      <div className="col" style={{ gap: 16 }}>
        <label className="search" style={{ maxWidth: 'none', display: 'flex' }}><Search size={16} /><input autoFocus placeholder={x('Nom, ville ou compétence', 'Name, city or skill')} value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <div className="col" style={{ gap: 8, maxHeight: 280, overflow: 'auto' }}>
          {candidates.length === 0 && <p className="muted small">{x('Aucun résultat.', 'No results.')}</p>}
          {candidates.map((u) => {
            const common = commonLangs(me.id, u.id)
            return (
              <button key={u.id} className={'preset' + (chosen?.id === u.id ? ' on' : '')} onClick={() => setSel(u.id)}>
                <Avatar id={u.id} showCountry />
                <span className="grow">
                  <b>{u.name}</b> <span className="badge" style={{ marginInlineStart: 4 }}>{u.level}</span>
                  <span className="small muted" style={{ display: 'block' }}>{u.skills.join(', ')}</span>
                  <span className="row wrap tiny muted" style={{ gap: 10, marginTop: 4 }}>
                    <span className="row" style={{ gap: 4 }}><Clock size={12} />{x(`${overlap(me.tz, u.tz)} h en commun`, `${overlap(me.tz, u.tz)} h overlap`)}</span>
                    <span className="row" style={{ gap: 4 }}><Languages size={12} />{common.length ? common.map((l) => LANG_NAMES[l]).join(', ') : x('Traduction automatique', 'Auto-translation')}</span>
                  </span>
                </span>
                {chosen?.id === u.id && <Check size={18} color="var(--cobalt)" />}
              </button>
            )
          })}
        </div>
        <div className="field">
          <label>Permission</label>
          <div className="seg">
            <button className={perm === 'view' ? 'on' : ''} onClick={() => setPerm('view')}>{t('p.view')}</button>
            <button className={perm === 'contribute' ? 'on' : ''} onClick={() => setPerm('contribute')}>{t('p.contribute')}</button>
          </div>
          <span className="hint">{perm === 'contribute' ? x('Peut télécharger la copie de travail et soumettre des archives. Ne peut pas accepter.', 'Can download the working copy and submit archives. Cannot accept.') : x('Peut lire les fichiers, les versions et la discussion.', 'Can read files, versions and discussion.')}</span>
        </div>
      </div>
    </Modal>
  )
}

Members.InviteModal = InviteModal
