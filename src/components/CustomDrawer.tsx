import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { LayoutDashboard, Users, Shield, Map, Wrench, MessageSquare, BarChart3, LogOut } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function CustomDrawer(props) {
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const { state, navigation } = props;

  const canView = (moduleName: string) => {
    if (!user || !user.roles || !Array.isArray(user.roles)) return false;
    if (user.roles.some((r: any) => r.code === 'SUPER_ADMIN')) return true;
    return user.roles.some((role: any) => role.permissions?.[moduleName]?.view === true);
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, route: 'Dashboard', alwaysShow: true },
    { name: 'User Management', icon: Users, route: 'Users', module: 'users' },
    { name: 'Role Management', icon: Shield, route: 'Roles', module: 'roles' },
    { name: 'Recce', icon: Map, route: 'Recce', module: 'recce' },
    { name: 'Installation', icon: Wrench, route: 'Installation', module: 'installation' },
    { name: 'Enquiries', icon: MessageSquare, route: 'Enquiries', module: 'enquiries' },
    { name: 'Reports', icon: BarChart3, route: 'Reports', alwaysShow: true },
  ];

  const currentRoute = state.routes[state.index].name;

  return (
    <View className={`flex-1 ${darkMode ? 'bg-black border-r border-purple-700/30' : 'bg-white border-r border-gray-200'}`}>
      <View className={`h-20 justify-center items-center border-b ${darkMode ? 'bg-purple-900/30 border-purple-700/50' : 'bg-yellow-50/50 border-gray-200'}`}>
        <View className="w-40 h-16">
          <Text className={`text-2xl font-bold text-center ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>ELORA</Text>
        </View>
      </View>
      <ScrollView className="flex-1 py-4">
        <View className="px-4 space-y-1">
          {menuItems.map((item) => {
            const hasAccess = item.alwaysShow || (item.module && canView(item.module));
            if (!hasAccess) return null;
            const isActive = currentRoute === item.route;
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.route}
                onPress={() => navigation.navigate(item.route)}
                className={`flex-row items-center px-4 py-3 rounded-xl ${
                  isActive
                    ? darkMode
                      ? 'bg-yellow-500/20 border border-yellow-500/30'
                      : 'bg-yellow-500'
                    : darkMode
                      ? 'bg-transparent'
                      : 'bg-transparent'
                }`}
              >
                <Icon size={20} color={isActive ? (darkMode ? '#eab308' : '#fff') : darkMode ? '#9ca3af' : '#6b7280'} />
                <Text className={`ml-4 text-sm font-semibold ${isActive ? (darkMode ? 'text-yellow-400' : 'text-white') : darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      <View className={`p-4 border-t ${darkMode ? 'bg-purple-900/30 border-purple-700/50' : 'bg-yellow-50/50 border-gray-200'}`}>
        <TouchableOpacity
          onPress={logout}
          className={`flex-row items-center justify-center gap-3 p-3 rounded-xl ${
            darkMode ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-yellow-500'
          }`}
        >
          <LogOut size={20} color={darkMode ? '#eab308' : '#fff'} />
          <Text className={`font-bold text-sm ${darkMode ? 'text-yellow-400' : 'text-white'}`}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
