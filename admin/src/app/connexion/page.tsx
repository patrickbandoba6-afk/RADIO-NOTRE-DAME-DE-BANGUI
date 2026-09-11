"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase, supabaseEstConfigure } from "@/lib/supabase";

export default function PageConnexion() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function seConnecter(evenement: React.FormEvent) {
    evenement.preventDefault();
    if (!supabase) return;

    setEnCours(true);
    setErreur(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: motDePasse,
    });
    setEnCours(false);

    if (error) {
      setErreur(
        error.message === "Invalid login credentials"
          ? "Adresse e-mail ou mot de passe incorrect."
          : error.message
      );
      return;
    }
    router.replace("/");
  }

  return (
    <div className="page-connexion">
      <div className="boite-connexion">
        <div className="marque">
          <div className="logo">RND</div>
          <h1>Radio Notre-Dame de Bangui</h1>
          <p>Administration éditoriale · 103.3 FM</p>
        </div>

        {!supabaseEstConfigure ? (
          <div className="message attention">
            Supabase n&apos;est pas configuré. Renseignez <code>NEXT_PUBLIC_SUPABASE_URL</code> et{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> dans <code>admin/.env.local</code>.
          </div>
        ) : (
          <form onSubmit={seConnecter}>
            {erreur ? <div className="message erreur">{erreur}</div> : null}

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

            <div className="champ">
              <label htmlFor="motdepasse">Mot de passe</label>
              <input
                id="motdepasse"
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button className="bouton" type="submit" disabled={enCours}>
              {enCours ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
