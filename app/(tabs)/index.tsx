import { Image, StyleSheet, SafeAreaView } from 'react-native';
import React from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Colors } from '@/constants/Colors';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/Button';
import { router } from 'expo-router';
import { useLanguage } from '@/localization/i18n';

export default function HomeScreen() {
  // Use the language context
  const { t, locale } = useLanguage();
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.appLogo}
        />
      }>
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.contentContainer}>
          <ThemedText type="subtitle">{t('welcome')}</ThemedText>
          <ThemedText style={styles.description}>
            {t('appDescription')}
          </ThemedText>
          
          <ThemedView style={styles.featuresContainer}>
            <ThemedView style={styles.featureItem}>
              <Ionicons name="document-text-outline" size={24} color={COLORS.primary} />
              <ThemedText style={styles.featureText}>{t('feature1')}</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.featureItem}>
              <Ionicons name="analytics-outline" size={24} color={COLORS.primary} />
              <ThemedText style={styles.featureText}>{t('feature2')}</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.featureItem}>
              <Ionicons name="create-outline" size={24} color={COLORS.primary} />
              <ThemedText style={styles.featureText}>{t('feature3')}</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.featureItem}>
              <Ionicons name="send-outline" size={24} color={COLORS.primary} />
              <ThemedText style={styles.featureText}>{t('feature4')}</ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedView style={styles.actionsContainer}>
            <ThemedText type="subtitle">{t('reportFine')}</ThemedText>
            <ThemedText style={styles.actionDescription}>
              {t('chooseSubmitMethod')}
            </ThemedText>
            
            <Button 
              title={t('uploadDocument')} 
              onPress={() => router.push('/upload-document')} 
              type="primary"
              style={styles.actionButton}
            />
            
            <ThemedView style={styles.buttonGap} />
            
            <Button 
              title={t('scanBarcode')} 
              onPress={() => router.push('/scan-barcode')} 
              type="secondary" 
              style={styles.actionButton}
            />
            
            <ThemedView style={styles.orSeparator}>
              <ThemedView style={styles.orLine} />
              <ThemedText style={styles.orText}>{t('or')}</ThemedText>
              <ThemedView style={styles.orLine} />
            </ThemedView>
            
            <Button 
              title={t('customCase')} 
              onPress={() => router.push('/custom-case')} 
              type="outline"
              style={styles.actionButton}
            />
          </ThemedView>
          
          <ThemedView style={styles.statsContainer}>
            <ThemedText type="subtitle">{t('statistics')}</ThemedText>
            <ThemedView style={styles.statsRow}>
              <ThemedView style={styles.statItem}>
                <ThemedText style={styles.statNumber}>0</ThemedText>
                <ThemedText style={styles.statLabel}>{t('activeCases')}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.statItem}>
                <ThemedText style={styles.statNumber}>0</ThemedText>
                <ThemedText style={styles.statLabel}>{t('appealsCreated')}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.statItem}>
                <ThemedText style={styles.statNumber}>0%</ThemedText>
                <ThemedText style={styles.statLabel}>{t('successRate')}</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  appLogo: {
    height: 100,
    width: 100,
    bottom: 16,
    alignSelf: 'center',
    position: 'absolute',
  },
  contentContainer: {
    gap: 24,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  featuresContainer: {
    gap: 16,
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
  },
  actionsContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  actionDescription: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  actionButton: {
    marginVertical: 8,
  },
  orSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: 'rgba(0,0,0,0.5)',
  },
  buttonGap: {
    height: 16,
  },
  statsContainer: {
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});