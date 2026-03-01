import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Search, FileSpreadsheet, Eye, ChevronLeft, ChevronRight, Filter, CheckSquare, Square } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { apiClient } from '../../services/api';
import Toast from 'react-native-toast-message';
import RNFS from 'react-native-fs';

export default function RFQScreen() {
  const { theme } = useTheme();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStoreIds, setSelectedStoreIds] = useState(new Set());
  const [generating, setGenerating] = useState(false);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStores, setTotalStores] = useState(0);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterZone, setFilterZone] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterVendorCode, setFilterVendorCode] = useState('');
  const [filterDealerCode, setFilterDealerCode] = useState('');
  const [filterPONumber, setFilterPONumber] = useState('');
  const [filterInvoiceNo, setFilterInvoiceNo] = useState('');
  const [filterClientCode, setFilterClientCode] = useState('');
  const [filterCity, setFilterCity] = useState('');

  useEffect(() => {
    fetchStores();
  }, [page, searchTerm, filterStatus, filterZone, filterState, filterDistrict, filterVendorCode, filterDealerCode, filterPONumber, filterInvoiceNo, filterClientCode, filterCity]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (filterStatus !== 'ALL') params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);
      if (filterCity) params.append('city', filterCity);

      const { data } = await apiClient.get(`/stores?${params}`);
      
      let filteredStores = data.stores || [];
      
      if (filterZone) filteredStores = filteredStores.filter(s => s.location.zone?.toLowerCase().includes(filterZone.toLowerCase()));
      if (filterState) filteredStores = filteredStores.filter(s => s.location.state?.toLowerCase().includes(filterState.toLowerCase()));
      if (filterDistrict) filteredStores = filteredStores.filter(s => s.location.district?.toLowerCase().includes(filterDistrict.toLowerCase()));
      if (filterVendorCode) filteredStores = filteredStores.filter(s => s.vendorCode?.toLowerCase().includes(filterVendorCode.toLowerCase()));
      if (filterDealerCode) filteredStores = filteredStores.filter(s => s.dealerCode?.toLowerCase().includes(filterDealerCode.toLowerCase()));
      if (filterPONumber) filteredStores = filteredStores.filter(s => s.commercials?.poNumber?.toLowerCase().includes(filterPONumber.toLowerCase()));
      if (filterInvoiceNo) filteredStores = filteredStores.filter(s => s.commercials?.invoiceNumber?.toLowerCase().includes(filterInvoiceNo.toLowerCase()));
      if (filterClientCode) filteredStores = filteredStores.filter(s => s.clientCode?.toLowerCase().includes(filterClientCode.toLowerCase()));

      setStores(filteredStores);
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

  const handleGenerateRFQ = async () => {
    if (selectedStoreIds.size === 0) {
      Toast.show({ type: 'error', text1: 'Please select at least one store' });
      return;
    }

    setGenerating(true);
    try {
      const response = await apiClient.post('/rfq/generate', { 
        storeIds: Array.from(selectedStoreIds) 
      }, { responseType: 'blob' });
      
      const path = `${RNFS.DownloadDirectoryPath}/RFQ_${Date.now()}.xlsx`;
      await RNFS.writeFile(path, response.data, 'base64');
      
      Toast.show({ 
        type: 'success', 
        text1: 'RFQ generated successfully!', 
        text2: `Saved to: ${path}` 
      });
      setSelectedStoreIds(new Set());
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to generate RFQ' });
    } finally {
      setGenerating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'UPLOADED': return '#6B7280';
      case 'RECCE_ASSIGNED': return '#3B82F6';
      case 'RECCE_SUBMITTED': return '#F59E0B';
      case 'RECCE_APPROVED': return '#8B5CF6';
      case 'INSTALLATION_ASSIGNED': return '#6366F1';
      case 'INSTALLATION_SUBMITTED': return '#14B8A6';
      case 'COMPLETED': return '#10B981';
      default: return '#6B7280';
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
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{item.location?.city}</Text>
          </View>
          <View style={{ backgroundColor: getStatusColor(item.currentStatus) + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: getStatusColor(item.currentStatus), fontSize: 10, fontWeight: '600' }}>
              {item.currentStatus?.replace(/_/g, ' ') || 'UPLOADED'}
            </Text>
          </View>
        </View>
        
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Store ID:</Text>
            <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600' }}>{item.storeId || '-'}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Client Code:</Text>
            <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600' }}>{item.clientCode || '-'}</Text>
          </View>
          {item.specs && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Dimensions:</Text>
              <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600' }}>
                {item.specs.width}x{item.specs.height} ft (Qty: {item.specs.qty})
              </Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Total Cost:</Text>
            <Text style={{ color: '#10B981', fontSize: 12, fontWeight: 'bold' }}>
              ₹{item.commercials?.totalCost?.toLocaleString() || '0'}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={{ backgroundColor: theme.colors.primary + '20', padding: 8, borderRadius: 8, alignItems: 'center' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Eye size={14} color={theme.colors.primary} />
            <Text style={{ color: theme.colors.primary, marginLeft: 4, fontSize: 12, fontWeight: '600' }}>View Details</Text>
          </View>
        </TouchableOpacity>
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
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Create Request for Quotation</Text>
          </View>
          {selectedStoreIds.size > 0 && (
            <TouchableOpacity 
              onPress={handleGenerateRFQ} 
              disabled={generating} 
              style={{ 
                backgroundColor: theme.colors.primary, 
                paddingHorizontal: 16, 
                paddingVertical: 10, 
                borderRadius: 8, 
                flexDirection: 'row', 
                alignItems: 'center',
                opacity: generating ? 0.5 : 1
              }}
            >
              {generating ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <FileSpreadsheet size={16} color="#FFF" />
              )}
              <Text style={{ color: '#FFF', marginLeft: 8, fontWeight: '600' }}>
                {generating ? 'Generating...' : `Generate RFQ (${selectedStoreIds.size})`}
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
          
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <TextInput
              placeholder="Zone"
              placeholderTextColor={theme.colors.textSecondary}
              value={filterZone}
              onChangeText={setFilterZone}
              style={{ backgroundColor: theme.colors.background, padding: 8, borderRadius: 6, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border, minWidth: 80, flex: 1 }}
            />
            <TextInput
              placeholder="State"
              placeholderTextColor={theme.colors.textSecondary}
              value={filterState}
              onChangeText={setFilterState}
              style={{ backgroundColor: theme.colors.background, padding: 8, borderRadius: 6, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border, minWidth: 80, flex: 1 }}
            />
            <TextInput
              placeholder="City"
              placeholderTextColor={theme.colors.textSecondary}
              value={filterCity}
              onChangeText={setFilterCity}
              style={{ backgroundColor: theme.colors.background, padding: 8, borderRadius: 6, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border, minWidth: 80, flex: 1 }}
            />
          </View>
        </View>
      </View>

      {/* Store List */}
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
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