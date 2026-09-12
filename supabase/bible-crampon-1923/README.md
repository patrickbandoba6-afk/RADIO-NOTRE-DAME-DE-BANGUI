# Bible Crampon 1923 — SQL prêt à coller

Fichiers générés par `admin/scripts/generer-sql-bible-crampon.js` à partir de
`FreCrampon.json` (domaine public, source `scrollmapper/bible_databases`,
`sources/fr/FreCrampon/FreCrampon.json`).

73 livres (canon catholique complet, avec deutérocanoniques), 35 610 versets,
traduction `crampon1923`.

## Utilisation

Dans l'éditeur SQL Supabase, exécuter dans l'ordre :

1. `supabase/schema_bible.sql` (une seule fois, crée les tables — idempotent)
2. `00_bible_livres.sql`
3. `01_bible_versets.sql` → `09_bible_versets.sql`

Tous les fichiers sont idempotents (`on conflict ... do nothing`) : aucun
risque à les rejouer.
