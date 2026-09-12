import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { clientServiceRole } from "@/lib/supabaseServiceRole";

const BUCKET = "signalements-citoyens";

function reponseErreur(v: { erreur: string; statut: 401 | 403 }) {
  return NextResponse.json({ erreur: v.erreur }, { status: v.statut });
}

export async function GET() {
  const v = await requirePermission("citizen_reports.view");
  if ("erreur" in v) return reponseErreur(v);

  const admin = clientServiceRole();
  const { data: signalements, error } = await admin
    .from("signalements_citoyens")
    .select("id, utilisateur_id, categorie, titre, description, image_url, statut, cree_le")
    .order("cree_le", { ascending: false });
  if (error) return NextResponse.json({ erreur: error.message }, { status: 500 });

  const { data: profils } = await admin.from("profils").select("id, nom");
  const { data: listeUtilisateurs } = await admin.auth.admin.listUsers();
  const nomParId = new Map((profils ?? []).map((p) => [p.id, p.nom]));
  const emailParId = new Map((listeUtilisateurs?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  const enrichis = (signalements ?? []).map((s) => ({
    ...s,
    auteurNom: nomParId.get(s.utilisateur_id) || emailParId.get(s.utilisateur_id) || "—",
  }));

  return NextResponse.json({ signalements: enrichis });
}

export async function POST(request: Request) {
  const corps = await request.json();
  const admin = clientServiceRole();

  try {
    if (corps.action === "urlSignee") {
      const v = await requirePermission("citizen_reports.view");
      if ("erreur" in v) return reponseErreur(v);

      const { signalementId } = corps as { signalementId: string };
      const { data: signalement, error: erreurSignalement } = await admin
        .from("signalements_citoyens")
        .select("image_url")
        .eq("id", signalementId)
        .maybeSingle();
      if (erreurSignalement || !signalement?.image_url) {
        return NextResponse.json({ erreur: "Photo introuvable." }, { status: 404 });
      }

      const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(signalement.image_url, 300);
      if (error) throw error;
      return NextResponse.json({ url: data.signedUrl });
    }

    if (corps.action === "changerStatut") {
      const v = await requirePermission("citizen_reports.manage");
      if ("erreur" in v) return reponseErreur(v);

      const { signalementId, statut } = corps as { signalementId: string; statut: string };
      const { error } = await admin.from("signalements_citoyens").update({ statut }).eq("id", signalementId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ erreur: "Action inconnue." }, { status: 400 });
  } catch (erreur) {
    const message = erreur instanceof Error ? erreur.message : "Erreur inconnue.";
    return NextResponse.json({ erreur: message }, { status: 500 });
  }
}
