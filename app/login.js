import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import Button from '../components/Button';
import Card from '../components/Card';
import InputField from '../components/InputField';
import { useLanguage } from '../localization/i18n';

export default function LoginScreen() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateInputs = () => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError(t('emailRequired'));
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(t('invalidEmail'));
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError(t('passwordRequired'));
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError(t('passwordLength'));
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = () => {
    if (validateInputs()) {
      // In a real app, we would authenticate with a server here
      console.log('Login with:', email, password);
      router.push('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.appTitle}>{t('appName')}</Text>
          <Text style={styles.appSubtitle}>{t('appSubtitle')}</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.title}>{t('login')}</Text>
          <Text style={styles.description}>
            {t('loginDesc')}
          </Text>

          <InputField
            label={t('email')}
            value={email}
            onChangeText={setEmail}
            placeholder={t('enterEmail')}
            keyboardType="email-address"
            error={emailError}
          />

          <InputField
            label={t('password')}
            value={password}
            onChangeText={setPassword}
            placeholder={t('enterPassword')}
            secureTextEntry={true}
            error={passwordError}
          />

          <TouchableOpacity 
            onPress={() => console.log('Forgot password')}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>{t('forgotPassword')}</Text>
          </TouchableOpacity>

          <Button 
            title={t('login')} 
            onPress={handleLogin} 
            style={styles.button}
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>{t('dontHaveAccount')} </Text>
            <TouchableOpacity onPress={() => console.log('Register pressed')}>
              <Text style={styles.registerLink}>{t('register')}</Text>
            </TouchableOpacity>
          </View>
        </Card>
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
    flexGrow: 1,
    padding: SIZES.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SIZES.extraLarge,
  },
  appTitle: {
    ...FONTS.bold,
    fontSize: SIZES.xxxl,
    color: COLORS.primary,
    marginBottom: SIZES.base,
  },
  appSubtitle: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 500,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.primary,
    marginBottom: SIZES.medium,
  },
  description: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SIZES.large,
    lineHeight: SIZES.large * 1.4,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: SIZES.large,
  },
  forgotPasswordText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.primary,
  },
  button: {
    width: '100%',
    marginBottom: SIZES.medium,
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.medium,
  },
  registerText: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  registerLink: {
    ...FONTS.semiBold,
    fontSize: SIZES.font,
    color: COLORS.primary,
  },
});