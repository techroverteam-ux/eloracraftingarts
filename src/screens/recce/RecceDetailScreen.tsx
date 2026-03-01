import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { ArrowLeft, Camera, Ruler, FileText, CheckCircle2, MapPin, Building2, Package, Plus, X, Navigation } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import { apiClient } from '../../services/api';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface ReccePhoto {
  uri: string;
  width: string;
  height: string;
  unit: string;
  elements: Array<{ elementId: string; elementName: string; quantity: number }>;
}

export default function RecceDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { storeId } = route.params as { storeId: string };

  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [clientElements, setClientElements] = useState<any[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [notes, setNotes] = useState('');
  const [initialPhotos, setInitialPhotos] = useState<string[]>([]);
  const [reccePhotos, setReccePhotos] = useState<ReccePhoto[]>([
    { uri: '', width: '', height: '', unit: 'in', elements: [] }
  ]);

  useEffect(() => {
    fetchStoreDetails();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => console.log('Location error:', error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const fetchStoreDetails = async () => {
    try {
      const { data } = await apiClient.get(`/stores/${storeId}`);
      const storeData = data.store;
      setStore(storeData);

      if (storeData.clientId) {
        try {
          const clientRes = await apiClient.get(`/clients/${storeData.clientId}`);
          setClientElements(clientRes.data?.elements || []);
        } catch (err) {
          console.error('Failed to fetch client elements:', err);
        }
      }

      if (storeData.recce?.submittedDate) {
        setNotes(storeData.recce.notes || '');
        if (storeData.recce.reccePhotos?.length > 0) {
          const loadedPhotos = storeData.recce.reccePhotos.map((rp: any) => ({
            uri: `https://elora-api-smoky.vercel.app/${rp.photo}`,
            width: String(rp.measurements.width || ''),
            height: String(rp.measurements.height || ''),
            unit: rp.measurements.unit || 'in',
            elements: rp.elements || []
          }));
          setReccePhotos(loadedPhotos);
        }
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load store details' });
    } finally {
      setLoading(false);
    }
  };

  const pickInitialPhotos = () => {
    if (initialPhotos.length >= 10) {
      Toast.show({ type: 'error', text1: 'Maximum 10 initial photos allowed' });
      return;
    }

    launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 10 - initialPhotos.length
    }, (response) => {
      if (response.assets) {
        const newPhotos = response.assets.map(asset => asset.uri!);
        setInitialPhotos([...initialPhotos, ...newPhotos]);
      }
    });
  };

  const removeInitialPhoto = (index: number) => {
    setInitialPhotos(initialPhotos.filter((_, i) => i !== index));
  };

  const pickReccePhoto = (index: number) => {
    launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1
    }, (response) => {
      if (response.assets?.[0]) {
        const newReccePhotos = [...reccePhotos];
        newReccePhotos[index].uri = response.assets[0].uri!;
        setReccePhotos(newReccePhotos);
      }
    });
  };

  const updateReccePhoto = (index: number, field: keyof ReccePhoto, value: any) => {
    const newReccePhotos = [...reccePhotos];
    (newReccePhotos[index] as any)[field] = value;
    setReccePhotos(newReccePhotos);
  };

  const addReccePhoto = () => {
    setReccePhotos([...reccePhotos, { uri: '', width: '', height: '', unit: 'in', elements: [] }]);
  };

  const removeReccePhoto = (index: number) => {
    if (reccePhotos.length === 1) {
      Toast.show({ type: 'error', text1: 'At least one recce photo is required' });
      return;
    }
    setReccePhotos(reccePhotos.filter((_, i) => i !== index));
  };

  const toggleElement = (photoIndex: number, element: any) => {
    const newReccePhotos = [...reccePhotos];
    const existingIndex = newReccePhotos[photoIndex].elements.findIndex(e => e.elementId === element.elementId.toString());
    
    if (existingIndex >= 0) {
      newReccePhotos[photoIndex].elements.splice(existingIndex, 1);
    } else {
      newReccePhotos[photoIndex].elements.push({
        elementId: element.elementId.toString(),
        elementName: element.elementName,
        quantity: 1
      });
    }
    setReccePhotos(newReccePhotos);
  };

  const updateElementQuantity = (photoIndex: number, elementId: string, quantity: number) => {
    const newReccePhotos = [...reccePhotos];
    const element = newReccePhotos[photoIndex].elements.find(e => e.elementId === elementId);
    if (element) {
      element.quantity = quantity;
      setReccePhotos(newReccePhotos);
    }
  };

  const handleSubmit = async () => {
    if (reccePhotos.length === 0) {
      return Toast.show({ type: 'error', text1: 'At least one recce photo is required' });
    }

    for (let i = 0; i < reccePhotos.length; i++) {
      if (!reccePhotos[i].uri) {
        return Toast.show({ type: 'error', text1: `Please upload photo for recce photo ${i + 1}` });
      }
      if (!reccePhotos[i].width || !reccePhotos[i].height) {
        return Toast.show({ type: 'error', text1: `Please enter measurements for recce photo ${i + 1}` });
      }
    }

    setSubmitting(true);
    const formData = new FormData();
    
    formData.append('notes', notes);
    formData.append('initialPhotosCount', String(initialPhotos.length));

    // Add location if available
    if (location) {
      formData.append('location', JSON.stringify(location));
    }

    // Add initial photos
    initialPhotos.forEach((photo, index) => {
      formData.append(`initialPhoto${index}`, {
        uri: photo,
        type: 'image/jpeg',
        name: `initial_${index}.jpg`
      } as any);
    });

    // Add recce photos data
    const reccePhotosData = reccePhotos.map(rp => ({
      width: rp.width,
      height: rp.height,
      unit: rp.unit,
      elements: rp.elements
    }));
    formData.append('reccePhotosData', JSON.stringify(reccePhotosData));

    // Add recce photos
    reccePhotos.forEach((rp, index) => {
      if (rp.uri && !rp.uri.startsWith('https://')) {
        formData.append(`reccePhoto${index}`, {
          uri: rp.uri,
          type: 'image/jpeg',
          name: `recce_${index}.jpg`
        } as any);
      }
    });

    try {
      await apiClient.post(`/stores/${storeId}/recce`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Toast.show({ type: 'success', text1: 'Recce Submitted Successfully!' });
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
        {/* Store Details Grid */}
        <View className="p-4 space-y-4">
          {/* Location Card */}
          <View className="bg-white rounded-xl p-4 border border-gray-100">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <MapPin size={20} color="#eab308" />
                <Text className="font-bold text-sm text-gray-900 ml-2">Location</Text>
              </View>
              {(store.location.coordinates?.lat || store.location.address) && (
                <TouchableOpacity onPress={openInMaps} className="bg-blue-500 px-2 py-1 rounded-lg">
                  <Text className="text-white text-xs font-medium">Open Map</Text>
                </TouchableOpacity>
              )}
            </View>
            <View className="space-y-1">
              <Text className="text-sm text-gray-700"><Text className="text-gray-500">Zone:</Text> {store.location.zone || '-'}</Text>
              <Text className="text-sm text-gray-700"><Text className="text-gray-500">State:</Text> {store.location.state || '-'}</Text>
              <Text className="text-sm text-gray-700"><Text className="text-gray-500">City:</Text> {store.location.city || '-'}</Text>
              <Text className="text-sm text-gray-700"><Text className="text-gray-500">Address:</Text> {store.location.address || '-'}</Text>
            </View>
          </View>

          {/* Dealer Info Card */}
          <View className="bg-white rounded-xl p-4 border border-gray-100">
            <View className="flex-row items-center mb-3">
              <Building2 size={20} color="#eab308" />
              <Text className="font-bold text-sm text-gray-900 ml-2">Dealer Info</Text>
            </View>
            <View className="space-y-1">
              <Text className="text-sm text-gray-700"><Text className="text-gray-500">Code:</Text> {store.dealerCode}</Text>
              <Text className="text-sm text-gray-700"><Text className="text-gray-500">Vendor:</Text> {store.vendorCode || '-'}</Text>
              <Text className="text-sm text-gray-700"><Text className="text-gray-500">Contact:</Text> {store.contact?.personName || '-'}</Text>
              <Text className="text-sm text-gray-700"><Text className="text-gray-500">Mobile:</Text> {store.contact?.mobile || '-'}</Text>
            </View>
          </View>

          {/* Board Specifications */}
          <View className="bg-white rounded-xl p-4 border border-gray-100">
            <View className="flex-row items-center mb-3">
              <Package size={20} color="#eab308" />
              <Text className="font-bold text-sm text-gray-900 ml-2">Board Specifications</Text>
            </View>
            <View className="flex-row flex-wrap">
              <View className="w-1/2 mb-2">
                <Text className="text-sm text-gray-700"><Text className="text-gray-500">Type:</Text> {store.specs?.type || '-'}</Text>
              </View>
              <View className="w-1/2 mb-2">
                <Text className="text-sm text-gray-700"><Text className="text-gray-500">Qty:</Text> {store.specs?.qty || 1}</Text>
              </View>
              <View className="w-1/2 mb-2">
                <Text className="text-sm text-gray-700"><Text className="text-gray-500">Width:</Text> {store.specs?.width} ft</Text>
              </View>
              <View className="w-1/2 mb-2">
                <Text className="text-sm text-gray-700"><Text className="text-gray-500">Height:</Text> {store.specs?.height} ft</Text>
              </View>
            </View>
          </View>

          {/* Client Elements */}
          {clientElements.length > 0 && (
            <View className="bg-white rounded-xl p-4 border border-gray-100">
              <View className="flex-row items-center mb-3">
                <Package size={20} color="#eab308" />
                <Text className="font-bold text-sm text-gray-900 ml-2">Available Elements</Text>
              </View>
              <View className="flex-row flex-wrap">
                {clientElements.map((element: any) => (
                  <View key={element.elementId} className="w-1/2 p-2">
                    <View className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <Text className="font-medium text-sm text-gray-900">{element.elementName}</Text>
                      <Text className="text-xs text-gray-500 mt-1">Rate: ₹{element.customRate}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Initial Photos Section */}
          <View className="bg-white rounded-xl p-4 border border-gray-100">
            <View className="flex-row items-center mb-4">
              <Camera size={20} color="#eab308" />
              <Text className="font-bold text-sm text-gray-900 ml-2">Initial Store Photos (Max 10)</Text>
            </View>
            
            <View className="flex-row flex-wrap mb-3">
              {initialPhotos.map((photo, index) => (
                <View key={index} className="w-1/3 p-1">
                  <View className="relative">
                    <Image source={{ uri: photo }} className="w-full h-20 rounded-lg" />
                    <TouchableOpacity
                      onPress={() => removeInitialPhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                    >
                      <X size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {initialPhotos.length < 10 && (
              <TouchableOpacity
                onPress={pickInitialPhotos}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 items-center"
              >
                <Camera size={32} color="#9ca3af" />
                <Text className="text-sm text-gray-500 mt-2">
                  Upload Initial Photos ({initialPhotos.length}/10)
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Recce Photos */}
          {reccePhotos.map((reccePhoto, index) => (
            <View key={index} className="bg-white rounded-xl p-4 border border-gray-100">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Ruler size={20} color="#eab308" />
                  <Text className="font-bold text-sm text-gray-900 ml-2">Recce Photo {index + 1}</Text>
                </View>
                {reccePhotos.length > 1 && (
                  <TouchableOpacity onPress={() => removeReccePhoto(index)}>
                    <X size={20} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Photo Upload */}
              <View className="mb-4">
                {reccePhoto.uri ? (
                  <View className="relative">
                    <Image source={{ uri: reccePhoto.uri }} className="w-full h-48 rounded-lg" />
                    <TouchableOpacity
                      onPress={() => updateReccePhoto(index, 'uri', '')}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                    >
                      <X size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => pickReccePhoto(index)}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 items-center"
                  >
                    <Camera size={48} color="#9ca3af" />
                    <Text className="text-sm text-gray-500 mt-2">Upload Recce Photo</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Measurements */}
              <View className="flex-row space-x-4 mb-4">
                <View className="flex-1">
                  <Text className="text-xs font-medium text-gray-500 mb-1">Width</Text>
                  <TextInput
                    className="border border-gray-200 rounded-lg p-3 text-lg font-bold bg-gray-50"
                    value={reccePhoto.width}
                    onChangeText={(value) => updateReccePhoto(index, 'width', value)}
                    placeholder="0.0"
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-medium text-gray-500 mb-1">Height</Text>
                  <TextInput
                    className="border border-gray-200 rounded-lg p-3 text-lg font-bold bg-gray-50"
                    value={reccePhoto.height}
                    onChangeText={(value) => updateReccePhoto(index, 'height', value)}
                    placeholder="0.0"
                    keyboardType="numeric"
                  />
                </View>
                <View className="w-20">
                  <Text className="text-xs font-medium text-gray-500 mb-1">Unit</Text>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('Select Unit', '', [
                        { text: 'Inches', onPress: () => updateReccePhoto(index, 'unit', 'in') },
                        { text: 'Feet', onPress: () => updateReccePhoto(index, 'unit', 'ft') }
                      ]);
                    }}
                    className="border border-gray-200 rounded-lg p-3 bg-gray-50 justify-center"
                  >
                    <Text className="text-sm font-medium text-center">{reccePhoto.unit}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Elements Selection */}
              {clientElements.length > 0 && (
                <View>
                  <Text className="text-xs font-medium text-gray-500 mb-2">Elements (Optional)</Text>
                  <View className="space-y-2">
                    {clientElements.map((element: any) => {
                      const selectedElement = reccePhoto.elements.find(e => e.elementId === element.elementId.toString());
                      return (
                        <View key={element.elementId} className="flex-row items-center bg-gray-50 p-2 rounded-lg">
                          <TouchableOpacity
                            onPress={() => toggleElement(index, element)}
                            className="mr-3"
                          >
                            <View className={`w-4 h-4 border-2 rounded ${selectedElement ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                              {selectedElement && <Text className="text-white text-xs text-center">✓</Text>}
                            </View>
                          </TouchableOpacity>
                          <Text className="flex-1 text-sm text-gray-700">{element.elementName}</Text>
                          {selectedElement && (
                            <TextInput
                              className="w-16 border border-gray-300 rounded p-2 text-sm text-center"
                              value={String(selectedElement.quantity)}
                              onChangeText={(value) => updateElementQuantity(index, element.elementId.toString(), parseInt(value) || 1)}
                              keyboardType="numeric"
                              placeholder="Qty"
                            />
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* Add Recce Photo Button */}
          <TouchableOpacity
            onPress={addReccePhoto}
            className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex-row items-center justify-center"
          >
            <Plus size={20} color="#6b7280" />
            <Text className="text-gray-500 ml-2">Add Another Recce Photo</Text>
          </TouchableOpacity>

          {/* Notes */}
          <View className="bg-white rounded-xl p-4 border border-gray-100">
            <View className="flex-row items-center mb-2">
              <FileText size={20} color="#eab308" />
              <Text className="font-bold text-sm text-gray-900 ml-2">Remarks</Text>
            </View>
            <TextInput
              className="border border-gray-200 rounded-lg p-3 text-sm bg-gray-50 min-h-[80px]"
              placeholder="Any obstruction? Electrical issues?"
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            className="bg-yellow-500 rounded-xl p-4 flex-row items-center justify-center shadow-lg mb-8"
            style={{ opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <CheckCircle2 size={20} color="#fff" />
            )}
            <Text className="text-white font-bold text-lg ml-2">Submit Recce Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}