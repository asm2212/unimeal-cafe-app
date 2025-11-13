import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../constants/Colors';
import { getTransactions, Transaction, TransactionFilters } from '../../services/api';
import {
  getResponsivePadding,
  getResponsiveMargin,
  getResponsiveFontSize,
  getResponsiveBorderRadius,
  getHeaderPaddingTop,
  getMaxContentWidth,
  isTablet,
  isVerySmallScreen,
  isSmallScreen,
  getResponsiveValue,
} from '../../utils/responsive';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'custom', label: 'Custom Range' },
];

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
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
  }, [selectedFilter, transactions, searchQuery, selectedStudentId]);

  const loadTransactions = async () => {
    try {
      const filters: TransactionFilters = {
        period: selectedFilter !== 'all' && selectedFilter !== 'custom' ? selectedFilter as 'day' | 'week' | 'month' : undefined,
        studentId: selectedStudentId || undefined,
        searchQuery: searchQuery.trim() || undefined,
        startDate: selectedFilter === 'custom' && startDate ? startDate.toISOString() : undefined,
        endDate: selectedFilter === 'custom' && endDate ? endDate.toISOString() : undefined,
      };
      
      const data = await getTransactions(filters);
      
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

    // Filter by date period
    switch (selectedFilter) {
      case 'today':
        filtered = filtered.filter((t) => {
          const dateStr = t.timestamp || t.createdAt;
          if (!dateStr) return false;
          const transactionDate = new Date(dateStr);
          return transactionDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter((t) => {
          const dateStr = t.timestamp || t.createdAt;
          return dateStr ? new Date(dateStr) >= weekAgo : false;
        });
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter((t) => {
          const dateStr = t.timestamp || t.createdAt;
          return dateStr ? new Date(dateStr) >= monthAgo : false;
        });
        break;
      case 'custom':
        if (startDate || endDate) {
          filtered = filtered.filter((t) => {
            const dateStr = t.timestamp || t.createdAt;
            if (!dateStr) return false;
            
            const transactionDate = new Date(dateStr);
            let isInRange = true;
            
            if (startDate) {
              // Set start date to beginning of day
              const startDateCopy = new Date(startDate);
              startDateCopy.setHours(0, 0, 0, 0);
              isInRange = isInRange && transactionDate >= startDateCopy;
            }
            
            if (endDate) {
              // Set end date to end of day
              const endDateCopy = new Date(endDate);
              endDateCopy.setHours(23, 59, 59, 999);
              isInRange = isInRange && transactionDate <= endDateCopy;
            }
            
            return isInRange;
          });
        }
        break;
    }

    // Filter by student ID if selected
    if (selectedStudentId) {
      filtered = filtered.filter((t) => t.studentId === selectedStudentId);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((t) => {
        const studentName = t.student?.fullName?.toLowerCase() || '';
        const studentId = t.student?.studentId?.toLowerCase() || '';
        const mealType = (t.type || t.mealType || '').toLowerCase();
        const amount = t.amount.toString();
        
        return (
          studentName.includes(query) ||
          studentId.includes(query) ||
          mealType.includes(query) ||
          amount.includes(query)
        );
      });
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

  const viewStudentTransactions = (studentId: string, studentName: string) => {
    setSelectedStudentId(studentId);
    setShowStudentDetail(true);
  };

  const clearStudentFilter = () => {
    setSelectedStudentId(null);
    setShowStudentDetail(false);
  };
  
  const handleFilterPress = (filterId: string) => {
    setSelectedFilter(filterId);
    if (filterId === 'custom') {
      setShowDateRangeModal(true);
    }
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      if (datePickerMode === 'start') {
        setStartDate(selectedDate);
        if (Platform.OS === 'android') {
          setDatePickerMode('end');
          setShowDatePicker(true);
        }
      } else {
        setEndDate(selectedDate);
        if (Platform.OS === 'android') {
          setShowDatePicker(false);
        }
      }
    }
  };
  
  const applyDateFilter = () => {
    setShowDateRangeModal(false);
    loadTransactions();
  };
  
  const resetDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
  };
  
  const formatDateForDisplay = (date: Date | null) => {
    if (!date) return 'Not set';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity 
      style={styles.transactionCard}
      onPress={() => viewStudentTransactions(item.studentId || '', item.student?.fullName || 'Unknown')}
    >
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
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>
          {showStudentDetail 
            ? `${transactions.find(t => t.studentId === selectedStudentId)?.student?.fullName || 'Student'}'s Transactions` 
            : 'Transactions'}
        </Text>
        {showStudentDetail && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={clearStudentFilter}
          >
            <Ionicons name="arrow-back" size={getResponsiveValue({
              normal: 24,
              tablet: 28
            })} color={Colors.primary} />
            <Text style={styles.backButtonText}>All Transactions</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tablet Layout - Side by Side Search and Filters */}
      {isTablet ? (
        <View style={styles.tabletControlsContainer}>
          {/* Search Bar */}
          <View style={styles.tabletSearchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={getResponsiveValue({
                normal: 20,
                tablet: 24
              })} color={Colors.gray[400]} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, ID, or meal type"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={Colors.gray[400]}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={getResponsiveValue({
                    normal: 20,
                    tablet: 24
                  })} color={Colors.gray[400]} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      ) : (
        /* Mobile Layout - Stacked Search and Filters */
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={Colors.gray[400]} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, ID, or meal type"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.gray[400]}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.gray[400]} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              selectedFilter === filter.id && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterPress(filter.id)}
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
      
      {/* Custom Date Range Modal */}
      <Modal
        visible={showDateRangeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDateRangeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date Range</Text>
            
            <View style={styles.datePickerRow}>
              <Text style={styles.datePickerLabel}>Start Date:</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => {
                  setDatePickerMode('start');
                  setShowDatePicker(true);
                }}
              >
                <Text style={styles.datePickerButtonText}>
                  {startDate ? formatDateForDisplay(startDate) : 'Select Start Date'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.datePickerRow}>
              <Text style={styles.datePickerLabel}>End Date:</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => {
                  setDatePickerMode('end');
                  setShowDatePicker(true);
                }}
              >
                <Text style={styles.datePickerButtonText}>
                  {endDate ? formatDateForDisplay(endDate) : 'Select End Date'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalButtonRow}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={resetDateFilter}
              >
                <Text style={styles.modalButtonSecondaryText}>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={applyDateFilter}
              >
                <Text style={styles.modalButtonPrimaryText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Date Picker */}
      {showDatePicker && (
        <>
          {Platform.OS === 'ios' ? (
            <Modal
              visible={showDatePicker}
              transparent={true}
              animationType="slide"
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>
                    Select {datePickerMode === 'start' ? 'Start' : 'End'} Date
                  </Text>
                  
                  <DateTimePicker
                    value={datePickerMode === 'start' ? (startDate || new Date()) : (endDate || new Date())}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    style={styles.datePicker}
                  />
                  
                  <View style={styles.modalButtonRow}>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.modalButtonSecondary]}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.modalButtonPrimary]}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.modalButtonPrimaryText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          ) : (
            <DateTimePicker
              value={datePickerMode === 'start' ? (startDate || new Date()) : (endDate || new Date())}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </>
      )}

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
    paddingBottom: isTablet ? getResponsivePadding(24) : 0,
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
    maxWidth: getMaxContentWidth(),
    alignSelf: isTablet ? 'center' : 'stretch',
    width: '100%',
  },
  headerTitle: {
    fontSize: getResponsiveFontSize(isTablet ? 32 : 28),
    fontWeight: 'bold',
    color: Colors.text,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: getResponsiveMargin(8),
  },
  backButtonText: {
    fontSize: getResponsiveFontSize(16),
    color: Colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: getResponsivePadding(),
    paddingBottom: getResponsivePadding(8),
    backgroundColor: Colors.white,
    maxWidth: getMaxContentWidth(),
    alignSelf: isTablet ? 'center' : 'stretch',
    width: '100%',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: getResponsiveBorderRadius(20),
    paddingHorizontal: getResponsivePadding(isVerySmallScreen ? 8 : 12),
    height: getResponsiveValue({
      verySmall: 36,
      small: 38,
      normal: 40,
      tablet: 48
    }),
    width: '100%',
  },
  searchIcon: {
    marginRight: getResponsiveValue({
      verySmall: 4,
      small: 6,
      normal: 8,
      tablet: 10
    }),
    fontSize: getResponsiveValue({
      verySmall: 16,
      small: 18,
      normal: 20,
      tablet: 24
    }),
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: getResponsiveFontSize(isVerySmallScreen ? 12 : 14),
    color: Colors.text,
    paddingVertical: getResponsiveValue({
      verySmall: 6,
      small: 8,
      normal: 10,
      tablet: 12
    }),
  },
  filtersContainer: {
    flexDirection: isVerySmallScreen ? 'column' : 'row',
    flexWrap: 'wrap',
    paddingHorizontal: getResponsivePadding(),
    paddingVertical: getResponsivePadding(16),
    gap: getResponsiveMargin(isVerySmallScreen ? 4 : 8),
    maxWidth: getMaxContentWidth(),
    alignSelf: isTablet ? 'center' : 'stretch',
    justifyContent: isTablet ? 'center' : 'flex-start',
  },
  filterButton: {
    paddingVertical: getResponsivePadding(8),
    paddingHorizontal: getResponsivePadding(12),
    borderRadius: getResponsiveBorderRadius(20),
    backgroundColor: Colors.gray[100],
    minWidth: getResponsiveValue({
      verySmall: 80,
      small: 90,
      normal: 100,
      tablet: 120
    }),
    alignItems: 'center',
    marginBottom: isVerySmallScreen ? getResponsiveMargin(4) : 0,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: getResponsiveFontSize(14),
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  filterTextActive: {
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsivePadding(isVerySmallScreen ? 8 : 16),
  },
  modalContent: {
    width: '100%',
    maxWidth: getResponsiveValue({
      verySmall: 300,
      small: 350,
      normal: 400,
      tablet: 500
    }),
    backgroundColor: Colors.white,
    borderRadius: getResponsiveBorderRadius(12),
    padding: getResponsivePadding(isVerySmallScreen ? 12 : 16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: getResponsiveFontSize(isVerySmallScreen ? 16 : 18),
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: getResponsiveMargin(isVerySmallScreen ? 12 : 16),
    textAlign: 'center',
  },
  datePickerRow: {
    flexDirection: isVerySmallScreen ? 'column' : 'row',
    alignItems: isVerySmallScreen ? 'flex-start' : 'center',
    justifyContent: 'space-between',
    marginBottom: getResponsiveMargin(isVerySmallScreen ? 12 : 16),
    width: '100%',
  },
  datePickerLabel: {
    fontSize: getResponsiveFontSize(16),
    color: Colors.text,
    flex: isVerySmallScreen ? 0 : 1,
    marginBottom: isVerySmallScreen ? getResponsiveMargin(4) : 0,
    fontWeight: '500',
  },
  datePickerButton: {
    flex: isVerySmallScreen ? 0 : 2,
    width: isVerySmallScreen ? '100%' : undefined,
    backgroundColor: Colors.gray[100],
    padding: getResponsivePadding(10),
    borderRadius: getResponsiveBorderRadius(8),
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  datePickerButtonText: {
    fontSize: getResponsiveFontSize(14),
    color: Colors.text,
    textAlign: isVerySmallScreen ? 'center' : 'left',
  },
  datePicker: {
    width: '100%',
    marginBottom: getResponsiveMargin(16),
    height: getResponsiveValue({
      verySmall: 180,
      small: 200,
      normal: 220,
      tablet: 250
    }),
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: getResponsiveMargin(isVerySmallScreen ? 12 : 16),
    gap: getResponsiveMargin(isVerySmallScreen ? 6 : 8),
  },
  modalButton: {
    flex: 1,
    padding: getResponsivePadding(isVerySmallScreen ? 10 : 12),
    borderRadius: getResponsiveBorderRadius(8),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: getResponsiveValue({
      verySmall: 40,
      small: 44,
      normal: 48,
      tablet: 56
    }),
  },
  modalButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  modalButtonSecondary: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  modalButtonPrimaryText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: getResponsiveFontSize(isVerySmallScreen ? 14 : 16),
  },
  modalButtonSecondaryText: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: getResponsiveFontSize(isVerySmallScreen ? 14 : 16),
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
    paddingBottom: isTablet ? 120 : 100,
    maxWidth: getMaxContentWidth(),
    alignSelf: isTablet ? 'center' : 'stretch',
    width: '100%',
  },
  tabletControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: getResponsivePadding(),
    paddingBottom: getResponsivePadding(8),
    backgroundColor: Colors.white,
    maxWidth: getMaxContentWidth(),
    alignSelf: 'center',
    width: '100%',
  },
  tabletSearchContainer: {
    flex: 1,
    marginRight: getResponsiveMargin(16),
  },
  transactionCard: {
    flexDirection: isVerySmallScreen ? 'column' : 'row',
    alignItems: isVerySmallScreen ? 'flex-start' : 'center',
    backgroundColor: Colors.white,
    padding: getResponsivePadding(isVerySmallScreen ? 12 : 16),
    borderRadius: getResponsiveBorderRadius(),
    marginBottom: getResponsiveMargin(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: getResponsiveValue({
      verySmall: 100,
      small: 70,
      normal: 70,
      tablet: 80
    }),
    maxWidth: getMaxContentWidth(),
  },
  transactionIcon: {
    width: getResponsiveValue({
      verySmall: 40,
      small: 44,
      normal: 48,
      tablet: 56
    }),
    height: getResponsiveValue({
      verySmall: 40,
      small: 44,
      normal: 48,
      tablet: 56
    }),
    borderRadius: getResponsiveValue({
      verySmall: 20,
      small: 22,
      normal: 24,
      tablet: 28
    }),
    backgroundColor: Colors.orange[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getResponsiveMargin(12),
    marginBottom: isVerySmallScreen ? getResponsiveMargin(8) : 0,
  },
  transactionInfo: {
    flex: 1,
    marginBottom: isVerySmallScreen ? getResponsiveMargin(8) : 0,
  },
  transactionStudent: {
    fontSize: getResponsiveFontSize(isVerySmallScreen ? 14 : 16),
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  transactionMeal: {
    fontSize: getResponsiveFontSize(isVerySmallScreen ? 12 : 14),
    color: Colors.textSecondary,
    textTransform: 'capitalize' as any,
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: getResponsiveFontSize(isVerySmallScreen ? 10 : 12),
    color: Colors.gray[400],
  },
  transactionAmount: {
    alignItems: isVerySmallScreen ? 'flex-start' : 'flex-end',
    alignSelf: isVerySmallScreen ? 'flex-start' : 'auto',
  },
  amountText: {
    fontSize: getResponsiveFontSize(isVerySmallScreen ? 14 : 16),
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  balanceText: {
    fontSize: getResponsiveFontSize(isVerySmallScreen ? 10 : 12),
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
