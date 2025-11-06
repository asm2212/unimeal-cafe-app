import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <Ionicons name="restaurant" size={80} color={Colors.white} />
        </View>

        {/* Title */}
        <Text style={styles.title}>UniMeal Cafe</Text>
        <Text style={styles.subtitle}>Manage Your Cafe Effortlessly</Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Ionicons name="people" size={24} color={Colors.white} />
            <Text style={styles.featureText}>Manage Students</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="qr-code" size={24} color={Colors.white} />
            <Text style={styles.featureText}>Scan QR Codes</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="stats-chart" size={24} color={Colors.white} />
            <Text style={styles.featureText}>Track Revenue</Text>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>
          Digital Cafeteria Management System
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 50,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 50,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 16,
    color: Colors.white,
    marginLeft: 15,
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    fontSize: 12,
    color: Colors.white,
    opacity: 0.7,
  },
});
