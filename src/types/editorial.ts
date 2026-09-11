// Types du module éditorial (actualités, annonces, agenda, émissions,
// spiritualité, dossiers, annuaires). Voir docs/MODULE-EDITORIAL.md.
import type { Langue } from "./index";

export type StatutPublication =
  | "brouillon"
  | "en_attente"
  | "programme"
  | "publie"
  | "depublie"
  | "archive";

/** Grandes rubriques éditoriales de la navigation. */
export type Rubrique =
  | "actualites"
  | "bangui"
  | "rca"
  | "afrique"
  | "monde"
  | "vie_eglise"
  | "spiritualite"
  | "jeunesse"
  | "famille"
  | "solidarite"
  | "societe"
  | "culture"
  | "interviews"
  | "reportages"
  | "communiques"
  | "dossiers";

export const RUBRIQUES_ACTUALITE: Rubrique[] = [
  "actualites",
  "bangui",
  "rca",
  "afrique",
  "monde",
  "vie_eglise",
];

export interface Categorie {
  id: string;
  nom: string;
  slug: string;
  rubrique: Rubrique;
  couleur?: string;
}

export interface Media {
  id: string;
  type: "image" | "audio" | "video" | "document";
  url: string;
  legende?: string;
  auteur?: string;
}

export interface Personne {
  id: string;
  nom: string;
  role: string;
  photoUrl?: string;
  biographie?: string;
}

export interface Article {
  id: string;
  slug: string;
  titre: string;
  sousTitre?: string;
  resume: string;
  contenu: string;
  imageUrl: string;
  galerie: Media[];
  videoUrl?: string;
  audioUrl?: string;
  auteur: string;
  rubrique: Rubrique;
  categorie: string;
  tags: string[];
  lieu?: string;
  datePublication: string;
  dateModification?: string;
  statut: StatutPublication;
  aLaUne: boolean;
  urgent: boolean;
  sponsorise: boolean;
  partageAutorise: boolean;
  nombreVues: number;
  source?: string;
  sourceUrl?: string;
  langue: Langue;
  contenusAssocies: string[];
}

export type CategorieAnnonce =
  | "paroissiale"
  | "diocesaine"
  | "communautaire"
  | "benevolat"
  | "dons"
  | "formation"
  | "conference"
  | "retraite"
  | "pelerinage"
  | "veillee"
  | "concert"
  | "messe"
  | "priere"
  | "recrutement"
  | "jeunesse"
  | "famille"
  | "association"
  | "collecte"
  | "caritative"
  | "urgente";

export interface Annonce {
  id: string;
  titre: string;
  description: string;
  imageUrl?: string;
  organisateur: string;
  categorie: CategorieAnnonce;
  dateDebutISO: string;
  dateFinISO?: string;
  lieu?: string;
  adresse?: string;
  latitude?: number;
  longitude?: number;
  telephone?: string;
  email?: string;
  siteWeb?: string;
  prix?: string;
  lienInscription?: string;
  statut: StatutPublication;
  urgente: boolean;
  datePublication: string;
}

export type CategorieAgenda =
  | "messe"
  | "priere"
  | "conference"
  | "retraite"
  | "pelerinage"
  | "concert"
  | "formation"
  | "jeunesse"
  | "famille"
  | "paroisse"
  | "diocese"
  | "association"
  | "solidarite"
  | "autre";

/** Emission de la grille des programmes. */
export interface EmissionCatalogue {
  id: string;
  nom: string;
  slug: string;
  description: string;
  imageUrl: string;
  animateur: string;
  chroniqueurs: string[];
  categorie: string;
  frequenceDiffusion: string;
  joursSemaine: number[];
  heureDebut: string;
  heureFin: string;
  statut: StatutPublication;
}

export interface Episode {
  id: string;
  emissionId: string;
  titre: string;
  description: string;
  imageUrl: string;
  audioUrl: string;
  dureeSecondes: number;
  datePublication: string;
  animateur: string;
  invites: string[];
  categorie: string;
  tags: string[];
  statut: StatutPublication;
}

/** Créneau de la grille des programmes pour un jour donné. */
export interface CreneauProgramme {
  id: string;
  emissionId: string;
  emissionNom: string;
  animateur: string;
  imageUrl: string;
  description?: string;
  heureDebut: string;
  heureFin: string;
  jourSemaine: number;
  episodeEnCoursTitre?: string;
}

export type TypePriere =
  | "matin"
  | "soir"
  | "quotidienne"
  | "paix"
  | "malades"
  | "familles"
  | "jeunes"
  | "defunts"
  | "mariale"
  | "chapelet"
  | "neuvaine"
  | "adoration";

export interface Priere {
  id: string;
  titre: string;
  type: TypePriere;
  texte: string;
  audioUrl?: string;
  videoUrl?: string;
  imageUrl: string;
  dureeSecondes?: number;
  auteur?: string;
  statut: StatutPublication;
}

export interface EvangileDuJour {
  id: string;
  date: string;
  saintDuJour?: string;
  premiereLecture?: { reference: string; texte: string };
  psaume?: { reference: string; texte: string };
  deuxiemeLecture?: { reference: string; texte: string };
  evangile: { reference: string; texte: string };
  meditation?: string;
  commentaire?: string;
  audioUrl?: string;
  statut: StatutPublication;
}

export interface Homelie {
  id: string;
  titre: string;
  celebration: string;
  celebrant: string;
  dateISO: string;
  lieu?: string;
  texte?: string;
  audioUrl?: string;
  videoUrl?: string;
  imageUrl: string;
  dureeSecondes?: number;
  transcription?: string;
  statut: StatutPublication;
}

export interface Interview {
  id: string;
  titre: string;
  invite: string;
  fonctionInvite: string;
  resume: string;
  contenu?: string;
  imageUrl: string;
  audioUrl?: string;
  videoUrl?: string;
  dateISO: string;
  format: "audio" | "video" | "article" | "podcast";
  statut: StatutPublication;
}

export interface Reportage {
  id: string;
  titre: string;
  type: "terrain" | "paroissial" | "evenement" | "social" | "international";
  journaliste: string;
  lieu: string;
  resume: string;
  contenu?: string;
  imageUrl: string;
  galerie: Media[];
  audioUrl?: string;
  videoUrl?: string;
  dateISO: string;
  statut: StatutPublication;
}

export interface Dossier {
  id: string;
  titre: string;
  slug: string;
  presentation: string;
  imageUrl: string;
  dateDebutISO: string;
  dateFinISO?: string;
  actif: boolean;
  contenusIds: string[];
  statut: StatutPublication;
}

export interface Communique {
  id: string;
  titre: string;
  organisme: string;
  typeOrganisme: "diocese" | "paroisse" | "eveque" | "conference_episcopale" | "radio" | "association" | "institution";
  contenu: string;
  documentUrl?: string;
  dateISO: string;
  statut: StatutPublication;
}

export interface Paroisse {
  id: string;
  nom: string;
  imageUrl?: string;
  description?: string;
  adresse: string;
  quartier?: string;
  ville: string;
  dioceseId?: string;
  telephone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  horairesMesses: { jour: string; heures: string[] }[];
}

export interface DioceseFiche {
  id: string;
  nom: string;
  territoire: string;
  eveque: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  imageUrl?: string;
}

export interface Organisation {
  id: string;
  nom: string;
  type: "paroisse" | "association" | "mouvement" | "communaute" | "oeuvre" | "institution" | "groupe_jeunes";
  description: string;
  imageUrl?: string;
  contact?: string;
  ville?: string;
}

export type TypeAlerte = "info" | "urgent" | "direct";

export interface AlerteApp {
  id: string;
  type: TypeAlerte;
  titre: string;
  message: string;
  lienContenuId?: string;
  lienContenuType?: string;
  dateISO: string;
  active: boolean;
}

export type TypeContenu =
  | "article"
  | "annonce"
  | "evenement"
  | "emission"
  | "episode"
  | "podcast"
  | "predication"
  | "priere"
  | "evangile"
  | "homelie"
  | "temoignage"
  | "interview"
  | "reportage"
  | "dossier"
  | "communique"
  | "video";

/** Élément normalisé utilisé par la recherche globale et l'historique. */
export interface ResultatContenu {
  id: string;
  type: TypeContenu;
  titre: string;
  sousTitre?: string;
  imageUrl?: string;
  dateISO?: string;
  rubrique?: Rubrique;
}

export interface EntreeHistorique {
  id: string;
  type: TypeContenu;
  titre: string;
  imageUrl?: string;
  consulteLeISO: string;
}
