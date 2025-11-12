import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { getStudents, Student } from '../../services/api';
import {
  getResponsivePadding,
  getResponsiveMargin,
  getResponsiveFontSize,
  getResponsiveBorderRadius,
  getHeaderPaddingTop,
  getMaxContentWidth,
  isTablet,
  getResponsiveIconSize,
} from '../../utils/responsive';

export default function StudentsScreen() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, students]);

  const loadStudents = async () => {
    try {
      const data = await getStudents();
      
      // Handle different response formats
      let studentsArray: Student[] = [];
      if (Array.isArray(data)) {
        studentsArray = data;
      } else if (data && Array.isArray(data.students)) {
        studentsArray = data.students;
      } else if (data && data.data && Array.isArray(data.data)) {
        studentsArray = data.data;
      }
      
      setStudents(studentsArray);
      setFilteredStudents(studentsArray);
    } catch (error) {
      console.error('Error loading students:', error);
      // Set empty arrays on error
      setStudents([]);
      setFilteredStudents([]);
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStudents();
    setRefreshing(false);
  }, []);

  const filterStudents = () => {
    // Safety check: ensure students is an array
    if (!Array.isArray(students)) {
      setFilteredStudents([]);
      return;
    }

    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = students.filter(
      (student) =>
        student.fullName?.toLowerCase().includes(query) ||
        student.name?.toLowerCase().includes(query) ||
        student.username?.toLowerCase().includes(query) ||
        student.studentId?.toLowerCase().includes(query) ||
        student.phone?.includes(query)
    );
    setFilteredStudents(filtered);
  };

  const getBalanceColor = (balance: number) => {
    if (balance <= 0) return Colors.error;
    if (balance < 50) return Colors.warning;
    return Colors.success;
  };

  const renderStudent = ({ item }: { item: Student }) => (
    <TouchableOpacity
      style={styles.studentCard}
      onPress={() => router.push(`/student-details?id=${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.studentAvatar}>
        <Ionicons name="person" size={24} color={Colors.primary} />
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.fullName || item.name}</Text>
        <Text style={styles.studentId}>ID: {item.studentId}</Text>
        <Text style={styles.studentPhone}>{item.phone}</Text>
      </View>
      <View style={styles.studentBalance}>
        <Text style={[styles.balanceAmount, { color: getBalanceColor(item.balance) }]}>
          Birr {item.balance.toFixed(2)}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
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
        <Text style={styles.headerTitle}>Students</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/register-student')}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.gray[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, ID, or phone..."
          placeholderTextColor={Colors.gray[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Array.isArray(students) ? students.length : 0}</Text>
          <Text style={styles.statLabel}>Total Students</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Array.isArray(students) ? students.filter((s) => s.balance < 50).length : 0}
          </Text>
          <Text style={styles.statLabel}>Low Balance</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            Birr {Array.isArray(students) && students.length > 0 
              ? (students.reduce((sum, s) => sum + s.balance, 0)).toFixed(0)
              : '0'}
          </Text>
          <Text style={styles.statLabel}>Total Balance</Text>
        </View>
      </View>

      {/* Student List */}
      {!Array.isArray(filteredStudents) || filteredStudents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color={Colors.gray[300]} />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No students found' : 'No students registered yet'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/register-student')}
            >
              <Text style={styles.emptyButtonText}>Register First Student</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredStudents}
          renderItem={renderStudent}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    width: isTablet ? 52 : 44,
    height: isTablet ? 52 : 44,
    borderRadius: isTablet ? 26 : 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: getResponsivePadding(),
    marginTop: getResponsiveMargin(16),
    paddingHorizontal: getResponsivePadding(16),
    paddingVertical: getResponsivePadding(12),
    borderRadius: getResponsiveBorderRadius(),
    gap: getResponsiveMargin(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    maxWidth: getMaxContentWidth(),
    alignSelf: isTablet ? 'center' : 'stretch',
  },
  searchInput: {
    flex: 1,
    fontSize: getResponsiveFontSize(16),
    color: Colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: getResponsivePadding(),
    marginTop: getResponsiveMargin(16),
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
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.gray[200],
  },
  statValue: {
    fontSize: getResponsiveFontSize(20),
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: getResponsiveFontSize(12),
    color: Colors.textSecondary,
  },
  listContainer: {
    padding: getResponsivePadding(),
    paddingTop: getResponsiveMargin(16),
    paddingBottom: 100,
    maxWidth: getMaxContentWidth(),
    alignSelf: isTablet ? 'center' : 'stretch',
  },
  studentCard: {
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
  studentAvatar: {
    width: isTablet ? 60 : 50,
    height: isTablet ? 60 : 50,
    borderRadius: isTablet ? 30 : 25,
    backgroundColor: Colors.orange[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getResponsiveMargin(12),
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  studentId: {
    fontSize: getResponsiveFontSize(13),
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  studentPhone: {
    fontSize: getResponsiveFontSize(13),
    color: Colors.textSecondary,
  },
  studentBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveMargin(8),
  },
  balanceAmount: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: 'bold',
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
    marginBottom: getResponsiveMargin(24),
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: getResponsivePadding(12),
    paddingHorizontal: getResponsivePadding(24),
    borderRadius: getResponsiveBorderRadius(8),
  },
  emptyButtonText: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '600',
    color: Colors.white,
  },
});
