"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase, supabaseEstConfigure } from "@/lib/supabase";

export default function PageReinitialiserMotDePasse() {
  const router = useRouter();
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);
  const [enCours, setEnCours] = useState(false);

  async function valider(evenement: React.FormEvent) {
    evenement.preventDefault();
    if (!supabase) return;

    if (motDePasse.length < 6) {
      setErreur("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (motDePasse !== confirmation) {
      setErreur("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setEnCours(true);
    setErreur(null);
    const { error } = await supabase.auth.updateUser({ password: motDePasse });
    setEnCours(false);

    if (error) {
      setErreur(
        error.message.includes("session")
          ? "Le lien a expiré ou est invalide. Redemandez un e-mail de réinitialisation."
          : error.message
      );
      return;
    }
    setSucces(true);
    setTimeout(() => router.replace("/"), 1500);
  }

  return (
    <div className="page-connexion">
      <div className="boite-connexion">
        <div className="marque">
          <div className="logo">RND</div>
          <h1>Nouveau mot de passe</h1>
          <p>Choisissez un nouveau mot de passe pour votre compte.</p>
        </div>

        {!supabaseEstConfigure ? (
          <div className="message attention">Supabase n&apos;est pas configuré.</div>
        ) : succes ? (
          <div className="message succes">Mot de passe mis à jour. Redirection…</div>
        ) : (
          <>
            {erreur ? <div className="message erreur">{erreur}</div> : null}
            <form onSubmit={valider}>
              <div className="champ">
                <label htmlFor="motdepasse">Nouveau mot de passe</label>
                <input
                  id="motdepasse"
                  type="password"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
              <div className="champ">
                <label htmlFor="confirmation">Confirmer le mot de passe</label>
                <input
                  id="confirmation"
                  type="password"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
              <button className="bouton" type="submit" disabled={enCours}>
                {enCours ? "Enregistrement…" : "Enregistrer"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
