"use client";

import { useEffect, useRef, useState } from "react";
import { Coquille } from "@/components/Coquille";
import { supabase } from "@/lib/supabase";

const BUCKET = "fichiers-partages";

interface FichierPartage {
  id: string;
  titre: string;
  description: string | null;
  type_mime: string | null;
  taille_octets: number | null;
  statut: "nouveau" | "utilise" | "archive";
  cree_le: string;
  televersePariNom: string;
}

const LIBELLES_STATUT: Record<FichierPartage["statut"], string> = {
  nouveau: "Nouveau",
  utilise: "Utilisé",
  archive: "Archivé",
};

function formaterTaille(octets: number | null): string {
  if (!octets) return "—";
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(0)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function PageFichiers() {
  return (
    <Coquille permissionRequise="files.view">
      <FichiersPartages />
    </Coquille>
  );
}

function FichiersPartages() {
  const inputFichier = useRef<HTMLInputElement>(null);
  const [fichiers, setFichiers] = useState<FichierPartage[] | null>(null);
  const [peutPartager, setPeutPartager] = useState(false);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [fichierChoisi, setFichierChoisi] = useState<File | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);

  async function charger() {
    const reponse = await fetch("/api/fichiers");
    const donnees = await reponse.json();
    if (!reponse.ok) {
      setErreur(donnees.erreur ?? "Impossible de charger les fichiers.");
      setFichiers([]);
      return;
    }
    setFichiers(donnees.fichiers);
    setPeutPartager(donnees.peutPartager);
  }

  useEffect(() => {
    charger();
  }, []);

  async function partager(evenement: React.FormEvent) {
    evenement.preventDefault();
    if (!fichierChoisi || !supabase) return;
    setErreur(null);
    setSucces(null);
    setEnCours(true);
    try {
      const chemin = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}/${fichierChoisi.name}`;
      const { error: erreurEnvoi } = await supabase.storage.from(BUCKET).upload(chemin, fichierChoisi, {
        contentType: fichierChoisi.type || "application/octet-stream",
      });
      if (erreurEnvoi) throw erreurEnvoi;

      const reponse = await fetch("/api/fichiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "creer",
          titre: titre.trim(),
          description: description.trim() || undefined,
          chemin,
          typeMime: fichierChoisi.type || undefined,
          tailleOctets: fichierChoisi.size,
        }),
      });
      const donnees = await reponse.json();
      if (!reponse.ok) throw new Error(donnees.erreur ?? "Échec du partage du fichier.");

      setTitre("");
      setDescription("");
      setFichierChoisi(null);
      if (inputFichier.current) inputFichier.current.value = "";
      setSucces("Fichier partagé avec l'équipe.");
      await charger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Échec du partage du fichier.");
    } finally {
      setEnCours(false);
    }
  }

  async function ouvrir(fichier: FichierPartage) {
    setErreur(null);
    try {
      const reponse = await fetch("/api/fichiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "urlSignee", fichierId: fichier.id }),
      });
      const donnees = await reponse.json();
      if (!reponse.ok) throw new Error(donnees.erreur ?? "Échec de l'ouverture du fichier.");
      window.open(donnees.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Échec de l'ouverture du fichier.");
    }
  }

  async function marquerUtilise(fichier: FichierPartage) {
    setErreur(null);
    try {
      const reponse = await fetch("/api/fichiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "marquerUtilise",
          fichierId: fichier.id,
          statut: fichier.statut === "utilise" ? "nouveau" : "utilise",
        }),
      });
      const donnees = await reponse.json();
      if (!reponse.ok) throw new Error(donnees.erreur ?? "Échec de la mise à jour.");
      await charger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Échec de la mise à jour.");
    }
  }

  async function supprimer(fichier: FichierPartage) {
    if (!window.confirm(`Supprimer définitivement « ${fichier.titre} » ?`)) return;
    setErreur(null);
    try {
      const reponse = await fetch("/api/fichiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "supprimer", fichierId: fichier.id }),
      });
      const donnees = await reponse.json();
      if (!reponse.ok) throw new Error(donnees.erreur ?? "Échec de la suppression.");
      await charger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Échec de la suppression.");
    }
  }

  return (
    <>
      <div className="entete-page">
        <div>
          <h1>Fichiers partagés</h1>
          <p>
            Direction et Super administrateur déposent ici une affiche, un document ou un enregistrement.
            L&apos;équipe éditoriale le consulte et décide si elle publie une annonce ou un contenu à partir de ce fichier.
          </p>
        </div>
      </div>

      {erreur ? <div className="message erreur">{erreur}</div> : null}
      {succes ? <div className="message succes">{succes}</div> : null}

      {peutPartager ? (
        <div className="carte carte-corps" style={{ marginBottom: 24 }}>
          <h2 style={{ marginTop: 0, marginBottom: 14 }}>Partager un fichier</h2>
          <form onSubmit={partager} className="formulaire">
            <div className="champ large">
              <label htmlFor="f-titre">Titre <span className="requis">*</span></label>
              <input id="f-titre" type="text" required value={titre} onChange={(e) => setTitre(e.target.value)} />
            </div>
            <div className="champ large">
              <label htmlFor="f-description">Description</label>
              <input id="f-description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="champ large">
              <label htmlFor="f-fichier">Fichier <span className="requis">*</span></label>
              <input
                ref={inputFichier}
                id="f-fichier"
                type="file"
                required
                onChange={(e) => setFichierChoisi(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="champ" style={{ justifyContent: "flex-end" }}>
              <button type="submit" className="bouton" disabled={enCours || !fichierChoisi}>
                {enCours ? "Envoi…" : "Partager le fichier"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <h2 style={{ marginBottom: 12 }}>Fichiers de l&apos;équipe</h2>
      {fichiers === null ? (
        <p>Chargement…</p>
      ) : fichiers.length === 0 ? (
        <p>Aucun fichier partagé pour le moment.</p>
      ) : (
        <div className="carte">
          <table className="tableau">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Description</th>
                <th>Taille</th>
                <th>Déposé par</th>
                <th>Date</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {fichiers.map((f) => (
                <tr key={f.id}>
                  <td className="titre-ligne">{f.titre}</td>
                  <td>{f.description ?? "—"}</td>
                  <td>{formaterTaille(f.taille_octets)}</td>
                  <td>{f.televersePariNom}</td>
                  <td>{new Date(f.cree_le).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td>{LIBELLES_STATUT[f.statut]}</td>
                  <td style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button type="button" className="bouton secondaire" onClick={() => ouvrir(f)}>
                      Voir / Télécharger
                    </button>
                    <button type="button" className="bouton secondaire" onClick={() => marquerUtilise(f)}>
                      {f.statut === "utilise" ? "Marquer nouveau" : "Marquer utilisé"}
                    </button>
                    {peutPartager ? (
                      <button type="button" className="bouton secondaire" onClick={() => supprimer(f)}>
                        Supprimer
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
