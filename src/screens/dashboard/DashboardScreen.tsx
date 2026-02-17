import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { EloraLogo } from '../../components/EloraLogo';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <EloraLogo width={150} />
        <Text style={[styles.welcomeText, { color: colors.text }]}>
          Welcome, {user?.name || user?.email}!
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          Elora Crafting Arts Dashboard
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Admin Portal - Coming Soon
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.error }]}
        onPress={logout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  logoutButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});