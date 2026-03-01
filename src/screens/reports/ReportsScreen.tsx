import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, FlatList, Dimensions } from 'react-native';
import { BarChart3, TrendingUp, Users, Package, CheckCircle, Clock, Award, MapPin, Activity, Filter, Calendar, User, FileText, Eye, Download, ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/api';
import Toast from 'react-native-toast-message';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import RNFS from 'react-native-fs';

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', status: '', zone: '', state: '', city: '' });
  const [assignmentsPage, setAssignmentsPage] = useState(1);
  const assignmentsPerPage = 10;

  const isAdmin = user?.roles?.some(role => role?.code === 'SUPER_ADMIN' || role?.code === 'ADMIN');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (filters.startDate || filters.endDate || filters.zone || filters.state || filters.city) {
      fetchAnalytics();
    }
  }, [filters]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('_t', Date.now().toString());
      
      const { data } = await apiClient.get(`/analytics/dashboard?${params.toString()}`);
      setAnalytics(data.analytics || {});
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load analytics' });
      setAnalytics({
        overview: { totalAssigned: 0, pending: 0, submitted: 0, approved: 0, completed: 0, completionRate: 0 },
        recentActivity: { submissionsLast7Days: 0 },
        distribution: { byCity: [] },
        myTasks: []
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setShowFilters(false);
    fetchAnalytics();
  };

  const resetFilters = () => {
    setFilters({ startDate: '', endDate: '', status: '', zone: '', state: '', city: '' });
    setShowFilters(false);
    fetchAnalytics();
  };

  const exportAssignments = async () => {
    if (!analytics.assignments || analytics.assignments.length === 0) {
      Toast.show({ type: 'error', text1: 'No data to export' });
      return;
    }
    
    try {
      const csvData = analytics.assignments.map(a => ({
        'Store Name': a.storeName,
        'Dealer Code': a.dealerCode,
        'City': a.city,
        'State': a.state,
        'Assigned To': a.assignedTo,
        'Role': a.role,
        'Date': a.date ? new Date(a.date).toLocaleDateString() : '-',
        'Status': a.status?.replace(/_/g, ' ')
      }));
      
      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const path = `${RNFS.DownloadDirectoryPath}/Assignment_Details_${Date.now()}.csv`;
      await RNFS.writeFile(path, csvContent, 'utf8');
      
      Toast.show({ type: 'success', text1: 'Exported successfully!', text2: `Saved to: ${path}` });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Export failed' });
    }
  };

  const StatCard = ({ icon, label, value, color }) => (
    <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, flex: 1, margin: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ padding: 8, borderRadius: 8, backgroundColor: color + '20' }}>
          {icon}
        </View>
        <View>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{label}</Text>
          <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold' }}>{value}</Text>
        </View>
      </View>
    </View>
  );

  const ProgressBar = ({ label, value, total, color }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ color: theme.colors.text, fontSize: 14 }}>{label}</Text>
          <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: 'bold' }}>{value}</Text>
        </View>
        <View style={{ height: 8, backgroundColor: theme.colors.border, borderRadius: 4 }}>
          <View style={{ height: 8, backgroundColor: color, borderRadius: 4, width: `${percentage}%` }} />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <BarChart3 size={24} color={theme.colors.primary} />
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text }}>Reports</Text>
              <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>
                {isAdmin ? 'Complete project overview' : 'Your performance metrics'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowFilters(true)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border }}>
            <Filter size={16} color={theme.colors.text} />
            <Text style={{ color: theme.colors.text, marginLeft: 6, fontWeight: '600' }}>Filters</Text>
          </TouchableOpacity>
        </View>

        {isAdmin ? (
          /* ADMIN DASHBOARD */
          <>
            {/* Overview Cards */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 }}>
              <StatCard icon={<Package size={20} color="#3B82F6" />} label="Total Stores" value={analytics.overview?.totalStores || 0} color="#3B82F6" />
              <StatCard icon={<Users size={20} color="#10B981" />} label="Active Users" value={analytics.overview?.activeUsers || 0} color="#10B981" />
              <StatCard icon={<Clock size={20} color="#F59E0B" />} label="Recce Pending" value={analytics.recce?.assigned || 0} color="#F59E0B" />
              <StatCard icon={<CheckCircle size={20} color="#10B981" />} label="Completed" value={analytics.installation?.completed || 0} color="#10B981" />
            </View>

            {/* Charts */}
            {analytics.recce && (
              <View style={{ backgroundColor: theme.colors.surface, margin: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>Recce Operations</Text>
                <ProgressBar label="Assigned" value={analytics.recce.assigned} total={analytics.recce.total} color="#3B82F6" />
                <ProgressBar label="Submitted" value={analytics.recce.submitted} total={analytics.recce.total} color="#F59E0B" />
                <ProgressBar label="Approved" value={analytics.recce.approved} total={analytics.recce.total} color="#10B981" />
                <ProgressBar label="Rejected" value={analytics.recce.rejected} total={analytics.recce.total} color="#EF4444" />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>Success Rate</Text>
                  <Text style={{ color: '#10B981', fontSize: 18, fontWeight: 'bold' }}>{analytics.recce.completionRate}%</Text>
                </View>
              </View>
            )}

            {/* Top Performers */}
            {analytics.topPerformers && (
              <View style={{ backgroundColor: theme.colors.surface, margin: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Award size={20} color={theme.colors.primary} />
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>Top Performers</Text>
                </View>
                
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 8 }}>Recce Team</Text>
                {analytics.topPerformers.recce?.map((user, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
                    <Text style={{ color: theme.colors.text, fontSize: 14 }}>{user.name}</Text>
                    <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: 'bold' }}>{user.count} tasks</Text>
                  </View>
                ))}
                
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 8, marginTop: 16 }}>Installation Team</Text>
                {analytics.topPerformers.installation?.map((user, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
                    <Text style={{ color: theme.colors.text, fontSize: 14 }}>{user.name}</Text>
                    <Text style={{ color: '#10B981', fontSize: 14, fontWeight: 'bold' }}>{user.count} tasks</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Recent Assignments */}
            {analytics.assignments && (
              <View style={{ backgroundColor: theme.colors.surface, margin: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FileText size={20} color={theme.colors.primary} />
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>Recent Assignments</Text>
                  </View>
                  <TouchableOpacity onPress={exportAssignments} style={{ backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Download size={14} color="#FFF" />
                      <Text style={{ color: '#FFF', marginLeft: 4, fontSize: 12, fontWeight: '600' }}>Export</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                
                {analytics.assignments.slice((assignmentsPage - 1) * assignmentsPerPage, assignmentsPage * assignmentsPerPage).map((assignment, idx) => (
                  <View key={idx} style={{ backgroundColor: theme.colors.background, padding: 12, borderRadius: 8, marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: theme.colors.text, fontWeight: '600', flex: 1 }}>{assignment.storeName}</Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{assignment.dealerCode}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{assignment.city}, {assignment.state}</Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{assignment.assignedTo}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ backgroundColor: assignment.role === 'RECCE' ? '#3B82F620' : '#10B98120', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                        <Text style={{ color: assignment.role === 'RECCE' ? '#3B82F6' : '#10B981', fontSize: 10, fontWeight: '600' }}>{assignment.role}</Text>
                      </View>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{assignment.date ? new Date(assignment.date).toLocaleDateString() : '-'}</Text>
                    </View>
                  </View>
                ))}
                
                {analytics.assignments.length > assignmentsPerPage && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                      Showing {((assignmentsPage - 1) * assignmentsPerPage) + 1} to {Math.min(assignmentsPage * assignmentsPerPage, analytics.assignments.length)} of {analytics.assignments.length}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity onPress={() => setAssignmentsPage(p => Math.max(1, p - 1))} disabled={assignmentsPage === 1} style={{ padding: 8, backgroundColor: theme.colors.background, borderRadius: 6, opacity: assignmentsPage === 1 ? 0.5 : 1 }}>
                        <ChevronLeft size={16} color={theme.colors.text} />
                      </TouchableOpacity>
                      <Text style={{ paddingHorizontal: 12, paddingVertical: 8, color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>
                        {assignmentsPage} / {Math.ceil(analytics.assignments.length / assignmentsPerPage)}
                      </Text>
                      <TouchableOpacity onPress={() => setAssignmentsPage(p => Math.min(Math.ceil(analytics.assignments.length / assignmentsPerPage), p + 1))} disabled={assignmentsPage === Math.ceil(analytics.assignments.length / assignmentsPerPage)} style={{ padding: 8, backgroundColor: theme.colors.background, borderRadius: 6, opacity: assignmentsPage === Math.ceil(analytics.assignments.length / assignmentsPerPage) ? 0.5 : 1 }}>
                        <ChevronRight size={16} color={theme.colors.text} />
                      </TouchableOpacity>
                    </div>
                  </View>
                )}
              </View>
            )}
          </>
        ) : (
          /* USER DASHBOARD */
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 }}>
              <StatCard icon={<Package size={20} color="#3B82F6" />} label="Total Assigned" value={analytics?.overview?.totalAssigned || 0} color="#3B82F6" />
              <StatCard icon={<Clock size={20} color="#F59E0B" />} label="Pending" value={analytics?.overview?.pending || 0} color="#F59E0B" />
              <StatCard icon={<CheckCircle size={20} color="#10B981" />} label="Completed" value={analytics?.overview?.approved || analytics?.overview?.completed || 0} color="#10B981" />
              <StatCard icon={<TrendingUp size={20} color="#8B5CF6" />} label="Success Rate" value={`${analytics?.overview?.completionRate || 0}%`} color="#8B5CF6" />
            </View>

            <View style={{ backgroundColor: theme.colors.surface, margin: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>Task Breakdown</Text>
              <ProgressBar label="Pending" value={analytics?.overview?.pending || 0} total={analytics?.overview?.totalAssigned || 0} color="#F59E0B" />
              <ProgressBar label="Submitted" value={analytics?.overview?.submitted || 0} total={analytics?.overview?.totalAssigned || 0} color="#3B82F6" />
              {analytics?.overview?.approved !== undefined && (
                <ProgressBar label="Approved" value={analytics.overview.approved} total={analytics?.overview?.totalAssigned || 0} color="#10B981" />
              )}
              {analytics?.overview?.completed !== undefined && (
                <ProgressBar label="Completed" value={analytics.overview.completed} total={analytics?.overview?.totalAssigned || 0} color="#10B981" />
              )}
            </View>

            <View style={{ flexDirection: 'row', gap: 16, paddingHorizontal: 16 }}>
              <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Activity size={20} color={theme.colors.primary} />
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>Recent Activity</Text>
                </View>
                <View style={{ backgroundColor: theme.colors.background, padding: 16, borderRadius: 8 }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Submissions (Last 7 Days)</Text>
                  <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: 'bold' }}>{analytics?.recentActivity?.submissionsLast7Days || 0}</Text>
                </View>
              </View>

              <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <MapPin size={20} color={theme.colors.primary} />
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>Your Cities</Text>
                </View>
                {analytics?.distribution?.byCity?.slice(0, 3).map((city, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: theme.colors.text, fontSize: 12 }}>{city._id || 'Unknown'}</Text>
                    <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: 'bold' }}>{city.count}</Text>
                  </View>
                )) || <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>No data</Text>}
              </View>
            </View>

            {/* My Tasks */}
            {analytics.myTasks && (
              <View style={{ backgroundColor: theme.colors.surface, margin: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <FileText size={20} color={theme.colors.primary} />
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>My Tasks</Text>
                </View>
                {analytics.myTasks.length > 0 ? analytics.myTasks.map((task, idx) => (
                  <View key={idx} style={{ backgroundColor: theme.colors.background, padding: 12, borderRadius: 8, marginBottom: 8 }}>
                    <Text style={{ color: theme.colors.text, fontWeight: '600', marginBottom: 4 }}>{task.storeName}</Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 4 }}>
                      {[task.city, task.district, task.state].filter(Boolean).join(', ') || 'N/A'}
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ 
                        backgroundColor: task.status === 'COMPLETED' ? '#10B98120' : task.status === 'SUBMITTED' ? '#F59E0B20' : '#6B728020',
                        paddingHorizontal: 8, 
                        paddingVertical: 4, 
                        borderRadius: 12 
                      }}>
                        <Text style={{ 
                          color: task.status === 'COMPLETED' ? '#10B981' : task.status === 'SUBMITTED' ? '#F59E0B' : '#6B7280',
                          fontSize: 10, 
                          fontWeight: '600' 
                        }}>
                          {task.status?.replace(/_/g, ' ')}
                        </Text>
                      </View>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 10 }}>
                        {task.assignedDate ? new Date(task.assignedDate).toLocaleDateString() : 'N/A'}
                      </Text>
                    </View>
                  </View>
                )) : (
                  <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: 32 }}>No tasks assigned yet</Text>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text }}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>START DATE</Text>
              <TextInput
                value={filters.startDate}
                onChangeText={text => setFilters({ ...filters, startDate: text })}
                style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.text, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.textSecondary}
              />
              
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>END DATE</Text>
              <TextInput
                value={filters.endDate}
                onChangeText={text => setFilters({ ...filters, endDate: text })}
                style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.text, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.textSecondary}
              />
              
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>ZONE</Text>
              <TextInput
                value={filters.zone}
                onChangeText={text => setFilters({ ...filters, zone: text })}
                style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.text, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}
                placeholder="Enter zone"
                placeholderTextColor={theme.colors.textSecondary}
              />
              
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>STATE</Text>
              <TextInput
                value={filters.state}
                onChangeText={text => setFilters({ ...filters, state: text })}
                style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.text, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}
                placeholder="Enter state"
                placeholderTextColor={theme.colors.textSecondary}
              />
              
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>CITY</Text>
              <TextInput
                value={filters.city}
                onChangeText={text => setFilters({ ...filters, city: text })}
                style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.text, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}
                placeholder="Enter city"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </ScrollView>
            
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity onPress={resetFilters} style={{ flex: 1, padding: 16, backgroundColor: theme.colors.surface, borderRadius: 8, alignItems: 'center' }}>
                <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={applyFilters} style={{ flex: 1, padding: 16, backgroundColor: theme.colors.primary, borderRadius: 8, alignItems: 'center' }}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}