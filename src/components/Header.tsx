import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Menu, Moon, Sun } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export default function Header({ title = 'Dashboard' }) {
  const { darkMode, toggleTheme } = useTheme();
  const navigation = useNavigation();

  return (
    <View className={`flex-row items-center justify-between px-4 py-3 border-b ${darkMode ? 'bg-black border-purple-700/30' : 'bg-white border-gray-200'}`}>
      <TouchableOpacity onPress={() => navigation.openDrawer()} className="p-2">
        <Menu size={24} color={darkMode ? '#fff' : '#000'} />
      </TouchableOpacity>
      <Text className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</Text>
      <TouchableOpacity onPress={toggleTheme} className="p-2">
        {darkMode ? <Sun size={20} color="#eab308" /> : <Moon size={20} color="#6b7280" />}
      </TouchableOpacity>
    </View>
  );
}
