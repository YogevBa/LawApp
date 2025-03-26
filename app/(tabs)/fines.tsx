import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS, SIZES, FONTS, SHADOWS } from '@/constants/theme';
import Card from '@/components/Card';
import { selectFinesArray, removeFine } from '@/store/finesSlice';
import { useLanguage } from '@/localization/i18n';

// Define interfaces
interface FineAnalysis {
  summary?: string;
  keyPoints?: string[];
  recommendation?: string;
  result?: 'correct' | 'partially' | 'incorrect';
}

interface Fine {
  reportNumber: string;
  date: string;
  violation: string;
  amount: string;
  location: string;
  isPaid: boolean;
  analysis?: FineAnalysis;
}

export default function FinesScreen() {
  const { t } = useLanguage();
  const dispatch = useDispatch();

  // Get fines from Redux store
  const fines = useSelector(selectFinesArray);

  const handleViewFine = (fineId: string): void => {
    router.push({
      pathname: '/report-summary',
      params: { fineId },
    });
  };

  const handleRemoveFine = (fineId: string): void => {
    Alert.alert(t('removeFine'), t('removeFineConfirm'), [
      {
        text: t('cancel'),
        style: 'cancel',
      },
      {
        text: t('remove'),
        onPress: () => dispatch(removeFine(fineId)),
        style: 'destructive',
      },
    ]);
  };

  const renderFineItem = ({ item }: { item: Fine }): JSX.Element => {
    const resultColor =
      item.analysis?.result === 'correct'
        ? COLORS.success
        : item.analysis?.result === 'partially'
        ? COLORS.warning
        : item.analysis?.result === 'incorrect'
        ? COLORS.error
        : undefined;

    const resultText =
      item.analysis?.result === 'correct'
        ? t('inYourFavor')
        : item.analysis?.result === 'partially'
        ? t('partiallyFavor')
        : item.analysis?.result === 'incorrect'
        ? t('notInFavor')
        : '';

    return (
      <Card style={styles.fineCard as StyleProp<ViewStyle>}>
        <View style={styles.cardHeader}>
          <Text style={styles.fineNumber}>#{item.reportNumber}</Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveFine(item.reportNumber)}
          >
            <Text style={styles.removeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => handleViewFine(item.reportNumber)}
        >
          <View style={styles.fineDetails}>
            <Text style={styles.violationText}>{item.violation}</Text>
            <Text style={styles.dateText}>{item.date}</Text>
            <Text style={styles.locationText}>{item.location}</Text>
          </View>

          <View style={styles.fineAmount}>
            <Text style={styles.amountText}>{item.amount}</Text>

            {item.analysis?.result && resultColor && (
              <View
                style={[
                  styles.resultBadge,
                  { backgroundColor: resultColor + '20' },
                ]}
              >
                <Text style={[styles.resultText, { color: resultColor }]}>
                  {resultText}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('yourFines')}</Text>
      </View>

      {fines.length > 0 ? (
        <FlatList
          data={fines}
          keyExtractor={(item) => item.reportNumber}
          renderItem={renderFineItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t('noFines')}</Text>
        </View>
      )}

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.primary,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.medium,
    borderRadius: SIZES.base,
    ...SHADOWS.light,
  },
  addButtonText: {
    ...FONTS.semiBold,
    fontSize: SIZES.small,
    color: COLORS.white,
  },
  clearButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.error,
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.medium,
    borderRadius: SIZES.base,
    marginRight: SIZES.small,
  },
  clearButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.error,
  },
  listContent: {
    padding: SIZES.medium,
    paddingBottom: SIZES.extraLarge * 2,
  },
  fineCard: {
    marginBottom: SIZES.medium,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingBottom: SIZES.small,
  },
  fineNumber: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.error,
    marginTop: -2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SIZES.small,
  },
  fineDetails: {
    flex: 3,
  },
  violationText: {
    ...FONTS.semiBold,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: SIZES.small / 2,
  },
  dateText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: SIZES.small / 2,
  },
  locationText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  fineAmount: {
    flex: 1,
    alignItems: 'flex-end',
  },
  amountText: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SIZES.small,
  },
  resultBadge: {
    paddingHorizontal: SIZES.small,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.base,
  },
  resultText: {
    ...FONTS.medium,
    fontSize: SIZES.small - 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.large,
  },
  emptyText: {
    ...FONTS.medium,
    fontSize: SIZES.large,
    color: COLORS.gray,
    marginBottom: SIZES.large,
    textAlign: 'center',
  },
  reportButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.large,
    borderRadius: SIZES.base,
    ...SHADOWS.medium,
  },
  reportButtonText: {
    ...FONTS.semiBold,
    fontSize: SIZES.font,
    color: COLORS.white,
  },
});
