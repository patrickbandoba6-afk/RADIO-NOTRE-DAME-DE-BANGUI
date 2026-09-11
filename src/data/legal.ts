// Contenu des chartes légales de l'application. Les informations marquées
// « à compléter » relèvent de l'éditeur (Radio Notre-Dame de Bangui) et ne
// doivent pas être devinées : elles seront renseignées une fois transmises.

export interface SectionLegale {
  titre: string;
  paragraphes: string[];
}

export interface DocumentLegal {
  cle: "mentions" | "confidentialite" | "cgu";
  titre: string;
  miseAJour: string;
  sections: SectionLegale[];
}

const A_COMPLETER = "à compléter par la radio";

export const documentsLegaux: DocumentLegal[] = [
  {
    cle: "mentions",
    titre: "Mentions légales",
    miseAJour: "Dernière mise à jour : 11 septembre 2026",
    sections: [
      {
        titre: "Éditeur de l'application",
        paragraphes: [
          "Radio Notre-Dame de Bangui — radio de l'Archidiocèse de Bangui, 103.3 FM, en émission depuis le 4 janvier 1995 à Bangui, République centrafricaine.",
          `Numéro d'enregistrement / RCCM : ${A_COMPLETER}.`,
          `Adresse du siège : ${A_COMPLETER}.`,
          `Directeur de la publication : ${A_COMPLETER}.`,
        ],
      },
      {
        titre: "Développement de l'application",
        paragraphes: [
          "L'application mobile Radio Notre-Dame de Bangui a été conçue et développée par Agence Web et Marketing, succursale de GLOBALY_JC.",
        ],
      },
      {
        titre: "Hébergement",
        paragraphes: [
          "Les données de contenu (actualités, agenda, podcasts, favoris) sont hébergées par Supabase Inc.",
          "L'application est distribuée via l'App Store (Apple Inc.) et Google Play (Google LLC), qui appliquent leurs propres règles de distribution.",
          "Le flux radio en direct est diffusé par l'hébergeur de streaming choisi par la radio (voir la page d'écoute officielle dans l'onglet Contact).",
        ],
      },
      {
        titre: "Propriété intellectuelle",
        paragraphes: [
          "Le nom « Radio Notre-Dame de Bangui », son logo et les contenus éditoriaux diffusés dans l'application (articles, émissions, prédications, visuels) appartiennent à la radio ou à ses ayants droit et ne peuvent être reproduits sans autorisation.",
          "Le code de l'application est la propriété de l'éditeur, sa réalisation technique ayant été assurée par Agence Web et Marketing (GLOBALY_JC).",
        ],
      },
    ],
  },
  {
    cle: "confidentialite",
    titre: "Politique de confidentialité",
    miseAJour: "Dernière mise à jour : 11 septembre 2026",
    sections: [
      {
        titre: "Principe général",
        paragraphes: [
          "L'application peut être utilisée sans créer de compte, en mode invité : dans ce cas, aucune donnée personnelle n'est transmise à nos serveurs.",
          "Créer un compte permet de synchroniser vos favoris et votre historique entre appareils ; cela reste optionnel.",
        ],
      },
      {
        titre: "Données collectées",
        paragraphes: [
          "Si vous créez un compte : votre adresse e-mail, utilisée uniquement pour l'authentification.",
          "Vos favoris, votre historique de consultation et vos téléchargements hors ligne, pour vous permettre de les retrouver.",
          "Si vous soumettez une demande de prière ou un témoignage : le contenu que vous rédigez, ainsi que le statut de confidentialité que vous choisissez (public ou privé).",
          "Si vous activez les notifications : un identifiant technique de votre appareil, utilisé uniquement pour vous envoyer les alertes que vous avez choisi de recevoir.",
          "Aucune donnée de paiement n'est stockée par l'application : les dons, lorsqu'ils seront activés, passeront par une passerelle de paiement tierce sécurisée.",
        ],
      },
      {
        titre: "Utilisation des données",
        paragraphes: [
          "Les données servent uniquement à faire fonctionner les fonctionnalités que vous utilisez (compte, favoris, notifications, demandes de prière). Elles ne sont ni vendues, ni partagées à des fins publicitaires.",
        ],
      },
      {
        titre: "Conservation et suppression",
        paragraphes: [
          "Vos données sont conservées tant que votre compte est actif. Vous pouvez demander la suppression de votre compte et de vos données à tout moment.",
          `Pour toute demande relative à vos données : ${A_COMPLETER} (adresse e-mail de contact de la radio).`,
        ],
      },
      {
        titre: "Services tiers",
        paragraphes: [
          "Supabase (hébergement des données de compte et de contenu).",
          "Le service de streaming audio de la radio, pour la lecture du direct.",
        ],
      },
    ],
  },
  {
    cle: "cgu",
    titre: "Conditions d'utilisation",
    miseAJour: "Dernière mise à jour : 11 septembre 2026",
    sections: [
      {
        titre: "Objet",
        paragraphes: [
          "L'application permet d'écouter Radio Notre-Dame de Bangui en direct, de consulter ses contenus (actualités, agenda, podcasts, contenus spirituels) et d'interagir avec certains services (favoris, demandes de prière, dons).",
        ],
      },
      {
        titre: "Utilisation acceptable",
        paragraphes: [
          "Les contenus que vous soumettez (demandes de prière, témoignages) doivent rester respectueux et conformes à l'esprit de la radio. La radio se réserve le droit de ne pas publier un contenu qui contreviendrait à cette règle.",
          "Il est interdit d'utiliser l'application pour diffuser du contenu illicite, offensant ou portant atteinte aux droits d'autrui.",
        ],
      },
      {
        titre: "Disponibilité du service",
        paragraphes: [
          "L'écoute en direct dépend de la disponibilité du flux radio fourni par l'hébergeur de streaming ; des interruptions ponctuelles peuvent survenir indépendamment de l'application.",
          "L'éditeur et le développeur s'efforcent d'assurer la continuité du service sans garantir une disponibilité absolue.",
        ],
      },
      {
        titre: "Responsabilité",
        paragraphes: [
          "L'application est fournie « en l'état ». L'éditeur ne saurait être tenu responsable d'un dommage résultant d'une interruption de service, d'une erreur de contenu ou d'une mauvaise utilisation de l'application.",
        ],
      },
      {
        titre: "Modification des conditions",
        paragraphes: [
          "Ces conditions peuvent être mises à jour. La date de dernière mise à jour est indiquée en haut de chaque document.",
        ],
      },
      {
        titre: "Droit applicable",
        paragraphes: [`Droit applicable et juridiction compétente : ${A_COMPLETER}.`],
      },
    ],
  },
];
