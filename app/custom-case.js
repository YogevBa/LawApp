import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import Button from '../components/Button';
import Card from '../components/Card';
import InputField from '../components/InputField';
import { useLanguage } from '../localization/i18n';
import { analyzeFine, addFine } from '../store/finesSlice';

export default function CustomCaseScreen() {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    fineNumber: '',
    issueDate: '',
    amount: '',
    location: '',
    violationType: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!formData.fineNumber.trim()) {
      newErrors.fineNumber = t('fineNumberRequired');
      isValid = false;
    }

    if (!formData.issueDate.trim()) {
      newErrors.issueDate = t('issueDateRequired');
      isValid = false;
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.issueDate.trim())) {
      newErrors.issueDate = t('dateFormatInvalid');
      isValid = false;
    }

    if (!formData.amount.trim()) {
      newErrors.amount = t('amountRequired');
      isValid = false;
    } else if (isNaN(parseFloat(formData.amount))) {
      newErrors.amount = t('amountInvalid');
      isValid = false;
    }

    if (!formData.location.trim()) {
      newErrors.location = t('locationRequired');
      isValid = false;
    }

    if (!formData.violationType.trim()) {
      newErrors.violationType = t('violationTypeRequired');
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = t('descriptionRequired');
      isValid = false;
    } else if (formData.description.trim().length < 20) {
      newErrors.description = t('descriptionTooShort');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    
    // Clear error when user types
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setIsAnalyzing(true);
        console.log("Submit button clicked, form is valid");
        
        // Convert formData to the format expected by analyzeFineReport
        const fineReport = {
          reportNumber: formData.fineNumber,
          date: formData.issueDate,
          location: formData.location,
          violation: formData.violationType,
          amount: formData.amount,
          dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], // 30 days from now
          officerName: 'Not specified',
          badgeNumber: 'Not specified',
          description: formData.description // Include the description for better analysis
        };
        
        console.log("Created fine report object:", fineReport);
        
        // First add the fine to the Redux store
        console.log("Dispatching addFine action");
        dispatch(addFine(fineReport));
        
        // Then dispatch the async analysis action
        console.log("Dispatching analyzeFine action");
        const resultAction = await dispatch(analyzeFine(fineReport));
        
        console.log("Result action received:", resultAction);
        
        // Check if the action was fulfilled
        if (analyzeFine.fulfilled.match(resultAction)) {
          console.log("Action was fulfilled");
          const analysis = resultAction.payload.analysis;
          console.log("Analysis received from OpenAI:", analysis);
          
          setIsAnalyzing(false);
          
          // Navigate to report summary with the analysis
          console.log("Navigating to report summary with analysis");
          router.push({
            pathname: '/report-summary',
            params: { 
              fineId: fineReport.reportNumber,
              isNew: 'true',
              analysis: JSON.stringify(analysis)
            }
          });
        } else {
          console.error("Action was not fulfilled:", resultAction);
          throw new Error('Analysis failed');
        }
      } catch (error) {
        console.error('Error analyzing fine report:', error);
        setIsAnalyzing(false);
        
        // Show fallback alert if analysis fails
        Alert.alert(
          t('caseSubmitted'),
          t('caseSubmittedMessage'),
          [
            {
              text: t('ok'),
              onPress: () => router.push('/report-summary'),
            },
          ]
        );
      }
    } else {
      console.log('Form validation failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>{t('customCase')}</Text>
          <Text style={styles.subtitle}>
            {t('customCaseDescription')}
          </Text>

          <Card style={styles.card}>
            <InputField
              label={t('fineNumber')}
              value={formData.fineNumber}
              onChangeText={(text) => handleChange('fineNumber', text)}
              placeholder={t('enterFineNumber')}
              error={errors.fineNumber}
            />

            <InputField
              label={t('issueDate')}
              value={formData.issueDate}
              onChangeText={(text) => handleChange('issueDate', text)}
              placeholder={t('dateFormat')}
              keyboardType="numeric"
              error={errors.issueDate}
            />

            <InputField
              label={t('fineAmount')}
              value={formData.amount}
              onChangeText={(text) => handleChange('amount', text)}
              placeholder={t('enterAmount')}
              keyboardType="numeric"
              error={errors.amount}
            />

            <InputField
              label={t('location')}
              value={formData.location}
              onChangeText={(text) => handleChange('location', text)}
              placeholder={t('locationPlaceholder')}
              error={errors.location}
            />

            <InputField
              label={t('violationType')}
              value={formData.violationType}
              onChangeText={(text) => handleChange('violationType', text)}
              placeholder={t('violationTypePlaceholder')}
              error={errors.violationType}
            />

            <InputField
              label={t('descriptionOfIncident')}
              value={formData.description}
              onChangeText={(text) => handleChange('description', text)}
              placeholder={t('descriptionPlaceholder')}
              multiline={true}
              numberOfLines={6}
              error={errors.description}
            />

            <View style={styles.buttonContainer}>
              {isAnalyzing ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>{t('analyzingCase')}</Text>
                </View>
              ) : (
                <>
                  <View style={{marginBottom: SIZES.medium}}>
                    <Button
                      title={t('submitCase')}
                      onPress={handleSubmit}
                      type="primary"
                      style={styles.button}
                    />
                  </View>
                  
                  <View style={styles.buttonRow}>
                    <Button
                      title={t('cancel')}
                      onPress={() => router.back()}
                      type="outline"
                      style={{flex: 1}}
                    />
                    
                    <TouchableOpacity 
                      style={styles.fillDataButton}
                      onPress={() => {
                        // Fill the form with random test data
                        const violations = [
                          'Exceeding speed limit by 15km/h', 
                          'Running a red light', 
                          'Illegal parking',
                          'Using cell phone while driving',
                          'Failure to yield right of way'
                        ];
                        const locations = [
                          'Main Street, Downtown', 
                          'Highway 101, Exit 23', 
                          'Oak Avenue, City Center',
                          '123 Pine Road, Suburban Area',
                          'Maple Drive, Shopping District'
                        ];
                        
                        // Generate a date in MM/DD/YYYY format
                        const today = new Date();
                        const randomDaysAgo = Math.floor(Math.random() * 60); // Random day up to 60 days ago
                        const date = new Date(today);
                        date.setDate(date.getDate() - randomDaysAgo);
                        const formattedDate = `${(date.getMonth()+1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
                        
                        setFormData({
                          ...formData,
                          // Only fill if not already filled
                          issueDate: formData.issueDate || formattedDate,
                          amount: formData.amount || `$${Math.floor(100 + Math.random() * 300)}`,
                          location: formData.location || locations[Math.floor(Math.random() * locations.length)],
                          violationType: formData.violationType || violations[Math.floor(Math.random() * violations.length)],
                          description: formData.description || `I believe this fine was issued incorrectly. I was driving carefully and following all traffic rules. The officer may have confused my vehicle with another. I'm requesting a review of this fine based on the circumstances.`
                        });
                      }}
                    >
                      <Text style={styles.fillDataButtonText}>Fill Test Data</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
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
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: SIZES.large,
  },
  card: {
    width: '100%',
    padding: SIZES.medium,
  },
  buttonContainer: {
    marginTop: SIZES.large,
  },
  button: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.medium,
  },
  loadingText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.primary,
    marginTop: SIZES.small,
  },
  fillDataButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.font,
    borderRadius: SIZES.base,
    marginLeft: SIZES.medium,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fillDataButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.secondary,
  },
});