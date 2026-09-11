import { Alert, Platform } from "react-native";

interface BoutonAlerte {
  text?: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

/**
 * `Alert.alert` de React Native ne fait rien sur le web (react-native-web
 * l'implémente comme un no-op) : sans ce remplaçant, chaque écran semble
 * "ne rien faire" sur ordinateur alors que le code s'exécute normalement.
 */
export function alerter(titre: string, message?: string, boutons?: BoutonAlerte[]) {
  if (Platform.OS !== "web") {
    Alert.alert(titre, message, boutons);
    return;
  }
  window.alert([titre, message].filter(Boolean).join("\n\n"));
  const bouton = boutons?.find((b) => b.style !== "cancel") ?? boutons?.[0];
  bouton?.onPress?.();
}
