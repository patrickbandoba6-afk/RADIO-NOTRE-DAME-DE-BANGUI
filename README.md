# RADIO NOTRE DAME DE BANGUI

> « Entrez dans l'Espérance » — 103.3 FM, Bangui

**Radio Notre-Dame de Bangui (RND Bangui)** est la radio de l'Archidiocèse de
Bangui, diffusant sur **103.3 MHz FM** depuis le **4 janvier 1995**, en
français et en sango.

## Écoute en direct

Le flux internet réellement utilisé par l'application est documenté dans
[`docs/FLUX-RADIO.md`](./docs/FLUX-RADIO.md) : endpoint vérifié, codec, débit,
métadonnées et variables de configuration. Aucune URL n'est inventée — toute
la configuration passe par des variables d'environnement (voir `.env.example`),
avec bascule automatique vers un flux de secours.

Application mobile (iOS, Android, tablette, web) de la radio chrétienne
**Radio Notre-Dame**, basée à Bangui (République centrafricaine), conçue pour
une audience mondiale : radio en direct 24h/24, podcasts, prédications,
Bible, prière, témoignages, vidéos de messes et cultes, événements,
communauté et dons.

Ce dépôt contient l'application mobile (Expo / React Native) ainsi que le
schéma de base de données Supabase. Le cahier des charges complet ayant
servi de base à cette implémentation se trouve dans
[`docs/cahier-des-charges/`](./docs/cahier-des-charges), et l'état
d'avancement détaillé par fonctionnalité dans
[`docs/ROADMAP.md`](./docs/ROADMAP.md).

## Fonctionnalités principales

- 📻 **Radio en direct 24h/24** — lecture en arrière-plan, écran verrouillé,
  reconnexion automatique, minuteur de sommeil, choix de qualité audio.
- 🎧 **Podcasts et replay** — catalogue, vitesse de lecture, favoris,
  téléchargement, transcription.
- 📖 **Prédications** — bibliothèque audio/vidéo, notes personnelles,
  marque-pages.
- ✝️ **Bible** — verset du jour, méditation, plans de lecture.
- 🙏 **Prière** — demandes avec confidentialité, intercession communautaire,
  suivi de statut.
- 💬 **Témoignages** — soumission texte/audio/vidéo avec modération.
- 🎥 **Vidéos & messes** — direct et replay des cultes, messes, conférences.
- 📅 **Événements** — calendrier, inscription, ajout au calendrier natif.
- 🌍 **Communauté internationale** — groupes par pays, langue, église.
- 🔔 **Notifications** — préférences par catégorie.
- 💳 **Dons** — ponctuels ou récurrents, multi-devises.
- 🌐 **Multilingue** — français et anglais au lancement, architecture prête
  pour d'autres langues.
- 👤 **Mode invité** — écoute immédiate sans inscription obligatoire.

## Stack technique

- **Mobile** : Expo (React Native + TypeScript), React Navigation
- **Audio** : `expo-audio` (lecture en direct, arrière-plan, écran verrouillé)
- **Vidéo** : `expo-video`
- **Backend** : Supabase (PostgreSQL, Auth, Storage) — voir `supabase/`
- **Internationalisation** : i18next / react-i18next

## Démarrage

```bash
npm install
cp .env.example .env   # puis renseignez vos variables (optionnel, voir plus bas)
npm start
```

Puis ouvrez l'app avec Expo Go (scan du QR code), ou lancez
`npm run ios` / `npm run android` / `npm run web`.

### Fonctionne sans configuration

L'application démarre et reste pleinement navigable même sans configurer de
projet Supabase : elle utilise alors des données d'exemple locales
(`src/data/sampleData.ts`) et un flux radio de démonstration. Pour brancher
du contenu réel :

1. Configurez un projet Supabase et exécutez `supabase/schema.sql` (voir
   `supabase/README.md`).
2. Renseignez `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   dans `.env`.
3. Renseignez `EXPO_PUBLIC_RADIO_STREAM_URL` avec l'URL réelle du flux de
   streaming de la radio (Icecast, HLS, etc.).

## Navigation de l'application

Six onglets principaux, avec un mini-lecteur persistant :

| Onglet | Contenu |
| --- | --- |
| **Accueil** | Direct, à la une, actualités, évangile du jour, podcasts, événements, annonces |
| **Direct** | Lecteur radio plein écran, titre en cours, qualité, minuteur |
| **Actus** | Actualités par rubrique (Bangui, RCA, Afrique, Monde, Vie de l'Église…) |
| **Agenda** | Événements filtrés par période, annonces et communiqués |
| **Podcasts** | Recherche, émissions, épisodes, prédications, vidéos, grille |
| **Plus** | Mon espace, spiritualité, découvrir, contact, dons, paramètres |

## Structure du projet

```
App.tsx                     Point d'entrée, initialisation (i18n, notifications, providers)
src/
  components/                Composants réutilisables (mini-lecteur, cartes, filtres, états)
  context/                   Lecteur audio, auth, favoris, téléchargements, historique, préférences
  data/                      Données d'exemple (remplacées par Supabase dès qu'il est configuré)
  hooks/                     useContenu — chargement asynchrone avec états
  i18n/                      Traductions français / anglais
  lib/                       config, Supabase, repository, flux radio, formats, téléchargements
  navigation/                Onglets + une pile par section
  screens/                   Écrans par domaine (actualites, agenda, media, prier, menu, compte)
  theme/                     Couleurs et constantes de style
  types/                     Types partagés (index.ts + editorial.ts)
supabase/
  schema.sql                 Schéma de base (émissions, podcasts, prière, dons, favoris…)
  schema_editorial.sql       Module éditorial (articles, annonces, épisodes, grille, dossiers…)
  seed.sql                   Données de démonstration
docs/
  FLUX-RADIO.md              Source vérifiée du flux audio et configuration
  ROADMAP.md                 Suivi de l'implémentation par phase
  cahier-des-charges/        Documents source du projet
```

## Feuille de route

Voir [`docs/ROADMAP.md`](./docs/ROADMAP.md) pour le détail de ce qui est
déjà implémenté, en cours, ou volontairement hors périmètre de cette
première livraison (back-office web, infrastructure de streaming réelle,
intégration de paiement, compatibilité CarPlay/Android Auto, etc.).

## Sauvegarde automatique

Toute modification faite sur ce projet via l'assistant est automatiquement
committée et poussée sur ce dépôt GitHub (`origin/main`) — aucune action
manuelle n'est nécessaire pour que les nouveautés soient enregistrées ici.

## Licence et droits

Les contenus audio/vidéo utilisés dans les données d'exemple sont des
extraits libres de droits, uniquement à titre de démonstration technique.
Le contenu réel de la radio (émissions, prédications, musique, traductions
bibliques) doit faire l'objet des autorisations et licences nécessaires
avant mise en production (voir section 31 du cahier des charges).
