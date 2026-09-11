-- ==========================================================================
-- RADIO NOTRE-DAME DE BANGUI — CURÉ/VICAIRE PAR PAROISSE + DIOCÈSES DU PAYS
-- ==========================================================================
-- Ajoute les colonnes cure/vicaire (nom du prêtre responsable), modifiables
-- par l'administrateur depuis le back-office (Annuaires → Paroisses), et
-- complète l'annuaire avec les 8 autres diocèses de République
-- centrafricaine (en plus de l'archidiocèse de Bangui déjà enregistré via
-- seed_dioceses_paroisses.sql).
--
-- Sources vérifiées (Catholic-Hierarchy, GCatholic, Wikipédia, Vatican News) :
-- la RCA compte 9 circonscriptions catholiques en 2 provinces ecclésiastiques
-- — Bangui (archidiocèse + Alindao, Bambari, Bangassou, Kaga-Bandoro) et
-- Berbérati, érigé récemment en second archidiocèse métropolitain
-- (+ Bossangoa, Bouar, Mbaïki).
--
-- IMPORTANT : contrairement au niveau diocésain (évêques, bien documentés
-- publiquement), la liste des paroisses, leurs adresses/téléphones et le nom
-- de leur curé/vicaire pour les 8 diocèses hors Bangui ne sont pas publiés
-- en ligne de façon fiable — ils ne sont donc PAS inventés ici. Utilisez les
-- champs Curé/Vicaire du formulaire "Paroisses" pour les renseigner vous-même
-- au fur et à mesure, ou dès que le diocèse concerné vous les communique.
-- Idempotent.
-- ==========================================================================

alter table paroisses add column if not exists cure text;
alter table paroisses add column if not exists vicaire text;

create unique index if not exists dioceses_nom_idx on dioceses (nom);

insert into dioceses (nom, territoire, eveque) values
  ('Diocèse d''Alindao', 'Préfecture de la Basse-Kotto (suffragant de Bangui)', 'Mgr Cyr-Nestor Yapaupa'),
  ('Diocèse de Bambari', 'Préfecture de la Ouaka (suffragant de Bangui)', 'Mgr Bertrand-Guy-Richard Appora-Ngalanibe'),
  ('Diocèse de Bangassou', 'Préfecture du Mbomou (suffragant de Bangui)', 'Mgr Juan José Aguirre Muñoz'),
  ('Diocèse de Kaga-Bandoro', 'Préfecture de la Nana-Gribizi (suffragant de Bangui)', 'Mgr Victor Hugo Castillo Matarrita'),
  ('Archidiocèse de Berbérati', 'Préfecture de la Mambéré-Kadéï — siège de la 2ᵉ province ecclésiastique de RCA (Bossangoa, Bouar, Mbaïki)', 'Mgr Dennis Kofi Agbenyadzi'),
  ('Diocèse de Bossangoa', 'Préfecture de l''Ouham (suffragant de Berbérati)', 'Mgr Nestor Désiré Nongo-Aziagbia'),
  ('Diocèse de Bouar', 'Préfecture de la Nana-Mambéré (suffragant de Berbérati)', 'Mgr Miroslaw Gucwa'),
  ('Diocèse de Mbaïki', 'Préfecture de la Lobaye (suffragant de Berbérati)', 'Mgr Guerrino Perin')
on conflict (nom) do nothing;
