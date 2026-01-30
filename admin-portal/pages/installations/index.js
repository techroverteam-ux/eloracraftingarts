import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import ProtectedRoute, { UnauthorizedMessage } from '../../components/ProtectedRoute';
import withAuth from '../../components/withAuth';
import { Button, Card } from '../../components/ui';
import { CardSkeleton } from '../../components/Skeletons';
import { toast } from '../../components/Toast';
import { PERMISSIONS } from '../../lib/roles';

function Installations() {
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { checkPermission, userRole } = useRoleAccess();

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      setInstallations([
        {
          id: 1,
          orderNumber: 'ORD-001',
          customerName: 'John Doe',
          artworkTitle: 'Abstract Canvas',
          installationDate: '2024-01-15',
          status: 'ready_for_installation',
          assignedTo: 'Team A',
          location: '123 Main St, City',
          measurementCompleted: true,
          measurementData: {
            dimensions: { width: 200, height: 150, depth: 5 },
            photos: ['front.jpg', 'left.jpg', 'right.jpg']
          }
        },
        {
          id: 2,
          orderNumber: 'ORD-002',
          customerName: 'Jane Smith',
          artworkTitle: 'Modern Sculpture',
          installationDate: '2024-01-16',
          status: 'in_progress',
          assignedTo: 'Team B',
          location: '456 Oak Ave, City',
          measurementCompleted: true,
          measurementData: {
            dimensions: { width: 300, height: 200, depth: 10 },
            photos: ['front.jpg', 'side.jpg']
          }
        },
        {
          id: 3,
          orderNumber: 'ORD-003',
          customerName: 'Bob Johnson',
          artworkTitle: 'Wall Mural',
          installationDate: '2024-01-14',
          status: 'completed',
          assignedTo: 'Team A',
          location: '789 Pine St, City',
          measurementCompleted: true,
          measurementData: {
            dimensions: { width: 500, height: 300, depth: 2 },
            photos: ['before.jpg', 'after.jpg', 'final.jpg']
          }
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      ready_for_installation: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      ready_for_installation: 'Ready for Installation',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return texts[status] || status;
  };

  const handleStatusUpdate = (id, newStatus) => {
    setInstallations(prev => 
      prev.map(installation => 
        installation.id === id 
          ? { ...installation, status: newStatus }
          : installation
      )
    );
    
    const statusMessages = {
      'in_progress': 'Installation started successfully!',
      'completed': 'Installation marked as completed!'
    };
    
    toast.success(statusMessages[newStatus] || 'Status updated successfully!');
  };

  if (loading) {
    return (
      <Layout>
        <ProtectedRoute 
          permission={PERMISSIONS.VIEW_INSTALLATIONS}
          fallback={<UnauthorizedMessage message="You don't have permission to view installations." />}
        >
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Installations</h1>
              <p className="text-gray-600">Manage artwork installations and assignments</p>
            </div>
            <div className="grid gap-6">
              {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    );
  }

  return (
    <Layout>
      <ProtectedRoute 
        permission={PERMISSIONS.VIEW_INSTALLATIONS}
        fallback={<UnauthorizedMessage message="You don't have permission to view installations." />}
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Installations</h1>
              <p className="text-gray-600">Manage artwork installations and assignments</p>
            </div>
            <ProtectedRoute permission={PERMISSIONS.CREATE_INSTALLATIONS}>
              <Button>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Schedule Installation
              </Button>
            </ProtectedRoute>
          </div>

          <div className="grid gap-6">
            {installations.map((installation) => (
              <Card key={installation.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {installation.artworkTitle}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Order: {installation.orderNumber} • Customer: {installation.customerName}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(installation.status)}`}>
                    {getStatusText(installation.status)}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Installation Date</p>
                    <p className="text-sm text-gray-600">{installation.installationDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Assigned Team</p>
                    <p className="text-sm text-gray-600">{installation.assignedTo}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Dimensions</p>
                    <p className="text-sm text-gray-600">
                      {installation.measurementData?.dimensions ? 
                        `${installation.measurementData.dimensions.width}×${installation.measurementData.dimensions.height}×${installation.measurementData.dimensions.depth}cm` : 
                        'N/A'
                      }
                    </p>
                  </div>
                </div>

                {/* Installation Photo Upload */}
                {installation.status === 'in_progress' && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-3">Upload Installation Photos</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Before Installation</label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          className="w-full text-sm" 
                          onChange={(e) => {
                            if (e.target.files.length > 0) {
                              toast.success(`${e.target.files.length} before photo(s) uploaded`);
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">After Installation</label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          className="w-full text-sm" 
                          onChange={(e) => {
                            if (e.target.files.length > 0) {
                              toast.success(`${e.target.files.length} after photo(s) uploaded`);
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Left Angle</label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          className="w-full text-sm" 
                          onChange={(e) => {
                            if (e.target.files.length > 0) {
                              toast.success(`${e.target.files.length} left angle photo(s) uploaded`);
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Right Angle</label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          className="w-full text-sm" 
                          onChange={(e) => {
                            if (e.target.files.length > 0) {
                              toast.success(`${e.target.files.length} right angle photo(s) uploaded`);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <ProtectedRoute permission={PERMISSIONS.EDIT_INSTALLATIONS}>
                  <div className="flex space-x-2">
                    {installation.status === 'ready_for_installation' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleStatusUpdate(installation.id, 'in_progress')}
                      >
                        Start Installation
                      </Button>
                    )}
                    {installation.status === 'in_progress' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleStatusUpdate(installation.id, 'completed')}
                      >
                        Mark Complete
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      View Measurements
                    </Button>
                  </div>
                </ProtectedRoute>
              </Card>
            ))}
          </div>

          {installations.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No installations found</h3>
              <p className="text-gray-600">There are no installations scheduled at the moment.</p>
            </div>
          )}
        </div>
      </ProtectedRoute>
    </Layout>
  );
}

export default withAuth(Installations);