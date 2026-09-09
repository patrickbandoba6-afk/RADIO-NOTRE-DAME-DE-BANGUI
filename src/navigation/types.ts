export type PileAccueil = {
  Accueil: undefined;
  Recherche: undefined;
  Evenements: undefined;
  DetailEvenement: { id: string };
  Communaute: undefined;
  Notifications: undefined;
};

export type PileMedia = {
  MediaAccueil: undefined;
  Podcasts: undefined;
  DetailPodcast: { id: string };
  Predications: undefined;
  DetailPredication: { id: string };
  Videos: undefined;
  LecteurVideo: { id: string };
};

export type PilePrier = {
  PrierAccueil: undefined;
  Bible: undefined;
  Priere: undefined;
  NouvelleDemandePriere: undefined;
  Temoignages: undefined;
  NouveauTemoignage: undefined;
};

export type PileCompte = {
  Compte: undefined;
  Connexion: undefined;
  Parametres: undefined;
  Dons: undefined;
};

export type OngletsPrincipaux = {
  AccueilStack: undefined;
  Direct: undefined;
  MediaStack: undefined;
  PrierStack: undefined;
  CompteStack: undefined;
};
