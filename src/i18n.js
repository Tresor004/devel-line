// Interface multilingue. Les libellés de navigation et d'action sont traduits dans les 5 langues ;
// les textes longs de la maquette existent en français et en anglais (repli anglais pour sw/pt/ar).
export const UI_LANGS = [
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'sw', label: 'Kiswahili', short: 'SW' },
  { code: 'pt', label: 'Português', short: 'PT' },
  { code: 'ar', label: 'العربية', short: 'AR', rtl: true },
]

const D = {
  'nav.dashboard': ['Tableau de bord', 'Dashboard', 'Dashibodi', 'Painel', 'لوحة القيادة'],
  'nav.projects': ['Mes projets', 'My projects', 'Miradi yangu', 'Meus projetos', 'مشاريعي'],
  'nav.explore': ['Explorer', 'Explore', 'Gundua', 'Explorar', 'استكشاف'],
  'nav.people': ['Collaborateurs', 'Collaborators', 'Washirika', 'Colaboradores', 'المتعاونون'],
  'nav.cohorts': ['Cohortes', 'Cohorts', 'Vikundi', 'Coortes', 'الدفعات'],
  'nav.profile': ['Profil et preuves', 'Profile and proof', 'Wasifu na ushahidi', 'Perfil e provas', 'الملف والإثباتات'],
  'nav.settings': ['Paramètres', 'Settings', 'Mipangilio', 'Definições', 'الإعدادات'],
  'nav.glossary': ['Glossaire', 'Glossary', 'Kamusi', 'Glossário', 'المسرد'],
  'nav.new': ['Nouveau projet', 'New project', 'Mradi mpya', 'Novo projeto', 'مشروع جديد'],
  'nav.messages': ['Discussions', 'Discussions', 'Mazungumzo', 'Conversas', 'النقاشات'],
  'top.search': ['Rechercher un projet, une personne, une techno', 'Search projects, people, tech', 'Tafuta mradi, mtu, teknolojia', 'Pesquisar projetos, pessoas, tecnologias', 'ابحث عن مشروع أو شخص أو تقنية'],
  'top.lowData': ['Mode éco-données', 'Data saver', 'Okoa data', 'Poupança de dados', 'توفير البيانات'],
  'top.switch': ['Changer de profil', 'Switch profile', 'Badilisha wasifu', 'Mudar de perfil', 'تبديل الملف'],
  'top.logout': ['Se déconnecter', 'Sign out', 'Toka', 'Sair', 'تسجيل الخروج'],
  'top.notifications': ['Notifications', 'Notifications', 'Arifa', 'Notificações', 'الإشعارات'],
  'top.online': ['En ligne', 'Online', 'Mtandaoni', 'Online', 'متصل'],
  'top.offline': ['Hors ligne, brouillons conservés', 'Offline, drafts kept', 'Nje ya mtandao, rasimu zimehifadhiwa', 'Offline, rascunhos guardados', 'غير متصل، المسودات محفوظة'],
  'a.save': ['Enregistrer', 'Save', 'Hifadhi', 'Guardar', 'حفظ'],
  'a.cancel': ['Annuler', 'Cancel', 'Ghairi', 'Cancelar', 'إلغاء'],
  'a.accept': ['Accepter', 'Accept', 'Kubali', 'Aceitar', 'قبول'],
  'a.reject': ['Rejeter', 'Reject', 'Kataa', 'Rejeitar', 'رفض'],
  'a.decline': ['Refuser', 'Decline', 'Kataa', 'Recusar', 'رفض'],
  'a.invite': ['Inviter', 'Invite', 'Alika', 'Convidar', 'دعوة'],
  'a.download': ['Télécharger la copie de travail', 'Download working copy', 'Pakua nakala ya kazi', 'Transferir cópia de trabalho', 'تنزيل نسخة العمل'],
  'a.submit': ['Soumettre une contribution', 'Submit a contribution', 'Wasilisha mchango', 'Submeter contribuição', 'إرسال مساهمة'],
  'a.restore': ['Restaurer', 'Restore', 'Rejesha', 'Restaurar', 'استعادة'],
  'a.review': ['Examiner', 'Review', 'Kagua', 'Rever', 'مراجعة'],
  'a.send': ['Envoyer', 'Send', 'Tuma', 'Enviar', 'إرسال'],
  'a.create': ['Créer le projet', 'Create project', 'Unda mradi', 'Criar projeto', 'إنشاء المشروع'],
  'a.join': ['Demander à collaborer', 'Ask to collaborate', 'Omba kushirikiana', 'Pedir para colaborar', 'طلب التعاون'],
  'a.open': ['Ouvrir', 'Open', 'Fungua', 'Abrir', 'فتح'],
  'a.back': ['Retour', 'Back', 'Rudi', 'Voltar', 'رجوع'],
  'p.owner': ['Propriétaire', 'Owner', 'Mmiliki', 'Proprietário', 'المالك'],
  'p.contribute': ['Contribuer', 'Contribute', 'Changia', 'Contribuir', 'المساهمة'],
  'p.view': ['Consulter', 'View', 'Tazama', 'Consultar', 'الاطلاع'],
  's.pending': ['En attente', 'Pending', 'Inasubiri', 'Pendente', 'قيد الانتظار'],
  's.accepted': ['Acceptée', 'Accepted', 'Imekubaliwa', 'Aceite', 'مقبولة'],
  's.rejected': ['Rejetée', 'Rejected', 'Imekataliwa', 'Rejeitada', 'مرفوضة'],
  's.blocked': ['Bloquée', 'Blocked', 'Imezuiwa', 'Bloqueada', 'محظورة'],
  'tab.overview': ['Présentation', 'Overview', 'Muhtasari', 'Visão geral', 'نظرة عامة'],
  'tab.files': ['Fichiers', 'Files', 'Faili', 'Ficheiros', 'الملفات'],
  'tab.members': ['Membres', 'Members', 'Wanachama', 'Membros', 'الأعضاء'],
  'tab.contribs': ['Contributions', 'Contributions', 'Michango', 'Contribuições', 'المساهمات'],
  'tab.versions': ['Versions', 'Versions', 'Matoleo', 'Versões', 'الإصدارات'],
  'tab.discussion': ['Discussion', 'Discussion', 'Mazungumzo', 'Conversa', 'النقاش'],
  'tab.journal': ['Journal', 'Audit log', 'Kumbukumbu', 'Registo', 'السجل'],
  'tr.from': ['Traduit depuis', 'Translated from', 'Imetafsiriwa kutoka', 'Traduzido de', 'مترجم من'],
  'tr.original': ['Voir l’original', 'Show original', 'Onyesha asili', 'Ver original', 'عرض الأصل'],
  'tr.translation': ['Voir la traduction', 'Show translation', 'Onyesha tafsiri', 'Ver tradução', 'عرض الترجمة'],
  'tr.auto': ['Traduction automatique', 'Auto-translation', 'Tafsiri ya moja kwa moja', 'Tradução automática', 'ترجمة تلقائية'],
  'd.hello': ['Bonjour', 'Hello', 'Habari', 'Olá', 'مرحباً'],
  'd.review': ['À examiner', 'To review', 'Za kukagua', 'Para rever', 'للمراجعة'],
  'd.invites': ['Invitations', 'Invitations', 'Mialiko', 'Convites', 'الدعوات'],
  'd.activity': ['Activité récente', 'Recent activity', 'Shughuli za hivi karibuni', 'Atividade recente', 'النشاط الأخير'],
  'd.week': ['Semaine', 'Week', 'Wiki', 'Semana', 'الأسبوع'],
  'lvl.beginner': ['Débutants bienvenus', 'Beginners welcome', 'Wanaoanza wanakaribishwa', 'Iniciantes bem-vindos', 'المبتدئون مرحب بهم'],
}

const IDX = { fr: 0, en: 1, sw: 2, pt: 3, ar: 4 }

export function makeT(lang) {
  const i = IDX[lang] ?? 0
  const t = (key) => (D[key] ? D[key][i] ?? D[key][1] : key)
  // tx : texte long disponible en fr / en
  t.x = (fr, en) => (lang === 'fr' ? fr : en ?? fr)
  return t
}
