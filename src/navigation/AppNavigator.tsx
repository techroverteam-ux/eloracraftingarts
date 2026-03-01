import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import UsersScreen from '../screens/users/UsersScreen';
import RolesScreen from '../screens/roles/RolesScreen';
import StoresScreen from '../screens/stores/StoresScreen';
import RecceScreen from '../screens/recce/RecceScreen';
import InstallationScreen from '../screens/installation/InstallationScreen';
import EnquiriesScreen from '../screens/enquiries/EnquiriesScreen';
import ElementsScreen from '../screens/elements/ElementsScreen';
import ClientsScreen from '../screens/clients/ClientsScreen';
import RFQScreen from '../screens/rfq/RFQScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import CustomDrawer from '../components/CustomDrawer';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function DrawerNavigator() {
  const { user } = useAuth();

  const canView = (moduleName: string) => {
    if (!user || !user.roles || !Array.isArray(user.roles)) return false;
    if (user.roles.some((r: any) => r.code === 'SUPER_ADMIN')) return true;
    return user.roles.some((role: any) => role.permissions?.[moduleName]?.view === true);
  };

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        overlayColor: 'rgba(0,0,0,0.5)',
        drawerStyle: { width: 280 },
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{ drawerLabel: 'Dashboard' }} />
      {canView('users') && <Drawer.Screen name="Users" component={UsersScreen} options={{ drawerLabel: 'User Management' }} />}
      {canView('roles') && <Drawer.Screen name="Roles" component={RolesScreen} options={{ drawerLabel: 'Role Management' }} />}
      {canView('stores') && <Drawer.Screen name="Stores" component={StoresScreen} options={{ drawerLabel: 'Store Operations' }} />}
      {canView('recce') && <Drawer.Screen name="Recce" component={RecceScreen} options={{ drawerLabel: 'Recce' }} />}
      {canView('installation') && <Drawer.Screen name="Installation" component={InstallationScreen} options={{ drawerLabel: 'Installation' }} />}
      {canView('enquiries') && <Drawer.Screen name="Enquiries" component={EnquiriesScreen} options={{ drawerLabel: 'Enquiries' }} />}
      {canView('elements') && <Drawer.Screen name="Elements" component={ElementsScreen} options={{ drawerLabel: 'Element Mapping' }} />}
      {canView('clients') && <Drawer.Screen name="Clients" component={ClientsScreen} options={{ drawerLabel: 'Client Management' }} />}
      <Drawer.Screen name="RFQ" component={RFQScreen} options={{ drawerLabel: 'RFQ Generation' }} />
      <Drawer.Screen name="Reports" component={ReportsScreen} options={{ drawerLabel: 'Reports' }} />
      <Drawer.Screen name="Analytics" component={AnalyticsScreen} options={{ drawerLabel: 'Analytics' }} />
      <Drawer.Screen name="Notifications" component={NotificationsScreen} options={{ drawerLabel: 'Notifications' }} />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <Stack.Screen name="Main" component={DrawerNavigator} />
      )}
    </Stack.Navigator>
  );
}
