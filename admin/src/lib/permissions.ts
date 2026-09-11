import { clientAvecSession } from "./supabaseServeur";
import { clientServiceRole } from "./supabaseServiceRole";

/**
 * Vérifie une permission granulaire (ex: "articles.publish") pour
 * l'utilisateur connecté, en interrogeant la fonction SQL `a_permission()`
 * (source de vérité serveur — jamais seulement un test de nom de rôle).
 * Retourne l'utilisateur si la permission est accordée, sinon une erreur
 * prête à renvoyer telle quelle depuis une route API.
 */
export async function requirePermission(
  code: string
): Promise<{ userId: string } | { erreur: string; statut: 401 | 403 }> {
  const supabaseSession = await clientAvecSession();
  const {
    data: { user },
  } = await supabaseSession.auth.getUser();
  if (!user) return { erreur: "Non authentifié.", statut: 401 };

  const { data, error } = await supabaseSession.rpc("a_permission", { p_code: code });
  if (error || !data) {
    return {
      erreur: `Permission "${code}" requise pour cette action.`,
      statut: 403,
    };
  }
  return { userId: user.id };
}

/** Vérification "douce" (booléen, ne lève jamais) — pour afficher ou non un élément optionnel. */
export async function aPermission(code: string): Promise<boolean> {
  const supabaseSession = await clientAvecSession();
  const { data } = await supabaseSession.rpc("a_permission", { p_code: code });
  return Boolean(data);
}

/** Enregistre une action sensible dans le journal d'activité existant. */
export async function journaliser(params: {
  acteurId: string;
  action: string;
  tableCible: string;
  enregistrementId?: string;
  titre?: string;
}) {
  const admin = clientServiceRole();
  await admin.from("journal_activite").insert({
    acteur_id: params.acteurId,
    action: params.action,
    table_cible: params.tableCible,
    enregistrement_id: params.enregistrementId ?? null,
    titre: params.titre ?? null,
  });
}
