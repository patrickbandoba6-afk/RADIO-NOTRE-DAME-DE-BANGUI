"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Coquille } from "@/components/Coquille";
import { usePermissions } from "@/lib/usePermissions";

interface RoleEnrichi {
  id: string;
  slug: string;
  nom: string;
  description: string | null;
  nombreUtilisateurs: number;
  permissionIds: string[];
}

interface Permission {
  id: string;
  code: string;
  module: string;
  action: string;
  description: string | null;
}

const LIBELLES_MODULE: Record<string, string> = {
  dashboard: "Tableau de bord",
  users: "Utilisateurs",
  roles: "Rôles",
  articles: "Actualités",
  announcements: "Annonces",
  media: "Médiathèque",
  emissions: "Émissions",
  podcasts: "Podcasts / épisodes",
  videos: "Vidéos",
  programs: "Grille des programmes",
  live: "Direct",
  moderation: "Modération",
  prayers: "Prières",
  finance: "Finances",
  statistics: "Statistiques",
  settings: "Paramètres",
  audit: "Journal d'activité",
};

export default function PageDetailRole() {
  return (
    <Coquille permissionRequise="roles.view">
      <DetailRole />
    </Coquille>
  );
}

function DetailRole() {
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = usePermissions();
  const [roles, setRoles] = useState<RoleEnrichi[] | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState<string | null>(null);

  async function charger() {
    const reponse = await fetch("/api/roles");
    const donnees = await reponse.json();
    if (!reponse.ok) {
      setErreur(donnees.erreur ?? "Impossible de charger ce rôle.");
      return;
    }
    setRoles(donnees.roles);
    setPermissions(donnees.permissions);
  }

  useEffect(() => {
    charger();
  }, []);

  const role = roles?.find((r) => r.id === id);
  const peutModifier = hasPermission("roles.manage_permissions") && role?.slug !== "super_administrateur";

  async function togglePermission(permission: Permission, actif: boolean) {
    if (!role) return;
    setEnCours(permission.id);
    setErreur(null);
    try {
      const reponse = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "togglePermission",
          roleId: role.id,
          roleSlug: role.slug,
          roleNom: role.nom,
          permissionId: permission.id,
          permissionCode: permission.code,
          activer: actif,
        }),
      });
      const donnees = await reponse.json();
      if (!reponse.ok) throw new Error(donnees.erreur ?? "Échec de la mise à jour.");
      await charger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Échec de la mise à jour.");
    } finally {
      setEnCours(null);
    }
  }

  if (roles === null) return <Coquille><p>Chargement…</p></Coquille>;
  if (!role) {
    return (
      <>
        <div className="message erreur">Rôle introuvable.</div>
        <Link href="/roles" className="bouton secondaire">← Retour aux rôles</Link>
      </>
    );
  }

  const permissionsParModule = new Map<string, Permission[]>();
  for (const p of permissions) {
    if (!permissionsParModule.has(p.module)) permissionsParModule.set(p.module, []);
    permissionsParModule.get(p.module)!.push(p);
  }

  return (
    <>
      <div className="entete-page">
        <div>
          <h1>{role.nom}</h1>
          <p>{role.description}</p>
          <p style={{ marginTop: 6 }}>
            {role.nombreUtilisateurs} utilisateur{role.nombreUtilisateurs !== 1 ? "s" : ""} avec ce
            rôle
          </p>
        </div>
      </div>

      {erreur ? <div className="message erreur">{erreur}</div> : null}

      {role.slug === "super_administrateur" ? (
        <div className="message info">
          Le super administrateur a toujours accès à l&apos;ensemble des fonctionnalités — ses
          permissions ne peuvent pas être restreintes.
        </div>
      ) : !peutModifier ? (
        <div className="message attention">
          Vous pouvez consulter ces permissions mais pas les modifier (permission{" "}
          <code>roles.manage_permissions</code> requise).
        </div>
      ) : null}

      {[...permissionsParModule.entries()].map(([module, perms]) => (
        <div key={module} className="carte carte-corps" style={{ marginBottom: 16 }}>
          <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 15 }}>
            {LIBELLES_MODULE[module] ?? module}
          </h2>
          <div style={{ display: "grid", gap: 8 }}>
            {perms.map((permission) => {
              const actif =
                role.slug === "super_administrateur" || role.permissionIds.includes(permission.id);
              return (
                <label
                  key={permission.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    opacity: enCours === permission.id ? 0.5 : 1,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={actif}
                    disabled={!peutModifier || enCours !== null}
                    onChange={(e) => togglePermission(permission, e.target.checked)}
                  />
                  <span>
                    {permission.description ?? permission.code}{" "}
                    <code style={{ fontSize: 11.5, color: "var(--texte-doux)" }}>{permission.code}</code>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <Link href="/roles" className="bouton secondaire">← Retour aux rôles</Link>
    </>
  );
}
