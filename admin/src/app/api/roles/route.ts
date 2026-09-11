import { NextResponse } from "next/server";
import { journaliser, requirePermission } from "@/lib/permissions";
import { clientServiceRole } from "@/lib/supabaseServiceRole";

export async function GET() {
  const v = await requirePermission("roles.view");
  if ("erreur" in v) return NextResponse.json({ erreur: v.erreur }, { status: v.statut });

  try {
    const admin = clientServiceRole();

    const { data: roles, error: erreurRoles } = await admin
      .from("roles")
      .select("id, slug, nom, description, est_role_systeme, cree_le, modifie_le")
      .order("nom");
    if (erreurRoles) throw erreurRoles;

    const { data: permissions, error: erreurPermissions } = await admin
      .from("permissions")
      .select("id, code, module, action, description")
      .order("module")
      .order("action");
    if (erreurPermissions) throw erreurPermissions;

    const { data: attributions, error: erreurAttributions } = await admin
      .from("role_permissions")
      .select("role_id, permission_id");
    if (erreurAttributions) throw erreurAttributions;

    const { data: profils, error: erreurProfils } = await admin.from("profils").select("role");
    if (erreurProfils) throw erreurProfils;

    const utilisateursParRole = new Map<string, number>();
    for (const p of profils ?? []) {
      if (!p.role) continue;
      utilisateursParRole.set(p.role, (utilisateursParRole.get(p.role) ?? 0) + 1);
    }

    const permissionsParRole = new Map<string, Set<string>>();
    for (const a of attributions ?? []) {
      if (!permissionsParRole.has(a.role_id)) permissionsParRole.set(a.role_id, new Set());
      permissionsParRole.get(a.role_id)!.add(a.permission_id);
    }

    const rolesEnrichis = (roles ?? []).map((role) => ({
      ...role,
      nombreUtilisateurs: utilisateursParRole.get(role.slug) ?? 0,
      permissionIds:
        role.slug === "super_administrateur"
          ? (permissions ?? []).map((p) => p.id) // toujours tout, par construction
          : [...(permissionsParRole.get(role.id) ?? [])],
    }));

    return NextResponse.json({ roles: rolesEnrichis, permissions: permissions ?? [] });
  } catch (erreur) {
    const message = erreur instanceof Error ? erreur.message : "Erreur inconnue.";
    return NextResponse.json({ erreur: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const v = await requirePermission("roles.manage_permissions");
  if ("erreur" in v) return NextResponse.json({ erreur: v.erreur }, { status: v.statut });

  const corps = await request.json();
  const admin = clientServiceRole();

  try {
    if (corps.action === "togglePermission") {
      const { roleId, roleSlug, roleNom, permissionId, permissionCode, activer } = corps as {
        roleId: string;
        roleSlug: string;
        roleNom: string;
        permissionId: string;
        permissionCode: string;
        activer: boolean;
      };

      if (roleSlug === "super_administrateur") {
        return NextResponse.json(
          { erreur: "Le super administrateur a toujours accès à tout : ses permissions ne se modifient pas." },
          { status: 400 }
        );
      }

      if (activer) {
        const { error } = await admin
          .from("role_permissions")
          .upsert({ role_id: roleId, permission_id: permissionId });
        if (error) throw error;
      } else {
        const { error } = await admin
          .from("role_permissions")
          .delete()
          .eq("role_id", roleId)
          .eq("permission_id", permissionId);
        if (error) throw error;
      }

      await journaliser({
        acteurId: v.userId,
        action: "modification",
        tableCible: "roles",
        enregistrementId: roleId,
        titre: `${roleNom} : ${activer ? "+" : "-"} ${permissionCode}`,
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ erreur: "Action inconnue." }, { status: 400 });
  } catch (erreur) {
    const message = erreur instanceof Error ? erreur.message : "Erreur inconnue.";
    return NextResponse.json({ erreur: message }, { status: 500 });
  }
}
