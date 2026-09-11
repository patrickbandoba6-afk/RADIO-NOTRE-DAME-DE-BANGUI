export type PileAccueil = {
  Accueil: undefined;
  Recherche: undefined;
  Notifications: undefined;
  Evangile: undefined;
  Grille: undefined;
  Dons: undefined;
  Communaute: undefined;
  Evenements: undefined;
  DetailEvenement: { id: string };
};

export type PileActualites = {
  Actualites: undefined;
  Article: { id: string };
  Dossiers: undefined;
  Communiques: undefined;
};

export type PileAgenda = {
  Agenda: undefined;
  Annonces: undefined;
  DetailAnnonce: { id: string };
  DetailEvenement: { id: string };
  Paroisses: undefined;
};

export type PilePodcasts = {
  Podcasts: undefined;
  Emissions: undefined;
  DetailEmission: { id: string };
  DetailPodcast: { id: string };
  Predications: undefined;
  DetailPredication: { id: string };
  Videos: undefined;
  LecteurVideo: { id: string };
  Grille: undefined;
};

export type PileMenu = {
  Menu: undefined;
  Connexion: undefined;
  Parametres: undefined;
  Dons: undefined;
  Contact: undefined;
  Favoris: undefined;
  Historique: undefined;
  Telechargements: undefined;
  Notifications: undefined;
  Evangile: undefined;
  MaJournee: undefined;
  Prieres: undefined;
  Bible: undefined;
  Homelies: undefined;
  Priere: undefined;
  NouvelleDemandePriere: undefined;
  Temoignages: undefined;
  NouveauTemoignage: undefined;
  Emissions: undefined;
  DetailEmission: { id: string };
  Grille: undefined;
  Videos: undefined;
  LecteurVideo: { id: string };
  Dossiers: undefined;
  Communiques: undefined;
  Paroisses: undefined;
  Communaute: undefined;
  MentionsLegales: undefined;
  Admin: undefined;
  MonProfil: undefined;
};

/** Pile affichée avant l'application : logo, puis inscription ou mode admin. */
export type PileLancement = {
  Intro: undefined;
  Choix: undefined;
  Inscription: undefined;
  Connexion: { depuisLancement?: boolean } | undefined;
  App: undefined;
};

/**
 * Piles historiques (avant la refonte du module éditorial). Conservées pour
 * compatibilité : leurs écrans sont désormais accessibles via `PileMenu`.
 */
export type PileCompte = {
  Compte: undefined;
  Connexion: undefined;
  Parametres: undefined;
  Dons: undefined;
  Favoris: undefined;
  Telechargements: undefined;
};

export type PilePrier = {
  PrierAccueil: undefined;
  Bible: undefined;
  Priere: undefined;
  NouvelleDemandePriere: undefined;
  Temoignages: undefined;
  NouveauTemoignage: undefined;
};

export type OngletsPrincipaux = {
  AccueilStack: undefined;
  Direct: undefined;
  ActualitesStack: undefined;
  AgendaStack: undefined;
  PodcastsStack: undefined;
  MenuStack: undefined;
};
