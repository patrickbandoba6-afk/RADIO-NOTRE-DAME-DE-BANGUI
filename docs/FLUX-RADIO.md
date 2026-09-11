# Flux audio de Radio Notre-Dame de Bangui

Ce document trace précisément la source du flux utilisé par l'application,
conformément à la règle « ne jamais inventer une URL de streaming ».

## Source

Page publique de la station : <https://radionotredame.caster.fm/>
(hébergeur **Caster.fm**).

L'endpoint audio n'a **pas** été deviné : il est publié en clair dans le code
de cette page, dans un champ intitulé *« Direct Link To Be Added Manualy »*,
et confirmé par les variables JavaScript du lecteur :

```js
var server_url  = "shaincast.caster.fm";
var server_port = "16045";
var playertype  = "html5";
```

## Endpoint confirmé

```
http://shaincast.caster.fm:16045/listen.mp3
```

Un jeton d'écoute peut être ajouté en paramètre d'URL par la station
(`?auth…`). Il est configurable via `EXPO_PUBLIC_RADIO_STREAM_AUTH` afin de
ne pas figer un jeton susceptible de changer.

## Vérification effectuée le 10/09/2026

Requête `GET` avec l'en-tête `Icy-MetaData: 1`. Réponse du serveur :

| En-tête | Valeur |
| --- | --- |
| `HTTP` | `200 OK` |
| `Content-Type` | `audio/mpeg` |
| `icy-name` | `Radio Notre Dame de Bangui` |
| `icy-description` | `La voix de l'Espérence` *(orthographe du serveur)* |
| `icy-genre` | `Religious` |
| `icy-br` | `128` |
| `ice-audio-info` | `ice-samplerate=44100;ice-bitrate=128;ice-channels=2` |
| `icy-metaint` | `16000` |
| `Server` | `Caster Streaming Server 2.3` |
| `Access-Control-Allow-Origin` | `*` |

200 Ko de données audio ont effectivement été reçus : le flux diffuse bien.

**Conclusion :** flux **Shoutcast/Icecast**, codec **MP3**, **128 kbps**,
44,1 kHz stéréo. Le `Access-Control-Allow-Origin: *` permet la lecture
directe depuis un navigateur (application Web) sans proxy.

## Métadonnées (titre en cours)

Le serveur expose un endpoint d'état compatible Icecast :

```
http://shaincast.caster.fm:16045/status-json.xsl
```

Extrait de réponse :

```json
{ "icestats": { "source": {
  "listenurl": "http://shaincast.caster.fm:16045/listen.mp3",
  "server_name": "Radio Notre Dame de Bangui",
  "server_description": "La voix de l'Espérence",
  "server_type": "audio/mpeg",
  "bitrate": 128,
  "genre": "Religious",
  "listeners": 0
}}}
```

L'application interroge cet endpoint toutes les 20 secondes pendant le direct
(`src/lib/radioMetadata.ts`). Le champ `title` n'apparaît que lorsque la régie
transmet une métadonnée ICY ; sinon l'application affiche
« En direct sur 103.3 FM ».

## Configuration dans le projet

Tout est centralisé dans `src/lib/config.ts` et surchargeable par
variables d'environnement (voir `.env.example`) :

| Variable | Rôle |
| --- | --- |
| `EXPO_PUBLIC_RADIO_STREAM_URL` | Flux principal |
| `EXPO_PUBLIC_RADIO_STREAM_AUTH` | Jeton d'écoute éventuel |
| `EXPO_PUBLIC_RADIO_STREAM_BACKUP_URL` | Flux de secours |
| `EXPO_PUBLIC_RADIO_STREAM_TYPE` | `SHOUTCAST` / `ICECAST` / `HLS`… |
| `EXPO_PUBLIC_RADIO_STREAM_CODEC` | `MP3`, `AAC`, `AAC+` |
| `EXPO_PUBLIC_RADIO_STREAM_BITRATE` | Débit annoncé |
| `EXPO_PUBLIC_RADIO_STATUS_URL` | Endpoint des métadonnées |

Le lecteur bascule automatiquement sur le flux de secours lorsqu'il est
renseigné et que le flux principal échoue (`src/context/PlayerContext.tsx`).

## Incident du 11/09/2026 — 401 Authentication Required

Le direct ne démarre pas dans l'app (Expo Go, iOS) : `expo-audio` remonte
`NSURLErrorDomain error -1013` (authentification requise).

Diagnostic confirmé par test direct :

```
curl -I  .../listen.mp3   → 200 OK   (HEAD : ne compte pas comme un auditeur, trompeur)
curl GET .../listen.mp3   → 401 Authentication Required
```

Et `status-json.xsl` le confirme explicitement :

```json
"source": { "authenticator": "url", ... }
```

**Conclusion :** l'endpoint public documenté plus haut nécessite en réalité un
jeton d'authentification dans l'URL (`authenticator: "url"` côté Caster.fm),
que la page publique de la station n'expose pas. La vérification du
10/09/2026 a pu réussir avant que cette exigence ne soit (re)activée côté
Caster.fm, ou via un mécanisme qui n'a pas été reproduit ici.

**Action requise (ne peut pas être devinée) :** récupérer, depuis le compte
Caster.fm de la station, l'URL d'écoute complète avec jeton (section
« Direct Link »/« Embed »/« Listen Now » du tableau de bord), et la
renseigner dans `EXPO_PUBLIC_RADIO_STREAM_AUTH` (ou directement dans
`EXPO_PUBLIC_RADIO_STREAM_URL`).

## Points d'attention

- **HTTP non chiffré.** Le flux est servi en `http://`. iOS l'autorise via
  `NSAllowsArbitraryLoads` et Android via `usesCleartextTraffic`, déjà activés
  dans `app.json`. Si Caster.fm propose un jour un endpoint `https://`, il
  suffit de renseigner `EXPO_PUBLIC_RADIO_STREAM_URL`.
- **Jeton d'écoute.** Si la station active une authentification obligatoire,
  renseigner `EXPO_PUBLIC_RADIO_STREAM_AUTH` plutôt que de modifier le code.
- **Changement d'hébergeur.** Aucune modification de code n'est nécessaire :
  seules les variables d'environnement changent.
