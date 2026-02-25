import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { BarChart3, TrendingUp, Users, Package, CheckCircle, Clock, Award, MapPin, Activity, Download, Filter } from 'lucide-react-native';
import { apiClient } from '../../services/api';
import Toast from 'react-native-toast-message';

export default function ReportsScreen() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', zone: '', state: '', city: '' });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const { data } = await apiClient.get(`/analytics/dashboard?${params.toString()}`);
      setAnalytics(data.analytics);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load analytics' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      await apiClient.get('/analytics/export', { responseType: 'blob' });
      Toast.show({ type: 'success', text1: 'Export started' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Export failed' });
    }
  };

  const applyFilters = () => {
    fetchAnalytics();
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({ startDate: '', endDate: '', zone: '', state: '', city: '' });
    fetchAnalytics();
    setShowFilters(false);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#eab308" />
      </View>
    );
  }

  if (!analytics) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">No data available</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <BarChart3 size={24} color="#eab308" />
            <Text className="text-2xl font-bold text-gray-900">Reports</Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity onPress={() => setShowFilters(!showFilters)} className="bg-gray-600 px-3 py-2 rounded-lg">
              <Filter size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleExport} className="bg-green-600 px-3 py-2 rounded-lg">
              <Download size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <Text className="text-sm text-gray-500">Performance metrics and insights</Text>
      </View>
      {showFilters && (
        <View className="bg-white border-b border-gray-200 p-4">
          <Text className="text-sm font-bold text-gray-900 mb-3">Filters</Text>
          <View className="space-y-2">
            <TextInput placeholder="Start Date (YYYY-MM-DD)" value={filters.startDate} onChangeText={(text) => setFilters({ ...filters, startDate: text })} className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2" />
            <TextInput placeholder="End Date (YYYY-MM-DD)" value={filters.endDate} onChangeText={(text) => setFilters({ ...filters, endDate: text })} className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2" />
            <TextInput placeholder="Zone" value={filters.zone} onChangeText={(text) => setFilters({ ...filters, zone: text })} className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2" />
            <TextInput placeholder="State" value={filters.state} onChangeText={(text) => setFilters({ ...filters, state: text })} className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2" />
            <TextInput placeholder="City" value={filters.city} onChangeText={(text) => setFilters({ ...filters, city: text })} className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2" />
          </View>
          <View className="flex-row gap-2 mt-3">
            <TouchableOpacity onPress={resetFilters} className="flex-1 bg-gray-200 py-2 rounded-lg items-center">
              <Text className="text-gray-700 font-bold text-sm">Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={applyFilters} className="flex-1 bg-yellow-500 py-2 rounded-lg items-center">
              <Text className="text-white font-bold text-sm">Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <ScrollView contentContainerStyle={{ padding: 16 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAnalytics(); }} />}>
        <View className="flex-row flex-wrap gap-3 mb-4">
          <StatCard icon={<Package size={20} color="#3b82f6" />} label="Total Stores" value={analytics.overview.totalStores} color="blue" />
          <StatCard icon={<Users size={20} color="#10b981" />} label="Active Users" value={analytics.overview.activeUsers} color="green" />
          <StatCard icon={<Clock size={20} color="#eab308" />} label="Pending" value={analytics.recce.assigned} color="yellow" />
          <StatCard icon={<CheckCircle size={20} color="#10b981" />} label="Completed" value={analytics.installation.completed} color="green" />
        </View>
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
          <Text className="text-lg font-bold text-gray-900 mb-4">Recce Operations</Text>
          <View className="space-y-3">
            <ProgressBar label="Assigned" value={analytics.recce.assigned} total={analytics.recce.total} color="#3b82f6" />
            <ProgressBar label="Submitted" value={analytics.recce.submitted} total={analytics.recce.total} color="#eab308" />
            <ProgressBar label="Approved" value={analytics.recce.approved} total={analytics.recce.total} color="#10b981" />
            <ProgressBar label="Rejected" value={analytics.recce.rejected} total={analytics.recce.total} color="#ef4444" />
          </View>
          <View className="mt-4 pt-4 border-t border-gray-200 flex-row justify-between items-center">
            <Text className="text-sm text-gray-600">Success Rate</Text>
            <Text className="text-lg font-bold text-green-600">{analytics.recce.completionRate}%</Text>
          </View>
        </View>
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
          <Text className="text-lg font-bold text-gray-900 mb-4">Installation Operations</Text>
          <View className="space-y-3">
            <ProgressBar label="Assigned" value={analytics.installation.assigned} total={analytics.installation.total} color="#f97316" />
            <ProgressBar label="Submitted" value={analytics.installation.submitted} total={analytics.installation.total} color="#3b82f6" />
            <ProgressBar label="Completed" value={analytics.installation.completed} total={analytics.installation.total} color="#10b981" />
          </View>
          <View className="mt-4 pt-4 border-t border-gray-200 flex-row justify-between items-center">
            <Text className="text-sm text-gray-600">Completion Rate</Text>
            <Text className="text-lg font-bold text-green-600">{analytics.installation.completionRate}%</Text>
          </View>
        </View>
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center gap-2 mb-4">
            <Activity size={20} color="#eab308" />
            <Text className="text-lg font-bold text-gray-900">Recent Activity (Last 7 Days)</Text>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-gray-50 p-3 rounded-lg">
              <Text className="text-xs text-gray-600">New Stores</Text>
              <Text className="text-2xl font-bold text-gray-900">{analytics.recentActivity.newStores}</Text>
            </View>
            <View className="flex-1 bg-gray-50 p-3 rounded-lg">
              <Text className="text-xs text-gray-600">Recce</Text>
              <Text className="text-2xl font-bold text-gray-900">{analytics.recentActivity.recceSubmissions}</Text>
            </View>
            <View className="flex-1 bg-gray-50 p-3 rounded-lg">
              <Text className="text-xs text-gray-600">Installations</Text>
              <Text className="text-2xl font-bold text-gray-900">{analytics.recentActivity.installations}</Text>
            </View>
          </View>
        </View>
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center gap-2 mb-4">
            <MapPin size={20} color="#eab308" />
            <Text className="text-lg font-bold text-gray-900">Top Cities</Text>
          </View>
          <View className="space-y-3">
            {analytics.distribution.byCity.slice(0, 5).map((city, idx) => (
              <View key={idx} className="flex-row items-center gap-3">
                <Text className="text-sm font-medium text-gray-700 w-24">{city._id || 'Unknown'}</Text>
                <View className="flex-1 h-2 bg-gray-200 rounded-full">
                  <View className="h-2 bg-yellow-500 rounded-full" style={{ width: `${(city.count / analytics.overview.totalStores) * 100}%` }} />
                </View>
                <Text className="text-sm font-bold text-gray-700 w-8 text-right">{city.count}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    yellow: 'bg-yellow-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100',
  };

  return (
    <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-1 min-w-[45%]">
      <View className="flex-row items-center gap-3">
        <View className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</View>
        <View>
          <Text className="text-xs text-gray-600">{label}</Text>
          <Text className="text-2xl font-bold text-gray-900">{value}</Text>
        </View>
      </View>
    </View>
  );
}

function ProgressBar({ label, value, total, color }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <View className="mb-3">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-sm text-gray-700">{label}</Text>
        <Text className="text-sm font-bold text-gray-700">{value}</Text>
      </View>
      <View className="h-2 bg-gray-200 rounded-full">
        <View className="h-2 rounded-full" style={{ width: `${percentage}%`, backgroundColor: color }} />
      </View>
    </View>
  );
}
