import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Alert, Modal, ScrollView } from 'react-native';
import { Search, Plus, Eye, Trash2, Download, Upload, ChevronLeft, ChevronRight, CheckSquare, Square, UserPlus, X, FileText, Filter } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { apiClient } from '../../services/api';
import Toast from 'react-native-toast-message';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';

export default function StoresScreen() {
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
  
  // Bulk Upload State
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState(null);
  
  // Assignment State
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [assignStage, setAssignStage] = useState('RECCE');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assigning, setAssigning] = useState(false);
  
  // Add Store State
  const [addStoreModalVisible, setAddStoreModalVisible] = useState(false);
  const [newStoreData, setNewStoreData] = useState({
    dealerCode: '', storeName: '', vendorCode: '', clientCode: '',
    zone: '', state: '', district: '', city: '', address: '',
    latitude: '', longitude: '', poNumber: '', invoiceRemarks: '',
    poMonth: '', invoiceNo: '', totalCost: '', boardRate: '',
    angleCharges: '', scaffoldingCharges: '', transportation: '',
    flanges: '', lollipop: '', oneWayVision: '', sunboard: '',
    boardType: '', width: '', height: '', qty: '1'
  });
  const [savingStore, setSavingStore] = useState(false);

  useEffect(() => {
    fetchStores();
  }, [page, searchTerm, filterStatus]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (filterStatus !== 'ALL') params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);

      const { data } = await apiClient.get(`/stores?${params}`);
      setStores(data.stores);
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

  const handleExportStores = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'ALL') params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await apiClient.get(`/stores/export?${params}`, { responseType: 'blob' });
      
      // Save file to device
      const path = `${RNFS.DownloadDirectoryPath}/Stores_Export_${Date.now()}.xlsx`;
      await RNFS.writeFile(path, response.data, 'base64');
      
      Toast.show({ type: 'success', text1: 'Stores exported successfully!', text2: `Saved to: ${path}` });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to export stores' });
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await apiClient.get('/stores/template', { responseType: 'blob' });
      const path = `${RNFS.DownloadDirectoryPath}/Store_Upload_Template.xlsx`;
      await RNFS.writeFile(path, response.data, 'base64');
      Toast.show({ type: 'success', text1: 'Template downloaded!', text2: `Saved to: ${path}` });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to download template' });
    }
  };

  const handleFileSelect = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.xlsx, DocumentPicker.types.xls],
        allowMultiSelection: true,
      });
      setSelectedFiles(results);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Toast.show({ type: 'error', text1: 'Failed to select files' });
      }
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      });
    });
    
    try {
      const { data } = await apiClient.post('/stores/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadStats(data);
      Toast.show({ type: 'success', text1: `Success: ${data.successCount}, Errors: ${data.errorCount}` });
      if (data.successCount > 0) {
        fetchStores();
        setSelectedFiles([]);
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const openAssignModal = async (stage) => {
    if (selectedStoreIds.size === 0) {
      Toast.show({ type: 'error', text1: 'Select stores first' });
      return;
    }
    
    setAssignStage(stage);
    setAssignModalVisible(true);
    
    try {
      const roleCode = stage === 'RECCE' ? 'RECCE' : 'INSTALLATION';
      const { data } = await apiClient.get(`/users/role/${roleCode}`);
      setAvailableUsers(data.users);
    } catch (error) {
      Toast.show({ type: 'error', text1: `Failed to fetch ${stage} users` });
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) {
      Toast.show({ type: 'error', text1: 'Please select a user' });
      return;
    }
    
    setAssigning(true);
    try {
      await apiClient.post('/stores/assign', {
        storeIds: Array.from(selectedStoreIds),
        userId: selectedUserId,
        stage: assignStage,
      });
      Toast.show({ type: 'success', text1: 'Assignment Successful!' });
      setAssignModalVisible(false);
      setSelectedStoreIds(new Set());
      fetchStores();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Assignment Failed' });
    } finally {
      setAssigning(false);
    }
  };

  const handleAddStore = async () => {
    if (!newStoreData.dealerCode || !newStoreData.storeName) {
      Toast.show({ type: 'error', text1: 'Dealer Code and Name are required' });
      return;
    }
    
    setSavingStore(true);
    try {
      const payload = {
        dealerCode: newStoreData.dealerCode,
        storeName: newStoreData.storeName,
        vendorCode: newStoreData.vendorCode,
        clientCode: newStoreData.clientCode,
        location: {
          zone: newStoreData.zone,
          state: newStoreData.state,
          district: newStoreData.district,
          city: newStoreData.city,
          address: newStoreData.address,
          ...(newStoreData.latitude && newStoreData.longitude && {
            coordinates: {
              lat: Number(newStoreData.latitude),
              lng: Number(newStoreData.longitude)
            }
          })
        },
        commercials: {
          poNumber: newStoreData.poNumber,
          poMonth: newStoreData.poMonth,
          invoiceNumber: newStoreData.invoiceNo,
          invoiceRemarks: newStoreData.invoiceRemarks,
          totalCost: Number(newStoreData.totalCost) || 0,
        },
        costDetails: {
          boardRate: Number(newStoreData.boardRate) || 0,
          angleCharges: Number(newStoreData.angleCharges) || 0,
          scaffoldingCharges: Number(newStoreData.scaffoldingCharges) || 0,
          transportation: Number(newStoreData.transportation) || 0,
          flanges: Number(newStoreData.flanges) || 0,
          lollipop: Number(newStoreData.lollipop) || 0,
          oneWayVision: Number(newStoreData.oneWayVision) || 0,
          sunboard: Number(newStoreData.sunboard) || 0,
        },
        specs: {
          type: newStoreData.boardType,
          width: Number(newStoreData.width) || 0,
          height: Number(newStoreData.height) || 0,
          qty: Number(newStoreData.qty) || 1,
          boardSize: `${newStoreData.width}x${newStoreData.height}`,
        },
      };
      
      await apiClient.post('/stores', payload);
      Toast.show({ type: 'success', text1: 'Store Added Successfully' });
      setAddStoreModalVisible(false);
      setNewStoreData({
        dealerCode: '', storeName: '', vendorCode: '', clientCode: '',
        zone: '', state: '', district: '', city: '', address: '',
        latitude: '', longitude: '', poNumber: '', invoiceRemarks: '',
        poMonth: '', invoiceNo: '', totalCost: '', boardRate: '',
        angleCharges: '', scaffoldingCharges: '', transportation: '',
        flanges: '', lollipop: '', oneWayVision: '', sunboard: '',
        boardType: '', width: '', height: '', qty: '1'
      });
      fetchStores();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to add store' });
    } finally {
      setSavingStore(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStoreIds.size === 0) return;
    
    Alert.alert(
      'Delete Stores',
      `Are you sure you want to delete ${selectedStoreIds.size} store(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              const storeIds = Array.from(selectedStoreIds);
              await Promise.all(storeIds.map(id => apiClient.delete(`/stores/${id}`)));
              Toast.show({ type: 'success', text1: `${storeIds.length} store(s) deleted successfully` });
              setSelectedStoreIds(new Set());
              fetchStores();
            } catch (error) {
              Toast.show({ type: 'error', text1: 'Failed to delete some stores' });
            }
          },
        },
      ]
    );
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Store',
      'Are you sure you want to delete this store?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/stores/${id}`);
              Toast.show({ type: 'success', text1: 'Store deleted successfully' });
              fetchStores();
            } catch (error) {
              Toast.show({ type: 'error', text1: 'Failed to delete store' });
            }
          },
        },
      ]
    );
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
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{item.location?.city}, {item.location?.state}</Text>
          </div>
          <View style={{ backgroundColor: getStatusColor(item.currentStatus).split(' ')[0], paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ fontSize: 10, fontWeight: '600' }}>
              {item.currentStatus?.replace(/_/g, ' ') || 'UPLOADED'}
            </Text>
          </View>
        </View>
        
        {/* Store Details */}
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

        {/* Assignment Info */}
        {(item.workflow?.recceAssignedTo || item.workflow?.installationAssignedTo) && (
          <View style={{ marginBottom: 12, padding: 8, backgroundColor: theme.colors.background, borderRadius: 8 }}>
            {item.workflow.recceAssignedTo && (
              <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>
                Recce: {item.workflow.recceAssignedTo.name}
              </Text>
            )}
            {item.workflow.installationAssignedTo && (
              <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>
                Installation: {item.workflow.installationAssignedTo.name}
              </Text>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity 
            style={{ backgroundColor: theme.colors.primary + '20', padding: 8, borderRadius: 8, flex: 1, marginRight: 8, alignItems: 'center' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Eye size={14} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.primary, marginLeft: 4, fontSize: 12, fontWeight: '600' }}>View</Text>
            </View>
          </TouchableOpacity>
          
          {item.currentStatus === 'UPLOADED' && (
            <TouchableOpacity 
              style={{ backgroundColor: '#3B82F6' + '20', padding: 8, borderRadius: 8, marginRight: 8 }}
            >
              <UserPlus size={14} color="#3B82F6" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            onPress={() => handleDelete(item._id)}
            style={{ backgroundColor: '#EF4444' + '20', padding: 8, borderRadius: 8 }}
          >
            <Trash2 size={14} color="#EF4444" />
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
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text }}>Store Operations</Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Manage and track all store activities</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={handleExportStores} style={{ backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
              <Download size={16} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setUploadStats(null); setSelectedFiles([]); setUploadModalVisible(true); }} style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
              <Upload size={16} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAddStoreModalVisible(true)} style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
              <Plus size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters & Bulk Actions */}
        <View style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, borderRadius: 8, paddingHorizontal: 12, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border }}>
            <Search size={16} color={theme.colors.textSecondary} />
            <TextInput
              placeholder="Search stores, dealers..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 8, color: theme.colors.text }}
            />
          </View>

          {selectedStoreIds.size > 0 && (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <TouchableOpacity onPress={() => openAssignModal('RECCE')} style={{ backgroundColor: '#3B82F6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
                <UserPlus size={14} color="#FFF" />
                <Text style={{ color: '#FFF', marginLeft: 4, fontSize: 12, fontWeight: '600' }}>
                  Assign Recce ({selectedStoreIds.size})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openAssignModal('INSTALLATION')} style={{ backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
                <UserPlus size={14} color="#FFF" />
                <Text style={{ color: '#FFF', marginLeft: 4, fontSize: 12, fontWeight: '600' }}>
                  Assign Install ({selectedStoreIds.size})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleBulkDelete} style={{ backgroundColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
                <Trash2 size={14} color="#FFF" />
                <Text style={{ color: '#FFF', marginLeft: 4, fontSize: 12, fontWeight: '600' }}>
                  Delete ({selectedStoreIds.size})
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
                </div>
              </View>
            }
          />
        </>
      )}
      
      {/* Bulk Upload Modal */}
      <Modal visible={uploadModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text }}>Bulk Upload Stores</Text>
              <TouchableOpacity onPress={() => setUploadModalVisible(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            {uploadStats ? (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <Text style={{ fontSize: 32, fontWeight: 'bold', color: uploadStats.errorCount === 0 ? '#10B981' : '#F59E0B' }}>
                  {uploadStats.successCount} / {uploadStats.totalProcessed}
                </Text>
                <Text style={{ color: theme.colors.textSecondary, marginBottom: 20 }}>Records Processed</Text>
                {uploadStats.errors?.length > 0 && (
                  <ScrollView style={{ maxHeight: 150, backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, marginBottom: 20 }}>
                    {uploadStats.errors.map((error, index) => (
                      <Text key={index} style={{ color: '#DC2626', fontSize: 12, marginBottom: 4 }}>
                        {error.error} {error.row && `(Row ${error.row})`}
                      </Text>
                    ))}
                  </ScrollView>
                )}
                <TouchableOpacity onPress={() => { setUploadModalVisible(false); setUploadStats(null); }} style={{ backgroundColor: theme.colors.primary, padding: 16, borderRadius: 8, width: '100%', alignItems: 'center' }}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView>
                <TouchableOpacity onPress={downloadTemplate} style={{ backgroundColor: '#10B981', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Download size={20} color="#FFF" />
                    <Text style={{ color: '#FFF', marginLeft: 8, fontWeight: 'bold' }}>Download Template</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={handleFileSelect} style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: theme.colors.border, padding: 32, borderRadius: 8, alignItems: 'center', marginBottom: 16 }}>
                  <Upload size={32} color={theme.colors.textSecondary} />
                  <Text style={{ color: theme.colors.text, marginTop: 8, fontWeight: '600' }}>Drop files here or click to upload</Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Supports .xlsx, .xls</Text>
                </TouchableOpacity>
                
                {selectedFiles.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    {selectedFiles.map((file, index) => (
                      <View key={index} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: theme.colors.surface, borderRadius: 8, marginBottom: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                          <FileText size={16} color="#10B981" />
                          <Text style={{ color: theme.colors.text, marginLeft: 8, flex: 1 }} numberOfLines={1}>{file.name}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}>
                          <X size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                
                <TouchableOpacity onPress={handleUpload} disabled={uploading || selectedFiles.length === 0} style={{ backgroundColor: theme.colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', opacity: (uploading || selectedFiles.length === 0) ? 0.5 : 1 }}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                    {uploading ? 'Uploading...' : 'Upload Files'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Assignment Modal */}
      <Modal visible={assignModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text }}>Assign {assignStage}</Text>
              <TouchableOpacity onPress={() => setAssignModalVisible(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={{ backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <Text style={{ color: '#92400E', fontSize: 14 }}>Assigning {selectedStoreIds.size} stores to {assignStage} team</Text>
            </View>
            
            <ScrollView style={{ maxHeight: 300 }}>
              {availableUsers.map(user => (
                <TouchableOpacity
                  key={user._id}
                  onPress={() => setSelectedUserId(user._id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    backgroundColor: selectedUserId === user._id ? theme.colors.primary + '20' : theme.colors.surface,
                    borderRadius: 8,
                    marginBottom: 8,
                    borderWidth: selectedUserId === user._id ? 2 : 1,
                    borderColor: selectedUserId === user._id ? theme.colors.primary : theme.colors.border
                  }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: selectedUserId === user._id ? theme.colors.primary : '#E5E7EB', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Text style={{ color: selectedUserId === user._id ? '#FFF' : '#6B7280', fontWeight: 'bold' }}>{user.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{user.name}</Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{user.email}</Text>
                  </View>
                  {selectedUserId === user._id && <CheckSquare size={20} color={theme.colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity onPress={() => setAssignModalVisible(false)} style={{ flex: 1, padding: 16, backgroundColor: theme.colors.surface, borderRadius: 8, alignItems: 'center' }}>
                <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAssign} disabled={assigning || !selectedUserId} style={{ flex: 1, padding: 16, backgroundColor: theme.colors.primary, borderRadius: 8, alignItems: 'center', opacity: (assigning || !selectedUserId) ? 0.5 : 1 }}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                  {assigning ? 'Assigning...' : 'Confirm Assignment'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Add Store Modal */}
      <Modal visible={addStoreModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text }}>Add New Store</Text>
              <TouchableOpacity onPress={() => setAddStoreModalVisible(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>BASIC DETAILS</Text>
              
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>DEALER CODE *</Text>
                  <TextInput
                    value={newStoreData.dealerCode}
                    onChangeText={text => setNewStoreData({ ...newStoreData, dealerCode: text })}
                    style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border }}
                    placeholder="Enter dealer code"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>DEALER NAME *</Text>
                  <TextInput
                    value={newStoreData.storeName}
                    onChangeText={text => setNewStoreData({ ...newStoreData, storeName: text })}
                    style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border }}
                    placeholder="Enter dealer name"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
              </View>
              
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginTop: 16 }}>LOCATION</Text>
              
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>CITY *</Text>
                  <TextInput
                    value={newStoreData.city}
                    onChangeText={text => setNewStoreData({ ...newStoreData, city: text })}
                    style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border }}
                    placeholder="Enter city"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>STATE</Text>
                  <TextInput
                    value={newStoreData.state}
                    onChangeText={text => setNewStoreData({ ...newStoreData, state: text })}
                    style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border }}
                    placeholder="Enter state"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
              </View>
              
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginTop: 16 }}>SPECIFICATIONS</Text>
              
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>WIDTH</Text>
                  <TextInput
                    value={newStoreData.width}
                    onChangeText={text => setNewStoreData({ ...newStoreData, width: text })}
                    style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border }}
                    placeholder="Width"
                    keyboardType="decimal-pad"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>HEIGHT</Text>
                  <TextInput
                    value={newStoreData.height}
                    onChangeText={text => setNewStoreData({ ...newStoreData, height: text })}
                    style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border }}
                    placeholder="Height"
                    keyboardType="decimal-pad"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
              </View>
              
              <TouchableOpacity onPress={handleAddStore} disabled={savingStore} style={{ backgroundColor: theme.colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20, opacity: savingStore ? 0.5 : 1 }}>
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>
                  {savingStore ? 'Saving...' : 'Save Store'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}