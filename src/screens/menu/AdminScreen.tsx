import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import { config } from "@/lib/config";
import { ouvrirLien } from "@/lib/format";
import { colors, espacement } from "@/theme/colors";

/**
 * Espace administrateur : affiche le back-office web (voir `admin/`) intégré
 * dans l'application. Aucune logique de publication n'est dupliquée ici —
 * l'authentification et les droits (RLS `est_membre_equipe()`) sont gérés
 * entièrement par le back-office lui-même.
 */
export function AdminScreen() {
  const webviewRef = useRef<WebView>(null);
  const [chargement, setChargement] = useState(true);

  if (!config.adminUrl) {
    return (
      <View style={styles.conteneurVide}>
        <Ionicons name="construct-outline" size={48} color={colors.texteSecondaire} />
        <Text style={styles.titreVide}>Espace administrateur non configuré</Text>
        <Text style={styles.texteVide}>
          Renseignez EXPO_PUBLIC_ADMIN_URL avec l'adresse du back-office une fois qu'il est mis en
          ligne (voir le dossier admin/).
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.conteneur}>
      <View style={styles.barreOutils}>
        <TouchableOpacity
          style={styles.actionBarreOutils}
          onPress={() => ouvrirLien(config.adminUrl)}
        >
          <Ionicons name="open-outline" size={16} color={colors.texteSecondaire} />
          <Text style={styles.texteBarreOutils}>Ouvrir dans le navigateur</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => webviewRef.current?.reload()} hitSlop={10}>
          <Ionicons name="refresh" size={20} color={colors.texteSecondaire} />
        </TouchableOpacity>
      </View>
      <WebView
        ref={webviewRef}
        source={{ uri: config.adminUrl }}
        style={styles.webview}
        cacheEnabled={false}
        onLoadStart={() => setChargement(true)}
        onLoadEnd={() => setChargement(false)}
      />
      {chargement ? (
        <View style={[StyleSheet.absoluteFill, styles.overlayChargement]}>
          <ActivityIndicator color={colors.primaire} size="large" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.blanc },
  barreOutils: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: espacement.md,
    paddingVertical: espacement.sm,
    backgroundColor: colors.fond,
  },
  actionBarreOutils: { flexDirection: "row", alignItems: "center", gap: 6 },
  texteBarreOutils: { color: colors.texteSecondaire, fontSize: 12 },
  webview: { flex: 1 },
  overlayChargement: {
    top: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.blanc,
  },
  conteneurVide: {
    flex: 1,
    backgroundColor: colors.fond,
    alignItems: "center",
    justifyContent: "center",
    padding: espacement.xl,
    gap: espacement.sm,
  },
  titreVide: { color: colors.texte, fontSize: 16, fontWeight: "700", textAlign: "center" },
  texteVide: { color: colors.texteSecondaire, fontSize: 13, textAlign: "center", lineHeight: 19 },
});
