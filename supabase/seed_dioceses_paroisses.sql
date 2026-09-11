-- ==========================================================================
-- RADIO NOTRE-DAME DE BANGUI — DONNÉES RÉELLES : ARCHIDIOCÈSE ET PAROISSES
-- ==========================================================================
-- Sources vérifiées (aucune donnée inventée) : Wikipédia (Archidiocèse de
-- Bangui), le site officiel archidiocesedebangui.org et Catholic-Hierarchy.
-- L'adresse/téléphone individuels de chaque paroisse ne sont pas publiés
-- publiquement : seuls le nom, le quartier/la ville et le doyenné (dans la
-- description) sont donc renseignés pour les paroisses. Les coordonnées de
-- l'archevêché (adresse, téléphone, e-mail) sont, elles, publiques et
-- vérifiées. À exécuter après schema_editorial.sql. Idempotent.
-- ==========================================================================

create unique index if not exists dioceses_nom_idx on dioceses (nom);
create unique index if not exists paroisses_nom_idx on paroisses (nom);

insert into dioceses (nom, territoire, eveque, adresse, telephone, email) values
  (
    'Archidiocèse de Bangui',
    'Bangui et environs (République centrafricaine) — 5 doyennés, 25 paroisses',
    'Cardinal Dieudonné Nzapalaïnga, C.S.Sp. (archevêque métropolitain) ; Mgr Joseph Samedi, S.J. (archevêque coadjuteur depuis avril 2026)',
    'Archevêché, Boulevard Charles de Gaulle, Mission Saint-Paul, B.P. 798, Bangui',
    '+236 75 44 59 75',
    'archibangui@gmail.com'
  )
on conflict (nom) do nothing;

insert into paroisses (nom, diocese_id, quartier, ville, description) values
  -- Doyenné de l'Immaculée Conception
  ('Notre-Dame de l''Immaculée Conception (Cathédrale de Bangui)', (select id from dioceses where nom = 'Archidiocèse de Bangui'), 'Centre-ville', 'Bangui', 'Doyenné de l''Immaculée Conception.'),
  ('Saint-Paul des Rapides', (select id from dioceses where nom = 'Archidiocèse de Bangui'), 'Les Rapides', 'Bangui', 'Doyenné de l''Immaculée Conception.'),
  ('Sainte-Anne de Kassaï', (select id from dioceses where nom = 'Archidiocèse de Bangui'), 'Kassaï', 'Bangui', 'Doyenné de l''Immaculée Conception.'),
  ('Saints-Martyrs de l''Ouganda de Lakouanga', (select id from dioceses where nom = 'Archidiocèse de Bangui'), 'Lakouanga', 'Bangui', 'Doyenné de l''Immaculée Conception.'),
  ('Saint-François d''Assise de Yapélé', (select id from dioceses where nom = 'Archidiocèse de Bangui'), 'Yapélé', 'Bangui', 'Doyenné de l''Immaculée Conception.'),
  ('Sainte-Trinité des Castors', (select id from dioceses where nom = 'Archidiocèse de Bangui'), 'Castors', 'Bangui', 'Doyenné de l''Immaculée Conception.'),

  -- Doyenné de Damara
  ('Notre-Dame de Fatima', (select id from dioceses where nom = 'Archidiocèse de Bangui'), null, 'Bangui', 'Doyenné de Damara.'),
  ('Saint-Antoine de Padoue de Bimbo', (select id from dioceses where nom = 'Archidiocèse de Bangui'), 'Bimbo', 'Bimbo', 'Doyenné de Damara.'),
  ('Saint-Benoît de Pétévo', (select id from dioceses where nom = 'Archidiocèse de Bangui'), 'Pétévo', 'Bangui', 'Doyenné de Damara.'),
  ('Saint-Mathias de KM5', (select id from dioceses where nom = 'Archidiocèse de Bangui'), 'KM5', 'Bangui', 'Doyenné de Damara.'),
  ('Saint-Jacques de Kpétènè', (select id from dioceses where nom = 'Archidiocèse de Bangui'), 'Kpétènè', 'Bangui', 'Doyenné de Damara.'),

  -- Doyenné (Bazanga / Combattant / Galabadja / Gobongo / Bégoua / Boy-Rabe)
  ('Notre-Dame d''Afrique', (select id from dioceses where nom = 'Archidiocèse de Bangui'), null, 'Bangui', null),
  ('Saint-Michel de Bazanga', (select id from dioceses where nom = 'Archidiocèse de Bangui'), 'Bazanga', 'Bangui', null),
  ('Saints-Tite-et-Timothée du Combattant', (select id from dioceses where nom = 'Archidiocèse de Bangui'), 'Combattant', 'Bangui', null),
  ('Saint-Jean de Galabadja', (select id from dioceses where nom = 'Archidiocèse de Bangui'), 'Galabadja', 'Bangui', null),
  ('Saint-Pierre de Gobongo', (select id from dioceses where nom = 'Archidiocèse de Bangui'), 'Gobongo', 'Bangui', null),
  ('Saint-Charles-Lwanga de Bégoua', (select id from dioceses where nom = 'Archidiocèse de Bangui'), 'Bégoua', 'Bangui', null),
  ('Saint-Bernard de Boy-Rabe', (select id from dioceses where nom = 'Archidiocèse de Bangui'), 'Boy-Rabe', 'Bangui', null),

  -- Doyenné de Boali / Bossembélé / Yaloké (hors Bangui, même archidiocèse)
  ('Saint-Pierre de Boali', (select id from dioceses where nom = 'Archidiocèse de Bangui'), null, 'Boali', 'Doyenné de Boali-Bossembélé.'),
  ('Saint-François-de-Sales de Bossembélé', (select id from dioceses where nom = 'Archidiocèse de Bangui'), null, 'Bossembélé', 'Doyenné de Boali-Bossembélé.'),
  ('Saint-Joseph de Yaloké', (select id from dioceses where nom = 'Archidiocèse de Bangui'), null, 'Yaloké', 'Doyenné de Boali-Bossembélé.')
on conflict (nom) do nothing;
