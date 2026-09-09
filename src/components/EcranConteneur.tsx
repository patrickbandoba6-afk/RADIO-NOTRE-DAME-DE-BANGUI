import React from "react";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";

interface Props {
  children: React.ReactNode;
  defilable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export function EcranConteneur({ children, defilable = true, style, contentContainerStyle }: Props) {
  if (!defilable) {
    return (
      <SafeAreaView style={[styles.conteneur, style]} edges={["top"]}>
        {children}
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.conteneur, style]} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[styles.contenu, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  contenu: { paddingBottom: 120 },
});
