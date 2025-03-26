import React from 'react';
import { View, TextInput, Text, StyleSheet, I18nManager } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  error,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && { 
            height: numberOfLines > 1 ? SIZES.base * numberOfLines * 2.5 : SIZES.base * 10, 
            textAlignVertical: 'top',
            minHeight: 120 // Ensure a minimum height for multiline inputs
          },
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholderTextColor={COLORS.gray}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.medium,
    width: '100%',
  },
  label: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: SIZES.base / 2,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base / 2,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    color: COLORS.text,
    ...FONTS.regular,
    fontSize: SIZES.font,
    padding: SIZES.medium,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.error,
    marginTop: SIZES.base / 2,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
});

export default InputField;