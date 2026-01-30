import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import ProtectedRoute from '../../components/ProtectedRoute';
import withAuth from '../../components/withAuth';
import { Button, Card } from '../../components/ui';
import { CardSkeleton } from '../../components/Skeletons';
import { toast } from '../../components/Toast';
import { PERMISSIONS } from '../../lib/roles';

function Measurements() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [measurements, setMeasurements] = useState({});
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setRequests([
        {
          id: 1,
          orderNumber: 'ORD-001',
          storeName: 'Store Alpha',
          address: '123 Main St, City',
          brandingLocations: ['Front Wall', 'Side Panel', 'Window Display'],
          status: 'pending',
          assignedTo: 'Measurement Team A'
        },
        {
          id: 2,
          orderNumber: 'ORD-002', 
          storeName: 'Store Beta',
          address: '456 Oak Ave, City',
          brandingLocations: ['Entrance', 'Back Wall'],
          status: 'in_progress',
          assignedTo: 'Measurement Team B'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAcceptRequest = (requestId) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'in_progress' } : req
    ));
    setSelectedRequest(requests.find(r => r.id === requestId));
    toast.success('Request accepted successfully!');
  };

  const handleAddMeasurement = (location, dimension, value) => {
    setMeasurements(prev => ({
      ...prev,
      [location]: { ...prev[location], [dimension]: value }
    }));
  };

  const handlePhotoUpload = (e, location, angle) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotos(prev => [...prev, {
          id: Date.now() + Math.random(),
          location,
          angle,
          url: event.target.result,
          file
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    toast.success(`${files.length} photo(s) uploaded for ${location} - ${angle}`);
  };

  const handleSubmitMeasurement = () => {
    if (Object.keys(measurements).length === 0) {
      toast.error('Please add measurements before submitting');
      return;
    }
    if (photos.length === 0) {
      toast.error('Please upload at least one photo');
      return;
    }
    
    toast.success('Measurements submitted successfully!');
    setSelectedRequest(null);
    setMeasurements({});
    setPhotos([]);
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Measurements</h1>
            <p className="text-gray-600">Manage store visit measurements and photo documentation</p>
          </div>
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ProtectedRoute permission={PERMISSIONS.VIEW_INSTALLATIONS}>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Measurements</h1>
            <p className="text-gray-600">Manage store visit measurements and photo documentation</p>
          </div>

          {!selectedRequest ? (
            <div className="grid gap-6">
              {requests.map((request) => (
                <Card key={request.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.storeName}</h3>
                      <p className="text-sm text-gray-600">Order: {request.orderNumber}</p>
                      <p className="text-sm text-gray-600">{request.address}</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {request.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Branding Locations:</p>
                    <div className="flex flex-wrap gap-2">
                      {request.brandingLocations.map((location, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {location}
                        </span>
                      ))}
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <Button onClick={() => handleAcceptRequest(request.id)}>
                      Accept & Start Measurement
                    </Button>
                  )}
                  {request.status === 'in_progress' && (
                    <Button onClick={() => setSelectedRequest(request)}>
                      Continue Measurement
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedRequest.storeName}</h2>
                  <p className="text-gray-600">Measuring: {selectedRequest.orderNumber}</p>
                </div>
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Back to List
                </Button>
              </div>

              {selectedRequest.brandingLocations.map((location) => (
                <Card key={location} className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{location}</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Dimensions</h4>
                      <div className="space-y-3">
                        {['width', 'height', 'depth'].map((dimension) => (
                          <div key={dimension} className="flex items-center space-x-3">
                            <label className="w-16 text-sm font-medium text-gray-600 capitalize">
                              {dimension}:
                            </label>
                            <input
                              type="number"
                              placeholder="0"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                              value={measurements[location]?.[dimension] || ''}
                              onChange={(e) => handleAddMeasurement(location, dimension, e.target.value)}
                            />
                            <span className="text-sm text-gray-500">cm</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Photos</h4>
                      <div className="space-y-3">
                        {['front', 'left', 'right', 'top'].map((angle) => (
                          <div key={angle} className="flex items-center space-x-3">
                            <label className="w-16 text-sm font-medium text-gray-600 capitalize">
                              {angle}:
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="flex-1 text-sm"
                              onChange={(e) => handlePhotoUpload(e, location, angle)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {photos.filter(p => p.location === location).length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Uploaded Photos</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {photos.filter(p => p.location === location).map((photo) => (
                          <div key={photo.id} className="relative">
                            <img 
                              src={photo.url} 
                              alt={`${photo.location} - ${photo.angle}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <span className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b">
                              {photo.angle}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}

              <div className="flex justify-end">
                <Button onClick={handleSubmitMeasurement} className="px-8">
                  Submit All Measurements
                </Button>
              </div>
            </div>
          )}
        </div>
      </ProtectedRoute>
    </Layout>
  );
}

export default withAuth(Measurements);