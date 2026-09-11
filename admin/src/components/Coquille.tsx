"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { schemasParGroupe } from "@/lib/schemas";
import { LIBELLES_ROLE, useSession } from "@/lib/session";
import { supabase, supabaseEstConfigure } from "@/lib/supabase";

/**
 * Coquille de l'administration : barre latérale, garde d'authentification et
 * zone de contenu. Toute page protégée doit être enveloppée par ce composant.
 */
export function Coquille({ children }: { children: React.ReactNode }) {
  const { session, chargement } = useSession();
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

  const groupes = schemasParGroupe();

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

        {[...groupes.entries()].map(([groupe, schemas]) => (
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

      <main className="contenu">{children}</main>
    </div>
  );
}
