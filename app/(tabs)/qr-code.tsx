import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Print from 'expo-print';
import Colors from '../../constants/Colors';
import { getCafeQR, generateCafeQR } from '../../services/api';

const { width } = Dimensions.get('window');
const QR_SIZE = Math.min(width * 0.6, 300);

export default function QRCodeScreen() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [cafeInfo, setCafeInfo] = useState({ id: '', name: '' });
  const [qrValue, setQrValue] = useState('');
  const qrRef = useRef<any>(null);

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

  const generateNewQR = async (cafeId: string) => {
    try {
      const qrResponse = await generateCafeQR(cafeId);
      if (qrResponse.qrData) {
        setQrValue(qrResponse.qrData);
        Alert.alert('Success', 'QR Code generated successfully!');
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

  // ✅ Fixed MediaLibrary permissions for Expo SDK 51+
  const downloadQR = async () => {
    try {
      if (!qrRef.current) {
        Alert.alert('Error', 'QR Code not ready for download');
        return;
      }

      // Request gallery permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow gallery access to save QR codes.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Platform.OS === 'android' && Linking.openSettings(),
            },
          ]
        );
        return;
      }

      qrRef.current.toDataURL(async (dataURL: string) => {
        try {
          const filename = `${cafeInfo.name.replace(/[^a-zA-Z0-9]/g, '_')}_QR_${Date.now()}.png`;
          const fileUri = FileSystem.documentDirectory + filename;

          await FileSystem.writeAsStringAsync(fileUri, dataURL.split(',')[1], {
            encoding: FileSystem.EncodingType.Base64,
          });

          await MediaLibrary.saveToLibraryAsync(fileUri);
          Alert.alert('Success', 'QR Code saved to your gallery!');
        } catch (saveError) {
          console.error('Save error:', saveError);
          Alert.alert('Error', 'Failed to save QR code.');
        }
      });
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download QR code.');
    }
  };

  const printQR = async () => {
    try {
      if (!qrRef.current) {
        Alert.alert('Error', 'QR Code not ready for printing');
        return;
      }

      qrRef.current.toDataURL(async (dataURL: string) => {
        const html = `
          <html>
            <head>
              <style>
                body { text-align: center; font-family: Arial; margin: 0; padding: 20px; }
                .qr { width: 8cm; height: 8cm; margin: 20px auto; }
                .title { font-size: 22px; font-weight: bold; color: #f97316; }
              </style>
            </head>
            <body>
              <div class="title">${cafeInfo.name}</div>
              <p>Scan to Order Meals</p>
              <img src="${dataURL}" class="qr" />
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </body>
          </html>
        `;
        await Print.printAsync({ html });
      });
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Error', 'Failed to print QR code.');
    }
  };

  const shareQR = async () => {
    try {
      await Share.share({
        message: `Scan this QR code to order meals at ${cafeInfo.name}`,
        title: 'UniMeal Cafe QR Code',
      });
    } catch (error) {
      console.error('Share error:', error);
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
        <Text style={styles.headerSubtitle}>
          Students scan this code to register and order at your cafe
        </Text>
      </View>

      {/* QR Section */}
      <View style={styles.qrCard}>
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
        <View style={styles.cafeInfo}>
          <Text style={styles.cafeName}>{cafeInfo.name}</Text>
          <Text style={styles.cafeId}>ID: {cafeInfo.id}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.primaryButton} onPress={regenerateQR}>
          <Ionicons name="refresh" size={20} color={Colors.white} />
          <Text style={styles.primaryButtonText}>Regenerate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={downloadQR}>
          <Ionicons name="download" size={20} color={Colors.primary} />
          <Text style={styles.secondaryButtonText}>Download</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.secondaryButton} onPress={printQR}>
          <Ionicons name="print" size={20} color={Colors.primary} />
          <Text style={styles.secondaryButtonText}>Print</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={shareQR}>
          <Ionicons name="share" size={20} color={Colors.primary} />
          <Text style={styles.secondaryButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: { marginTop: 10, fontSize: 16, color: Colors.gray[600] },
  header: { padding: 20, paddingTop: 60, backgroundColor: Colors.primary },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.white },
  headerSubtitle: { fontSize: 15, color: Colors.white, opacity: 0.9 },
  qrCard: {
    backgroundColor: Colors.white,
    margin: 20,
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    elevation: 4,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    marginBottom: 20,
  },
  generatingContainer: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center' },
  generatingText: { marginTop: 10, fontSize: 16, color: Colors.gray[600] },
  cafeInfo: { alignItems: 'center' },
  cafeName: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  cafeId: { fontSize: 14, color: Colors.gray[600] },
  actionButtons: { flexDirection: 'row', padding: 20, gap: 10 },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 8,
  },
  secondaryButtonText: { color: Colors.primary, fontSize: 16, fontWeight: '600' },
});
