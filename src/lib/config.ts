/**
 * Configuration centrale de la station.
 *
 * Toutes les valeurs de flux sont surchargeables par variables
 * d'environnement (voir `.env.example`) afin de pouvoir changer d'hébergeur
 * sans toucher au code.
 *
 * IMPORTANT : aucune URL de flux n'est codée en dur ici. Le flux
 * `http://shaincast.caster.fm:16045/listen.mp3` documenté dans
 * `docs/FLUX-RADIO.md` exige une authentification par URL côté Caster.fm
 * (`"authenticator":"url"` — voir l'incident du 11/09/2026 dans ce même
 * document) : tant que le jeton réel n'est pas fourni par la station, le
 * flux reste volontairement non configuré plutôt que de pointer vers une
 * URL connue pour échouer.
 */

const JETON_ECOUTE = process.env.EXPO_PUBLIC_RADIO_STREAM_AUTH ?? "";
const URL_FLUX_BASE = process.env.EXPO_PUBLIC_RADIO_STREAM_URL ?? "";

const FLUX_PRINCIPAL_PAR_DEFAUT = URL_FLUX_BASE
  ? URL_FLUX_BASE + (JETON_ECOUTE ? `${URL_FLUX_BASE.includes("?") ? "&" : "?"}${JETON_ECOUTE}` : "")
  : "";

export const config = {
  // --- Identité de la station -------------------------------------------
  nomOfficiel: "RADIO NOTRE-DAME DE BANGUI",
  nomCourt: "RND Bangui",
  indicatif: "Radio Notre-Dame",
  signature: "Entrez dans l'Espérance",
  slogan: "Entrez dans l'Espérance",
  descriptionStation: "La voix de l'Espérance",
  frequence: "103.3 FM",
  frequenceMhz: "103.3 MHz",
  ville: "Bangui",
  pays: "République centrafricaine",
  zoneDiffusion: "Bangui et environs",
  institution: "Archidiocèse de Bangui",
  premieresEmissions: "4 janvier 1995",
  langues: ["Français", "Sango"],
  pageStreaming: "https://radionotredame.caster.fm/",

  // --- Coordonnées (à compléter par la radio) ---------------------------
  telephone: process.env.EXPO_PUBLIC_RADIO_TELEPHONE ?? null,
  email: process.env.EXPO_PUBLIC_RADIO_EMAIL ?? null,
  adresse: process.env.EXPO_PUBLIC_RADIO_ADRESSE ?? null,
  siteWeb: process.env.EXPO_PUBLIC_RADIO_SITE ?? null,
  facebook: process.env.EXPO_PUBLIC_RADIO_FACEBOOK ?? null,

  // --- Lives sur les réseaux sociaux (liens externes) --------------------
  liveFacebook: process.env.EXPO_PUBLIC_LIVE_FACEBOOK ?? null,
  liveYoutube: process.env.EXPO_PUBLIC_LIVE_YOUTUBE ?? null,
  liveInstagram: process.env.EXPO_PUBLIC_LIVE_INSTAGRAM ?? null,
  liveTiktok: process.env.EXPO_PUBLIC_LIVE_TIKTOK ?? null,

  // --- Dons : paiement manuel (Mobile Money / virement) ------------------
  donsOrangeUssd: process.env.EXPO_PUBLIC_DONS_ORANGE_USSD ?? null,
  donsOrangeCodeMarchand: process.env.EXPO_PUBLIC_DONS_ORANGE_CODE_MARCHAND ?? null,
  donsOrangeNumero: process.env.EXPO_PUBLIC_DONS_ORANGE_NUMERO ?? null,
  donsBanqueNom: process.env.EXPO_PUBLIC_DONS_BANQUE_NOM ?? null,
  donsBanqueCompte: process.env.EXPO_PUBLIC_DONS_BANQUE_COMPTE ?? null,

  // --- Flux audio --------------------------------------------------------
  radioStreamUrl: FLUX_PRINCIPAL_PAR_DEFAUT,
  radioStreamUrlSecours: process.env.EXPO_PUBLIC_RADIO_STREAM_BACKUP_URL ?? "",
  radioStreamType: process.env.EXPO_PUBLIC_RADIO_STREAM_TYPE ?? "SHOUTCAST",
  radioStreamCodec: process.env.EXPO_PUBLIC_RADIO_STREAM_CODEC ?? "MP3",
  radioStreamBitrate: process.env.EXPO_PUBLIC_RADIO_STREAM_BITRATE ?? "128",
  /** Endpoint Icecast renvoyant le titre en cours et l'état du serveur. */
  radioStatutUrl:
    process.env.EXPO_PUBLIC_RADIO_STATUS_URL ??
    "http://shaincast.caster.fm:16045/status-json.xsl",

  // --- Vidéo et services externes ---------------------------------------
  videoLiveUrl: process.env.EXPO_PUBLIC_VIDEO_LIVE_URL ?? "",
  stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",

  // --- Supabase ----------------------------------------------------------
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",

  // --- Espace administrateur (back-office web intégré en WebView) --------
  adminUrl: process.env.EXPO_PUBLIC_ADMIN_URL ?? "",
};

export const supabaseEstConfigure =
  config.supabaseUrl.length > 0 && config.supabaseAnonKey.length > 0;

/** Faux tant que EXPO_PUBLIC_RADIO_STREAM_URL n'est pas renseignée. */
export const radioStreamConfigure = config.radioStreamUrl.length > 0;

/** Liste ordonnée des flux à essayer : principal puis secours. */
export const fluxDisponibles = [config.radioStreamUrl, config.radioStreamUrlSecours].filter(
  (url): url is string => Boolean(url)
);
