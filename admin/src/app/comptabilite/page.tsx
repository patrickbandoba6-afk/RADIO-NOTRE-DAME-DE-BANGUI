"use client";

import { useEffect, useState } from "react";
import { Coquille } from "@/components/Coquille";

interface Don {
  id: string;
  montant: number;
  devise: string;
  type: string;
  reference_paiement: string | null;
  cree_le: string;
  nomDonateur: string | null;
  emailDonateur: string | null;
}

interface Total {
  devise: string;
  total: number;
}

export default function PageComptabilite() {
  return (
    <Coquille permissionRequise="finance.view">
      <Comptabilite />
    </Coquille>
  );
}

function Comptabilite() {
  const [dons, setDons] = useState<Don[] | null>(null);
  const [totaux, setTotaux] = useState<Total[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const reponse = await fetch("/api/comptabilite");
      const donnees = await reponse.json();
      if (!reponse.ok) {
        setErreur(donnees.erreur ?? "Impossible de charger les dons.");
        setDons([]);
        return;
      }
      setDons(donnees.dons);
      setTotaux(donnees.totaux);
    })();
  }, []);

  return (
    <>
      <div className="entete-page">
        <div>
          <h1>Comptabilité</h1>
          <p>Suivi des dons reçus : qui a donné, combien, et le total par devise.</p>
        </div>
      </div>

      {erreur ? <div className="message erreur">{erreur}</div> : null}

      <div className="grille-stats" style={{ marginBottom: 24 }}>
        {totaux.length === 0 ? (
          <div className="carte stat">
            <span className="emoji">💰</span>
            <div className="valeur">0</div>
            <div className="libelle">Aucun don enregistré</div>
          </div>
        ) : (
          totaux.map((t) => (
            <div className="carte stat" key={t.devise}>
              <span className="emoji">💰</span>
              <div className="valeur">{t.total.toLocaleString("fr-FR")}</div>
              <div className="libelle">Total {t.devise}</div>
            </div>
          ))
        )}
      </div>

      <h2 style={{ marginBottom: 12 }}>Détail des dons</h2>
      {dons === null ? (
        <p>Chargement…</p>
      ) : dons.length === 0 ? (
        <p>Aucun don pour le moment.</p>
      ) : (
        <div className="carte">
          <table className="tableau">
            <thead>
              <tr>
                <th>Donateur</th>
                <th>Montant</th>
                <th>Type</th>
                <th>Référence</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {dons.map((don) => (
                <tr key={don.id}>
                  <td className="titre-ligne">
                    {don.nomDonateur ?? don.emailDonateur ?? "Anonyme / invité"}
                  </td>
                  <td>
                    {Number(don.montant).toLocaleString("fr-FR")} {don.devise}
                  </td>
                  <td>{don.type === "recurrent" ? "Récurrent" : "Ponctuel"}</td>
                  <td>{don.reference_paiement ?? "—"}</td>
                  <td>{new Date(don.cree_le).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
