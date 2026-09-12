"use client";

import { useEffect, useState } from "react";
import { Coquille } from "@/components/Coquille";

interface SignalementCitoyen {
  id: string;
  categorie: "accident" | "information" | "demande_diffusion" | "autre";
  titre: string;
  description: string | null;
  image_url: string | null;
  statut: "nouveau" | "traite" | "archive";
  cree_le: string;
  auteurNom: string;
}

const LIBELLES_CATEGORIE: Record<SignalementCitoyen["categorie"], string> = {
  accident: "Accident",
  information: "Information",
  demande_diffusion: "Demande de diffusion",
  autre: "Autre",
};

const LIBELLES_STATUT: Record<SignalementCitoyen["statut"], string> = {
  nouveau: "Nouveau",
  traite: "Traité",
  archive: "Archivé",
};

export default function PageSignalementsCitoyens() {
  return (
    <Coquille permissionRequise="citizen_reports.view">
      <SignalementsCitoyens />
    </Coquille>
  );
}

function SignalementsCitoyens() {
  const [signalements, setSignalements] = useState<SignalementCitoyen[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  async function charger() {
    const reponse = await fetch("/api/signalements-citoyens");
    const donnees = await reponse.json();
    if (!reponse.ok) {
      setErreur(donnees.erreur ?? "Impossible de charger les informations.");
      setSignalements([]);
      return;
    }
    setSignalements(donnees.signalements);
  }

  useEffect(() => {
    charger();
  }, []);

  async function voirPhoto(s: SignalementCitoyen) {
    setErreur(null);
    try {
      const reponse = await fetch("/api/signalements-citoyens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "urlSignee", signalementId: s.id }),
      });
      const donnees = await reponse.json();
      if (!reponse.ok) throw new Error(donnees.erreur ?? "Échec de l'ouverture de la photo.");
      window.open(donnees.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Échec de l'ouverture de la photo.");
    }
  }

  async function changerStatut(s: SignalementCitoyen, statut: string) {
    setErreur(null);
    try {
      const reponse = await fetch("/api/signalements-citoyens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "changerStatut", signalementId: s.id, statut }),
      });
      const donnees = await reponse.json();
      if (!reponse.ok) throw new Error(donnees.erreur ?? "Échec de la mise à jour.");
      await charger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Échec de la mise à jour.");
    }
  }

  return (
    <>
      <div className="entete-page">
        <div>
          <h1>Infos des auditeurs</h1>
          <p>
            Accidents, informations locales et demandes de diffusion envoyés par les auditeurs
            depuis l&apos;application. Visible uniquement par l&apos;équipe autorisée — jamais public.
          </p>
        </div>
      </div>

      {erreur ? <div className="message erreur">{erreur}</div> : null}

      {signalements === null ? (
        <p>Chargement…</p>
      ) : signalements.length === 0 ? (
        <p>Aucune information envoyée pour le moment.</p>
      ) : (
        <div className="carte">
          <table className="tableau">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Catégorie</th>
                <th>Envoyé par</th>
                <th>Date</th>
                <th>Photo</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {signalements.map((s) => (
                <tr key={s.id}>
                  <td className="titre-ligne">
                    {s.titre}
                    {s.description ? (
                      <div style={{ fontSize: 12, color: "var(--texte-doux)", marginTop: 4 }}>{s.description}</div>
                    ) : null}
                  </td>
                  <td>{LIBELLES_CATEGORIE[s.categorie]}</td>
                  <td>{s.auteurNom}</td>
                  <td>{new Date(s.cree_le).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td>
                    {s.image_url ? (
                      <button type="button" className="bouton secondaire" onClick={() => voirPhoto(s)}>
                        Voir
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <select value={s.statut} onChange={(e) => changerStatut(s, e.target.value)}>
                      {Object.entries(LIBELLES_STATUT).map(([valeur, libelle]) => (
                        <option key={valeur} value={valeur}>{libelle}</option>
                      ))}
                    </select>
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
