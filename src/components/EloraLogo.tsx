import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';

interface EloraLogoProps {
  width?: number;
  height?: number;
  style?: any;
}

export const EloraLogo = ({ width = 200, height = 50, style }: EloraLogoProps) => {
  const { colors } = useTheme();
  
  return (
    <View style={[{ width, height }, style]}>
      <LinearGradient
        colors={colors.gradient.primary}
        style={[styles.logoContainer, { width, height }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.logoText, { fontSize: width * 0.12 }]}>
          ELORA CRAFTING ARTS
        </Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});