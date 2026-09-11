"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Coquille } from "@/components/Coquille";
import { LIBELLES_ROLE, useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export default function PageProfil() {
  return (
    <Coquille>
      <MonProfil />
    </Coquille>
  );
}

function MonProfil() {
  const { session } = useSession();
  const inputFichier = useRef<HTMLInputElement>(null);

  const [nom, setNom] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [televersement, setTeleversement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    setNom(session.nom ?? "");
    supabase?.auth.getUser().then(({ data }) => {
      setPhotoUrl((data.user?.user_metadata?.avatar_url as string | undefined) ?? null);
    });
  }, [session]);

  if (!session) return <p>Chargement…</p>;

  async function changerPhoto(evenement: React.ChangeEvent<HTMLInputElement>) {
    const fichier = evenement.target.files?.[0];
    if (!fichier || !supabase || !session) return;
    setErreur(null);
    setSucces(null);
    setTeleversement(true);
    try {
      const chemin = `${session.utilisateurId}/avatar.jpg`;
      const { error: erreurEnvoi } = await supabase.storage
        .from("avatars")
        .upload(chemin, fichier, { contentType: fichier.type || "image/jpeg", upsert: true });
      if (erreurEnvoi) throw erreurEnvoi;

      const { data } = supabase.storage.from("avatars").getPublicUrl(chemin);
      const urlAvecCache = `${data.publicUrl}?t=${Date.now()}`;
      const { error: erreurMaj } = await supabase.auth.updateUser({ data: { avatar_url: urlAvecCache } });
      if (erreurMaj) throw erreurMaj;
      setPhotoUrl(urlAvecCache);
      setSucces("Photo de profil mise à jour.");
    } catch (e) {
      setErreur(
        e instanceof Error
          ? e.message
          : "Échec de l'envoi. Vérifiez que le bucket 'avatars' est configuré (supabase/schema_avatars.sql)."
      );
    } finally {
      setTeleversement(false);
      if (inputFichier.current) inputFichier.current.value = "";
    }
  }

  async function enregistrerNom(evenement: React.FormEvent) {
    evenement.preventDefault();
    if (!nom.trim() || !supabase || !session) return;
    setErreur(null);
    setSucces(null);
    setEnregistrement(true);
    try {
      const { error: erreurAuth } = await supabase.auth.updateUser({ data: { nom: nom.trim() } });
      if (erreurAuth) throw erreurAuth;
      const { error: erreurProfil } = await supabase
        .from("profils")
        .update({ nom: nom.trim() })
        .eq("id", session.utilisateurId);
      if (erreurProfil) throw erreurProfil;
      setSucces("Profil mis à jour.");
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Échec de la mise à jour.");
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <>
      <div className="entete-page">
        <div>
          <h1>Mon profil</h1>
          <p>Votre nom et votre photo apparaissent dans l&apos;équipe, les tâches et le journal d&apos;activité.</p>
        </div>
      </div>

      {erreur ? <div className="message erreur">{erreur}</div> : null}
      {succes ? <div className="message succes">{succes}</div> : null}

      <div className="carte carte-corps" style={{ maxWidth: 480 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
          <div
            style={{
              position: "relative",
              width: 84,
              height: 84,
              borderRadius: "50%",
              overflow: "hidden",
              background: "var(--bleu-clair)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {photoUrl ? (
              <Image src={photoUrl} alt="" fill sizes="84px" style={{ objectFit: "cover" }} unoptimized />
            ) : (
              <span style={{ fontSize: 28, fontWeight: 700, color: "var(--bleu-fonce)" }}>
                {(session.nom ?? session.email).slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <button
              type="button"
              className="bouton secondaire"
              onClick={() => inputFichier.current?.click()}
              disabled={televersement}
            >
              {televersement ? "Envoi…" : "Changer la photo"}
            </button>
            <input
              ref={inputFichier}
              type="file"
              accept="image/*"
              hidden
              onChange={changerPhoto}
            />
          </div>
        </div>

        <form onSubmit={enregistrerNom} className="formulaire">
          <div className="champ large">
            <label htmlFor="nom-profil">Nom</label>
            <input id="nom-profil" type="text" value={nom} onChange={(e) => setNom(e.target.value)} required />
          </div>
          <div className="champ large">
            <label htmlFor="email-profil">E-mail</label>
            <input id="email-profil" type="text" value={session.email} disabled />
          </div>
          <div className="champ large">
            <label htmlFor="role-profil">Rôle</label>
            <input id="role-profil" type="text" value={session.role ? LIBELLES_ROLE[session.role] : "Aucun"} disabled />
          </div>
          <div className="champ" style={{ justifyContent: "flex-end" }}>
            <button type="submit" className="bouton" disabled={enregistrement}>
              {enregistrement ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
