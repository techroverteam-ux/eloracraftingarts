import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, TextInput, Modal, Dimensions } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { EloraLogo } from '../../components/EloraLogo';
import { dashboardService } from '../../services/dashboardService';
import { Store, Users, CheckCircle, Clock, Filter, Calendar, TrendingUp, MapPin, BarChart3, PieChart, X } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { LineChart, BarChart, PieChart as RNPieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', status: '', zone: '', state: '' });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const data = await dashboardService.getStats(params.toString());
      setStats(data);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load stats' });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setShowFilters(false);
    fetchStats();
  };

  const resetFilters = () => {
    setFilters({ startDate: '', endDate: '', status: '', zone: '', state: '' });
    setShowFilters(false);
    fetchStats();
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const isAdmin = user?.roles?.some(role => role?.code === 'SUPER_ADMIN' || role?.code === 'ADMIN');

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <EloraLogo width={150} />
        <Text style={[styles.welcomeText, { color: colors.text }]}>
          Welcome, {user?.name || user?.email}!
        </Text>
        <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.filterButton}>
          <Filter size={20} color="#3b82f6" />
          <Text style={styles.filterText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Store size={24} color="#3b82f6" />
          <Text style={styles.statValue}>{stats?.kpi?.totalStores || 0}</Text>
          <Text style={styles.statLabel}>{isAdmin ? 'Total Stores' : 'Assigned to Me'}</Text>
          <Text style={styles.trendText}>+{stats?.kpi?.newStoresToday || 0} today</Text>
        </View>
        <View style={styles.statCard}>
          <CheckCircle size={24} color="#10b981" />
          <Text style={styles.statValue}>{stats?.kpi?.recceDoneTotal || 0}</Text>
          <Text style={styles.statLabel}>Recce Completed</Text>
          <Text style={styles.trendText}>+{stats?.kpi?.recceDoneToday || 0} today</Text>
        </View>
        <View style={styles.statCard}>
          <CheckCircle size={24} color="#f59e0b" />
          <Text style={styles.statValue}>{stats?.kpi?.installationDoneTotal || 0}</Text>
          <Text style={styles.statLabel}>Installations</Text>
          <Text style={styles.trendText}>+{stats?.kpi?.installationDoneToday || 0} today</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp size={24} color="#ef4444" />
          <Text style={styles.statValue}>{(stats?.kpi?.totalStores - stats?.kpi?.recceDoneTotal) || 0}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Charts Section */}
      {stats?.statusBreakdown && (
        <View style={styles.chartContainer}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Status Breakdown</Text>
          <BarChart
            data={{
              labels: stats.statusBreakdown.map(item => item._id?.replace(/_/g, ' ').substring(0, 8)),
              datasets: [{ data: stats.statusBreakdown.map(item => item.count) }]
            }}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#1e2923',
              backgroundGradientFrom: '#08130D',
              backgroundGradientTo: '#1e2923',
              color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
              strokeWidth: 2
            }}
            style={styles.chart}
          />
        </View>
      )}

      {/* Zone Distribution */}
      {stats?.zoneDistribution && (
        <View style={styles.chartContainer}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Zone Distribution</Text>
          <View style={styles.distributionList}>
            {stats.zoneDistribution.map((item, index) => (
              <View key={index} style={styles.distributionItem}>
                <Text style={[styles.distributionLabel, { color: colors.text }]}>{item._id || 'N/A'}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${(item.count / stats.kpi.totalStores) * 100}%` }]} />
                </View>
                <Text style={[styles.distributionValue, { color: colors.text }]}>{item.count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Monthly Trend */}
      {stats?.monthlyTrend && (
        <View style={styles.chartContainer}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Monthly Trend</Text>
          <LineChart
            data={{
              labels: stats.monthlyTrend.map(item => item._id),
              datasets: [{ data: stats.monthlyTrend.map(item => item.count) }]
            }}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#e26a00',
              backgroundGradientFrom: '#fb8c00',
              backgroundGradientTo: '#ffa726',
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              strokeWidth: 2
            }}
            style={styles.chart}
          />
        </View>
      )}

      {/* Team Performance */}
      {isAdmin && stats?.personnelStats && (
        <View style={styles.chartContainer}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Team Performance</Text>
          {stats.personnelStats.map((person, index) => (
            <View key={index} style={styles.teamMember}>
              <Text style={[styles.teamName, { color: colors.text }]}>{person.name}</Text>
              <Text style={styles.teamRole}>{person.role}</Text>
              <Text style={[styles.teamStats, { color: colors.text }]}>Assigned: {person.assignedCount} | Completed: {person.completedCount}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recent Stores */}
      {stats?.recentStores && (
        <View style={styles.chartContainer}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Recent Stores</Text>
          {stats.recentStores.map((store, index) => (
            <View key={index} style={styles.recentStore}>
              <MapPin size={16} color="#f59e0b" />
              <View style={styles.storeInfo}>
                <Text style={[styles.storeName, { color: colors.text }]}>{store.storeName}</Text>
                <Text style={styles.storeLocation}>{store.location?.city} • {store.dealerCode}</Text>
                <Text style={styles.storeStatus}>{store.currentStatus?.replace(/_/g, ' ')}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.error }]}
        onPress={logout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.filterForm}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Start Date</Text>
              <TextInput
                style={[styles.filterInput, { backgroundColor: colors.surface, color: colors.text }]}
                placeholder="YYYY-MM-DD"
                value={filters.startDate}
                onChangeText={text => setFilters({ ...filters, startDate: text })}
              />
              
              <Text style={[styles.filterLabel, { color: colors.text }]}>End Date</Text>
              <TextInput
                style={[styles.filterInput, { backgroundColor: colors.surface, color: colors.text }]}
                placeholder="YYYY-MM-DD"
                value={filters.endDate}
                onChangeText={text => setFilters({ ...filters, endDate: text })}
              />
              
              <Text style={[styles.filterLabel, { color: colors.text }]}>Zone</Text>
              <TextInput
                style={[styles.filterInput, { backgroundColor: colors.surface, color: colors.text }]}
                placeholder="Enter zone"
                value={filters.zone}
                onChangeText={text => setFilters({ ...filters, zone: text })}
              />
              
              <Text style={[styles.filterLabel, { color: colors.text }]}>State</Text>
              <TextInput
                style={[styles.filterInput, { backgroundColor: colors.surface, color: colors.text }]}
                placeholder="Enter state"
                value={filters.state}
                onChangeText={text => setFilters({ ...filters, state: text })}
              />
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={resetFilters} style={[styles.modalButton, styles.resetButton]}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={applyFilters} style={[styles.modalButton, styles.applyButton]}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  filterText: {
    marginLeft: 8,
    color: '#3b82f6',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 16,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    minWidth: '45%',
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  trendText: {
    fontSize: 10,
    color: '#10b981',
    marginTop: 2,
  },
  chartContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  distributionList: {
    gap: 8,
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  distributionLabel: {
    fontSize: 12,
    width: 60,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 4,
  },
  distributionValue: {
    fontSize: 12,
    fontWeight: 'bold',
    width: 30,
    textAlign: 'right',
  },
  teamMember: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  teamRole: {
    fontSize: 12,
    color: '#6b7280',
  },
  teamStats: {
    fontSize: 12,
    marginTop: 4,
  },
  recentStore: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  storeInfo: {
    marginLeft: 12,
    flex: 1,
  },
  storeName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  storeLocation: {
    fontSize: 12,
    color: '#6b7280',
  },
  storeStatus: {
    fontSize: 10,
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  logoutButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterForm: {
    maxHeight: 300,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  filterInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#f3f4f6',
  },
  resetButtonText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#3b82f6',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});