import { NextResponse } from "next/server";
import { aPermission, journaliser, requirePermission } from "@/lib/permissions";
import { clientServiceRole } from "@/lib/supabaseServiceRole";

const BUCKET = "fichiers-partages";

function reponseErreur(v: { erreur: string; statut: 401 | 403 }) {
  return NextResponse.json({ erreur: v.erreur }, { status: v.statut });
}

export async function GET() {
  const v = await requirePermission("files.view");
  if ("erreur" in v) return reponseErreur(v);

  const admin = clientServiceRole();
  const { data: fichiers, error } = await admin
    .from("fichiers_partages")
    .select("id, titre, description, chemin, type_mime, taille_octets, televerse_par, statut, cree_le")
    .order("cree_le", { ascending: false });
  if (error) return NextResponse.json({ erreur: error.message }, { status: 500 });

  const { data: profils } = await admin.from("profils").select("id, nom");
  const { data: listeUtilisateurs } = await admin.auth.admin.listUsers();
  const nomParId = new Map((profils ?? []).map((p) => [p.id, p.nom]));
  const emailParId = new Map((listeUtilisateurs?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  const enrichis = (fichiers ?? []).map((f) => ({
    ...f,
    televersePariNom: f.televerse_par
      ? nomParId.get(f.televerse_par) || emailParId.get(f.televerse_par) || "—"
      : "—",
    peutSupprimer: true,
  }));

  return NextResponse.json({
    fichiers: enrichis,
    peutPartager: await aPermission("files.share"),
  });
}

export async function POST(request: Request) {
  const corps = await request.json();
  const admin = clientServiceRole();

  try {
    if (corps.action === "creer") {
      const v = await requirePermission("files.share");
      if ("erreur" in v) return reponseErreur(v);

      const { titre, description, chemin, typeMime, tailleOctets } = corps as {
        titre: string;
        description?: string;
        chemin: string;
        typeMime?: string;
        tailleOctets?: number;
      };
      if (!titre?.trim() || !chemin) {
        return NextResponse.json({ erreur: "Titre et fichier requis." }, { status: 400 });
      }

      const { data, error } = await admin
        .from("fichiers_partages")
        .insert({
          titre: titre.trim(),
          description: description || null,
          chemin,
          type_mime: typeMime || null,
          taille_octets: tailleOctets || null,
          televerse_par: v.userId,
        })
        .select("id")
        .single();
      if (error) throw error;

      await journaliser({
        acteurId: v.userId,
        action: "creation",
        tableCible: "fichiers_partages",
        enregistrementId: data.id,
        titre: `Fichier partagé « ${titre} »`,
      });
      return NextResponse.json({ ok: true });
    }

    if (corps.action === "urlSignee") {
      const v = await requirePermission("files.view");
      if ("erreur" in v) return reponseErreur(v);

      const { fichierId } = corps as { fichierId: string };
      const { data: fichier, error: erreurFichier } = await admin
        .from("fichiers_partages")
        .select("chemin")
        .eq("id", fichierId)
        .maybeSingle();
      if (erreurFichier || !fichier) {
        return NextResponse.json({ erreur: "Fichier introuvable." }, { status: 404 });
      }

      const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(fichier.chemin, 300);
      if (error) throw error;
      return NextResponse.json({ url: data.signedUrl });
    }

    if (corps.action === "marquerUtilise") {
      const v = await requirePermission("files.view");
      if ("erreur" in v) return reponseErreur(v);

      const { fichierId, statut } = corps as { fichierId: string; statut: string };
      const { error } = await admin.from("fichiers_partages").update({ statut }).eq("id", fichierId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (corps.action === "supprimer") {
      const v = await requirePermission("files.share");
      if ("erreur" in v) return reponseErreur(v);

      const { fichierId } = corps as { fichierId: string };
      const { data: fichier } = await admin
        .from("fichiers_partages")
        .select("chemin, titre")
        .eq("id", fichierId)
        .maybeSingle();
      if (fichier?.chemin) {
        await admin.storage.from(BUCKET).remove([fichier.chemin]);
      }
      const { error } = await admin.from("fichiers_partages").delete().eq("id", fichierId);
      if (error) throw error;

      await journaliser({
        acteurId: v.userId,
        action: "suppression",
        tableCible: "fichiers_partages",
        enregistrementId: fichierId,
        titre: fichier?.titre ?? fichierId,
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ erreur: "Action inconnue." }, { status: 400 });
  } catch (erreur) {
    const message = erreur instanceof Error ? erreur.message : "Erreur inconnue.";
    return NextResponse.json({ erreur: message }, { status: 500 });
  }
}
