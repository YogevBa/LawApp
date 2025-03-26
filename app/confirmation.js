import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, I18nManager } from 'react-native';
import { router } from 'expo-router';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import Button from '../components/Button';
import Card from '../components/Card';
import { useLanguage } from '../localization/i18n';

export default function ConfirmationScreen() {
  const { t, locale } = useLanguage();
  const isRTL = locale === 'he';
  
  // Generate a random confirmation number
  const confirmationNumber = `REQ-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.successIconContainer}>
          <Text style={styles.successIcon}>✓</Text>
        </View>
        
        <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>{t('requestSubmitted')}</Text>
        
        <Card>
          <Text style={[styles.confirmationText, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('requestSubmittedText')}
          </Text>
          
          <View style={styles.confirmationNumberContainer}>
            <Text style={[styles.confirmationLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('confirmationNumber')}</Text>
            <Text style={styles.confirmationNumber}>{confirmationNumber}</Text>
          </View>
          
          <View style={[styles.infoContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
            <Text style={[styles.infoTitle, { textAlign: isRTL ? 'right' : 'left', alignSelf: 'stretch' }]}>{t('whatHappensNext')}</Text>
            <Text style={[styles.infoText, { textAlign: isRTL ? 'right' : 'left', alignSelf: 'stretch' }]}>
              {t('nextStep1')}
            </Text>
            <Text style={[styles.infoText, { textAlign: isRTL ? 'right' : 'left', alignSelf: 'stretch' }]}>
              {t('nextStep2')}
            </Text>
            <Text style={[styles.infoText, { textAlign: isRTL ? 'right' : 'left', alignSelf: 'stretch' }]}>
              {t('nextStep3')}
            </Text>
          </View>
          
          <View style={[
            styles.reminderContainer, 
            { 
              borderLeftWidth: isRTL ? 0 : 4,
              borderRightWidth: isRTL ? 4 : 0,
              borderLeftColor: COLORS.warning,
              borderRightColor: COLORS.warning
            }
          ]}>
            <Text style={[styles.reminderTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('importantReminder')}</Text>
            <Text style={[styles.reminderText, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('reminderText')}
            </Text>
          </View>
        </Card>
        
        <Button
          title={t('backToHome')}
          onPress={() => router.replace('/(tabs)')}
          style={styles.button}
        />
        
        <Button
          title={t('createAnotherRequest')}
          onPress={() => router.push('/report-summary')}
          type="outline"
          style={styles.button}
        />
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
    padding: SIZES.medium,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.large,
  },
  successIcon: {
    ...FONTS.bold,
    fontSize: SIZES.xxxl,
    color: COLORS.white,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.primary,
    marginBottom: SIZES.medium,
    textAlign: 'center',
  },
  confirmationText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SIZES.large,
    textAlign: 'center',
    lineHeight: SIZES.large * 1.2,
  },
  confirmationNumberContainer: {
    backgroundColor: COLORS.background,
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    marginBottom: SIZES.large,
    alignItems: 'center',
  },
  confirmationLabel: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: SIZES.small,
  },
  confirmationNumber: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.primary,
  },
  infoContainer: {
    marginBottom: SIZES.large,
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
  reminderContainer: {
    backgroundColor: COLORS.background,
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  reminderTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: SIZES.small,
  },
  reminderText: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: SIZES.large * 1.2,
  },
  button: {
    width: '100%',
    maxWidth: 500,
    marginTop: SIZES.medium,
  },
});