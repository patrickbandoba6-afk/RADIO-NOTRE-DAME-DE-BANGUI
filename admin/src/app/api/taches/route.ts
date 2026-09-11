import { NextResponse } from "next/server";
import { aPermission, journaliser, requirePermission } from "@/lib/permissions";
import { clientAvecSession } from "@/lib/supabaseServeur";
import { clientServiceRole } from "@/lib/supabaseServiceRole";

export async function GET() {
  const supabaseSession = await clientAvecSession();
  const {
    data: { user },
  } = await supabaseSession.auth.getUser();
  if (!user) return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });

  // La RLS filtre déjà : tâches de l'utilisateur, ou toutes si tasks.view.
  const { data: taches, error } = await supabaseSession
    .from("taches")
    .select(
      "id, titre, description, service_id, assigne_a, cree_par, priorite, statut, date_debut, date_limite, cree_le"
    )
    .order("date_limite", { ascending: true, nullsFirst: false });
  if (error) return NextResponse.json({ erreur: error.message }, { status: 500 });

  const admin = clientServiceRole();
  const { data: services } = await admin.from("services").select("id, nom");
  const { data: profils } = await admin.from("profils").select("id, nom");
  const { data: listeUtilisateurs } = await admin.auth.admin.listUsers();

  const nomService = new Map((services ?? []).map((s) => [s.id, s.nom]));
  const nomProfil = new Map((profils ?? []).map((p) => [p.id, p.nom]));
  const emailUtilisateur = new Map((listeUtilisateurs?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  const nomPersonne = (id: string | null) =>
    id ? nomProfil.get(id) || emailUtilisateur.get(id) || "—" : null;

  const enrichies = (taches ?? []).map((t) => ({
    ...t,
    serviceNom: t.service_id ? nomService.get(t.service_id) ?? null : null,
    assigneNom: nomPersonne(t.assigne_a),
    creeParNom: nomPersonne(t.cree_par),
    estMoi: t.assigne_a === user.id,
  }));

  let membres: { id: string; nom: string }[] = [];
  let servicesListe: { id: string; nom: string }[] = [];
  if ((await aPermission("tasks.create")) || (await aPermission("tasks.assign"))) {
    membres = (listeUtilisateurs?.users ?? []).map((u) => ({
      id: u.id,
      nom: nomProfil.get(u.id) || u.email || u.id,
    }));
    servicesListe = (services ?? []).map((s) => ({ id: s.id, nom: s.nom }));
  }

  return NextResponse.json({ taches: enrichies, monId: user.id, membres, services: servicesListe });
}

export async function POST(request: Request) {
  const corps = await request.json();

  try {
    if (corps.action === "creer") {
      const v = await requirePermission("tasks.create");
      if ("erreur" in v) return NextResponse.json({ erreur: v.erreur }, { status: v.statut });

      const { titre, description, serviceId, assigneA, priorite, dateLimite } = corps as {
        titre: string;
        description?: string;
        serviceId?: string;
        assigneA?: string;
        priorite?: string;
        dateLimite?: string;
      };
      if (!titre?.trim() || !assigneA) {
        return NextResponse.json({ erreur: "Titre et employé responsable requis." }, { status: 400 });
      }

      const admin = clientServiceRole();
      const { data, error } = await admin
        .from("taches")
        .insert({
          titre: titre.trim(),
          description: description || null,
          service_id: serviceId || null,
          assigne_a: assigneA,
          cree_par: v.userId,
          priorite: priorite || "normale",
          date_limite: dateLimite || null,
        })
        .select("id")
        .single();
      if (error) throw error;

      await journaliser({
        acteurId: v.userId,
        action: "creation",
        tableCible: "taches",
        enregistrementId: data.id,
        titre: `Tâche « ${titre} » attribuée`,
      });
      return NextResponse.json({ ok: true });
    }

    if (corps.action === "changerStatut") {
      const supabaseSession = await clientAvecSession();
      const {
        data: { user },
      } = await supabaseSession.auth.getUser();
      if (!user) return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });

      const { tacheId, statut } = corps as { tacheId: string; statut: string };
      if (!tacheId || !statut) {
        return NextResponse.json({ erreur: "Identifiant et statut requis." }, { status: 400 });
      }
      // RLS autorise déjà : l'assigné peut changer le statut de sa propre tâche,
      // ou tasks.edit pour n'importe quelle tâche — pas de vérif supplémentaire ici.
      const { error } = await supabaseSession.from("taches").update({ statut }).eq("id", tacheId);
      if (error) return NextResponse.json({ erreur: error.message }, { status: 403 });
      return NextResponse.json({ ok: true });
    }

    if (corps.action === "supprimer") {
      const v = await requirePermission("tasks.delete");
      if ("erreur" in v) return NextResponse.json({ erreur: v.erreur }, { status: v.statut });

      const { tacheId } = corps as { tacheId: string };
      const admin = clientServiceRole();
      const { error } = await admin.from("taches").delete().eq("id", tacheId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ erreur: "Action inconnue." }, { status: 400 });
  } catch (erreur) {
    const message = erreur instanceof Error ? erreur.message : "Erreur inconnue.";
    return NextResponse.json({ erreur: message }, { status: 500 });
  }
}
