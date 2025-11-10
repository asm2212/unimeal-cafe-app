import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications should be handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  transactionId: string;
  amount: number;
  studentName: string;
  type: string;
}

class NotificationService {
  private notificationListener: any;
  private responseListener: any;

  /**
   * Request notification permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    await AsyncStorage.setItem('notificationPermission', 'granted');
    return true;
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Configure notification channel for Android
   */
  async setupNotificationChannel() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('transactions', {
        name: 'Transaction Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B35',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    }
  }

  /**
   * Send a local notification for a new transaction
   */
  async sendTransactionNotification(data: NotificationData) {
    const hasPermission = await this.areNotificationsEnabled();
    if (!hasPermission) {
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💰 New Transaction',
          body: `${data.studentName} - ${data.type === 'DEBIT' ? '-' : '+'}Birr ${data.amount.toFixed(2)}`,
          data: {
            transactionId: data.transactionId,
            amount: String(data.amount),
            studentName: data.studentName,
            type: data.type,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250],
          badge: 1,
          ...(Platform.OS === 'android' && { channelId: 'transactions' }),
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Notification error:', error);
    }
  }

  /**
   * Send a batch notification for multiple transactions
   */
  async sendBatchTransactionNotification(count: number, totalAmount: number) {
    const hasPermission = await this.areNotificationsEnabled();
    if (!hasPermission) {
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💰 New Transactions',
          body: `${count} new transaction${count > 1 ? 's' : ''} - Total: Birr ${totalAmount.toFixed(2)}`,
          data: {
            type: 'batch_transaction',
            count: String(count),
            totalAmount: String(totalAmount),
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250],
          badge: count,
          ...(Platform.OS === 'android' && { channelId: 'transactions' }),
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Notification error:', error);
    }
  }

  /**
   * Set up notification listeners
   */
  setupListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
  ) {
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
      }
    );

    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        if (onNotificationResponse) {
          onNotificationResponse(response);
        }
      }
    );
  }

  /**
   * Remove notification listeners
   */
  removeListeners() {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Clear badge count
   */
  async clearBadgeCount() {
    await Notifications.setBadgeCountAsync(0);
  }
}

export default new NotificationService();
