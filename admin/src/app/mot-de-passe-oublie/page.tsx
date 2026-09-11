"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase, supabaseEstConfigure } from "@/lib/supabase";

export default function PageMotDePasseOublie() {
  const [email, setEmail] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function envoyer(evenement: React.FormEvent) {
    evenement.preventDefault();
    if (!supabase) return;

    setEnCours(true);
    setErreur(null);
    setSucces(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
    });
    setEnCours(false);

    if (error) {
      setErreur(error.message);
      return;
    }
    setSucces("Si cette adresse existe, un e-mail avec un lien de réinitialisation vient d'être envoyé.");
  }

  return (
    <div className="page-connexion">
      <div className="boite-connexion">
        <div className="marque">
          <div className="logo">RND</div>
          <h1>Mot de passe oublié</h1>
          <p>Recevez un lien pour choisir un nouveau mot de passe.</p>
        </div>

        {!supabaseEstConfigure ? (
          <div className="message attention">Supabase n&apos;est pas configuré.</div>
        ) : (
          <>
            {erreur ? <div className="message erreur">{erreur}</div> : null}
            {succes ? <div className="message succes">{succes}</div> : null}

            <form onSubmit={envoyer}>
              <div className="champ">
                <label htmlFor="email">Adresse e-mail</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <button className="bouton" type="submit" disabled={enCours}>
                {enCours ? "Envoi…" : "Envoyer le lien"}
              </button>
            </form>

            <div className="liens-connexion">
              <Link href="/connexion" className="lien-texte">
                Retour à la connexion
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
