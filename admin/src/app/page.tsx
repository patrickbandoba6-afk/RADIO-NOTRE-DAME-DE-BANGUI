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

interface StatistiquesUsage {
  visites7Jours: number;
  visites30Jours: number;
  parPays: { pays: string; total: number }[];
}

const NOMS_PAYS: Record<string, string> = {
  CF: "Centrafrique",
  CM: "Cameroun",
  CG: "Congo-Brazzaville",
  CD: "RD Congo",
  TD: "Tchad",
  FR: "France",
  BE: "Belgique",
  US: "États-Unis",
  CA: "Canada",
};

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
  const [usage, setUsage] = useState<StatistiquesUsage | null>(null);
  const [erreurUsage, setErreurUsage] = useState<string | null>(null);
  const [auditeurs, setAuditeurs] = useState<number | null>(null);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      try {
        const depuis30Jours = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { data, error } = await supabase!
          .from("visites_app")
          .select("pays, cree_le")
          .gte("cree_le", depuis30Jours);
        if (error) throw error;

        const depuis7Jours = Date.now() - 7 * 24 * 60 * 60 * 1000;
        let visites7Jours = 0;
        const compteurPays = new Map<string, number>();
        for (const ligne of data ?? []) {
          if (new Date(ligne.cree_le).getTime() >= depuis7Jours) visites7Jours += 1;
          const cle = ligne.pays || "Inconnu";
          compteurPays.set(cle, (compteurPays.get(cle) ?? 0) + 1);
        }
        const parPays = [...compteurPays.entries()]
          .map(([pays, total]) => ({ pays, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 8);

        setUsage({ visites7Jours, visites30Jours: (data ?? []).length, parPays });
      } catch {
        setErreurUsage(
          "Statistiques de fréquentation indisponibles — exécutez supabase/schema_stats.sql."
        );
      }
    })();
  }, []);

  useEffect(() => {
    let annule = false;
    fetch("http://shaincast.caster.fm:16045/status-json.xsl")
      .then((r) => r.json())
      .then((donnees) => {
        if (!annule) setAuditeurs(donnees?.icestats?.source?.listeners ?? 0);
      })
      .catch(() => {
        if (!annule) setAuditeurs(null);
      });
    return () => {
      annule = true;
    };
  }, []);

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

      <h2 style={{ marginBottom: 12 }}>Audience</h2>
      {erreurUsage ? <div className="message attention">{erreurUsage}</div> : null}
      <div className="grille-stats" style={{ marginBottom: 16 }}>
        <Stat emoji="🎙️" valeur={auditeurs ?? undefined} libelle="Auditeurs en direct maintenant" />
        <Stat emoji="📱" valeur={usage?.visites7Jours} libelle="Ouvertures de l'app (7 jours)" />
        <Stat emoji="📈" valeur={usage?.visites30Jours} libelle="Ouvertures de l'app (30 jours)" />
      </div>
      {usage && usage.parPays.length > 0 ? (
        <div className="carte" style={{ marginBottom: 28 }}>
          <table className="tableau">
            <thead>
              <tr>
                <th>Pays</th>
                <th>Ouvertures (30 jours)</th>
              </tr>
            </thead>
            <tbody>
              {usage.parPays.map((ligne) => (
                <tr key={ligne.pays}>
                  <td className="titre-ligne">{NOMS_PAYS[ligne.pays] ?? ligne.pays}</td>
                  <td>{ligne.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <p style={{ fontSize: 12.5, color: "var(--texte-doux)", marginTop: -18, marginBottom: 28 }}>
        Le pays est déduit de la langue du téléphone (approximatif). Les téléchargements par pays
        sur l&apos;App Store / Google Play ne sont pas disponibles ici — consultez App Store
        Connect et Google Play Console.
      </p>

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
