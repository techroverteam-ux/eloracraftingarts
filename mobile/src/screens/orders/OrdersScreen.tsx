import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  ActivityIndicator,
  Searchbar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from 'react-query';
import { mobileApiClient } from '../../services/api';
import { theme, spacing, typography } from '../../utils/theme';
import { format } from 'date-fns';

interface Order {
  id: string;
  orderNumber: string;
  clientId: {
    name: string;
  };
  status: string;
  items: Array<{
    productType: string;
    quantity: number;
  }>;
  dueDate?: string;
  createdAt: string;
}

const OrdersScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = React.useState('');

  const {
    data: ordersData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery('myOrders', () => mobileApiClient.getMyOrders());

  const orders = ordersData?.data || [];

  const filteredOrders = orders.filter((order: Order) =>
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.clientId.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const statusColors = {
      pending: theme.colors.secondary,
      assigned: theme.colors.primary,
      measured: theme.colors.warning,
      in_production: theme.colors.primary,
      ready_for_installation: theme.colors.warning,
      installed: theme.colors.success,
      completed: theme.colors.success,
      cancelled: theme.colors.error,
    };
    return statusColors[status as keyof typeof statusColors] || theme.colors.secondary;
  };

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      pending: 'Pending',
      assigned: 'Assigned',
      measured: 'Measured',
      in_production: 'In Production',
      ready_for_installation: 'Ready for Installation',
      installed: 'Installed',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return statusLabels[status as keyof typeof statusLabels] || status;
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('OrderDetail' as never, { orderId: item.id } as never)}
    >
      <Card style={styles.orderCard}>
        <Card.Content>
          <View style={styles.orderHeader}>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <Chip
              mode="outlined"
              textStyle={{ color: getStatusColor(item.status) }}
              style={{ borderColor: getStatusColor(item.status) }}
            >
              {getStatusLabel(item.status)}
            </Chip>
          </View>

          <Text style={styles.clientName}>{item.clientId.name}</Text>

          <View style={styles.orderDetails}>
            <Text style={styles.itemCount}>
              {item.items.length} item{item.items.length !== 1 ? 's' : ''}
            </Text>
            {item.dueDate && (
              <Text style={styles.dueDate}>
                Due: {format(new Date(item.dueDate), 'MMM dd, yyyy')}
              </Text>
            )}
          </View>

          <Text style={styles.createdDate}>
            Created: {format(new Date(item.createdAt), 'MMM dd, yyyy')}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search orders..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchbar: {
    margin: spacing.md,
    elevation: 2,
  },
  listContainer: {
    padding: spacing.md,
    paddingTop: 0,
  },
  orderCard: {
    marginBottom: spacing.md,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderNumber: {
    ...typography.h3,
    color: theme.colors.onSurface,
    flex: 1,
  },
  clientName: {
    ...typography.body1,
    color: theme.colors.secondary,
    marginBottom: spacing.sm,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  itemCount: {
    ...typography.body2,
    color: theme.colors.onSurface,
  },
  dueDate: {
    ...typography.body2,
    color: theme.colors.warning,
    fontWeight: '500',
  },
  createdDate: {
    ...typography.caption,
    color: theme.colors.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body1,
    color: theme.colors.secondary,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  emptyText: {
    ...typography.body1,
    color: theme.colors.secondary,
  },
});

export default OrdersScreen;