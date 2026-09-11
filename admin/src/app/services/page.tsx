"use client";

import { useEffect, useState } from "react";
import { Coquille } from "@/components/Coquille";

interface ServiceItem {
  id: string;
  nom: string;
  slug: string;
  description: string | null;
}

export default function PageServices() {
  return (
    <Coquille permissionRequise="services.manage">
      <GestionServices />
    </Coquille>
  );
}

function GestionServices() {
  const [services, setServices] = useState<ServiceItem[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [enCours, setEnCours] = useState(false);

  async function charger() {
    const reponse = await fetch("/api/services");
    const donnees = await reponse.json();
    if (!reponse.ok) {
      setErreur(donnees.erreur ?? "Impossible de charger les services.");
      setServices([]);
      return;
    }
    setServices(donnees.services);
  }

  useEffect(() => {
    charger();
  }, []);

  async function creer(evenement: React.FormEvent) {
    evenement.preventDefault();
    setErreur(null);
    setEnCours(true);
    try {
      const reponse = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "creer", nom: nom.trim(), description: description.trim() || undefined }),
      });
      const donnees = await reponse.json();
      if (!reponse.ok) throw new Error(donnees.erreur ?? "Échec de la création.");
      setNom("");
      setDescription("");
      await charger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Échec de la création.");
    } finally {
      setEnCours(false);
    }
  }

  async function supprimer(service: ServiceItem) {
    if (!window.confirm(`Supprimer le service "${service.nom}" ? Les employés qui y sont rattachés n'auront plus de service.`)) {
      return;
    }
    setErreur(null);
    try {
      const reponse = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "supprimer", id: service.id }),
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
          <h1>Services</h1>
          <p>Les pôles de travail de la radio (Production, Rédaction, Technique...) — attribués à chaque employé dans Équipe & rôles.</p>
        </div>
      </div>

      {erreur ? <div className="message erreur">{erreur}</div> : null}

      <div className="carte carte-corps" style={{ marginBottom: 24 }}>
        <h2 style={{ marginTop: 0, marginBottom: 14 }}>Ajouter un service</h2>
        <form onSubmit={creer} className="formulaire">
          <div className="champ">
            <label htmlFor="nom-service">Nom <span className="requis">*</span></label>
            <input id="nom-service" type="text" required value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>
          <div className="champ">
            <label htmlFor="description-service">Description</label>
            <input id="description-service" type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="champ" style={{ justifyContent: "flex-end" }}>
            <button type="submit" className="bouton" disabled={enCours}>
              {enCours ? "Création…" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>

      <h2 style={{ marginBottom: 12 }}>Services existants</h2>
      {services === null ? (
        <p>Chargement…</p>
      ) : (
        <div className="carte">
          <table className="tableau">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Description</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td className="titre-ligne">{s.nom}</td>
                  <td>{s.description ?? "—"}</td>
                  <td>
                    <button type="button" className="bouton secondaire" onClick={() => supprimer(s)}>
                      Supprimer
                    </button>
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
