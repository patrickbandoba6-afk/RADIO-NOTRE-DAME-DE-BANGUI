export type Langue = "fr" | "en" | "es" | "pt" | "de" | "it" | "ar" | "sw" | "ln";

export interface Emission {
  id: string;
  titre: string;
  animateur: string;
  heureDebut: string;
  heureFin: string;
  visuelUrl: string;
  description?: string;
}

export interface Podcast {
  id: string;
  titre: string;
  emission: string;
  animateur: string;
  theme: string;
  langue: Langue;
  datePublication: string;
  dureeSecondes: number;
  audioUrl: string;
  imageUrl: string;
  transcription?: string;
}

export interface Predication {
  id: string;
  titre: string;
  predicateur: string;
  serie: string;
  theme: string;
  verset?: string;
  langue: Langue;
  datePublication: string;
  dureeSecondes: number;
  audioUrl: string;
  videoUrl?: string;
  imageUrl: string;
}

export interface VersetDuJour {
  id: string;
  reference: string;
  texte: string;
  traduction: string;
  meditation: string;
  date: string;
}

export type ConfidentialitePriere = "publique" | "privee" | "anonyme";
export type StatutPriere = "recue" | "en_priere" | "traitee";

export interface DemandePriere {
  id: string;
  auteur: string;
  texte: string;
  categorie: string;
  confidentialite: ConfidentialitePriere;
  statut: StatutPriere;
  nombrePersonnesQuiPrient: number;
  reponseEquipe?: string;
  dateCreation: string;
}

export type TypeTemoignage = "texte" | "audio" | "video";
export type StatutModeration = "en_attente" | "valide" | "rejete";

export interface Temoignage {
  id: string;
  auteur: string;
  pays: string;
  type: TypeTemoignage;
  contenu: string;
  categorie: string;
  statut: StatutModeration;
  dateCreation: string;
}

export interface VideoContenu {
  id: string;
  titre: string;
  categorie: "messe" | "culte" | "conference" | "concert" | "emission";
  estEnDirect: boolean;
  dateDiffusion: string;
  dureeSecondes: number;
  videoUrl: string;
  imageUrl: string;
  sousTitresDisponibles: boolean;
}

export type ModeEvenement = "en_ligne" | "sur_place";

export interface Evenement {
  id: string;
  titre: string;
  description: string;
  mode: ModeEvenement;
  lieu?: string;
  dateDebutISO: string;
  dateFinISO: string;
  fuseauHoraire: string;
  intervenants: string[];
  programme: { heure: string; titre: string }[];
  imageUrl: string;
  estInscrit: boolean;
}

export interface GroupeCommunaute {
  id: string;
  nom: string;
  type: "pays" | "langue" | "eglise" | "jeunesse" | "interet";
  membres: number;
  imageUrl: string;
  description: string;
}

export interface Commentaire {
  id: string;
  auteur: string;
  contenu: string;
  dateCreation: string;
}

export type CategorieNotification =
  | "emissions"
  | "directs"
  | "predications"
  | "podcasts"
  | "evenements"
  | "verset"
  | "priere";

export interface PreferencesNotification {
  emissions: boolean;
  directs: boolean;
  predications: boolean;
  podcasts: boolean;
  evenements: boolean;
  verset: boolean;
  priere: boolean;
}

export type QualiteAudio = "eco" | "standard" | "haute";

export interface UtilisateurProfil {
  id: string;
  nom: string;
  email?: string;
  telephone?: string;
  pays?: string;
  photoUrl?: string;
  langue: Langue;
  estInvite: boolean;
}

export interface DonHistorique {
  id: string;
  montant: number;
  devise: string;
  type: "ponctuel" | "recurrent";
  date: string;
}

export type PisteAudioType = "direct" | "podcast" | "predication";

export type RadioStatus =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "reconnecting"
  | "error"
  | "stopped";

export interface PisteEnCours {
  type: PisteAudioType;
  id: string;
  titre: string;
  sousTitre: string;
  imageUrl: string;
  audioUrl: string;
}
