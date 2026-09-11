/**
 * Configuration centrale de la station.
 *
 * Toutes les valeurs de flux sont surchargeables par variables
 * d'environnement (voir `.env.example` et `radio.config.example`) afin de
 * pouvoir changer d'hébergeur sans toucher au code.
 *
 * Flux vérifié le 10/09/2026 sur https://radionotredame.caster.fm/ :
 *   listenurl   http://shaincast.caster.fm:16045/listen.mp3
 *   icy-name    Radio Notre Dame de Bangui
 *   server_type audio/mpeg (MP3) — 128 kbps, 44,1 kHz stéréo
 *   serveur     Caster Streaming Server 2.3 (compatible Icecast/Shoutcast)
 */

const JETON_ECOUTE = process.env.EXPO_PUBLIC_RADIO_STREAM_AUTH ?? "";

const FLUX_PRINCIPAL_PAR_DEFAUT =
  "http://shaincast.caster.fm:16045/listen.mp3" +
  (JETON_ECOUTE ? `?${JETON_ECOUTE}` : "");

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

  // --- Flux audio --------------------------------------------------------
  radioStreamUrl: process.env.EXPO_PUBLIC_RADIO_STREAM_URL ?? FLUX_PRINCIPAL_PAR_DEFAUT,
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
};

export const supabaseEstConfigure =
  config.supabaseUrl.length > 0 && config.supabaseAnonKey.length > 0;

/** Liste ordonnée des flux à essayer : principal puis secours. */
export const fluxDisponibles = [config.radioStreamUrl, config.radioStreamUrlSecours].filter(
  (url): url is string => Boolean(url)
);
