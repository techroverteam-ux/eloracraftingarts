import { useState } from 'react';
import { useRoleAccess } from '../hooks/useRoleAccess';
import ProtectedRoute from './ProtectedRoute';
import { Button, Card } from './ui';
import { PERMISSIONS } from '../lib/roles';

export default function BulkStoreUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState([]);
  const { checkPermission } = useRoleAccess();

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setFile(selectedFile);
      // Mock preview data
      setPreview([
        { storeName: 'Store Alpha', address: '123 Main St', clientName: 'Client A', brandingLocations: 'Front Wall, Side Panel' },
        { storeName: 'Store Beta', address: '456 Oak Ave', clientName: 'Client A', brandingLocations: 'Entrance, Back Wall' }
      ]);
    } else {
      alert('Please select a valid Excel file (.xlsx)');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      // Mock upload - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Successfully uploaded ${preview.length} stores!`);
      setFile(null);
      setPreview([]);
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Mock template download
    const csvContent = "Store Name,Address,Client Name,Contact Person,Phone,Email,Branding Locations,Special Instructions\n" +
      "Store Alpha,123 Main St City,Client A,John Doe,1234567890,john@client.com,Front Wall;Side Panel,Handle with care\n" +
      "Store Beta,456 Oak Ave City,Client A,Jane Smith,0987654321,jane@client.com,Entrance;Back Wall,24/7 access";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'store_template.csv';
    a.click();
  };

  return (
    <ProtectedRoute permission={PERMISSIONS.MANAGE_SYSTEM}>
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Store Upload</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Upload Excel file with store information</p>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              Download Template
            </Button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="excel-upload"
            />
            <label htmlFor="excel-upload" className="cursor-pointer">
              <div className="space-y-2">
                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload Excel</span> or drag and drop
                </div>
                <p className="text-xs text-gray-500">Excel files (.xlsx, .xls) up to 10MB</p>
              </div>
            </label>
          </div>

          {file && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-sm text-green-700">Selected: {file.name}</p>
            </div>
          )}

          {preview.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Preview ({preview.length} stores):</h4>
              <div className="max-h-40 overflow-y-auto border rounded">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1 text-left">Store</th>
                      <th className="px-2 py-1 text-left">Address</th>
                      <th className="px-2 py-1 text-left">Client</th>
                      <th className="px-2 py-1 text-left">Locations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((store, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-2 py-1">{store.storeName}</td>
                        <td className="px-2 py-1">{store.address}</td>
                        <td className="px-2 py-1">{store.clientName}</td>
                        <td className="px-2 py-1">{store.brandingLocations}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {file && (
            <Button 
              onClick={handleUpload} 
              disabled={uploading}
              className="w-full"
            >
              {uploading ? 'Uploading...' : `Upload ${preview.length} Stores`}
            </Button>
          )}
        </div>
      </Card>
    </ProtectedRoute>
  );
}