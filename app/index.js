import { Link } from "expo-router";
import React from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Card from "../components/Card";
import { COLORS, FONTS, SIZES } from "../constants/theme";
import { useLanguage } from "../localization/i18n";

export default function WelcomeScreen() {
  const { t, locale } = useLanguage();
  const isRtl = locale === "he";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.appTitle}>FINE AI</Text>
          <Text style={styles.appSubtitle}>{t("appSubtitle")}</Text>
        </View>

        <Card style={[styles.card, isRtl && styles.cardRtl]}>
          <Text style={styles.title}>{t("welcome")}</Text>
          <Text
            style={
              isRtl
                ? [styles.description, styles.textRtl, { textAlign: "left" }]
                : styles.description
            }
          >
            {t("appDescription")}
          </Text>

          <View
            style={
              isRtl
                ? [styles.infoContainer, styles.textRtl]
                : styles.infoContainer
            }
          >
            <Text style={styles.infoTitle}>{t("howItWorks")}</Text>
            <Text
              style={
                isRtl
                  ? [styles.infoText, styles.textRtl, { textAlign: "left" }]
                  : styles.infoText
              }
            >
              1. {t("feature1")}
            </Text>
            <Text
              style={
                isRtl
                  ? [styles.infoText, styles.textRtl, { textAlign: "left" }]
                  : styles.infoText
              }
            >
              2. {t("feature2")}
            </Text>
            <Text
              style={
                isRtl
                  ? [styles.infoText, styles.textRtl, { textAlign: "left" }]
                  : styles.infoText
              }
            >
              3. {t("feature3")}
            </Text>
            <Text
              style={
                isRtl
                  ? [styles.infoText, styles.textRtl, { textAlign: "left" }]
                  : styles.infoText
              }
            >
              4. {t("feature4")}
            </Text>
            <Text
              style={
                isRtl
                  ? [styles.infoText, styles.textRtl, { textAlign: "left" }]
                  : styles.infoText
              }
            >
              5. {t("feature5")}
            </Text>
          </View>

          <Link href="/login" asChild>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>{t("getStarted")}</Text>
            </Pressable>
          </Link>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: SIZES.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: SIZES.extraLarge,
  },
  appTitle: {
    ...FONTS.bold,
    fontSize: SIZES.xxxl,
    color: COLORS.primary,
    marginBottom: SIZES.base,
  },
  appSubtitle: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    textAlign: "center",
  },
  card: {
    width: "100%",
    maxWidth: 500,
  },
  cardRtl: {
    direction: "rtl",
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.primary,
    marginBottom: SIZES.medium,
    alignSelf: "center",
  },
  description: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SIZES.large,
    lineHeight: SIZES.large * 1.4,
  },
  textRtl: {
    alignItems: "flex-start",
  },
  infoContainer: {
    backgroundColor: COLORS.background,
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    marginBottom: SIZES.extraLarge,
  },
  infoTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SIZES.small,
  },
  infoText: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: SIZES.small,
    lineHeight: SIZES.large * 1.2,
  },
  button: {
    width: "100%",
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.large,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.small,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    ...FONTS.semiBold,
    fontSize: SIZES.large,
    color: COLORS.white,
  },
});
