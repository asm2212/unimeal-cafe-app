import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTransactions, Transaction } from './api';
import notificationService from './notificationService';

const POLLING_INTERVAL = 5000; // Poll every 5 seconds for SMS-like instant updates
const LAST_TRANSACTION_KEY = 'lastTransactionTimestamp';

class TransactionPollingService {
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private isPolling = false;
  private lastTransactionTimestamp: Date | null = null;

  /**
   * Start polling for new transactions
   */
  async startPolling() {
    if (this.isPolling) {
      console.log('Polling already active');
      return;
    }

    console.log('Starting transaction polling...');
    this.isPolling = true;

    // Load the last known transaction timestamp
    await this.loadLastTransactionTimestamp();

    // Initial check
    await this.checkForNewTransactions();

    // Set up interval for continuous polling
    this.pollingInterval = setInterval(async () => {
      await this.checkForNewTransactions();
    }, POLLING_INTERVAL);
  }

  /**
   * Stop polling for new transactions
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
    console.log('Transaction polling stopped');
  }

  /**
   * Load the last transaction timestamp from storage
   */
  private async loadLastTransactionTimestamp() {
    try {
      const timestamp = await AsyncStorage.getItem(LAST_TRANSACTION_KEY);
      if (timestamp) {
        this.lastTransactionTimestamp = new Date(timestamp);
        console.log('Loaded last transaction timestamp:', this.lastTransactionTimestamp);
      } else {
        // If no timestamp exists, use current time to avoid flooding with old notifications
        this.lastTransactionTimestamp = new Date();
        await this.saveLastTransactionTimestamp(this.lastTransactionTimestamp);
      }
    } catch (error) {
      console.error('Error loading last transaction timestamp:', error);
      this.lastTransactionTimestamp = new Date();
    }
  }

  /**
   * Save the last transaction timestamp to storage
   */
  private async saveLastTransactionTimestamp(timestamp: Date) {
    try {
      await AsyncStorage.setItem(LAST_TRANSACTION_KEY, timestamp.toISOString());
    } catch (error) {
      console.error('Error saving last transaction timestamp:', error);
    }
  }

  /**
   * Check for new transactions and send notifications
   */
  private async checkForNewTransactions() {
    try {
      console.log('🔍 Checking for new transactions...');
      const response = await getTransactions();
      
      // Handle different response formats
      let transactionsArray: Transaction[] = [];
      if (Array.isArray(response)) {
        transactionsArray = response;
      } else if (response && Array.isArray(response.transactions)) {
        transactionsArray = response.transactions;
      } else if (response && response.data && Array.isArray(response.data)) {
        transactionsArray = response.data;
      }

      console.log(`📊 Total transactions in system: ${transactionsArray.length}`);

      if (transactionsArray.length === 0) {
        console.log('⚠️ No transactions found');
        return;
      }

      // Filter for new transactions
      const newTransactions = transactionsArray.filter((transaction) => {
        const transactionDate = new Date(transaction.timestamp || transaction.createdAt || '');
        return this.lastTransactionTimestamp && transactionDate > this.lastTransactionTimestamp;
      });

      if (newTransactions.length === 0) {
        console.log('✓ No new transactions since last check');
        return;
      }

      console.log(`🆕 Found ${newTransactions.length} new transaction(s)!`);

      // Sort by timestamp to get the latest
      newTransactions.sort((a, b) => {
        const dateA = new Date(a.timestamp || a.createdAt || '');
        const dateB = new Date(b.timestamp || b.createdAt || '');
        return dateB.getTime() - dateA.getTime();
      });

      // Send notifications for each new transaction
      if (newTransactions.length === 1) {
        // Single transaction notification
        const transaction = newTransactions[0];
        await notificationService.sendTransactionNotification({
          transactionId: transaction.id,
          amount: transaction.amount,
          studentName: transaction.student?.fullName || 'Unknown Student',
          type: transaction.type,
        });
      } else {
        // Batch notification for multiple transactions
        const totalAmount = newTransactions.reduce((sum, t) => sum + t.amount, 0);
        await notificationService.sendBatchTransactionNotification(
          newTransactions.length,
          totalAmount
        );
      }

      // Update the last transaction timestamp
      const latestTransaction = newTransactions[0];
      const latestTimestamp = new Date(
        latestTransaction.timestamp || latestTransaction.createdAt || ''
      );
      this.lastTransactionTimestamp = latestTimestamp;
      await this.saveLastTransactionTimestamp(latestTimestamp);

      // Update badge count
      await notificationService.setBadgeCount(newTransactions.length);
    } catch (error) {
      console.error('Error checking for new transactions:', error);
    }
  }

  /**
   * Manually trigger a check for new transactions
   */
  async manualCheck() {
    await this.checkForNewTransactions();
  }

  /**
   * Reset the last transaction timestamp (useful for testing)
   */
  async resetTimestamp() {
    this.lastTransactionTimestamp = new Date();
    await this.saveLastTransactionTimestamp(this.lastTransactionTimestamp);
    console.log('Transaction timestamp reset');
  }

  /**
   * Get polling status
   */
  isActive(): boolean {
    return this.isPolling;
  }
}

export default new TransactionPollingService();
