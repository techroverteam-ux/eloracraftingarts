import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Download, FileText, FileSpreadsheet, Presentation } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeService } from '../../services/storeService';
import { fileService } from '../../services/fileService';
import Toast from 'react-native-toast-message';

export default function ExportScreen() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState({});

  const handleExport = async (type, format) => {
    const key = `${type}_${format}`;
    setLoading(prev => ({ ...prev, [key]: true }));
    
    try {
      let blob, filename;
      
      switch (type) {
        case 'stores':
          blob = await storeService.export();
          filename = `Stores_Export_${Date.now()}.xlsx`;
          break;
        case 'recce':
          blob = await storeService.exportRecce();
          filename = `Recce_Export_${Date.now()}.xlsx`;
          break;
        case 'installation':
          blob = await storeService.exportInstallation();
          filename = `Installation_Export_${Date.now()}.xlsx`;
          break;
      }
      
      await fileService.downloadFile(blob, filename);
      Toast.show({ type: 'success', text1: 'Export completed!', text2: filename });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Export failed' });
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 24 }}>
        Export & Reports
      </Text>

      <TouchableOpacity
        onPress={() => handleExport('stores', 'excel')}
        disabled={loading.stores_excel}
        style={{
          backgroundColor: theme.colors.surface,
          padding: 16,
          borderRadius: 12,
          marginBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          opacity: loading.stores_excel ? 0.6 : 1
        }}
      >
        <FileSpreadsheet size={24} color={theme.colors.primary} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>
            Export All Stores
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
            Download complete store database
          </Text>
        </View>
        <Download size={20} color={theme.colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleExport('recce', 'excel')}
        disabled={loading.recce_excel}
        style={{
          backgroundColor: theme.colors.surface,
          padding: 16,
          borderRadius: 12,
          marginBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          opacity: loading.recce_excel ? 0.6 : 1
        }}
      >
        <FileText size={24} color={theme.colors.primary} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>
            Export Recce Data
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
            Download all recce submissions
          </Text>
        </View>
        <Download size={20} color={theme.colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={async () => {
          try {
            const blob = await storeService.getTemplate();
            await fileService.downloadFile(blob, 'Store_Upload_Template.xlsx');
            Toast.show({ type: 'success', text1: 'Template downloaded!' });
          } catch (error) {
            Toast.show({ type: 'error', text1: 'Download failed' });
          }
        }}
        style={{
          backgroundColor: '#10B981',
          padding: 16,
          borderRadius: 12,
          alignItems: 'center',
          marginTop: 24
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Download size={20} color="#FFF" />
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
            Download Upload Template
          </Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}