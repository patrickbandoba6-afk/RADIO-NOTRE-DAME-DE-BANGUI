"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Coquille } from "@/components/Coquille";
import { SCHEMAS } from "@/lib/schemas";
import { supabase } from "@/lib/supabase";

interface Statistiques {
  publies: number;
  brouillons: number;
  programmes: number;
  articles: number;
  annonces: number;
  episodes: number;
  evenements: number;
  emissions: number;
}

const ACTIONS_RAPIDES = [
  { cle: "articles", emoji: "📰", libelle: "Nouvelle actualité" },
  { cle: "annonces", emoji: "📢", libelle: "Nouvelle annonce" },
  { cle: "evenements", emoji: "📅", libelle: "Nouvel événement" },
  { cle: "episodes", emoji: "🎧", libelle: "Nouvel épisode" },
  { cle: "emissions", emoji: "📻", libelle: "Nouvelle émission" },
  { cle: "prieres", emoji: "🙏", libelle: "Nouvelle prière" },
  { cle: "evangiles_du_jour", emoji: "✝️", libelle: "Évangile du jour" },
  { cle: "communiques", emoji: "📄", libelle: "Nouveau communiqué" },
  { cle: "alertes", emoji: "🚨", libelle: "Nouvelle alerte" },
];

export default function PageTableauDeBord() {
  return (
    <Coquille>
      <TableauDeBord />
    </Coquille>
  );
}

function TableauDeBord() {
  const [stats, setStats] = useState<Statistiques | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    async function compter(table: string, filtre?: { colonne: string; valeur: string }) {
      let requete = supabase!.from(table).select("*", { count: "exact", head: true });
      if (filtre) requete = requete.eq(filtre.colonne, filtre.valeur);
      const { count, error } = await requete;
      if (error) throw error;
      return count ?? 0;
    }

    (async () => {
      try {
        const [publies, brouillons, programmes, articles, annonces, episodes, evenements, emissions] =
          await Promise.all([
            compter("articles", { colonne: "statut", valeur: "publie" }),
            compter("articles", { colonne: "statut", valeur: "brouillon" }),
            compter("articles", { colonne: "statut", valeur: "programme" }),
            compter("articles"),
            compter("annonces"),
            compter("episodes"),
            compter("evenements"),
            compter("emissions"),
          ]);
        setStats({ publies, brouillons, programmes, articles, annonces, episodes, evenements, emissions });
      } catch (e) {
        setErreur(
          "Impossible de charger les statistiques. Vérifiez que le schéma " +
            "`schema_editorial.sql` a bien été exécuté dans Supabase."
        );
      }
    })();
  }, []);

  return (
    <>
      <div className="entete-page">
        <div>
          <h1>Tableau de bord</h1>
          <p>
            Gestion éditoriale de Radio Notre-Dame de Bangui. Tout le contenu publié ici
            apparaît immédiatement dans l&apos;application mobile et web.
          </p>
        </div>
      </div>

      {erreur ? <div className="message erreur">{erreur}</div> : null}

      <div className="grille-stats" style={{ marginBottom: 28 }}>
        <Stat emoji="✅" valeur={stats?.publies} libelle="Articles publiés" />
        <Stat emoji="📝" valeur={stats?.brouillons} libelle="Brouillons" />
        <Stat emoji="⏱️" valeur={stats?.programmes} libelle="Publications programmées" />
        <Stat emoji="📰" valeur={stats?.articles} libelle="Actualités au total" />
        <Stat emoji="📢" valeur={stats?.annonces} libelle="Annonces" />
        <Stat emoji="🎧" valeur={stats?.episodes} libelle="Épisodes / podcasts" />
        <Stat emoji="📅" valeur={stats?.evenements} libelle="Événements" />
        <Stat emoji="📻" valeur={stats?.emissions} libelle="Émissions" />
      </div>

      <h2 style={{ marginBottom: 12 }}>Créer un contenu</h2>
      <div className="grille-actions" style={{ marginBottom: 28 }}>
        {ACTIONS_RAPIDES.map((action) => (
          <Link key={action.cle} href={`/contenu/${action.cle}/nouveau`} className="action-rapide">
            <span className="emoji">{action.emoji}</span>
            {action.libelle}
          </Link>
        ))}
      </div>

      <h2 style={{ marginBottom: 12 }}>Toutes les rubriques</h2>
      <div className="grille-actions">
        {SCHEMAS.map((schema) => (
          <Link key={schema.cle} href={`/contenu/${schema.cle}`} className="action-rapide">
            <span className="emoji">{schema.icone}</span>
            {schema.libelle}
          </Link>
        ))}
      </div>
    </>
  );
}

function Stat({
  emoji,
  valeur,
  libelle,
}: {
  emoji: string;
  valeur: number | undefined;
  libelle: string;
}) {
  return (
    <div className="carte stat">
      <span className="emoji">{emoji}</span>
      <div className="valeur">{valeur === undefined ? "—" : valeur}</div>
      <div className="libelle">{libelle}</div>
    </div>
  );
}
