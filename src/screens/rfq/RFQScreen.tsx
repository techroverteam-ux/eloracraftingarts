import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Alert, Picker } from 'react-native';
import { Search, FileSpreadsheet, CheckSquare, Square, ChevronLeft, ChevronRight, Filter } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeService } from '../../services/storeService';
import { rfqService } from '../../services/rfqService';
import { Store, StoreStatus } from '../../types';
import Toast from 'react-native-toast-message';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

export default function RFQScreen() {
  const { theme } = useTheme();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStoreIds, setSelectedStoreIds] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchStores();
  }, [page, searchTerm, filterStatus]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const data = await storeService.getAll({
        page,
        limit: 10,
        search: searchTerm,
        status: filterStatus,
      });
      setStores(data.stores);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load stores' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedStoreIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedStoreIds(newSet);
  };

  const toggleAll = () => {
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
      const blob = await rfqService.generate(Array.from(selectedStoreIds));
      const fileName = `RFQ_${Date.now()}.xlsx`;
      const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      
      await RNFS.writeFile(filePath, blob, 'base64');
      
      await Share.open({
        url: `file://${filePath}`,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        title: 'Share RFQ',
      });

      Toast.show({ type: 'success', text1: 'RFQ generated successfully' });
      setSelectedStoreIds(new Set());
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Failed to generate RFQ' });
    } finally {
      setGenerating(false);
    }
  };

  const getStatusColor = (status: StoreStatus) => {
    switch (status) {
      case StoreStatus.UPLOADED: return '#6B7280';
      case StoreStatus.RECCE_ASSIGNED: return '#3B82F6';
      case StoreStatus.RECCE_SUBMITTED: return '#F59E0B';
      case StoreStatus.RECCE_APPROVED: return '#8B5CF6';
      case StoreStatus.INSTALLATION_ASSIGNED: return '#6366F1';
      case StoreStatus.INSTALLATION_SUBMITTED: return '#14B8A6';
      case StoreStatus.COMPLETED: return '#10B981';
      default: return '#6B7280';
    }
  };

  const renderStore = ({ item }: { item: Store }) => {
    const isSelected = selectedStoreIds.has(item._id);
    return (
      <TouchableOpacity
        onPress={() => toggleSelection(item._id)}
        style={{ backgroundColor: isSelected ? theme.colors.primary + '10' : theme.colors.surface, padding: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: isSelected ? theme.colors.primary : theme.colors.border }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ marginRight: 12 }}>
            {isSelected ? <CheckSquare size={24} color={theme.colors.primary} /> : <Square size={24} color={theme.colors.textSecondary} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{item.storeName}</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{item.dealerCode}</Text>
          </View>
          <View style={{ backgroundColor: getStatusColor(item.currentStatus) + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: getStatusColor(item.currentStatus), fontSize: 10, fontWeight: '600' }}>{item.currentStatus.replace(/_/g, ' ')}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{item.location.city}</Text>
          <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '600' }}>{item.storeId || item.clientCode}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text }}>RFQ Generation</Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Select stores for RFQ</Text>
          </View>
          {selectedStoreIds.size > 0 && (
            <TouchableOpacity
              onPress={handleGenerateRFQ}
              disabled={generating}
              style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
            >
              <FileSpreadsheet size={20} color="#FFF" />
              <Text style={{ color: '#FFF', marginLeft: 6, fontWeight: '600' }}>({selectedStoreIds.size})</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 8, paddingHorizontal: 12, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border }}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput
            placeholder="Search stores..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, color: theme.colors.text }}
          />
        </View>

        <View style={{ backgroundColor: theme.colors.surface, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 16 }}>
          <Picker
            selectedValue={filterStatus}
            onValueChange={setFilterStatus}
            style={{ color: theme.colors.text }}
          >
            <Picker.Item label="All Status" value="ALL" />
            {Object.values(StoreStatus).map(status => (
              <Picker.Item key={status} label={status.replace(/_/g, ' ')} value={status} />
            ))}
          </Picker>
        </View>

        {selectedStoreIds.size > 0 && (
          <TouchableOpacity onPress={toggleAll} style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}>
            <Text style={{ color: theme.colors.text, textAlign: 'center', fontWeight: '600' }}>
              {selectedStoreIds.size === stores.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={stores}
          renderItem={renderStore}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStores(); }} colors={[theme.colors.primary]} />}
          ListFooterComponent={
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, gap: 12 }}>
              <TouchableOpacity onPress={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: 8, backgroundColor: theme.colors.surface, borderRadius: 8, opacity: page === 1 ? 0.5 : 1 }}>
                <ChevronLeft size={20} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Page {page} of {totalPages}</Text>
              <TouchableOpacity onPress={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: 8, backgroundColor: theme.colors.surface, borderRadius: 8, opacity: page === totalPages ? 0.5 : 1 }}>
                <ChevronRight size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}
