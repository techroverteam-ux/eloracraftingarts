import { useState } from 'react';
import { useRoleAccess } from '../hooks/useRoleAccess';
import ProtectedRoute from './ProtectedRoute';
import { Button, Card } from './ui';
import { PERMISSIONS } from '../lib/roles';

export default function ContentUpload() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { checkPermission } = useRoleAccess();

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    try {
      // Mock upload - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setFiles([]);
      alert('Files uploaded successfully!');
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <ProtectedRoute permission={PERMISSIONS.UPLOAD_CONTENT}>
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Content</h3>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              accept="image/*,video/*,.pdf,.doc,.docx"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="space-y-2">
                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
                </div>
                <p className="text-xs text-gray-500">Images, videos, documents up to 10MB</p>
              </div>
            </label>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600 truncate">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {files.length > 0 && (
            <Button 
              onClick={handleUpload} 
              disabled={uploading}
              className="w-full"
            >
              {uploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
            </Button>
          )}
        </div>
      </Card>
    </ProtectedRoute>
  );
}