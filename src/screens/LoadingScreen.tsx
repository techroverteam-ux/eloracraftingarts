import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { EloraLogo } from '../components/EloraLogo';

export default function LoadingScreen() {
  const { colors } = useTheme();

  return (
    <LinearGradient
      colors={colors.gradient.primary}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <EloraLogo width={200} style={styles.logo} />
        <Text style={styles.brandText}>ELORA CRAFTING ARTS</Text>
      </View>
      
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    marginBottom: 16,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
  },
});