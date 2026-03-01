import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Search, Plus, Eye, Download, ChevronLeft, ChevronRight, Filter, FileText, CheckSquare, Square } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { apiClient } from '../../services/api';
import Toast from 'react-native-toast-message';

export default function RecceScreen() {
  const { theme } = useTheme();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedStoreIds, setSelectedStoreIds] = useState(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStores, setTotalStores] = useState(0);

  useEffect(() => {
    fetchStores();
  }, [page, searchTerm, filterStatus]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'ALL') params.append('status', filterStatus);

      const { data } = await apiClient.get(`/stores?${params}`);
      
      // Filter for recce-related stores
      const recceStores = data.stores.filter(store => 
        store.currentStatus === 'RECCE_ASSIGNED' ||
        store.currentStatus === 'RECCE_SUBMITTED' ||
        store.currentStatus === 'RECCE_APPROVED' ||
        store.currentStatus === 'RECCE_REJECTED'
      );
      
      setStores(recceStores);
      if (data.pagination) {
        setTotalPages(data.pagination.pages);
        setTotalStores(data.pagination.total);
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load recce tasks' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBulkPPTDownload = async () => {
    if (selectedStoreIds.size === 0) {
      Toast.show({ type: 'error', text1: 'Please select stores' });
      return;
    }
    
    try {
      Toast.show({ type: 'info', text1: 'Generating PPTs...' });
      const response = await apiClient.post('/stores/ppt/bulk', {
        storeIds: Array.from(selectedStoreIds),
        type: 'recce'
      }, { responseType: 'blob' });
      
      Toast.show({ type: 'success', text1: `Downloaded PPT with ${selectedStoreIds.size} stores` });
      setSelectedStoreIds(new Set());
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to download PPTs' });
    }
  };

  const handleExport = async () => {
    try {
      const response = await apiClient.get('/stores/export/recce', { responseType: 'blob' });
      Toast.show({ type: 'success', text1: 'Exported Successfully' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Export Failed' });
    }
  };

  const toggleStoreSelection = (id) => {
    const newSet = new Set(selectedStoreIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedStoreIds(newSet);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'RECCE_ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'RECCE_SUBMITTED': return 'bg-yellow-100 text-yellow-800';
      case 'RECCE_APPROVED': return 'bg-purple-100 text-purple-800';
      case 'RECCE_REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const renderStore = ({ item }) => (
    <View style={{ backgroundColor: theme.colors.surface, padding: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <TouchableOpacity onPress={() => toggleStoreSelection(item._id)} style={{ marginRight: 12 }}>
          {selectedStoreIds.has(item._id) ? 
            <CheckSquare size={20} color={theme.colors.primary} /> : 
            <Square size={20} color={theme.colors.textSecondary} />
          }
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>{item.storeName}</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>{item.dealerCode}</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{item.location.city}</Text>
        </View>
        <View style={{ backgroundColor: getStatusColor(item.currentStatus).split(' ')[0], paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
          <Text style={{ fontSize: 10, fontWeight: '600' }}>{item.currentStatus.replace(/_/g, ' ')}</Text>
        </View>
      </View>
      
      {item.workflow?.recceAssignedTo && (
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 8 }}>
          Assigned To: {item.workflow.recceAssignedTo.name}
        </Text>
      )}
      
      <TouchableOpacity 
        style={{ backgroundColor: theme.colors.primary, padding: 12, borderRadius: 8, alignItems: 'center' }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Eye size={16} color="#FFF" />
          <Text style={{ color: '#FFF', marginLeft: 6, fontWeight: '600' }}>View Details</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text }}>Recce Inspection</Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Manage your recce assignments</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {selectedStoreIds.size > 0 && (
              <TouchableOpacity onPress={handleBulkPPTDownload} style={{ backgroundColor: '#EAB308', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
                <FileText size={16} color="#FFF" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleExport} style={{ backgroundColor: theme.colors.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border }}>
              <Download size={16} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters */}
        <View style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, borderRadius: 8, paddingHorizontal: 12, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border }}>
            <Search size={16} color={theme.colors.textSecondary} />
            <TextInput
              placeholder="Search stores..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 8, color: theme.colors.text }}
            />
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Filter size={16} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
            <View style={{ flex: 1, backgroundColor: theme.colors.background, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border }}>
              {/* Status filter would go here - simplified for mobile */}
              <Text style={{ padding: 8, color: theme.colors.text, fontSize: 14 }}>All Status</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Store List */}
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={stores}
          renderItem={renderStore}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => { setRefreshing(true); fetchStores(); }} 
              colors={[theme.colors.primary]} 
            />
          }
          ListFooterComponent={
            stores.length > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, gap: 12 }}>
                <TouchableOpacity 
                  onPress={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  style={{ padding: 8, backgroundColor: theme.colors.surface, borderRadius: 8, opacity: page === 1 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={20} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Page {page} of {totalPages}</Text>
                <TouchableOpacity 
                  onPress={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages}
                  style={{ padding: 8, backgroundColor: theme.colors.surface, borderRadius: 8, opacity: page === totalPages ? 0.5 : 1 }}
                >
                  <ChevronRight size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            )
          }
        />
      )}
    </View>
  );
}