'use client';

import React from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card, Badge } from '../../components/ui';
import {
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const stats = [
  {
    name: 'Total Orders',
    value: '124',
    change: '+12%',
    changeType: 'positive',
    icon: ClipboardDocumentListIcon,
  },
  {
    name: 'Active Clients',
    value: '48',
    change: '+8%',
    changeType: 'positive',
    icon: UserGroupIcon,
  },
  {
    name: 'Completed This Month',
    value: '32',
    change: '+24%',
    changeType: 'positive',
    icon: CheckCircleIcon,
  },
  {
    name: 'Pending Orders',
    value: '16',
    change: '-4%',
    changeType: 'negative',
    icon: ClockIcon,
  },
];

const recentOrders = [
  {
    id: '1',
    orderNumber: 'ELR20241201001',
    client: 'ABC Corporation',
    status: 'in_production',
    dueDate: '2024-01-15',
  },
  {
    id: '2',
    orderNumber: 'ELR20241201002',
    client: 'XYZ Store',
    status: 'measured',
    dueDate: '2024-01-18',
  },
  {
    id: '3',
    orderNumber: 'ELR20241201003',
    client: 'Design Studio',
    status: 'assigned',
    dueDate: '2024-01-20',
  },
];

const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { variant: 'secondary' as const, label: 'Pending' },
    assigned: { variant: 'primary' as const, label: 'Assigned' },
    measured: { variant: 'warning' as const, label: 'Measured' },
    in_production: { variant: 'primary' as const, label: 'In Production' },
    ready_for_installation: { variant: 'warning' as const, label: 'Ready for Installation' },
    installed: { variant: 'success' as const, label: 'Installed' },
    completed: { variant: 'success' as const, label: 'Completed' },
    cancelled: { variant: 'error' as const, label: 'Cancelled' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default function DashboardPage() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Welcome back! Here's what's happening with your orders.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name} className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-secondary-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-success-600' : 'text-error-600'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent orders */}
        <Card>
          <div className="px-6 py-4 border-b border-secondary-200">
            <h3 className="text-lg font-medium text-secondary-900">Recent Orders</h3>
          </div>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Order Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {order.client}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {new Date(order.dueDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}