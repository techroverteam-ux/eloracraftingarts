import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { Search, FileSpreadsheet, Eye, ChevronLeft, ChevronRight, CheckSquare, Square, Filter } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { apiClient } from '../../services/api';
import Toast from 'react-native-toast-message';

export default function RFQScreen() {
  const { theme } = useTheme();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStoreIds, setSelectedStoreIds] = useState(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStores, setTotalStores] = useState(0);

  useEffect(() => {
    fetchStores();
  }, [page, searchTerm]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (searchTerm) params.append('search', searchTerm);

      const { data } = await apiClient.get(`/stores?${params}`);
      setStores(data.stores || []);
      if (data.pagination) {
        setTotalPages(data.pagination.pages);
        setTotalStores(data.pagination.total);
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load stores' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleGenerateRFQ = async () => {
    if (selectedStoreIds.size === 0) {
      Toast.show({ type: 'error', text1: 'Please select at least one store' });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiClient.post('/rfq/generate', { 
        storeIds: Array.from(selectedStoreIds) 
      }, { responseType: 'blob' });
      
      Toast.show({ type: 'success', text1: 'RFQ generated successfully!' });
      setSelectedStoreIds(new Set());
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to generate RFQ' });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleStoreSelection = (id) => {
    const newSet = new Set(selectedStoreIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedStoreIds(newSet);
  };

  const toggleAllSelection = () => {
    if (selectedStoreIds.size === stores.length) {
      setSelectedStoreIds(new Set());
    } else {
      setSelectedStoreIds(new Set(stores.map(s => s._id)));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'UPLOADED': return 'bg-gray-100 text-gray-800';
      case 'RECCE_ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'RECCE_SUBMITTED': return 'bg-yellow-100 text-yellow-800';
      case 'RECCE_APPROVED': return 'bg-purple-100 text-purple-800';
      case 'INSTALLATION_ASSIGNED': return 'bg-indigo-100 text-indigo-800';
      case 'INSTALLATION_SUBMITTED': return 'bg-teal-100 text-teal-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const renderStore = ({ item }) => {
    const isSelected = selectedStoreIds.has(item._id);
    
    return (
      <View style={{ 
        backgroundColor: isSelected ? theme.colors.primary + '20' : theme.colors.surface, 
        padding: 16, 
        marginBottom: 12, 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: isSelected ? theme.colors.primary : theme.colors.border 
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity onPress={() => toggleStoreSelection(item._id)} style={{ marginRight: 12 }}>
            {isSelected ? 
              <CheckSquare size={20} color={theme.colors.primary} /> : 
              <Square size={20} color={theme.colors.textSecondary} />
            }
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>{item.storeName}</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>{item.dealerCode}</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{item.location?.city || '-'}</Text>
          </View>
          <View style={{ backgroundColor: getStatusColor(item.currentStatus).split(' ')[0], paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ fontSize: 10, fontWeight: '600' }}>
              {item.currentStatus?.replace(/_/g, ' ') || 'UPLOADED'}
            </Text>
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Store ID: {item.storeId || '-'}</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Client: {item.clientCode || '-'}</Text>
          </View>
          <TouchableOpacity 
            style={{ backgroundColor: theme.colors.primary + '20', padding: 8, borderRadius: 8 }}
          >
            <Eye size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text }}>RFQ Generation</Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Create Request for Quotation for selected stores</Text>
          </View>
          {selectedStoreIds.size > 0 && (
            <TouchableOpacity 
              onPress={handleGenerateRFQ} 
              disabled={isGenerating}
              style={{ 
                backgroundColor: theme.colors.primary, 
                paddingHorizontal: 16, 
                paddingVertical: 10, 
                borderRadius: 8, 
                flexDirection: 'row', 
                alignItems: 'center',
                opacity: isGenerating ? 0.7 : 1
              }}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <FileSpreadsheet size={16} color="#FFF" />
              )}
              <Text style={{ color: '#FFF', marginLeft: 6, fontWeight: '600' }}>
                Generate RFQ ({selectedStoreIds.size})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <View style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Filter size={16} color={theme.colors.textSecondary} />
            <Text style={{ color: theme.colors.text, marginLeft: 8, fontWeight: '600' }}>Filters</Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: theme.colors.border }}>
            <Search size={16} color={theme.colors.textSecondary} />
            <TextInput
              placeholder="Search stores..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 8, color: theme.colors.text }}
            />
          </View>
        </View>
      </View>

      {/* Store List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : stores.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 16 }}>No stores found matching filters</Text>
        </View>
      ) : (
        <>
          {/* Select All Header */}
          <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
            <TouchableOpacity onPress={toggleAllSelection} style={{ flexDirection: 'row', alignItems: 'center' }}>
              {selectedStoreIds.size === stores.length && stores.length > 0 ? 
                <CheckSquare size={20} color={theme.colors.primary} /> : 
                <Square size={20} color={theme.colors.textSecondary} />
              }
              <Text style={{ color: theme.colors.text, marginLeft: 8, fontWeight: '600' }}>
                Select All ({stores.length})
              </Text>
            </TouchableOpacity>
          </View>

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
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingVertical: 12, backgroundColor: theme.colors.surface, borderRadius: 8 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, paddingHorizontal: 12 }}>
                  Showing {(page - 1) * 10 + 1}-{Math.min(page * 10, totalStores)} of {totalStores}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 }}>
                  <TouchableOpacity 
                    onPress={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1}
                    style={{ padding: 8, backgroundColor: theme.colors.background, borderRadius: 8, opacity: page === 1 ? 0.5 : 1 }}
                  >
                    <ChevronLeft size={16} color={theme.colors.text} />
                  </TouchableOpacity>
                  <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>{page}</Text>
                  <TouchableOpacity 
                    onPress={() => setPage(p => Math.min(totalPages, p + 1))} 
                    disabled={page === totalPages}
                    style={{ padding: 8, backgroundColor: theme.colors.background, borderRadius: 8, opacity: page === totalPages ? 0.5 : 1 }}
                  >
                    <ChevronRight size={16} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}