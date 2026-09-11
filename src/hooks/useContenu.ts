import { useCallback, useEffect, useState } from "react";

interface EtatContenu<T> {
  donnees: T;
  chargement: boolean;
  erreur: boolean;
  recharger: () => void;
}

/**
 * Charge un contenu asynchrone (Supabase ou données d'exemple) en gérant
 * les états de chargement, d'erreur et le rafraîchissement.
 */
export function useContenu<T>(
  chargeur: () => Promise<T>,
  valeurInitiale: T,
  dependances: unknown[] = []
): EtatContenu<T> {
  const [donnees, setDonnees] = useState<T>(valeurInitiale);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);
  const [compteur, setCompteur] = useState(0);

  useEffect(() => {
    let annule = false;
    setChargement(true);
    setErreur(false);
    chargeur()
      .then((resultat) => {
        if (!annule) setDonnees(resultat);
      })
      .catch(() => {
        if (!annule) setErreur(true);
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });
    return () => {
      annule = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compteur, ...dependances]);

  const recharger = useCallback(() => setCompteur((c) => c + 1), []);

  return { donnees, chargement, erreur, recharger };
}
