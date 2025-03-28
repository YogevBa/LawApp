import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import Button from '../components/Button';
import Card from '../components/Card';
import InputField from '../components/InputField';
import { useLanguage } from '../localization/i18n';
import { analyzeFine, addFine } from '../store/finesSlice';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';

export default function CustomCaseScreen() {
  const dispatch = useDispatch();
  const { t, locale } = useLanguage();
    const isRtl = locale === "he";
  
  const [formData, setFormData] = useState({
    fineNumber: '',
    issueDate: '',
    actionDateTime: '',
    offenseClauses: '',
    factualDescription: '',
    amount: '',
    location: '',
    violationType: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isDateTimePickerVisible, setDateTimePickerVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
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
    
    if (!formData.actionDateTime.trim()) {
      newErrors.actionDateTime = t('actionDateTimeRequired');
      isValid = false;
    }
    
    if (!formData.offenseClauses.trim()) {
      newErrors.offenseClauses = t('offenseClausesRequired');
      isValid = false;
    }
    
    if (!formData.factualDescription.trim()) {
      newErrors.factualDescription = t('factualDescriptionRequired');
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
  
  const showDateTimePicker = () => {
    setDateTimePickerVisible(true);
  };

  const hideDateTimePicker = () => {
    setDateTimePickerVisible(false);
  };

  const handleDateTimeConfirm = (dateTime) => {
    // Format date and time as MM/DD/YYYY HH:MM
    const formattedDateTime = `${(dateTime.getMonth()+1).toString().padStart(2, '0')}/${dateTime.getDate().toString().padStart(2, '0')}/${dateTime.getFullYear()} ${dateTime.getHours().toString().padStart(2, '0')}:${dateTime.getMinutes().toString().padStart(2, '0')}`;
    
    handleChange('actionDateTime', formattedDateTime);
    hideDateTimePicker();
  };
  
  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleDateConfirm = (date) => {
    // Format date as MM/DD/YYYY
    const formattedDate = `${(date.getMonth()+1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
    
    handleChange('issueDate', formattedDate);
    hideDatePicker();
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
          actionDateTime: formData.actionDateTime,
          offenseClauses: formData.offenseClauses,
          factualDescription: formData.factualDescription,
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text  style={
              isRtl
                ? [styles.title, styles.textRtl, { textAlign: "left" }]
                : styles.title
            }>{t('customCase')}</Text>
          <Text  style={
              isRtl
                ? [styles.subtitle, styles.textRtl, { textAlign: "left" }]
                : styles.subtitle
            }>
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

            <View style={styles.inputContainer}>
              <Text style={
                isRtl
                  ? [styles.inputLabel, { alignSelf:'flex-start' }]
                  : styles.inputLabel
              }>{t('issueDate')}</Text>
              <TouchableOpacity 
                style={styles.dateTimePicker}
                onPress={showDatePicker}
              >
                <View style={[styles.dateTimePickerContent, isRtl ? {flexDirection: 'row-reverse'} : {flexDirection: 'row'}]}>
                  <Text style={
                    formData.issueDate 
                      ? (isRtl ? [styles.dateTimeText, { textAlign: "right", flex: 1 }] : [styles.dateTimeText, { flex: 1 }]) 
                      : (isRtl ? [styles.dateTimePlaceholder, { textAlign: "right", flex: 1 }] : [styles.dateTimePlaceholder, { flex: 1 }])
                  }>
                    {formData.issueDate || t('dateFormat')}
                  </Text>
                  <Ionicons 
                    name="calendar" 
                    size={24} 
                    color={COLORS.primary} 
                    style={isRtl ? {marginRight: 8} : {marginLeft: 8}}
                  />
                </View>
              </TouchableOpacity>
              {errors.issueDate && <Text style={isRtl ? [styles.errorText, { textAlign: "right", alignSelf: "flex-end" }] : styles.errorText}>{errors.issueDate}</Text>}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={
                isRtl
                  ? [styles.inputLabel, { alignSelf: "flex-start" }]
                  : styles.inputLabel
              }>{t('actionDateTime')}</Text>
              <TouchableOpacity 
                style={styles.dateTimePicker}
                onPress={showDateTimePicker}
              >
                <View style={[styles.dateTimePickerContent, isRtl ? {flexDirection: 'row-reverse'} : {flexDirection: 'row'}]}>
                  <Text style={
                    formData.actionDateTime 
                      ? (isRtl ? [styles.dateTimeText, { textAlign: "right", flex: 1 }] : [styles.dateTimeText, { flex: 1 }]) 
                      : (isRtl ? [styles.dateTimePlaceholder, { textAlign: "right", flex: 1 }] : [styles.dateTimePlaceholder, { flex: 1 }])
                  }>
                    {formData.actionDateTime || t('selectDateAndTime')}
                  </Text>
                  <Ionicons 
                    name="calendar" 
                    size={24} 
                    color={COLORS.primary} 
                    style={isRtl ? {marginRight: 8} : {marginLeft: 8}}
                  />
                </View>
              </TouchableOpacity>
              {errors.actionDateTime && <Text style={isRtl ? [styles.errorText, { textAlign: "right", alignSelf: "flex-end" }] : styles.errorText}>{errors.actionDateTime}</Text>}
            </View>
            
            <InputField
              label={t('offenseClauses')}
              value={formData.offenseClauses}
              onChangeText={(text) => handleChange('offenseClauses', text)}
              placeholder={t('offenseClausesPlaceholder')}
              multiline={true}
              numberOfLines={3}
              error={errors.offenseClauses}
            />
            
            <View style={{ height: 30 }} />
            
            <DateTimePickerModal
              isVisible={isDateTimePickerVisible}
              mode="datetime"
              onConfirm={handleDateTimeConfirm}
              onCancel={hideDateTimePicker}
            />
            
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleDateConfirm}
              onCancel={hideDatePicker}
            />
            
            <View style={{ marginTop: 40 }}>
              <InputField
                label={t('factualDescription')}
                value={formData.factualDescription}
                onChangeText={(text) => handleChange('factualDescription', text)}
                placeholder={t('factualDescriptionPlaceholder')}
                multiline={true}
                numberOfLines={3}
                error={errors.factualDescription}
                style={{ marginBottom: 20 }}
              />
            </View>

            <View style={{ height: 60 }} />

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
              placeholder={t('descriptionOfIncidentPlaceholder')}
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
                        
                        // Generate a random time for actionDateTime
                        const hours = Math.floor(Math.random() * 24).toString().padStart(2, '0');
                        const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
                        const actionDateTime = `${formattedDate} ${hours}:${minutes}`;
                        
                        // Sample offense clauses
                        const offenseClauses = [
                          'Traffic Ordinance § 27B, § 62A',
                          'Road Safety Act § 12, § 144B',
                          'Municipal Code § 510, § 322.1',
                          'Highway Code § 65, § 72',
                          'Traffic Regulations § 38, § 41'
                        ];
                        
                        // Sample factual descriptions
                        const factualDescriptions = [
                          'Vehicle observed traveling at 65 km/h in a 50 km/h zone. Speed measured by radar. Driver was alone in vehicle.',
                          'Vehicle parked in no parking zone. Signage clearly visible. Vehicle unattended at time of citation.',
                          'Driver failed to stop at red light at intersection. Proceeded through intersection while signal was red.',
                          'Vehicle observed making illegal U-turn in prohibited area. Driver admitted to officer they were aware of prohibition.',
                          'Driver observed using handheld mobile device while operating vehicle. Phone held to ear for approximately 30 seconds.'
                        ];
                        
                        setFormData({
                          ...formData,
                          // Only fill if not already filled
                          issueDate: formData.issueDate || formattedDate,
                          actionDateTime: formData.actionDateTime || actionDateTime,
                          offenseClauses: formData.offenseClauses || offenseClauses[Math.floor(Math.random() * offenseClauses.length)],
                          factualDescription: formData.factualDescription || factualDescriptions[Math.floor(Math.random() * factualDescriptions.length)],
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
  textRtl: {
    alignItems: "flex-start",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: SIZES.medium,
    paddingBottom: 100, // Add extra padding at the bottom to ensure visibility of buttons
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
    marginBottom: SIZES.large,
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
  inputContainer: {
    marginBottom: SIZES.medium,
  },
  inputLabel: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  dateTimePicker: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.base,
    paddingHorizontal: SIZES.font,
    justifyContent: 'center',
  },
  dateTimePickerContent: {
    width: '100%',
    alignItems: 'center',
  },
  dateTimeText: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  dateTimePlaceholder: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.lightGray,
  },
  errorText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.error || 'red',
    marginTop: 5,
  },
});