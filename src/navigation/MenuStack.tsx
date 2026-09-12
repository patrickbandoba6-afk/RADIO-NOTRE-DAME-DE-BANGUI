import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ConnexionScreen } from "@/screens/compte/ConnexionScreen";
import { DonsScreen } from "@/screens/compte/DonsScreen";
import { FavorisScreen } from "@/screens/compte/FavorisScreen";
import { ParametresScreen } from "@/screens/compte/ParametresScreen";
import { TelechargementsScreen } from "@/screens/compte/TelechargementsScreen";
import { CommunauteScreen } from "@/screens/home/CommunauteScreen";
import { NotificationsScreen } from "@/screens/home/NotificationsScreen";
import { DetailEmissionScreen } from "@/screens/media/DetailEmissionScreen";
import { EmissionsScreen } from "@/screens/media/EmissionsScreen";
import { GrilleScreen } from "@/screens/media/GrilleScreen";
import { LecteurVideoScreen } from "@/screens/media/LecteurVideoScreen";
import { VideosScreen } from "@/screens/media/VideosScreen";
import { CommuniquesScreen } from "@/screens/menu/CommuniquesScreen";
import { ContactScreen } from "@/screens/menu/ContactScreen";
import { DossiersScreen } from "@/screens/menu/DossiersScreen";
import { EnvoyerInfoScreen } from "@/screens/compte/EnvoyerInfoScreen";
import { HistoriqueScreen } from "@/screens/menu/HistoriqueScreen";
import { MonProfilScreen } from "@/screens/compte/MonProfilScreen";
import { AdminScreen } from "@/screens/menu/AdminScreen";
import { HomeliesScreen } from "@/screens/menu/HomeliesScreen";
import { MentionsLegalesScreen } from "@/screens/menu/MentionsLegalesScreen";
import { MenuScreen } from "@/screens/menu/MenuScreen";
import { ParoissesScreen } from "@/screens/menu/ParoissesScreen";
import { BibleChapitreScreen } from "@/screens/prier/BibleChapitreScreen";
import { BibleLivresScreen } from "@/screens/prier/BibleLivresScreen";
import { BibleScreen } from "@/screens/prier/BibleScreen";
import { EvangileScreen } from "@/screens/prier/EvangileScreen";
import { NouveauTemoignageScreen } from "@/screens/prier/NouveauTemoignageScreen";
import { NouvelleDemandePriereScreen } from "@/screens/prier/NouvelleDemandePriereScreen";
import { PrierAccueilScreen } from "@/screens/prier/PrierAccueilScreen";
import { PriereScreen } from "@/screens/prier/PriereScreen";
import { PrieresScreen } from "@/screens/prier/PrieresScreen";
import { TemoignagesScreen } from "@/screens/prier/TemoignagesScreen";
import { optionsEcran } from "./optionsEcran";
import type { PileMenu } from "./types";

const Stack = createNativeStackNavigator<PileMenu>();

export function MenuStack() {
  return (
    <Stack.Navigator screenOptions={optionsEcran}>
      <Stack.Screen name="Menu" component={MenuScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Connexion" component={ConnexionScreen} options={{ title: "" }} />
      <Stack.Screen name="Parametres" component={ParametresScreen} options={{ title: "Paramètres" }} />
      <Stack.Screen name="Dons" component={DonsScreen} options={{ title: "Soutenir la radio" }} />
      <Stack.Screen name="Contact" component={ContactScreen} options={{ title: "Contact" }} />
      <Stack.Screen name="Favoris" component={FavorisScreen} options={{ title: "Mes favoris" }} />
      <Stack.Screen name="Historique" component={HistoriqueScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Telechargements" component={TelechargementsScreen} options={{ title: "Mes téléchargements" }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: "Notifications" }} />
      <Stack.Screen name="EnvoyerInfo" component={EnvoyerInfoScreen} options={{ title: "Envoyer une info à la radio" }} />
      <Stack.Screen name="Evangile" component={EvangileScreen} options={{ title: "" }} />
      <Stack.Screen name="MaJournee" component={PrierAccueilScreen} options={{ title: "Ma journée avec Dieu" }} />
      <Stack.Screen name="Prieres" component={PrieresScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Bible" component={BibleScreen} options={{ title: "Bible" }} />
      <Stack.Screen name="BibleLivres" component={BibleLivresScreen} options={{ title: "" }} />
      <Stack.Screen name="BibleChapitre" component={BibleChapitreScreen} options={{ title: "" }} />
      <Stack.Screen name="Homelies" component={HomeliesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Priere" component={PriereScreen} options={{ title: "Demandes de prière" }} />
      <Stack.Screen name="NouvelleDemandePriere" component={NouvelleDemandePriereScreen} options={{ title: "" }} />
      <Stack.Screen name="Temoignages" component={TemoignagesScreen} options={{ title: "Témoignages" }} />
      <Stack.Screen name="NouveauTemoignage" component={NouveauTemoignageScreen} options={{ title: "" }} />
      <Stack.Screen name="Emissions" component={EmissionsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DetailEmission" component={DetailEmissionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Grille" component={GrilleScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Videos" component={VideosScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LecteurVideo" component={LecteurVideoScreen} options={{ title: "" }} />
      <Stack.Screen name="Dossiers" component={DossiersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Communiques" component={CommuniquesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Paroisses" component={ParoissesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Communaute" component={CommunauteScreen} options={{ title: "Communauté" }} />
      <Stack.Screen
        name="MentionsLegales"
        component={MentionsLegalesScreen}
        options={{ title: "Mentions légales" }}
      />
      <Stack.Screen name="Admin" component={AdminScreen} options={{ title: "Espace administrateur" }} />
      <Stack.Screen name="MonProfil" component={MonProfilScreen} options={{ title: "Mon profil" }} />
    </Stack.Navigator>
  );
}
