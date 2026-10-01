import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { colors, radius, spacing } from './src/theme';
import PolicyAssistantScreen from './src/screens/PolicyAssistantScreen';
import LodgeScreen from './src/screens/LodgeScreen';
import TrackScreen from './src/screens/TrackScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const TABS = [
  { id: 'assistant', label: 'Assistant', icon: '💬' },
  { id: 'lodge', label: 'Lodge', icon: '📋' },
  { id: 'track', label: 'Track', icon: '🔍' },
  { id: 'profile', label: 'Settings', icon: '⚙️' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('assistant');
  const [lodgePrefill, setLodgePrefill] = useState(null);
  const [trackInitialId, setTrackInitialId] = useState(null);

  const handleNavigateToLodge = (prefillData) => {
    setLodgePrefill(prefillData);
    setActiveTab('lodge');
  };

  const handleNavigateToTrack = (trackingId) => {
    setTrackInitialId(trackingId);
    setActiveTab('track');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="light" />
      <View style={styles.container}>
        {/* Active Screen */}
        <View style={styles.screenContainer}>
          {activeTab === 'assistant' && (
            <PolicyAssistantScreen onNavigateToLodge={handleNavigateToLodge} />
          )}
          {activeTab === 'lodge' && (
            <LodgeScreen
              prefill={lodgePrefill}
              onTrackId={handleNavigateToTrack}
            />
          )}
          {activeTab === 'track' && (
            <TrackScreen initialTrackingId={trackInitialId} />
          )}
          {activeTab === 'profile' && <ProfileScreen />}
        </View>

        {/* Bottom Tab Bar */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? spacing.md : spacing.xs,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: radius.md,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.accent,
    fontWeight: '700',
  },
});
