import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import Button from '../components/Button';
import Card from '../components/Card';
import InputField from '../components/InputField';
import { analyzeFineReport } from '../services/openaiService';
import { useLanguage } from '../localization/i18n';

export default function ReportNewFineScreen() {
  const { t } = useLanguage();
  const [selectedOption, setSelectedOption] = useState(null);
  const [fineDescription, setFineDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fineDate, setFineDate] = useState('');
  const [fineAmount, setFineAmount] = useState('');
  const [fineLocation, setFineLocation] = useState('');
  const [fineViolation, setFineViolation] = useState('');
  
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create a new fine ID
      const newFineId = `TR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Create a fine object based on the form data
      let fineData = {
        reportNumber: newFineId,
        date: fineDate || new Date().toISOString().split('T')[0],
        location: fineLocation || 'Unknown location',
        violation: fineViolation || 'Unspecified violation',
        amount: fineAmount || '$0.00',
        dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], // 30 days from now
        officerName: 'Unknown officer',
        badgeNumber: 'Unknown',
        description: fineDescription
      };
      
      try {
        // Pre-generate the analysis for this fine
        const analysisData = await analyzeFineReport(fineData);
        
        // Add the analysis to the fine data
        fineData.analysis = analysisData;
        
        // Add to global userFines if it exists
        if (!global.userFines) {
          global.userFines = [];
        }
        
        // Import functions from Redux store
        const { addFine } = require('../store/finesSlice');
        const store = require('../store/store').default;
        
        // Add to Redux store for proper persistence
        store.dispatch(addFine({
          reportNumber: newFineId,
          date: fineData.date,
          violation: fineData.violation,
          amount: fineData.amount,
          location: fineData.location,
          isPaid: false,
          analysis: analysisData  // Store the analysis with the fine
        }));
        
        // Also keep in global variable for backward compatibility
        global.userFines.push({
          id: newFineId,
          reportNumber: newFineId,
          date: fineData.date,
          violation: fineData.violation,
          amount: fineData.amount,
          location: fineData.location,
          isPaid: false,
          analysis: analysisData  // Store the analysis with the fine
        });
      } catch (analysisErr) {
        console.error('Error pre-generating analysis:', analysisErr);
        // Continue without analysis, the report-summary screen will try again
      }
      
      // Navigate to the report summary screen with the new fine ID
      router.push({
        pathname: '/report-summary',
        params: { fineId: newFineId, isNew: 'true' }
      });
    } catch (err) {
      console.error('Error submitting fine:', err);
      setError(t('errorSubmittingFine'));
      setIsLoading(false);
    }
  };
  
  const renderOptionContent = () => {
    switch(selectedOption) {
      case 'text':
        return (
          <Card style={styles.optionCard}>
            <Text style={styles.cardTitle}>{t('describeYourFine')}</Text>
            <Text style={styles.cardDescription}>
              {t('describeYourFineDesc')}
            </Text>
            
            <InputField
              label={t('dateOfFine')}
              placeholder={t('dateFormat')}
              keyboardType="numbers-and-punctuation"
              value={fineDate}
              onChangeText={setFineDate}
            />
            
            <InputField
              label={t('fineLocation')}
              placeholder={t('locationPlaceholder')}
              value={fineLocation}
              onChangeText={setFineLocation}
            />
            
            <InputField
              label={t('violationType')}
              placeholder={t('violationTypePlaceholder')}
              value={fineViolation}
              onChangeText={setFineViolation}
            />
            
            <InputField
              label={t('fineAmount')}
              placeholder={t('enterAmount')}
              keyboardType="decimal-pad"
              value={fineAmount}
              onChangeText={setFineAmount}
            />
            
            <Text style={styles.inputLabel}>{t('fineDetails')}</Text>
            <TextInput
              style={styles.textArea}
              placeholder={t('descPlaceholder')}
              multiline={true}
              numberOfLines={6}
              textAlignVertical="top"
              value={fineDescription}
              onChangeText={setFineDescription}
            />
          </Card>
        );
        
      case 'barcode':
        return (
          <Card style={styles.optionCard}>
            <Text style={styles.cardTitle}>{t('scanFineBarcode')}</Text>
            <Text style={styles.cardDescription}>
              {t('positionBarcode')}
            </Text>
            
            <View style={styles.barcodeScannerPlaceholder}>
              <View style={styles.scanArea}>
                <View style={styles.scanCorner} />
                <View style={[styles.scanCorner, { right: 0 }]} />
                <View style={[styles.scanCorner, { bottom: 0, left: 0 }]} />
                <View style={[styles.scanCorner, { bottom: 0, right: 0 }]} />
              </View>
              <Text style={styles.scanText}>{t('readyToScan')}</Text>
            </View>
            
            <Text style={styles.noteText}>
              {t('barcodeNote')}
            </Text>
          </Card>
        );
        
      case 'photo':
        return (
          <Card style={styles.optionCard}>
            <Text style={styles.cardTitle}>{t('photoFine')}</Text>
            <Text style={styles.cardDescription}>
              {t('photoFineDesc')}
            </Text>
            
            <View style={styles.cameraPlaceholder}>
              <Text style={styles.cameraPlaceholderText}>{t('readyToScan')}</Text>
              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.cameraButton}>
                  <View style={styles.innerCircle} />
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={styles.noteText}>
              {t('photoNote')}
            </Text>
          </Card>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>{t('reportNewFineTitle')}</Text>
        <Text style={styles.subtitle}>
          {t('reportNewFineSubtitle')}
        </Text>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={[
              styles.optionButton,
              selectedOption === 'text' && styles.selectedOption
            ]}
            onPress={() => setSelectedOption('text')}
          >
            <View style={styles.optionIcon}>
              <Text style={styles.optionIconText}>✏️</Text>
            </View>
            <Text style={styles.optionText}>{t('enterManually')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.optionButton,
              selectedOption === 'barcode' && styles.selectedOption
            ]}
            onPress={() => setSelectedOption('barcode')}
          >
            <View style={styles.optionIcon}>
              <Text style={styles.optionIconText}>📊</Text>
            </View>
            <Text style={styles.optionText}>{t('scanBarcode')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.optionButton,
              selectedOption === 'photo' && styles.selectedOption
            ]}
            onPress={() => setSelectedOption('photo')}
          >
            <View style={styles.optionIcon}>
              <Text style={styles.optionIconText}>📷</Text>
            </View>
            <Text style={styles.optionText}>{t('takePhoto')}</Text>
          </TouchableOpacity>
        </View>
        
        {renderOptionContent()}
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {selectedOption && (
          <Button 
            title={isLoading ? t('processing') : t('submitCase')}
            onPress={handleSubmit}
            disabled={isLoading || (selectedOption === 'text' && !fineDescription.trim())}
            style={styles.submitButton}
          />
        )}
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
    marginBottom: SIZES.large,
  },
  optionsContainer: {
    flexDirection: 'column',
    marginBottom: SIZES.large,
  },
  optionButton: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SIZES.large,
    borderRadius: SIZES.base,
    marginBottom: SIZES.medium,
    ...SHADOWS.light,
  },
  selectedOption: {
    backgroundColor: COLORS.secondary + '20', // 20% opacity
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
    backgroundColor: COLORS.background,
  },
  optionIconText: {
    fontSize: 24,
  },
  optionText: {
    ...FONTS.semiBold,
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  optionCard: {
    marginBottom: SIZES.large,
  },
  cardTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.large,
    color: COLORS.primary,
    marginBottom: SIZES.small,
  },
  cardDescription: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: SIZES.medium,
    lineHeight: SIZES.large * 1.2,
  },
  inputLabel: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: SIZES.small,
    marginTop: SIZES.small,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.base,
    padding: SIZES.small,
    fontSize: SIZES.font,
    fontFamily: 'System',
    color: COLORS.text,
    backgroundColor: COLORS.white,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  barcodeScannerPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
    borderRadius: SIZES.base,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SIZES.medium,
    overflow: 'hidden',
  },
  scanArea: {
    width: '80%',
    height: '60%',
    borderWidth: 2,
    borderColor: COLORS.white + '50',
    borderRadius: SIZES.small,
    position: 'relative',
  },
  scanCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: COLORS.white,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    left: 0,
    top: 0,
  },
  scanText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.white,
    marginTop: SIZES.small,
  },
  cameraPlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: '#000',
    borderRadius: SIZES.base,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SIZES.medium,
    position: 'relative',
  },
  cameraPlaceholderText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
  cameraControls: {
    position: 'absolute',
    bottom: SIZES.medium,
    width: '100%',
    alignItems: 'center',
  },
  cameraButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white + '30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  innerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
  },
  noteText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.gray,
    fontStyle: 'italic',
    marginTop: SIZES.small,
    lineHeight: SIZES.medium * 1.2,
  },
  submitButton: {
    marginBottom: SIZES.medium,
  },
  errorContainer: {
    backgroundColor: COLORS.error + '15', // 15% opacity
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    marginBottom: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  errorText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.error,
    textAlign: 'center',
  },
});