// Couche d'accès au contenu éditorial.
//
// Chaque fonction interroge Supabase lorsque le projet est configuré, et
// retombe sur les données d'exemple locales sinon (ou en cas d'erreur
// réseau). Les écrans n'ont donc jamais à savoir d'où vient le contenu.
import * as exemple from "@/data/sampleEditorial";
import { podcasts as podcastsExemple, predications as predicationsExemple, videos as videosExemple, evenements as evenementsExemple, versetDuJour as versetDuJourExemple } from "@/data/sampleData";
import { supabase } from "@/lib/supabase";
import type { Evenement, LivreBible, Podcast, Predication, VersetBible, VersetDuJour, VideoContenu } from "@/types";
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
  Rubrique,
  StatutPublication,
} from "@/types/editorial";

type Ligne = Record<string, any>;

async function requete<T>(
  executer: () => Promise<T[]>,
  repli: T[]
): Promise<T[]> {
  if (!supabase) return repli;
  try {
    const resultat = await executer();
    return resultat.length > 0 ? resultat : repli;
  } catch {
    return repli;
  }
}

// --------------------------------------------------------------------------
// Convertisseurs base de données → types de l'application
// --------------------------------------------------------------------------

function versArticle(ligne: Ligne): Article {
  return {
    id: ligne.id,
    slug: ligne.slug ?? ligne.id,
    titre: ligne.titre,
    sousTitre: ligne.sous_titre ?? undefined,
    resume: ligne.resume ?? "",
    contenu: ligne.contenu ?? "",
    imageUrl: ligne.image_url ?? "",
    galerie: [],
    videoUrl: ligne.video_url ?? undefined,
    audioUrl: ligne.audio_url ?? undefined,
    auteur: ligne.auteur ?? "Rédaction",
    rubrique: (ligne.rubrique ?? "actualites") as Rubrique,
    categorie: ligne.categories?.nom ?? "",
    tags: [],
    lieu: ligne.lieu ?? undefined,
    datePublication: ligne.date_publication,
    dateModification: ligne.modifie_le ?? undefined,
    statut: (ligne.statut ?? "publie") as StatutPublication,
    aLaUne: Boolean(ligne.a_la_une),
    urgent: Boolean(ligne.urgent),
    sponsorise: Boolean(ligne.sponsorise),
    partageAutorise: ligne.partage_autorise !== false,
    nombreVues: ligne.nombre_vues ?? 0,
    source: ligne.source ?? undefined,
    sourceUrl: ligne.source_url ?? undefined,
    langue: ligne.langue ?? "fr",
    contenusAssocies: [],
  };
}

function versAnnonce(ligne: Ligne): Annonce {
  return {
    id: ligne.id,
    titre: ligne.titre,
    description: ligne.description ?? "",
    imageUrl: ligne.image_url ?? undefined,
    organisateur: ligne.organisateur ?? "",
    categorie: ligne.categorie ?? "communautaire",
    dateDebutISO: ligne.date_debut,
    dateFinISO: ligne.date_fin ?? undefined,
    lieu: ligne.lieu ?? undefined,
    adresse: ligne.adresse ?? undefined,
    latitude: ligne.latitude ?? undefined,
    longitude: ligne.longitude ?? undefined,
    telephone: ligne.telephone ?? undefined,
    email: ligne.email ?? undefined,
    siteWeb: ligne.site_web ?? undefined,
    prix: ligne.prix ?? undefined,
    lienInscription: ligne.lien_inscription ?? undefined,
    statut: (ligne.statut ?? "publie") as StatutPublication,
    urgente: Boolean(ligne.urgente),
    datePublication: ligne.date_publication,
  };
}

function versEmission(ligne: Ligne): EmissionCatalogue {
  return {
    id: ligne.id,
    nom: ligne.titre ?? ligne.nom,
    slug: ligne.slug ?? ligne.id,
    description: ligne.description ?? "",
    imageUrl: ligne.visuel_url ?? ligne.image_url ?? "",
    animateur: ligne.animateur ?? "",
    chroniqueurs: ligne.chroniqueurs ?? [],
    categorie: ligne.categorie ?? "",
    frequenceDiffusion: ligne.frequence_diffusion ?? "",
    joursSemaine: ligne.jours_semaine ?? [0, 1, 2, 3, 4, 5, 6],
    heureDebut: (ligne.heure_debut ?? "").slice(0, 5),
    heureFin: (ligne.heure_fin ?? "").slice(0, 5),
    statut: (ligne.statut ?? "publie") as StatutPublication,
  };
}

function versEpisode(ligne: Ligne): Episode {
  return {
    id: ligne.id,
    emissionId: ligne.emission_id ?? "",
    titre: ligne.titre,
    description: ligne.description ?? "",
    imageUrl: ligne.image_url ?? "",
    audioUrl: ligne.audio_url,
    dureeSecondes: ligne.duree_secondes ?? 0,
    datePublication: ligne.date_publication,
    animateur: ligne.animateur ?? "",
    invites: ligne.invites ?? [],
    categorie: ligne.categorie ?? "",
    tags: [],
    statut: (ligne.statut ?? "publie") as StatutPublication,
  };
}

function versPriere(ligne: Ligne): Priere {
  return {
    id: ligne.id,
    titre: ligne.titre,
    type: ligne.type ?? "quotidienne",
    texte: ligne.texte ?? "",
    audioUrl: ligne.audio_url ?? undefined,
    videoUrl: ligne.video_url ?? undefined,
    imageUrl: ligne.image_url ?? "",
    dureeSecondes: ligne.duree_secondes ?? undefined,
    auteur: ligne.auteur ?? undefined,
    statut: (ligne.statut ?? "publie") as StatutPublication,
  };
}

function versHomelie(ligne: Ligne): Homelie {
  return {
    id: ligne.id,
    titre: ligne.titre,
    celebration: ligne.celebration ?? "",
    celebrant: ligne.celebrant ?? "",
    dateISO: ligne.date_celebration,
    lieu: ligne.lieu ?? undefined,
    texte: ligne.texte ?? undefined,
    audioUrl: ligne.audio_url ?? undefined,
    videoUrl: ligne.video_url ?? undefined,
    imageUrl: ligne.image_url ?? "",
    dureeSecondes: ligne.duree_secondes ?? undefined,
    transcription: ligne.transcription ?? undefined,
    statut: (ligne.statut ?? "publie") as StatutPublication,
  };
}

function versInterview(ligne: Ligne): Interview {
  return {
    id: ligne.id,
    titre: ligne.titre,
    invite: ligne.invite ?? "",
    fonctionInvite: ligne.fonction_invite ?? "",
    resume: ligne.resume ?? "",
    contenu: ligne.contenu ?? undefined,
    imageUrl: ligne.image_url ?? "",
    audioUrl: ligne.audio_url ?? undefined,
    videoUrl: ligne.video_url ?? undefined,
    dateISO: ligne.date_publication,
    format: ligne.format ?? "audio",
    statut: (ligne.statut ?? "publie") as StatutPublication,
  };
}

function versReportage(ligne: Ligne): Reportage {
  return {
    id: ligne.id,
    titre: ligne.titre,
    type: ligne.type ?? "terrain",
    journaliste: ligne.journaliste ?? "",
    lieu: ligne.lieu ?? "",
    resume: ligne.resume ?? "",
    contenu: ligne.contenu ?? undefined,
    imageUrl: ligne.image_url ?? "",
    galerie: [],
    audioUrl: ligne.audio_url ?? undefined,
    videoUrl: ligne.video_url ?? undefined,
    dateISO: ligne.date_publication,
    statut: (ligne.statut ?? "publie") as StatutPublication,
  };
}

function versDossier(ligne: Ligne): Dossier {
  return {
    id: ligne.id,
    titre: ligne.titre,
    slug: ligne.slug ?? ligne.id,
    presentation: ligne.presentation ?? "",
    imageUrl: ligne.image_url ?? "",
    dateDebutISO: ligne.date_debut,
    dateFinISO: ligne.date_fin ?? undefined,
    actif: ligne.actif !== false,
    contenusIds: [],
    statut: (ligne.statut ?? "publie") as StatutPublication,
  };
}

function versCommunique(ligne: Ligne): Communique {
  return {
    id: ligne.id,
    titre: ligne.titre,
    organisme: ligne.organisme ?? "",
    typeOrganisme: ligne.type_organisme ?? "diocese",
    contenu: ligne.contenu ?? "",
    documentUrl: ligne.document_url ?? undefined,
    dateISO: ligne.date_publication,
    statut: (ligne.statut ?? "publie") as StatutPublication,
  };
}

function versParoisse(ligne: Ligne): Paroisse {
  return {
    id: ligne.id,
    nom: ligne.nom,
    imageUrl: ligne.image_url ?? undefined,
    description: ligne.description ?? undefined,
    adresse: ligne.adresse ?? "",
    quartier: ligne.quartier ?? undefined,
    ville: ligne.ville ?? "Bangui",
    dioceseId: ligne.diocese_id ?? undefined,
    telephone: ligne.telephone ?? undefined,
    email: ligne.email ?? undefined,
    cure: ligne.cure ?? undefined,
    vicaire: ligne.vicaire ?? undefined,
    latitude: ligne.latitude ?? undefined,
    longitude: ligne.longitude ?? undefined,
    horairesMesses: ligne.horaires_messes ?? [],
  };
}

function versEvenement(ligne: Ligne): Evenement {
  return {
    id: ligne.id,
    titre: ligne.titre,
    description: ligne.description ?? "",
    mode: ligne.mode ?? "en_ligne",
    lieu: ligne.lieu ?? undefined,
    dateDebutISO: ligne.date_debut,
    dateFinISO: ligne.date_fin,
    fuseauHoraire: ligne.fuseau_horaire ?? "Africa/Bangui",
    intervenants: ligne.intervenants ?? [],
    programme: ligne.programme ?? [],
    imageUrl: ligne.image_url ?? "",
    estInscrit: false,
  };
}

function versPodcast(ligne: Ligne): Podcast {
  return {
    id: ligne.id,
    titre: ligne.titre,
    emission: ligne.emissions?.titre ?? "",
    animateur: ligne.animateur ?? "",
    theme: ligne.theme ?? "",
    langue: ligne.langue ?? "fr",
    datePublication: ligne.date_publication,
    dureeSecondes: ligne.duree_secondes ?? 0,
    audioUrl: ligne.audio_url,
    imageUrl: ligne.image_url ?? "",
    transcription: ligne.transcription ?? undefined,
  };
}

function versPredication(ligne: Ligne): Predication {
  return {
    id: ligne.id,
    titre: ligne.titre,
    predicateur: ligne.predicateur,
    serie: ligne.serie ?? "",
    theme: ligne.theme ?? "",
    verset: ligne.verset ?? undefined,
    langue: ligne.langue ?? "fr",
    datePublication: ligne.date_publication,
    dureeSecondes: ligne.duree_secondes ?? 0,
    audioUrl: ligne.audio_url ?? "",
    videoUrl: ligne.video_url ?? undefined,
    imageUrl: ligne.image_url ?? "",
  };
}

function versVideo(ligne: Ligne): VideoContenu {
  return {
    id: ligne.id,
    titre: ligne.titre,
    categorie: ligne.categorie ?? "emission",
    estEnDirect: Boolean(ligne.est_en_direct),
    dateDiffusion: ligne.date_diffusion,
    dureeSecondes: ligne.duree_secondes ?? 0,
    videoUrl: ligne.video_url,
    imageUrl: ligne.image_url ?? "",
    sousTitresDisponibles: Boolean(ligne.sous_titres_disponibles),
  };
}

// --------------------------------------------------------------------------
// Lectures publiques
// --------------------------------------------------------------------------

export function chargerArticles(rubrique?: Rubrique): Promise<Article[]> {
  const repli = rubrique && rubrique !== "actualites"
    ? exemple.articles.filter((a) => a.rubrique === rubrique)
    : exemple.articles;

  return requete(async () => {
    let requeteSql = supabase!
      .from("articles")
      .select("*, categories(nom)")
      .eq("statut", "publie")
      .order("date_publication", { ascending: false })
      .limit(60);
    if (rubrique && rubrique !== "actualites") {
      requeteSql = requeteSql.eq("rubrique", rubrique);
    }
    const { data, error } = await requeteSql;
    if (error) throw error;
    return (data ?? []).map(versArticle);
  }, repli);
}

export async function chargerArticleParId(id: string): Promise<Article | null> {
  const local = exemple.articles.find((a) => a.id === id) ?? null;
  if (!supabase) return local;
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*, categories(nom)")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return local;
    return versArticle(data);
  } catch {
    return local;
  }
}

export function chargerArticlesALaUne(): Promise<Article[]> {
  const repli = exemple.articles.filter((a) => a.aLaUne);
  return requete(async () => {
    const { data, error } = await supabase!
      .from("articles")
      .select("*, categories(nom)")
      .eq("statut", "publie")
      .eq("a_la_une", true)
      .order("ordre_une", { ascending: true })
      .limit(10);
    if (error) throw error;
    return (data ?? []).map(versArticle);
  }, repli);
}

export function chargerAnnonces(): Promise<Annonce[]> {
  return requete(async () => {
    const { data, error } = await supabase!
      .from("annonces")
      .select("*")
      .eq("statut", "publie")
      .order("date_debut", { ascending: true })
      .limit(60);
    if (error) throw error;
    return (data ?? []).map(versAnnonce);
  }, exemple.annonces);
}

export function chargerEmissions(): Promise<EmissionCatalogue[]> {
  return requete(async () => {
    const { data, error } = await supabase!
      .from("emissions")
      .select("*")
      .order("heure_debut", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(versEmission);
  }, exemple.emissionsCatalogue);
}

export function chargerEpisodes(emissionId?: string): Promise<Episode[]> {
  const repli = emissionId
    ? exemple.episodes.filter((e) => e.emissionId === emissionId)
    : exemple.episodes;
  return requete(async () => {
    let requeteSql = supabase!
      .from("episodes")
      .select("*")
      .eq("statut", "publie")
      .order("date_publication", { ascending: false })
      .limit(60);
    if (emissionId) requeteSql = requeteSql.eq("emission_id", emissionId);
    const { data, error } = await requeteSql;
    if (error) throw error;
    return (data ?? []).map(versEpisode);
  }, repli);
}

export async function chargerGrille(): Promise<CreneauProgramme[]> {
  if (!supabase) return exemple.grilleProgrammes;
  try {
    const { data, error } = await supabase
      .from("programmes_grille")
      .select("*, emissions(titre, animateur, visuel_url, description)")
      .eq("actif", true);
    if (error || !data || data.length === 0) return exemple.grilleProgrammes;
    return data.map((ligne: Ligne) => ({
      id: ligne.id,
      emissionId: ligne.emission_id,
      emissionNom: ligne.emissions?.titre ?? "",
      animateur: ligne.emissions?.animateur ?? "",
      imageUrl: ligne.emissions?.visuel_url ?? "",
      description: ligne.emissions?.description ?? undefined,
      heureDebut: (ligne.heure_debut ?? "").slice(0, 5),
      heureFin: (ligne.heure_fin ?? "").slice(0, 5),
      jourSemaine: ligne.jour_semaine,
    }));
  } catch {
    return exemple.grilleProgrammes;
  }
}

export function chargerPrieres(): Promise<Priere[]> {
  return requete(async () => {
    const { data, error } = await supabase!
      .from("prieres")
      .select("*")
      .eq("statut", "publie");
    if (error) throw error;
    return (data ?? []).map(versPriere);
  }, exemple.prieres);
}

export async function chargerEvangileDuJour(): Promise<EvangileDuJour> {
  if (!supabase) return exemple.evangileDuJour;
  try {
    const { data, error } = await supabase
      .from("evangiles_du_jour")
      .select("*")
      .eq("statut", "publie")
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return exemple.evangileDuJour;
    return {
      id: data.id,
      date: data.date,
      saintDuJour: data.saint_du_jour ?? undefined,
      premiereLecture: data.premiere_lecture ?? undefined,
      psaume: data.psaume ?? undefined,
      deuxiemeLecture: data.deuxieme_lecture ?? undefined,
      evangile: data.evangile,
      meditation: data.meditation ?? undefined,
      commentaire: data.commentaire ?? undefined,
      audioUrl: data.audio_url ?? undefined,
      statut: data.statut,
    };
  } catch {
    return exemple.evangileDuJour;
  }
}

export async function chargerVersetDuJour(): Promise<VersetDuJour> {
  if (!supabase) return versetDuJourExemple;
  try {
    const { data, error } = await supabase
      .from("versets_du_jour")
      .select("*")
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return versetDuJourExemple;
    return {
      id: data.id,
      reference: data.reference,
      texte: data.texte,
      traduction: data.traduction,
      meditation: data.meditation ?? "",
      date: data.date,
    };
  } catch {
    return versetDuJourExemple;
  }
}

export function chargerLivresBible(): Promise<LivreBible[]> {
  return requete(async () => {
    const { data, error } = await supabase!
      .from("bible_livres")
      .select("*")
      .order("ordre");
    if (error) throw error;
    return (data ?? []).map((l) => ({
      code: l.code,
      nom: l.nom,
      testament: l.testament,
      canon: l.canon,
      ordre: l.ordre,
      nombreChapitres: l.nombre_chapitres,
    }));
  }, []);
}

export async function chargerVersetsChapitre(
  livreCode: string,
  chapitre: number,
  traduction: string
): Promise<VersetBible[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("bible_versets")
      .select("chapitre, verset, texte")
      .eq("livre_code", livreCode)
      .eq("chapitre", chapitre)
      .eq("traduction", traduction)
      .order("verset");
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export async function chargerTraductionsDisponibles(livreCode: string): Promise<string[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("bible_versets")
      .select("traduction")
      .eq("livre_code", livreCode);
    if (error) throw error;
    return Array.from(new Set((data ?? []).map((d) => d.traduction)));
  } catch {
    return [];
  }
}

export function chargerHomelies(): Promise<Homelie[]> {
  return requete(async () => {
    const { data, error } = await supabase!
      .from("homelies")
      .select("*")
      .eq("statut", "publie")
      .order("date_celebration", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(versHomelie);
  }, exemple.homelies);
}

export function chargerInterviews(): Promise<Interview[]> {
  return requete(async () => {
    const { data, error } = await supabase!
      .from("interviews")
      .select("*")
      .eq("statut", "publie")
      .order("date_publication", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(versInterview);
  }, exemple.interviews);
}

export function chargerReportages(): Promise<Reportage[]> {
  return requete(async () => {
    const { data, error } = await supabase!
      .from("reportages")
      .select("*")
      .eq("statut", "publie")
      .order("date_publication", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(versReportage);
  }, exemple.reportages);
}

export function chargerDossiers(): Promise<Dossier[]> {
  return requete(async () => {
    const { data, error } = await supabase!
      .from("dossiers")
      .select("*")
      .eq("statut", "publie")
      .eq("actif", true)
      .order("date_debut", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(versDossier);
  }, exemple.dossiers);
}

export function chargerCommuniques(): Promise<Communique[]> {
  return requete(async () => {
    const { data, error } = await supabase!
      .from("communiques")
      .select("*")
      .eq("statut", "publie")
      .order("date_publication", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(versCommunique);
  }, exemple.communiques);
}

export function chargerParoisses(): Promise<Paroisse[]> {
  return requete(async () => {
    const { data, error } = await supabase!.from("paroisses").select("*").order("nom");
    if (error) throw error;
    return (data ?? []).map(versParoisse);
  }, exemple.paroisses);
}

export function chargerDioceses(): Promise<DioceseFiche[]> {
  return requete<DioceseFiche>(async () => {
    const { data, error } = await supabase!.from("dioceses").select("*").order("nom");
    if (error) throw error;
    return (data ?? []).map((ligne: Ligne) => ({
      id: ligne.id,
      nom: ligne.nom,
      territoire: ligne.territoire ?? "",
      eveque: ligne.eveque ?? "",
      adresse: ligne.adresse ?? undefined,
      telephone: ligne.telephone ?? undefined,
      email: ligne.email ?? undefined,
      imageUrl: ligne.image_url ?? undefined,
    }));
  }, exemple.dioceses);
}

export function chargerAlertes(): Promise<AlerteApp[]> {
  return requete<AlerteApp>(async () => {
    const { data, error } = await supabase!
      .from("alertes")
      .select("*")
      .eq("active", true)
      .order("cree_le", { ascending: false })
      .limit(3);
    if (error) throw error;
    return (data ?? []).map((ligne: Ligne) => ({
      id: ligne.id,
      type: ligne.type ?? "info",
      titre: ligne.titre,
      message: ligne.message,
      lienContenuId: ligne.contenu_id ?? undefined,
      lienContenuType: ligne.contenu_type ?? undefined,
      dateISO: ligne.cree_le,
      active: ligne.active,
    }));
  }, exemple.alertes);
}

// --------------------------------------------------------------------------
// Contenus déjà présents avant le module éditorial
// --------------------------------------------------------------------------

export function chargerPodcasts(): Promise<Podcast[]> {
  return requete(async () => {
    const { data, error } = await supabase!
      .from("podcasts")
      .select("*, emissions(titre)")
      .order("date_publication", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(versPodcast);
  }, podcastsExemple);
}

export function chargerPredications(): Promise<Predication[]> {
  return requete(async () => {
    const { data, error } = await supabase!
      .from("predications")
      .select("*")
      .order("date_publication", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(versPredication);
  }, predicationsExemple);
}

export function chargerVideos(): Promise<VideoContenu[]> {
  return requete(async () => {
    const { data, error } = await supabase!
      .from("videos")
      .select("*")
      .order("date_diffusion", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(versVideo);
  }, videosExemple);
}

export function chargerEvenements(): Promise<Evenement[]> {
  return requete(async () => {
    const { data, error } = await supabase!
      .from("evenements")
      .select("*")
      .order("date_debut", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(versEvenement);
  }, evenementsExemple);
}

// --------------------------------------------------------------------------
// Écritures publiques limitées
// --------------------------------------------------------------------------

export async function incrementerVues(articleId: string) {
  if (!supabase) return;
  await supabase.rpc("increment_vues_article", { article_id: articleId }).then(
    () => {},
    () => {}
  );
}

export async function inscrireNewsletter(email: string): Promise<string | null> {
  if (!supabase) return null;
  const { error } = await supabase.from("abonnements_newsletter").insert({ email });
  return error?.message ?? null;
}
