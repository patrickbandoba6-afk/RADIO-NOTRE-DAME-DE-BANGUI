"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Coquille } from "@/components/Coquille";
import { LIBELLES_ROLE, type RoleInterne } from "@/lib/session";

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

const LIBELLES_PRIORITE = {
  basse: "Basse",
  normale: "Normale",
  haute: "Haute",
  urgente: "Urgente",
} as const;

interface Membre {
  id: string;
  email: string;
  nom: string | null;
  role: RoleInterne | null;
  serviceNom: string | null;
  desactive: boolean;
}

interface ServiceItem {
  id: string;
  nom: string;
}

function genererMotDePasse(): string {
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let mot = "";
  for (let i = 0; i < 8; i += 1) mot += caracteres[Math.floor(Math.random() * caracteres.length)];
  return mot;
}

export default function PageDispatcher() {
  return (
    <Coquille permissionRequise="users.create">
      <Dispatcher />
    </Coquille>
  );
}

function Dispatcher() {
  const [membres, setMembres] = useState<Membre[] | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [identifiantsCrees, setIdentifiantsCrees] = useState<{ email: string; motDePasse: string } | null>(null);
  const [enCours, setEnCours] = useState(false);

  const [nouvelEmploye, setNouvelEmploye] = useState(true);
  const [assigneA, setAssigneA] = useState("");
  const [email, setEmail] = useState("");
  const [nom, setNom] = useState("");
  const [motDePasse, setMotDePasse] = useState(genererMotDePasse);
  const [role, setRole] = useState<RoleInterne>("editeur");
  const [serviceId, setServiceId] = useState("");

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [priorite, setPriorite] = useState("normale");
  const [dateLimite, setDateLimite] = useState("");
  const [avecTache, setAvecTache] = useState(true);

  async function charger() {
    const reponse = await fetch("/api/equipe");
    const donnees = await reponse.json();
    if (!reponse.ok) {
      setErreur(donnees.erreur ?? "Impossible de charger l'équipe.");
      return;
    }
    setMembres(donnees.membres);
    setServices(donnees.services ?? []);
  }

  useEffect(() => {
    charger();
  }, []);

  async function valider(evenement: React.FormEvent) {
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
            email: email.trim(),
            motDePasse,
            nom: nom.trim() || undefined,
            role,
            serviceId: serviceId || undefined,
          }),
        });
        const donneesCompte = await reponseCompte.json();
        if (!reponseCompte.ok) throw new Error(donneesCompte.erreur ?? "Échec de la création du compte.");
        idResponsable = donneesCompte.userId;
        setIdentifiantsCrees({ email: email.trim(), motDePasse });
      }

      if (avecTache) {
        if (!titre.trim() || !idResponsable) {
          throw new Error("Titre de la tâche et employé responsable requis.");
        }
        const reponseTache = await fetch("/api/taches", {
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
        const donneesTache = await reponseTache.json();
        if (!reponseTache.ok) throw new Error(donneesTache.erreur ?? "Échec de l'attribution de la tâche.");
      }

      setEmail("");
      setNom("");
      setMotDePasse(genererMotDePasse());
      setAssigneA("");
      setTitre("");
      setDescription("");
      setDateLimite("");
      await charger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Échec de l'opération.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <>
      <div className="entete-page">
        <div>
          <h1>Dispatcher</h1>
          <p>
            Créez le compte d&apos;un employé et attribuez-lui directement sa première tâche — en
            une seule étape. Réservé à Direction et Super administrateur.
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

      <div className="carte carte-corps" style={{ marginBottom: 24 }}>
        <div className="liens-connexion" style={{ flexDirection: "row", justifyContent: "flex-start", gap: 16, marginBottom: 14 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <input type="radio" checked={nouvelEmploye} onChange={() => setNouvelEmploye(true)} />
            Nouvel employé (créer son compte)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <input type="radio" checked={!nouvelEmploye} onChange={() => setNouvelEmploye(false)} />
            Employé existant
          </label>
        </div>

        <form onSubmit={valider} className="formulaire">
          {nouvelEmploye ? (
            <>
              <div className="champ">
                <label htmlFor="d-email">E-mail (ou identifiant inventé) <span className="requis">*</span></label>
                <input id="d-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="champ">
                <label htmlFor="d-nom">Nom <span className="requis">*</span></label>
                <input id="d-nom" type="text" required value={nom} onChange={(e) => setNom(e.target.value)} />
              </div>
              <div className="champ">
                <label htmlFor="d-motdepasse">Mot de passe <span className="requis">*</span></label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input id="d-motdepasse" type="text" required minLength={6} value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} style={{ fontFamily: "monospace" }} />
                  <button type="button" className="bouton secondaire" onClick={() => setMotDePasse(genererMotDePasse())}>Générer</button>
                </div>
              </div>
              <div className="champ">
                <label htmlFor="d-role">Rôle <span className="requis">*</span></label>
                <select id="d-role" value={role} onChange={(e) => setRole(e.target.value as RoleInterne)}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{LIBELLES_ROLE[r]}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div className="champ">
              <label htmlFor="d-assigne">Employé <span className="requis">*</span></label>
              <select id="d-assigne" required value={assigneA} onChange={(e) => setAssigneA(e.target.value)}>
                <option value="">— Choisir —</option>
                {(membres ?? []).map((m) => (
                  <option key={m.id} value={m.id}>{m.nom ?? m.email}</option>
                ))}
              </select>
            </div>
          )}

          <div className="champ">
            <label htmlFor="d-service">Service</label>
            <select id="d-service" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              <option value="">—</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.nom}</option>
              ))}
            </select>
          </div>

          <div className="champ large" style={{ borderTop: "1px solid var(--bordure)", paddingTop: 14, marginTop: 4 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}>
              <input type="checkbox" checked={avecTache} onChange={(e) => setAvecTache(e.target.checked)} />
              Lui attribuer une tâche maintenant
            </label>
          </div>

          {avecTache ? (
            <>
              <div className="champ large">
                <label htmlFor="d-titre">Titre de la tâche <span className="requis">*</span></label>
                <input id="d-titre" type="text" required={avecTache} value={titre} onChange={(e) => setTitre(e.target.value)} />
              </div>
              <div className="champ large">
                <label htmlFor="d-description">Description</label>
                <input id="d-description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="champ">
                <label htmlFor="d-priorite">Priorité</label>
                <select id="d-priorite" value={priorite} onChange={(e) => setPriorite(e.target.value)}>
                  {Object.entries(LIBELLES_PRIORITE).map(([valeur, libelle]) => (
                    <option key={valeur} value={valeur}>{libelle}</option>
                  ))}
                </select>
              </div>
              <div className="champ">
                <label htmlFor="d-echeance">Date limite</label>
                <input id="d-echeance" type="datetime-local" value={dateLimite} onChange={(e) => setDateLimite(e.target.value)} />
              </div>
            </>
          ) : null}

          <div className="champ" style={{ justifyContent: "flex-end" }}>
            <button type="submit" className="bouton" disabled={enCours}>
              {enCours
                ? "Envoi…"
                : nouvelEmploye && avecTache
                ? "Créer le compte et attribuer la tâche"
                : nouvelEmploye
                ? "Créer le compte"
                : "Attribuer la tâche"}
            </button>
          </div>
        </form>
      </div>

      <h2 style={{ marginBottom: 12 }}>Équipe</h2>
      {membres === null ? (
        <p>Chargement…</p>
      ) : membres.length === 0 ? (
        <p>Aucun membre pour le moment.</p>
      ) : (
        <div className="carte" style={{ marginBottom: 12 }}>
          <table className="tableau">
            <thead>
              <tr>
                <th>Nom</th>
                <th>E-mail</th>
                <th>Rôle</th>
                <th>Service</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {membres.map((m) => (
                <tr key={m.id}>
                  <td className="titre-ligne">{m.nom ?? "—"}</td>
                  <td>{m.email}</td>
                  <td>{m.role ? LIBELLES_ROLE[m.role] : "Aucun rôle"}</td>
                  <td>{m.serviceNom ?? "—"}</td>
                  <td>{m.desactive ? "Désactivé" : "Actif"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p style={{ fontSize: 12.5 }}>
        <Link href="/equipe" className="lien-texte">Gérer les rôles, services et désactiver un compte →</Link>
      </p>
    </>
  );
}
