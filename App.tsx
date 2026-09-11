import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/context/AuthContext";
import { FavorisProvider } from "@/context/FavorisContext";
import { HistoriqueProvider } from "@/context/HistoriqueContext";
import { PlayerProvider } from "@/context/PlayerContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { TelechargementsProvider } from "@/context/TelechargementsContext";
import { initialiserI18n } from "@/i18n";
import { demanderPermissionNotifications } from "@/lib/notifications";
import { RootNavigator } from "@/navigation/RootNavigator";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [pret, setPret] = useState(false);

  useEffect(() => {
    (async () => {
      await initialiserI18n();
      await demanderPermissionNotifications().catch(() => {});
      setPret(true);
    })();
  }, []);

  const surLayoutRacine = useCallback(async () => {
    if (pret) {
      await SplashScreen.hideAsync();
    }
  }, [pret]);

  useEffect(() => {
    surLayoutRacine();
  }, [surLayoutRacine]);

  if (!pret) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <AuthProvider>
          <FavorisProvider>
            <HistoriqueProvider>
              <TelechargementsProvider>
                <PlayerProvider>
                  <StatusBar style="light" />
                  <RootNavigator />
                </PlayerProvider>
              </TelechargementsProvider>
            </HistoriqueProvider>
          </FavorisProvider>
        </AuthProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
