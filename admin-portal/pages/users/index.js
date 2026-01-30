import { useState, useEffect } from 'react';
import { useAuth, useUsers } from '../../hooks/useApi';
import Layout from '../../components/layout/Layout';
import { Card, Button, Badge, Table, Pagination, LoadingSpinner, Modal, Input } from '../../components/ui';
import { toast } from '../../components/Toast';

export default function UsersPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'client',
    password: ''
  });

  const { users, pagination, loading, refetch } = useUsers({ 
    page: currentPage, 
    limit: 10,
    role: roleFilter
  });

  const [localUsers, setLocalUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  useEffect(() => {
    let filtered = localUsers;
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(filtered);
  }, [localUsers, searchTerm, roleFilter]);

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

  const handleRoleFilter = (role) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleCreateUser = async () => {
    try {
      if (!formData.name || !formData.email || !formData.password) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      // Create new user object
      const newUser = {
        id: Date.now(), // Mock ID
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      // Add to local state immediately
      setLocalUsers(prev => [newUser, ...prev]);
      
      console.log('Creating user:', formData);
      
      // You would normally call your API here:
      // await apiClient.createUser(formData);
      
      toast.success('User created successfully!');
      setShowCreateModal(false);
      setFormData({ name: '', email: '', phone: '', role: 'client', password: '' });
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user. Please try again.');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'client',
      password: ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      if (!formData.name || !formData.email) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      // Update local state immediately
      setLocalUsers(prev => 
        prev.map(user => 
          user.id === selectedUser.id 
            ? { ...user, name: formData.name, email: formData.email, phone: formData.phone, role: formData.role }
            : user
        )
      );
      
      console.log('Updating user:', selectedUser.id, formData);
      
      // You would normally call your API here:
      // await apiClient.updateUser(selectedUser.id, formData);
      
      toast.success('User updated successfully!');
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({ name: '', email: '', phone: '', role: 'client', password: '' });
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user. Please try again.');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      // Update local state immediately
      setLocalUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, isActive: !currentStatus } : user
        )
      );
      
      console.log('Toggling user status:', userId, !currentStatus);
      
      // You would normally call your API here:
      // await apiClient.updateUser(userId, { isActive: !currentStatus });
      
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status. Please try again.');
      // Revert local state on error
      setLocalUsers(users);
    }
  };

  const exportToExcel = () => {
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Status', 'Created Date'];
    const csvContent = [
      headers.join(','),
      ...users.map(user => [
        user.name,
        user.email,
        user.phone || 'N/A',
        user.role,
        user.isActive ? 'Active' : 'Inactive',
        new Date(user.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <html>
        <head>
          <title>Users Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>Users Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${localUsers.map(user => `
                <tr>
                  <td>${user.name}</td>
                  <td>${user.email}</td>
                  <td>${user.phone || 'N/A'}</td>
                  <td>${user.role}</td>
                  <td>${user.isActive ? 'Active' : 'Inactive'}</td>
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
      header: 'Phone',
      key: 'phone',
      render: (value) => value || 'N/A'
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
      header: 'Created',
      key: 'createdAt',
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleEditUser(row)}>
            Edit
          </Button>
          <Button 
            size="sm" 
            variant={row.isActive ? 'danger' : 'success'}
            onClick={() => handleToggleUserStatus(row.id, row.isActive)}
          >
            {row.isActive ? 'Deactivate' : 'Activate'}
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
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="mt-2 text-gray-600">
              Manage system users and their permissions
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
              Add User
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {['', 'admin', 'rookie', 'installation', 'client'].map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleFilter(role)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    roleFilter === role
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {role || 'All Roles'}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          <Table 
            columns={userColumns} 
            data={filteredUsers} 
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
                refetch({ page, limit: 10, role: roleFilter });
              }}
            />
          )}
        </Card>

        {/* Create User Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Add New User"
          size="lg"
        >
          <div className="space-y-4">
            <Input 
              label="Full Name" 
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <Input 
              label="Email" 
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <Input 
              label="Phone" 
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="client">Client</option>
                  <option value="rookie">Rookie</option>
                  <option value="installation">Installation</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Input 
                label="Password" 
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>
                Add User
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit User"
          size="lg"
        >
          <div className="space-y-4">
            <Input 
              label="Full Name" 
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <Input 
              label="Email" 
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <Input 
              label="Phone" 
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="client">Client</option>
                  <option value="rookie">Rookie</option>
                  <option value="installation">Installation</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Input 
                label="New Password (optional)" 
                type="password"
                placeholder="Leave blank to keep current"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser}>
                Update User
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}