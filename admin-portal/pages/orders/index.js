import { useState, useEffect } from 'react';
import { useAuth, useOrders } from '../../hooks/useApi';
import Layout from '../../components/layout/Layout';
import { Card, Button, Badge, Table, Pagination, LoadingSpinner, Modal, Input } from '../../components/ui';

export default function OrdersPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    clientName: '',
    orderDescription: '',
    priority: 'medium',
    dueDate: ''
  });

  const { orders, pagination, loading, refetch } = useOrders({ 
    page: currentPage, 
    limit: 10,
    search: searchTerm,
    status: statusFilter
  });

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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleCreateOrder = async () => {
    // API call to create order
    console.log('Creating order:', formData);
    setShowCreateModal(false);
    setFormData({ clientName: '', orderDescription: '', priority: 'medium', dueDate: '' });
    refetch({ page: 1, limit: 10 });
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setFormData({
      clientName: order.clientId?.name || '',
      orderDescription: order.items?.[0]?.productType || '',
      priority: order.priority || 'medium',
      dueDate: order.dueDate ? new Date(order.dueDate).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleUpdateOrder = async () => {
    // API call to update order
    console.log('Updating order:', selectedOrder.id, formData);
    setShowEditModal(false);
    setSelectedOrder(null);
    setFormData({ clientName: '', orderDescription: '', priority: 'medium', dueDate: '' });
    refetch({ page: currentPage, limit: 10 });
  };

  const exportToExcel = () => {
    // Create CSV content
    const headers = ['Order Number', 'Client', 'Status', 'Priority', 'Due Date', 'Created Date'];
    const csvContent = [
      headers.join(','),
      ...orders.map(order => [
        order.orderNumber,
        order.clientId?.name || 'N/A',
        order.status,
        order.priority || 'low',
        order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'N/A',
        new Date(order.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Simple PDF export using window.print
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <html>
        <head>
          <title>Orders Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>Orders Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Client</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(order => `
                <tr>
                  <td>${order.orderNumber}</td>
                  <td>${order.clientId?.name || 'N/A'}</td>
                  <td>${order.status}</td>
                  <td>${order.priority || 'low'}</td>
                  <td>${order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
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
          <Button size="sm" variant="outline" onClick={() => handleEditOrder(row)}>
            Edit
          </Button>
          <Button size="sm" variant="primary">
            Assign
          </Button>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
            <p className="mt-2 text-gray-600">
              Manage and track all orders in the system
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button variant="outline" onClick={exportToExcel}>
              Export Excel
            </Button>
            <Button variant="outline" onClick={exportToPDF}>
              Export PDF
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              Create Order
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {['', 'pending', 'assigned', 'measured', 'in_production', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    statusFilter === status
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {status || 'All'}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Orders Table */}
        <Card>
          <Table 
            columns={orderColumns} 
            data={orders} 
            loading={loading}
          />
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={(page) => {
                setCurrentPage(page);
                refetch({ page, limit: 10, search: searchTerm, status: statusFilter });
              }}
            />
          )}
        </Card>

        {/* Create Order Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Order"
          size="lg"
        >
          <div className="space-y-4">
            <Input 
              label="Client Name" 
              placeholder="Enter client name"
              value={formData.clientName}
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
            />
            <Input 
              label="Order Description" 
              placeholder="Enter order description"
              value={formData.orderDescription}
              onChange={(e) => setFormData({...formData, orderDescription: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select 
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <Input 
                label="Due Date" 
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOrder}>
                Create Order
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Order Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Order"
          size="lg"
        >
          <div className="space-y-4">
            <Input 
              label="Client Name" 
              placeholder="Enter client name"
              value={formData.clientName}
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
            />
            <Input 
              label="Order Description" 
              placeholder="Enter order description"
              value={formData.orderDescription}
              onChange={(e) => setFormData({...formData, orderDescription: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select 
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <Input 
                label="Due Date" 
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateOrder}>
                Update Order
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}