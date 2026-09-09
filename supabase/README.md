# Supabase — RADIO NOTRE DAME DE BANGUI

Ce dossier contient le schéma de base de données destiné à remplacer
progressivement les données d'exemple (`src/data/sampleData.ts`) par du
contenu réel géré depuis le back-office.

## Mise en place

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Dans l'éditeur SQL du projet, exécutez `schema.sql` puis, si vous le
   souhaitez, `seed.sql` pour des données de test.
3. Copiez l'URL du projet et la clé `anon` dans un fichier `.env` à la
   racine du dépôt (voir `.env.example`) :
   ```
   EXPO_PUBLIC_SUPABASE_URL=...
   EXPO_PUBLIC_SUPABASE_ANON_KEY=...
   ```
4. Redémarrez `expo start`. L'application utilisera automatiquement Supabase
   pour l'authentification dès que ces variables sont renseignées ; sans
   elles, l'app fonctionne avec les données d'exemple locales.

## Stockage des médias

Créez des buckets Supabase Storage (`podcasts`, `predications`, `videos`,
`images`) et activez des règles d'accès public en lecture pour le contenu
déjà validé par l'équipe éditoriale, en cohérence avec la section 20 du
cahier des charges (gestion des droits/licences).

## Notes

- Le schéma applique déjà des règles RLS (Row Level Security) simples,
  décrites en section 24 du cahier des charges : contenu éditorial public en
  lecture, données personnelles restreintes à leur propriétaire.
- Les rôles internes (section 21) sont définis via l'enum `role_interne` sur
  la table `profils` ; l'application mobile n'implémente pas encore le
  back-office web (voir `docs/ROADMAP.md`, Phase 3).
