// Contenu éditorial de démonstration, utilisé tant que Supabase n'est pas
// configuré. En production, tout ce contenu vient du back-office.
import type {
  AlerteApp,
  Annonce,
  Article,
  Communique,
  CreneauProgramme,
  DioceseFiche,
  Dossier,
  EmissionCatalogue,
  Episode,
  EvangileDuJour,
  Homelie,
  Interview,
  Paroisse,
  Priere,
  Reportage,
} from "@/types/editorial";

const IMAGE = (nom: string) => `https://picsum.photos/seed/${nom}/800/500`;
const CARRE = (nom: string) => `https://picsum.photos/seed/${nom}/600/600`;
const AUDIO =
  "https://ia802707.us.archive.org/34/items/shortpoetry_047_librivox/shortpoetry_047_047_anonymous_128kb.mp3";

function jourISO(decalage: number) {
  const date = new Date();
  date.setDate(date.getDate() + decalage);
  return date.toISOString();
}

export const articles: Article[] = [
  {
    id: "art-1",
    slug: "ordination-diaconale-cathedrale-bangui",
    titre: "Six nouveaux diacres ordonnés à la cathédrale Notre-Dame de Bangui",
    sousTitre: "Une célébration présidée par l'archevêque de Bangui",
    resume:
      "La cathédrale Notre-Dame a accueilli dimanche l'ordination de six diacres du diocèse, devant une assemblée nombreuse venue de toutes les paroisses de la capitale.",
    contenu:
      "La cathédrale Notre-Dame de Bangui était comble dimanche matin pour l'ordination de six nouveaux diacres du diocèse.\n\nDans son homélie, l'archevêque a rappelé que le diaconat est d'abord un service : « Vous n'êtes pas ordonnés pour être servis, mais pour servir les plus petits de nos quartiers. »\n\nLes familles des ordinands, venues de Bimbo, de Bégoua et de plusieurs paroisses de l'intérieur, ont accompagné la célébration de chants en sango et en français. La chorale diocésaine a assuré l'animation liturgique pendant près de trois heures.\n\nLes nouveaux diacres rejoindront dès la semaine prochaine les paroisses qui leur ont été confiées, où ils assureront le service de la Parole, de la charité et de la liturgie.",
    imageUrl: IMAGE("ordination-bangui"),
    galerie: [],
    auteur: "Rédaction Radio Notre-Dame",
    rubrique: "bangui",
    categorie: "Vie diocésaine",
    tags: ["Bangui", "Église", "Ordination"],
    lieu: "Cathédrale Notre-Dame, Bangui",
    datePublication: jourISO(-1),
    statut: "publie",
    aLaUne: true,
    urgent: false,
    sponsorise: false,
    partageAutorise: true,
    nombreVues: 412,
    langue: "fr",
    contenusAssocies: ["art-3"],
  },
  {
    id: "art-2",
    slug: "semaine-nationale-priere-pour-la-paix",
    titre: "Une semaine nationale de prière pour la paix en Centrafrique",
    sousTitre: "Toutes les paroisses du pays sont invitées à s'associer",
    resume:
      "La Conférence épiscopale centrafricaine lance une semaine de prière pour la paix, avec des veillées organisées dans chaque diocèse.",
    contenu:
      "La Conférence épiscopale centrafricaine invite les fidèles à une semaine nationale de prière pour la paix.\n\nChaque soir, une veillée sera organisée dans les paroisses, avec adoration, chapelet et intentions pour la réconciliation nationale.\n\nRadio Notre-Dame retransmettra en direct la veillée d'ouverture depuis la cathédrale de Bangui, ainsi que la messe de clôture dimanche.",
    imageUrl: IMAGE("priere-paix-rca"),
    galerie: [],
    auteur: "Rédaction Radio Notre-Dame",
    rubrique: "rca",
    categorie: "Paix",
    tags: ["RCA", "Paix", "Prière"],
    datePublication: jourISO(-2),
    statut: "publie",
    aLaUne: true,
    urgent: false,
    sponsorise: false,
    partageAutorise: true,
    nombreVues: 908,
    langue: "fr",
    contenusAssocies: [],
  },
  {
    id: "art-3",
    slug: "jeunes-paroisse-saint-paul-formation",
    titre: "Les jeunes de Saint-Paul se forment à l'animation liturgique",
    resume:
      "Une trentaine de jeunes ont participé à un week-end de formation sur le chant, la lecture et le service de l'autel.",
    contenu:
      "Une trentaine de jeunes de la paroisse Saint-Paul ont participé ce week-end à une formation sur l'animation liturgique.\n\nAu programme : technique vocale, proclamation de la Parole, service de l'autel et sens des symboles liturgiques.\n\nLa formation sera reconduite chaque trimestre et ouverte aux paroisses voisines.",
    imageUrl: IMAGE("jeunes-saint-paul"),
    galerie: [],
    auteur: "Rédaction Radio Notre-Dame",
    rubrique: "jeunesse",
    categorie: "Jeunesse",
    tags: ["Jeunesse", "Bangui", "Formation"],
    lieu: "Paroisse Saint-Paul, Bangui",
    datePublication: jourISO(-3),
    statut: "publie",
    aLaUne: false,
    urgent: false,
    sponsorise: false,
    partageAutorise: true,
    nombreVues: 210,
    langue: "fr",
    contenusAssocies: ["art-1"],
  },
  {
    id: "art-4",
    slug: "eglise-afrique-synode-jeunes",
    titre: "L'Église d'Afrique se mobilise pour la pastorale des jeunes",
    resume:
      "Les évêques du continent appellent à renforcer l'accompagnement des jeunes face aux défis économiques et sociaux.",
    contenu:
      "Réunis en assemblée, les représentants des conférences épiscopales africaines ont appelé à faire de la pastorale des jeunes une priorité continentale.\n\nParmi les pistes retenues : la formation professionnelle en lien avec les paroisses, l'accompagnement spirituel et la lutte contre les migrations forcées.",
    imageUrl: IMAGE("eglise-afrique"),
    galerie: [],
    auteur: "Rédaction Radio Notre-Dame",
    rubrique: "afrique",
    categorie: "Église en Afrique",
    tags: ["Afrique", "Jeunesse", "Église"],
    datePublication: jourISO(-4),
    statut: "publie",
    aLaUne: false,
    urgent: false,
    sponsorise: false,
    partageAutorise: true,
    nombreVues: 344,
    langue: "fr",
    contenusAssocies: [],
  },
  {
    id: "art-5",
    slug: "message-du-pape-pour-la-paix",
    titre: "Le message du Pape pour la Journée mondiale de la paix",
    resume:
      "Le Saint-Père invite les communautés chrétiennes à devenir « artisans de réconciliation » dans les pays marqués par les conflits.",
    contenu:
      "Dans son message pour la Journée mondiale de la paix, le Pape invite les communautés chrétiennes à devenir des artisans concrets de réconciliation.\n\nIl cite en exemple les pays d'Afrique centrale où les Églises locales jouent un rôle de médiation.",
    imageUrl: IMAGE("vatican-paix"),
    galerie: [],
    auteur: "Rédaction Radio Notre-Dame",
    rubrique: "monde",
    categorie: "Vatican",
    tags: ["Vatican", "Paix", "Pape"],
    datePublication: jourISO(-5),
    statut: "publie",
    aLaUne: false,
    urgent: false,
    sponsorise: false,
    partageAutorise: true,
    nombreVues: 651,
    langue: "fr",
    contenusAssocies: [],
  },
  {
    id: "art-6",
    slug: "nomination-nouveau-cure-bimbo",
    titre: "Un nouveau curé nommé à la paroisse Sainte-Thérèse de Bimbo",
    resume:
      "L'archevêché a rendu publiques les nominations pour la nouvelle année pastorale.",
    contenu:
      "L'archevêché de Bangui a rendu publiques les nominations pour la nouvelle année pastorale.\n\nLa paroisse Sainte-Thérèse de Bimbo accueille un nouveau curé, qui prendra ses fonctions au début du mois prochain.",
    imageUrl: IMAGE("nomination-bimbo"),
    galerie: [],
    auteur: "Rédaction Radio Notre-Dame",
    rubrique: "vie_eglise",
    categorie: "Nominations",
    tags: ["Bangui", "Église", "Nomination"],
    datePublication: jourISO(-6),
    statut: "publie",
    aLaUne: false,
    urgent: false,
    sponsorise: false,
    partageAutorise: true,
    nombreVues: 180,
    langue: "fr",
    contenusAssocies: [],
  },
];

export const annonces: Annonce[] = [
  {
    id: "ann-1",
    titre: "Appel aux bénévoles pour la distribution de vivres",
    description:
      "La Caritas diocésaine recherche des bénévoles pour la distribution mensuelle de vivres aux familles vulnérables du 3e arrondissement.",
    imageUrl: IMAGE("caritas-benevoles"),
    organisateur: "Caritas Bangui",
    categorie: "benevolat",
    dateDebutISO: jourISO(3),
    lieu: "Centre Caritas, 3e arrondissement",
    adresse: "Avenue des Martyrs, Bangui",
    telephone: "+236 70 00 00 00",
    email: "caritas@example.org",
    statut: "publie",
    urgente: false,
    datePublication: jourISO(-1),
  },
  {
    id: "ann-2",
    titre: "Retraite spirituelle de l'Avent — inscriptions ouvertes",
    description:
      "Trois jours de retraite animés par les pères spiritains, ouverts à tous les fidèles. Places limitées.",
    imageUrl: IMAGE("retraite-avent"),
    organisateur: "Paroisse Notre-Dame de Fatima",
    categorie: "retraite",
    dateDebutISO: jourISO(10),
    dateFinISO: jourISO(13),
    lieu: "Centre spirituel de Bangui",
    prix: "5 000 FCFA",
    telephone: "+236 72 11 22 33",
    statut: "publie",
    urgente: false,
    datePublication: jourISO(-2),
  },
  {
    id: "ann-3",
    titre: "Concert de chorales pour la fête patronale",
    description:
      "Huit chorales paroissiales de Bangui se réunissent pour un grand concert de louange. Entrée libre.",
    imageUrl: IMAGE("concert-chorales"),
    organisateur: "Doyenné de Bangui-Centre",
    categorie: "concert",
    dateDebutISO: jourISO(6),
    lieu: "Cathédrale Notre-Dame",
    statut: "publie",
    urgente: false,
    datePublication: jourISO(-3),
  },
];

export const emissionsCatalogue: EmissionCatalogue[] = [
  {
    id: "emi-1",
    nom: "Réveil dans la Parole",
    slug: "reveil-dans-la-parole",
    description:
      "Chaque matin, un temps de louange, la lecture du jour et une méditation pour commencer la journée avec Dieu. Une émission de référence de Radio Notre-Dame, en français et en sango.",
    imageUrl: CARRE("emission-reveil"),
    animateur: "Père Jean-Baptiste Koyamba",
    chroniqueurs: ["Sœur Marie Ngbanda"],
    categorie: "Spiritualité",
    frequenceDiffusion: "Du lundi au samedi",
    joursSemaine: [1, 2, 3, 4, 5, 6],
    heureDebut: "06:00",
    heureFin: "08:00",
    statut: "publie",
  },
  {
    id: "emi-2",
    nom: "Midi Espérance",
    slug: "midi-esperance",
    description:
      "Le rendez-vous de la mi-journée : actualité de l'Église, témoignages et intentions de prière des auditeurs.",
    imageUrl: CARRE("emission-midi"),
    animateur: "Sœur Marie Ngbanda",
    chroniqueurs: [],
    categorie: "Actualité",
    frequenceDiffusion: "Tous les jours",
    joursSemaine: [0, 1, 2, 3, 4, 5, 6],
    heureDebut: "12:00",
    heureFin: "13:00",
    statut: "publie",
  },
  {
    id: "emi-3",
    nom: "Paroles de jeunes",
    slug: "paroles-de-jeunes",
    description:
      "Les jeunes de Bangui prennent le micro : débats, musique, vocations et projets d'avenir.",
    imageUrl: CARRE("emission-jeunes"),
    animateur: "Emmanuel Sanze",
    chroniqueurs: ["Grâce Yandia"],
    categorie: "Jeunesse",
    frequenceDiffusion: "Mercredi et samedi",
    joursSemaine: [3, 6],
    heureDebut: "17:00",
    heureFin: "18:30",
    statut: "publie",
  },
  {
    id: "emi-4",
    nom: "Chemins de solidarité",
    slug: "chemins-de-solidarite",
    description:
      "Reportages et rencontres avec celles et ceux qui agissent au service des plus fragiles en Centrafrique.",
    imageUrl: CARRE("emission-solidarite"),
    animateur: "Chantal Mbetigaza",
    chroniqueurs: [],
    categorie: "Solidarité",
    frequenceDiffusion: "Jeudi",
    joursSemaine: [4],
    heureDebut: "19:00",
    heureFin: "20:00",
    statut: "publie",
  },
];

export const episodes: Episode[] = [
  {
    id: "ep-1",
    emissionId: "emi-1",
    titre: "La foi qui déplace les montagnes",
    description:
      "Méditation sur la confiance en Dieu au cœur des épreuves quotidiennes.",
    imageUrl: CARRE("ep-foi"),
    audioUrl: AUDIO,
    dureeSecondes: 1820,
    datePublication: jourISO(-1),
    animateur: "Père Jean-Baptiste Koyamba",
    invites: [],
    categorie: "Spiritualité",
    tags: ["Foi"],
    statut: "publie",
  },
  {
    id: "ep-2",
    emissionId: "emi-1",
    titre: "Marcher dans la paix de Dieu",
    description: "Comment garder la paix intérieure dans un contexte difficile.",
    imageUrl: CARRE("ep-paix"),
    audioUrl: AUDIO,
    dureeSecondes: 1500,
    datePublication: jourISO(-2),
    animateur: "Père Jean-Baptiste Koyamba",
    invites: [],
    categorie: "Spiritualité",
    tags: ["Paix"],
    statut: "publie",
  },
  {
    id: "ep-3",
    emissionId: "emi-2",
    titre: "L'actualité de l'Église en Centrafrique",
    description: "Le tour d'horizon hebdomadaire de la vie des diocèses.",
    imageUrl: CARRE("ep-actu"),
    audioUrl: AUDIO,
    dureeSecondes: 2100,
    datePublication: jourISO(-1),
    animateur: "Sœur Marie Ngbanda",
    invites: ["Père Alain Doko"],
    categorie: "Actualité",
    tags: ["RCA"],
    statut: "publie",
  },
  {
    id: "ep-4",
    emissionId: "emi-3",
    titre: "Jeunes et vocations : oser dire oui",
    description: "Trois jeunes témoignent de leur cheminement vocationnel.",
    imageUrl: CARRE("ep-vocations"),
    audioUrl: AUDIO,
    dureeSecondes: 2700,
    datePublication: jourISO(-3),
    animateur: "Emmanuel Sanze",
    invites: ["Grâce Yandia"],
    categorie: "Jeunesse",
    tags: ["Jeunesse", "Vocation"],
    statut: "publie",
  },
  {
    id: "ep-5",
    emissionId: "emi-4",
    titre: "Les femmes de Bégoua qui relèvent leur quartier",
    description: "Reportage au cœur d'une coopérative féminine.",
    imageUrl: CARRE("ep-begoua"),
    audioUrl: AUDIO,
    dureeSecondes: 1980,
    datePublication: jourISO(-4),
    animateur: "Chantal Mbetigaza",
    invites: [],
    categorie: "Solidarité",
    tags: ["Solidarité", "RCA"],
    statut: "publie",
  },
];

/** Grille hebdomadaire : construite à partir du catalogue des émissions. */
export const grilleProgrammes: CreneauProgramme[] = emissionsCatalogue.flatMap(
  (emission) =>
    emission.joursSemaine.map((jour) => ({
      id: `${emission.id}-${jour}`,
      emissionId: emission.id,
      emissionNom: emission.nom,
      animateur: emission.animateur,
      imageUrl: emission.imageUrl,
      description: emission.description,
      heureDebut: emission.heureDebut,
      heureFin: emission.heureFin,
      jourSemaine: jour,
    }))
);

export const prieres: Priere[] = [
  {
    id: "pri-1",
    titre: "La prière du matin",
    type: "matin",
    texte:
      "Seigneur, au seuil de ce jour, je remets entre tes mains mes pensées, mes paroles et mes actes. Que ta lumière guide chacun de mes pas et que ma vie soit un signe de ton amour pour ceux que je rencontrerai.",
    audioUrl: AUDIO,
    imageUrl: IMAGE("priere-matin"),
    dureeSecondes: 420,
    statut: "publie",
  },
  {
    id: "pri-2",
    titre: "La prière du soir",
    type: "soir",
    texte:
      "Seigneur, le jour s'achève. Je te confie ce que j'ai vécu, mes joies comme mes manques. Garde ma famille et mon pays dans ta paix, et donne-moi un cœur reconnaissant.",
    audioUrl: AUDIO,
    imageUrl: IMAGE("priere-soir"),
    dureeSecondes: 380,
    statut: "publie",
  },
  {
    id: "pri-3",
    titre: "Prière pour la paix en Centrafrique",
    type: "paix",
    texte:
      "Dieu de paix, regarde notre pays. Apaise les cœurs blessés, réconcilie les familles divisées et fais de nous des artisans de paix dans nos quartiers.",
    audioUrl: AUDIO,
    imageUrl: IMAGE("priere-paix"),
    dureeSecondes: 300,
    statut: "publie",
  },
  {
    id: "pri-4",
    titre: "Chapelet médité",
    type: "chapelet",
    texte:
      "Récitation méditée du chapelet, mystère par mystère, avec des intentions pour les familles et les malades.",
    audioUrl: AUDIO,
    imageUrl: IMAGE("chapelet"),
    dureeSecondes: 1500,
    statut: "publie",
  },
  {
    id: "pri-5",
    titre: "Prière pour les malades",
    type: "malades",
    texte:
      "Seigneur, toi qui as guéri les malades, pose ta main sur celles et ceux qui souffrent. Donne courage aux soignants et espérance aux familles.",
    imageUrl: IMAGE("priere-malades"),
    dureeSecondes: 240,
    statut: "publie",
  },
];

export const evangileDuJour: EvangileDuJour = {
  id: "ev-1",
  date: new Date().toISOString().slice(0, 10),
  saintDuJour: "Saint Charles Lwanga et ses compagnons",
  premiereLecture: {
    reference: "Actes des Apôtres 2, 1-11",
    texte:
      "Quand arriva le jour de la Pentecôte, au terme des cinquante jours, ils se trouvaient réunis tous ensemble…",
  },
  psaume: {
    reference: "Psaume 103",
    texte: "Ô Seigneur, envoie ton Esprit qui renouvelle la face de la terre !",
  },
  evangile: {
    reference: "Évangile de Jésus Christ selon saint Jean 20, 19-23",
    texte:
      "« La paix soit avec vous ! » Après cette parole, il leur montra ses mains et son côté. Les disciples furent remplis de joie en voyant le Seigneur. Jésus leur dit de nouveau : « La paix soit avec vous ! De même que le Père m'a envoyé, moi aussi, je vous envoie. »",
  },
  meditation:
    "La paix que le Christ donne n'est pas l'absence de difficultés, mais sa présence au milieu d'elles. Aujourd'hui, à qui puis-je porter cette paix ?",
  audioUrl: AUDIO,
  statut: "publie",
};

export const homelies: Homelie[] = [
  {
    id: "hom-1",
    titre: "Le pardon, chemin de guérison",
    celebration: "Messe dominicale",
    celebrant: "Mgr Dieudonné Nzapalainga",
    dateISO: jourISO(-2),
    lieu: "Cathédrale Notre-Dame, Bangui",
    audioUrl: AUDIO,
    imageUrl: IMAGE("homelie-pardon"),
    dureeSecondes: 1200,
    statut: "publie",
  },
  {
    id: "hom-2",
    titre: "Servir sans compter",
    celebration: "Messe d'ordination diaconale",
    celebrant: "Père Alain Doko",
    dateISO: jourISO(-9),
    lieu: "Cathédrale Notre-Dame, Bangui",
    audioUrl: AUDIO,
    imageUrl: IMAGE("homelie-servir"),
    dureeSecondes: 980,
    statut: "publie",
  },
];

export const interviews: Interview[] = [
  {
    id: "int-1",
    titre: "« La radio est un instrument de réconciliation »",
    invite: "Père Alain Doko",
    fonctionInvite: "Directeur diocésain de la communication",
    resume:
      "Rencontre avec le responsable de la communication du diocèse sur le rôle des médias chrétiens en Centrafrique.",
    imageUrl: IMAGE("interview-doko"),
    audioUrl: AUDIO,
    dateISO: jourISO(-5),
    format: "audio",
    statut: "publie",
  },
  {
    id: "int-2",
    titre: "Grandir en foi quand on a vingt ans à Bangui",
    invite: "Grâce Yandia",
    fonctionInvite: "Responsable du mouvement des jeunes",
    resume:
      "Un témoignage sur l'engagement des jeunes catholiques dans la capitale.",
    imageUrl: IMAGE("interview-grace"),
    audioUrl: AUDIO,
    dateISO: jourISO(-8),
    format: "audio",
    statut: "publie",
  },
];

export const reportages: Reportage[] = [
  {
    id: "rep-1",
    titre: "À Bégoua, la paroisse qui nourrit son quartier",
    type: "paroissial",
    journaliste: "Chantal Mbetigaza",
    lieu: "Bégoua, Bangui",
    resume:
      "Chaque samedi, une équipe de bénévoles prépare des repas pour une centaine d'enfants du quartier.",
    imageUrl: IMAGE("reportage-begoua"),
    galerie: [],
    audioUrl: AUDIO,
    dateISO: jourISO(-7),
    statut: "publie",
  },
];

export const dossiers: Dossier[] = [
  {
    id: "dos-1",
    titre: "Semaine de la paix en Centrafrique",
    slug: "semaine-de-la-paix",
    presentation:
      "Tous les contenus de Radio Notre-Dame consacrés à la semaine nationale de prière pour la paix : reportages, interviews, veillées en direct et prières.",
    imageUrl: IMAGE("dossier-paix"),
    dateDebutISO: jourISO(-3),
    dateFinISO: jourISO(7),
    actif: true,
    contenusIds: ["art-2", "pri-3", "int-1"],
    statut: "publie",
  },
];

export const communiques: Communique[] = [
  {
    id: "com-1",
    titre: "Communiqué de l'archevêché sur le calendrier pastoral",
    organisme: "Archevêché de Bangui",
    typeOrganisme: "diocese",
    contenu:
      "L'archevêché de Bangui informe les fidèles du calendrier des célébrations pour la nouvelle année pastorale. Les paroisses sont invitées à relayer ces informations.",
    dateISO: jourISO(-4),
    statut: "publie",
  },
];

export const paroisses: Paroisse[] = [
  {
    id: "par-1",
    nom: "Cathédrale Notre-Dame de Bangui",
    imageUrl: IMAGE("paroisse-cathedrale"),
    description: "Église-mère du diocèse de Bangui.",
    adresse: "Avenue de l'Indépendance",
    quartier: "Centre-ville",
    ville: "Bangui",
    telephone: "+236 21 61 00 00",
    horairesMesses: [
      { jour: "Dimanche", heures: ["06:30", "09:00", "18:00"] },
      { jour: "En semaine", heures: ["06:30"] },
    ],
  },
  {
    id: "par-2",
    nom: "Paroisse Saint-Paul des Rapides",
    imageUrl: IMAGE("paroisse-saint-paul"),
    adresse: "Quartier des Rapides",
    quartier: "Rapides",
    ville: "Bangui",
    horairesMesses: [{ jour: "Dimanche", heures: ["07:00", "10:00"] }],
  },
  {
    id: "par-3",
    nom: "Paroisse Sainte-Thérèse de Bimbo",
    imageUrl: IMAGE("paroisse-bimbo"),
    adresse: "Bimbo",
    ville: "Bimbo",
    horairesMesses: [{ jour: "Dimanche", heures: ["08:00"] }],
  },
];

export const dioceses: DioceseFiche[] = [
  {
    id: "dio-1",
    nom: "Archidiocèse de Bangui",
    territoire: "Bangui et ses environs",
    eveque: "Mgr Dieudonné Nzapalainga",
    adresse: "Archevêché, Bangui",
    imageUrl: IMAGE("diocese-bangui"),
  },
  {
    id: "dio-2",
    nom: "Diocèse de Bossangoa",
    territoire: "Préfecture de l'Ouham",
    eveque: "Mgr Nestor-Désiré Nongo-Aziagbia",
    imageUrl: IMAGE("diocese-bossangoa"),
  },
];

export const alertes: AlerteApp[] = [];
