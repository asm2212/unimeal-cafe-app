/**
 * Test Notification Utility
 * Use this to test notifications without creating real transactions
 */

import notificationService from './notificationService';
import transactionPollingService from './transactionPollingService';

/**
 * Send a test notification
 */
export const sendTestNotification = async () => {
  console.log('📱 Sending test notification...');
  
  await notificationService.sendTransactionNotification({
    transactionId: 'TEST-' + Date.now(),
    amount: 50,
    studentName: 'Test Student',
    type: 'DEBIT',
  });
  
  console.log('✅ Test notification sent!');
};

/**
 * Send multiple test notifications
 */
export const sendBatchTestNotification = async () => {
  console.log('📱 Sending batch test notification...');
  
  await notificationService.sendBatchTransactionNotification(5, 250);
  
  console.log('✅ Batch test notification sent!');
};

/**
 * Check notification permissions
 */
export const checkPermissions = async () => {
  const enabled = await notificationService.areNotificationsEnabled();
  console.log('🔔 Notifications enabled:', enabled);
  return enabled;
};

/**
 * Reset timestamp to test with existing transactions
 */
export const resetTimestamp = async () => {
  console.log('🔄 Resetting timestamp...');
  await transactionPollingService.resetTimestamp();
  console.log('✅ Timestamp reset! Next poll will check all recent transactions.');
};

/**
 * Check polling status
 */
export const checkPollingStatus = () => {
  const isActive = transactionPollingService.isActive();
  console.log('⚡ Polling active:', isActive);
  return isActive;
};

/**
 * Manual check for new transactions
 */
export const manualCheck = async () => {
  console.log('🔍 Manually checking for new transactions...');
  await transactionPollingService.manualCheck();
  console.log('✅ Manual check complete!');
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async () => {
  console.log('🧹 Clearing all notifications...');
  await notificationService.clearAllNotifications();
  await notificationService.clearBadgeCount();
  console.log('✅ All notifications cleared!');
};

// Export all test functions
export default {
  sendTestNotification,
  sendBatchTestNotification,
  checkPermissions,
  resetTimestamp,
  checkPollingStatus,
  manualCheck,
  clearAllNotifications,
};
