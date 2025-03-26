import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { useLanguage } from '../localization/i18n';

const LanguageSelector = ({ onLanguageChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { locale, setLocale, t } = useLanguage();
  
  const handleLanguageSelect = async (languageCode) => {
    try {
      // If the selected language is the same as current, just close modal
      if (languageCode === locale) {
        setModalVisible(false);
        return;
      }
      
      // Change the language using the context
      const success = await setLocale(languageCode);
      
      if (success) {
        // Execute callback if provided
        if (onLanguageChange) {
          onLanguageChange(languageCode);
        }
        
        // Close modal
        setModalVisible(false);
        
        // Show success message
        Alert.alert(
          t('changeLanguage'),
          t('languageChanged'),
          [{ text: 'OK' }]
        );
        
        // Reload app (this should be implemented by the parent component)
        // In a real app, you might want to restart the app or reload screens
      } else {
        // Show error
        Alert.alert(
          'Error',
          'Failed to change language. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error selecting language:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.languageButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>{t('language')}</Text>
        <Text style={styles.currentLanguage}>
          {locale === 'en' ? t('english') : t('hebrew')}
        </Text>
      </TouchableOpacity>
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t('changeLanguage')}</Text>
            
            <TouchableOpacity 
              style={[
                styles.languageOption,
                locale === 'en' && styles.selectedLanguage
              ]}
              onPress={() => handleLanguageSelect('en')}
            >
              <Text style={styles.languageText}>English</Text>
              {locale === 'en' && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.languageOption,
                locale === 'he' && styles.selectedLanguage
              ]}
              onPress={() => handleLanguageSelect('he')}
            >
              <Text style={styles.languageText}>עברית</Text>
              {locale === 'he' && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  languageButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  buttonText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  currentLanguage: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.secondary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base,
    padding: SIZES.large,
    alignItems: 'center',
  },
  modalTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.primary,
    marginBottom: SIZES.large,
    textAlign: 'center',
  },
  languageOption: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.medium,
    marginBottom: SIZES.small,
    borderRadius: SIZES.base,
  },
  selectedLanguage: {
    backgroundColor: COLORS.primary + '20', // 20% opacity
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  languageText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  checkmark: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  cancelButton: {
    marginTop: SIZES.medium,
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.large,
    borderRadius: SIZES.base,
    backgroundColor: COLORS.lightGray,
  },
  cancelText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
});

export default LanguageSelector;