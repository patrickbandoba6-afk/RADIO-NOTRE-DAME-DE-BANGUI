import { Directory, File, Paths } from "expo-file-system";

export const dossierTelechargements = new Directory(Paths.document, "telechargements");

export function assurerDossierTelechargements() {
  if (!dossierTelechargements.exists) {
    dossierTelechargements.create({ intermediates: true, idempotent: true });
  }
}

export function fichierPour(id: string, audioUrl: string): File {
  const extension = audioUrl.split("?")[0].split(".").pop() || "mp3";
  return new File(dossierTelechargements, `${id}.${extension}`);
}

export function fichierExisteEncore(uri: string): { exists: boolean; size?: number } {
  const fichier = new File(uri);
  return { exists: fichier.exists, size: fichier.exists ? fichier.size : undefined };
}

export function supprimerFichier(uri: string) {
  const fichier = new File(uri);
  if (fichier.exists) fichier.delete();
}

export function tailleDossierTelechargements(): number {
  assurerDossierTelechargements();
  return dossierTelechargements
    .list()
    .filter((entree): entree is File => entree instanceof File)
    .reduce((total, fichier) => total + (fichier.size ?? 0), 0);
}

export function formaterTaille(octets: number): string {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(0)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
}
