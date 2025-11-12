import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';
import Colors from '../../constants/Colors';
import { getCafeQR, generateCafeQR } from '../../services/api';

const { width, height } = Dimensions.get('window');

// Enhanced responsive calculations
const isTablet = width >= 768;
const isSmallScreen = width < 375;
const isLandscape = width > height;
const isVerySmallScreen = width < 320;

// Dynamic QR size based on device type and orientation
const getResponsiveQRSize = () => {
  if (isVerySmallScreen) {
    return Math.min(width * 0.75, 220);
  } else if (isSmallScreen) {
    return Math.min(width * 0.7, 250);
  } else if (isTablet) {
    return isLandscape ? Math.min(height * 0.5, 350) : Math.min(width * 0.45, 400);
  } else if (isLandscape) {
    return Math.min(height * 0.6, 280);
  } else {
    return Math.min(width * 0.6, 300);
  }
};

const QR_SIZE = getResponsiveQRSize();

// Responsive spacing and sizing helpers
const getResponsivePadding = () => {
  if (isVerySmallScreen) return 12;
  if (isSmallScreen) return 16;
  if (isTablet) return 32;
  return 20;
};

const getResponsiveMargin = () => {
  if (isVerySmallScreen) return 12;
  if (isSmallScreen) return 16;
  if (isTablet) return 24;
  return 20;
};

const getResponsiveFontSize = (base: number) => {
  if (isVerySmallScreen) return base - 2;
  if (isTablet) return base + 2;
  return base;
};

export default function QRCodeScreen() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [cafeInfo, setCafeInfo] = useState({ id: '', name: '' });
  const [qrValue, setQrValue] = useState('');
  const qrRef = useRef<any>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    loadCafeInfo();
  }, []);

  const loadCafeInfo = async () => {
    try {
      const [cafeId, cafeName] = await AsyncStorage.multiGet(['cafeId', 'cafeName']);
      const info = { id: cafeId[1] || '', name: cafeName[1] || '' };
      setCafeInfo(info);

      if (info.id) {
        await loadCafeQR(info.id);
      }
    } catch (error) {
      console.error('Error loading cafe info:', error);
      Alert.alert('Error', 'Failed to load cafe information');
    } finally {
      setLoading(false);
    }
  };

  const loadCafeQR = async (cafeId: string) => {
    try {
      const qrResponse = await getCafeQR(cafeId);
      // Use qrData (encrypted string) as the QR code value
      if (qrResponse.qrData) {
        setQrValue(qrResponse.qrData);
        animateQRCode();
      } else {
        // If qrData is not available, generate new
        await generateNewQR(cafeId);
      }
    } catch (error) {
      console.error('Error loading cafe QR:', error);
      // If loading fails, try to generate a new one
      await generateNewQR(cafeId);
    }
  };

  const animateQRCode = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const generateNewQR = async (cafeId: string) => {
    try {
      const qrResponse = await generateCafeQR(cafeId);
      if (qrResponse.qrData) {
        setQrValue(qrResponse.qrData);
        animateQRCode();
        // No success message - just regenerate silently
      } else {
        Alert.alert('Error', 'Failed to generate QR code data');
      }
    } catch (error) {
      console.error('Error generating cafe QR:', error);
      Alert.alert('Error', 'Failed to generate QR code');
    }
  };

  const regenerateQR = async () => {
    setGenerating(true);
    // Reset animations for regeneration
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    try {
      if (cafeInfo.id) {
        await generateNewQR(cafeInfo.id);
      }
    } catch (error) {
      console.error('Error regenerating QR:', error);
      Alert.alert('Error', 'Failed to regenerate QR code');
    } finally {
      setGenerating(false);
    }
  };


  const printQR = async () => {
    try {
      if (!qrRef.current) {
        Alert.alert('Error', 'QR Code not ready for printing');
        return;
      }

      qrRef.current.toDataURL(async (dataURL: string) => {
        try {
          if (!dataURL) {
            Alert.alert('Error', 'Failed to generate QR code image for printing');
            return;
          }

          // Ensure data URL has proper format
          const imageData = dataURL.startsWith('data:') 
            ? dataURL 
            : `data:image/png;base64,${dataURL}`;

          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  @page {
                    margin: 0;
                    size: auto;
                  }
                  body { 
                    margin: 0;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                  }
                  .qr { 
                    width: 400px; 
                    height: 400px; 
                    display: block;
                  }
                </style>
              </head>
              <body>
                <img src="${imageData}" class="qr" alt="QR Code" />
              </body>
            </html>
          `;
          
          await Print.printAsync({ html });
        } catch (printError) {
          console.error('Print processing error:', printError);
          Alert.alert('Error', 'Failed to process QR code for printing.');
        }
      });
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Error', 'Failed to print QR code. Please try again.');
    }
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cafe QR Code</Text>
      </View>

      {/* QR Section */}
      <Animated.View 
        style={[
          styles.qrCard,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.qrContainer}>
          {generating ? (
            <View style={styles.generatingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.generatingText}>Generating...</Text>
            </View>
          ) : qrValue ? (
            <QRCode
              value={qrValue}
              size={QR_SIZE}
              color={Colors.text}
              backgroundColor={Colors.white}
              getRef={(ref) => (qrRef.current = ref)}
            />
          ) : (
            <View style={styles.generatingContainer}>
              <Text style={styles.generatingText}>No QR code available</Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Ionicons name="shield-checkmark" size={24} color={Colors.success} />
        <Text style={styles.infoText}>
          This QR code is permanent and will never expire. Students can scan it anytime to access your cafe.
        </Text>
      </View>

      {/* Security Info Card */}
      <View style={styles.securityCard}>
        <Ionicons name="information-circle" size={20} color={Colors.primary} />
        <Text style={styles.securityText}>
          For security purposes, you can regenerate the QR code at any time. The old QR code will become invalid.
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={regenerateQR}
          disabled={generating}
        >
          <Ionicons name="refresh" size={22} color={Colors.white} />
          <Text style={styles.primaryButtonText}>Regenerate QR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={printQR}>
          <Ionicons name="print" size={22} color={Colors.primary} />
          <Text style={styles.secondaryButtonText}>Print QR</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: { 
    marginTop: 10, 
    fontSize: 16, 
    color: Colors.gray[600] 
  },
  header: { 
    padding: getResponsivePadding(), 
    paddingTop: isTablet ? 80 : 60, 
    paddingBottom: getResponsivePadding(),
    backgroundColor: Colors.primary 
  },
  headerTitle: { 
    fontSize: getResponsiveFontSize(28), 
    fontWeight: 'bold', 
    color: Colors.white,
    textAlign: 'center',
  },
  qrCard: {
    backgroundColor: Colors.white,
    marginHorizontal: getResponsiveMargin(),
    marginTop: getResponsiveMargin(),
    borderRadius: isTablet ? 20 : 16,
    padding: getResponsivePadding() + (isTablet ? 10 : 0),
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    maxWidth: isTablet ? 600 : undefined,
    alignSelf: isTablet ? 'center' : 'stretch',
  },
  qrContainer: {
    padding: isVerySmallScreen ? 12 : (isTablet ? 24 : 16),
    backgroundColor: Colors.gray[50],
    borderRadius: isTablet ? 20 : 16,
    marginBottom: isTablet ? 24 : 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generatingContainer: { 
    width: QR_SIZE, 
    height: QR_SIZE, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  generatingText: { 
    marginTop: 10, 
    fontSize: 16, 
    color: Colors.gray[600] 
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.success + '15',
    marginHorizontal: getResponsiveMargin(),
    marginTop: getResponsiveMargin() * 0.8,
    padding: getResponsivePadding(),
    borderRadius: isTablet ? 16 : 12,
    borderLeftWidth: isTablet ? 6 : 4,
    borderLeftColor: Colors.success,
    gap: isTablet ? 16 : 12,
    maxWidth: isTablet ? 600 : undefined,
    alignSelf: isTablet ? 'center' : 'stretch',
  },
  infoText: {
    flex: 1,
    fontSize: getResponsiveFontSize(14),
    color: Colors.gray[700],
    lineHeight: getResponsiveFontSize(20),
  },
  securityCard: {
    flexDirection: 'row',
    backgroundColor: Colors.orange[50],
    marginHorizontal: getResponsiveMargin(),
    marginTop: getResponsiveMargin() * 0.6,
    padding: getResponsivePadding() * 0.9,
    borderRadius: isTablet ? 16 : 12,
    borderLeftWidth: isTablet ? 6 : 4,
    borderLeftColor: Colors.primary,
    gap: isTablet ? 14 : 10,
    maxWidth: isTablet ? 600 : undefined,
    alignSelf: isTablet ? 'center' : 'stretch',
  },
  securityText: {
    flex: 1,
    fontSize: getResponsiveFontSize(13),
    color: Colors.gray[600],
    lineHeight: getResponsiveFontSize(18),
  },
  actionButtons: { 
    flexDirection: isTablet && !isLandscape ? 'column' : 'row', 
    paddingHorizontal: getResponsiveMargin(),
    paddingVertical: getResponsiveMargin(),
    gap: isTablet ? 16 : 12,
    maxWidth: isTablet ? 600 : undefined,
    alignSelf: isTablet ? 'center' : 'stretch',
  },
  primaryButton: {
    flex: isTablet && !isLandscape ? 0 : 1,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isTablet ? 20 : 16,
    paddingHorizontal: isTablet ? 24 : 16,
    borderRadius: isTablet ? 16 : 12,
    gap: isTablet ? 12 : 8,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    minHeight: isTablet ? 56 : 48,
  },
  primaryButtonText: { 
    color: Colors.white, 
    fontSize: getResponsiveFontSize(16), 
    fontWeight: '600' 
  },
  secondaryButton: {
    flex: isTablet && !isLandscape ? 0 : 1,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isTablet ? 20 : 16,
    paddingHorizontal: isTablet ? 24 : 16,
    borderRadius: isTablet ? 16 : 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    gap: isTablet ? 12 : 8,
    minHeight: isTablet ? 56 : 48,
  },
  secondaryButtonText: { 
    color: Colors.primary, 
    fontSize: getResponsiveFontSize(16), 
    fontWeight: '600' 
  },
});
