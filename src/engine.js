// Moteur de validation d'archives et de comparaison — exécuté côté client pour la maquette.
// En production, ces règles tournent côté serveur dans un worker isolé (cf. cahier des charges, §7).
import JSZip from 'jszip'

export const LIMITS = { maxTotal: 10 * 1024 * 1024, maxFiles: 200, maxDepth: 8 }

const ALLOWED_EXT = ['js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'html', 'md', 'json', 'php', 'py', 'txt', 'svg', 'png', 'jpg', 'jpeg', 'webp', 'yml', 'yaml', 'xml', 'blade.php', 'vue', 'mdx', 'gitignore', 'lock']
const TEXT_EXT = ['js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'html', 'md', 'json', 'php', 'py', 'txt', 'svg', 'yml', 'yaml', 'xml', 'vue', 'mdx', 'gitignore']
const EXEC_EXT = ['sh', 'exe', 'bat', 'cmd', 'ps1', 'bin', 'dll', 'so', 'jar', 'apk', 'msi', 'com', 'scr']
const SENSITIVE = [/(^|\/)\.env(\.|$)/i, /(^|\/)id_(rsa|dsa|ecdsa|ed25519)(\.pub)?$/i, /\.(pem|key|p12|pfx|crt|cer|jks|keystore)$/i, /\.(sql|dump|sqlite|db)$/i, /(^|\/)credentials(\.json)?$/i, /(^|\/)\.htpasswd$/i, /(^|\/)\.npmrc$/i]
const IGNORED_DIRS = /(^|\/)(node_modules|vendor|\.git|dist|build|__MACOSX)\//

const ext = (p) => {
  const base = p.split('/').pop()
  if (base.startsWith('.') && !base.slice(1).includes('.')) return base.slice(1).toLowerCase()
  const i = base.lastIndexOf('.')
  return i > 0 ? base.slice(i + 1).toLowerCase() : ''
}

// Lit un vrai fichier ZIP choisi par l'utilisateur
export async function readZipFile(file) {
  const zip = await JSZip.loadAsync(file)
  const entries = []
  const tasks = []
  zip.forEach((path, obj) => {
    if (obj.dir) return
    const perm = obj.unixPermissions
    const symlink = perm != null && (perm & 0o170000) === 0o120000
    const e = { path, size: obj._data?.uncompressedSize ?? 0, content: null, symlink: symlink ? '(lien)' : null }
    entries.push(e)
    if (TEXT_EXT.includes(ext(path)) && e.size < 200000) {
      tasks.push(obj.async('string').then((s) => { e.content = s; e.size = s.length }))
    }
  })
  await Promise.all(tasks)
  return entries
}

// Valide une liste d'entrées et renvoie checks + fichiers normalisés
export function validateArchive(entries, archiveSize) {
  const issues = { traversal: [], absolute: [], symlink: [], ext: [], sensitive: [], exec: [], ignored: [], depth: [] }
  const total = archiveSize ?? entries.reduce((s, e) => s + (e.size || 0), 0)

  for (const e of entries) {
    const p = e.path.replace(/\\/g, '/')
    if (p.split('/').includes('..')) issues.traversal.push(p)
    if (p.startsWith('/') || /^[a-zA-Z]:\//.test(p)) issues.absolute.push(p)
    if (e.symlink) issues.symlink.push(p + (e.symlink.startsWith('/') ? ' → ' + e.symlink : ''))
    if (IGNORED_DIRS.test(p + (p.endsWith('/') ? '' : ''))) { issues.ignored.push(p); continue }
    if (SENSITIVE.some((r) => r.test(p))) issues.sensitive.push(p)
    else if (EXEC_EXT.includes(ext(p))) issues.exec.push(p)
    else if (!ALLOWED_EXT.includes(ext(p)) && !e.symlink) issues.ext.push(p)
    if (p.split('/').length > LIMITS.maxDepth + 1) issues.depth.push(p)
  }

  const checks = [
    { id: 'size', label: 'Taille totale', detail: `${fmtSize(total)} sur ${fmtSize(LIMITS.maxTotal)} autorisés`, status: total <= LIMITS.maxTotal ? 'ok' : 'fail', items: [] },
    { id: 'count', label: 'Nombre de fichiers', detail: `${entries.length} sur ${LIMITS.maxFiles} autorisés`, status: entries.length <= LIMITS.maxFiles ? 'ok' : 'fail', items: [] },
    { id: 'traversal', label: 'Chemins traversants (../)', status: issues.traversal.length ? 'fail' : 'ok', items: issues.traversal },
    { id: 'absolute', label: 'Chemins absolus', status: issues.absolute.length ? 'fail' : 'ok', items: issues.absolute },
    { id: 'symlink', label: 'Liens symboliques', status: issues.symlink.length ? 'fail' : 'ok', items: issues.symlink },
    { id: 'sensitive', label: 'Fichiers sensibles (.env, clés, certificats, dumps)', status: issues.sensitive.length ? 'fail' : 'ok', items: issues.sensitive },
    { id: 'exec', label: 'Scripts et exécutables', status: issues.exec.length ? 'fail' : 'ok', items: issues.exec },
    { id: 'ext', label: 'Formats autorisés', status: issues.ext.length ? 'fail' : 'ok', items: issues.ext },
    { id: 'depth', label: `Profondeur (max ${LIMITS.maxDepth} niveaux)`, status: issues.depth.length ? 'fail' : 'ok', items: issues.depth },
    { id: 'ignored', label: 'Dossiers ignorés (node_modules, .git, vendor)', status: issues.ignored.length ? 'warn' : 'ok', items: issues.ignored, hint: 'Retirés automatiquement de la proposition' },
    { id: 'exec-never', label: 'Aucune exécution de code', detail: 'Le contenu est lu comme du texte, jamais exécuté', status: 'ok', items: [] },
  ]
  const blocked = checks.some((c) => c.status === 'fail')

  // Normalisation : retire le dossier racine commun ("teranga-market/")
  const kept = entries.filter((e) => !IGNORED_DIRS.test(e.path) && !e.symlink)
  const parts = kept.map((e) => e.path.split('/'))
  let prefix = ''
  if (parts.length && parts.every((p) => p.length > 1 && p[0] === parts[0][0])) prefix = parts[0][0] + '/'
  const files = {}
  for (const e of kept) files[e.path.slice(prefix.length)] = e.content ?? `(fichier binaire, ${fmtSize(e.size)})`

  return { checks, blocked, files, total, count: entries.length }
}

// Calcule les changements entre une version de base et des fichiers proposés
export function computeChanges(baseFiles, proposed, partial = false) {
  const changes = []
  for (const [path, content] of Object.entries(proposed)) {
    if (!(path in baseFiles)) changes.push({ path, type: 'added', before: '', after: content })
    else if (baseFiles[path] !== content) changes.push({ path, type: 'modified', before: baseFiles[path], after: content })
  }
  if (!partial) {
    for (const path of Object.keys(baseFiles)) if (!(path in proposed)) changes.push({ path, type: 'deleted', before: baseFiles[path], after: '' })
  }
  const order = { modified: 0, added: 1, deleted: 2 }
  return changes.sort((a, b) => order[a.type] - order[b.type] || a.path.localeCompare(b.path))
}

export function applyChanges(files, changes) {
  const next = { ...files }
  for (const c of changes) {
    if (c.type === 'deleted') delete next[c.path]
    else next[c.path] = c.after
  }
  return next
}

// Diff ligne à ligne (LCS) — suffisant pour des fichiers texte de taille raisonnable
export function lineDiff(a, b) {
  const A = a ? a.replace(/\n$/, '').split('\n') : []
  const B = b ? b.replace(/\n$/, '').split('\n') : []
  const n = A.length, m = B.length
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1))
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
  const out = []
  let i = 0, j = 0
  while (i < n && j < m) {
    if (A[i] === B[j]) { out.push({ t: 'same', a: i + 1, b: j + 1, text: A[i] }); i++; j++ }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ t: 'del', a: i + 1, text: A[i] }); i++ }
    else { out.push({ t: 'add', b: j + 1, text: B[j] }); j++ }
  }
  while (i < n) { out.push({ t: 'del', a: i + 1, text: A[i] }); i++ }
  while (j < m) { out.push({ t: 'add', b: j + 1, text: B[j] }); j++ }
  return out
}

export function diffStats(changes) {
  let add = 0, del = 0
  for (const c of changes) for (const l of lineDiff(c.before, c.after)) { if (l.t === 'add') add++; if (l.t === 'del') del++ }
  return { add, del }
}

export function fmtSize(b) {
  if (b < 1024) return b + ' o'
  if (b < 1024 * 1024) return (b / 1024).toFixed(1).replace('.0', '') + ' Ko'
  return (b / 1024 / 1024).toFixed(1) + ' Mo'
}

export function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0).toString(16).padStart(8, '0')
}
