# DEVEL line — maquette React

Maquette fonctionnelle de la plateforme de shipping collaboratif contrôlé pour les développeurs africains.
Tout tourne côté client avec des données de démonstration : aucun backend n'est nécessaire.

## Lancer

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # produit dist/index.html, un fichier unique autonome
```

## Déploiement

- **GitHub Pages** : automatique à chaque push sur `main` via `.github/workflows/deploy.yml` (Settings → Pages → Source : GitHub Actions). URL : https://tresor004.github.io/devel-line/
- **Vercel** : importer le dépôt, preset Vite, Node 22.

## Parcours jury (bouton « Parcours jury » en bas à droite)

Les 10 étapes du §6 du cahier des charges, cochées automatiquement au fil de la démo.
Trois profils : Amina (propriétaire, Dakar), Kwame (collaborateur, Accra), Tunde (sans permission, Lagos).
On change de profil depuis l'avatar en haut à droite.

## Structure

| Fichier | Rôle |
|---|---|
| `src/data.js` | Utilisateurs, projets, versions, archives de démo, messages pré-traduits, glossaire |
| `src/store.jsx` | État global (useReducer) : membres, contributions, versions, journal d'audit, notifications |
| `src/engine.js` | Validation d'archive ZIP (chemins `../`, absolus, liens symboliques, `.env`/clés, scripts, formats, taille, profondeur), calcul des changements, diff ligne à ligne |
| `src/i18n.js` | Interface en français, anglais, swahili, portugais, arabe (RTL) |
| `src/nav.jsx` | Navigation par hash (`#dashboard`, `#p-teranga`…) |
| `src/pages/` | Landing, connexion, tableau de bord, projet (présentation, fichiers, contributions + revue, versions, membres, discussion, journal), explorer, collaborateurs, profil de preuves, paramètres, glossaire, création de projet |

## Vers le vrai produit

- `engine.js` montre les règles de validation ; en production elles s'exécutent côté serveur (Laravel), dans un worker isolé, jamais dans le navigateur.
- Le reducer de `store.jsx` correspond un pour un aux endpoints à créer (`member.invite`, `contrib.submit`, `contrib.decide`, `version.restore`…), et chaque action alimente `audit_logs`.
- La traduction est simulée par des textes pré-traduits ; à brancher sur un service de traduction côté serveur.
- Les vrais fichiers ZIP sont acceptés : l'upload lit réellement l'archive (JSZip) et applique les contrôles.
