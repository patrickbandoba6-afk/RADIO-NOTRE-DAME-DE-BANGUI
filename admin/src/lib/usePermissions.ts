"use client";

import { useEffect, useState } from "react";

interface EtatPermissions {
  permissions: Set<string> | null;
  chargement: boolean;
}

/**
 * Charge une seule fois les permissions effectives de l'utilisateur connecté
 * (déduites de son rôle via `role_permissions`, ou accès total si super
 * administrateur — voir `mes_permissions()` côté base de données).
 */
export function usePermissions() {
  const [etat, setEtat] = useState<EtatPermissions>({ permissions: null, chargement: true });

  useEffect(() => {
    let annule = false;
    fetch("/api/mes-permissions")
      .then((r) => r.json())
      .then((donnees) => {
        if (annule) return;
        setEtat({ permissions: new Set(donnees.permissions ?? []), chargement: false });
      })
      .catch(() => {
        if (!annule) setEtat({ permissions: new Set(), chargement: false });
      });
    return () => {
      annule = true;
    };
  }, []);

  function hasPermission(code: string): boolean {
    return etat.permissions?.has(code) ?? false;
  }

  function hasAnyPermission(codes: string[]): boolean {
    return codes.some(hasPermission);
  }

  return { hasPermission, hasAnyPermission, chargement: etat.chargement };
}
