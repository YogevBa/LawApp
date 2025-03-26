import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, Alert, TouchableOpacity, Modal, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import Button from '../components/Button';
import Card from '../components/Card';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useLanguage } from '../localization/i18n';

// Import the necessary Expo packages
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export default function UploadDocumentScreen() {
  const { t } = useLanguage();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Request permissions when component mounts
  useEffect(() => {
    (async () => {
      // Request camera permissions
      await ImagePicker.requestCameraPermissionsAsync();
      // Request media library permissions 
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    })();
  }, []);

  // Implementation for file access with simulator fallback
  const handleUpload = async (source) => {
    setUploading(true);
    
    try {
      let result;
      let sourceText;
      
      // Check if we're running in a simulator/emulator
      const isSimulator = __DEV__ || 
                         (Platform.OS === 'ios' && Constants.executionEnvironment !== 'standalone');
      
      if (source === 'photos') {
        sourceText = t('photoLibrary');
        
        if (isSimulator) {
          // In simulator, use mock data
          Alert.alert(
            t('simulatorDetected'),
            t('simulatorPhotosMsg'),
            [{ text: t('ok') }]
          );
          
          // Wait a moment to simulate picker
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Sample image data for simulator
          const mockResult = {
            uri: 'https://picsum.photos/id/237/400/600', // Random dog image from Lorem Picsum
            width: 400,
            height: 600,
            fileName: 'sample_photo.jpg',
            fileSize: 240000
          };
          
          const newFile = {
            id: Date.now().toString(),
            name: 'sample_photo.jpg',
            type: 'image/jpeg',
            size: '234 KB',
            source: sourceText + ' (Sample)',
            uri: mockResult.uri,
            thumbnail: mockResult.uri,
            isSample: true
          };
          
          setUploadedFiles([...uploadedFiles, newFile]);
        } else {
          // On real device, use actual photo picker
          // Request permissions first
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          
          if (status !== 'granted') {
            Alert.alert(t('permissionDenied'), t('photoLibraryPermissionMsg'));
            setUploading(false);
            return;
          }
          
          // Launch photo picker
          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
          
          if (!result.canceled && result.assets) {
            const asset = result.assets[0];
            
            // Get file info
            const fileInfo = await FileSystem.getInfoAsync(asset.uri);
            
            const newFile = {
              id: Date.now().toString(),
              name: asset.fileName || `Photo_${Math.floor(Math.random() * 1000)}.jpg`,
              type: 'image/jpeg',
              size: `${Math.round((fileInfo.size || asset.fileSize || 0) / 1024)} KB`,
              source: sourceText,
              uri: asset.uri,
              thumbnail: asset.uri,
            };
            
            setUploadedFiles([...uploadedFiles, newFile]);
          }
        }
      }
      else if (source === 'files') {
        sourceText = t('filesOnDevice');
        
        if (isSimulator) {
          // In simulator, use mock data
          Alert.alert(
            t('simulatorDetected'),
            t('simulatorFilesMsg'),
            [{ text: t('ok') }]
          );
          
          // Wait a moment to simulate picker
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Choose random sample file type
          const fileTypes = [
            { name: 'Traffic_Ticket.pdf', type: 'application/pdf', size: 567 },
            { name: 'Speeding_Fine.jpg', type: 'image/jpeg', size: 342, 
              uri: 'https://picsum.photos/id/1/400/600' },
            { name: 'Parking_Violation.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 125 }
          ];
          
          const randomFile = fileTypes[Math.floor(Math.random() * fileTypes.length)];
          
          const newFile = {
            id: Date.now().toString(),
            name: randomFile.name,
            type: randomFile.type,
            size: `${randomFile.size} KB`,
            source: sourceText + ' (Sample)',
            uri: randomFile.uri || null,
            thumbnail: randomFile.type.startsWith('image/') ? randomFile.uri : null,
            isSample: true
          };
          
          setUploadedFiles([...uploadedFiles, newFile]);
        } else {
          // On real device, use actual document picker
          // DocumentPicker doesn't require explicit permission on most platforms
          result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'image/*'],
            copyToCacheDirectory: true
          });
          
          if (result.canceled === false) {
            const asset = result.assets[0];
            
            // Check if file exists and get info
            const fileInfo = await FileSystem.getInfoAsync(asset.uri);
            
            const newFile = {
              id: Date.now().toString(),
              name: asset.name,
              type: asset.mimeType || 'application/pdf',
              size: `${Math.round((fileInfo.size || asset.size || 0) / 1024)} KB`,
              source: sourceText,
              uri: asset.uri,
              thumbnail: asset.mimeType && asset.mimeType.startsWith('image/') ? asset.uri : null,
            };
            
            setUploadedFiles([...uploadedFiles, newFile]);
          }
        }
      }
      else if (source === 'drive') {
        sourceText = t('googleDrive');
        
        // In a real app, this would integrate with Google Drive API
        // But for this simulation, we'll just create a mock result
        
        // Simulate Google Drive picker
        setTimeout(() => {
          // Simulate a user selecting a file from Drive
          const mockResult = {
            success: true,
            fileName: 'fine_document.pdf',
            fileSize: 3400000,
            fileType: 'application/pdf',
            downloadUrl: 'https://drive.google.com/mock/file/url',
          };
          
          if (mockResult.success) {
            const newFile = {
              id: Date.now().toString(),
              name: mockResult.fileName,
              type: mockResult.fileType,
              size: `${Math.round((mockResult.fileSize || 3400000) / 1024)} KB`,
              source: sourceText,
              uri: mockResult.downloadUrl,
              thumbnail: null,
            };
            
            setUploadedFiles([...uploadedFiles, newFile]);
          }
          
          setUploading(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert(t('errorPickingDoc'), t('errorPickingDocMsg'));
      setUploading(false);
    }
  };
  
  const handleTakePhoto = async () => {
    setUploading(true);
    
    try {
      // Check if we're running in a simulator/emulator
      const isSimulator = __DEV__ || 
                         (Platform.OS === 'ios' && Constants.executionEnvironment !== 'standalone');
      
      if (isSimulator) {
        // In simulator, use mock data
        Alert.alert(
          t('simulatorDetected'),
          t('simulatorCameraMsg'),
          [{ text: t('ok') }]
        );
        
        // Wait a moment to simulate camera
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Sample image data for simulator
        const mockResult = {
          uri: 'https://picsum.photos/id/1025/400/600', // Random animal image from Lorem Picsum
          width: 400,
          height: 600,
          fileName: 'camera_photo.jpg',
          fileSize: 350000
        };
        
        const newFile = {
          id: Date.now().toString(),
          name: 'Camera_Photo.jpg',
          type: 'image/jpeg',
          size: '342 KB',
          source: 'Camera (Sample)',
          uri: mockResult.uri,
          thumbnail: mockResult.uri,
          isSample: true
        };
        
        setUploadedFiles([...uploadedFiles, newFile]);
      } else {
        // On real device, use actual camera
        // Request camera permissions first
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert(t('permissionDenied'), t('cameraPermissionMsg'));
          setUploading(false);
          return;
        }
        
        // Launch camera
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
        
        if (!result.canceled && result.assets) {
          const asset = result.assets[0];
          
          // Get file info
          const fileInfo = await FileSystem.getInfoAsync(asset.uri);
          
          const newFile = {
            id: Date.now().toString(),
            name: asset.fileName || 'Camera_Photo.jpg',
            type: 'image/jpeg',
            size: `${Math.round((fileInfo.size || asset.fileSize || 0) / 1024)} KB`,
            source: 'Camera',
            uri: asset.uri,
            thumbnail: asset.uri,
          };
          
          setUploadedFiles([...uploadedFiles, newFile]);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert(t('errorPickingDoc'), t('errorTakingPhoto'));
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (id) => {
    Alert.alert(
      t('removeFile'),
      t('removeFileConfirm'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('removeFile'),
          style: 'destructive',
          onPress: () => {
            const updatedFiles = uploadedFiles.filter(file => file.id !== id);
            setUploadedFiles(updatedFiles);
          }
        }
      ]
    );
  };

  // Generate a fine based on the uploaded document
  const generateFineDetails = () => {
    // Generate random violation types based on uploaded files
    const violationTypes = [
      'Exceeding speed limit',
      'Running a red light',
      'Illegal parking',
      'Failure to yield right of way',
      'Driving without valid license',
      'Improper lane change',
      'Using mobile phone while driving'
    ];
    
    const locations = [
      'Main Street', 
      'Downtown', 
      'Highway 101', 
      'City Center', 
      'Park Avenue',
      'School Zone'
    ];
    
    // Generate random fine amount between $50 and $500
    const amount = Math.floor(Math.random() * 450 + 50);
    
    // Generate random date within last 30 days
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
    const date = pastDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Generate random ID
    const id = `TR-${today.getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;
    
    // Check uploaded file types to determine violation
    let violation = violationTypes[Math.floor(Math.random() * violationTypes.length)];
    
    // If we have image files, assume it's a photo-based evidence
    if (uploadedFiles.some(file => file.type.startsWith('image/'))) {
      if (violation.includes('speed')) {
        violation += ' captured by traffic camera';
      } else if (violation.includes('red light')) {
        violation += ' captured by intersection camera';
      } else if (violation.includes('parking')) {
        violation += ' reported by parking enforcement';
      }
    }
    
    return {
      id,
      date,
      violation,
      amount,
      location: locations[Math.floor(Math.random() * locations.length)],
      isPaid: false,
      documents: uploadedFiles.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        uri: file.uri || null,
        isSample: file.isSample || false
      }))
    };
  };
  
  const handleSubmit = () => {
    if (uploadedFiles.length === 0) {
      Alert.alert(
        t('noFiles'),
        t('noFilesMsg')
      );
      return;
    }
    
    // Create fine object based on uploaded files
    const fineDetails = generateFineDetails();
    
    // Generate an AI analysis for the fine
    const mockAnalysisResults = [
      {
        summary: "This fine appears to be for exceeding the speed limit. Based on the evidence provided, there may be grounds to contest this fine if there were extenuating circumstances like unclear signage or an emergency situation.",
        keyPoints: [
          "Traffic camera evidence can sometimes be challenged on technical grounds",
          "The specific location may have known issues with signage visibility",
          "Weather conditions on the date of the violation could be relevant"
        ],
        recommendation: "Consider submitting an appeal with evidence of any mitigating circumstances. Photos of unclear signage or documentation of an emergency would strengthen your case.",
        result: "partially"
      },
      {
        summary: "This violation for running a red light seems to be properly documented with clear evidence. The fine amount is standard for this type of violation in most jurisdictions.",
        keyPoints: [
          "Red light violations are typically well-documented by intersection cameras",
          "The fine amount is within the standard range for this violation",
          "No procedural errors are evident in the documentation"
        ],
        recommendation: "Based on the available information, paying the fine would be the most straightforward option. If there were exceptional circumstances, you could provide additional evidence.",
        result: "correct"
      },
      {
        summary: "This parking violation appears to have been incorrectly issued. The documentation is incomplete and there may be grounds for dismissal based on the provided evidence.",
        keyPoints: [
          "The officer's documentation seems to be missing critical information",
          "The date and time of the alleged violation have inconsistencies",
          "Similar cases have been successfully appealed in the past"
        ],
        recommendation: "Submit an appeal highlighting the documentation errors and inconsistencies. Request a dismissal based on insufficient evidence.",
        result: "incorrect"
      }
    ];
    
    // Select a random analysis result
    const randomAnalysis = mockAnalysisResults[Math.floor(Math.random() * mockAnalysisResults.length)];
    
    // Add the analysis to the fine details
    fineDetails.analysis = randomAnalysis;
    
    // In a real app, we would save this to AsyncStorage or a database
    // For now, we'll use global variable to simulate storage
    // This is just for demo purposes - in a real app, use proper state management
    
    if (!global.userFines) {
      global.userFines = [];
    }
    
    global.userFines.unshift(fineDetails); // Add to beginning of array
    
    Alert.alert(
      t('fineProcessed'),
      t('fineProcessedMsg'),
      [
        {
          text: t('viewFine'),
          onPress: () => {
            // Navigate to fines list with the new fine ID as a parameter
            router.push({
              pathname: '/(tabs)/fines',
              params: { highlightFineId: fineDetails.id }
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>{t('uploadFineDocument')}</Text>
        <Text style={styles.subtitle}>
          {t('uploadDocumentSubtitle')}
        </Text>

        <Card style={styles.card}>
          <View style={styles.uploadArea}>
            <Ionicons name="cloud-upload-outline" size={60} color={COLORS.primary} />
            <Text style={styles.uploadText}>{t('uploadYourFineDocument')}</Text>
            <View style={styles.uploadButtonsContainer}>
              <Button
                title={t('uploadFile')}
                onPress={() => setModalVisible(true)}
                type="primary"
                style={styles.uploadButton}
                disabled={uploading}
              />
              <View style={styles.buttonGap} />
              <Button
                title={t('takeNewPhoto')}
                onPress={handleTakePhoto}
                type="outline"
                style={styles.uploadButton}
                disabled={uploading}
              />
            </View>
            {uploading && (
              <Text style={styles.uploadingText}>{t('processing')}</Text>
            )}
          </View>
          
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t('selectSource')}</Text>
                  <TouchableOpacity 
                    style={styles.modalCloseButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color={COLORS.text} />
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  style={styles.modalOption}
                  onPress={() => {
                    setModalVisible(false);
                    handleUpload('photos');
                  }}
                >
                  <Ionicons name="images-outline" size={28} color={COLORS.primary} />
                  <View style={styles.modalOptionTextContainer}>
                    <Text style={styles.modalOptionTitle}>{t('photoLibrary')}</Text>
                    <Text style={styles.modalOptionDescription}>{t('selectFromPhotos')}</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalOption}
                  onPress={() => {
                    setModalVisible(false);
                    handleUpload('files');
                  }}
                >
                  <Ionicons name="folder-outline" size={28} color={COLORS.primary} />
                  <View style={styles.modalOptionTextContainer}>
                    <Text style={styles.modalOptionTitle}>{t('filesOnDevice')}</Text>
                    <Text style={styles.modalOptionDescription}>{t('browseDeviceFiles')}</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalOption}
                  onPress={() => {
                    setModalVisible(false);
                    handleUpload('drive');
                  }}
                >
                  <Ionicons name="cloud-outline" size={28} color={COLORS.primary} />
                  <View style={styles.modalOptionTextContainer}>
                    <Text style={styles.modalOptionTitle}>{t('googleDrive')}</Text>
                    <Text style={styles.modalOptionDescription}>{t('accessCloudStorage')}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {uploadedFiles.length > 0 && (
            <View style={styles.fileListContainer}>
              <Text style={styles.fileListTitle}>{t('uploadedFiles')}</Text>
              {uploadedFiles.map((file) => (
                <TouchableOpacity 
                  key={file.id} 
                  style={styles.fileItem}
                  onPress={() => {
                    if (file.type.startsWith('image')) {
                      Alert.alert(t('viewImage'), t('viewImageMsg'));
                    } else {
                      Alert.alert(t('viewDocument'), t('viewDocumentMsg') + ' ' + file.name);
                    }
                  }}
                >
                  <View style={styles.fileIconContainer}>
                    {file.type.startsWith('image') ? (
                      <View style={styles.thumbnailContainer}>
                        {file.uri ? (
                          file.isSample ? 
                            <Image 
                              source={{ uri: file.uri }} 
                              style={styles.thumbnail} 
                            /> : 
                            (file.uri.startsWith('file://') || file.uri.startsWith('ph://')) ? 
                              <View style={styles.mockThumbnail}>
                                <Ionicons name="image" size={20} color={COLORS.white} />
                              </View> : 
                              <Image source={{ uri: file.uri }} style={styles.thumbnail} />
                        ) : (
                          <View style={styles.mockThumbnail}>
                            <Ionicons name="image" size={20} color={COLORS.white} />
                          </View>
                        )}
                      </View>
                    ) : (
                      <Ionicons name="document-outline" size={24} color={COLORS.primary} />
                    )}
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                    <View style={styles.fileDetails}>
                      <Text style={styles.fileSize}>{file.size}</Text>
                      {file.source && <Text style={styles.fileSource}>{t('from')} {file.source}</Text>}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFile(file.id)}
                  >
                    <Ionicons name="close-circle" size={24} color={COLORS.error} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>{t('acceptedFileTypes')}</Text>
            <View style={styles.infoItem}>
              <View style={styles.infoBullet} />
              <Text style={styles.infoText}>{t('pdfDocuments')}</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoBullet} />
              <Text style={styles.infoText}>{t('imageFiles')}</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoBullet} />
              <Text style={styles.infoText}>{t('maxFileSize')}</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={t('submitDocuments')}
              onPress={handleSubmit}
              type="primary"
              style={styles.button}
            />
            <View style={styles.buttonGap} />
            <Button
              title={t('cancel')}
              onPress={() => router.back()}
              type="outline"
              style={styles.button}
            />
          </View>
        </Card>
      </ScrollView>
      <StatusBar style="auto" />
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
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: SIZES.large,
  },
  card: {
    width: '100%',
    padding: SIZES.medium,
  },
  uploadArea: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.large,
    borderWidth: 2,
    borderRadius: SIZES.base,
    borderStyle: 'dashed',
    borderColor: COLORS.lightGray,
    backgroundColor: 'rgba(0,0,0,0.02)',
    marginBottom: SIZES.large,
  },
  uploadText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginTop: SIZES.small,
    marginBottom: SIZES.medium,
  },
  uploadingText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.primary,
    marginTop: SIZES.medium,
  },
  uploadButtonsContainer: {
    width: '100%',
    maxWidth: 400,
  },
  uploadButton: {
    width: '100%',
  },
  fileListContainer: {
    marginBottom: SIZES.large,
  },
  fileListTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SIZES.small,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.small,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: SIZES.base,
    marginBottom: SIZES.small,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: SIZES.base,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.small,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  fileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileSize: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  fileSource: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginLeft: 8,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.lightGray,
  },
  thumbnailContainer: {
    width: 40,
    height: 40,
    borderRadius: SIZES.base,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mockThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SIZES.medium,
    paddingBottom: 40, // Extra padding at bottom for better UX
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SIZES.medium,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: SIZES.medium,
  },
  modalTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  modalCloseButton: {
    padding: SIZES.small,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    marginBottom: SIZES.small,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  modalOptionTextContainer: {
    marginLeft: SIZES.medium,
  },
  modalOptionTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  modalOptionDescription: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: 2,
  },
  removeButton: {
    padding: SIZES.small,
  },
  infoContainer: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    marginBottom: SIZES.large,
  },
  infoTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: SIZES.small,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.small / 2,
  },
  infoBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: SIZES.small,
  },
  infoText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.text,
  },
  buttonContainer: {
    marginTop: SIZES.large,
  },
  button: {
    width: '100%',
  },
  buttonGap: {
    height: 12,
  },
});