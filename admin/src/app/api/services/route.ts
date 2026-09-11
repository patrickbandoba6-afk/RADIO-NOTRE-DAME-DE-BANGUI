import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { clientAvecSession } from "@/lib/supabaseServeur";
import { clientServiceRole } from "@/lib/supabaseServiceRole";

export async function GET() {
  const supabaseSession = await clientAvecSession();
  const {
    data: { user },
  } = await supabaseSession.auth.getUser();
  if (!user) return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });

  const { data, error } = await supabaseSession
    .from("services")
    .select("id, nom, slug, description")
    .order("nom");
  if (error) return NextResponse.json({ erreur: error.message }, { status: 500 });

  return NextResponse.json({ services: data ?? [] });
}

export async function POST(request: Request) {
  const v = await requirePermission("services.manage");
  if ("erreur" in v) return NextResponse.json({ erreur: v.erreur }, { status: v.statut });

  const corps = await request.json();
  const admin = clientServiceRole();

  try {
    if (corps.action === "creer") {
      const { nom, description } = corps as { nom: string; description?: string };
      if (!nom?.trim()) return NextResponse.json({ erreur: "Nom requis." }, { status: 400 });
      const slug = nom
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
      const { error } = await admin.from("services").insert({ nom: nom.trim(), slug, description });
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (corps.action === "supprimer") {
      const { id } = corps as { id: string };
      if (!id) return NextResponse.json({ erreur: "Identifiant requis." }, { status: 400 });
      const { error } = await admin.from("services").delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ erreur: "Action inconnue." }, { status: 400 });
  } catch (erreur) {
    const message = erreur instanceof Error ? erreur.message : "Erreur inconnue.";
    return NextResponse.json({ erreur: message }, { status: 500 });
  }
}
