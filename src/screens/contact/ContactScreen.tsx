import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Send, User, Mail, Phone } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { enquiryService } from '../../services/enquiryService';
import Toast from 'react-native-toast-message';

export default function ContactScreen() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      Toast.show({ type: 'error', text1: 'Please fill required fields' });
      return;
    }

    setSubmitting(true);
    try {
      await enquiryService.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        message: formData.message,
        source: 'Mobile App'
      });
      
      Toast.show({ type: 'success', text1: 'Message sent successfully!' });
      setFormData({ name: '', email: '', phone: '', company: '', message: '' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to send message' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 24 }}>
        Contact Us
      </Text>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>
          NAME *
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 8, paddingHorizontal: 12 }}>
          <User size={16} color={theme.colors.textSecondary} />
          <TextInput
            value={formData.name}
            onChangeText={text => setFormData({ ...formData, name: text })}
            placeholder="Enter your name"
            placeholderTextColor={theme.colors.textSecondary}
            style={{ flex: 1, padding: 12, color: theme.colors.text, marginLeft: 8 }}
          />
        </View>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>
          EMAIL *
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 8, paddingHorizontal: 12 }}>
          <Mail size={16} color={theme.colors.textSecondary} />
          <TextInput
            value={formData.email}
            onChangeText={text => setFormData({ ...formData, email: text })}
            placeholder="Enter your email"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="email-address"
            style={{ flex: 1, padding: 12, color: theme.colors.text, marginLeft: 8 }}
          />
        </View>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>
          MESSAGE *
        </Text>
        <TextInput
          value={formData.message}
          onChangeText={text => setFormData({ ...formData, message: text })}
          placeholder="Enter your message"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={4}
          style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.text, minHeight: 80 }}
        />
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={submitting}
        style={{
          backgroundColor: theme.colors.primary,
          padding: 16,
          borderRadius: 12,
          alignItems: 'center',
          marginTop: 24,
          opacity: submitting ? 0.6 : 1
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Send size={20} color="#FFF" />
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
            {submitting ? 'Sending...' : 'Send Message'}
          </Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}