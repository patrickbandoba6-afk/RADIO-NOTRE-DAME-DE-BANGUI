"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Coquille } from "@/components/Coquille";

interface RoleEnrichi {
  id: string;
  slug: string;
  nom: string;
  description: string | null;
  est_role_systeme: boolean;
  nombreUtilisateurs: number;
  permissionIds: string[];
}

export default function PageRoles() {
  return (
    <Coquille permissionRequise="roles.view">
      <ListeRoles />
    </Coquille>
  );
}

function ListeRoles() {
  const [roles, setRoles] = useState<RoleEnrichi[] | null>(null);
  const [totalPermissions, setTotalPermissions] = useState(0);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const reponse = await fetch("/api/roles");
      const donnees = await reponse.json();
      if (!reponse.ok) {
        setErreur(donnees.erreur ?? "Impossible de charger les rôles — exécutez supabase/schema_permissions.sql.");
        setRoles([]);
        return;
      }
      setRoles(donnees.roles);
      setTotalPermissions(donnees.permissions.length);
    })();
  }, []);

  return (
    <>
      <div className="entete-page">
        <div>
          <h1>Rôles & permissions</h1>
          <p>
            Chaque rôle regroupe un ensemble précis de permissions (ex.{" "}
            <code>articles.publish</code>, <code>finance.view</code>). Cliquez sur un rôle pour
            voir et ajuster ce qu&apos;il peut faire.
          </p>
        </div>
      </div>

      {erreur ? <div className="message erreur">{erreur}</div> : null}

      {roles === null ? (
        <p>Chargement…</p>
      ) : (
        <div className="grille-actions">
          {roles.map((role) => (
            <Link key={role.id} href={`/roles/${role.id}`} className="action-rapide" style={{ flexDirection: "column", alignItems: "flex-start", gap: 6, padding: 16 }}>
              <strong style={{ fontSize: 15 }}>{role.nom}</strong>
              <span style={{ color: "var(--texte-doux)", fontSize: 12.5 }}>{role.description}</span>
              <span style={{ fontSize: 12, marginTop: 4 }}>
                {role.nombreUtilisateurs} utilisateur{role.nombreUtilisateurs !== 1 ? "s" : ""} ·{" "}
                {role.slug === "super_administrateur" ? totalPermissions : role.permissionIds.length}{" "}
                permission{(role.slug === "super_administrateur" ? totalPermissions : role.permissionIds.length) !== 1 ? "s" : ""}
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
