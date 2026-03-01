import { Platform, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

export const fileService = {
  downloadFile: async (blob: Blob, filename: string) => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error('Storage permission denied');
        }
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const path = `${RNFS.DownloadDirectoryPath}/${filename}`;
        
        await RNFS.writeFile(path, base64Data, 'base64');
        
        await Share.open({
          url: `file://${path}`,
          type: 'application/octet-stream',
        });
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('File download error:', error);
      throw error;
    }
  },

  shareFile: async (blob: Blob, filename: string) => {
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        await Share.open({
          url: `data:application/octet-stream;base64,${base64Data}`,
          filename,
        });
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('File share error:', error);
      throw error;
    }
  },
};