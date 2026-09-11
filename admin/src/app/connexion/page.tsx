"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase, supabaseEstConfigure } from "@/lib/supabase";

export default function PageConnexion() {
  const router = useRouter();
  const [mode, setMode] = useState<"connexion" | "inscription">("connexion");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function valider(evenement: React.FormEvent) {
    evenement.preventDefault();
    if (!supabase) return;

    setEnCours(true);
    setErreur(null);
    setSucces(null);

    if (mode === "inscription") {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: motDePasse,
        options: { data: { nom: nom.trim() || undefined } },
      });
      setEnCours(false);
      if (error) {
        setErreur(error.message);
        return;
      }
      setSucces(
        "Compte créé. Un super administrateur doit maintenant vous attribuer un rôle (page Équipe & rôles) avant que vous puissiez accéder au back-office."
      );
      setMode("connexion");
      return;
    }

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
          <>
            {erreur ? <div className="message erreur">{erreur}</div> : null}
            {succes ? <div className="message succes">{succes}</div> : null}

            <form onSubmit={valider}>
              {mode === "inscription" ? (
                <div className="champ">
                  <label htmlFor="nom">Nom</label>
                  <input
                    id="nom"
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              ) : null}

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
                  autoComplete={mode === "inscription" ? "new-password" : "current-password"}
                  minLength={6}
                  required
                />
              </div>

              <button className="bouton" type="submit" disabled={enCours}>
                {enCours
                  ? mode === "inscription"
                    ? "Inscription…"
                    : "Connexion…"
                  : mode === "inscription"
                  ? "S'inscrire"
                  : "Se connecter"}
              </button>
            </form>

            <div className="liens-connexion">
              <button
                type="button"
                className="lien-texte"
                onClick={() => {
                  setMode(mode === "inscription" ? "connexion" : "inscription");
                  setErreur(null);
                  setSucces(null);
                }}
              >
                {mode === "inscription" ? "Déjà inscrit ? Se connecter" : "Pas encore de compte ? S'inscrire"}
              </button>
              {mode === "connexion" ? (
                <Link href="/mot-de-passe-oublie" className="lien-texte">
                  Mot de passe oublié ?
                </Link>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
