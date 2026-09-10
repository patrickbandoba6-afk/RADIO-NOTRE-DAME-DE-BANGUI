# RADIO NOTRE DAME DE BANGUI

> « La voix chrétienne de Bangui vers le monde »

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

## Structure du projet

```
App.tsx                     Point d'entrée, initialisation (i18n, notifications, providers)
src/
  components/                Composants réutilisables (lecteur mini, cartes, grille d'accès rapide…)
  context/                   État global : lecteur audio, authentification, préférences
  data/                      Données d'exemple (à remplacer par Supabase)
  i18n/                      Traductions français / anglais
  lib/                       Client Supabase, configuration, notifications
  navigation/                Navigation (onglets + piles par section)
  screens/                   Écrans, organisés par domaine (media, prier, compte, home)
  theme/                     Couleurs et constantes de style
  types/                     Types TypeScript partagés
supabase/
  schema.sql                 Schéma complet (tables, RLS)
  seed.sql                   Données de démonstration
docs/
  cahier-des-charges/        Documents source du projet
  ROADMAP.md                 Suivi détaillé de l'implémentation par phase
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
