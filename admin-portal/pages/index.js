import { useState, useEffect } from 'react';
import { useAuth, useStats, useOrders, useUsers } from '../hooks/useApi';
import { useRoleAccess } from '../hooks/useRoleAccess';
import Layout from '../components/layout/Layout';
import { Card, Button, Badge, Table, Pagination, LoadingSpinner, Modal, Input } from '../components/ui';
import { CardSkeleton, TableSkeleton, StatsSkeleton } from '../components/Skeletons';
import ContentUpload from '../components/ContentUpload';
import ProtectedRoute from '../components/ProtectedRoute';
import { PERMISSIONS } from '../lib/roles';

export default function AdminPortal() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { canViewOrders, canViewUsers, canViewAnalytics, canUploadContent } = useRoleAccess();
  const { stats, loading: statsLoading } = useStats();
  const { orders, pagination: orderPagination, loading: ordersLoading, refetch: refetchOrders } = useOrders({ page: 1, limit: 10 });
  const { users, pagination: userPagination, loading: usersLoading, refetch: refetchUsers } = useUsers({ page: 1, limit: 10 });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentOrderPage, setCurrentOrderPage] = useState(1);
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', label: 'Pending' },
      assigned: { variant: 'primary', label: 'Assigned' },
      measured: { variant: 'primary', label: 'Measured' },
      in_production: { variant: 'primary', label: 'In Production' },
      ready_for_installation: { variant: 'warning', label: 'Ready for Installation' },
      installed: { variant: 'success', label: 'Installed' },
      completed: { variant: 'success', label: 'Completed' },
      cancelled: { variant: 'danger', label: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { variant: 'primary', label: 'Admin' },
      rookie: { variant: 'success', label: 'Rookie' },
      installation: { variant: 'warning', label: 'Installation' },
      client: { variant: 'default', label: 'Client' },
    };

    const config = roleConfig[role] || roleConfig.client;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const orderColumns = [
    {
      header: 'Order Number',
      key: 'orderNumber',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.items?.length || 0} items</div>
        </div>
      )
    },
    {
      header: 'Client',
      key: 'clientId',
      render: (value) => value?.name || 'N/A'
    },
    {
      header: 'Status',
      key: 'status',
      render: (value) => getStatusBadge(value)
    },
    {
      header: 'Priority',
      key: 'priority',
      render: (value) => (
        <Badge variant={value === 'high' ? 'danger' : value === 'medium' ? 'warning' : 'default'}>
          {value || 'Low'}
        </Badge>
      )
    },
    {
      header: 'Due Date',
      key: 'dueDate',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">Edit</Button>
          <Button size="sm" variant="primary">Assign</Button>
        </div>
      )
    }
  ];

  const userColumns = [
    {
      header: 'User',
      key: 'name',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      )
    },
    {
      header: 'Role',
      key: 'role',
      render: (value) => getRoleBadge(value)
    },
    {
      header: 'Status',
      key: 'isActive',
      render: (value) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      header: 'Phone',
      key: 'phone',
      render: (value) => value || 'N/A'
    },
    {
      header: 'Created',
      key: 'createdAt',
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">Edit</Button>
          <Button 
            size="sm" 
            variant={row.isActive ? 'danger' : 'success'}
          >
            {row.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <style jsx global>{`
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          border-left: 4px solid #3b82f6;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .quick-action-btn {
          background: white;
          border: 2px solid #3b82f6;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .quick-action-btn:hover {
          background: #3b82f6;
          color: white;
          transform: translateY(-2px);
        }
        
        .tab-button {
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
        }
        
        .tab-button.active {
          background: #3b82f6;
          color: white;
        }
        
        .tab-button:not(.active) {
          background: white;
          color: #6b7280;
          border: 1px solid #e5e7eb;
        }
        
        .tab-button:not(.active):hover {
          background: #eff6ff;
          color: #374151;
        }
      `}</style>

      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Manage your Elora Art platform with complete control over orders, users, and analytics.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button variant="primary">
              View Analytics
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'dashboard', label: 'Dashboard', show: true },
              { id: 'orders', label: 'Orders', show: canViewOrders() },
              { id: 'users', label: 'Users', show: canViewUsers() },
              { id: 'analytics', label: 'Analytics', show: canViewAnalytics() },
              { id: 'upload', label: 'Upload', show: canUploadContent() }
            ].filter(tab => tab.show).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsLoading ? (
                <StatsSkeleton />
              ) : (
                [
                  { title: 'Total Orders', value: stats.totalOrders || 0, color: '#3b82f6' },
                  { title: 'Pending Orders', value: stats.pendingOrders || 0, color: '#f59e0b' },
                  { title: 'Completed Orders', value: stats.completedOrders || 0, color: '#10b981' },
                  { title: 'Active Users', value: stats.activeUsers || 0, color: '#8b5cf6' }
                ].map((stat, index) => (
                  <div key={index} className="stat-card">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {stat.value}
                        </p>
                      </div>
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: stat.color + '20' }}
                      >
                        <div 
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: stat.color }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-sm text-green-600">
                      +{Math.floor(Math.random() * 20)}% from last month
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Create Order', action: () => setShowCreateOrderModal(true) },
                { title: 'Add User', action: () => setShowCreateUserModal(true) },
                { title: 'Upload Stores', action: () => setActiveTab('stores') },
                { title: 'View Reports', action: () => setActiveTab('analytics') }
              ].map((action, index) => (
                <div 
                  key={index} 
                  className="quick-action-btn"
                  onClick={action.action}
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-lg mx-auto mb-3"></div>
                  <h3 className="font-semibold">{action.title}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <ProtectedRoute permission={PERMISSIONS.VIEW_ORDERS}>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
                <ProtectedRoute permission={PERMISSIONS.CREATE_ORDERS}>
                  <Button onClick={() => setShowCreateOrderModal(true)}>
                    Create New Order
                  </Button>
                </ProtectedRoute>
              </div>

              <Card>
                {ordersLoading ? (
                  <TableSkeleton />
                ) : (
                  <Table 
                    columns={orderColumns} 
                    data={orders} 
                    loading={ordersLoading}
                  />
                )}
                {orderPagination.totalPages > 1 && (
                  <Pagination
                    currentPage={orderPagination.page}
                    totalPages={orderPagination.totalPages}
                    totalItems={orderPagination.total}
                    itemsPerPage={orderPagination.limit}
                    onPageChange={(page) => {
                      setCurrentOrderPage(page);
                      refetchOrders({ page, limit: 10 });
                    }}
                  />
                )}
              </Card>
            </div>
          </ProtectedRoute>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <ProtectedRoute permission={PERMISSIONS.VIEW_USERS}>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <ProtectedRoute permission={PERMISSIONS.CREATE_USERS}>
                  <Button onClick={() => setShowCreateUserModal(true)}>
                    Add New User
                  </Button>
                </ProtectedRoute>
              </div>

              <Card>
                {usersLoading ? (
                  <TableSkeleton />
                ) : (
                  <Table 
                    columns={userColumns} 
                    data={users} 
                    loading={usersLoading}
                  />
                )}
                {userPagination.totalPages > 1 && (
                  <Pagination
                    currentPage={userPagination.page}
                    totalPages={userPagination.totalPages}
                    totalItems={userPagination.total}
                    itemsPerPage={userPagination.limit}
                    onPageChange={(page) => {
                      setCurrentUserPage(page);
                      refetchUsers({ page, limit: 10 });
                    }}
                  />
                )}
              </Card>
            </div>
          </ProtectedRoute>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <ProtectedRoute permission={PERMISSIONS.VIEW_ANALYTICS}>
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
                  <div className="space-y-4">
                    {['pending', 'assigned', 'measured', 'in_production', 'completed'].map((status) => {
                      const count = orders.filter(o => o.status === status).length;
                      const percentage = orders.length ? (count / orders.length * 100).toFixed(1) : 0;
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <span className="capitalize font-medium">{status.replace('_', ' ')}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-12 text-right">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Role Distribution</h3>
                  <div className="space-y-4">
                    {['admin', 'rookie', 'installation_boys', 'maintainer'].map((role) => {
                      const count = users.filter(u => u.role === role).length;
                      const percentage = users.length ? (count / users.length * 100).toFixed(1) : 0;
                      return (
                        <div key={role} className="flex items-center justify-between">
                          <span className="capitalize font-medium">{role.replace('_', ' ')}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-12 text-right">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>
          </ProtectedRoute>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Content Upload</h2>
              <p className="text-gray-600">Upload files and manage content</p>
            </div>
            <ContentUpload />
          </div>
        )}

        {/* Create Order Modal */}
        <Modal
          isOpen={showCreateOrderModal}
          onClose={() => setShowCreateOrderModal(false)}
          title="Create New Order"
          size="lg"
        >
          <div className="space-y-4">
            <Input label="Client Name" placeholder="Enter client name" />
            <Input label="Order Description" placeholder="Enter order description" />
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowCreateOrderModal(false)}>
                Cancel
              </Button>
              <Button>Create Order</Button>
            </div>
          </div>
        </Modal>

        {/* Create User Modal */}
        <Modal
          isOpen={showCreateUserModal}
          onClose={() => setShowCreateUserModal(false)}
          title="Add New User"
          size="lg"
        >
          <div className="space-y-4">
            <Input label="Full Name" placeholder="Enter full name" />
            <Input label="Email" type="email" placeholder="Enter email address" />
            <Input label="Phone" placeholder="Enter phone number" />
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowCreateUserModal(false)}>
                Cancel
              </Button>
              <Button>Add User</Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}