import { Linking, Platform, Share } from "react-native";

const LOCALE = "fr-FR";

export function formaterDate(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formaterDateCourte(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, {
    day: "2-digit",
    month: "short",
  });
}

export function formaterHeure(iso: string): string {
  return new Date(iso).toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formaterDateRelative(iso: string): string {
  const maintenant = Date.now();
  const date = new Date(iso).getTime();
  const minutes = Math.round((maintenant - date) / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const heures = Math.round(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;
  const jours = Math.round(heures / 24);
  if (jours === 1) return "hier";
  if (jours < 7) return `il y a ${jours} jours`;
  return formaterDate(iso);
}

export function formaterDuree(secondes: number): string {
  if (!secondes) return "";
  const minutes = Math.round(secondes / 60);
  if (minutes < 60) return `${minutes} min`;
  const heures = Math.floor(minutes / 60);
  const reste = minutes % 60;
  return reste ? `${heures} h ${reste}` : `${heures} h`;
}

/** Minutes écoulées depuis minuit pour une heure « HH:MM ». */
export function minutesDepuisMinuit(heure: string): number {
  const [h, m] = heure.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export async function partagerContenu(titre: string, message?: string) {
  try {
    await Share.share({
      title: titre,
      message: message ? `${titre}\n\n${message}` : titre,
    });
  } catch {
    // Le partage a été annulé par l'utilisateur.
  }
}

export function appeler(telephone: string) {
  Linking.openURL(`tel:${telephone.replace(/\s/g, "")}`).catch(() => {});
}

export function envoyerEmail(email: string, sujet?: string) {
  const suffixe = sujet ? `?subject=${encodeURIComponent(sujet)}` : "";
  Linking.openURL(`mailto:${email}${suffixe}`).catch(() => {});
}

export function ouvrirLien(url: string) {
  Linking.openURL(url).catch(() => {});
}

export function ouvrirItineraire(adresse: string, latitude?: number, longitude?: number) {
  const destination =
    latitude !== undefined && longitude !== undefined
      ? `${latitude},${longitude}`
      : encodeURIComponent(adresse);
  const url =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?daddr=${destination}`
      : `geo:0,0?q=${destination}`;
  Linking.openURL(url).catch(() => {});
}
