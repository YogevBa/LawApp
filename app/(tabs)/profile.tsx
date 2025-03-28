import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  ViewStyle,
  TextStyle,
  ImageStyle,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { COLORS, SIZES, FONTS, SHADOWS } from "@/constants/theme";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { useLanguage } from "@/localization/i18n";
import LanguageSelector from "@/components/LanguageSelector";
// API key management moved to env file

import { Fine } from "@/store/finesSlice";

// Define the type for our styles
type StylesType = {
  [key: string]: ViewStyle | TextStyle | ImageStyle;
};

// Extend the Global interface for TypeScript
declare global {
  var userFines: Fine[] | undefined;
}

export default function ProfileScreen() {
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const { t, locale } = useLanguage();
  const isRtl = locale === "he";

  // Define user data interface
  interface UserData {
    name: string;
    email: string;
    phone: string;
    address: string;
    profileImage: string | null;
  }

  // Mock user data
  const userData: UserData = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    address: "123 Main Street, Anytown, USA",
    profileImage: null, // In a real app, this would be a URI
  };

  // Define stats interface
  interface UserStats {
    totalFines: number;
    pendingFines: number;
    appealedFines: number;
    successfulAppeals: number;
  }

  const stats: UserStats = {
    totalFines: 5,
    pendingFines: 2,
    appealedFines: 2,
    successfulAppeals: 1,
  };

  // Handle logout function
  const handleLogout = (): void => {
    // Close the modal
    setLogoutModalVisible(false);

    // In a real app, we would clear tokens, remove cached data, etc.
    // For example:
    // AsyncStorage.removeItem('userToken');
    // clearUserCache();

    // Reset global state like userFines
    if (typeof global !== "undefined" && global.userFines) {
      global.userFines = [];
    }

    // Navigate to login screen
    setTimeout(() => {
      router.replace("/login");
    }, 100);
  };

  // Handler for language change
  const handleLanguageChange = (newLang: string): void => {
    // No need to manually track the language anymore, the context handles it
    console.log(`Language changed to: ${newLang}`);
  };

  // API key management removed

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("myProfile")}</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {userData.profileImage ? (
              <Image
                source={{ uri: userData.profileImage }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {userData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{userData.name}</Text>
        </View>

        <Card style={styles.infoCard}>
          <Text  style={
              isRtl
                ? [styles.sectionTitle, styles.textRtl, { textAlign: "left" }]
                : styles.sectionTitle
            }>{t("personalInfo")}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("email")}:</Text>
            <Text style={styles.infoValue}>{userData.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("phone")}:</Text>
            <Text style={styles.infoValue}>{userData.phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("address")}:</Text>
            <Text style={styles.infoValue}>{userData.address}</Text>
          </View>

          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>{t("editInfo")}</Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.statsCard}>
          <Text
            style={
              isRtl
                ? [styles.sectionTitle, styles.textRtl, { textAlign: "left" }]
                : styles.sectionTitle
            }
          >
            {t("finesStats")}
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.successfulAppeals}</Text>
              <Text style={styles.statLabel}>{t("requestTrials")}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.successfulAppeals}</Text>
              <Text style={styles.statLabel}>
                {t("appealCancellationPostponedReport")}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.successfulAppeals}</Text>
              <Text style={styles.statLabel}>
                {t("appealForPartialReport")}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalFines}</Text>
              <Text style={styles.statLabel}>{t("totalFines")}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.pendingFines}</Text>
              <Text style={styles.statLabel}>{t("payedReports")}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.appealedFines}</Text>
              <Text style={styles.statLabel}>{t("requestHandledBy")}</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.settingsCard}>
          <Text  style={
              isRtl
                ? [styles.sectionTitle, styles.textRtl, { textAlign: "left" }]
                : styles.sectionTitle
            }>{t("settings")}</Text>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingText}>{t("notifications")}</Text>
            <Text style={styles.settingValue}>On</Text>
          </TouchableOpacity>

          {/* Add Language Selector */}
          <LanguageSelector onLanguageChange={handleLanguageChange} />
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingText}>{t("privacySettings")}</Text>
            <Text style={styles.settingValue}>➔</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingText}>{t("legalInfo")}</Text>
            <Text style={styles.settingValue}>➔</Text>
          </TouchableOpacity>
        </Card>

        <Button
          title={t("signOut")}
          type="outline"
          onPress={() => setLogoutModalVisible(true)}
          style={styles.signOutButton}
        />

        <Modal
          animationType="fade"
          transparent={true}
          visible={logoutModalVisible}
          onRequestClose={() => setLogoutModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{t("signOut")}</Text>
              <Text style={styles.modalText}>{t("signOutConfirm")}</Text>

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setLogoutModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.logoutButton]}
                  onPress={handleLogout}
                >
                  <Text style={styles.logoutButtonText}>{t("signOut")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginBottom: 70,
  },
  textRtl: {
    alignItems: "flex-start",
  },
  scrollContainer: {
    padding: SIZES.medium,
  },
  header: {
    marginBottom: SIZES.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.primary,
    textAlign: "center",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: SIZES.extraLarge,
  },
  avatarContainer: {
    marginBottom: SIZES.medium,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.white,
  },
  userName: {
    ...FONTS.semiBold,
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  infoCard: {
    marginBottom: SIZES.medium,
  },
  sectionTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.large,
    color: COLORS.primary,
    marginBottom: SIZES.medium,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: SIZES.small,
  },
  infoLabel: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.gray,
    width: "30%",
  },
  infoValue: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
    width: "70%",
  },
  editButton: {
    alignSelf: "flex-end",
    marginTop: SIZES.small,
  },
  editButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.secondary,
  },
  statsCard: {
    marginBottom: SIZES.medium,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: SIZES.extraLarge,
  },
  statItem: {
    alignItems: "center",
    width: "22%",
  },
  statNumber: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.primary,
    marginBottom: SIZES.small / 2,
  },
  statLabel: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.gray,
    textAlign: "center",
  },
  settingsCard: {
    marginBottom: SIZES.large,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SIZES.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.text,
    fontWeight: "500" as "500",
  },
  settingValue: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.secondary,
    fontWeight: "500",
  },
  signOutButton: {
    marginBottom: SIZES.large,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.medium,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base,
    padding: SIZES.large,
    width: "90%",
    maxWidth: 400,
    ...SHADOWS.dark,
  },
  modalTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.primary,
    marginBottom: SIZES.medium,
    textAlign: "center",
  },
  modalText: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: SIZES.large,
    textAlign: "center",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: SIZES.medium,
    borderRadius: SIZES.base,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: SIZES.small / 2,
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  cancelButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.text,
    fontWeight: "500",
  },
  logoutButton: {
    backgroundColor: COLORS.primary,
  },
  logoutButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.white,
    fontWeight: "500",
  },
  apiKeyInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    marginBottom: SIZES.large,
    fontSize: SIZES.font,
    color: COLORS.text,
    width: "100%",
  },
});
