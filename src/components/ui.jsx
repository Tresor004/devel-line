import { useEffect } from 'react'
import { X } from 'lucide-react'
import { USERS } from '../data'
import { useStore } from '../store'

export function Logo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#0B2160" />
      <path d="M6 20h20" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M11 20c0-6 4-8 9-8" stroke="#6F93FF" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx="11" cy="20" r="3" fill="#fff" />
      <circle cx="22" cy="20" r="3" fill="#2457F5" stroke="#fff" strokeWidth="1.6" />
      <circle cx="21" cy="12" r="2.4" fill="#6F93FF" />
    </svg>
  )
}

export function Avatar({ id, size = '', showCountry = false }) {
  const u = USERS[id]
  if (!u) return null
  const initials = u.name.split(' ').map((s) => s[0]).slice(0, 2).join('')
  return (
    <span className={'avatar ' + size} style={{ background: u.color }} title={u.name}>
      {initials}
      {showCountry && <span className="cc">{u.country}</span>}
    </span>
  )
}

export function StatusBadge({ status }) {
  const { t } = useStore()
  const map = { pending: ['blue', 's.pending'], accepted: ['ok', 's.accepted'], rejected: ['bad', 's.rejected'], blocked: ['bad', 's.blocked'] }
  const [cls, key] = map[status] ?? ['', status]
  return <span className={'badge ' + cls}><span className="pip" />{t(key)}</span>
}

export function PermBadge({ perm }) {
  const { t } = useStore()
  if (perm === 'owner') return <span className="badge navy">{t('p.owner')}</span>
  if (perm === 'contribute') return <span className="badge blue">{t('p.contribute')}</span>
  return <span className="badge">{t('p.view')}</span>
}

export function Modal({ title, sub, onClose, children, footer, wide }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={'modal' + (wide ? ' wide' : '')} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-h">
          <div>
            <h2>{title}</h2>
            {sub && <p className="muted small" style={{ marginTop: 4 }}>{sub}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Fermer"><X size={18} /></button>
        </div>
        <div className="modal-b">{children}</div>
        {footer && <div className="modal-f">{footer}</div>}
      </div>
    </div>
  )
}

export function ago(iso, lang = 'fr') {
  const d = (Date.now() - Date.parse(iso)) / 1000
  const fr = lang === 'fr'
  if (d < 60) return fr ? 'à l’instant' : 'just now'
  if (d < 3600) return fr ? `il y a ${Math.round(d / 60)} min` : `${Math.round(d / 60)} min ago`
  if (d < 86400) return fr ? `il y a ${Math.round(d / 3600)} h` : `${Math.round(d / 3600)} h ago`
  const n = Math.round(d / 86400)
  return fr ? `il y a ${n} j` : `${n} d ago`
}

export function tzLabel(tz) {
  return 'UTC' + (tz >= 0 ? '+' : '') + tz
}

// Heures de chevauchement entre deux fuseaux, sur une plage de travail 8h-18h locale
export function overlap(a, b) {
  const sa = 8 - a, ea = 18 - a, sb = 8 - b, eb = 18 - b
  return Math.max(0, Math.min(ea, eb) - Math.max(sa, sb))
}

export function Empty({ icon, title, children, action }) {
  return (
    <div className="empty">
      <div className="ic">{icon}</div>
      <h3 style={{ color: 'var(--ink)' }}>{title}</h3>
      {children && <p className="small" style={{ maxWidth: 360 }}>{children}</p>}
      {action}
    </div>
  )
}
