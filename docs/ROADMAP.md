# Feuille de route — RADIO NOTRE DAME DE BANGUI

Suivi de l'implémentation par rapport aux 31 sections du cahier des charges
(`docs/cahier-des-charges/`), organisé selon le phasage défini en section 29.

## Phase 1 — MVP mondial

| Fonctionnalité | Statut |
| --- | --- |
| Radio en direct 24h/24, lecture en arrière-plan et écran verrouillé | ✅ Implémenté (`expo-audio`, `src/context/PlayerContext.tsx`) |
| Reconnexion automatique après coupure réseau | ✅ Implémenté |
| Minuteur de sommeil | ✅ Implémenté |
| Écran d'accueil (émission actuelle/suivante, accès rapides) | ✅ Implémenté |
| Podcasts (catalogue, lecture, vitesse, favoris, téléchargement) | ✅ Interface complète — téléchargement hors ligne réel à brancher sur `expo-file-system` |
| Notifications (centre + préférences par catégorie) | ✅ Interface complète — envoi push à brancher sur Supabase Edge Functions + FCM/APNs |
| Favoris, mode invité | ✅ Implémenté (mode invité) — favoris persistés à connecter à Supabase |
| Multilingue de base (FR/EN) | ✅ Implémenté (`src/i18n`) |
| Back-office | ⏳ Non démarré (voir Phase 3) |

## Phase 2 — Média

| Fonctionnalité | Statut |
| --- | --- |
| Replay / téléchargements hors ligne | 🟡 UI présente, téléchargement effectif à implémenter |
| Prédications (bibliothèque, notes, marque-pages) | ✅ Interface complète |
| Bible (verset du jour, plans de lecture, recherche) | ✅ Interface complète — contenu biblique réel à connecter (API biblique sous licence) |
| Prière (demandes, confidentialité, statuts, intercession) | ✅ Interface complète |
| Événements (calendrier, inscription, ajout au calendrier natif) | ✅ Implémenté (`expo-calendar`) |
| Vidéo (lecture live/replay des messes et cultes) | ✅ Lecteur implémenté (`expo-video`) — diffusion live réelle à brancher sur un flux HLS |

## Phase 3 — International

| Fonctionnalité | Statut |
| --- | --- |
| Langues supplémentaires (pt, es, de, it, ar, sw, ln) | ⏳ Architecture prête (`src/i18n/locales`), traductions à ajouter |
| CDN renforcé / infrastructure de streaming dédiée | ⏳ Dépend du fournisseur retenu (Icecast, Mux, etc.) |
| Paiements locaux (Mobile Money) | 🟡 UI des dons prête, intégration passerelle réelle à faire (Stripe + agrégateur Mobile Money) |
| Architecture multi-stations | ⏳ Le schéma Supabase supporte déjà plusieurs `stations` |
| Compatibilité voiture (Android Auto, CarPlay) | ⏳ Nécessite des modules natifs dédiés, hors périmètre Expo managé standard |

## Phase 4 — Innovation

| Fonctionnalité | Statut |
| --- | --- |
| « Ma journée avec Dieu » | 🟡 Amorcé (verset + méditation sur l'écran Prier) |
| Carte d'audience mondiale | 🟡 Liste des pays sur l'accueil — carte interactive à ajouter |
| Recommandations personnalisées | ⏳ Non démarré |
| Assistant biblique encadré / transcription IA | ⏳ Non démarré — nécessite gouvernance éditoriale (section 19) |

## Back-office (section 20-21)

Le back-office web (dashboard, gestion des rôles, planification, modération,
analytics) n'est pas inclus dans cette première livraison mobile. Le schéma
Supabase (`supabase/schema.sql`) prévoit déjà les rôles internes
(`role_interne`) et les tables nécessaires pour qu'un back-office web (à
construire séparément, par exemple avec Next.js + Supabase) puisse s'y
brancher directement.

## Ce qui est volontairement hors périmètre de cette livraison

- Compatibilité native CarPlay / Android Auto / Chromecast / enceintes
  connectées (section 3) : nécessite des modules natifs spécifiques non
  couverts par une application Expo managée standard.
- Infrastructure de streaming réelle (Icecast/CDN mondial) : l'application
  est câblée pour consommer n'importe quelle URL de flux (voir
  `EXPO_PUBLIC_RADIO_STREAM_URL`), mais l'infrastructure elle-même doit être
  déployée séparément.
- Intégration réelle de paiement (Stripe, Mobile Money) : l'interface est
  prête, la logique serveur (webhooks, réconciliation) reste à écrire.
- Contenu biblique sous licence, transcriptions et traductions assistées par
  IA : nécessitent des accords de licence et une gouvernance éditoriale
  (section 19) avant intégration.
