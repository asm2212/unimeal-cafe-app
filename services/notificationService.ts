import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Linking, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications should be handled based on app state
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const appState = AppState.currentState;

    // Always show notifications, but adjust behavior based on app state
    return {
      shouldShowAlert: true, // Show alert even when app is active
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: appState === 'active', // Show banner when app is active
      shouldShowList: true,
    };
  },
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
  private appStateListener: any;
  private currentAppState: AppStateStatus = AppState.currentState;

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

  async ensureEnabled(): Promise<boolean> {
    const current = await Notifications.getPermissionsAsync();
    if (current.status === 'granted') {
      return true;
    }
    if (current.canAskAgain) {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    }
    return false;
  }

  async openSettings() {
    try {
      await Linking.openSettings();
    } catch {}
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
      const appState = AppState.currentState;
      const isAppActive = appState === 'active';
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💰 New Transaction',
          body: `${data.studentName} - ${data.type === 'DEBIT' ? '-' : '+'}Birr ${data.amount.toFixed(2)}`,
          subtitle: isAppActive ? 'Tap to view details' : 'Open app to view details',
          data: {
            transactionId: data.transactionId,
            amount: String(data.amount),
            studentName: data.studentName,
            type: data.type,
            timestamp: new Date().toISOString(),
            appState: appState,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250],
          badge: await this.getBadgeCount() + 1,
          ...(Platform.OS === 'android' && { channelId: 'transactions' }),
        },
        trigger: null,
      });
      
      // Update badge count
      await this.setBadgeCount(await this.getBadgeCount() + 1);
      
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
      const appState = AppState.currentState;
      const isAppActive = appState === 'active';
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💰 New Transactions',
          body: `${count} new transaction${count > 1 ? 's' : ''} - Total: Birr ${totalAmount.toFixed(2)}`,
          subtitle: isAppActive ? 'Tap to view all transactions' : 'Open app to view transactions',
          data: {
            type: 'batch_transaction',
            count: String(count),
            totalAmount: String(totalAmount),
            timestamp: new Date().toISOString(),
            appState: appState,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250],
          badge: count,
          ...(Platform.OS === 'android' && { channelId: 'transactions' }),
        },
        trigger: null,
      });
      
      // Update badge count
      await this.setBadgeCount(count);
      
    } catch (error) {
      console.error('Notification error:', error);
    }
  }

  /**
   * Set up notification listeners and app state monitoring
   */
  setupListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void,
    onAppStateChange?: (appState: AppStateStatus) => void
  ) {
    // Notification received listener (works in foreground)
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
      }
    );

    // Notification response listener (works when user taps notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        if (onNotificationResponse) {
          onNotificationResponse(response);
        }
      }
    );

    // App state change listener
    this.appStateListener = AppState.addEventListener('change', (nextAppState) => {
      console.log('App state changed from', this.currentAppState, 'to', nextAppState);
      
      if (this.currentAppState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        this.sendAppStateNotification('App is now active', '✅ UniMeal Cafe is ready to receive notifications');
      } else if (this.currentAppState === 'active' && nextAppState.match(/inactive|background/)) {
        // App has gone to the background
        this.sendAppStateNotification('App is now in background', '🔔 You will receive notifications when app is closed');
      }
      
      this.currentAppState = nextAppState;
      
      if (onAppStateChange) {
        onAppStateChange(nextAppState);
      }
    });
  }

  /**
   * Send app state notification
   */
  async sendAppStateNotification(title: string, body: string) {
    const hasPermission = await this.areNotificationsEnabled();
    if (!hasPermission) {
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'app_state',
            timestamp: new Date().toISOString(),
          },
          sound: false, // Don't play sound for app state changes
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
          ...(Platform.OS === 'android' && { channelId: 'transactions' }),
        },
        trigger: null,
      });
    } catch (error) {
      console.error('App state notification error:', error);
    }
  }

  /**
   * Send notification status alert
   */
  async sendNotificationStatusAlert(enabled: boolean) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: enabled ? '🔔 Notifications Enabled' : '🔕 Notifications Disabled',
          body: enabled 
            ? 'You will receive real-time transaction alerts' 
            : 'Enable notifications in settings to receive alerts',
          data: {
            type: 'notification_status',
            enabled: String(enabled),
            timestamp: new Date().toISOString(),
          },
          sound: enabled,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          ...(Platform.OS === 'android' && { channelId: 'transactions' }),
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Notification status alert error:', error);
    }
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
    if (this.appStateListener) {
      this.appStateListener.remove();
    }
  }

  /**
   * Get current badge count
   */
  async getBadgeCount(): Promise<number> {
    try {
      const count = await AsyncStorage.getItem('notificationBadgeCount');
      return count ? parseInt(count, 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number) {
    try {
      await AsyncStorage.setItem('notificationBadgeCount', count.toString());
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  /**
   * Clear badge count
   */
  async clearBadgeCount() {
    await this.setBadgeCount(0);
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
    await this.clearBadgeCount();
  }
}

export default new NotificationService();
