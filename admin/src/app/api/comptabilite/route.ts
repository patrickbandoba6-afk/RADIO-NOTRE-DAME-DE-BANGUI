import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { clientServiceRole } from "@/lib/supabaseServiceRole";

export async function GET() {
  const v = await requirePermission("finance.view");
  if ("erreur" in v) return NextResponse.json({ erreur: v.erreur }, { status: v.statut });

  try {
    const admin = clientServiceRole();
    const { data: dons, error } = await admin
      .from("dons")
      .select("id, utilisateur_id, montant, devise, type, reference_paiement, cree_le")
      .order("cree_le", { ascending: false });
    if (error) throw error;

    const idsUtilisateurs = [...new Set((dons ?? []).map((d) => d.utilisateur_id).filter(Boolean))];
    const { data: profils } = await admin.from("profils").select("id, nom").in("id", idsUtilisateurs);
    const nomParId = new Map((profils ?? []).map((p) => [p.id, p.nom]));

    const { data: listeUtilisateurs } = await admin.auth.admin.listUsers();
    const emailParId = new Map((listeUtilisateurs?.users ?? []).map((u) => [u.id, u.email ?? ""]));

    const donsAvecDonateur = (dons ?? []).map((don) => ({
      ...don,
      nomDonateur: (don.utilisateur_id && nomParId.get(don.utilisateur_id)) || null,
      emailDonateur: (don.utilisateur_id && emailParId.get(don.utilisateur_id)) || null,
    }));

    const totauxParDevise = new Map<string, number>();
    for (const don of donsAvecDonateur) {
      totauxParDevise.set(don.devise, (totauxParDevise.get(don.devise) ?? 0) + Number(don.montant));
    }

    return NextResponse.json({
      dons: donsAvecDonateur,
      totaux: [...totauxParDevise.entries()].map(([devise, total]) => ({ devise, total })),
    });
  } catch (erreur) {
    const message = erreur instanceof Error ? erreur.message : "Erreur inconnue.";
    return NextResponse.json({ erreur: message }, { status: 500 });
  }
}
