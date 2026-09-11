"use client";

import { useEffect, useState } from "react";
import { Coquille } from "@/components/Coquille";
import { LIBELLES_ROLE, type RoleInterne } from "@/lib/session";

interface Membre {
  id: string;
  email: string;
  nom: string | null;
  role: RoleInterne | null;
  serviceId: string | null;
  serviceNom: string | null;
  creeLe: string;
  derniereConnexion: string | null;
  jamaisConnecte: boolean;
  desactive: boolean;
  roleAttribuePar: string | null;
  roleAttribueLe: string | null;
}

interface ServiceItem {
  id: string;
  nom: string;
}

interface EntreeActivite {
  id: string;
  acteurNom: string;
  action: string;
  table_cible: string;
  titre: string | null;
  cree_le: string;
}

const LIBELLES_ACTION: Record<string, string> = {
  creation: "a créé",
  modification: "a modifié",
  suppression: "a supprimé",
};

function formaterDateHeure(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

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
  for (let i = 0; i < 8; i += 1) {
    mot += caracteres[Math.floor(Math.random() * caracteres.length)];
  }
  return mot;
}

export default function PageEquipe() {
  return (
    <Coquille permissionRequise="users.view">
      <GestionEquipe />
    </Coquille>
  );
}

function GestionEquipe() {
  const [membres, setMembres] = useState<Membre[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [identifiantsCrees, setIdentifiantsCrees] = useState<{ email: string; motDePasse: string } | null>(
    null
  );
  const [enCours, setEnCours] = useState(false);

  const [nouvelEmail, setNouvelEmail] = useState("");
  const [nouveauNom, setNouveauNom] = useState("");
  const [nouveauRole, setNouveauRole] = useState<RoleInterne>("editeur");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState(genererMotDePasse);
  const [nouveauServiceId, setNouveauServiceId] = useState("");
  const [services, setServices] = useState<ServiceItem[]>([]);

  const [activite, setActivite] = useState<EntreeActivite[] | null>(null);
  const [erreurActivite, setErreurActivite] = useState<string | null>(null);

  async function charger() {
    setErreur(null);
    const reponse = await fetch("/api/equipe");
    const donnees = await reponse.json();
    if (!reponse.ok) {
      setErreur(donnees.erreur ?? "Impossible de charger l'équipe.");
      setMembres([]);
      return;
    }
    setMembres(donnees.membres);
    setServices(donnees.services ?? []);
  }

  async function chargerActivite() {
    const reponse = await fetch("/api/activite");
    const donnees = await reponse.json();
    if (!reponse.ok) {
      setErreurActivite(
        donnees.erreur ?? "Historique indisponible — exécutez supabase/schema_activite.sql."
      );
      setActivite([]);
      return;
    }
    setActivite(donnees.entrees);
  }

  useEffect(() => {
    charger();
    chargerActivite();
  }, []);

  async function creerCompte(evenement: React.FormEvent) {
    evenement.preventDefault();
    setErreur(null);
    setIdentifiantsCrees(null);
    setEnCours(true);
    try {
      const reponse = await fetch("/api/equipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "creerCompte",
          email: nouvelEmail.trim(),
          motDePasse: nouveauMotDePasse,
          nom: nouveauNom.trim() || undefined,
          role: nouveauRole,
          serviceId: nouveauServiceId || undefined,
        }),
      });
      const donnees = await reponse.json();
      if (!reponse.ok) throw new Error(donnees.erreur ?? "Échec de la création du compte.");
      setIdentifiantsCrees({ email: nouvelEmail.trim(), motDePasse: nouveauMotDePasse });
      setNouvelEmail("");
      setNouveauNom("");
      setNouveauServiceId("");
      setNouveauMotDePasse(genererMotDePasse());
      await charger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Échec de la création du compte.");
    } finally {
      setEnCours(false);
    }
  }

  async function changerRole(userId: string, role: string) {
    setErreur(null);
    try {
      const reponse = await fetch("/api/equipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "changerRole", userId, role: role || null }),
      });
      const donnees = await reponse.json();
      if (!reponse.ok) throw new Error(donnees.erreur ?? "Échec de la mise à jour.");
      await charger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Échec de la mise à jour.");
    }
  }

  async function changerService(userId: string, serviceId: string) {
    setErreur(null);
    try {
      const reponse = await fetch("/api/equipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "changerService", userId, serviceId: serviceId || null }),
      });
      const donnees = await reponse.json();
      if (!reponse.ok) throw new Error(donnees.erreur ?? "Échec de la mise à jour.");
      await charger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Échec de la mise à jour.");
    }
  }

  async function supprimerCompte(membre: Membre) {
    if (
      !window.confirm(
        `Supprimer définitivement le compte de ${membre.nom ?? membre.email} ? Cette action est irréversible.`
      )
    ) {
      return;
    }
    setErreur(null);
    try {
      const reponse = await fetch("/api/equipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "supprimerCompte", userId: membre.id }),
      });
      const donnees = await reponse.json();
      if (!reponse.ok) throw new Error(donnees.erreur ?? "Échec de la suppression.");
      await charger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Échec de la suppression.");
    }
  }

  async function changerActivation(membre: Membre) {
    setErreur(null);
    try {
      const reponse = await fetch("/api/equipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "changerActivation",
          userId: membre.id,
          desactiver: !membre.desactive,
        }),
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
          <h1>Équipe & rôles</h1>
          <p>
            Créez ici le compte de chaque employé (e-mail + mot de passe que vous choisissez) et
            attribuez-lui un rôle. Aucun e-mail n&apos;est envoyé : donnez-lui vous-même ses
            identifiants — utile si la personne n&apos;a pas d&apos;adresse e-mail personnelle
            (vous pouvez en inventer une, ex. <code>jean@rndbangui.local</code>, seul le mot de
            passe compte pour se connecter).
          </p>
        </div>
      </div>

      {erreur ? <div className="message erreur">{erreur}</div> : null}

      {identifiantsCrees ? (
        <div className="message succes">
          <strong>Compte créé.</strong> Notez ces identifiants et transmettez-les à la personne —
          ils ne seront plus affichés ensuite :
          <div style={{ marginTop: 8, fontFamily: "monospace", fontSize: 13.5 }}>
            E-mail : <strong>{identifiantsCrees.email}</strong>
            <br />
            Mot de passe : <strong>{identifiantsCrees.motDePasse}</strong>
          </div>
        </div>
      ) : null}

      <div className="carte carte-corps" style={{ marginBottom: 24 }}>
        <h2 style={{ marginTop: 0, marginBottom: 14 }}>Créer le compte d&apos;un employé</h2>
        <form onSubmit={creerCompte} className="formulaire">
          <div className="champ">
            <label htmlFor="email-invite">
              E-mail (ou identifiant inventé) <span className="requis">*</span>
            </label>
            <input
              id="email-invite"
              type="email"
              required
              value={nouvelEmail}
              onChange={(e) => setNouvelEmail(e.target.value)}
            />
          </div>
          <div className="champ">
            <label htmlFor="nom-invite">Nom</label>
            <input
              id="nom-invite"
              type="text"
              value={nouveauNom}
              onChange={(e) => setNouveauNom(e.target.value)}
            />
          </div>
          <div className="champ">
            <label htmlFor="motdepasse-invite">
              Mot de passe <span className="requis">*</span>
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                id="motdepasse-invite"
                type="text"
                required
                minLength={6}
                value={nouveauMotDePasse}
                onChange={(e) => setNouveauMotDePasse(e.target.value)}
                style={{ fontFamily: "monospace" }}
              />
              <button
                type="button"
                className="bouton secondaire"
                onClick={() => setNouveauMotDePasse(genererMotDePasse())}
              >
                Générer
              </button>
            </div>
          </div>
          <div className="champ">
            <label htmlFor="role-invite">
              Rôle <span className="requis">*</span>
            </label>
            <select
              id="role-invite"
              value={nouveauRole}
              onChange={(e) => setNouveauRole(e.target.value as RoleInterne)}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {LIBELLES_ROLE[role]}
                </option>
              ))}
            </select>
          </div>
          <div className="champ">
            <label htmlFor="service-invite">Service</label>
            <select
              id="service-invite"
              value={nouveauServiceId}
              onChange={(e) => setNouveauServiceId(e.target.value)}
            >
              <option value="">—</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.nom}</option>
              ))}
            </select>
          </div>
          <div className="champ" style={{ justifyContent: "flex-end" }}>
            <button type="submit" className="bouton" disabled={enCours}>
              {enCours ? "Création…" : "Créer le compte"}
            </button>
          </div>
        </form>
      </div>

      <h2 style={{ marginBottom: 12 }}>Membres de l&apos;équipe</h2>
      {membres === null ? (
        <p>Chargement…</p>
      ) : membres.length === 0 ? (
        <p>Aucun membre pour le moment.</p>
      ) : (
        <div className="carte" style={{ marginBottom: 28 }}>
          <table className="tableau">
            <thead>
              <tr>
                <th>Nom</th>
                <th>E-mail</th>
                <th>Rôle</th>
                <th>Service</th>
                <th>Attribué par</th>
                <th>Dernière connexion</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {membres.map((membre) => (
                <tr key={membre.id}>
                  <td className="titre-ligne">{membre.nom ?? "—"}</td>
                  <td>{membre.email}</td>
                  <td>
                    <select
                      value={membre.role ?? ""}
                      onChange={(e) => changerRole(membre.id, e.target.value)}
                    >
                      <option value="">Aucun rôle</option>
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {LIBELLES_ROLE[role]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={membre.serviceId ?? ""}
                      onChange={(e) => changerService(membre.id, e.target.value)}
                    >
                      <option value="">—</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>{s.nom}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {membre.roleAttribuePar ? (
                      <>
                        {membre.roleAttribuePar}
                        {membre.roleAttribueLe ? (
                          <><br /><span style={{ fontSize: 11.5, color: "var(--texte-doux)" }}>{formaterDateHeure(membre.roleAttribueLe)}</span></>
                        ) : null}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {membre.jamaisConnecte
                      ? "Jamais connecté"
                      : formaterDateHeure(membre.derniereConnexion!)}
                  </td>
                  <td>{membre.desactive ? "Désactivé" : "Actif"}</td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      className="bouton secondaire"
                      onClick={() => changerActivation(membre)}
                    >
                      {membre.desactive ? "Réactiver" : "Désactiver"}
                    </button>
                    <button
                      type="button"
                      className="bouton secondaire"
                      onClick={() => supprimerCompte(membre)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 style={{ marginBottom: 12 }}>Activité récente de l&apos;équipe</h2>
      {erreurActivite ? <div className="message attention">{erreurActivite}</div> : null}
      {activite === null ? (
        <p>Chargement…</p>
      ) : activite.length === 0 && !erreurActivite ? (
        <p>Aucune activité enregistrée pour le moment.</p>
      ) : activite.length > 0 ? (
        <div className="carte">
          <table className="tableau">
            <thead>
              <tr>
                <th>Membre</th>
                <th>Action</th>
                <th>Contenu</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {activite.map((entree) => (
                <tr key={entree.id}>
                  <td className="titre-ligne">{entree.acteurNom}</td>
                  <td>
                    {LIBELLES_ACTION[entree.action] ?? entree.action} — {entree.table_cible}
                  </td>
                  <td>{entree.titre ?? "—"}</td>
                  <td>{formaterDateHeure(entree.cree_le)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}
