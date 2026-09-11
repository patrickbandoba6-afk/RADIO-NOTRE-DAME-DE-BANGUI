import { config } from "@/lib/config";

export interface EtatServeurRadio {
  enLigne: boolean;
  titreEnCours: string | null;
  nomStation: string | null;
  description: string | null;
  bitrate: number | null;
  auditeurs: number | null;
}

const ETAT_HORS_LIGNE: EtatServeurRadio = {
  enLigne: false,
  titreEnCours: null,
  nomStation: null,
  description: null,
  bitrate: null,
  auditeurs: null,
};

/**
 * Interroge l'endpoint Icecast `status-json.xsl` du serveur de diffusion
 * pour connaître l'état du direct et le titre actuellement joué.
 *
 * Le serveur ne renvoie `title` que lorsque la régie transmet une
 * métadonnée ICY ; sinon on retombe sur l'identité de la station.
 */
export async function recupererEtatServeur(
  signal?: AbortSignal
): Promise<EtatServeurRadio> {
  if (!config.radioStatutUrl) return ETAT_HORS_LIGNE;
  try {
    const reponse = await fetch(config.radioStatutUrl, { signal });
    if (!reponse.ok) return ETAT_HORS_LIGNE;

    const donnees = await reponse.json();
    const source = donnees?.icestats?.source;
    if (!source) return ETAT_HORS_LIGNE;

    // Certains serveurs renvoient un tableau lorsqu'il y a plusieurs points
    // de montage : on retient le premier.
    const flux = Array.isArray(source) ? source[0] : source;

    const titre: string | undefined = flux.title ?? flux.yp_currently_playing;

    return {
      enLigne: true,
      titreEnCours: titre && titre.trim().length > 0 ? titre.trim() : null,
      nomStation: flux.server_name ?? null,
      description: flux.server_description ?? null,
      bitrate: flux.bitrate ?? null,
      auditeurs: typeof flux.listeners === "number" ? flux.listeners : null,
    };
  } catch {
    return ETAT_HORS_LIGNE;
  }
}

/** Libellé à afficher sous le titre de la station pendant le direct. */
export function libelleEnCours(etat: EtatServeurRadio): string {
  if (etat.titreEnCours) return etat.titreEnCours;
  return `En direct sur ${config.frequence}`;
}
