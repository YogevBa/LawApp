import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import Button from '../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../localization/i18n';

export default function ScanBarcodeScreen() {
  const { t } = useLanguage();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);

  // In a real app, we would request camera permissions here
  useEffect(() => {
    // Simulating camera permission request
    setTimeout(() => {
      setHasPermission(true);
    }, 1000);
  }, []);

  const handleBarCodeScanned = () => {
    setScanned(true);
    setScanning(false);
    
    // Simulate a successful scan
    Alert.alert(
      t('barcodeScanned'),
      t('barcodeScannedMessage', { fineId: 'TF-2023-45678' }),
      [
        {
          text: t('cancel'),
          style: 'cancel',
          onPress: () => setScanned(false)
        },
        {
          text: t('proceed'),
          onPress: () => router.push('/report-summary'),
        }
      ]
    );
  };
  
  const startScan = () => {
    setScanning(true);
    setScanned(false);
    
    // Simulate scanning process
    setTimeout(() => {
      handleBarCodeScanned();
    }, 2000);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('requestingCameraPermission')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionDeniedContainer}>
          <Ionicons name="camera-off-outline" size={64} color={COLORS.error} />
          <Text style={styles.permissionTitle}>{t('cameraAccessRequired')}</Text>
          <Text style={styles.permissionText}>
            {t('cameraPermissionMessage')}
          </Text>
          <Button
            title={t('backToHome')}
            onPress={() => router.back()}
            type="primary"
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('scanFineBarcode')}</Text>
        <Text style={styles.subtitle}>
          {t('positionBarcode')}
        </Text>
      </View>

      <View style={styles.scannerContainer}>
        {scanning ? (
          <>
            <View style={styles.scanArea}>
              <View style={styles.scanCorner} />
              <View style={[styles.scanCorner, styles.topRight]} />
              <View style={[styles.scanCorner, styles.bottomLeft]} />
              <View style={[styles.scanCorner, styles.bottomRight]} />
            </View>
            <Text style={styles.scanningText}>{t('scanning')}</Text>
          </>
        ) : (
          <View style={styles.cameraPlaceholder}>
            <Ionicons name="barcode-outline" size={100} color={COLORS.gray} />
            <Text style={styles.placeholderText}>{t('readyToScan')}</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {!scanning && !scanned && (
          <Button
            title={t('scanBarcode')}
            onPress={startScan}
            type="primary"
            style={styles.button}
          />
        )}
        
        {scanning && !scanned && (
          <Button
            title={t('cancelScan')}
            onPress={() => setScanning(false)}
            type="outline"
            style={styles.button}
          />
        )}
        
        {scanned && (
          <>
            <Button
              title={t('scanAgain')}
              onPress={() => setScanned(false)}
              type="primary"
              style={styles.button}
            />
            <View style={styles.buttonGap} />
            <Button
              title={t('goBack')}
              onPress={() => router.back()}
              type="outline"
              style={styles.button}
            />
          </>
        )}
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>{t('instructions')}:</Text>
        <View style={styles.instructionItem}>
          <View style={styles.instructionBullet} />
          <Text style={styles.instructionText}>{t('barcodeInstruction1')}</Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={styles.instructionBullet} />
          <Text style={styles.instructionText}>{t('barcodeInstruction2')}</Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={styles.instructionBullet} />
          <Text style={styles.instructionText}>{t('barcodeInstruction3')}</Text>
        </View>
      </View>

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
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: SIZES.medium,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: SIZES.base,
  },
  cameraPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...FONTS.medium,
    fontSize: SIZES.large,
    color: COLORS.gray,
    marginTop: SIZES.small,
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  scanCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: COLORS.primary,
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    right: 0,
    left: undefined,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    top: undefined,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: undefined,
    left: undefined,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanningText: {
    ...FONTS.semiBold,
    fontSize: SIZES.medium,
    color: COLORS.primary,
    marginTop: SIZES.large,
  },
  buttonContainer: {
    padding: SIZES.medium,
  },
  button: {
    width: '100%',
  },
  buttonGap: {
    height: 12,
  },
  instructions: {
    padding: SIZES.medium,
    backgroundColor: 'rgba(0,0,0,0.03)',
    marginHorizontal: SIZES.medium,
    marginBottom: SIZES.medium,
    borderRadius: SIZES.base,
  },
  instructionTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: SIZES.small,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.small / 2,
  },
  instructionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: SIZES.small,
  },
  instructionText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.medium,
  },
  loadingText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  permissionDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.medium,
  },
  permissionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.error,
    marginTop: SIZES.medium,
    marginBottom: SIZES.small,
  },
  permissionText: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.large,
  },
});