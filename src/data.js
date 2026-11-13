// Données de démonstration — DEVEL line
// Tout est simulé côté client pour illustrer le parcours vertical du cahier des charges.

export const USERS = {
  u_amina: {
    id: 'u_amina', name: 'Amina Diallo', handle: 'amina.dev', city: 'Dakar', country: 'SN', countryName: 'Sénégal',
    tz: 0, langs: ['fr', 'en', 'wo'], uiLang: 'fr', level: 'Senior', title: 'Développeuse full-stack',
    skills: ['React', 'Laravel', 'MySQL', 'Docker'], color: '#2457F5',
    bio: 'Je construis des outils pour les commerçants de Dakar. Mentor de la cohorte Novembre.',
  },
  u_kwame: {
    id: 'u_kwame', name: 'Kwame Mensah', handle: 'kwame.m', city: 'Accra', country: 'GH', countryName: 'Ghana',
    tz: 0, langs: ['en', 'tw'], uiLang: 'en', level: 'Junior', title: 'Frontend developer',
    skills: ['React', 'CSS', 'JavaScript'], color: '#0F7B5F',
    bio: 'Self-taught, 8 months in. Looking to ship real projects with a team.',
  },
  u_tunde: {
    id: 'u_tunde', name: 'Tunde Bakare', handle: 'tunde.b', city: 'Lagos', country: 'NG', countryName: 'Nigeria',
    tz: 1, langs: ['en', 'yo'], uiLang: 'en', level: 'Intermédiaire', title: 'Backend developer',
    skills: ['Node.js', 'PostgreSQL'], color: '#9A4D0F',
    bio: 'Building payment rails. Curious about collaborative shipping.',
  },
  u_wanjiru: {
    id: 'u_wanjiru', name: 'Wanjiru Kamau', handle: 'wanjiru.k', city: 'Nairobi', country: 'KE', countryName: 'Kenya',
    tz: 3, langs: ['sw', 'en'], uiLang: 'sw', level: 'Intermédiaire', title: 'Backend developer',
    skills: ['Laravel', 'PHP', 'MySQL', 'REST'], color: '#7A3FD1',
    bio: 'Ninajenga API za kilimo. Laravel ni nyumbani kwangu.',
  },
  u_joao: {
    id: 'u_joao', name: 'João Tavares', handle: 'joao.t', city: 'Luanda', country: 'AO', countryName: 'Angola',
    tz: 1, langs: ['pt'], uiLang: 'pt', level: 'Junior', title: 'Desenvolvedor mobile',
    skills: ['React Native', 'JavaScript', 'Figma'], color: '#C23A2B',
    bio: 'Gosto de interfaces simples para conexões lentas.',
  },
  u_youssef: {
    id: 'u_youssef', name: 'Youssef El Amrani', handle: 'youssef.ea', city: 'Casablanca', country: 'MA', countryName: 'Maroc',
    tz: 1, langs: ['ar', 'fr', 'en'], uiLang: 'ar', level: 'Intermédiaire', title: 'DevOps',
    skills: ['Docker', 'Linux', 'CI/CD', 'Nginx'], color: '#0E7490',
    bio: 'أحب الأتمتة والبنية التحتية البسيطة.',
  },
  u_selam: {
    id: 'u_selam', name: 'Selam Tesfaye', handle: 'selam.t', city: 'Addis-Abeba', country: 'ET', countryName: 'Éthiopie',
    tz: 3, langs: ['am', 'en'], uiLang: 'en', level: 'Junior', title: 'UI developer',
    skills: ['Figma', 'React', 'Accessibilité'], color: '#B45309',
    bio: 'Design systems and accessible interfaces.',
  },
}

export const PERSONAS = [
  { id: 'u_amina', role: 'Propriétaire du projet Teranga Market' },
  { id: 'u_kwame', role: 'Collaborateur (après invitation)' },
  { id: 'u_tunde', role: 'Membre sans permission sur Teranga' },
]

export const LANG_NAMES = {
  fr: 'Français', en: 'English', sw: 'Kiswahili', pt: 'Português', ar: 'العربية',
  wo: 'Wolof', tw: 'Twi', yo: 'Yorùbá', am: 'አማርኛ', ha: 'Hausa',
}

// ---------- Fichiers du projet principal ----------
const README_V1 = `# Teranga Market

Marketplace pour les artisans de Dakar : catalogue, panier, paiement mobile.

## Démarrer
npm install
npm run dev
`

const APP_V1 = `import ProductCard from './components/ProductCard'
import Cart from './components/Cart'
import { products } from './api/products'

export default function App() {
  return (
    <main>
      <h1>Teranga Market</h1>
      <section className="grid">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </section>
      <Cart />
    </main>
  )
}
`

const CART_V1 = `import { useCart } from '../hooks/useCart'

export default function Cart() {
  const { items } = useCart()
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  return (
    <aside className="cart">
      <h2>Panier</h2>
      {items.map(i => (
        <div key={i.id}>{i.name} x {i.qty}</div>
      ))}
      <p>Total : {total}</p>
    </aside>
  )
}
`

const CARD_V1 = `export default function ProductCard({ product }) {
  return (
    <article className="card">
      <img src={product.image} alt="" />
      <h3>{product.name}</h3>
      <p>{product.price}</p>
    </article>
  )
}
`

const CARD_V2 = `export default function ProductCard({ product, onAdd }) {
  return (
    <article className="card">
      <img src={product.image} alt={product.name} loading="lazy" />
      <h3>{product.name}</h3>
      <p className="artisan">{product.artisan}, {product.city}</p>
      <p className="price">{product.price}</p>
      <button onClick={() => onAdd(product)}>Ajouter au panier</button>
    </article>
  )
}
`

const PRODUCTS = `export const products = [
  { id: 1, name: 'Panier tressé', price: 12000, artisan: 'Awa', city: 'Thiès' },
  { id: 2, name: 'Boubou brodé', price: 35000, artisan: 'Moussa', city: 'Dakar' },
  { id: 3, name: 'Tabouret en bois', price: 18000, artisan: 'Ibrahima', city: 'Ziguinchor' },
]
`

const LEGACY = `// Ancienne API — à supprimer après migration
export function fetchLegacyProducts() {
  return fetch('/old/products').then(r => r.json())
}
`

const I18N_V3 = `export const messages = {
  fr: { cart: 'Panier', total: 'Total', add: 'Ajouter au panier' },
  en: { cart: 'Cart', total: 'Total', add: 'Add to cart' },
  wo: { cart: 'Pañe', total: 'Lépp', add: 'Yokk ci pañe bi' },
}
`

const CONTRIB = `# Contribuer à Teranga Market

1. Téléchargez la copie de travail de la version courante.
2. Faites vos modifications localement.
3. Renvoyez le dossier complet en ZIP, sans node_modules ni .env.
4. Décrivez ce que vous avez changé et pourquoi.
`

const PKG = `{
  "name": "teranga-market",
  "version": "0.3.0",
  "scripts": { "dev": "vite", "build": "vite build" },
  "dependencies": { "react": "^19.0.0" }
}
`

export const V1_FILES = {
  'README.md': README_V1,
  'package.json': PKG.replace('0.3.0', '0.1.0'),
  'src/App.jsx': APP_V1,
  'src/components/Cart.jsx': CART_V1,
  'src/components/ProductCard.jsx': CARD_V1,
  'src/api/products.js': PRODUCTS,
  'src/api/legacy.js': LEGACY,
}
export const V2_FILES = { ...V1_FILES, 'src/components/ProductCard.jsx': CARD_V2, 'package.json': PKG.replace('0.3.0', '0.2.0') }
export const V3_FILES = { ...V2_FILES, 'src/i18n.js': I18N_V3, 'docs/CONTRIBUTING.md': CONTRIB, 'package.json': PKG }

// ---------- Archives de démonstration ----------
const CART_P1 = `import { useCart } from '../hooks/useCart'

export default function Cart() {
  const { items } = useCart()
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  return (
    <aside className="cart">
      <h2>Panier</h2>
      {items.map(i => (
        <div key={i.id}>{i.name} x {i.qty}</div>
      ))}
      <p>Total : {total + ' FCFA'}</p>
      <p>Total : {total / 655} EUR</p>
    </aside>
  )
}
`

const CART_P2 = `import { useCart } from '../hooks/useCart'
import { formatXOF } from '../utils/currency'
import { messages } from '../i18n'

export default function Cart({ lang = 'fr' }) {
  const { items, remove } = useCart()
  const t = messages[lang]
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  if (items.length === 0) return <aside className="cart empty">{t.cart} : 0</aside>

  return (
    <aside className="cart">
      <h2>{t.cart}</h2>
      {items.map(i => (
        <div key={i.id} className="line">
          <span>{i.name} x {i.qty}</span>
          <button onClick={() => remove(i.id)} aria-label="Retirer">Retirer</button>
        </div>
      ))}
      <p className="total">{t.total} : {formatXOF(total)}</p>
    </aside>
  )
}
`

const CURRENCY = `export function formatXOF(amount) {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(amount)
}
`

const toEntries = (files, extra = []) => [
  ...Object.entries(files).map(([path, content]) => ({ path: 'teranga-market/' + path, size: content.length, content })),
  ...extra,
]

export const PRESET_ARCHIVES = [
  {
    id: 'p1',
    name: 'panier-total-fcfa.zip',
    note: 'Archive valide, première proposition',
    title: 'Afficher le total du panier en FCFA',
    titleEn: 'Show the cart total in FCFA',
    summary: 'Ajout de l’unité FCFA et d’une conversion en euros dans le panier.',
    lang: 'en',
    summaryEn: 'Adds the FCFA unit and a euro conversion to the cart total.',
    entries: () => toEntries({ ...V3_FILES, 'src/components/Cart.jsx': CART_P1 }),
  },
  {
    id: 'p2',
    name: 'correctif-urgent.zip',
    note: 'Archive dangereuse, doit être refusée',
    title: 'Correctif urgent du déploiement',
    titleEn: 'Urgent deployment fix',
    summary: 'Script de déploiement et configuration serveur.',
    lang: 'en',
    summaryEn: 'Deployment script and server configuration.',
    entries: () => toEntries({ 'src/components/Cart.jsx': CART_P1 }, [
      { path: 'teranga-market/.env', size: 412, content: 'DB_PASSWORD=************\nMOMO_API_KEY=************' },
      { path: '../../server/config.php', size: 980, content: '<?php // ...' },
      { path: 'teranga-market/scripts/deploy.sh', size: 1200, content: '#!/bin/sh\nrm -rf /var/www && ...' },
      { path: 'teranga-market/keys/id_rsa', size: 3243, content: '-----BEGIN OPENSSH PRIVATE KEY-----' },
      { path: '/etc/cron.d/backdoor', size: 88, content: '* * * * * root curl ...' },
      { path: 'teranga-market/public/logo-link', size: 0, content: '', symlink: '/etc/passwd' },
    ]),
  },
  {
    id: 'p3',
    name: 'panier-total-fcfa-v2.zip',
    note: 'Archive valide, proposition corrigée',
    title: 'Total du panier en FCFA, version corrigée',
    titleEn: 'Cart total in FCFA, revised',
    summary: 'Formatage XOF avec Intl, textes traduits via i18n, bouton Retirer, suppression de l’ancienne API.',
    lang: 'en',
    summaryEn: 'XOF formatting with Intl, translated labels via i18n, Remove button, legacy API removed.',
    entries: () => {
      const files = { ...V3_FILES, 'src/components/Cart.jsx': CART_P2, 'src/utils/currency.js': CURRENCY }
      delete files['src/api/legacy.js']
      return toEntries(files)
    },
  },
]

// ---------- Projets ----------
const now = Date.parse('2026-11-13T14:00:00Z')
const day = 86400000
export const T = (offsetDays) => new Date(now - offsetDays * day).toISOString()

export const INITIAL_PROJECTS = [
  {
    id: 'teranga', name: 'Teranga Market', ownerId: 'u_amina', visibility: 'public',
    tagline: 'Marketplace mobile pour les artisans de Dakar',
    context: 'Les artisans de Dakar vendent surtout via WhatsApp, sans catalogue ni suivi des commandes. Teranga Market leur donne une vitrine légère, lisible sur un téléphone d’entrée de gamme et utilisable avec une connexion 3G.',
    docs: 'Le panier et le catalogue sont en React. L’API Laravel expose /products et /orders. Les montants sont stockés en francs CFA (XOF), sans décimales. Les contributions doivent rester compatibles avec le mode hors ligne.',
    stack: ['React', 'Laravel', 'MySQL', 'Vite'],
    demoUrl: 'https://teranga-market.demo.africa',
    level: 'Débutants bienvenus', langs: ['fr', 'en', 'wo'],
    cohort: 'nov26', week: 4, lookingFor: ['Frontend junior', 'Testeur mobile'],
    createdAt: T(24),
  },
  {
    id: 'shamba', name: 'Shamba Data', ownerId: 'u_wanjiru', visibility: 'public',
    tagline: 'Prix des récoltes par SMS pour les agriculteurs kényans',
    context: 'Envoi quotidien des prix du marché par SMS, sans smartphone.', docs: '', stack: ['Laravel', 'PostgreSQL', 'Africa’s Talking'],
    demoUrl: 'https://shamba.demo.africa', level: 'Intermédiaire', langs: ['sw', 'en'], cohort: 'nov26', week: 4,
    lookingFor: ['Backend PHP'], createdAt: T(30),
  },
  {
    id: 'mboa', name: 'Mboa Transit', ownerId: 'u_joao', visibility: 'public',
    tagline: 'Horaires de bus partagés par les usagers',
    context: 'Les usagers signalent les passages, l’app estime les prochains bus.', docs: '', stack: ['React Native', 'Firebase'],
    demoUrl: 'https://mboa.demo.africa', level: 'Débutants bienvenus', langs: ['pt', 'fr'], cohort: 'nov26', week: 3,
    lookingFor: ['Designer UI', 'Mobile junior'], createdAt: T(20),
  },
  {
    id: 'darija', name: 'Darija NLP Kit', ownerId: 'u_youssef', visibility: 'public',
    tagline: 'Outils de traitement du darija marocain',
    context: 'Tokeniseur et jeux de données ouverts pour le darija.', docs: '', stack: ['Python', 'FastAPI'],
    demoUrl: 'https://darija-nlp.demo.africa', level: 'Avancé', langs: ['ar', 'fr', 'en'], cohort: 'oct26', week: 6,
    lookingFor: ['Data engineer'], createdAt: T(45),
  },
  {
    id: 'kente', name: 'Kente UI', ownerId: 'u_kwame', visibility: 'public',
    tagline: 'Composants React accessibles et légers',
    context: 'Une bibliothèque de composants pensée pour les connexions lentes.', docs: '', stack: ['React', 'CSS'],
    demoUrl: 'https://kente-ui.demo.africa', level: 'Débutants bienvenus', langs: ['en'], cohort: 'nov26', week: 2,
    lookingFor: ['Rédacteur docs'], createdAt: T(12),
  },
  {
    id: 'itan', name: 'Ìtàn Docs', ownerId: 'u_tunde', visibility: 'private',
    tagline: 'Traduction de documentation technique en yorùbá',
    context: 'Projet privé en préparation.', docs: '', stack: ['Next.js', 'MDX'],
    demoUrl: '', level: 'Intermédiaire', langs: ['yo', 'en'], cohort: null, week: 1,
    lookingFor: [], createdAt: T(5),
  },
]

export const INITIAL_MEMBERS = {
  teranga: [
    { userId: 'u_amina', perm: 'owner', status: 'active', since: T(24) },
    { userId: 'u_wanjiru', perm: 'contribute', status: 'active', since: T(18) },
    { userId: 'u_youssef', perm: 'view', status: 'active', since: T(10) },
  ],
  shamba: [{ userId: 'u_wanjiru', perm: 'owner', status: 'active', since: T(30) }, { userId: 'u_amina', perm: 'view', status: 'active', since: T(20) }],
  mboa: [{ userId: 'u_joao', perm: 'owner', status: 'active', since: T(20) }, { userId: 'u_selam', perm: 'contribute', status: 'active', since: T(9) }],
  darija: [{ userId: 'u_youssef', perm: 'owner', status: 'active', since: T(45) }],
  kente: [{ userId: 'u_kwame', perm: 'owner', status: 'active', since: T(12) }, { userId: 'u_selam', perm: 'contribute', status: 'active', since: T(8) }],
  itan: [{ userId: 'u_tunde', perm: 'owner', status: 'active', since: T(5) }],
}

export const INITIAL_VERSIONS = {
  teranga: [
    { n: 1, files: V1_FILES, authorId: 'u_amina', message: 'Version initiale : catalogue et panier', at: T(24), source: 'initial' },
    { n: 2, files: V2_FILES, authorId: 'u_amina', message: 'Cartes produit avec artisan et bouton d’ajout', at: T(15), source: 'owner' },
    { n: 3, files: V3_FILES, authorId: 'u_wanjiru', message: 'Textes de l’interface en français, anglais et wolof', at: T(6), source: 'contribution', contribId: 'c0' },
  ],
}

export const INITIAL_CONTRIBS = [
  {
    id: 'c0', projectId: 'teranga', authorId: 'u_wanjiru', title: 'Interface multilingue (fr, en, wo)',
    summary: 'Ajout d’un fichier i18n et du guide de contribution.', baseVersion: 2, status: 'accepted',
    createdAt: T(7), decidedAt: T(6), decisionNote: 'Merci, propre et bien documenté.', archiveName: 'i18n-wolof.zip', changes: null, checks: [],
  },
]

// Messages avec traductions pré-calculées (simulation du service de traduction automatique)
export const INITIAL_MESSAGES = {
  teranga: [
    {
      id: 'm1', authorId: 'u_wanjiru', lang: 'sw', at: T(2),
      text: 'Nimeona kwamba bei zinaonyeshwa bila sarafu. Je, tuongeze FCFA kwenye kikapu?',
      tr: {
        fr: 'J’ai remarqué que les prix s’affichent sans devise. Est-ce qu’on ajoute FCFA dans le panier ?',
        en: 'I noticed prices are shown without a currency. Should we add FCFA to the cart?',
        pt: 'Reparei que os preços aparecem sem moeda. Adicionamos FCFA ao carrinho?',
        ar: 'لاحظت أن الأسعار تظهر بدون عملة. هل نضيف FCFA إلى السلة؟',
      },
    },
    {
      id: 'm2', authorId: 'u_amina', lang: 'fr', at: T(1.9),
      text: 'Oui, bonne idée. Utilisez Intl.NumberFormat avec XOF, pas de calcul manuel.',
      tr: {
        en: 'Yes, good idea. Use Intl.NumberFormat with XOF, no manual calculation.',
        sw: 'Ndiyo, wazo zuri. Tumieni Intl.NumberFormat na XOF, si hesabu ya mkono.',
        pt: 'Sim, boa ideia. Usem Intl.NumberFormat com XOF, sem cálculo manual.',
        ar: 'نعم، فكرة جيدة. استخدموا Intl.NumberFormat مع XOF، بدون حساب يدوي.',
      },
    },
    {
      id: 'm3', authorId: 'u_youssef', lang: 'ar', at: T(1.2),
      text: 'سأراجع إعدادات النشر هذا الأسبوع. لا ترسلوا ملفات .env في الأرشيف من فضلكم.',
      tr: {
        fr: 'Je vérifie la configuration du déploiement cette semaine. N’envoyez pas de fichiers .env dans les archives, s’il vous plaît.',
        en: 'I’ll review the deployment setup this week. Please don’t send .env files in archives.',
        sw: 'Nitakagua mipangilio ya usambazaji wiki hii. Tafadhali msitume faili za .env kwenye kumbukumbu.',
        pt: 'Vou rever a configuração de deploy esta semana. Por favor, não enviem ficheiros .env nos arquivos.',
      },
    },
  ],
}

export const COHORTS = {
  nov26: { id: 'nov26', name: 'Cohorte Novembre 2026', weeks: 6, current: 4, demoDay: 'Vendredi 18 déc., 17:00 GMT', projects: 14, members: 52 },
  oct26: { id: 'oct26', name: 'Cohorte Octobre 2026', weeks: 6, current: 6, demoDay: 'Terminé', projects: 11, members: 40 },
}

export const MILESTONES = [
  { week: 1, label: 'Cadrage et équipe' },
  { week: 2, label: 'Première version' },
  { week: 3, label: 'Contributions ouvertes' },
  { week: 4, label: 'Revue et itérations' },
  { week: 5, label: 'Stabilisation' },
  { week: 6, label: 'Démo publique' },
]

export const GLOSSARY = [
  { term: 'Version', fr: 'Instantané figé du projet, restaurable à tout moment.', en: 'A frozen snapshot of the project you can restore anytime.', sw: 'Picha ya mradi iliyogandishwa, inayoweza kurejeshwa wakati wowote.', pt: 'Uma fotografia fixa do projeto, restaurável a qualquer momento.', ar: 'لقطة ثابتة من المشروع يمكن استعادتها في أي وقت.' },
  { term: 'Contribution', fr: 'Proposition de modifications envoyée en ZIP. Elle ne change rien tant qu’elle n’est pas acceptée.', en: 'A set of changes sent as a ZIP. Nothing changes until it is accepted.', sw: 'Pendekezo la mabadiliko kwa ZIP. Hakuna kinachobadilika hadi likubaliwe.', pt: 'Proposta de alterações enviada em ZIP. Nada muda até ser aceite.', ar: 'اقتراح تعديلات يُرسل كملف ZIP. لا يتغير شيء حتى يتم قبوله.' },
  { term: 'Diff', fr: 'Comparaison ligne par ligne entre deux états d’un fichier.', en: 'A line-by-line comparison between two states of a file.', sw: 'Ulinganisho wa mstari kwa mstari kati ya hali mbili za faili.', pt: 'Comparação linha a linha entre dois estados de um ficheiro.', ar: 'مقارنة سطراً بسطر بين حالتين لملف.' },
  { term: 'Copie de travail', fr: 'Les fichiers d’une version, à télécharger pour travailler en local.', en: 'The files of a version, downloaded to work locally.', sw: 'Faili za toleo, za kupakua ili kufanya kazi kwenye kompyuta yako.', pt: 'Os ficheiros de uma versão, para trabalhar localmente.', ar: 'ملفات إصدار يتم تنزيلها للعمل محلياً.' },
  { term: 'Restauration', fr: 'Republier une ancienne version comme nouvelle version. Rien n’est effacé.', en: 'Republishing an old version as a new one. Nothing is erased.', sw: 'Kuchapisha toleo la zamani kama jipya. Hakuna kinachofutwa.', pt: 'Republicar uma versão antiga como nova. Nada é apagado.', ar: 'إعادة نشر إصدار قديم كإصدار جديد. لا يُحذف شيء.' },
  { term: 'Cohorte', fr: 'Groupe qui avance au même rythme pendant 6 semaines jusqu’à une démo publique.', en: 'A group moving at the same pace for 6 weeks toward a public demo.', sw: 'Kikundi kinachoenda kwa kasi moja kwa wiki 6 hadi onyesho la umma.', pt: 'Um grupo que avança ao mesmo ritmo durante 6 semanas até uma demo pública.', ar: 'مجموعة تتقدم بنفس الوتيرة لمدة 6 أسابيع حتى عرض عام.' },
]

// Réponses rapides pré-traduites pour la discussion
export const QUICK_REPLIES = [
  { fr: 'Je m’en occupe aujourd’hui.', en: 'I’ll take care of it today.', sw: 'Nitalishughulikia leo.', pt: 'Trato disso hoje.', ar: 'سأتولى ذلك اليوم.' },
  { fr: 'Pouvez-vous préciser le fichier concerné ?', en: 'Can you point to the file concerned?', sw: 'Unaweza kutaja faili husika?', pt: 'Pode indicar o ficheiro em causa?', ar: 'هل يمكنك تحديد الملف المعني؟' },
  { fr: 'Proposition envoyée, merci pour la relecture.', en: 'Proposal sent, thanks for reviewing.', sw: 'Pendekezo limetumwa, asante kwa kukagua.', pt: 'Proposta enviada, obrigado pela revisão.', ar: 'تم إرسال الاقتراح، شكراً على المراجعة.' },
]
