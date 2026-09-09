export const config = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
  radioStreamUrl:
    process.env.EXPO_PUBLIC_RADIO_STREAM_URL ??
    "https://ice1.somafm.com/gaydio-128-mp3",
  videoLiveUrl: process.env.EXPO_PUBLIC_VIDEO_LIVE_URL ?? "",
  stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  nomOfficiel: "RADIO NOTRE DAME DE BANGUI",
  signature: "La voix chrétienne de Bangui vers le monde",
};

export const supabaseEstConfigure =
  config.supabaseUrl.length > 0 && config.supabaseAnonKey.length > 0;
