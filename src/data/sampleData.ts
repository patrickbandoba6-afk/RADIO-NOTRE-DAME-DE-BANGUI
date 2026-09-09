// Données d'exemple utilisées tant que le back-office / Supabase n'est pas
// connecté à du contenu réel. Voir supabase/schema.sql pour la structure
// destinée à remplacer ces données en production.
import type {
  DemandePriere,
  DonHistorique,
  Emission,
  Evenement,
  GroupeCommunaute,
  Podcast,
  Predication,
  Temoignage,
  VersetDuJour,
  VideoContenu,
} from "@/types";

const IMAGE = (nom: string) => `https://picsum.photos/seed/${nom}/600/400`;

// Extrait audio public domain utilisé comme contenu de démonstration.
const AUDIO_EXEMPLE =
  "https://ia802707.us.archive.org/34/items/shortpoetry_047_librivox/shortpoetry_047_047_anonymous_128kb.mp3";

const VIDEO_EXEMPLE =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export const emissionActuelle: Emission = {
  id: "em-1",
  titre: "Réveil dans la Parole",
  animateur: "Père Jean-Baptiste Koyamba",
  heureDebut: "06:00",
  heureFin: "08:00",
  visuelUrl: IMAGE("reveil-parole"),
  description: "Un temps de louange et de méditation pour bien commencer la journée.",
};

export const emissionSuivante: Emission = {
  id: "em-2",
  titre: "Midi Espérance",
  animateur: "Sœur Marie Ngbanda",
  heureDebut: "12:00",
  heureFin: "13:00",
  visuelUrl: IMAGE("midi-esperance"),
};

export const versetDuJour: VersetDuJour = {
  id: "vj-1",
  reference: "Philippiens 4:13",
  texte: "Je puis tout par celui qui me fortifie.",
  traduction: "Louis Segond",
  meditation:
    "Quelle que soit l'épreuve que vous traversez aujourd'hui, la force de Dieu est disponible pour vous.",
  date: new Date().toISOString(),
};

export const podcasts: Podcast[] = [
  {
    id: "pod-1",
    titre: "La foi qui déplace les montagnes",
    emission: "Réveil dans la Parole",
    animateur: "Père Jean-Baptiste Koyamba",
    theme: "Foi",
    langue: "fr",
    datePublication: "2026-09-01",
    dureeSecondes: 1820,
    audioUrl: AUDIO_EXEMPLE,
    imageUrl: IMAGE("podcast-foi"),
    transcription: "Transcription complète disponible prochainement.",
  },
  {
    id: "pod-2",
    titre: "Marcher dans la paix de Dieu",
    emission: "Midi Espérance",
    animateur: "Sœur Marie Ngbanda",
    theme: "Paix",
    langue: "fr",
    datePublication: "2026-08-28",
    dureeSecondes: 1500,
    audioUrl: AUDIO_EXEMPLE,
    imageUrl: IMAGE("podcast-paix"),
  },
  {
    id: "pod-3",
    titre: "Walking in Grace",
    emission: "Evening Hope",
    animateur: "Pastor David Mokoko",
    theme: "Grâce",
    langue: "en",
    datePublication: "2026-08-20",
    dureeSecondes: 1980,
    audioUrl: AUDIO_EXEMPLE,
    imageUrl: IMAGE("podcast-grace"),
  },
];

export const predications: Predication[] = [
  {
    id: "pred-1",
    titre: "Le pardon, chemin de guérison",
    predicateur: "Mgr Dieudonné Nzapalainga",
    serie: "Guérison intérieure",
    theme: "Pardon",
    verset: "Matthieu 6:14-15",
    langue: "fr",
    datePublication: "2026-09-05",
    dureeSecondes: 2700,
    audioUrl: AUDIO_EXEMPLE,
    videoUrl: VIDEO_EXEMPLE,
    imageUrl: IMAGE("pred-pardon"),
  },
  {
    id: "pred-2",
    titre: "Vivre par la foi et non par la vue",
    predicateur: "Père Jean-Baptiste Koyamba",
    serie: "Marcher avec Dieu",
    theme: "Foi",
    langue: "fr",
    datePublication: "2026-08-30",
    dureeSecondes: 2400,
    audioUrl: AUDIO_EXEMPLE,
    imageUrl: IMAGE("pred-foi"),
  },
];

export const demandesPriere: DemandePriere[] = [
  {
    id: "priere-1",
    auteur: "Grâce, Bangui",
    texte: "Priez pour la guérison de ma mère hospitalisée.",
    categorie: "Santé",
    confidentialite: "publique",
    statut: "en_priere",
    nombrePersonnesQuiPrient: 34,
    dateCreation: "2026-09-07",
  },
  {
    id: "priere-2",
    auteur: "Anonyme",
    texte: "Priez pour la paix en République centrafricaine.",
    categorie: "Nation",
    confidentialite: "anonyme",
    statut: "en_priere",
    nombrePersonnesQuiPrient: 112,
    dateCreation: "2026-09-06",
  },
  {
    id: "priere-3",
    auteur: "Emmanuel, Paris",
    texte: "Merci de prier pour la réussite de mes examens.",
    categorie: "Études",
    confidentialite: "publique",
    statut: "traitee",
    nombrePersonnesQuiPrient: 18,
    reponseEquipe: "Nous nous réjouissons avec vous, félicitations !",
    dateCreation: "2026-08-20",
  },
];

export const temoignages: Temoignage[] = [
  {
    id: "temoin-1",
    auteur: "Chantal",
    pays: "Centrafrique",
    type: "texte",
    contenu: "Dieu a transformé mon mariage après des années de prière.",
    categorie: "Famille",
    statut: "valide",
    dateCreation: "2026-08-15",
  },
  {
    id: "temoin-2",
    auteur: "Yves",
    pays: "France",
    type: "texte",
    contenu: "J'ai retrouvé du travail après avoir écouté une prédication ici.",
    categorie: "Provision",
    statut: "valide",
    dateCreation: "2026-07-30",
  },
];

export const videos: VideoContenu[] = [
  {
    id: "video-1",
    titre: "Messe dominicale en direct",
    categorie: "messe",
    estEnDirect: true,
    dateDiffusion: new Date().toISOString(),
    dureeSecondes: 5400,
    videoUrl: VIDEO_EXEMPLE,
    imageUrl: IMAGE("messe-direct"),
    sousTitresDisponibles: true,
  },
  {
    id: "video-2",
    titre: "Conférence : Jeunesse et espérance",
    categorie: "conference",
    estEnDirect: false,
    dateDiffusion: "2026-08-10",
    dureeSecondes: 3600,
    videoUrl: VIDEO_EXEMPLE,
    imageUrl: IMAGE("conference-jeunesse"),
    sousTitresDisponibles: false,
  },
];

export const evenements: Evenement[] = [
  {
    id: "evt-1",
    titre: "Veillée mondiale de prière",
    description:
      "Une nuit de prière retransmise en direct pour les auditeurs du monde entier.",
    mode: "en_ligne",
    dateDebutISO: "2026-09-20T19:00:00Z",
    dateFinISO: "2026-09-20T23:00:00Z",
    fuseauHoraire: "Africa/Bangui",
    intervenants: ["Mgr Dieudonné Nzapalainga", "Père Jean-Baptiste Koyamba"],
    programme: [
      { heure: "19:00", titre: "Louange d'ouverture" },
      { heure: "20:00", titre: "Enseignement" },
      { heure: "21:30", titre: "Temps de prière collective" },
    ],
    imageUrl: IMAGE("veillee-priere"),
    estInscrit: false,
  },
  {
    id: "evt-2",
    titre: "Festival Notre-Dame Jeunesse",
    description: "Rencontre annuelle de la jeunesse chrétienne de Bangui.",
    mode: "sur_place",
    lieu: "Cathédrale Notre-Dame, Bangui",
    dateDebutISO: "2026-10-05T09:00:00Z",
    dateFinISO: "2026-10-05T18:00:00Z",
    fuseauHoraire: "Africa/Bangui",
    intervenants: ["Sœur Marie Ngbanda"],
    programme: [{ heure: "09:00", titre: "Accueil et louange" }],
    imageUrl: IMAGE("festival-jeunesse"),
    estInscrit: false,
  },
];

export const groupesCommunaute: GroupeCommunaute[] = [
  {
    id: "grp-1",
    nom: "Centrafrique",
    type: "pays",
    membres: 4830,
    imageUrl: IMAGE("groupe-centrafrique"),
    description: "La communauté des auditeurs basés en République centrafricaine.",
  },
  {
    id: "grp-2",
    nom: "Diaspora francophone",
    type: "langue",
    membres: 2210,
    imageUrl: IMAGE("groupe-diaspora"),
    description: "Auditeurs francophones d'Europe et d'Amérique du Nord.",
  },
  {
    id: "grp-3",
    nom: "Jeunesse Notre-Dame",
    type: "jeunesse",
    membres: 1560,
    imageUrl: IMAGE("groupe-jeunesse"),
    description: "Espace d'échange pour les 15-30 ans.",
  },
];

export const donsHistorique: DonHistorique[] = [
  { id: "don-1", montant: 20, devise: "EUR", type: "ponctuel", date: "2026-08-01" },
  { id: "don-2", montant: 5000, devise: "XAF", type: "recurrent", date: "2026-09-01" },
];

export const paysAudience = [
  { pays: "Centrafrique", auditeurs: 18400 },
  { pays: "France", auditeurs: 6200 },
  { pays: "États-Unis", auditeurs: 3100 },
  { pays: "Cameroun", auditeurs: 2700 },
  { pays: "RD Congo", auditeurs: 2400 },
  { pays: "Canada", auditeurs: 1100 },
];
