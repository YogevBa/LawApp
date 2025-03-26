import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, I18nManager } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import Button from '../components/Button';
import InputField from '../components/InputField';
import Card from '../components/Card';
import { generateCancellationRequest } from '../services/openaiService';
import { useLanguage } from '../localization/i18n';
import { selectFineById } from '../store/finesSlice';

export default function CancellationRequestScreen() {
  const { t, locale } = useLanguage();
  const { fineId } = useLocalSearchParams();
  const isRTL = locale === 'he';
  const [requestType, setRequestType] = useState('');
  const [requestText, setRequestText] = useState('');
  const [suggestedText, setSuggestedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState(null);
  const [fineInfo, setFineInfo] = useState(null);
  
  // Fetch fine info from Redux store
  const fineFromStore = useSelector(state => selectFineById(state, fineId));
  
  useEffect(() => {
    if (fineId) {
      if (fineFromStore) {
        console.log("Found fine in Redux store:", fineFromStore);
        setFineInfo(fineFromStore);
      } else {
        // As a fallback, check AsyncStorage directly
        console.log("Fine not found in Redux store, checking AsyncStorage...");
        AsyncStorage.getItem('fines')
          .then(storedFines => {
            if (storedFines) {
              const parsedFines = JSON.parse(storedFines);
              if (parsedFines[fineId]) {
                console.log("Found fine in AsyncStorage:", parsedFines[fineId]);
                setFineInfo(parsedFines[fineId]);
              } else {
                console.log("Fine not found in AsyncStorage, using default values");
                // If still not found, use default values
                setFineInfo({
                  reportNumber: fineId,
                  date: new Date().toISOString().split('T')[0],
                  location: "Unknown location",
                  violation: "Traffic violation",
                  amount: "Unknown amount",
                  dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
                });
              }
            } else {
              console.log("No fines in AsyncStorage, using default values");
              // If no fines at all, use default values
              setFineInfo({
                reportNumber: fineId,
                date: new Date().toISOString().split('T')[0],
                location: "Unknown location",
                violation: "Traffic violation",
                amount: "Unknown amount",
                dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
              });
            }
          })
          .catch(error => {
            console.error("Error reading from AsyncStorage:", error);
            // On error, use default values
            setFineInfo({
              reportNumber: fineId,
              date: new Date().toISOString().split('T')[0],
              location: "Unknown location",
              violation: "Traffic violation",
              amount: "Unknown amount",
              dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
            });
          });
      }
    }
  }, [fineId, fineFromStore]);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Ensure we have the fine info needed for the cancellation request
      const fineDataToUse = fineInfo || {
        reportNumber: fineId || 'Unknown',
        date: new Date().toISOString().split('T')[0],
        location: 'Unknown location',
        violation: 'Traffic violation',
        amount: 'Unknown amount',
        dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], // 30 days from now
      };
      
      console.log("Generating cancellation request for fine:", fineDataToUse);
      
      try {
        // Use the actual API to generate the request
        const result = await generateCancellationRequest(
          fineDataToUse,
          requestText, // Pass current text as additional info if self-written
          requestType === 'ai' // fullAuto = true for AI-generated, false for suggestions
        );
        
        const generatedText = result.content;
        console.log("Generated cancellation request text received, length:", generatedText.length);
        
        // For AI-generated request, set the text directly
        if (requestType === 'ai') {
          setRequestText(generatedText);
        } else {
          // For self-written with suggestions, show the suggestions
          setSuggestedText(generatedText);
          setShowSuggestions(true);
        }
      } catch (apiError) {
        console.error("API error in handleGenerate:", apiError);
        setError(`${t('unableToGenerateRequest')}: ${apiError.message}`);
      }
    } catch (err) {
      console.error('Error in handleGenerate:', err);
      setError(t('unableToGenerateRequest'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImportInfo = () => {
    // Use the fine information we have
    let importedInfo = isRTL ? "אין מידע זמין על הדוח." : "No fine information available.";
    
    if (fineInfo) {
      if (isRTL) {
        importedInfo = `הדוח (מספר סימוכין: ${fineInfo.reportNumber}) הונפק בתאריך ${fineInfo.date} ב${fineInfo.location} עבור ${fineInfo.violation}. סכום הדוח הוא ${fineInfo.amount}.`;
      } else {
        importedInfo = `The fine (Reference: ${fineInfo.reportNumber}) was issued on ${fineInfo.date} at ${fineInfo.location} for ${fineInfo.violation}. The fine amount is ${fineInfo.amount}.`;
      }
    }
    
    setRequestText(requestText ? requestText + "\n\n" + importedInfo : importedInfo);
  };

  const handleAcceptSuggestion = () => {
    setRequestText(suggestedText);
    setShowSuggestions(false);
  };

  const handleSubmit = () => {
    // In a real app, this would submit the request to an API
    router.push('/confirmation');
  };

  const renderRequestForm = () => {
    if (!requestType) return null;
    
    return (
      <Card>
        {requestType === 'self' ? (
          <>
            <View style={[
              styles.formHeader, 
              { flexDirection: isRTL ? 'row-reverse' : 'row' }
            ]}>
              <Text style={styles.formTitle}>{t('writeYourOwnRequest')}</Text>
              <TouchableOpacity 
                style={styles.importButton}
                onPress={handleImportInfo}
              >
                <Text style={styles.importButtonText}>{t('importInformation')}</Text>
              </TouchableOpacity>
            </View>
            
            <InputField
              label={t('yourCancellationRequest')}
              value={requestText}
              onChangeText={setRequestText}
              placeholder={t('writeCancellationHere')}
              multiline
              numberOfLines={15}
              style={{ marginBottom: SIZES.large }}
            />
            
            {!showSuggestions ? (
              <Button
                title={t('getAiSuggestions')}
                onPress={handleGenerate}
                type="secondary"
                disabled={isGenerating || !requestText}
              />
            ) : (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>{t('aiSuggestions')}</Text>
                <Text style={styles.suggestedText}>{suggestedText}</Text>
                <View style={[
                  styles.suggestionsButtons,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' }
                ]}>
                  <Button
                    title={t('acceptSuggestions')}
                    onPress={handleAcceptSuggestion}
                    type="secondary"
                    width="48%"
                  />
                  <Button
                    title={t('ignore')}
                    onPress={() => setShowSuggestions(false)}
                    type="outline"
                    width="48%"
                  />
                </View>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.formTitle}>{t('aiGeneratedCancellationRequest')}</Text>
            <Text style={styles.formDescription}>
              {t('aiGeneratedCancellationDesc')}
            </Text>
            
            {isGenerating ? (
              <View style={styles.generatingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.generatingText}>{t('generatingRequest')}</Text>
                <Text style={styles.generatingSubtext}>{t('thisMightTakeTime')}</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <Button
                  title={t('tryAgain')}
                  onPress={handleGenerate}
                  type="outline"
                  style={{marginTop: SIZES.medium}}
                />
              </View>
            ) : (
              <InputField
                label={t('aiGeneratedRequestLabel')}
                value={requestText}
                onChangeText={setRequestText}
                placeholder={t('aiGeneratedRequestPlaceholder')}
                multiline
                numberOfLines={15}
                style={{ marginBottom: SIZES.large }}
              />
            )}
            
            {!requestText && !isGenerating && (
              <Button
                title={t('generateRequest')}
                onPress={handleGenerate}
                type="secondary"
              />
            )}
          </>
        )}
        
        {requestText && (
          <Button
            title={t('submitRequest')}
            onPress={handleSubmit}
            style={styles.submitButton}
          />
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>{t('cancellationRequestTitle')}</Text>
        
        {!requestType ? (
          <Card>
            <Text style={styles.subtitle}>
              {t('chooseCancellationMethod')}
            </Text>
            
            <TouchableOpacity 
              style={styles.optionCard}
              onPress={() => setRequestType('self')}
            >
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{t('selfWrittenRequest')}</Text>
                <Text style={styles.optionDescription}>
                  {t('selfWrittenRequestDesc')}
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.optionCard}
              onPress={() => setRequestType('ai')}
            >
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{t('aiGeneratedRequest')}</Text>
                <Text style={styles.optionDescription}>
                  {t('aiGeneratedRequestDesc')}
                </Text>
              </View>
            </TouchableOpacity>
          </Card>
        ) : (
          renderRequestForm()
        )}
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => requestType ? setRequestType('') : router.back()}
        >
          <Text style={styles.backButtonText}>
            {requestType ? t('backToOptions') : t('backToPreviousScreen')}
          </Text>
        </TouchableOpacity>
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
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.primary,
    marginBottom: SIZES.medium,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SIZES.large,
    lineHeight: SIZES.large * 1.2,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  optionCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.large,
    color: COLORS.primary,
    marginBottom: SIZES.small,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  optionDescription: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: SIZES.large * 1.2,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  formTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.large,
    color: COLORS.primary,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  formDescription: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: SIZES.large,
    lineHeight: SIZES.large * 1.2,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  importButton: {
    padding: SIZES.small,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.base,
  },
  importButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.secondary,
  },
  backButton: {
    marginTop: SIZES.large,
    paddingVertical: SIZES.small,
  },
  backButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.secondary,
  },
  submitButton: {
    marginTop: SIZES.large,
  },
  suggestionsContainer: {
    marginTop: SIZES.large,
    backgroundColor: COLORS.background,
    padding: SIZES.medium,
    borderRadius: SIZES.base,
  },
  suggestionsTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.medium,
    color: COLORS.primary,
    marginBottom: SIZES.small,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  suggestedText: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    marginBottom: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.success,
    borderStyle: 'dashed',
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  suggestionsButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  generatingContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.large,
    borderRadius: SIZES.base,
    alignItems: 'center',
    marginVertical: SIZES.large,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderStyle: 'dashed',
  },
  generatingText: {
    ...FONTS.semiBold,
    fontSize: SIZES.medium,
    color: COLORS.secondary,
    marginBottom: SIZES.small,
    textAlign: 'center', // Keep centered for both LTR and RTL
  },
  generatingSubtext: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.gray,
    textAlign: 'center', // Keep centered for both LTR and RTL
  },
  errorContainer: {
    padding: SIZES.medium,
    alignItems: 'center',
    backgroundColor: COLORS.error + '10', // 10% opacity
    borderRadius: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.error,
    marginVertical: SIZES.medium,
  },
  errorText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.error,
    textAlign: 'center', // Keep centered for both LTR and RTL
  },
});