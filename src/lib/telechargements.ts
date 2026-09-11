import { Platform } from "react-native";
import { Directory, File, Paths } from "expo-file-system";

// expo-file-system n'est pas supporté sur le web : toute construction de
// Directory/File y échoue immédiatement. Les téléchargements hors-ligne
// n'ont pas de sens dans un navigateur, donc ces fonctions n'y font rien.
const SUPPORTE = Platform.OS !== "web";

export const dossierTelechargements = SUPPORTE
  ? new Directory(Paths.document, "telechargements")
  : (null as unknown as Directory);

export function assurerDossierTelechargements() {
  if (!SUPPORTE) return;
  if (!dossierTelechargements.exists) {
    dossierTelechargements.create({ intermediates: true, idempotent: true });
  }
}

export function fichierPour(id: string, audioUrl: string): File {
  const extension = audioUrl.split("?")[0].split(".").pop() || "mp3";
  return new File(dossierTelechargements, `${id}.${extension}`);
}

export function fichierExisteEncore(uri: string): { exists: boolean; size?: number } {
  if (!SUPPORTE) return { exists: false };
  const fichier = new File(uri);
  return { exists: fichier.exists, size: fichier.exists ? fichier.size : undefined };
}

export function supprimerFichier(uri: string) {
  if (!SUPPORTE) return;
  const fichier = new File(uri);
  if (fichier.exists) fichier.delete();
}

export function tailleDossierTelechargements(): number {
  if (!SUPPORTE) return 0;
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
