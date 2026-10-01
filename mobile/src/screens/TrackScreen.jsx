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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, radius } from '../theme';
import Header from '../components/Header';
import { supabase } from '../services/supabase';

const TRACKING_HISTORY_KEY = '@purva_recent_tracking_ids';

const STATUS_STAGES = [
  { key: 'Open', label: 'Submitted', desc: 'Registered in compliance system' },
  { key: 'Triaged', label: 'Triaged', desc: 'Assigned to department handler' },
  { key: 'In Progress', label: 'Investigating', desc: 'Under active inquiry & review' },
  { key: 'Resolved', label: 'Resolved', desc: 'Resolution approved & logged' },
];

export default function TrackScreen({ initialTrackingId }) {
  const [searchId, setSearchId] = useState(initialTrackingId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [grievance, setGrievance] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [recentIds, setRecentIds] = useState([]);

  useEffect(() => {
    loadRecentIds();
    if (initialTrackingId) {
      handleSearch(initialTrackingId);
    }
  }, [initialTrackingId]);

  const loadRecentIds = async () => {
    try {
      const data = await AsyncStorage.getItem(TRACKING_HISTORY_KEY);
      if (data) setRecentIds(JSON.parse(data));
    } catch (_) {}
  };

  const saveRecentId = async (id) => {
    try {
      const updated = [id, ...recentIds.filter((x) => x !== id)].slice(0, 5);
      setRecentIds(updated);
      await AsyncStorage.setItem(TRACKING_HISTORY_KEY, JSON.stringify(updated));
    } catch (_) {}
  };

  const handleSearch = async (overrideId = null) => {
    const rawId = (overrideId || searchId).trim();
    if (!rawId) {
      Alert.alert('Tracking ID Required', 'Please enter your grievance UUID or tracking reference.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setGrievance(null);

    try {
      // 1. Exact match
      let { data, error } = await supabase
        .from('grievances')
        .select('*')
        .eq('grievance_id', rawId)
        .maybeSingle();

      // 2. Prefix match fallback
      if (!data && !error) {
        const prefixRes = await supabase
          .from('grievances')
          .select('*')
          .ilike('grievance_id', `${rawId}%`)
          .limit(1);

        if (prefixRes.data && prefixRes.data.length > 0) {
          data = prefixRes.data[0];
        }
      }

      if (error || !data) {
        setErrorMsg(`No grievance found matching ID: "${rawId}". Please double-check the tracking ID.`);
      } else {
        setGrievance(data);
        saveRecentId(data.grievance_id);
      }
    } catch (err) {
      setErrorMsg(`Lookup failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStageIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('resolved') || s.includes('closed')) return 3;
    if (s.includes('progress') || s.includes('investigat')) return 2;
    if (s.includes('triage') || s.includes('assign')) return 1;
    return 0;
  };

  const getSeverityBadgeColor = (sev) => {
    const s = (sev || '').toLowerCase();
    if (s === 'critical' || s === 'high') return colors.danger;
    if (s === 'medium') return colors.warning;
    if (s === 'low') return colors.success;
    return colors.primary;
  };

  return (
    <View style={styles.container}>
      <Header
        title="Track Status"
        subtitle="Real-time Investigation & Resolution Timeline"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchCard}>
          <Text style={styles.searchLabel}>ENTER TRACKING ID</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="e.g. 8f4b62d8-..."
              placeholderTextColor={colors.textMuted}
              value={searchId}
              onChangeText={setSearchId}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.searchButton, isLoading && styles.searchDisabled]}
              onPress={() => handleSearch()}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#000000" size="small" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick history chips */}
          {recentIds.length > 0 && (
            <View style={styles.historyContainer}>
              <Text style={styles.historyLabel}>Recent:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.historyList}>
                {recentIds.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.historyChip}
                    onPress={() => {
                      setSearchId(item);
                      handleSearch(item);
                    }}
                  >
                    <Text style={styles.historyChipText}>{item.substring(0, 8)}...</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Error notice */}
        {errorMsg && (
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Grievance Result Card */}
        {grievance && (
          <View style={styles.resultCard}>
            {/* Header info */}
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.ticketId} selectable>
                  ID: {grievance.grievance_id}
                </Text>
                <Text style={styles.ticketDate}>
                  Submitted: {new Date(grievance.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { borderColor: getSeverityBadgeColor(grievance.severity) },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: getSeverityBadgeColor(grievance.severity) },
                  ]}
                >
                  {grievance.status || 'Open'}
                </Text>
              </View>
            </View>

            {/* Department & Severity Row */}
            <View style={styles.metaBox}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>DEPARTMENT</Text>
                <Text style={styles.metaVal}>{grievance.department || 'General'}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>SEVERITY</Text>
                <Text style={[styles.metaVal, { color: getSeverityBadgeColor(grievance.severity) }]}>
                  {grievance.severity ? grievance.severity.toUpperCase() : 'STANDARD'}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>SLA TARGET</Text>
                <Text style={styles.metaVal}>{grievance.sla_hours ? `${grievance.sla_hours} hrs` : '48 hrs'}</Text>
              </View>
            </View>

            {/* Progress Stepper Timeline */}
            <Text style={styles.timelineTitle}>STATUS TIMELINE</Text>
            <View style={styles.timeline}>
              {STATUS_STAGES.map((stage, idx) => {
                const currentIdx = getStageIndex(grievance.status);
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <View key={stage.key} style={styles.timelineRow}>
                    <View style={styles.stepIndicatorCol}>
                      <View
                        style={[
                          styles.stepDot,
                          isPassed && styles.stepDotPassed,
                          isCurrent && styles.stepDotCurrent,
                        ]}
                      >
                        {isPassed && <Text style={styles.checkMark}>✓</Text>}
                      </View>
                      {idx < STATUS_STAGES.length - 1 && (
                        <View
                          style={[
                            styles.stepLine,
                            idx < currentIdx && styles.stepLinePassed,
                          ]}
                        />
                      )}
                    </View>

                    <View style={styles.stepContent}>
                      <Text
                        style={[
                          styles.stepLabel,
                          isCurrent && styles.stepLabelCurrent,
                        ]}
                      >
                        {stage.label}
                      </Text>
                      <Text style={styles.stepDesc}>{stage.desc}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Description quote */}
            <View style={styles.descQuoteBox}>
              <Text style={styles.descQuoteLabel}>RECORDED SUMMARY</Text>
              <Text style={styles.descQuoteText}>
                {grievance.description}
              </Text>
            </View>
          </View>
        )}
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
  searchCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 14,
  },
  historyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  historyLabel: {
    color: colors.textMuted,
    fontSize: 11,
  },
  historyList: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  historyChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyChipText: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  errorCard: {
    backgroundColor: '#2D1515',
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  errorIcon: {
    fontSize: 18,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    flex: 1,
  },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
  },
  ticketId: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  ticketDate: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    borderWidth: 1.5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metaBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  metaVal: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  timelineTitle: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: spacing.xs,
  },
  timeline: {
    paddingLeft: spacing.xs,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 52,
  },
  stepIndicatorCol: {
    alignItems: 'center',
    width: 20,
  },
  stepDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepDotPassed: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stepDotCurrent: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  checkMark: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  stepLinePassed: {
    backgroundColor: colors.success,
  },
  stepContent: {
    flex: 1,
    paddingBottom: spacing.sm,
  },
  stepLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  stepLabelCurrent: {
    color: colors.accent,
    fontWeight: '700',
  },
  stepDesc: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  descQuoteBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  descQuoteLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  descQuoteText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
