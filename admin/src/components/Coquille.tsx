"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { schemasParGroupe } from "@/lib/schemas";
import { DESCRIPTIONS_ROLE, GROUPES_PAR_ROLE, LIBELLES_ROLE, useSession } from "@/lib/session";
import { supabase, supabaseEstConfigure } from "@/lib/supabase";
import { usePermissions } from "@/lib/usePermissions";

/**
 * Coquille de l'administration : barre latérale, garde d'authentification et
 * zone de contenu. Toute page protégée doit être enveloppée par ce composant.
 */
export function Coquille({
  children,
  permissionRequise,
}: {
  children: React.ReactNode;
  /** Si fournie, bloque réellement l'accès à la page (pas seulement le lien du menu). */
  permissionRequise?: string;
}) {
  const { session, chargement } = useSession();
  const { hasPermission, chargement: chargementPermissions } = usePermissions();
  const router = useRouter();
  const chemin = usePathname();

  useEffect(() => {
    if (!chargement && !session && supabaseEstConfigure) {
      router.replace("/connexion");
    }
  }, [chargement, session, router]);

  if (!supabaseEstConfigure) {
    return (
      <div className="contenu">
        <div className="message attention">
          <strong>Supabase n&apos;est pas configuré.</strong> Renseignez
          <code> NEXT_PUBLIC_SUPABASE_URL </code> et
          <code> NEXT_PUBLIC_SUPABASE_ANON_KEY </code> dans le fichier
          <code> admin/.env.local </code>, puis relancez le serveur.
        </div>
      </div>
    );
  }

  if (chargement) return <div className="chargement">Chargement…</div>;
  if (!session) return <div className="chargement">Redirection vers la connexion…</div>;

  if (!session.role) {
    return (
      <div className="page-connexion">
        <div className="boite-connexion">
          <div className="marque">
            <div className="logo">RND</div>
            <h1>Accès non autorisé</h1>
            <p>
              Le compte <strong>{session.email}</strong> n&apos;a pas de rôle interne.
            </p>
          </div>
          <div className="message info">
            Un super administrateur doit vous attribuer un rôle dans la table
            <code> profils </code> avant que vous puissiez accéder au back-office.
          </div>
          <button
            className="bouton secondaire"
            onClick={async () => {
              await supabase?.auth.signOut();
              router.replace("/connexion");
            }}
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  const groupesAutorises = GROUPES_PAR_ROLE[session.role];
  const groupes = [...schemasParGroupe().entries()].filter(
    ([groupe]) => groupesAutorises === "tout" || groupesAutorises.includes(groupe)
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-marque">
          <div className="sidebar-logo">RND</div>
          <div>
            <strong>RADIO NOTRE-DAME</strong>
            <span>Administration · 103.3 FM</span>
          </div>
        </div>

        <Link href="/" className={`sidebar-lien${chemin === "/" ? " actif" : ""}`}>
          <span className="emoji">📊</span> Tableau de bord
        </Link>

        <div
          style={{
            margin: "10px 14px",
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.07)",
          }}
        >
          <div style={{ fontSize: 10.5, letterSpacing: 0.5, textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
            Ma tâche
          </div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginTop: 2 }}>
            {LIBELLES_ROLE[session.role]}
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11.5, marginTop: 3, lineHeight: 1.4 }}>
            {DESCRIPTIONS_ROLE[session.role]}
          </div>
        </div>

        <Link href="/taches" className={`sidebar-lien${chemin === "/taches" ? " actif" : ""}`}>
          <span className="emoji">✅</span> {hasPermission("tasks.assign") ? "Gestion des tâches" : "Mes tâches"}
        </Link>

        {hasPermission("users.create") ? (
          <Link href="/dispatcher" className={`sidebar-lien${chemin === "/dispatcher" ? " actif" : ""}`}>
            <span className="emoji">🧭</span> Dispatcher
          </Link>
        ) : null}

        {hasPermission("files.view") ? (
          <Link href="/fichiers" className={`sidebar-lien${chemin === "/fichiers" ? " actif" : ""}`}>
            <span className="emoji">📁</span> Fichiers partagés
          </Link>
        ) : null}

        {hasPermission("citizen_reports.view") ? (
          <Link
            href="/signalements-citoyens"
            className={`sidebar-lien${chemin === "/signalements-citoyens" ? " actif" : ""}`}
          >
            <span className="emoji">📣</span> Infos des auditeurs
          </Link>
        ) : null}

        {hasPermission("users.view") ? (
          <Link href="/equipe" className={`sidebar-lien${chemin === "/equipe" ? " actif" : ""}`}>
            <span className="emoji">👥</span> Équipe
          </Link>
        ) : null}

        {hasPermission("services.manage") ? (
          <Link href="/services" className={`sidebar-lien${chemin === "/services" ? " actif" : ""}`}>
            <span className="emoji">🏷️</span> Services
          </Link>
        ) : null}

        {hasPermission("roles.view") ? (
          <Link href="/roles" className={`sidebar-lien${chemin.startsWith("/roles") ? " actif" : ""}`}>
            <span className="emoji">🔐</span> Rôles & permissions
          </Link>
        ) : null}

        {hasPermission("finance.view") ? (
          <Link href="/comptabilite" className={`sidebar-lien${chemin === "/comptabilite" ? " actif" : ""}`}>
            <span className="emoji">💰</span> Comptabilité
          </Link>
        ) : null}

        {groupes.map(([groupe, schemas]) => (
          <div key={groupe}>
            <div className="sidebar-groupe">{groupe}</div>
            {schemas.map((schema) => {
              const href = `/contenu/${schema.cle}`;
              return (
                <Link
                  key={schema.cle}
                  href={href}
                  className={`sidebar-lien${chemin.startsWith(href) ? " actif" : ""}`}
                >
                  <span className="emoji">{schema.icone}</span> {schema.libelle}
                </Link>
              );
            })}
          </div>
        ))}

        <div className="sidebar-pied">
          <div style={{ color: "#fff", fontWeight: 600 }}>{session.nom ?? session.email}</div>
          <div>{LIBELLES_ROLE[session.role]}</div>
          <Link
            href="/profil"
            className="bouton secondaire"
            style={{ marginTop: 10, width: "100%", justifyContent: "center", padding: "7px" }}
          >
            Mon profil
          </Link>
          <button
            className="bouton secondaire"
            style={{ marginTop: 10, width: "100%", justifyContent: "center", padding: "7px" }}
            onClick={async () => {
              await supabase?.auth.signOut();
              router.replace("/connexion");
            }}
          >
            Se déconnecter
          </button>
        </div>
      </aside>

      <main className="contenu">
        {permissionRequise && !chargementPermissions && !hasPermission(permissionRequise) ? (
          <>
            <div className="entete-page">
              <div>
                <h1>Accès refusé</h1>
                <p>Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.</p>
              </div>
            </div>
            <Link href="/" className="bouton secondaire">← Retour au tableau de bord</Link>
          </>
        ) : permissionRequise && chargementPermissions ? (
          <div className="chargement">Vérification des accès…</div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
