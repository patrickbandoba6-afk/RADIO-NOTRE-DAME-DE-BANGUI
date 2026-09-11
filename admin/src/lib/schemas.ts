/**
 * Définition déclarative de tous les contenus administrables.
 *
 * Chaque entrée décrit une table Supabase, les champs de son formulaire et
 * les colonnes de sa liste. Les pages `/contenu/[type]` sont génériques :
 * ajouter un nouveau type de contenu se fait uniquement ici.
 */

export type TypeChamp =
  | "texte"
  | "texte_long"
  | "nombre"
  | "date"
  | "datetime"
  | "heure"
  | "booleen"
  | "select"
  | "image"
  | "fichier"
  | "liste"
  | "relation";

export interface Champ {
  nom: string;
  libelle: string;
  type: TypeChamp;
  requis?: boolean;
  aide?: string;
  options?: { valeur: string; libelle: string }[];
  /** Pour `relation` : table cible et colonne affichée. */
  table?: string;
  colonneAffichee?: string;
  defaut?: string | number | boolean;
  /** Le champ occupe toute la largeur du formulaire. */
  pleineLargeur?: boolean;
}

export interface Colonne {
  nom: string;
  libelle: string;
  type?: "texte" | "date" | "booleen" | "statut" | "image";
}

export interface SchemaContenu {
  cle: string;
  table: string;
  libelle: string;
  librelleSingulier: string;
  description: string;
  icone: string;
  groupe: "Éditorial" | "Radio" | "Spiritualité" | "Annuaires" | "Diffusion";
  colonneTri: string;
  triDescendant?: boolean;
  colonnes: Colonne[];
  champs: Champ[];
}

const STATUTS = [
  { valeur: "brouillon", libelle: "Brouillon" },
  { valeur: "en_attente", libelle: "En attente de validation" },
  { valeur: "programme", libelle: "Programmé" },
  { valeur: "publie", libelle: "Publié" },
  { valeur: "depublie", libelle: "Dépublié" },
  { valeur: "archive", libelle: "Archivé" },
];

const CHAMP_STATUT: Champ = {
  nom: "statut",
  libelle: "Statut",
  type: "select",
  options: STATUTS,
  defaut: "brouillon",
  aide: "« Programmé » publie automatiquement à la date de publication.",
};

const RUBRIQUES = [
  { valeur: "actualites", libelle: "Actualités" },
  { valeur: "bangui", libelle: "À Bangui" },
  { valeur: "rca", libelle: "En RCA" },
  { valeur: "afrique", libelle: "En Afrique" },
  { valeur: "monde", libelle: "Dans le monde" },
  { valeur: "vie_eglise", libelle: "Vie de l'Église" },
  { valeur: "spiritualite", libelle: "Spiritualité" },
  { valeur: "jeunesse", libelle: "Jeunesse" },
  { valeur: "famille", libelle: "Famille" },
  { valeur: "solidarite", libelle: "Solidarité" },
  { valeur: "societe", libelle: "Société" },
  { valeur: "culture", libelle: "Culture" },
  { valeur: "interviews", libelle: "Interviews" },
  { valeur: "reportages", libelle: "Reportages" },
  { valeur: "communiques", libelle: "Communiqués" },
  { valeur: "dossiers", libelle: "Dossiers" },
];

const JOURS = [
  { valeur: "0", libelle: "Dimanche" },
  { valeur: "1", libelle: "Lundi" },
  { valeur: "2", libelle: "Mardi" },
  { valeur: "3", libelle: "Mercredi" },
  { valeur: "4", libelle: "Jeudi" },
  { valeur: "5", libelle: "Vendredi" },
  { valeur: "6", libelle: "Samedi" },
];

export const SCHEMAS: SchemaContenu[] = [
  // ----------------------------------------------------------------- Éditorial
  {
    cle: "articles",
    table: "articles",
    libelle: "Actualités",
    librelleSingulier: "article",
    description: "Articles, reportages écrits et informations publiés dans l'application.",
    icone: "📰",
    groupe: "Éditorial",
    colonneTri: "date_publication",
    triDescendant: true,
    colonnes: [
      { nom: "image_url", libelle: "", type: "image" },
      { nom: "titre", libelle: "Titre" },
      { nom: "rubrique", libelle: "Rubrique" },
      { nom: "date_publication", libelle: "Publication", type: "date" },
      { nom: "statut", libelle: "Statut", type: "statut" },
    ],
    champs: [
      { nom: "titre", libelle: "Titre", type: "texte", requis: true, pleineLargeur: true },
      { nom: "slug", libelle: "Slug (URL)", type: "texte", requis: true, aide: "Généré depuis le titre, modifiable." },
      { nom: "sous_titre", libelle: "Sous-titre", type: "texte", pleineLargeur: true },
      { nom: "resume", libelle: "Résumé", type: "texte_long", pleineLargeur: true, aide: "Affiché dans les listes et lors du partage." },
      { nom: "contenu", libelle: "Contenu de l'article", type: "texte_long", pleineLargeur: true, aide: "Séparez les paragraphes par une ligne vide." },
      { nom: "image_url", libelle: "Image principale", type: "image", pleineLargeur: true },
      { nom: "rubrique", libelle: "Rubrique", type: "select", options: RUBRIQUES, defaut: "actualites", requis: true },
      { nom: "categorie_id", libelle: "Catégorie", type: "relation", table: "categories", colonneAffichee: "nom" },
      { nom: "auteur", libelle: "Auteur", type: "texte" },
      { nom: "lieu", libelle: "Lieu", type: "texte" },
      { nom: "date_publication", libelle: "Date de publication", type: "datetime", requis: true },
      CHAMP_STATUT,
      { nom: "a_la_une", libelle: "À la une", type: "booleen" },
      { nom: "ordre_une", libelle: "Ordre à la une", type: "nombre", defaut: 0 },
      { nom: "urgent", libelle: "Information urgente", type: "booleen" },
      { nom: "sponsorise", libelle: "Contenu sponsorisé", type: "booleen" },
      { nom: "partage_autorise", libelle: "Partage autorisé", type: "booleen", defaut: true },
      { nom: "audio_url", libelle: "Audio associé (URL)", type: "texte" },
      { nom: "video_url", libelle: "Vidéo associée (URL)", type: "texte" },
      { nom: "source", libelle: "Source", type: "texte", aide: "Obligatoire si l'information provient d'un autre média." },
      { nom: "source_url", libelle: "Lien vers la source", type: "texte" },
      { nom: "seo_titre", libelle: "Titre SEO", type: "texte" },
      { nom: "seo_description", libelle: "Description SEO", type: "texte_long", pleineLargeur: true },
    ],
  },
  {
    cle: "annonces",
    table: "annonces",
    libelle: "Annonces",
    librelleSingulier: "annonce",
    description: "Avis, appels aux dons, retraites, concerts et informations pratiques.",
    icone: "📢",
    groupe: "Éditorial",
    colonneTri: "date_debut",
    triDescendant: true,
    colonnes: [
      { nom: "image_url", libelle: "", type: "image" },
      { nom: "titre", libelle: "Titre" },
      { nom: "organisateur", libelle: "Organisateur" },
      { nom: "date_debut", libelle: "Date", type: "date" },
      { nom: "statut", libelle: "Statut", type: "statut" },
    ],
    champs: [
      { nom: "titre", libelle: "Titre", type: "texte", requis: true, pleineLargeur: true },
      { nom: "description", libelle: "Description", type: "texte_long", pleineLargeur: true },
      { nom: "image_url", libelle: "Image", type: "image", pleineLargeur: true },
      { nom: "organisateur", libelle: "Organisateur", type: "texte", requis: true },
      {
        nom: "categorie",
        libelle: "Catégorie",
        type: "select",
        defaut: "communautaire",
        options: [
          { valeur: "paroissiale", libelle: "Annonce paroissiale" },
          { valeur: "diocesaine", libelle: "Annonce diocésaine" },
          { valeur: "communautaire", libelle: "Annonce communautaire" },
          { valeur: "benevolat", libelle: "Appel à bénévoles" },
          { valeur: "dons", libelle: "Appel aux dons" },
          { valeur: "formation", libelle: "Formation" },
          { valeur: "conference", libelle: "Conférence" },
          { valeur: "retraite", libelle: "Retraite spirituelle" },
          { valeur: "pelerinage", libelle: "Pèlerinage" },
          { valeur: "veillee", libelle: "Veillée" },
          { valeur: "concert", libelle: "Concert" },
          { valeur: "messe", libelle: "Messe" },
          { valeur: "priere", libelle: "Prière" },
          { valeur: "recrutement", libelle: "Recrutement" },
          { valeur: "jeunesse", libelle: "Événement jeunesse" },
          { valeur: "famille", libelle: "Événement familial" },
          { valeur: "association", libelle: "Événement associatif" },
          { valeur: "collecte", libelle: "Collecte" },
          { valeur: "caritative", libelle: "Œuvre caritative" },
          { valeur: "urgente", libelle: "Information urgente" },
        ],
      },
      { nom: "date_debut", libelle: "Date et heure", type: "datetime", requis: true },
      { nom: "date_fin", libelle: "Date de fin", type: "datetime" },
      { nom: "lieu", libelle: "Lieu", type: "texte" },
      { nom: "adresse", libelle: "Adresse", type: "texte", pleineLargeur: true },
      { nom: "telephone", libelle: "Téléphone", type: "texte" },
      { nom: "email", libelle: "Email", type: "texte" },
      { nom: "site_web", libelle: "Site internet", type: "texte" },
      { nom: "prix", libelle: "Prix", type: "texte", aide: "Laisser vide si gratuit." },
      { nom: "lien_inscription", libelle: "Lien d'inscription", type: "texte" },
      { nom: "urgente", libelle: "Annonce urgente", type: "booleen" },
      CHAMP_STATUT,
    ],
  },
  {
    cle: "dossiers",
    table: "dossiers",
    libelle: "Dossiers",
    librelleSingulier: "dossier",
    description: "Regroupements temporaires de contenus autour d'un grand sujet.",
    icone: "🗂️",
    groupe: "Éditorial",
    colonneTri: "date_debut",
    triDescendant: true,
    colonnes: [
      { nom: "image_url", libelle: "", type: "image" },
      { nom: "titre", libelle: "Titre" },
      { nom: "actif", libelle: "Actif", type: "booleen" },
      { nom: "statut", libelle: "Statut", type: "statut" },
    ],
    champs: [
      { nom: "titre", libelle: "Titre", type: "texte", requis: true, pleineLargeur: true },
      { nom: "slug", libelle: "Slug (URL)", type: "texte", requis: true },
      { nom: "presentation", libelle: "Présentation", type: "texte_long", pleineLargeur: true },
      { nom: "image_url", libelle: "Image", type: "image", pleineLargeur: true },
      { nom: "date_debut", libelle: "Début", type: "datetime", requis: true },
      { nom: "date_fin", libelle: "Fin", type: "datetime" },
      { nom: "actif", libelle: "Dossier actif", type: "booleen", defaut: true },
      CHAMP_STATUT,
    ],
  },
  {
    cle: "communiques",
    table: "communiques",
    libelle: "Communiqués",
    librelleSingulier: "communiqué",
    description: "Communiqués officiels du diocèse, des paroisses et des institutions.",
    icone: "📄",
    groupe: "Éditorial",
    colonneTri: "date_publication",
    triDescendant: true,
    colonnes: [
      { nom: "titre", libelle: "Titre" },
      { nom: "organisme", libelle: "Organisme" },
      { nom: "date_publication", libelle: "Date", type: "date" },
      { nom: "statut", libelle: "Statut", type: "statut" },
    ],
    champs: [
      { nom: "titre", libelle: "Titre", type: "texte", requis: true, pleineLargeur: true },
      { nom: "organisme", libelle: "Organisme", type: "texte", requis: true },
      {
        nom: "type_organisme",
        libelle: "Type d'organisme",
        type: "select",
        defaut: "diocese",
        options: [
          { valeur: "diocese", libelle: "Diocèse" },
          { valeur: "paroisse", libelle: "Paroisse" },
          { valeur: "eveque", libelle: "Évêque" },
          { valeur: "conference_episcopale", libelle: "Conférence épiscopale" },
          { valeur: "radio", libelle: "Radio" },
          { valeur: "association", libelle: "Association" },
          { valeur: "institution", libelle: "Institution" },
        ],
      },
      { nom: "contenu", libelle: "Contenu", type: "texte_long", pleineLargeur: true },
      { nom: "document_url", libelle: "Document PDF", type: "fichier", pleineLargeur: true },
      { nom: "date_publication", libelle: "Date de publication", type: "datetime", requis: true },
      CHAMP_STATUT,
    ],
  },
  {
    cle: "interviews",
    table: "interviews",
    libelle: "Interviews",
    librelleSingulier: "interview",
    description: "Entretiens audio, vidéo ou écrits avec des invités.",
    icone: "🎙️",
    groupe: "Éditorial",
    colonneTri: "date_publication",
    triDescendant: true,
    colonnes: [
      { nom: "image_url", libelle: "", type: "image" },
      { nom: "titre", libelle: "Titre" },
      { nom: "invite", libelle: "Invité" },
      { nom: "date_publication", libelle: "Date", type: "date" },
      { nom: "statut", libelle: "Statut", type: "statut" },
    ],
    champs: [
      { nom: "titre", libelle: "Titre", type: "texte", requis: true, pleineLargeur: true },
      { nom: "invite", libelle: "Invité", type: "texte", requis: true },
      { nom: "fonction_invite", libelle: "Fonction de l'invité", type: "texte" },
      { nom: "resume", libelle: "Résumé", type: "texte_long", pleineLargeur: true },
      { nom: "contenu", libelle: "Contenu", type: "texte_long", pleineLargeur: true },
      { nom: "image_url", libelle: "Image", type: "image", pleineLargeur: true },
      { nom: "audio_url", libelle: "Audio", type: "fichier" },
      { nom: "video_url", libelle: "Vidéo (URL)", type: "texte" },
      {
        nom: "format",
        libelle: "Format",
        type: "select",
        defaut: "audio",
        options: [
          { valeur: "audio", libelle: "Audio" },
          { valeur: "video", libelle: "Vidéo" },
          { valeur: "article", libelle: "Article" },
          { valeur: "podcast", libelle: "Podcast" },
        ],
      },
      { nom: "date_publication", libelle: "Date", type: "datetime", requis: true },
      CHAMP_STATUT,
    ],
  },
  {
    cle: "reportages",
    table: "reportages",
    libelle: "Reportages",
    librelleSingulier: "reportage",
    description: "Reportages de terrain, paroissiaux, sociaux ou internationaux.",
    icone: "📷",
    groupe: "Éditorial",
    colonneTri: "date_publication",
    triDescendant: true,
    colonnes: [
      { nom: "image_url", libelle: "", type: "image" },
      { nom: "titre", libelle: "Titre" },
      { nom: "journaliste", libelle: "Journaliste" },
      { nom: "date_publication", libelle: "Date", type: "date" },
      { nom: "statut", libelle: "Statut", type: "statut" },
    ],
    champs: [
      { nom: "titre", libelle: "Titre", type: "texte", requis: true, pleineLargeur: true },
      {
        nom: "type",
        libelle: "Type",
        type: "select",
        defaut: "terrain",
        options: [
          { valeur: "terrain", libelle: "Reportage terrain" },
          { valeur: "paroissial", libelle: "Reportage paroissial" },
          { valeur: "evenement", libelle: "Reportage événement" },
          { valeur: "social", libelle: "Reportage social" },
          { valeur: "international", libelle: "Reportage international" },
        ],
      },
      { nom: "journaliste", libelle: "Journaliste", type: "texte" },
      { nom: "lieu", libelle: "Lieu", type: "texte" },
      { nom: "resume", libelle: "Résumé", type: "texte_long", pleineLargeur: true },
      { nom: "contenu", libelle: "Contenu", type: "texte_long", pleineLargeur: true },
      { nom: "image_url", libelle: "Image", type: "image", pleineLargeur: true },
      { nom: "audio_url", libelle: "Audio", type: "fichier" },
      { nom: "video_url", libelle: "Vidéo (URL)", type: "texte" },
      { nom: "date_publication", libelle: "Date", type: "datetime", requis: true },
      CHAMP_STATUT,
    ],
  },

  // --------------------------------------------------------------------- Radio
  {
    cle: "emissions",
    table: "emissions",
    libelle: "Émissions",
    librelleSingulier: "émission",
    description: "Catalogue des émissions de la radio et leurs horaires de diffusion.",
    icone: "📻",
    groupe: "Radio",
    colonneTri: "heure_debut",
    colonnes: [
      { nom: "visuel_url", libelle: "", type: "image" },
      { nom: "titre", libelle: "Émission" },
      { nom: "animateur", libelle: "Animateur" },
      { nom: "heure_debut", libelle: "Début" },
      { nom: "heure_fin", libelle: "Fin" },
    ],
    champs: [
      { nom: "titre", libelle: "Nom de l'émission", type: "texte", requis: true, pleineLargeur: true },
      { nom: "slug", libelle: "Slug (URL)", type: "texte" },
      { nom: "description", libelle: "Description", type: "texte_long", pleineLargeur: true },
      { nom: "visuel_url", libelle: "Image / logo", type: "image", pleineLargeur: true },
      { nom: "animateur", libelle: "Animateur", type: "texte" },
      { nom: "categorie", libelle: "Catégorie", type: "texte" },
      { nom: "frequence_diffusion", libelle: "Fréquence de diffusion", type: "texte", aide: "Ex. : « Du lundi au samedi »." },
      { nom: "heure_debut", libelle: "Heure de début", type: "heure", requis: true },
      { nom: "heure_fin", libelle: "Heure de fin", type: "heure", requis: true },
      { nom: "jours_semaine", libelle: "Jours de diffusion", type: "liste", aide: "0 = dimanche … 6 = samedi. Séparez par des virgules.", defaut: "1,2,3,4,5,6" },
      { nom: "chroniqueurs", libelle: "Chroniqueurs", type: "liste", aide: "Séparez les noms par des virgules." },
      CHAMP_STATUT,
    ],
  },
  {
    cle: "episodes",
    table: "episodes",
    libelle: "Épisodes / Podcasts",
    librelleSingulier: "épisode",
    description: "Épisodes audio rattachés aux émissions, disponibles en replay.",
    icone: "🎧",
    groupe: "Radio",
    colonneTri: "date_publication",
    triDescendant: true,
    colonnes: [
      { nom: "image_url", libelle: "", type: "image" },
      { nom: "titre", libelle: "Titre" },
      { nom: "animateur", libelle: "Animateur" },
      { nom: "date_publication", libelle: "Date", type: "date" },
      { nom: "statut", libelle: "Statut", type: "statut" },
    ],
    champs: [
      { nom: "titre", libelle: "Titre de l'épisode", type: "texte", requis: true, pleineLargeur: true },
      { nom: "emission_id", libelle: "Émission", type: "relation", table: "emissions", colonneAffichee: "titre", requis: true },
      { nom: "description", libelle: "Description", type: "texte_long", pleineLargeur: true },
      { nom: "image_url", libelle: "Image", type: "image", pleineLargeur: true },
      { nom: "audio_url", libelle: "Fichier audio", type: "fichier", requis: true, pleineLargeur: true },
      { nom: "duree_secondes", libelle: "Durée (secondes)", type: "nombre" },
      { nom: "numero_episode", libelle: "Numéro d'épisode", type: "nombre" },
      { nom: "animateur", libelle: "Animateur", type: "texte" },
      { nom: "invites", libelle: "Invités", type: "liste", aide: "Séparez par des virgules." },
      { nom: "categorie", libelle: "Catégorie", type: "texte" },
      { nom: "telechargement_autorise", libelle: "Téléchargement autorisé", type: "booleen", defaut: true },
      { nom: "date_publication", libelle: "Date de publication", type: "datetime", requis: true },
      CHAMP_STATUT,
    ],
  },
  {
    cle: "programmes_grille",
    table: "programmes_grille",
    libelle: "Grille des programmes",
    librelleSingulier: "créneau",
    description: "Créneaux horaires de la grille, jour par jour.",
    icone: "🗓️",
    groupe: "Radio",
    colonneTri: "heure_debut",
    colonnes: [
      { nom: "jour_semaine", libelle: "Jour" },
      { nom: "heure_debut", libelle: "Début" },
      { nom: "heure_fin", libelle: "Fin" },
      { nom: "actif", libelle: "Actif", type: "booleen" },
    ],
    champs: [
      { nom: "emission_id", libelle: "Émission", type: "relation", table: "emissions", colonneAffichee: "titre", requis: true },
      { nom: "jour_semaine", libelle: "Jour de la semaine", type: "select", options: JOURS, requis: true },
      { nom: "heure_debut", libelle: "Heure de début", type: "heure", requis: true },
      { nom: "heure_fin", libelle: "Heure de fin", type: "heure", requis: true },
      { nom: "actif", libelle: "Créneau actif", type: "booleen", defaut: true },
    ],
  },
  {
    cle: "videos",
    table: "videos",
    libelle: "Vidéos & messes",
    librelleSingulier: "vidéo",
    description: "Directs vidéo et replays des messes, cultes et conférences.",
    icone: "🎥",
    groupe: "Radio",
    colonneTri: "date_diffusion",
    triDescendant: true,
    colonnes: [
      { nom: "image_url", libelle: "", type: "image" },
      { nom: "titre", libelle: "Titre" },
      { nom: "categorie", libelle: "Catégorie" },
      { nom: "est_en_direct", libelle: "Direct", type: "booleen" },
      { nom: "date_diffusion", libelle: "Diffusion", type: "date" },
    ],
    champs: [
      { nom: "titre", libelle: "Titre", type: "texte", requis: true, pleineLargeur: true },
      {
        nom: "categorie",
        libelle: "Catégorie",
        type: "select",
        defaut: "messe",
        options: [
          { valeur: "messe", libelle: "Messe" },
          { valeur: "culte", libelle: "Culte" },
          { valeur: "conference", libelle: "Conférence" },
          { valeur: "concert", libelle: "Concert" },
          { valeur: "emission", libelle: "Émission" },
        ],
      },
      { nom: "video_url", libelle: "URL de la vidéo", type: "texte", requis: true, pleineLargeur: true },
      { nom: "image_url", libelle: "Miniature", type: "image", pleineLargeur: true },
      { nom: "est_en_direct", libelle: "Diffusion en direct", type: "booleen" },
      { nom: "date_diffusion", libelle: "Date de diffusion", type: "datetime", requis: true },
      { nom: "duree_secondes", libelle: "Durée (secondes)", type: "nombre" },
      { nom: "sous_titres_disponibles", libelle: "Sous-titres disponibles", type: "booleen" },
    ],
  },

  // -------------------------------------------------------------- Spiritualité
  {
    cle: "evangiles_du_jour",
    table: "evangiles_du_jour",
    libelle: "Évangile du jour",
    librelleSingulier: "évangile",
    description: "Lectures, psaume, évangile et méditation quotidiens.",
    icone: "✝️",
    groupe: "Spiritualité",
    colonneTri: "date",
    triDescendant: true,
    colonnes: [
      { nom: "date", libelle: "Date", type: "date" },
      { nom: "saint_du_jour", libelle: "Saint du jour" },
      { nom: "statut", libelle: "Statut", type: "statut" },
    ],
    champs: [
      { nom: "date", libelle: "Date", type: "date", requis: true },
      { nom: "saint_du_jour", libelle: "Saint du jour", type: "texte", pleineLargeur: true },
      { nom: "evangile", libelle: "Évangile", type: "texte_long", requis: true, pleineLargeur: true, aide: 'Format JSON : {"reference": "…", "texte": "…"}' },
      { nom: "premiere_lecture", libelle: "Première lecture", type: "texte_long", pleineLargeur: true, aide: 'Format JSON : {"reference": "…", "texte": "…"}' },
      { nom: "psaume", libelle: "Psaume", type: "texte_long", pleineLargeur: true, aide: 'Format JSON : {"reference": "…", "texte": "…"}' },
      { nom: "deuxieme_lecture", libelle: "Deuxième lecture", type: "texte_long", pleineLargeur: true, aide: 'Format JSON : {"reference": "…", "texte": "…"}' },
      { nom: "meditation", libelle: "Méditation", type: "texte_long", pleineLargeur: true },
      { nom: "commentaire", libelle: "Commentaire", type: "texte_long", pleineLargeur: true },
      { nom: "audio_url", libelle: "Audio", type: "fichier" },
      CHAMP_STATUT,
    ],
  },
  {
    cle: "prieres",
    table: "prieres",
    libelle: "Prières",
    librelleSingulier: "prière",
    description: "Prières du matin, du soir, chapelet, neuvaines et intentions.",
    icone: "🙏",
    groupe: "Spiritualité",
    colonneTri: "cree_le",
    triDescendant: true,
    colonnes: [
      { nom: "image_url", libelle: "", type: "image" },
      { nom: "titre", libelle: "Titre" },
      { nom: "type", libelle: "Type" },
      { nom: "statut", libelle: "Statut", type: "statut" },
    ],
    champs: [
      { nom: "titre", libelle: "Titre", type: "texte", requis: true, pleineLargeur: true },
      {
        nom: "type",
        libelle: "Type de prière",
        type: "select",
        defaut: "quotidienne",
        options: [
          { valeur: "matin", libelle: "Prière du matin" },
          { valeur: "soir", libelle: "Prière du soir" },
          { valeur: "quotidienne", libelle: "Prière quotidienne" },
          { valeur: "paix", libelle: "Prière pour la paix" },
          { valeur: "malades", libelle: "Prière pour les malades" },
          { valeur: "familles", libelle: "Prière pour les familles" },
          { valeur: "jeunes", libelle: "Prière pour les jeunes" },
          { valeur: "defunts", libelle: "Prière pour les défunts" },
          { valeur: "mariale", libelle: "Prière mariale" },
          { valeur: "chapelet", libelle: "Chapelet" },
          { valeur: "neuvaine", libelle: "Neuvaine" },
          { valeur: "adoration", libelle: "Adoration" },
        ],
      },
      { nom: "texte", libelle: "Texte de la prière", type: "texte_long", pleineLargeur: true },
      { nom: "image_url", libelle: "Image", type: "image", pleineLargeur: true },
      { nom: "audio_url", libelle: "Audio", type: "fichier" },
      { nom: "video_url", libelle: "Vidéo (URL)", type: "texte" },
      { nom: "duree_secondes", libelle: "Durée (secondes)", type: "nombre" },
      { nom: "auteur", libelle: "Auteur", type: "texte" },
      CHAMP_STATUT,
    ],
  },
  {
    cle: "homelies",
    table: "homelies",
    libelle: "Homélies",
    librelleSingulier: "homélie",
    description: "Homélies enregistrées lors des célébrations.",
    icone: "🕊️",
    groupe: "Spiritualité",
    colonneTri: "date_celebration",
    triDescendant: true,
    colonnes: [
      { nom: "image_url", libelle: "", type: "image" },
      { nom: "titre", libelle: "Titre" },
      { nom: "celebrant", libelle: "Célébrant" },
      { nom: "date_celebration", libelle: "Date", type: "date" },
      { nom: "statut", libelle: "Statut", type: "statut" },
    ],
    champs: [
      { nom: "titre", libelle: "Titre", type: "texte", requis: true, pleineLargeur: true },
      { nom: "celebration", libelle: "Célébration", type: "texte" },
      { nom: "celebrant", libelle: "Célébrant", type: "texte", requis: true },
      { nom: "date_celebration", libelle: "Date de la célébration", type: "datetime", requis: true },
      { nom: "lieu", libelle: "Lieu", type: "texte" },
      { nom: "texte", libelle: "Texte", type: "texte_long", pleineLargeur: true },
      { nom: "image_url", libelle: "Image", type: "image", pleineLargeur: true },
      { nom: "audio_url", libelle: "Audio", type: "fichier" },
      { nom: "video_url", libelle: "Vidéo (URL)", type: "texte" },
      { nom: "duree_secondes", libelle: "Durée (secondes)", type: "nombre" },
      { nom: "transcription", libelle: "Transcription", type: "texte_long", pleineLargeur: true },
      CHAMP_STATUT,
    ],
  },

  // ----------------------------------------------------------------- Annuaires
  {
    cle: "paroisses",
    table: "paroisses",
    libelle: "Paroisses",
    librelleSingulier: "paroisse",
    description: "Annuaire des paroisses avec horaires des messes et contacts.",
    icone: "⛪",
    groupe: "Annuaires",
    colonneTri: "nom",
    colonnes: [
      { nom: "image_url", libelle: "", type: "image" },
      { nom: "nom", libelle: "Paroisse" },
      { nom: "quartier", libelle: "Quartier" },
      { nom: "ville", libelle: "Ville" },
    ],
    champs: [
      { nom: "nom", libelle: "Nom", type: "texte", requis: true, pleineLargeur: true },
      { nom: "diocese_id", libelle: "Diocèse", type: "relation", table: "dioceses", colonneAffichee: "nom" },
      { nom: "description", libelle: "Description", type: "texte_long", pleineLargeur: true },
      { nom: "image_url", libelle: "Photo", type: "image", pleineLargeur: true },
      { nom: "adresse", libelle: "Adresse", type: "texte", pleineLargeur: true },
      { nom: "quartier", libelle: "Quartier", type: "texte" },
      { nom: "arrondissement", libelle: "Arrondissement", type: "texte" },
      { nom: "ville", libelle: "Ville", type: "texte", defaut: "Bangui" },
      { nom: "telephone", libelle: "Téléphone", type: "texte" },
      { nom: "email", libelle: "Email", type: "texte" },
      { nom: "latitude", libelle: "Latitude", type: "nombre" },
      { nom: "longitude", libelle: "Longitude", type: "nombre" },
      {
        nom: "horaires_messes",
        libelle: "Horaires des messes",
        type: "texte_long",
        pleineLargeur: true,
        aide: 'Format JSON : [{"jour": "Dimanche", "heures": ["07:00", "10:00"]}]',
      },
    ],
  },
  {
    cle: "dioceses",
    table: "dioceses",
    libelle: "Diocèses",
    librelleSingulier: "diocèse",
    description: "Annuaire des diocèses de Centrafrique.",
    icone: "🏛️",
    groupe: "Annuaires",
    colonneTri: "nom",
    colonnes: [
      { nom: "nom", libelle: "Diocèse" },
      { nom: "eveque", libelle: "Évêque" },
      { nom: "territoire", libelle: "Territoire" },
    ],
    champs: [
      { nom: "nom", libelle: "Nom", type: "texte", requis: true, pleineLargeur: true },
      { nom: "territoire", libelle: "Territoire", type: "texte", pleineLargeur: true },
      { nom: "eveque", libelle: "Évêque", type: "texte" },
      { nom: "adresse", libelle: "Adresse", type: "texte" },
      { nom: "telephone", libelle: "Téléphone", type: "texte" },
      { nom: "email", libelle: "Email", type: "texte" },
      { nom: "image_url", libelle: "Image", type: "image", pleineLargeur: true },
    ],
  },
  {
    cle: "organisations",
    table: "organisations",
    libelle: "Organisations",
    librelleSingulier: "organisation",
    description: "Associations, mouvements, communautés et œuvres.",
    icone: "🤝",
    groupe: "Annuaires",
    colonneTri: "nom",
    colonnes: [
      { nom: "nom", libelle: "Organisation" },
      { nom: "type", libelle: "Type" },
      { nom: "ville", libelle: "Ville" },
    ],
    champs: [
      { nom: "nom", libelle: "Nom", type: "texte", requis: true, pleineLargeur: true },
      {
        nom: "type",
        libelle: "Type",
        type: "select",
        defaut: "association",
        options: [
          { valeur: "paroisse", libelle: "Paroisse" },
          { valeur: "association", libelle: "Association" },
          { valeur: "mouvement", libelle: "Mouvement" },
          { valeur: "communaute", libelle: "Communauté" },
          { valeur: "oeuvre", libelle: "Œuvre" },
          { valeur: "institution", libelle: "Institution religieuse" },
          { valeur: "groupe_jeunes", libelle: "Groupe de jeunes" },
        ],
      },
      { nom: "description", libelle: "Description", type: "texte_long", pleineLargeur: true },
      { nom: "image_url", libelle: "Image", type: "image", pleineLargeur: true },
      { nom: "contact", libelle: "Contact", type: "texte" },
      { nom: "ville", libelle: "Ville", type: "texte" },
    ],
  },
  {
    cle: "categories",
    table: "categories",
    libelle: "Catégories",
    librelleSingulier: "catégorie",
    description: "Catégories utilisées pour classer les actualités.",
    icone: "🏷️",
    groupe: "Annuaires",
    colonneTri: "ordre",
    colonnes: [
      { nom: "nom", libelle: "Catégorie" },
      { nom: "rubrique", libelle: "Rubrique" },
      { nom: "ordre", libelle: "Ordre" },
    ],
    champs: [
      { nom: "nom", libelle: "Nom", type: "texte", requis: true },
      { nom: "slug", libelle: "Slug", type: "texte", requis: true },
      { nom: "rubrique", libelle: "Rubrique", type: "select", options: RUBRIQUES, defaut: "actualites" },
      { nom: "couleur", libelle: "Couleur (hex)", type: "texte" },
      { nom: "ordre", libelle: "Ordre d'affichage", type: "nombre", defaut: 0 },
    ],
  },

  // ----------------------------------------------------------------- Diffusion
  {
    cle: "alertes",
    table: "alertes",
    libelle: "Alertes",
    librelleSingulier: "alerte",
    description: "Messages prioritaires affichés immédiatement dans l'application.",
    icone: "🚨",
    groupe: "Diffusion",
    colonneTri: "cree_le",
    triDescendant: true,
    colonnes: [
      { nom: "titre", libelle: "Titre" },
      { nom: "type", libelle: "Type" },
      { nom: "active", libelle: "Active", type: "booleen" },
      { nom: "cree_le", libelle: "Créée le", type: "date" },
    ],
    champs: [
      { nom: "titre", libelle: "Titre", type: "texte", requis: true, pleineLargeur: true },
      { nom: "message", libelle: "Message", type: "texte_long", requis: true, pleineLargeur: true },
      {
        nom: "type",
        libelle: "Type d'alerte",
        type: "select",
        defaut: "info",
        options: [
          { valeur: "info", libelle: "Information" },
          { valeur: "urgent", libelle: "Urgent" },
          { valeur: "direct", libelle: "Direct" },
        ],
      },
      { nom: "active", libelle: "Alerte active", type: "booleen", defaut: true },
      { nom: "expire_le", libelle: "Expire le", type: "datetime" },
    ],
  },
  {
    cle: "notifications",
    table: "notifications",
    libelle: "Notifications",
    librelleSingulier: "notification",
    description: "Notifications push envoyées aux auditeurs.",
    icone: "🔔",
    groupe: "Diffusion",
    colonneTri: "cree_le",
    triDescendant: true,
    colonnes: [
      { nom: "titre", libelle: "Titre" },
      { nom: "categorie", libelle: "Catégorie" },
      { nom: "envoyee_le", libelle: "Envoyée le", type: "date" },
    ],
    champs: [
      { nom: "titre", libelle: "Titre", type: "texte", requis: true, pleineLargeur: true },
      { nom: "message", libelle: "Message", type: "texte_long", pleineLargeur: true },
      {
        nom: "categorie",
        libelle: "Catégorie",
        type: "select",
        defaut: "actualites",
        options: [
          { valeur: "actualites", libelle: "Actualités" },
          { valeur: "directs", libelle: "Direct" },
          { valeur: "podcasts", libelle: "Podcasts" },
          { valeur: "evenements", libelle: "Événements" },
          { valeur: "spiritualite", libelle: "Spiritualité" },
          { valeur: "annonces", libelle: "Annonces" },
          { valeur: "verset", libelle: "Évangile du jour" },
          { valeur: "urgences", libelle: "Urgences" },
        ],
      },
      { nom: "programmee_le", libelle: "Programmer l'envoi", type: "datetime" },
      { nom: "envoyee_le", libelle: "Envoyée le", type: "datetime", aide: "Renseigné automatiquement à l'envoi." },
    ],
  },
  {
    cle: "evenements",
    table: "evenements",
    libelle: "Événements",
    librelleSingulier: "événement",
    description: "Événements de l'agenda : messes, veillées, conférences, festivals.",
    icone: "📅",
    groupe: "Éditorial",
    colonneTri: "date_debut",
    triDescendant: true,
    colonnes: [
      { nom: "image_url", libelle: "", type: "image" },
      { nom: "titre", libelle: "Titre" },
      { nom: "lieu", libelle: "Lieu" },
      { nom: "date_debut", libelle: "Début", type: "date" },
      { nom: "statut", libelle: "Statut", type: "statut" },
    ],
    champs: [
      { nom: "titre", libelle: "Titre", type: "texte", requis: true, pleineLargeur: true },
      { nom: "description", libelle: "Description", type: "texte_long", pleineLargeur: true },
      { nom: "image_url", libelle: "Image", type: "image", pleineLargeur: true },
      {
        nom: "mode",
        libelle: "Mode",
        type: "select",
        defaut: "sur_place",
        options: [
          { valeur: "en_ligne", libelle: "En ligne" },
          { valeur: "sur_place", libelle: "Sur place" },
        ],
      },
      {
        nom: "categorie_agenda",
        libelle: "Catégorie",
        type: "select",
        defaut: "autre",
        options: [
          { valeur: "messe", libelle: "Messe" },
          { valeur: "priere", libelle: "Prière" },
          { valeur: "conference", libelle: "Conférence" },
          { valeur: "retraite", libelle: "Retraite" },
          { valeur: "pelerinage", libelle: "Pèlerinage" },
          { valeur: "concert", libelle: "Concert" },
          { valeur: "formation", libelle: "Formation" },
          { valeur: "jeunesse", libelle: "Jeunesse" },
          { valeur: "famille", libelle: "Famille" },
          { valeur: "paroisse", libelle: "Paroisse" },
          { valeur: "diocese", libelle: "Diocèse" },
          { valeur: "association", libelle: "Association" },
          { valeur: "solidarite", libelle: "Solidarité" },
          { valeur: "autre", libelle: "Autre" },
        ],
      },
      { nom: "lieu", libelle: "Lieu", type: "texte" },
      { nom: "adresse", libelle: "Adresse", type: "texte", pleineLargeur: true },
      { nom: "date_debut", libelle: "Début", type: "datetime", requis: true },
      { nom: "date_fin", libelle: "Fin", type: "datetime", requis: true },
      { nom: "organisateur", libelle: "Organisateur", type: "texte" },
      { nom: "contact", libelle: "Contact", type: "texte" },
      { nom: "intervenants", libelle: "Intervenants", type: "liste", aide: "Séparez par des virgules." },
      { nom: "programme", libelle: "Programme", type: "texte_long", pleineLargeur: true, aide: 'Format JSON : [{"heure": "19:00", "titre": "Louange"}]' },
      { nom: "lien_inscription", libelle: "Lien d'inscription", type: "texte" },
      { nom: "diffuse_en_direct", libelle: "Diffusé en direct sur la radio", type: "booleen" },
      { nom: "replay_url", libelle: "URL du replay", type: "texte" },
      CHAMP_STATUT,
    ],
  },
];

export function schemaParCle(cle: string): SchemaContenu | undefined {
  return SCHEMAS.find((schema) => schema.cle === cle);
}

export function schemasParGroupe() {
  const groupes = new Map<string, SchemaContenu[]>();
  for (const schema of SCHEMAS) {
    const liste = groupes.get(schema.groupe) ?? [];
    liste.push(schema);
    groupes.set(schema.groupe, liste);
  }
  return groupes;
}
