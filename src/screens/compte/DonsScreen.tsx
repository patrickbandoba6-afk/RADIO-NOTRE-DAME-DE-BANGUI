import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { donsHistorique } from "@/data/sampleData";
import { config } from "@/lib/config";
import { colors, espacement, rayon } from "@/theme/colors";

const MONTANTS = [5, 10, 20, 50, 100];
const DEVISES = ["EUR", "USD", "XAF"];

function LigneCode({
  libelle,
  valeur,
  cle,
  champCopie,
  onCopier,
}: {
  libelle: string;
  valeur: string;
  cle: string;
  champCopie: string | null;
  onCopier: (cle: string, valeur: string) => void;
}) {
  return (
    <View style={styles.ligneCode}>
      <View style={{ flex: 1 }}>
        <Text style={styles.ligneCodeLibelle}>{libelle}</Text>
        <Text style={styles.ligneCodeValeur}>{valeur}</Text>
      </View>
      <TouchableOpacity style={styles.boutonCopier} onPress={() => onCopier(cle, valeur)}>
        <Text style={styles.boutonCopierTexte}>{champCopie === cle ? "Copié" : "Copier"}</Text>
      </TouchableOpacity>
    </View>
  );
}

export function DonsScreen() {
  const { t } = useTranslation();
  const [montant, setMontant] = useState<number>(20);
  const [montantPersonnalise, setMontantPersonnalise] = useState("");
  const [devise, setDevise] = useState("EUR");
  const [recurrent, setRecurrent] = useState(false);
  const [champCopie, setChampCopie] = useState<string | null>(null);
  const [methodePaiement, setMethodePaiement] = useState<"mobile" | "banque" | null>(null);

  const valeurChoisie = montantPersonnalise ? Number(montantPersonnalise) : montant;
  const montantAffiche = valeurChoisie > 0 ? `${valeurChoisie} ${devise}` : null;

  async function copier(cle: string, valeur: string) {
    await Clipboard.setStringAsync(valeur);
    setChampCopie(cle);
    setTimeout(() => setChampCopie((actuel) => (actuel === cle ? null : actuel)), 1500);
  }

  return (
    <ScrollView style={styles.conteneur} contentContainerStyle={{ padding: espacement.md, paddingBottom: 140 }}>
      <Text style={styles.titrePage}>{t("dons.titre")}</Text>
      <Text style={styles.sousTitrePage}>{t("dons.sousTitre")}</Text>

      <View style={styles.puces}>
        <TouchableOpacity
          style={[styles.puceType, !recurrent && styles.puceTypeActive]}
          onPress={() => setRecurrent(false)}
        >
          <Text style={[styles.puceTypeTexte, !recurrent && styles.puceTypeTexteActif]}>
            {t("dons.donPonctuel")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.puceType, recurrent && styles.puceTypeActive]}
          onPress={() => setRecurrent(true)}
        >
          <Text style={[styles.puceTypeTexte, recurrent && styles.puceTypeTexteActif]}>
            {t("dons.donRecurrent")}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitre}>{t("dons.montant")}</Text>
      <View style={styles.puces}>
        {MONTANTS.map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.puce, montant === m && !montantPersonnalise && styles.puceActive]}
            onPress={() => {
              setMontant(m);
              setMontantPersonnalise("");
            }}
          >
            <Text style={[styles.puceTexte, montant === m && !montantPersonnalise && styles.puceTexteActif]}>
              {m}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={styles.inputMontant}
        placeholder="Autre montant"
        placeholderTextColor={colors.texteSecondaire}
        keyboardType="numeric"
        value={montantPersonnalise}
        onChangeText={setMontantPersonnalise}
      />

      <Text style={styles.sectionTitre}>{t("dons.devise")}</Text>
      <View style={styles.puces}>
        {DEVISES.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.puce, devise === d && styles.puceActive]}
            onPress={() => setDevise(d)}
          >
            <Text style={[styles.puceTexte, devise === d && styles.puceTexteActif]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitre}>{t("dons.moyenPaiement")}</Text>

      <View style={styles.puces}>
        {config.donsOrangeUssd && config.donsOrangeCodeMarchand ? (
          <TouchableOpacity
            style={[styles.puceType, methodePaiement === "mobile" && styles.puceTypeActive]}
            onPress={() => setMethodePaiement(methodePaiement === "mobile" ? null : "mobile")}
          >
            <Text
              style={[styles.puceTypeTexte, methodePaiement === "mobile" && styles.puceTypeTexteActif]}
            >
              Mobile Money
            </Text>
          </TouchableOpacity>
        ) : null}
        {config.donsBanqueNom && config.donsBanqueCompte ? (
          <TouchableOpacity
            style={[styles.puceType, methodePaiement === "banque" && styles.puceTypeActive]}
            onPress={() => setMethodePaiement(methodePaiement === "banque" ? null : "banque")}
          >
            <Text
              style={[styles.puceTypeTexte, methodePaiement === "banque" && styles.puceTypeTexteActif]}
            >
              Virement bancaire
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {methodePaiement === "mobile" ? (
        <View style={styles.cartePaiement}>
          <Text style={styles.carteTitre}>Orange Money</Text>
          {config.donsOrangeNumero ? (
            <LigneCode
              libelle="Numéro Orange Money de la radio"
              valeur={config.donsOrangeNumero}
              cle="numero"
              champCopie={champCopie}
              onCopier={copier}
            />
          ) : null}
          <LigneCode
            libelle="Code USSD à composer"
            valeur={config.donsOrangeUssd!}
            cle="ussd"
            champCopie={champCopie}
            onCopier={copier}
          />
          <LigneCode
            libelle="Code marchand"
            valeur={config.donsOrangeCodeMarchand!}
            cle="marchand"
            champCopie={champCopie}
            onCopier={copier}
          />
          <Text style={styles.instructionPaiement}>
            Vous pouvez soit envoyer directement au numéro Orange Money ci-dessus, soit composer
            le code, entrez le code marchand, puis{" "}
            {montantAffiche ? `le montant (${montantAffiche})` : "le montant de votre don"} et
            votre code secret Orange Money.
          </Text>
        </View>
      ) : null}

      {methodePaiement === "banque" ? (
        <View style={styles.cartePaiement}>
          <Text style={styles.carteTitre}>Virement bancaire</Text>
          <LigneCode
            libelle={`Compte ${config.donsBanqueNom}`}
            valeur={config.donsBanqueCompte!}
            cle="banque"
            champCopie={champCopie}
            onCopier={copier}
          />
          <Text style={styles.instructionPaiement}>
            Indiquez « Don Radio Notre-Dame de Bangui » en référence de votre virement.
          </Text>
        </View>
      ) : null}

      {!methodePaiement ? (
        <Text style={styles.notePaiement}>
          Choisissez un moyen de paiement ci-dessus pour voir les informations à utiliser.
        </Text>
      ) : null}

      <Text style={styles.sectionTitre}>{t("dons.historiqueDons")}</Text>
      {donsHistorique.map((don) => (
        <View key={don.id} style={styles.ligneHistorique}>
          <Text style={styles.historiqueMontant}>
            {don.montant} {don.devise}
          </Text>
          <Text style={styles.historiqueDate}>{don.date}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  titrePage: { color: colors.texte, fontSize: 22, fontWeight: "800" },
  sousTitrePage: { color: colors.texteSecondaire, fontSize: 13, marginTop: 6, marginBottom: espacement.lg },
  puces: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  puceType: { flex: 1, paddingVertical: 10, borderRadius: rayon.rond, backgroundColor: colors.carte, alignItems: "center" },
  puceTypeActive: { backgroundColor: colors.primaire },
  puceTypeTexte: { color: colors.texteSecondaire, fontSize: 13, fontWeight: "600" },
  puceTypeTexteActif: { color: colors.fond },
  sectionTitre: { color: colors.texte, fontSize: 15, fontWeight: "700", marginTop: espacement.lg, marginBottom: espacement.sm },
  puce: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: rayon.rond, backgroundColor: colors.carte },
  puceActive: { backgroundColor: colors.primaire },
  puceTexte: { color: colors.texteSecondaire, fontSize: 13 },
  puceTexteActif: { color: colors.fond, fontWeight: "700" },
  inputMontant: {
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    paddingHorizontal: espacement.md,
    paddingVertical: 10,
    color: colors.texte,
    marginTop: espacement.sm,
  },
  notePaiement: { color: colors.texteSecondaire, fontSize: 12, marginBottom: espacement.md, lineHeight: 17 },
  cartePaiement: {
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    padding: espacement.md,
    marginBottom: espacement.sm,
  },
  carteTitre: { color: colors.primaire, fontSize: 14, fontWeight: "700", marginBottom: espacement.sm },
  ligneCode: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.sm,
    backgroundColor: colors.fondClair,
    borderRadius: rayon.sm,
    paddingHorizontal: espacement.sm,
    paddingVertical: 8,
    marginBottom: espacement.sm,
  },
  ligneCodeLibelle: { color: colors.texteSecondaire, fontSize: 11 },
  ligneCodeValeur: { color: colors.texte, fontSize: 16, fontWeight: "700", marginTop: 2 },
  boutonCopier: {
    backgroundColor: colors.primaire,
    borderRadius: rayon.rond,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  boutonCopierTexte: { color: colors.fond, fontSize: 12, fontWeight: "700" },
  instructionPaiement: { color: colors.texteSecondaire, fontSize: 12, lineHeight: 17 },
  ligneHistorique: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    paddingHorizontal: espacement.md,
    paddingVertical: 10,
    marginBottom: espacement.sm,
  },
  historiqueMontant: { color: colors.texte, fontSize: 13, fontWeight: "600" },
  historiqueDate: { color: colors.texteSecondaire, fontSize: 12 },
});
