"use client";

import { useRef, useState } from "react";
import { televerserFichier } from "@/lib/supabase";

/**
 * Champ d'upload : envoie le fichier dans le bucket public `contenu-images`
 * de Supabase Storage et stocke l'URL publique dans le champ.
 */
export function ChampFichier({
  valeur,
  onChanger,
  dossier,
  apercuImage,
}: {
  valeur: string;
  onChanger: (url: string) => void;
  dossier: string;
  apercuImage: boolean;
}) {
  const reference = useRef<HTMLInputElement>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function surSelection(evenement: React.ChangeEvent<HTMLInputElement>) {
    const fichier = evenement.target.files?.[0];
    if (!fichier) return;

    setEnCours(true);
    setErreur(null);
    try {
      const url = await televerserFichier(fichier, dossier);
      onChanger(url);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Échec du téléversement.";
      setErreur(
        message.includes("Bucket not found")
          ? "Le bucket « contenu-images » n'existe pas. Exécutez schema_editorial.sql dans Supabase."
          : message
      );
    } finally {
      setEnCours(false);
      if (reference.current) reference.current.value = "";
    }
  }

  return (
    <div className="zone-image">
      {valeur && apercuImage ? (
        <img src={valeur} alt="Aperçu" />
      ) : valeur ? (
        <p style={{ margin: "0 0 12px", fontSize: 13, wordBreak: "break-all" }}>{valeur}</p>
      ) : (
        <p style={{ margin: "0 0 12px", color: "var(--texte-doux)", fontSize: 13 }}>
          {apercuImage ? "Aucune image" : "Aucun fichier"}
        </p>
      )}

      {erreur ? (
        <div className="message erreur" style={{ textAlign: "left" }}>
          {erreur}
        </div>
      ) : null}

      <div className="actions">
        <button
          type="button"
          className="bouton secondaire"
          onClick={() => reference.current?.click()}
          disabled={enCours}
        >
          {enCours ? "Téléversement…" : valeur ? "Remplacer" : "Choisir un fichier"}
        </button>
        {valeur ? (
          <button type="button" className="bouton danger" onClick={() => onChanger("")}>
            Retirer
          </button>
        ) : null}
      </div>

      <input
        ref={reference}
        type="file"
        accept={apercuImage ? "image/*" : "image/*,audio/*,video/*,application/pdf"}
        onChange={surSelection}
      />

      <input
        type="text"
        value={valeur}
        onChange={(e) => onChanger(e.target.value)}
        placeholder="…ou collez directement une URL"
        style={{ marginTop: 12, fontSize: 13 }}
      />
    </div>
  );
}
