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
import HomeScreen from './src/screens/HomeScreen';
import PolicyAssistantScreen from './src/screens/PolicyAssistantScreen';
import LodgeScreen from './src/screens/LodgeScreen';
import TrackScreen from './src/screens/TrackScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const TABS = [
  { id: 'home', label: 'Home', icon: '🏛️' },
  { id: 'assistant', label: 'Purva AI', icon: '🤖' },
  { id: 'lodge', label: 'Lodge', icon: '📋' },
  { id: 'track', label: 'Track', icon: '🔍' },
  { id: 'profile', label: 'Account', icon: '⚙️' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [lodgePrefill, setLodgePrefill] = useState(null);
  const [trackInitialId, setTrackInitialId] = useState(null);

  const handleNavigate = (tabName, prefillData = null) => {
    if (prefillData) setLodgePrefill(prefillData);
    setActiveTab(tabName);
  };

  const handleNavigateToTrack = (trackingId) => {
    setTrackInitialId(trackingId);
    setActiveTab('track');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="dark" />
      <View style={styles.container}>
        {/* Active Screen View */}
        <View style={styles.screenContainer}>
          {activeTab === 'home' && (
            <HomeScreen
              onNavigate={handleNavigate}
              onSelectTicket={handleNavigateToTrack}
            />
          )}
          {activeTab === 'assistant' && (
            <PolicyAssistantScreen
              onNavigateToLodge={(data) => handleNavigate('lodge', data)}
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

        {/* Bottom Tab Navigation Bar */}
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
    fontSize: 18,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.brandNavy,
    fontWeight: '800',
  },
  activeIndicator: {
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.brandRed,
    marginTop: 3,
  },
});
