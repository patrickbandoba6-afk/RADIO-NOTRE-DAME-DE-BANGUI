"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ChampFichier } from "@/components/ChampFichier";
import { Coquille } from "@/components/Coquille";
import { schemaParCle, type Champ, type SchemaContenu } from "@/lib/schemas";
import { supabase } from "@/lib/supabase";

type Valeurs = Record<string, any>;

export default function PageFormulaire() {
  const params = useParams<{ type: string; id: string }>();
  const schema = schemaParCle(params.type);

  return (
    <Coquille>
      {schema ? (
        <Formulaire schema={schema} id={params.id} />
      ) : (
        <div className="etat-vide">
          <span className="emoji">🤔</span>
          <h3>Rubrique inconnue</h3>
          <Link href="/" className="bouton">
            Retour au tableau de bord
          </Link>
        </div>
      )}
    </Coquille>
  );
}

/** Convertit une valeur de la base vers la valeur affichée dans le formulaire. */
function versFormulaire(champ: Champ, valeur: any): any {
  if (valeur === null || valeur === undefined) {
    return champ.defaut ?? (champ.type === "booleen" ? false : "");
  }
  if (champ.type === "datetime") return String(valeur).slice(0, 16);
  if (champ.type === "date") return String(valeur).slice(0, 10);
  if (champ.type === "heure") return String(valeur).slice(0, 5);
  if (champ.type === "liste") return Array.isArray(valeur) ? valeur.join(", ") : String(valeur);
  if (champ.type === "texte_long" && typeof valeur === "object") {
    return JSON.stringify(valeur, null, 2);
  }
  if (champ.type === "select") return String(valeur);
  return valeur;
}

/** Convertit la valeur du formulaire vers le format attendu par la base. */
function versBase(champ: Champ, valeur: any): any {
  if (champ.type === "booleen") return Boolean(valeur);

  if (valeur === "" || valeur === undefined || valeur === null) return null;

  if (champ.type === "nombre") {
    const nombre = Number(valeur);
    return Number.isNaN(nombre) ? null : nombre;
  }
  if (champ.type === "liste") {
    return String(valeur)
      .split(",")
      .map((element) => element.trim())
      .filter(Boolean);
  }
  if (champ.type === "texte_long") {
    const texte = String(valeur).trim();
    // Les champs structurés (évangile, programme, horaires) sont du JSON.
    if (
      (texte.startsWith("{") && texte.endsWith("}")) ||
      (texte.startsWith("[") && texte.endsWith("]"))
    ) {
      try {
        return JSON.parse(texte);
      } catch {
        return texte;
      }
    }
    return texte;
  }
  if (champ.type === "select" && champ.nom === "jour_semaine") return Number(valeur);
  return valeur;
}

function creerSlug(titre: string): string {
  return titre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function Formulaire({ schema, id }: { schema: SchemaContenu; id: string }) {
  const router = useRouter();
  const estNouveau = id === "nouveau";

  const [valeurs, setValeurs] = useState<Valeurs>({});
  const [relations, setRelations] = useState<Record<string, { id: string; libelle: string }[]>>({});
  const [chargement, setChargement] = useState(!estNouveau);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);

  // Valeurs par défaut à la création.
  useEffect(() => {
    if (!estNouveau) return;
    const initiales: Valeurs = {};
    for (const champ of schema.champs) {
      if (champ.defaut !== undefined) initiales[champ.nom] = champ.defaut;
      else if (champ.type === "booleen") initiales[champ.nom] = false;
      else initiales[champ.nom] = "";

      if (champ.type === "datetime" && champ.requis) {
        initiales[champ.nom] = new Date().toISOString().slice(0, 16);
      }
      if (champ.type === "date" && champ.requis) {
        initiales[champ.nom] = new Date().toISOString().slice(0, 10);
      }
    }
    setValeurs(initiales);
  }, [estNouveau, schema]);

  // Chargement de l'enregistrement existant.
  useEffect(() => {
    if (estNouveau || !supabase) return;
    (async () => {
      const { data, error } = await supabase!
        .from(schema.table)
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        setErreur("Contenu introuvable.");
      } else {
        const chargees: Valeurs = {};
        for (const champ of schema.champs) {
          chargees[champ.nom] = versFormulaire(champ, data[champ.nom]);
        }
        setValeurs(chargees);
      }
      setChargement(false);
    })();
  }, [estNouveau, id, schema]);

  // Chargement des listes déroulantes liées (émissions, catégories…).
  useEffect(() => {
    if (!supabase) return;
    const champsRelation = schema.champs.filter((champ) => champ.type === "relation");
    if (champsRelation.length === 0) return;

    (async () => {
      const resultat: Record<string, { id: string; libelle: string }[]> = {};
      for (const champ of champsRelation) {
        const { data } = await supabase!
          .from(champ.table!)
          .select(`id, ${champ.colonneAffichee}`)
          .limit(200);
        resultat[champ.nom] = (data ?? []).map((ligne: any) => ({
          id: ligne.id,
          libelle: ligne[champ.colonneAffichee!] ?? ligne.id,
        }));
      }
      setRelations(resultat);
    })();
  }, [schema]);

  const definir = useCallback((nom: string, valeur: any) => {
    setValeurs((precedent) => {
      const suivant = { ...precedent, [nom]: valeur };
      // Génération automatique du slug depuis le titre.
      if (nom === "titre" && "slug" in precedent && !precedent.slug) {
        suivant.slug = creerSlug(String(valeur));
      }
      return suivant;
    });
  }, []);

  async function enregistrer(evenement: React.FormEvent) {
    evenement.preventDefault();
    if (!supabase) return;

    setEnregistrement(true);
    setErreur(null);
    setSucces(null);

    const charge: Valeurs = {};
    for (const champ of schema.champs) {
      charge[champ.nom] = versBase(champ, valeurs[champ.nom]);
    }

    const { data, error } = estNouveau
      ? await supabase.from(schema.table).insert(charge).select("id").maybeSingle()
      : await supabase.from(schema.table).update(charge).eq("id", id).select("id").maybeSingle();

    setEnregistrement(false);

    if (error) {
      setErreur(
        error.message.includes("row-level security")
          ? "Enregistrement refusé : votre compte n'a pas de rôle interne dans la table « profils »."
          : error.message
      );
      return;
    }

    setSucces("Contenu enregistré.");
    if (estNouveau && data?.id) {
      router.replace(`/contenu/${schema.cle}/${data.id}`);
    }
  }

  if (chargement) return <div className="chargement">Chargement…</div>;

  return (
    <>
      <div className="entete-page">
        <div>
          <h1>
            {schema.icone}{" "}
            {estNouveau
              ? `Nouveau${schema.librelleSingulier.match(/^[aeiouéè]/) ? "l" : ""} ${schema.librelleSingulier}`
              : `Modifier — ${valeurs.titre || valeurs.nom || schema.librelleSingulier}`}
          </h1>
          <p>{schema.description}</p>
        </div>
        <Link href={`/contenu/${schema.cle}`} className="bouton secondaire">
          ← Retour à la liste
        </Link>
      </div>

      {erreur ? <div className="message erreur">{erreur}</div> : null}
      {succes ? <div className="message succes">{succes}</div> : null}

      <form onSubmit={enregistrer}>
        <div className="carte carte-corps">
          <div className="formulaire">
            {schema.champs.map((champ) => (
              <ChampSaisie
                key={champ.nom}
                champ={champ}
                valeur={valeurs[champ.nom]}
                onChanger={(valeur) => definir(champ.nom, valeur)}
                options={relations[champ.nom]}
                dossier={schema.cle}
              />
            ))}
          </div>

          <div className="barre-actions">
            <Link href={`/contenu/${schema.cle}`} className="bouton secondaire a-gauche">
              Annuler
            </Link>
            <button type="submit" className="bouton" disabled={enregistrement}>
              {enregistrement ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

function ChampSaisie({
  champ,
  valeur,
  onChanger,
  options,
  dossier,
}: {
  champ: Champ;
  valeur: any;
  onChanger: (valeur: any) => void;
  options?: { id: string; libelle: string }[];
  dossier: string;
}) {
  const identifiant = `champ-${champ.nom}`;
  const classe = `champ${champ.pleineLargeur || champ.type === "texte_long" ? " large" : ""}`;

  const etiquette = (
    <label htmlFor={identifiant}>
      {champ.libelle}
      {champ.requis ? <span className="requis"> *</span> : null}
    </label>
  );
  const aide = champ.aide ? <span className="aide">{champ.aide}</span> : null;

  if (champ.type === "booleen") {
    return (
      <div className={classe}>
        <div className="interrupteur">
          <input
            id={identifiant}
            type="checkbox"
            checked={Boolean(valeur)}
            onChange={(e) => onChanger(e.target.checked)}
          />
          <span>{champ.libelle}</span>
        </div>
        {aide}
      </div>
    );
  }

  if (champ.type === "image" || champ.type === "fichier") {
    return (
      <div className={classe}>
        {etiquette}
        <ChampFichier
          valeur={String(valeur ?? "")}
          onChanger={onChanger}
          dossier={dossier}
          apercuImage={champ.type === "image"}
        />
        {aide}
      </div>
    );
  }

  if (champ.type === "select") {
    return (
      <div className={classe}>
        {etiquette}
        <select
          id={identifiant}
          value={String(valeur ?? "")}
          onChange={(e) => onChanger(e.target.value)}
          required={champ.requis}
        >
          <option value="">— Choisir —</option>
          {champ.options?.map((option) => (
            <option key={option.valeur} value={option.valeur}>
              {option.libelle}
            </option>
          ))}
        </select>
        {aide}
      </div>
    );
  }

  if (champ.type === "relation") {
    return (
      <div className={classe}>
        {etiquette}
        <select
          id={identifiant}
          value={String(valeur ?? "")}
          onChange={(e) => onChanger(e.target.value)}
          required={champ.requis}
        >
          <option value="">— Choisir —</option>
          {(options ?? []).map((option) => (
            <option key={option.id} value={option.id}>
              {option.libelle}
            </option>
          ))}
        </select>
        {aide}
      </div>
    );
  }

  if (champ.type === "texte_long") {
    const estContenuLong = champ.nom === "contenu" || champ.nom === "texte";
    return (
      <div className={classe}>
        {etiquette}
        <textarea
          id={identifiant}
          className={estContenuLong ? "grand" : undefined}
          value={String(valeur ?? "")}
          onChange={(e) => onChanger(e.target.value)}
          required={champ.requis}
        />
        {aide}
      </div>
    );
  }

  const typesHtml: Record<string, string> = {
    texte: "text",
    nombre: "number",
    date: "date",
    datetime: "datetime-local",
    heure: "time",
    liste: "text",
  };

  return (
    <div className={classe}>
      {etiquette}
      <input
        id={identifiant}
        type={typesHtml[champ.type] ?? "text"}
        value={String(valeur ?? "")}
        onChange={(e) => onChanger(e.target.value)}
        required={champ.requis}
      />
      {aide}
    </div>
  );
}
