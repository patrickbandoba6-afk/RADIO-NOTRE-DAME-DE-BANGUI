-- Données de démonstration minimales pour tester le schéma.
insert into stations (nom, pays, flux_url) values
  ('RADIO NOTRE DAME DE BANGUI', 'Centrafrique', 'https://ice1.somafm.com/gaydio-128-mp3')
on conflict do nothing;

insert into versets_du_jour (reference, texte, traduction, meditation, date) values
  (
    'Philippiens 4:13',
    'Je puis tout par celui qui me fortifie.',
    'Louis Segond',
    'Quelle que soit l''épreuve que vous traversez aujourd''hui, la force de Dieu est disponible pour vous.',
    current_date
  )
on conflict (date) do nothing;
