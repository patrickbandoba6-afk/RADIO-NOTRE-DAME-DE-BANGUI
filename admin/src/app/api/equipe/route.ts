import { NextResponse } from "next/server";
import { journaliser, requirePermission } from "@/lib/permissions";
import { clientServiceRole } from "@/lib/supabaseServiceRole";

function reponseErreur(v: { erreur: string; statut: 401 | 403 }) {
  return NextResponse.json({ erreur: v.erreur }, { status: v.statut });
}

export async function GET() {
  const v = await requirePermission("users.view");
  if ("erreur" in v) return reponseErreur(v);

  try {
    const admin = clientServiceRole();
    const { data: listeUtilisateurs, error: erreurUtilisateurs } = await admin.auth.admin.listUsers();
    if (erreurUtilisateurs) throw erreurUtilisateurs;

    const { data: profils, error: erreurProfils } = await admin
      .from("profils")
      .select("id, nom, role, cree_le, role_attribue_par, role_attribue_le, service_id");
    if (erreurProfils) throw erreurProfils;

    const { data: services } = await admin.from("services").select("id, nom");
    const nomService = new Map((services ?? []).map((s) => [s.id, s.nom]));

    const profilParId = new Map((profils ?? []).map((p) => [p.id, p]));
    const emailParId = new Map(listeUtilisateurs.users.map((u) => [u.id, u.email ?? ""]));

    const membres = listeUtilisateurs.users.map((u) => {
      const profil = profilParId.get(u.id);
      const attributeur = profil?.role_attribue_par
        ? profilParId.get(profil.role_attribue_par)?.nom || emailParId.get(profil.role_attribue_par) || null
        : null;
      return {
        id: u.id,
        email: u.email ?? "",
        nom: profil?.nom ?? null,
        role: profil?.role ?? null,
        serviceId: profil?.service_id ?? null,
        serviceNom: profil?.service_id ? nomService.get(profil.service_id) ?? null : null,
        creeLe: u.created_at,
        derniereConnexion: u.last_sign_in_at ?? null,
        jamaisConnecte: !u.last_sign_in_at,
        desactive: u.banned_until != null && u.banned_until !== "none",
        roleAttribuePar: attributeur,
        roleAttribueLe: profil?.role_attribue_le ?? null,
      };
    });

    return NextResponse.json({ membres, services: services ?? [] });
  } catch (erreur) {
    const message = erreur instanceof Error ? erreur.message : "Erreur inconnue.";
    return NextResponse.json({ erreur: message }, { status: 500 });
  }
}

async function compterSuperAdministrateurs(): Promise<number> {
  const admin = clientServiceRole();
  const { count } = await admin
    .from("profils")
    .select("id", { count: "exact", head: true })
    .eq("role", "super_administrateur");
  return count ?? 0;
}

export async function POST(request: Request) {
  const corps = await request.json();
  const admin = clientServiceRole();

  try {
    if (corps.action === "creerCompte") {
      const v = await requirePermission("users.create");
      if ("erreur" in v) return reponseErreur(v);

      const { email, motDePasse, role, nom, serviceId } = corps as {
        email: string;
        motDePasse: string;
        role: string;
        nom?: string;
        serviceId?: string;
      };
      if (!email || !motDePasse || !role) {
        return NextResponse.json({ erreur: "E-mail, mot de passe et rôle requis." }, { status: 400 });
      }
      if (motDePasse.length < 6) {
        return NextResponse.json(
          { erreur: "Le mot de passe doit contenir au moins 6 caractères." },
          { status: 400 }
        );
      }
      if (role === "super_administrateur") {
        const rv = await requirePermission("roles.assign");
        if ("erreur" in rv) return reponseErreur(rv);
      }
      // Le compte est créé directement avec ce mot de passe : rien n'est envoyé
      // par e-mail, l'administrateur transmet lui-même les identifiants.
      const { data, error } = await admin.auth.admin.createUser({
        email: email.trim(),
        password: motDePasse,
        email_confirm: true,
        user_metadata: nom ? { nom } : undefined,
      });
      if (error) throw error;
      const { error: erreurProfil } = await admin.from("profils").upsert({
        id: data.user.id,
        role,
        nom: nom ?? null,
        service_id: serviceId || null,
        role_attribue_par: v.userId,
        role_attribue_le: new Date().toISOString(),
      });
      if (erreurProfil) throw erreurProfil;

      await journaliser({
        acteurId: v.userId,
        action: "creation",
        tableCible: "utilisateurs",
        enregistrementId: data.user.id,
        titre: `Création de ${email} (${role})`,
      });
      return NextResponse.json({ ok: true, userId: data.user.id });
    }

    if (corps.action === "changerRole") {
      const v = await requirePermission("roles.assign");
      if ("erreur" in v) return reponseErreur(v);

      const { userId, role } = corps as { userId: string; role: string | null };
      if (!userId) return NextResponse.json({ erreur: "Identifiant utilisateur requis." }, { status: 400 });

      const { data: profilActuel } = await admin
        .from("profils")
        .select("role, nom")
        .eq("id", userId)
        .maybeSingle();

      if (profilActuel?.role === "super_administrateur" && role !== "super_administrateur") {
        if ((await compterSuperAdministrateurs()) <= 1) {
          return NextResponse.json(
            { erreur: "Impossible de retirer le rôle du dernier super administrateur." },
            { status: 400 }
          );
        }
      }

      const { error } = await admin.from("profils").upsert({
        id: userId,
        role,
        role_attribue_par: v.userId,
        role_attribue_le: new Date().toISOString(),
      });
      if (error) throw error;

      await journaliser({
        acteurId: v.userId,
        action: "modification",
        tableCible: "roles",
        enregistrementId: userId,
        titre: `${profilActuel?.nom ?? userId} : ${profilActuel?.role ?? "aucun rôle"} → ${role ?? "aucun rôle"}`,
      });
      return NextResponse.json({ ok: true });
    }

    if (corps.action === "changerService") {
      const v = await requirePermission("users.edit");
      if ("erreur" in v) return reponseErreur(v);

      const { userId, serviceId } = corps as { userId: string; serviceId: string | null };
      if (!userId) return NextResponse.json({ erreur: "Identifiant utilisateur requis." }, { status: 400 });

      const { error } = await admin.from("profils").upsert({ id: userId, service_id: serviceId || null });
      if (error) throw error;

      await journaliser({
        acteurId: v.userId,
        action: "modification",
        tableCible: "utilisateurs",
        enregistrementId: userId,
        titre: "Changement de service",
      });
      return NextResponse.json({ ok: true });
    }

    if (corps.action === "supprimerCompte") {
      const v = await requirePermission("users.delete");
      if ("erreur" in v) return reponseErreur(v);

      const { userId } = corps as { userId: string };
      if (!userId) return NextResponse.json({ erreur: "Identifiant utilisateur requis." }, { status: 400 });
      if (userId === v.userId) {
        return NextResponse.json(
          { erreur: "Vous ne pouvez pas supprimer votre propre compte depuis cette page." },
          { status: 400 }
        );
      }

      const { data: profilCible } = await admin
        .from("profils")
        .select("role, nom")
        .eq("id", userId)
        .maybeSingle();

      if (profilCible?.role === "super_administrateur" && (await compterSuperAdministrateurs()) <= 1) {
        return NextResponse.json(
          { erreur: "Impossible de supprimer le dernier super administrateur." },
          { status: 400 }
        );
      }

      // La suppression du compte auth entraîne aussi celle de la ligne
      // `profils` correspondante (clé étrangère on delete cascade).
      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) throw error;

      await journaliser({
        acteurId: v.userId,
        action: "suppression",
        tableCible: "utilisateurs",
        enregistrementId: userId,
        titre: profilCible?.nom ?? userId,
      });
      return NextResponse.json({ ok: true });
    }

    if (corps.action === "changerActivation") {
      const v = await requirePermission("users.edit");
      if ("erreur" in v) return reponseErreur(v);

      const { userId, desactiver } = corps as { userId: string; desactiver: boolean };
      if (!userId) return NextResponse.json({ erreur: "Identifiant utilisateur requis." }, { status: 400 });
      if (userId === v.userId && desactiver) {
        return NextResponse.json(
          { erreur: "Vous ne pouvez pas désactiver votre propre compte." },
          { status: 400 }
        );
      }

      const { error } = await admin.auth.admin.updateUserById(userId, {
        ban_duration: desactiver ? "876000h" : "none",
      });
      if (error) throw error;

      await journaliser({
        acteurId: v.userId,
        action: "modification",
        tableCible: "utilisateurs",
        enregistrementId: userId,
        titre: desactiver ? "Compte désactivé" : "Compte réactivé",
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ erreur: "Action inconnue." }, { status: 400 });
  } catch (erreur) {
    const message = erreur instanceof Error ? erreur.message : "Erreur inconnue.";
    return NextResponse.json({ erreur: message }, { status: 500 });
  }
}
