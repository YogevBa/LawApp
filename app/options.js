import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { useLanguage } from '../localization/i18n';

export default function OptionsScreen() {
  const { result, fineId } = useLocalSearchParams();
  const [recommendedOption, setRecommendedOption] = useState('cancellation');
   const { t, locale } = useLanguage();
    const isRtl = locale === "he";
  
  // Set the recommended option based on the analysis result
  useEffect(() => {
    if (result === 'correct') {
      // If analysis was in favor, recommend cancellation
      setRecommendedOption('cancellation');
    } else if (result === 'partially') {
      // If analysis was partially in favor, recommend cancellation but with adjustment
      setRecommendedOption('cancellation');
    } else if (result === 'incorrect') {
      // If analysis was not in favor, recommend paying
      setRecommendedOption('pay');
    }
  }, [result]);
  
  const handleOptionSelect = (option) => {
    switch(option) {
      case 'trial':
        // In a real app, this would navigate to a different flow for trial requests
        alert(t('requestTrial'));
        break;
      case 'pay':
        // In a real app, this would navigate to a payment gateway
        alert(t('payFine'));
        break;
      case 'cancellation':
        router.push({
          pathname: '/cancellation-request',
          params: { fineId: fineId }
        });
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={
              isRtl
                ? [styles.title, styles.textRtl, { textAlign: "left" }]
                : styles.title
            }>{t('chooseNextStep')}</Text>
        <Text style={
              isRtl
                ? [styles.subtitle, styles.textRtl, { textAlign: "left" }]
                : styles.subtitle
            }>
          {result === 'correct' ? 
            t('analysisStrong') :
           result === 'partially' ? 
            t('analysisPartial') :
            t('analysisValid')}
        </Text>

        <TouchableOpacity 
          style={[
            styles.optionCard, 
            recommendedOption === 'trial' && styles.highlightedOption
          ]}
          onPress={() => handleOptionSelect('trial')}
        >
          <View style={[
            styles.iconPlaceholder,
            recommendedOption === 'trial' && styles.highlightedIcon
          ]}>
            <Text style={styles.iconText}>🏛️</Text>
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={[
              styles.optionTitle,
              recommendedOption === 'trial' && styles.highlightedText
            ]}>{t('requestTrial')}</Text>
            <Text style={styles.optionDescription}>
              {t('trialDescription')}
            </Text>
            {recommendedOption === 'trial' && (
              <Text style={styles.recommendedTag}>{t('recommended')}</Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.optionCard,
            recommendedOption === 'pay' && styles.highlightedOption
          ]}
          onPress={() => handleOptionSelect('pay')}
        >
          <View style={[
            styles.iconPlaceholder,
            recommendedOption === 'pay' && styles.highlightedIcon
          ]}>
            <Text style={styles.iconText}>💳</Text>
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={[
              styles.optionTitle,
              recommendedOption === 'pay' && styles.highlightedText
            ]}>{t('payFine')}</Text>
            <Text style={styles.optionDescription}>
              {t('payDescription')}
            </Text>
            {recommendedOption === 'pay' && (
              <Text style={styles.recommendedTag}>{t('recommended')}</Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.optionCard,
            recommendedOption === 'cancellation' && styles.highlightedOption
          ]}
          onPress={() => handleOptionSelect('cancellation')}
        >
          <View style={[
            styles.iconPlaceholder,
            recommendedOption === 'cancellation' && styles.highlightedIcon
          ]}>
            <Text style={styles.iconText}>📝</Text>
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={[
              styles.optionTitle,
              recommendedOption === 'cancellation' && styles.highlightedText
            ]}>{t('requestCancellation')}</Text>
            <Text style={styles.optionDescription}>
              {t('cancellationDescription')}
            </Text>
            {recommendedOption === 'cancellation' && (
              <Text style={styles.recommendedTag}>{t('recommended')}</Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>{t('backToAnalysis')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  textRtl: {
    alignItems: "flex-start",
  },
  content: {
    flex: 1,
    padding: SIZES.medium,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.primary,
    marginBottom: SIZES.small,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SIZES.extraLarge,
    lineHeight: SIZES.large * 1.2,
  },
  optionCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    marginBottom: SIZES.large,
    ...SHADOWS.medium,
  },
  highlightedOption: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  iconPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  highlightedIcon: {
    backgroundColor: COLORS.primary,
  },
  iconText: {
    fontSize: SIZES.extraLarge,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SIZES.small,
  },
  highlightedText: {
    color: COLORS.primary,
  },
  optionDescription: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: SIZES.large * 1.2,
  },
  recommendedTag: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.white,
    backgroundColor: COLORS.success,
    alignSelf: 'flex-start',
    paddingHorizontal: SIZES.small,
    paddingVertical: 2,
    borderRadius: SIZES.base,
    marginTop: SIZES.small,
  },
  backButton: {
    marginTop: 'auto',
    paddingVertical: SIZES.small,
  },
  backButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.secondary,
  },
});