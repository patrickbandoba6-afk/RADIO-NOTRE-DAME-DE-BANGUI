"use client";

import { useEffect, useState } from "react";
import { Coquille } from "@/components/Coquille";
import { LIBELLES_ROLE, type RoleInterne } from "@/lib/session";
import { usePermissions } from "@/lib/usePermissions";

const ROLES: RoleInterne[] = [
  "super_administrateur",
  "direction",
  "producteur",
  "animateur",
  "editeur",
  "moderateur",
  "equipe_priere",
  "comptabilite",
];

function genererMotDePasse(): string {
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let mot = "";
  for (let i = 0; i < 8; i += 1) mot += caracteres[Math.floor(Math.random() * caracteres.length)];
  return mot;
}

interface Tache {
  id: string;
  titre: string;
  description: string | null;
  serviceNom: string | null;
  assigne_a: string | null;
  assigneNom: string | null;
  creeParNom: string | null;
  priorite: "basse" | "normale" | "haute" | "urgente";
  statut: "a_faire" | "en_cours" | "en_attente" | "terminee" | "validee" | "annulee";
  date_limite: string | null;
  estMoi: boolean;
}

const LIBELLES_PRIORITE: Record<Tache["priorite"], string> = {
  basse: "Basse",
  normale: "Normale",
  haute: "Haute",
  urgente: "Urgente",
};

const LIBELLES_STATUT: Record<Tache["statut"], string> = {
  a_faire: "À faire",
  en_cours: "En cours",
  en_attente: "En attente",
  terminee: "Terminée",
  validee: "Validée",
  annulee: "Annulée",
};

export default function PageTaches() {
  return (
    <Coquille>
      <GestionTaches />
    </Coquille>
  );
}

function GestionTaches() {
  const { hasPermission } = usePermissions();
  const [taches, setTaches] = useState<Tache[] | null>(null);
  const [membres, setMembres] = useState<{ id: string; nom: string }[]>([]);
  const [services, setServices] = useState<{ id: string; nom: string }[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [identifiantsCrees, setIdentifiantsCrees] = useState<{ email: string; motDePasse: string } | null>(null);

  const [nouvelEmploye, setNouvelEmploye] = useState(false);
  const [nouvelEmail, setNouvelEmail] = useState("");
  const [nouveauNom, setNouveauNom] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState(genererMotDePasse);
  const [nouveauRole, setNouveauRole] = useState<RoleInterne>("editeur");

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [assigneA, setAssigneA] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [priorite, setPriorite] = useState("normale");
  const [dateLimite, setDateLimite] = useState("");
  const [enCours, setEnCours] = useState(false);

  async function charger() {
    const reponse = await fetch("/api/taches");
    const donnees = await reponse.json();
    if (!reponse.ok) {
      setErreur(donnees.erreur ?? "Impossible de charger les tâches.");
      setTaches([]);
      return;
    }
    setTaches(donnees.taches);
    setMembres(donnees.membres ?? []);
    setServices(donnees.services ?? []);
  }

  useEffect(() => {
    charger();
  }, []);

  async function creer(evenement: React.FormEvent) {
    evenement.preventDefault();
    setErreur(null);
    setIdentifiantsCrees(null);
    setEnCours(true);
    try {
      let idResponsable = assigneA;

      if (nouvelEmploye) {
        const reponseCompte = await fetch("/api/equipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "creerCompte",
            email: nouvelEmail.trim(),
            motDePasse: nouveauMotDePasse,
            nom: nouveauNom.trim() || undefined,
            role: nouveauRole,
            serviceId: serviceId || undefined,
          }),
        });
        const donneesCompte = await reponseCompte.json();
        if (!reponseCompte.ok) throw new Error(donneesCompte.erreur ?? "Échec de la création du compte.");
        idResponsable = donneesCompte.userId;
        setIdentifiantsCrees({ email: nouvelEmail.trim(), motDePasse: nouveauMotDePasse });
      }

      const reponse = await fetch("/api/taches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "creer",
          titre: titre.trim(),
          description: description.trim() || undefined,
          assigneA: idResponsable,
          serviceId: serviceId || undefined,
          priorite,
          dateLimite: dateLimite || undefined,
        }),
      });
      const donnees = await reponse.json();
      if (!reponse.ok) throw new Error(donnees.erreur ?? "Échec de la création de la tâche.");

      setTitre("");
      setDescription("");
      setAssigneA("");
      setDateLimite("");
      setNouvelEmail("");
      setNouveauNom("");
      setNouveauMotDePasse(genererMotDePasse());
      setNouvelEmploye(false);
      await charger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Échec de l'opération.");
    } finally {
      setEnCours(false);
    }
  }

  async function changerStatut(tache: Tache, statut: string) {
    setErreur(null);
    try {
      const reponse = await fetch("/api/taches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "changerStatut", tacheId: tache.id, statut }),
      });
      const donnees = await reponse.json();
      if (!reponse.ok) throw new Error(donnees.erreur ?? "Échec de la mise à jour.");
      await charger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Échec de la mise à jour.");
    }
  }

  const peutCreerCompte = hasPermission("users.create");
  const peutGerer = hasPermission("tasks.assign");
  const peutCreer = membres.length > 0 || peutCreerCompte;
  const mesTaches = (taches ?? []).filter((t) => t.estMoi);
  const autresTaches = (taches ?? []).filter((t) => !t.estMoi);

  return (
    <>
      <div className="entete-page">
        <div>
          <h1>{peutGerer ? "Gestion des tâches" : "Mes tâches"}</h1>
          <p>
            {peutGerer
              ? "Attribuez des tâches à votre équipe et suivez leur avancement."
              : "Ce qui vous a été confié."}
          </p>
        </div>
      </div>

      {erreur ? <div className="message erreur">{erreur}</div> : null}

      {identifiantsCrees ? (
        <div className="message succes">
          <strong>Compte créé.</strong> Notez ces identifiants et transmettez-les à la personne :
          <div style={{ marginTop: 8, fontFamily: "monospace", fontSize: 13.5 }}>
            E-mail : <strong>{identifiantsCrees.email}</strong>
            <br />
            Mot de passe : <strong>{identifiantsCrees.motDePasse}</strong>
          </div>
        </div>
      ) : null}

      {peutCreer ? (
        <div className="carte carte-corps" style={{ marginBottom: 24 }}>
          <h2 style={{ marginTop: 0, marginBottom: 14 }}>Attribuer une tâche</h2>

          {peutCreerCompte ? (
            <div className="liens-connexion" style={{ flexDirection: "row", justifyContent: "flex-start", gap: 16, marginBottom: 14 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                <input type="radio" checked={!nouvelEmploye} onChange={() => setNouvelEmploye(false)} />
                Employé existant
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                <input type="radio" checked={nouvelEmploye} onChange={() => setNouvelEmploye(true)} />
                Nouvel employé (créer son compte)
              </label>
            </div>
          ) : null}

          <form onSubmit={creer} className="formulaire">
            {nouvelEmploye ? (
              <>
                <div className="champ">
                  <label htmlFor="nouvel-email">E-mail (ou identifiant inventé) <span className="requis">*</span></label>
                  <input id="nouvel-email" type="email" required value={nouvelEmail} onChange={(e) => setNouvelEmail(e.target.value)} />
                </div>
                <div className="champ">
                  <label htmlFor="nouveau-nom">Nom <span className="requis">*</span></label>
                  <input id="nouveau-nom" type="text" required value={nouveauNom} onChange={(e) => setNouveauNom(e.target.value)} />
                </div>
                <div className="champ">
                  <label htmlFor="nouveau-motdepasse">Mot de passe <span className="requis">*</span></label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input id="nouveau-motdepasse" type="text" required minLength={6} value={nouveauMotDePasse} onChange={(e) => setNouveauMotDePasse(e.target.value)} style={{ fontFamily: "monospace" }} />
                    <button type="button" className="bouton secondaire" onClick={() => setNouveauMotDePasse(genererMotDePasse())}>Générer</button>
                  </div>
                </div>
                <div className="champ">
                  <label htmlFor="nouveau-role">Rôle <span className="requis">*</span></label>
                  <select id="nouveau-role" value={nouveauRole} onChange={(e) => setNouveauRole(e.target.value as RoleInterne)}>
                    {ROLES.map((role) => (
                      <option key={role} value={role}>{LIBELLES_ROLE[role]}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <div className="champ">
                <label htmlFor="assigne-tache">Employé responsable <span className="requis">*</span></label>
                <select id="assigne-tache" required value={assigneA} onChange={(e) => setAssigneA(e.target.value)}>
                  <option value="">— Choisir —</option>
                  {membres.map((m) => (
                    <option key={m.id} value={m.id}>{m.nom}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="champ large">
              <label htmlFor="titre-tache">Titre de la tâche <span className="requis">*</span></label>
              <input id="titre-tache" type="text" required value={titre} onChange={(e) => setTitre(e.target.value)} />
            </div>
            <div className="champ large">
              <label htmlFor="description-tache">Description</label>
              <input id="description-tache" type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="champ">
              <label htmlFor="service-tache">Service</label>
              <select id="service-tache" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                <option value="">—</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.nom}</option>
                ))}
              </select>
            </div>
            <div className="champ">
              <label htmlFor="priorite-tache">Priorité</label>
              <select id="priorite-tache" value={priorite} onChange={(e) => setPriorite(e.target.value)}>
                {Object.entries(LIBELLES_PRIORITE).map(([valeur, libelle]) => (
                  <option key={valeur} value={valeur}>{libelle}</option>
                ))}
              </select>
            </div>
            <div className="champ">
              <label htmlFor="echeance-tache">Date limite</label>
              <input id="echeance-tache" type="datetime-local" value={dateLimite} onChange={(e) => setDateLimite(e.target.value)} />
            </div>
            <div className="champ" style={{ justifyContent: "flex-end" }}>
              <button type="submit" className="bouton" disabled={enCours}>
                {enCours ? "Envoi…" : nouvelEmploye ? "Créer le compte et attribuer la tâche" : "Attribuer la tâche"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <h2 style={{ marginBottom: 12 }}>Mes tâches</h2>
      {taches === null ? (
        <p>Chargement…</p>
      ) : mesTaches.length === 0 ? (
        <p>Aucune tâche pour le moment.</p>
      ) : (
        <TableauTaches taches={mesTaches} onChangerStatut={changerStatut} modifiable />
      )}

      {autresTaches.length > 0 ? (
        <>
          <h2 style={{ margin: "24px 0 12px" }}>Tâches de l&apos;équipe</h2>
          <TableauTaches taches={autresTaches} onChangerStatut={changerStatut} modifiable={false} />
        </>
      ) : null}
    </>
  );
}

function TableauTaches({
  taches,
  onChangerStatut,
  modifiable,
}: {
  taches: Tache[];
  onChangerStatut: (tache: Tache, statut: string) => void;
  modifiable: boolean;
}) {
  return (
    <div className="carte">
      <table className="tableau">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Responsable</th>
            <th>Service</th>
            <th>Priorité</th>
            <th>Échéance</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {taches.map((t) => (
            <tr key={t.id}>
              <td className="titre-ligne">{t.titre}</td>
              <td>{t.assigneNom ?? "—"}</td>
              <td>{t.serviceNom ?? "—"}</td>
              <td>{LIBELLES_PRIORITE[t.priorite]}</td>
              <td>{t.date_limite ? new Date(t.date_limite).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—"}</td>
              <td>
                {modifiable ? (
                  <select value={t.statut} onChange={(e) => onChangerStatut(t, e.target.value)}>
                    {Object.entries(LIBELLES_STATUT).map(([valeur, libelle]) => (
                      <option key={valeur} value={valeur}>{libelle}</option>
                    ))}
                  </select>
                ) : (
                  LIBELLES_STATUT[t.statut]
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
