import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, I18nManager } from 'react-native';
import { router } from 'expo-router';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import Button from '../components/Button';
import Card from '../components/Card';
import InputField from '../components/InputField';
import { useLanguage } from '../localization/i18n';

export default function AdditionalInfoScreen() {
  const { t, locale } = useLanguage();
  const isRTL = locale === 'he';
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddImage = () => {
    // In a real app, this would use image picker functionality
    // For mock purposes, we're just adding a placeholder
    setImages([...images, { id: Date.now(), uri: 'placeholder' }]);
  };

  const handleRemoveImage = (id) => {
    setImages(images.filter(image => image.id !== id));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // In a real app, this would send the data to an API
    // For now, we just simulate a short delay
    setTimeout(() => {
      setIsSubmitting(false);
      
      // For demo purposes, we'll always navigate to Options
      // In a real app, this would depend on the result of the re-analysis
      router.push('/options');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={[
        styles.scrollContainer,
        { textAlign: isRTL ? 'right' : 'left' }
      ]}>
        <Text style={[
          styles.title,
          { textAlign: isRTL ? 'right' : 'left' }
        ]}>
          {t('additionalInformation')}
        </Text>
        
        <Card>
          <Text style={[
            styles.subtitle,
            { textAlign: isRTL ? 'right' : 'left' }
          ]}>
            {t('additionalInfoDesc')}
          </Text>
          
          <InputField
            label={t('yourStatement')}
            value={additionalInfo}
            onChangeText={setAdditionalInfo}
            placeholder={t('statementPlaceholder')}
            multiline
            numberOfLines={6}
          />
          
          <Text style={[
            styles.label,
            { textAlign: isRTL ? 'right' : 'left' }
          ]}>
            {t('supportingEvidence')}
          </Text>
          
          <View style={[
            styles.imagesContainer,
            { flexDirection: isRTL ? 'row-reverse' : 'row' }
          ]}>
            {images.map(image => (
              <View key={image.id} style={styles.imageContainer}>
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>Image</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.removeButton,
                    { right: isRTL ? 'auto' : -5, left: isRTL ? -5 : 'auto' }
                  ]}
                  onPress={() => handleRemoveImage(image.id)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={handleAddImage}
            >
              <Text style={styles.addImageText}>{t('addImage')}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={[
            styles.suggestionsContainer,
            { alignItems: isRTL ? 'flex-end' : 'flex-start' }
          ]}>
            <Text style={[
              styles.suggestionsTitle,
              { textAlign: isRTL ? 'right' : 'left', alignSelf: 'stretch' }
            ]}>
              {t('helpfulTips')}
            </Text>
            <Text style={[
              styles.suggestionText,
              { textAlign: isRTL ? 'right' : 'left', alignSelf: 'stretch' }
            ]}>
              {t('tip1')}
            </Text>
            <Text style={[
              styles.suggestionText,
              { textAlign: isRTL ? 'right' : 'left', alignSelf: 'stretch' }
            ]}>
              {t('tip2')}
            </Text>
            <Text style={[
              styles.suggestionText,
              { textAlign: isRTL ? 'right' : 'left', alignSelf: 'stretch' }
            ]}>
              {t('tip3')}
            </Text>
            <Text style={[
              styles.suggestionText,
              { textAlign: isRTL ? 'right' : 'left', alignSelf: 'stretch' }
            ]}>
              {t('tip4')}
            </Text>
          </View>
        </Card>
        
        <View style={[
          styles.buttonContainer,
          { flexDirection: isRTL ? 'row-reverse' : 'row' }
        ]}>
          <Button
            title={isSubmitting ? t('processing') : t('submitAdditionalInfo')}
            onPress={handleSubmit}
            disabled={isSubmitting}
          />
          <Button
            title={t('skip')}
            onPress={() => router.push('/options')}
            type="outline"
            style={styles.skipButton}
          />
        </View>
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
    marginBottom: SIZES.medium,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SIZES.large,
    lineHeight: SIZES.large * 1.2,
  },
  label: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: SIZES.base,
    marginTop: SIZES.medium,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SIZES.medium,
  },
  imageContainer: {
    width: 100,
    height: 100,
    marginRight: SIZES.small,
    marginBottom: SIZES.small,
    position: 'relative',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    ...FONTS.medium,
    color: COLORS.gray,
  },
  removeButton: {
    position: 'absolute',
    top: -SIZES.base,
    right: -SIZES.base,
    backgroundColor: COLORS.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    lineHeight: SIZES.medium,
  },
  addImageButton: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: SIZES.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    ...FONTS.medium,
    color: COLORS.primary,
    fontSize: SIZES.small,
  },
  suggestionsContainer: {
    backgroundColor: COLORS.background,
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    marginVertical: SIZES.medium,
  },
  suggestionsTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: SIZES.small,
  },
  suggestionText: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  buttonContainer: {
    marginTop: SIZES.medium,
  },
  skipButton: {
    marginTop: SIZES.small,
  },
});