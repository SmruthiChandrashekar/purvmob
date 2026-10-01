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
import { colors, spacing, radius, shadows } from '../theme';
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
        title="Settings & Account"
        subtitle="Supabase Authentication & Server Settings"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>ACCOUNT PROFILE</Text>
          {user ? (
            <View style={styles.userInfo}>
              <View style={styles.userBadge}>
                <Text style={styles.userBadgeText}>AUTHENTICATED</Text>
              </View>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userId} selectable>User UID: {user.id}</Text>

              <TouchableOpacity style={styles.dangerButton} onPress={handleSignOut} activeOpacity={0.8}>
                <Text style={styles.dangerButtonText}>Sign Out from Mobile</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.authBox}>
              <Text style={styles.authTitle}>
                {isRegisterMode ? 'Register New Puravankara Account' : 'Sign In with Supabase'}
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
                activeOpacity={0.85}
              >
                {authLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {isRegisterMode ? 'Create Account' : 'Sign In'}
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
          <Text style={styles.cardLabel}>BACKEND ENDPOINT CONNECTION</Text>
          <Text style={styles.cardDesc}>
            FastAPI server URL for AI policy assistant responses and automated grievance triage.
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
              <Text style={styles.presetText}>Android (10.0.2.2:8000)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => setApiUrl('http://localhost:8000')}
            >
              <Text style={styles.presetText}>iOS (localhost:8000)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.connectionRow}>
            <TouchableOpacity
              style={[styles.testBtn, isTestingUrl && styles.disabledBtn]}
              onPress={handleTestConnection}
              disabled={isTestingUrl}
              activeOpacity={0.85}
            >
              {isTestingUrl ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
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
          <Text style={styles.infoLine}>• Brand: Puravankara Grievance Redressal (GRM)</Text>
          <Text style={styles.infoLine}>• Framework: React Native with Expo SDK 52</Text>
          <Text style={styles.infoLine}>• Database: Supabase PostgreSQL & Realtime</Text>
          <Text style={styles.infoLine}>• Policy AI: LangGraph Multi-Agent RAG</Text>
          <Text style={styles.infoLine}>• UI Design: 100% Aligned with Web Design System</Text>
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
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    ...shadows.card,
  },
  cardLabel: {
    color: colors.brandNavy,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
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
    backgroundColor: '#ecfdf5',
    borderColor: colors.success,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  userBadgeText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '800',
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
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryButton: {
    backgroundColor: colors.brandNavy,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
    ...shadows.card,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  dangerButton: {
    backgroundColor: '#fff1f2',
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  dangerButtonText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 13,
  },
  toggleAuthMode: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  toggleAuthText: {
    color: colors.brandRoyal,
    fontSize: 12,
    fontWeight: '600',
  },
  quickPresetsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  presetChip: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetText: {
    color: colors.brandRoyal,
    fontSize: 11,
    fontWeight: '600',
  },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  testBtn: {
    backgroundColor: colors.brandNavy,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 3,
    borderRadius: radius.md,
  },
  testBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  pingBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  pingSuccess: {
    backgroundColor: '#ecfdf5',
    borderColor: colors.success,
  },
  pingError: {
    backgroundColor: '#fff1f2',
    borderColor: colors.danger,
  },
  pingText: {
    fontSize: 11,
    fontWeight: '800',
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
