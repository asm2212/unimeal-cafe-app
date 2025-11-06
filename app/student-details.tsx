import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { getStudent, updateStudentBalance, Student } from '../services/api';

export default function StudentDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceOperation, setBalanceOperation] = useState<'add' | 'subtract'>('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (id) {
      loadStudent();
    }
  }, [id]);

  const loadStudent = async () => {
    try {
      const data = await getStudent(id as string);
      console.log('Student details loaded:', data);
      
      // Handle different response formats
      let studentData = data;
      if (data && data.student) {
        studentData = data.student;
      } else if (data && data.data) {
        studentData = data.data;
      }
      
      setStudent(studentData);
    } catch (error) {
      console.error('Error loading student:', error);
      Alert.alert('Error', 'Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBalance = async () => {
    if (!amount || !reason) {
      Alert.alert('Error', 'Please enter amount and reason');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setProcessing(true);
    try {
      await updateStudentBalance(id as string, {
        amount: amountNum,
        operation: balanceOperation,
        reason,
        paymentMethod,
      });

      Alert.alert('Success', 'Balance updated successfully!');
      setShowBalanceModal(false);
      setAmount('');
      setReason('');
      setPaymentMethod('cash');
      await loadStudent(); // Reload student data to get updated balance
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update balance');
    } finally {
      setProcessing(false);
    }
  };

  const getBalanceColor = (balance: number) => {
    if (balance <= 0) return Colors.error;
    if (balance < 50) return Colors.warning;
    return Colors.success;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Student not found</Text>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Student Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.studentName}>{student.fullName || student.name}</Text>
          <Text style={styles.studentId}>ID: {student.studentId}</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={[styles.balanceAmount, { color: getBalanceColor(student.balance || 0) }]}>
              Birr {(student.balance || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Student Information</Text>
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={20} color={Colors.primary} />
              <Text style={styles.contactText}>{student.phone}</Text>
            </View>
            {(student as any).username && (
              <View style={styles.contactItem}>
                <Ionicons name="person-circle" size={20} color={Colors.primary} />
                <Text style={styles.contactText}>@{(student as any).username}</Text>
              </View>
            )}
            {(student as any).department && (
              <View style={styles.contactItem}>
                <Ionicons name="school" size={20} color={Colors.primary} />
                <Text style={styles.contactText}>{(student as any).department}</Text>
              </View>
            )}
            {(student as any).email && (
              <View style={styles.contactItem}>
                <Ionicons name="mail" size={20} color={Colors.primary} />
                <Text style={styles.contactText}>{(student as any).email}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Balance History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Balance Information</Text>
          <View style={styles.balanceHistoryCard}>
            <View style={styles.balanceRow}>
              <View style={styles.balanceItem}>
                <Ionicons name="wallet" size={20} color={Colors.primary} />
                <Text style={styles.balanceItemLabel}>Current Balance</Text>
                <Text style={[styles.balanceItemValue, { color: getBalanceColor(student.balance || 0) }]}>
                  Birr {(student.balance || 0).toFixed(2)}
                </Text>
              </View>
            </View>
            <View style={styles.balanceRow}>
              <View style={styles.balanceItem}>
                <Ionicons name="card" size={20} color={Colors.success} />
                <Text style={styles.balanceItemLabel}>Account Status</Text>
                <Text style={[styles.balanceItemValue, { color: (student.balance || 0) > 0 ? Colors.success : Colors.error }]}>
                  {(student.balance || 0) > 0 ? 'Active' : 'Low Balance'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => {
                setBalanceOperation('add');
                setShowBalanceModal(true);
              }}
            >
              <Ionicons name="add-circle" size={32} color={Colors.success} />
              <Text style={styles.actionText}>Add Balance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => {
                setBalanceOperation('subtract');
                setShowBalanceModal(true);
              }}
            >
              <Ionicons name="remove-circle" size={32} color={Colors.error} />
              <Text style={styles.actionText}>Deduct Balance</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Balance Update Modal */}
      <Modal visible={showBalanceModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {balanceOperation === 'add' ? 'Add' : 'Deduct'} Balance
              </Text>
              <TouchableOpacity onPress={() => setShowBalanceModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount (Birr)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={Colors.gray[400]}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Payment Method</Text>
                <View style={styles.paymentMethodsContainer}>
                  {['cash', 'bank_transfer', 'mobile_money', 'card'].map((method) => (
                    <TouchableOpacity
                      key={method}
                      style={[
                        styles.paymentMethodButton,
                        paymentMethod === method && styles.paymentMethodButtonActive,
                      ]}
                      onPress={() => setPaymentMethod(method)}
                    >
                      <Text
                        style={[
                          styles.paymentMethodText,
                          paymentMethod === method && styles.paymentMethodTextActive,
                        ]}
                      >
                        {method.replace('_', ' ').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Reason</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter reason for balance update"
                  placeholderTextColor={Colors.gray[400]}
                  multiline
                  numberOfLines={3}
                  value={reason}
                  onChangeText={setReason}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.updateButton,
                balanceOperation === 'add' ? styles.updateButtonAdd : styles.updateButtonSubtract,
                processing && styles.updateButtonDisabled,
              ]}
              onPress={handleUpdateBalance}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.updateButtonText}>
                  {balanceOperation === 'add' ? 'Add' : 'Deduct'} Balance
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: Colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: Colors.white,
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.orange[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  studentId: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  balanceContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    width: '100%',
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
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
  contactCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    color: Colors.text,
  },
  qrCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  qrLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  updateButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  updateButtonAdd: {
    backgroundColor: Colors.success,
  },
  updateButtonSubtract: {
    backgroundColor: Colors.error,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  balanceHistoryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceRow: {
    marginBottom: 16,
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  balanceItemLabel: {
    flex: 1,
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  balanceItemValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentMethodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentMethodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  paymentMethodButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  paymentMethodTextActive: {
    color: Colors.white,
  },
});
