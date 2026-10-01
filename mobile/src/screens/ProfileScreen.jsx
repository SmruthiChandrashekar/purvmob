import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, spacing, radius } from '../theme';
import Header from '../components/Header';
import { supabase } from '../services/supabase';
import { getApiBaseUrl, setApiBaseUrl, checkBackendHealth } from '../services/api';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Backend config
  const [apiUrl, setApiUrl] = useState('');
  const [pingStatus, setPingStatus] = useState(null);
  const [isTestingUrl, setIsTestingUrl] = useState(false);

  useEffect(() => {
    loadUser();
    getApiBaseUrl().then(setApiUrl);
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Required', 'Please enter email and password');
      return;
    }
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      Alert.alert('Success', 'Logged in successfully!');
      loadUser();
    } catch (err) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Required', 'Please enter email and password');
      return;
    }
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      Alert.alert('Account Created', 'Check your email to confirm registration or sign in directly.');
      loadUser();
    } catch (err) {
      Alert.alert('Sign Up Failed', err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    Alert.alert('Signed Out', 'You are now in guest mode.');
  };

  const handleTestConnection = async () => {
    setIsTestingUrl(true);
    setPingStatus(null);
    try {
      await setApiBaseUrl(apiUrl);
      const isOnline = await checkBackendHealth();
      setPingStatus(isOnline ? 'ONLINE' : 'OFFLINE');
    } catch (_) {
      setPingStatus('OFFLINE');
    } finally {
      setIsTestingUrl(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Settings & Profile"
        subtitle="Account Preferences & Backend Configuration"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>ACCOUNT STATUS</Text>
          {user ? (
            <View style={styles.userInfo}>
              <View style={styles.userBadge}>
                <Text style={styles.userBadgeText}>LOGGED IN</Text>
              </View>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userId} selectable>UID: {user.id}</Text>

              <TouchableOpacity style={styles.dangerButton} onPress={handleSignOut}>
                <Text style={styles.dangerButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.authBox}>
              <Text style={styles.authTitle}>
                {isRegisterMode ? 'Create Puravankara Account' : 'Sign In with Supabase'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={[styles.primaryButton, authLoading && styles.disabledBtn]}
                onPress={isRegisterMode ? handleSignUp : handleSignIn}
                disabled={authLoading}
              >
                {authLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {isRegisterMode ? 'Register Account' : 'Sign In'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toggleAuthMode}
                onPress={() => setIsRegisterMode(!isRegisterMode)}
              >
                <Text style={styles.toggleAuthText}>
                  {isRegisterMode
                    ? 'Already have an account? Sign In'
                    : "Don't have an account? Sign Up"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Backend Configuration Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>BACKEND API CONFIGURATION</Text>
          <Text style={styles.cardDesc}>
            Configure the FastAPI server endpoint for policy chatbot RAG queries and grievance submissions.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="http://10.0.2.2:8000"
            placeholderTextColor={colors.textMuted}
            value={apiUrl}
            onChangeText={setApiUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.quickPresetsRow}>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => setApiUrl('http://10.0.2.2:8000')}
            >
              <Text style={styles.presetText}>Android (10.0.2.2)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => setApiUrl('http://localhost:8000')}
            >
              <Text style={styles.presetText}>iOS (localhost)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.connectionRow}>
            <TouchableOpacity
              style={[styles.testBtn, isTestingUrl && styles.disabledBtn]}
              onPress={handleTestConnection}
              disabled={isTestingUrl}
            >
              {isTestingUrl ? (
                <ActivityIndicator color="#000000" size="small" />
              ) : (
                <Text style={styles.testBtnText}>Test & Save Connection</Text>
              )}
            </TouchableOpacity>

            {pingStatus && (
              <View
                style={[
                  styles.pingBadge,
                  pingStatus === 'ONLINE' ? styles.pingSuccess : styles.pingError,
                ]}
              >
                <Text
                  style={[
                    styles.pingText,
                    pingStatus === 'ONLINE' ? styles.pingTextSuccess : styles.pingTextError,
                  ]}
                >
                  {pingStatus}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* System & Architecture Info */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>SYSTEM ARCHITECTURE</Text>
          <Text style={styles.infoLine}>• Framework: React Native with Expo SDK 52</Text>
          <Text style={styles.infoLine}>• Database: Supabase PostgreSQL & Auth</Text>
          <Text style={styles.infoLine}>• AI Intelligence: LangGraph Multi-Agent RAG</Text>
          <Text style={styles.infoLine}>• Storage: Secure AsyncStorage Native Session Store</Text>
          <Text style={styles.infoLine}>• Version: 1.0.0 Production</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  userInfo: {
    gap: spacing.xs,
  },
  userBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: colors.success,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  userBadgeText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '700',
  },
  userEmail: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  userId: {
    color: colors.textMuted,
    fontSize: 11,
  },
  authBox: {
    gap: spacing.sm,
  },
  authTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  dangerButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  dangerButtonText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 13,
  },
  toggleAuthMode: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  toggleAuthText: {
    color: colors.accent,
    fontSize: 12,
  },
  quickPresetsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  presetChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  testBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
  },
  testBtnText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 13,
  },
  pingBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  pingSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: colors.success,
  },
  pingError: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: colors.danger,
  },
  pingText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pingTextSuccess: {
    color: colors.success,
  },
  pingTextError: {
    color: colors.danger,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  infoLine: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
});
