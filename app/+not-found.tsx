import { Link, Stack } from 'expo-router';
import { StyleSheet, I18nManager } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLanguage } from '@/localization/i18n';

export default function NotFoundScreen() {
  const { t, locale } = useLanguage();
  const isRTL = locale === 'he';
  
  return (
    <>
      <Stack.Screen options={{ title: t('pageNotFound') }} />
      <ThemedView style={[
        styles.container,
        { direction: isRTL ? 'rtl' : 'ltr' }
      ]}>
        <ThemedText type="title" style={{ textAlign: isRTL ? 'right' : 'left' }}>
          {t('pageNotFoundText')}
        </ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link" style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {t('goHome')}
          </ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
