import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../constants/Colors';
import { getTransactions, Transaction } from '../../services/api';
import {
  getResponsivePadding,
  getResponsiveMargin,
  getResponsiveFontSize,
  getResponsiveBorderRadius,
  getHeaderPaddingTop,
  getMaxContentWidth,
  isTablet,
} from '../../utils/responsive';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
];

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const autoReloadInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadTransactions();
    // Mark transactions as viewed when screen is opened
    markTransactionsAsViewed();
    
    // Auto-reload transactions every 30 seconds
    autoReloadInterval.current = setInterval(() => {
      loadTransactions();
    }, 30000);
    
    return () => {
      if (autoReloadInterval.current) {
        clearInterval(autoReloadInterval.current);
      }
    };
  }, []);

  const markTransactionsAsViewed = async () => {
    try {
      await AsyncStorage.setItem('lastTransactionView', new Date().toISOString());
    } catch (error) {
      console.error('Error marking transactions as viewed:', error);
    }
  };

  useEffect(() => {
    filterTransactions();
  }, [selectedFilter, transactions]);

  const loadTransactions = async () => {
    try {
      const data = await getTransactions();
      
      // Handle different response formats
      let transactionsArray: Transaction[] = [];
      if (Array.isArray(data)) {
        transactionsArray = data;
      } else if (data && Array.isArray(data.transactions)) {
        transactionsArray = data.transactions;
      } else if (data && data.data && Array.isArray(data.data)) {
        transactionsArray = data.data;
      }
      
      setTransactions(transactionsArray);
      setFilteredTransactions(transactionsArray);
    } catch (error) {
      console.error('Error loading transactions:', error);
      // Set empty arrays on error
      setTransactions([]);
      setFilteredTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  }, []);

  const filterTransactions = () => {
    // Safety check: ensure transactions is an array
    if (!Array.isArray(transactions)) {
      setFilteredTransactions([]);
      return;
    }

    const now = new Date();
    let filtered = [...transactions];

    switch (selectedFilter) {
      case 'today':
        filtered = transactions.filter((t) => {
          const dateStr = t.timestamp || t.createdAt;
          if (!dateStr) return false;
          const transactionDate = new Date(dateStr);
          return transactionDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = transactions.filter((t) => {
          const dateStr = t.timestamp || t.createdAt;
          return dateStr ? new Date(dateStr) >= weekAgo : false;
        });
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = transactions.filter((t) => {
          const dateStr = t.timestamp || t.createdAt;
          return dateStr ? new Date(dateStr) >= monthAgo : false;
        });
        break;
      default:
        filtered = transactions;
    }

    setFilteredTransactions(filtered);
  };

  const getTotalRevenue = () => {
    if (!Array.isArray(filteredTransactions)) {
      return 0;
    }
    return filteredTransactions
      .filter((t) => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getMealTypeIcon = (mealType: string) => {
    const icons: { [key: string]: any } = {
      breakfast: 'sunny',
      lunch: 'restaurant',
      dinner: 'moon',
      snack: 'fast-food',
      beverage: 'cafe',
    };
    return icons[mealType] || 'restaurant';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionIcon}>
        <Ionicons
          name={getMealTypeIcon(item.type || item.mealType || 'restaurant')}
          size={24}
          color={Colors.primary}
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionStudent}>{item.student?.fullName || 'Unknown'}</Text>
        <Text style={styles.transactionMeal}>{item.type || item.mealType || 'Unknown'}</Text>
        <Text style={styles.transactionTime}>
          {formatDate(item.timestamp || item.createdAt || new Date().toISOString())}
        </Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text style={styles.amountText}>Birr {item.amount.toFixed(2)}</Text>
        <Text style={styles.balanceText}>
          Balance: {item.balanceAfter.toFixed(2)}
        </Text>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Transactions</Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              selectedFilter === filter.id && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Revenue Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Transactions</Text>
            <Text style={styles.summaryValue}>{Array.isArray(filteredTransactions) ? filteredTransactions.length : 0}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
            <Text style={styles.summaryValue}>Birr {getTotalRevenue().toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Transactions List */}
      {!Array.isArray(filteredTransactions) || filteredTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color={Colors.gray[300]} />
          <Text style={styles.emptyText}>No transactions found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
        />
      )}
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
    paddingHorizontal: getResponsivePadding(),
    paddingTop: getHeaderPaddingTop(),
    paddingBottom: getResponsivePadding(),
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: getResponsiveFontSize(28),
    fontWeight: 'bold',
    color: Colors.text,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: getResponsivePadding(),
    paddingVertical: getResponsivePadding(16),
    gap: getResponsiveMargin(8),
    maxWidth: getMaxContentWidth(),
    alignSelf: isTablet ? 'center' : 'stretch',
  },
  filterButton: {
    paddingVertical: getResponsivePadding(8),
    paddingHorizontal: getResponsivePadding(16),
    borderRadius: getResponsiveBorderRadius(20),
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: getResponsiveFontSize(14),
    fontWeight: '600',
    color: Colors.text,
  },
  filterTextActive: {
    color: Colors.white,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    marginHorizontal: getResponsivePadding(),
    marginBottom: getResponsiveMargin(16),
    padding: getResponsivePadding(16),
    borderRadius: getResponsiveBorderRadius(),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    maxWidth: getMaxContentWidth(),
    alignSelf: isTablet ? 'center' : 'stretch',
  },
  summaryRow: {
    flexDirection: 'row',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.gray[200],
  },
  summaryLabel: {
    fontSize: getResponsiveFontSize(12),
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: getResponsiveFontSize(18),
    fontWeight: 'bold',
    color: Colors.primary,
  },
  listContainer: {
    padding: getResponsivePadding(),
    paddingTop: 0,
    paddingBottom: 100,
    maxWidth: getMaxContentWidth(),
    alignSelf: isTablet ? 'center' : 'stretch',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: getResponsivePadding(16),
    borderRadius: getResponsiveBorderRadius(),
    marginBottom: getResponsiveMargin(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: isTablet ? 80 : 70,
  },
  transactionIcon: {
    width: isTablet ? 56 : 48,
    height: isTablet ? 56 : 48,
    borderRadius: isTablet ? 28 : 24,
    backgroundColor: Colors.orange[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getResponsiveMargin(12),
  },
  transactionInfo: {
    flex: 1,
  },
  transactionStudent: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  transactionMeal: {
    fontSize: getResponsiveFontSize(14),
    color: Colors.textSecondary,
    textTransform: 'capitalize' as any,
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: getResponsiveFontSize(12),
    color: Colors.gray[400],
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  balanceText: {
    fontSize: getResponsiveFontSize(12),
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: getResponsiveFontSize(16),
    color: Colors.textSecondary,
    marginTop: getResponsiveMargin(16),
  },
});
