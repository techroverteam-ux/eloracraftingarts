import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import ProtectedRoute from '../../components/ProtectedRoute';
import withAuth from '../../components/withAuth';
import { Button, Card } from '../../components/ui';
import { CardSkeleton } from '../../components/Skeletons';
import BulkStoreUpload from '../../components/BulkStoreUpload';
import { PERMISSIONS } from '../../lib/roles';

function Stores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const { checkPermission } = useRoleAccess();

  useEffect(() => {
    setTimeout(() => {
      setStores([
        {
          id: 1,
          storeName: 'Store Alpha',
          address: '123 Main St, City, State 12345',
          clientName: 'Client A Corp',
          contactPerson: 'John Doe',
          phone: '(555) 123-4567',
          email: 'john@clienta.com',
          brandingLocations: ['Front Wall', 'Side Panel', 'Window Display'],
          status: 'active',
          totalOrders: 5,
          completedOrders: 3
        },
        {
          id: 2,
          storeName: 'Store Beta',
          address: '456 Oak Ave, City, State 67890',
          clientName: 'Client A Corp',
          contactPerson: 'Jane Smith',
          phone: '(555) 987-6543',
          email: 'jane@clienta.com',
          brandingLocations: ['Entrance', 'Back Wall'],
          status: 'active',
          totalOrders: 3,
          completedOrders: 1
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stores Management</h1>
            <p className="text-gray-600">Manage client stores and branding locations</p>
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
      <ProtectedRoute permission={PERMISSIONS.VIEW_ORDERS}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Stores Management</h1>
              <p className="text-gray-600">Manage client stores and branding locations</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setShowUpload(!showUpload)}>
                {showUpload ? 'Hide Upload' : 'Bulk Upload'}
              </Button>
              <ProtectedRoute permission={PERMISSIONS.CREATE_ORDERS}>
                <Button>Add Store</Button>
              </ProtectedRoute>
            </div>
          </div>

          {showUpload && <BulkStoreUpload />}

          <div className="grid gap-6">
            {stores.map((store) => (
              <Card key={store.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{store.storeName}</h3>
                    <p className="text-sm text-gray-600">{store.clientName}</p>
                    <p className="text-sm text-gray-600">{store.address}</p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    store.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {store.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Contact Person</p>
                    <p className="text-sm text-gray-600">{store.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone</p>
                    <p className="text-sm text-gray-600">{store.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-sm text-gray-600">{store.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Orders</p>
                    <p className="text-sm text-gray-600">{store.completedOrders}/{store.totalOrders} completed</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Branding Locations:</p>
                  <div className="flex flex-wrap gap-2">
                    {store.brandingLocations.map((location, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {location}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">View Orders</Button>
                  <Button size="sm" variant="outline">Schedule Visit</Button>
                  <ProtectedRoute permission={PERMISSIONS.EDIT_ORDERS}>
                    <Button size="sm">Edit Store</Button>
                  </ProtectedRoute>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </ProtectedRoute>
    </Layout>
  );
}

export default withAuth(Stores);