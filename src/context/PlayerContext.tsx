import {
  createAudioPlayer,
  setAudioModeAsync,
  useAudioPlayerStatus,
  type AudioPlayer,
} from "expo-audio";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { config, fluxDisponibles } from "@/lib/config";
import {
  libelleEnCours,
  recupererEtatServeur,
  type EtatServeurRadio,
} from "@/lib/radioMetadata";
import type { PisteEnCours, QualiteAudio } from "@/types";

interface PlayerContextValeur {
  pisteActuelle: PisteEnCours | null;
  enLecture: boolean;
  enMemoireTampon: boolean;
  enReconnexion: boolean;
  erreur: string | null;
  positionSecondes: number;
  dureeSecondes: number;
  estDirect: boolean;
  qualiteAudio: QualiteAudio;
  minuteurSommeilMinutes: number | null;
  vitesseLecture: number;
  /** Titre transmis par la régie (métadonnée ICY), sinon libellé de repli. */
  titreEnCours: string;
  etatServeur: EtatServeurRadio | null;
  lireDirect: () => void;
  lirePiste: (piste: PisteEnCours) => void;
  mettreEnPause: () => void;
  reprendre: () => void;
  basculerLectureDirect: () => void;
  allerA: (secondes: number) => void;
  definirVitesse: (vitesse: number) => void;
  definirQualiteAudio: (qualite: QualiteAudio) => void;
  definirMinuteurSommeil: (minutes: number | null) => void;
}

const PlayerContext = createContext<PlayerContextValeur | null>(null);

const PISTE_DIRECT: PisteEnCours = {
  type: "direct",
  id: "direct",
  titre: config.nomOfficiel,
  sousTitre: `${config.frequence} · ${config.ville}`,
  imageUrl: "https://picsum.photos/seed/rndb-direct/800/800",
  audioUrl: config.radioStreamUrl,
};

const NB_MAX_TENTATIVES_RECONNEXION = 6;
const INTERVALLE_METADONNEES_MS = 20000;

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const playerRef = useRef<AudioPlayer | null>(null);
  if (playerRef.current === null) {
    playerRef.current = createAudioPlayer(null, { updateInterval: 1000 });
  }
  const player = playerRef.current;
  const status = useAudioPlayerStatus(player);

  const [pisteActuelle, setPisteActuelle] = useState<PisteEnCours | null>(null);
  const [enReconnexion, setEnReconnexion] = useState(false);
  const [qualiteAudio, setQualiteAudio] = useState<QualiteAudio>("standard");
  const [minuteurSommeilMinutes, setMinuteurSommeilMinutesState] = useState<
    number | null
  >(null);
  const [etatServeur, setEtatServeur] = useState<EtatServeurRadio | null>(null);

  const tentativesReconnexion = useRef(0);
  const indexFlux = useRef(0);
  const minuteurSommeilRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    }).catch(() => {
      // Le mode audio n'a pas pu être configuré (ex: web) — lecture standard.
    });
  }, []);

  const mettreAJourMetadonneesEcranVerrouille = useCallback(
    (piste: PisteEnCours) => {
      player.setActiveForLockScreen(true, {
        title: piste.titre,
        artist: piste.sousTitre,
        artworkUrl: piste.imageUrl,
      });
    },
    [player]
  );

  const chargerEtLire = useCallback(
    (piste: PisteEnCours) => {
      tentativesReconnexion.current = 0;
      setPisteActuelle(piste);
      player.replace({ uri: piste.audioUrl });
      player.play();
      mettreAJourMetadonneesEcranVerrouille(piste);
    },
    [player, mettreAJourMetadonneesEcranVerrouille]
  );

  const lireDirect = useCallback(() => {
    indexFlux.current = 0;
    chargerEtLire({ ...PISTE_DIRECT, audioUrl: fluxDisponibles[0] ?? config.radioStreamUrl });
  }, [chargerEtLire]);

  const lirePiste = useCallback(
    (piste: PisteEnCours) => {
      chargerEtLire(piste);
    },
    [chargerEtLire]
  );

  const mettreEnPause = useCallback(() => {
    player.pause();
  }, [player]);

  const reprendre = useCallback(() => {
    if (!pisteActuelle) {
      lireDirect();
      return;
    }
    player.play();
  }, [player, pisteActuelle, lireDirect]);

  const basculerLectureDirect = useCallback(() => {
    if (pisteActuelle?.type === "direct" && status.playing) {
      mettreEnPause();
    } else if (pisteActuelle?.type === "direct") {
      reprendre();
    } else {
      lireDirect();
    }
  }, [pisteActuelle, status.playing, mettreEnPause, reprendre, lireDirect]);

  const allerA = useCallback(
    (secondes: number) => {
      player.seekTo(secondes).catch(() => {});
    },
    [player]
  );

  const definirVitesse = useCallback(
    (vitesse: number) => {
      player.setPlaybackRate(vitesse);
    },
    [player]
  );

  const definirMinuteurSommeil = useCallback(
    (minutes: number | null) => {
      if (minuteurSommeilRef.current) {
        clearTimeout(minuteurSommeilRef.current);
        minuteurSommeilRef.current = null;
      }
      setMinuteurSommeilMinutesState(minutes);
      if (minutes !== null) {
        minuteurSommeilRef.current = setTimeout(() => {
          player.pause();
          setMinuteurSommeilMinutesState(null);
        }, minutes * 60 * 1000);
      }
    },
    [player]
  );

  // Reconnexion automatique après une coupure réseau. Pour le direct, on
  // bascule sur le flux de secours une tentative sur deux lorsqu'il existe.
  useEffect(() => {
    if (!pisteActuelle) return;
    if (status.error && tentativesReconnexion.current < NB_MAX_TENTATIVES_RECONNEXION) {
      setEnReconnexion(true);
      tentativesReconnexion.current += 1;

      let uri = pisteActuelle.audioUrl;
      if (pisteActuelle.type === "direct" && fluxDisponibles.length > 1) {
        indexFlux.current = (indexFlux.current + 1) % fluxDisponibles.length;
        uri = fluxDisponibles[indexFlux.current];
      }

      const delai = Math.min(2000 * tentativesReconnexion.current, 15000);
      const identifiant = setTimeout(() => {
        player.replace({ uri });
        player.play();
      }, delai);
      return () => clearTimeout(identifiant);
    }
    if (!status.error && status.playing) {
      setEnReconnexion(false);
      tentativesReconnexion.current = 0;
    }
  }, [status.error, status.playing, pisteActuelle, player]);

  // Titre en cours : sondage régulier du serveur pendant le direct.
  useEffect(() => {
    if (pisteActuelle?.type !== "direct") {
      setEtatServeur(null);
      return;
    }
    const controleur = new AbortController();
    let identifiant: ReturnType<typeof setInterval> | null = null;

    const sonder = () => {
      recupererEtatServeur(controleur.signal).then(setEtatServeur);
    };
    sonder();
    identifiant = setInterval(sonder, INTERVALLE_METADONNEES_MS);

    return () => {
      controleur.abort();
      if (identifiant) clearInterval(identifiant);
    };
  }, [pisteActuelle?.type]);

  useEffect(() => {
    return () => {
      if (minuteurSommeilRef.current) clearTimeout(minuteurSommeilRef.current);
    };
  }, []);

  const valeur = useMemo<PlayerContextValeur>(
    () => ({
      pisteActuelle,
      enLecture: status.playing,
      enMemoireTampon: status.isBuffering,
      enReconnexion,
      erreur: status.error,
      positionSecondes: status.currentTime,
      dureeSecondes: status.duration,
      estDirect: status.isLive || pisteActuelle?.type === "direct",
      qualiteAudio,
      minuteurSommeilMinutes,
      vitesseLecture: status.playbackRate || 1,
      titreEnCours: etatServeur ? libelleEnCours(etatServeur) : `En direct sur ${config.frequence}`,
      etatServeur,
      lireDirect,
      lirePiste,
      mettreEnPause,
      reprendre,
      basculerLectureDirect,
      allerA,
      definirVitesse,
      definirQualiteAudio: setQualiteAudio,
      definirMinuteurSommeil,
    }),
    [
      pisteActuelle,
      status,
      enReconnexion,
      qualiteAudio,
      minuteurSommeilMinutes,
      etatServeur,
      lireDirect,
      lirePiste,
      mettreEnPause,
      reprendre,
      basculerLectureDirect,
      allerA,
      definirVitesse,
      definirMinuteurSommeil,
    ]
  );

  return (
    <PlayerContext.Provider value={valeur}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const contexte = useContext(PlayerContext);
  if (!contexte) {
    throw new Error("usePlayer doit être utilisé à l'intérieur de PlayerProvider");
  }
  return contexte;
}
