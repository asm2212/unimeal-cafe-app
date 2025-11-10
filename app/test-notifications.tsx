import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import testNotifications from '../services/testNotifications';

export default function TestNotificationsScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<string>('Ready to test');
  const [permissionStatus, setPermissionStatus] = useState<boolean | null>(null);
  const [pollingStatus, setPollingStatus] = useState<boolean | null>(null);

  const updateStatus = (message: string) => {
    setStatus(message);
    console.log('📱', message);
  };

  const handleTestNotification = async () => {
    try {
      updateStatus('Sending test notification...');
      await testNotifications.sendTestNotification();
      updateStatus('✅ Test notification sent! Check your device.');
      Alert.alert('Success', 'Test notification sent! You should see it now.');
    } catch (error) {
      updateStatus('❌ Error: ' + error);
      Alert.alert('Error', 'Failed to send notification: ' + error);
    }
  };

  const handleBatchNotification = async () => {
    try {
      updateStatus('Sending batch notification...');
      await testNotifications.sendBatchTestNotification();
      updateStatus('✅ Batch notification sent!');
      Alert.alert('Success', 'Batch notification sent!');
    } catch (error) {
      updateStatus('❌ Error: ' + error);
      Alert.alert('Error', 'Failed to send notification: ' + error);
    }
  };

  const handleCheckPermissions = async () => {
    try {
      updateStatus('Checking permissions...');
      const enabled = await testNotifications.checkPermissions();
      setPermissionStatus(enabled);
      updateStatus(enabled ? '✅ Permissions granted' : '❌ Permissions denied');
      Alert.alert(
        'Permissions',
        enabled ? 'Notifications are enabled ✅' : 'Notifications are disabled ❌'
      );
    } catch (error) {
      updateStatus('❌ Error: ' + error);
    }
  };

  const handleCheckPolling = () => {
    try {
      updateStatus('Checking polling status...');
      const isActive = testNotifications.checkPollingStatus();
      setPollingStatus(isActive);
      updateStatus(isActive ? '✅ Polling is active' : '❌ Polling is not active');
      Alert.alert(
        'Polling Status',
        isActive ? 'Polling is active ✅' : 'Polling is not active ❌'
      );
    } catch (error) {
      updateStatus('❌ Error: ' + error);
    }
  };

  const handleResetTimestamp = async () => {
    try {
      updateStatus('Resetting timestamp...');
      await testNotifications.resetTimestamp();
      updateStatus('✅ Timestamp reset! Wait 5 seconds for notifications.');
      Alert.alert(
        'Success',
        'Timestamp reset! You should get notifications for recent transactions in 5 seconds.'
      );
    } catch (error) {
      updateStatus('❌ Error: ' + error);
    }
  };

  const handleManualCheck = async () => {
    try {
      updateStatus('Manually checking for transactions...');
      await testNotifications.manualCheck();
      updateStatus('✅ Manual check complete!');
      Alert.alert('Success', 'Manual check complete! Check console logs.');
    } catch (error) {
      updateStatus('❌ Error: ' + error);
    }
  };

  const handleClearNotifications = async () => {
    try {
      updateStatus('Clearing notifications...');
      await testNotifications.clearAllNotifications();
      updateStatus('✅ All notifications cleared!');
      Alert.alert('Success', 'All notifications cleared!');
    } catch (error) {
      updateStatus('❌ Error: ' + error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Test Notifications</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <Ionicons name="information-circle" size={24} color={Colors.primary} />
          <Text style={styles.statusText}>{status}</Text>
        </View>

        {/* System Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Permissions:</Text>
            <Text style={[styles.statusValue, permissionStatus ? styles.success : styles.error]}>
              {permissionStatus === null ? '?' : permissionStatus ? '✅ Granted' : '❌ Denied'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Polling:</Text>
            <Text style={[styles.statusValue, pollingStatus ? styles.success : styles.error]}>
              {pollingStatus === null ? '?' : pollingStatus ? '✅ Active' : '❌ Inactive'}
            </Text>
          </View>
        </View>

        {/* Test Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Tests</Text>
          
          <TouchableOpacity style={styles.testButton} onPress={handleTestNotification}>
            <Ionicons name="notifications" size={24} color={Colors.white} />
            <Text style={styles.buttonText}>Send Test Notification</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.testButton} onPress={handleBatchNotification}>
            <Ionicons name="notifications-outline" size={24} color={Colors.white} />
            <Text style={styles.buttonText}>Send Batch Notification</Text>
          </TouchableOpacity>
        </View>

        {/* System Checks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Checks</Text>
          
          <TouchableOpacity style={styles.checkButton} onPress={handleCheckPermissions}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
            <Text style={styles.checkButtonText}>Check Permissions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkButton} onPress={handleCheckPolling}>
            <Ionicons name="pulse" size={20} color={Colors.primary} />
            <Text style={styles.checkButtonText}>Check Polling Status</Text>
          </TouchableOpacity>
        </View>

        {/* Advanced Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced</Text>
          
          <TouchableOpacity style={styles.advancedButton} onPress={handleResetTimestamp}>
            <Ionicons name="refresh" size={20} color={Colors.warning} />
            <Text style={styles.advancedButtonText}>Reset Timestamp</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.advancedButton} onPress={handleManualCheck}>
            <Ionicons name="search" size={20} color={Colors.warning} />
            <Text style={styles.advancedButtonText}>Manual Check</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.advancedButton} onPress={handleClearNotifications}>
            <Ionicons name="trash" size={20} color={Colors.error} />
            <Text style={styles.advancedButtonText}>Clear All Notifications</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📖 How to Test</Text>
          <Text style={styles.instructionsText}>
            1. Check permissions and polling status{'\n'}
            2. Tap "Send Test Notification"{'\n'}
            3. You should see a notification immediately{'\n'}
            4. Or create a real transaction to test{'\n'}
            5. Check console logs for detailed info
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.orange[50],
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  success: {
    color: Colors.success,
  },
  error: {
    color: Colors.error,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  checkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  advancedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  advancedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  instructionsCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
