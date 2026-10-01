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
import { colors, radius, spacing, shadows } from './src/theme';
import PolicyAssistantScreen from './src/screens/PolicyAssistantScreen';
import LodgeScreen from './src/screens/LodgeScreen';
import TrackScreen from './src/screens/TrackScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const TABS = [
  { id: 'assistant', label: 'Purva AI', icon: '🤖' },
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
      <ExpoStatusBar style="dark" />
      <View style={styles.container}>
        {/* Active Screen */}
        <View style={styles.screenContainer}>
          {activeTab === 'assistant' && (
            <PolicyAssistantScreen
              onNavigateToLodge={handleNavigateToLodge}
              onSelectTicket={handleNavigateToTrack}
            />
          )}
          {activeTab === 'lodge' && (
            <LodgeScreen
              prefill={lodgePrefill}
              onTrackId={handleNavigateToTrack}
              onSelectTicket={handleNavigateToTrack}
            />
          )}
          {activeTab === 'track' && (
            <TrackScreen
              initialTrackingId={trackInitialId}
              onSelectTicket={handleNavigateToTrack}
            />
          )}
          {activeTab === 'profile' && (
            <ProfileScreen onSelectTicket={handleNavigateToTrack} />
          )}
        </View>

        {/* Bottom Tab Navigation */}
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
                {isActive && <View style={styles.activeIndicator} />}
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
    ...shadows.card,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    position: 'relative',
  },
  tabButtonActive: {
    backgroundColor: 'transparent',
  },
  tabIcon: {
    fontSize: 19,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.brandNavy,
    fontWeight: '800',
  },
  activeIndicator: {
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.brandRed,
    marginTop: 3,
  },
});
