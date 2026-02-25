import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  MapPin,
  TrendingUp,
  Users,
  CheckCircle2,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
} from 'lucide-react-native';
import {useTheme} from '../context/ThemeContext';
import {apiClient} from '../lib/api';
import Toast from 'react-native-toast-message';

const {width} = Dimensions.get('window');

const DashboardScreen = () => {
  const {darkMode} = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    console.log('Dashboard mounted, fetching stats...');
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('Fetching dashboard stats from API...');
      const {data} = await apiClient.get('/dashboard/stats');
      console.log('Dashboard stats received:', JSON.stringify(data, null, 2));
      setStats(data);
    } catch (error: any) {
      console.error('Dashboard API Error:', error);
      console.error('Error response:', error?.response?.data);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to fetch dashboard stats',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const colors = {
    bg: darkMode ? '#111827' : '#F9FAFB',
    cardBg: darkMode ? '#1F2937' : '#FFFFFF',
    text: darkMode ? '#F9FAFB' : '#111827',
    textSecondary: darkMode ? '#D1D5DB' : '#6B7280',
    border: darkMode ? '#374151' : '#E5E7EB',
  };

  if (loading) {
    return (
      <View style={[styles.container, {backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color="#EAB308" />
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.bg}]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EAB308" />}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, {color: colors.text}]}>Dashboard</Text>
            <Text style={[styles.subtitle, {color: colors.textSecondary}]}>Overview & Analytics</Text>
          </View>
        </View>

        {/* KPI Cards */}
        <View style={styles.kpiGrid}>
          <StatCard
            title="Total Stores"
            value={stats?.kpi?.totalStores || 0}
            icon={<MapPin size={16} color="#EAB308" />}
            trend={`+${stats?.kpi?.newStoresToday || 0} today`}
            darkMode={darkMode}
            color="#EAB308"
          />
          <StatCard
            title="Recce Done"
            value={stats?.kpi?.recceDoneTotal || 0}
            icon={<CheckCircle2 size={16} color="#3B82F6" />}
            trend={`+${stats?.kpi?.recceDoneToday || 0} today`}
            darkMode={darkMode}
            color="#3B82F6"
          />
          <StatCard
            title="Installations"
            value={stats?.kpi?.installationDoneTotal || 0}
            icon={<CheckCircle2 size={16} color="#10B981" />}
            trend={`+${stats?.kpi?.installationDoneToday || 0} today`}
            darkMode={darkMode}
            color="#10B981"
          />
          <StatCard
            title="Pending"
            value={stats?.kpi?.totalStores - stats?.kpi?.recceDoneTotal || 0}
            icon={<TrendingUp size={16} color="#F59E0B" />}
            darkMode={darkMode}
            color="#F59E0B"
          />
        </View>

        {/* Status Breakdown */}
        <View style={[styles.card, {backgroundColor: colors.cardBg, borderColor: colors.border}]}>
          <View style={styles.cardHeader}>
            <PieChart size={20} color={colors.text} />
            <Text style={[styles.cardTitle, {color: colors.text}]}>Status Breakdown</Text>
          </View>
          {stats?.statusBreakdown?.map((item: any) => (
            <View key={item._id} style={styles.row}>
              <Text style={[styles.rowLabel, {color: colors.textSecondary}]}>
                {item._id?.replace(/_/g, ' ')}
              </Text>
              <Text style={[styles.rowValue, {color: colors.text}]}>{item.count}</Text>
            </View>
          ))}
        </View>

        {/* Zone Distribution */}
        <View style={[styles.card, {backgroundColor: colors.cardBg, borderColor: colors.border}]}>
          <View style={styles.cardHeader}>
            <BarChart3 size={20} color={colors.text} />
            <Text style={[styles.cardTitle, {color: colors.text}]}>Zone Distribution</Text>
          </View>
          {stats?.zoneDistribution?.map((item: any) => (
            <View key={item._id} style={styles.progressRow}>
              <Text style={[styles.progressLabel, {color: colors.textSecondary}]}>{item._id || 'N/A'}</Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {width: `${(item.count / stats?.kpi?.totalStores) * 100}%`},
                  ]}
                />
              </View>
              <Text style={[styles.progressValue, {color: colors.text}]}>{item.count}</Text>
            </View>
          ))}
        </View>

        {/* Recent Stores */}
        <View style={[styles.card, {backgroundColor: colors.cardBg, borderColor: colors.border}]}>
          <Text style={[styles.cardTitle, {color: colors.text}]}>Recent Stores</Text>
          {stats?.recentStores?.map((store: any) => (
            <View
              key={store._id}
              style={[styles.storeCard, {backgroundColor: darkMode ? '#374151' : '#F9FAFB', borderColor: colors.border}]}>
              <View style={styles.storeIcon}>
                <MapPin size={16} color="#EAB308" />
              </View>
              <View style={styles.storeInfo}>
                <Text style={[styles.storeName, {color: colors.text}]}>{store.storeName}</Text>
                <Text style={[styles.storeLocation, {color: colors.textSecondary}]}>
                  {store.location?.city} • {store.dealerCode}
                </Text>
                <Text style={styles.storeStatus}>{store.currentStatus?.replace(/_/g, ' ')}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const StatCard = ({title, value, icon, trend, darkMode, color}: any) => {
  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: darkMode ? '#1F2937CC' : '#FFFFFF',
          borderColor: darkMode ? '#374151CC' : '#E5E7EB',
        },
      ]}>
      <View style={styles.statHeader}>
        <View>
          <Text style={[styles.statTitle, {color: darkMode ? '#9CA3AF' : '#6B7280'}]}>{title}</Text>
          <Text style={[styles.statValue, {color: darkMode ? '#FFFFFF' : '#111827'}]}>{value}</Text>
          {trend && <Text style={styles.statTrend}>{trend}</Text>}
        </View>
        <View style={[styles.statIcon, {backgroundColor: `${color}20`}]}>{icon}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  statCard: {
    width: (width - 40) / 2,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statTrend: {
    fontSize: 11,
    color: '#10B981',
    marginTop: 4,
    fontWeight: '600',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB20',
  },
  rowLabel: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressRow: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#EAB308',
    borderRadius: 4,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  storeCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  storeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAB30820',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  storeLocation: {
    fontSize: 12,
    marginTop: 2,
  },
  storeStatus: {
    fontSize: 10,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default DashboardScreen;
