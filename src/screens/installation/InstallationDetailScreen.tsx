import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import { ArrowLeft, Camera, CheckCircle2, MapPin, Building2, Package, FileSpreadsheet, Ruler, FileText, Image as ImageIcon } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { apiClient } from '../../services/api';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function InstallationDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { storeId } = route.params as { storeId: string };

  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [installationPhotos, setInstallationPhotos] = useState<{ [key: number]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const photosPerPage = 5;

  const API_BASE_URL = 'https://elora-api-smoky.vercel.app';

  useEffect(() => {
    fetchStoreDetails();
  }, []);

  const fetchStoreDetails = async () => {
    try {
      const { data } = await apiClient.get(`/stores/${storeId}`);
      const storeData = data.store;
      setStore(storeData);

      // Load existing installation photos if any
      if (storeData.installation?.photos) {
        const existingPhotos: { [key: number]: string } = {};
        storeData.installation.photos.forEach((p: any) => {
          const photoUrl = getPhotoUrl(p.installationPhoto);
          if (photoUrl) {
            existingPhotos[p.reccePhotoIndex] = photoUrl;
          }
        });
        setInstallationPhotos(existingPhotos);
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load store details' });
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (path: string | undefined) => {
    if (!path) return null;
    const cleanPath = path.startsWith('/') || path.startsWith('\\') ? path.slice(1) : path;
    return `${API_BASE_URL}/${cleanPath.replace(/\\/g, '/')}`;
  };

  const pickInstallationPhoto = (index: number) => {
    launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1
    }, (response) => {
      if (response.assets?.[0]) {
        setInstallationPhotos(prev => ({
          ...prev,
          [index]: response.assets![0].uri!
        }));
      }
    });
  };

  const handleSubmit = async () => {
    const reccePhotosCount = store?.recce?.reccePhotos?.length || 0;
    const uploadedCount = Object.keys(installationPhotos).length;

    if (uploadedCount < reccePhotosCount) {
      return Toast.show({
        type: 'error',
        text1: `Please upload installation photos for all ${reccePhotosCount} recce photos`
      });
    }

    setSubmitting(true);
    const formData = new FormData();

    const photosData: Array<{ reccePhotoIndex: number }> = [];
    let fileIndex = 0;

    for (let i = 0; i < reccePhotosCount; i++) {
      if (installationPhotos[i] && !installationPhotos[i].startsWith('https://')) {
        formData.append(`installationPhoto${fileIndex}`, {
          uri: installationPhotos[i],
          type: 'image/jpeg',
          name: `installation_${i}.jpg`
        } as any);
        photosData.push({ reccePhotoIndex: i });
        fileIndex++;
      }
    }

    formData.append('installationPhotosData', JSON.stringify(photosData));

    try {
      await apiClient.post(`/stores/${storeId}/installation`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Toast.show({ type: 'success', text1: 'Installation Marked as Complete!' });
      navigation.goBack();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const openInMaps = () => {
    if (store?.location?.coordinates?.lat && store?.location?.coordinates?.lng) {
      const url = `https://www.google.com/maps?q=${store.location.coordinates.lat},${store.location.coordinates.lng}`;
      // Open in browser or maps app
    } else if (store?.location?.address) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.location.address)}`;
      // Open in browser or maps app
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#eab308" />
      </View>
    );
  }

  if (!store) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-500">Store not found</Text>
      </View>
    );
  }

  const reccePhotos = store.recce?.reccePhotos || [];
  const totalPages = Math.ceil(reccePhotos.length / photosPerPage);
  const startIndex = (currentPage - 1) * photosPerPage;
  const endIndex = startIndex + photosPerPage;
  const currentPhotos = reccePhotos.slice(startIndex, endIndex);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900">{store.storeName}</Text>
          <Text className="text-xs text-yellow-600 font-mono">{store.dealerCode}</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4 space-y-4">
          {/* Store Details Grid */}
          <View className="flex-row space-x-4">
            {/* Location Card */}
            <View className="flex-1 bg-white rounded-xl p-4 border border-gray-100">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <MapPin size={20} color="#eab308" />
                  <Text className="font-bold text-sm text-gray-900 ml-2">Location</Text>
                </View>
                {(store.location.coordinates?.lat || store.location.address) && (
                  <TouchableOpacity onPress={openInMaps} className="bg-blue-500 px-2 py-1 rounded-lg">
                    <Text className="text-white text-xs font-medium">Map</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View className="space-y-1">
                <Text className="text-sm text-gray-700"><Text className="text-gray-500">City:</Text> {store.location.city || '-'}</Text>
                <Text className="text-sm text-gray-700"><Text className="text-gray-500">State:</Text> {store.location.state || '-'}</Text>
              </View>
            </View>

            {/* Dealer Info Card */}
            <View className="flex-1 bg-white rounded-xl p-4 border border-gray-100">
              <View className="flex-row items-center mb-3">
                <Building2 size={20} color="#eab308" />
                <Text className="font-bold text-sm text-gray-900 ml-2">Dealer</Text>
              </View>
              <View className="space-y-1">
                <Text className="text-sm text-gray-700"><Text className="text-gray-500">Code:</Text> {store.dealerCode}</Text>
                <Text className="text-sm text-gray-700"><Text className="text-gray-500">Contact:</Text> {store.contact?.personName || '-'}</Text>
              </View>
            </View>
          </View>

          {/* Board Specifications */}
          <View className="bg-white rounded-xl p-4 border border-gray-100">
            <View className="flex-row items-center mb-3">
              <Package size={20} color="#eab308" />
              <Text className="font-bold text-sm text-gray-900 ml-2">Board Specifications</Text>
            </View>
            <View className="flex-row flex-wrap">
              <View className="w-1/3 mb-2">
                <Text className="text-sm text-gray-700"><Text className="text-gray-500">Type:</Text> {store.specs?.type || '-'}</Text>
              </View>
              <View className="w-1/3 mb-2">
                <Text className="text-sm text-gray-700"><Text className="text-gray-500">Size:</Text> {store.specs?.width} x {store.specs?.height} ft</Text>
              </View>
              <View className="w-1/3 mb-2">
                <Text className="text-sm text-gray-700"><Text className="text-gray-500">Qty:</Text> {store.specs?.qty || 1}</Text>
              </View>
            </View>
          </View>

          {/* Initial Photos from Recce */}
          {store.recce?.initialPhotos && store.recce.initialPhotos.length > 0 && (
            <View className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <View className="flex-row items-center mb-4">
                <ImageIcon size={20} color="#3b82f6" />
                <Text className="font-bold text-lg text-blue-900 ml-2">Initial Photos (From Recce)</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row space-x-3">
                  {store.recce.initialPhotos.map((photo: string, idx: number) => (
                    <View key={idx} className="w-32 h-32 rounded-lg overflow-hidden border-2 border-blue-300">
                      <Image source={{ uri: getPhotoUrl(photo) || '' }} className="w-full h-full" resizeMode="cover" />
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Recce Photos & Installation Upload */}
          {reccePhotos.length > 0 && (
            <View className="bg-white rounded-xl p-4 border border-gray-100">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="font-bold text-lg text-gray-900">Recce Photos & Installation Upload</Text>
                <Text className="text-sm text-gray-600">Total: {reccePhotos.length} photos</Text>
              </View>

              <View className="space-y-6">
                {currentPhotos.map((reccePhoto: any, idx: number) => {
                  const index = startIndex + idx;
                  return (
                    <View key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <View className="space-y-4">
                        {/* Recce Photo Section */}
                        <View>
                          <Text className="font-bold text-blue-600 mb-2">Recce Photo {index + 1}</Text>
                          <View className="bg-white rounded-lg overflow-hidden border-2 border-blue-500 mb-3">
                            <Image
                              source={{ uri: getPhotoUrl(reccePhoto.photo) || '' }}
                              className="w-full h-48"
                              resizeMode="cover"
                            />
                          </View>
                          <View className="bg-white p-3 rounded-lg">
                            <View className="flex-row items-center mb-2">
                              <Ruler size={16} color="#eab308" />
                              <Text className="font-bold text-sm text-gray-900 ml-2">Measurements:</Text>
                            </View>
                            <Text className="text-sm text-gray-700">
                              {reccePhoto.measurements.width} x {reccePhoto.measurements.height} {reccePhoto.measurements.unit}
                            </Text>
                            {reccePhoto.elements && reccePhoto.elements.length > 0 && (
                              <>
                                <View className="flex-row items-center mt-3 mb-2">
                                  <FileText size={16} color="#eab308" />
                                  <Text className="font-bold text-sm text-gray-900 ml-2">Elements:</Text>
                                </View>
                                <View className="flex-row flex-wrap">
                                  {reccePhoto.elements.map((el: any, i: number) => (
                                    <View key={i} className="bg-yellow-100 px-2 py-1 rounded text-xs mr-2 mb-2">
                                      <Text className="text-yellow-800">{el.elementName} (Qty: {el.quantity})</Text>
                                    </View>
                                  ))}
                                </View>
                              </>
                            )}
                          </View>
                        </View>

                        {/* Installation Photo Section */}
                        <View>
                          <Text className="font-bold text-green-600 mb-2">Installation Photo {index + 1}</Text>
                          <TouchableOpacity onPress={() => pickInstallationPhoto(index)}>
                            <View className={`rounded-lg border-2 border-dashed overflow-hidden ${installationPhotos[index] ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                              {installationPhotos[index] ? (
                                <Image
                                  source={{ uri: installationPhotos[index] }}
                                  className="w-full h-48"
                                  resizeMode="cover"
                                />
                              ) : (
                                <View className="h-48 flex items-center justify-center">
                                  <Camera size={32} color="#9ca3af" />
                                  <Text className="text-xs font-medium text-gray-500 mt-2">Upload Installation Photo</Text>
                                </View>
                              )}
                            </View>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Pagination */}
              {totalPages > 1 && (
                <View className="flex-row items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <TouchableOpacity
                    onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg font-medium ${currentPage === 1 ? 'bg-gray-200 text-gray-400' : 'bg-gray-700 text-white'}`}
                  >
                    <Text className={currentPage === 1 ? 'text-gray-400' : 'text-white'}>Previous</Text>
                  </TouchableOpacity>
                  <Text className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg font-medium ${currentPage === totalPages ? 'bg-gray-200 text-gray-400' : 'bg-gray-700 text-white'}`}
                  >
                    <Text className={currentPage === totalPages ? 'text-gray-400' : 'text-white'}>Next</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            className="bg-green-600 rounded-xl p-4 flex-row items-center justify-center shadow-lg mb-8"
            style={{ opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <CheckCircle2 size={20} color="#fff" />
            )}
            <Text className="text-white font-bold text-lg ml-2">Complete Installation</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}