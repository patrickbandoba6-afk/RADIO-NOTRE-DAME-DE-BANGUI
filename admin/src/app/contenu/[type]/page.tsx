"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Coquille } from "@/components/Coquille";
import { schemaParCle, type SchemaContenu } from "@/lib/schemas";
import { supabase } from "@/lib/supabase";

type Ligne = Record<string, any>;

export default function PageListe() {
  const params = useParams<{ type: string }>();
  const schema = schemaParCle(params.type);

  return (
    <Coquille>
      {schema ? (
        <Liste schema={schema} />
      ) : (
        <div className="etat-vide">
          <span className="emoji">🤔</span>
          <h3>Rubrique inconnue</h3>
          <p>Cette rubrique n&apos;existe pas dans le back-office.</p>
          <Link href="/" className="bouton">
            Retour au tableau de bord
          </Link>
        </div>
      )}
    </Coquille>
  );
}

function Liste({ schema }: { schema: SchemaContenu }) {
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("tous");

  const aUnStatut = schema.champs.some((champ) => champ.nom === "statut");

  const charger = useCallback(async () => {
    if (!supabase) return;
    setChargement(true);
    setErreur(null);

    const { data, error } = await supabase
      .from(schema.table)
      .select("*")
      .order(schema.colonneTri, { ascending: !schema.triDescendant })
      .limit(300);

    if (error) {
      setErreur(
        `Impossible de charger « ${schema.libelle} ». Vérifiez que la table « ${schema.table} » ` +
          "existe (schema.sql puis schema_editorial.sql doivent être exécutés dans Supabase)."
      );
      setLignes([]);
    } else {
      setLignes(data ?? []);
    }
    setChargement(false);
  }, [schema]);

  useEffect(() => {
    charger();
  }, [charger]);

  async function supprimer(ligne: Ligne) {
    const nom = ligne.titre ?? ligne.nom ?? "cet élément";
    if (!window.confirm(`Supprimer définitivement « ${nom} » ?`)) return;
    if (!supabase) return;

    const { error } = await supabase.from(schema.table).delete().eq("id", ligne.id);
    if (error) {
      window.alert(`Suppression impossible : ${error.message}`);
      return;
    }
    charger();
  }

  const lignesFiltrees = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    return lignes.filter((ligne) => {
      if (filtreStatut !== "tous" && ligne.statut !== filtreStatut) return false;
      if (!terme) return true;
      return Object.values(ligne).some(
        (valeur) => typeof valeur === "string" && valeur.toLowerCase().includes(terme)
      );
    });
  }, [lignes, recherche, filtreStatut]);

  return (
    <>
      <div className="entete-page">
        <div>
          <h1>
            {schema.icone} {schema.libelle}
          </h1>
          <p>{schema.description}</p>
        </div>
        <Link href={`/contenu/${schema.cle}/nouveau`} className="bouton">
          + Ajouter {schema.librelleSingulier === "article" ? "un" : "une"}{" "}
          {schema.librelleSingulier}
        </Link>
      </div>

      {erreur ? <div className="message erreur">{erreur}</div> : null}

      <div className="barre-recherche">
        <input
          type="text"
          placeholder={`Rechercher dans ${schema.libelle.toLowerCase()}…`}
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
        {aUnStatut ? (
          <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)}>
            <option value="tous">Tous les statuts</option>
            <option value="publie">Publié</option>
            <option value="brouillon">Brouillon</option>
            <option value="programme">Programmé</option>
            <option value="en_attente">En attente</option>
            <option value="depublie">Dépublié</option>
            <option value="archive">Archivé</option>
          </select>
        ) : null}
      </div>

      <div className="carte">
        {chargement ? (
          <div className="chargement">Chargement…</div>
        ) : lignesFiltrees.length === 0 ? (
          <div className="etat-vide">
            <span className="emoji">{schema.icone}</span>
            <h3>Aucun contenu</h3>
            <p>
              {lignes.length === 0
                ? `Aucun contenu n'a encore été créé dans « ${schema.libelle} ».`
                : "Aucun résultat pour cette recherche."}
            </p>
            {lignes.length === 0 ? (
              <Link href={`/contenu/${schema.cle}/nouveau`} className="bouton">
                Créer le premier contenu
              </Link>
            ) : null}
          </div>
        ) : (
          <table className="tableau">
            <thead>
              <tr>
                {schema.colonnes.map((colonne) => (
                  <th key={colonne.nom}>{colonne.libelle}</th>
                ))}
                <th style={{ width: 150 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lignesFiltrees.map((ligne) => (
                <tr key={ligne.id}>
                  {schema.colonnes.map((colonne) => (
                    <td key={colonne.nom}>
                      <Cellule valeur={ligne[colonne.nom]} type={colonne.type} />
                    </td>
                  ))}
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Link
                        href={`/contenu/${schema.cle}/${ligne.id}`}
                        className="bouton secondaire"
                        style={{ padding: "5px 11px", fontSize: 12.5 }}
                      >
                        Modifier
                      </Link>
                      <button
                        className="bouton danger"
                        style={{ padding: "5px 11px", fontSize: 12.5 }}
                        onClick={() => supprimer(ligne)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!chargement && lignesFiltrees.length > 0 ? (
        <p style={{ color: "var(--texte-doux)", fontSize: 13, marginTop: 12 }}>
          {lignesFiltrees.length} élément{lignesFiltrees.length > 1 ? "s" : ""}
          {lignesFiltrees.length !== lignes.length ? ` sur ${lignes.length}` : ""}
        </p>
      ) : null}
    </>
  );
}

function Cellule({ valeur, type }: { valeur: any; type?: string }) {
  if (valeur === null || valeur === undefined || valeur === "") {
    return <span style={{ color: "var(--texte-doux)" }}>—</span>;
  }

  if (type === "image") {
    return <img className="vignette" src={String(valeur)} alt="" />;
  }
  if (type === "statut") {
    const libelles: Record<string, string> = {
      publie: "Publié",
      brouillon: "Brouillon",
      programme: "Programmé",
      en_attente: "En attente",
      depublie: "Dépublié",
      archive: "Archivé",
    };
    return <span className={`badge ${valeur}`}>{libelles[String(valeur)] ?? String(valeur)}</span>;
  }
  if (type === "booleen" || typeof valeur === "boolean") {
    return <span className={`badge ${valeur ? "oui" : "non"}`}>{valeur ? "Oui" : "Non"}</span>;
  }
  if (type === "date") {
    return <>{new Date(String(valeur)).toLocaleDateString("fr-FR")}</>;
  }

  const texte = String(valeur);
  return <span className="titre-ligne">{texte.length > 70 ? `${texte.slice(0, 70)}…` : texte}</span>;
}
