import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Picker } from 'react-native';
import { Search, MapPin, Camera, CheckCircle2, Download, Wrench, FileText, CheckSquare, Square, Filter } from 'lucide-react-native';
import { apiClient } from '../../services/api';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

export default function InstallationScreen() {
  const navigation = useNavigation();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStores, setSelectedStores] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchStores();
  }, [page, searchTerm, filterStatus]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '10', ...(searchTerm && { search: searchTerm }) });
      if (filterStatus !== 'ALL') params.append('status', filterStatus);
      else params.append('status', 'INSTALLATION_ASSIGNED,INSTALLATION_SUBMITTED,COMPLETED');
      const { data } = await apiClient.get(`/stores?${params}`);
      setStores(data.stores);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load tasks' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      await apiClient.get('/stores/export/installation', { responseType: 'blob' });
      Toast.show({ type: 'success', text1: 'Export started' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Export failed' });
    }
  };

  const handleBulkPPT = async () => {
    if (selectedStores.length === 0) {
      Toast.show({ type: 'error', text1: 'Please select stores' });
      return;
    }
    try {
      await apiClient.post('/stores/ppt/bulk', { storeIds: selectedStores, type: 'installation' }, { responseType: 'blob' });
      Toast.show({ type: 'success', text1: `PPT generated for ${selectedStores.length} stores` });
      setSelectedStores([]);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to generate PPT' });
    }
  };

  const handleBulkPDF = async () => {
    if (selectedStores.length === 0) {
      Toast.show({ type: 'error', text1: 'Please select stores' });
      return;
    }
    try {
      await apiClient.post('/stores/pdf/bulk', { storeIds: selectedStores, type: 'installation' }, { responseType: 'blob' });
      Toast.show({ type: 'success', text1: `PDF generated for ${selectedStores.length} stores` });
      setSelectedStores([]);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to generate PDF' });
    }
  };

  const toggleStoreSelection = (storeId) => {
    if (selectedStores.includes(storeId)) {
      setSelectedStores(selectedStores.filter(id => id !== storeId));
    } else {
      setSelectedStores([...selectedStores, storeId]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'INSTALLATION_ASSIGNED': return 'bg-orange-100 text-orange-800';
      case 'INSTALLATION_SUBMITTED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStore = ({ item }) => {
    const isDone = item.currentStatus === 'COMPLETED' || item.currentStatus === 'INSTALLATION_SUBMITTED';
    const canSelect = item.currentStatus === 'INSTALLATION_SUBMITTED' || item.currentStatus === 'COMPLETED';
    const isSelected = selectedStores.includes(item._id);
    return (
      <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-3">
        <View className={`h-1.5 w-full ${isDone ? 'bg-green-500' : 'bg-orange-500'}`} />
        <View className="p-4">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-row items-start gap-2 flex-1">
              {canSelect && (
                <TouchableOpacity onPress={() => toggleStoreSelection(item._id)} className="mt-1">
                  {isSelected ? <CheckSquare size={20} color="#3b82f6" /> : <Square size={20} color="#9ca3af" />}
                </TouchableOpacity>
              )}
              <View className="flex-1">
                <Text className="font-bold text-base text-gray-900">{item.storeName}</Text>
                <Text className="text-xs text-gray-500 font-mono mt-0.5">{item.dealerCode}</Text>
              </View>
            </View>
            <View className={`px-2 py-1 rounded-full ${getStatusColor(item.currentStatus)}`}>
              <Text className="text-[10px] font-bold uppercase">{item.currentStatus.replace(/_/g, ' ').replace('INSTALLATION', '')}</Text>
            </View>
          </View>
          <View className="flex-row items-start gap-2 mb-3">
            <MapPin size={16} color="#6b7280" />
            <Text className="text-sm text-gray-600 flex-1">{item.location.address || item.location.city}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('InstallationDetail', { storeId: item._id })} className={`py-2.5 rounded-lg flex-row items-center justify-center gap-2 ${isDone ? 'bg-green-600' : 'bg-blue-600'}`}>
            {isDone ? <><CheckCircle2 size={16} color="#fff" /><Text className="text-white font-medium text-sm">View Details</Text></> : <><Camera size={16} color="#fff" /><Text className="text-white font-medium text-sm">Upload Proof</Text></>}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center gap-2">
          <Wrench size={24} color="#2563eb" />
          <Text className="text-2xl font-bold text-gray-900">Installation Tasks</Text>
        </View>
        <Text className="text-sm text-gray-500">Manage your installation assignments</Text>
      </View>
      <View className="px-4 py-3">
        <View className="flex-row gap-2 mb-3">
          <View className="flex-1 flex-row items-center bg-white border border-gray-300 rounded-lg px-3">
            <Search size={16} color="#6b7280" />
            <TextInput placeholder="Search stores..." value={searchTerm} onChangeText={setSearchTerm} className="flex-1 ml-2 py-2 text-sm" />
          </View>
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)} className="bg-gray-600 px-3 py-2 rounded-lg justify-center">
            <Filter size={18} color="#fff" />
          </TouchableOpacity>
          {selectedStores.length > 0 && (
            <>
              <TouchableOpacity onPress={handleBulkPPT} className="bg-yellow-500 px-3 py-2 rounded-lg justify-center">
                <FileText size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleBulkPDF} className="bg-orange-500 px-3 py-2 rounded-lg justify-center">
                <FileText size={18} color="#fff" />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity onPress={handleExport} className="bg-green-600 px-3 py-2 rounded-lg justify-center">
            <Download size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        {showFilters && (
          <View className="bg-white border border-gray-300 rounded-lg p-3 mb-3">
            <Text className="text-sm font-medium text-gray-700 mb-2">Filter by Status</Text>
            <Picker selectedValue={filterStatus} onValueChange={(value) => { setFilterStatus(value); setPage(1); }}>
              <Picker.Item label="All Status" value="ALL" />
              <Picker.Item label="Pending" value="INSTALLATION_ASSIGNED" />
              <Picker.Item label="Submitted" value="INSTALLATION_SUBMITTED" />
              <Picker.Item label="Completed" value="COMPLETED" />
            </Picker>
          </View>
        )}
      </View>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#eab308" />
        </View>
      ) : (
        <FlatList data={stores} renderItem={renderStore} keyExtractor={(item) => item._id} contentContainerStyle={{ padding: 16 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStores(); }} />} />
      )}
      <View className="flex-row justify-between items-center px-4 py-3 bg-white border-t border-gray-200">
        <TouchableOpacity onPress={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className={`px-4 py-2 rounded-lg ${page === 1 ? 'bg-gray-100' : 'bg-yellow-500'}`}>
          <Text className={page === 1 ? 'text-gray-400' : 'text-white'}>Prev</Text>
        </TouchableOpacity>
        <Text className="text-sm font-medium text-gray-700">{page} / {totalPages}</Text>
        <TouchableOpacity onPress={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className={`px-4 py-2 rounded-lg ${page === totalPages ? 'bg-gray-100' : 'bg-yellow-500'}`}>
          <Text className={page === totalPages ? 'text-gray-400' : 'text-white'}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
