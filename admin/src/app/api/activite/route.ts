import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { clientServiceRole } from "@/lib/supabaseServiceRole";

export async function GET() {
  const v = await requirePermission("audit.view");
  if ("erreur" in v) return NextResponse.json({ erreur: v.erreur }, { status: v.statut });

  try {
    const admin = clientServiceRole();
    const { data: journal, error } = await admin
      .from("journal_activite")
      .select("id, acteur_id, action, table_cible, titre, cree_le")
      .order("cree_le", { ascending: false })
      .limit(100);
    if (error) throw error;

    const { data: profils } = await admin.from("profils").select("id, nom");
    const nomParId = new Map((profils ?? []).map((p) => [p.id, p.nom]));

    const { data: listeUtilisateurs } = await admin.auth.admin.listUsers();
    const emailParId = new Map((listeUtilisateurs?.users ?? []).map((u) => [u.id, u.email ?? ""]));

    const entrees = (journal ?? []).map((ligne) => ({
      ...ligne,
      acteurNom:
        (ligne.acteur_id && (nomParId.get(ligne.acteur_id) || emailParId.get(ligne.acteur_id))) ||
        "Système",
    }));

    return NextResponse.json({ entrees });
  } catch (erreur) {
    const message = erreur instanceof Error ? erreur.message : "Erreur inconnue.";
    return NextResponse.json({ erreur: message }, { status: 500 });
  }
}
