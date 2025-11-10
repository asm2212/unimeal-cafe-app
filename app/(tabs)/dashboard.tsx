import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Colors from '../../constants/Colors';
import { getCafeDashboard, CafeDashboard, getTransactions } from '../../services/api';
import notificationService from '../../services/notificationService';
import transactionPollingService from '../../services/transactionPollingService';

export default function DashboardScreen() {
  const router = useRouter();
  const [cafeName, setCafeName] = useState('');
  const [stats, setStats] = useState<CafeDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [newTransactionCount, setNewTransactionCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const autoReloadInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    initializeNotifications();
    loadDashboard();
    checkForNewTransactions();
    
    // Auto-reload dashboard every 30 seconds
    autoReloadInterval.current = setInterval(() => {
      loadDashboard();
      checkForNewTransactions();
    }, 30000);
    
    return () => {
      if (autoReloadInterval.current) {
        clearInterval(autoReloadInterval.current);
      }
      // Stop polling when component unmounts
      transactionPollingService.stopPolling();
      notificationService.removeListeners();
    };
  }, []);

  // Handle screen focus to restart polling
  useFocusEffect(
    useCallback(() => {
      if (notificationsEnabled) {
        transactionPollingService.startPolling();
      }
      checkForNewTransactions();
      
      return () => {
        // Keep polling running even when screen loses focus
        // Only stop when app is closed
      };
    }, [notificationsEnabled])
  );

  const initializeNotifications = async () => {
    try {
      const hasPermission = await notificationService.requestPermissions();
      setNotificationsEnabled(hasPermission);

      if (hasPermission) {
        await notificationService.setupNotificationChannel();

        notificationService.setupListeners(
          () => {
            checkForNewTransactions();
          },
          () => {
            router.push('/(tabs)/transactions');
          }
        );

        await transactionPollingService.startPolling();
      } else {
        Alert.alert(
          'Notifications Disabled',
          'Enable notifications in your device settings to receive real-time transaction alerts.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const loadDashboard = async () => {
    try {
      const name = await AsyncStorage.getItem('cafeName');
      setCafeName(name || 'My Cafe');
      
      const data = await getCafeDashboard();
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewTransactions = async () => {
    try {
      const transactions = await getTransactions();
      // Get the last time the user viewed transactions
      const lastViewedStr = await AsyncStorage.getItem('lastTransactionView');
      const lastViewed = lastViewedStr ? new Date(lastViewedStr) : new Date(0);
      
      let transactionsArray: any[] = [];
      
      if (Array.isArray(transactions)) {
        transactionsArray = transactions;
      } else if (transactions && Array.isArray(transactions.transactions)) {
        transactionsArray = transactions.transactions;
      } else if (transactions && transactions.data && Array.isArray(transactions.data)) {
        transactionsArray = transactions.data;
      }
      
      // Count transactions that occurred after the last view
      const newTransactions = transactionsArray.filter((t: any) => {
        const transactionDate = new Date(t.timestamp || t.createdAt);
        return transactionDate > lastViewed;
      });
      
      const count = newTransactions.length;
      setHasNewNotifications(count > 0);
      setNewTransactionCount(count);
    } catch (error) {
      console.error('Error checking for new transactions:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboard();
    await checkForNewTransactions();
    setRefreshing(false);
  }, []);

  const handleNotificationPress = async () => {
    // Mark transactions as viewed
    await AsyncStorage.setItem('lastTransactionView', new Date().toISOString());
    setHasNewNotifications(false);
    setNewTransactionCount(0);
    // Clear badge count
    await notificationService.clearBadgeCount();
    router.push('/(tabs)/transactions');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.cafeName}>{cafeName}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton} onPress={handleNotificationPress}>
          <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
          {hasNewNotifications && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>{newTransactionCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="people" size={28} color={Colors.white} />
            </View>
            <Text style={styles.statValue}>{stats?.statistics.students.total || 0}</Text>
            <Text style={styles.statLabel}>Total Students</Text>
          </View>

          <View style={[styles.statCard, styles.statCardSuccess]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="wallet" size={28} color={Colors.white} />
            </View>
            <Text style={styles.statValue}>
              Birr {(stats?.statistics.balance.total || 0).toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Total Balance</Text>
          </View>

          <View style={[styles.statCard, styles.statCardWarning]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="receipt" size={28} color={Colors.white} />
            </View>
            <Text style={styles.statValue}>
              {stats?.statistics.revenue.today.transactions || 0}
            </Text>
            <Text style={styles.statLabel}>Today's Orders</Text>
          </View>

          <View style={[styles.statCard, styles.statCardInfo]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="trending-up" size={28} color={Colors.white} />
            </View>
            <Text style={styles.statValue}>
              Birr {(stats?.statistics.revenue.weekly.amount || 0).toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Weekly Revenue</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/register-student')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.orange[100] }]}>
                <Ionicons name="person-add" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.actionText}>Register Student</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/students')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.orange[100] }]}>
                <Ionicons name="people" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.actionText}>View Students</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/qr-code')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.orange[100] }]}>
                <Ionicons name="qr-code" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.actionText}>Cafe QR Code</Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* Student Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Student Insights</Text>
          <View style={styles.insightsCard}>
            <View style={styles.insightRow}>
              <Ionicons name="people-outline" size={20} color={Colors.primary} />
              <Text style={styles.insightText}>
                {stats?.statistics.students.registeredThisWeek || 0} new students this week
              </Text>
            </View>
            <View style={styles.insightRow}>
              <Ionicons name="alert-circle-outline" size={20} color={Colors.warning} />
              <Text style={styles.insightText}>
                {stats?.statistics.students.lowBalance || 0} students with low balance
              </Text>
            </View>
            <View style={styles.insightRow}>
              <Ionicons name="stats-chart-outline" size={20} color={Colors.success} />
              <Text style={styles.insightText}>
                Avg balance: Birr {(stats?.statistics.balance.average || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: Colors.white,
  },
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  cafeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 4,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.orange[50],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  notificationCount: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardPrimary: {
    backgroundColor: Colors.primary,
  },
  statCardSuccess: {
    backgroundColor: Colors.success,
  },
  statCardWarning: {
    backgroundColor: Colors.warning,
  },
  statCardInfo: {
    backgroundColor: '#3b82f6',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.9,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  revenueCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  revenueItem: {
    flex: 1,
    alignItems: 'center',
  },
  revenueDivider: {
    width: 1,
    backgroundColor: Colors.gray[200],
  },
  revenueDividerHorizontal: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginVertical: 16,
  },
  revenueLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 2,
  },
  revenueTransactions: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  insightsCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightText: {
    fontSize: 14,
    color: Colors.text,
  },
});
