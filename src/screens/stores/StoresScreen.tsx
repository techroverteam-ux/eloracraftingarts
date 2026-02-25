import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Modal, ScrollView, Alert, Picker } from 'react-native';
import { Search, Plus, Eye, Trash2, X, MapPin, ChevronLeft, ChevronRight, UserPlus, Check, XCircle } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeService } from '../../services/storeService';
import { Store, StoreStatus } from '../../types';
import Toast from 'react-native-toast-message';

export default function StoresScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  const handleDelete = (id: string) => {
    Alert.alert('Delete Store', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await storeService.delete(id);
            Toast.show({ type: 'success', text1: 'Store deleted' });
            fetchStores();
          } catch (error) {
            Toast.show({ type: 'error', text1: 'Failed to delete store' });
          }
        },
      },
    ]);
  };

  const handleApproveRecce = async (id: string) => {
    try {
      await storeService.approveRecce(id);
      Toast.show({ type: 'success', text1: 'Recce approved' });
      fetchStores();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to approve recce' });
    }
  };

  const handleRejectRecce = async (id: string) => {
    try {
      await storeService.rejectRecce(id);
      Toast.show({ type: 'success', text1: 'Recce rejected' });
      fetchStores();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to reject recce' });
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

  const renderStore = ({ item }: { item: Store }) => (
    <View style={{ backgroundColor: theme.colors.surface, padding: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '600', marginBottom: 4 }}>{item.storeId || item.dealerCode}</Text>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{item.storeName}</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{item.location.city}, {item.location.state}</Text>
        </View>
        <View style={{ backgroundColor: getStatusColor(item.currentStatus) + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
          <Text style={{ color: getStatusColor(item.currentStatus), fontSize: 10, fontWeight: '600' }}>{item.currentStatus.replace(/_/g, ' ')}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <View>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Dealer Code</Text>
          <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>{item.dealerCode}</Text>
        </View>
        {item.specs && (
          <View>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Dimensions</Text>
            <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>{item.specs.width}x{item.specs.height} ft</Text>
          </View>
        )}
        <View>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Total Cost</Text>
          <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '600' }}>₹{item.commercials?.totalCost?.toLocaleString() || '0'}</Text>
        </View>
      </View>

      {(item.workflow.recceAssignedTo || item.workflow.installationAssignedTo) && (
        <View style={{ marginBottom: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
          {item.workflow.recceAssignedTo && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#3B82F620', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                <Text style={{ color: '#3B82F6', fontSize: 10, fontWeight: 'bold' }}>R</Text>
              </View>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Recce: </Text>
              <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600' }}>{item.workflow.recceAssignedTo.name}</Text>
            </View>
          )}
          {item.workflow.installationAssignedTo && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#10B98120', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                <Text style={{ color: '#10B981', fontSize: 10, fontWeight: 'bold' }}>I</Text>
              </View>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Install: </Text>
              <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600' }}>{item.workflow.installationAssignedTo.name}</Text>
            </View>
          )}
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity onPress={() => navigation.navigate('StoreDetail', { storeId: item._id })} style={{ flex: 1, backgroundColor: '#3B82F620', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Eye size={16} color="#3B82F6" />
          <Text style={{ color: '#3B82F6', marginLeft: 6, fontWeight: '600', fontSize: 12 }}>View</Text>
        </TouchableOpacity>
        {item.currentStatus === StoreStatus.RECCE_SUBMITTED && (
          <>
            <TouchableOpacity onPress={() => handleApproveRecce(item._id)} style={{ backgroundColor: '#10B98120', padding: 10, borderRadius: 8 }}>
              <Check size={16} color="#10B981" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRejectRecce(item._id)} style={{ backgroundColor: '#EF444420', padding: 10, borderRadius: 8 }}>
              <XCircle size={16} color="#EF4444" />
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity onPress={() => handleDelete(item._id)} style={{ backgroundColor: '#EF444420', padding: 10, borderRadius: 8 }}>
          <Trash2 size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text }}>Stores</Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Manage store operations</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('AddStore')} style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
            <Plus size={20} color="#FFF" />
          </TouchableOpacity>
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
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : stores.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <MapPin size={48} color={theme.colors.textSecondary} />
          <Text style={{ color: theme.colors.textSecondary, marginTop: 12 }}>No stores found</Text>
        </View>
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
