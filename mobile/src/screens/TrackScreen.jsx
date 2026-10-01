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
import { colors, spacing, radius, shadows } from '../theme';
import Header from '../components/Header';
import { supabase } from '../services/supabase';

const TRACKING_HISTORY_KEY = '@purva_recent_tracking_ids';

const STATUS_STAGES = [
  { key: 'Open', label: 'Received & Logged', desc: 'Securely recorded in the Puravankara central ledger' },
  { key: 'Triaged', label: 'Routed & Triaged', desc: 'Assigned to designated department handler & SLA locked' },
  { key: 'In Progress', label: 'Investigating', desc: 'Active inquiry, fact-finding, and management review' },
  { key: 'Resolved', label: 'Resolved & Closed', desc: 'Formal remedy executed and verified under compliance' },
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
      Alert.alert('Tracking Reference Needed', 'Please enter your grievance UUID or tracking reference.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setGrievance(null);

    try {
      let { data, error } = await supabase
        .from('grievances')
        .select('*')
        .eq('grievance_id', rawId)
        .maybeSingle();

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
        setErrorMsg(`No record found matching: "${rawId}". Please verify your reference ID.`);
      } else {
        setGrievance(data);
        saveRecentId(data.grievance_id);
      }
    } catch (err) {
      setErrorMsg(`Connection error: ${err.message}`);
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

  const getSeverityBadge = (sev) => {
    const s = (sev || '').toLowerCase();
    if (s === 'critical' || s === 'high') {
      return { border: colors.danger, bg: '#fde8ea', text: colors.danger };
    }
    if (s === 'medium') {
      return { border: colors.warning, bg: '#fef3c7', text: colors.warning };
    }
    if (s === 'low') {
      return { border: colors.success, bg: '#ecfdf5', text: colors.success };
    }
    return { border: colors.brandRoyal, bg: colors.surfaceAlt, text: colors.brandRoyal };
  };

  return (
    <View style={styles.container}>
      <Header
        title="Track Grievance"
        subtitle="Transparent Multi-Stage Resolution Journey"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search Card */}
        <View style={styles.searchCard}>
          <Text style={styles.searchLabel}>ENTER TRACKING CODE OR UUID</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="e.g. e4d31a54-..."
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
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.searchButtonText}>Track</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick history */}
          {recentIds.length > 0 && (
            <View style={styles.historyContainer}>
              <Text style={styles.historyLabel}>Recent Searches:</Text>
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

        {/* Error message */}
        {errorMsg && (
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Grievance Result Card */}
        {grievance && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.ticketId} selectable>
                  ID: {grievance.grievance_id}
                </Text>
                <Text style={styles.ticketDate}>
                  Logged on {new Date(grievance.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>

              <View style={[styles.statusBadge, { backgroundColor: '#ecfdf5', borderColor: colors.success }]}>
                <Text style={[styles.statusBadgeText, { color: colors.success }]}>
                  {grievance.status || 'Open'}
                </Text>
              </View>
            </View>

            {/* Department & Severity Row */}
            <View style={styles.metaBox}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>ASSIGNED DEPT</Text>
                <Text style={styles.metaVal}>{grievance.department || 'Operations'}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>SEVERITY</Text>
                {(() => {
                  const b = getSeverityBadge(grievance.severity);
                  return (
                    <Text style={[styles.metaVal, { color: b.text }]}>
                      {grievance.severity ? grievance.severity.toUpperCase() : 'STANDARD'}
                    </Text>
                  );
                })()}
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>SLA TARGET</Text>
                <Text style={styles.metaVal}>{grievance.sla_hours ? `${grievance.sla_hours} hrs` : '48 hrs'}</Text>
              </View>
            </View>

            {/* Stepper Timeline */}
            <Text style={styles.timelineTitle}>RESOLUTION JOURNEY</Text>
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
                          isPassed && !isCurrent && styles.stepLabelPassed,
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
              <Text style={styles.descQuoteLabel}>RECORDED GRIEVANCE SUMMARY</Text>
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
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  searchLabel: {
    color: colors.brandNavy,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchButton: {
    backgroundColor: colors.brandNavy,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  searchDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
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
    fontWeight: '600',
  },
  historyList: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  historyChip: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyChipText: {
    color: colors.brandRoyal,
    fontSize: 11,
    fontWeight: '600',
  },
  errorCard: {
    backgroundColor: '#fff1f2',
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
    color: colors.danger,
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.card,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: spacing.md,
  },
  ticketId: {
    color: colors.brandNavy,
    fontSize: 16,
    fontWeight: '800',
  },
  ticketDate: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  metaBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceAlt,
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
    fontWeight: '700',
  },
  timelineTitle: {
    color: colors.brandNavy,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: spacing.xs,
  },
  timeline: {
    paddingLeft: spacing.xs,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 56,
  },
  stepIndicatorCol: {
    alignItems: 'center',
    width: 22,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
    borderColor: colors.brandRoyal,
    backgroundColor: colors.surface,
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 11,
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
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  stepLabelPassed: {
    color: colors.text,
    fontWeight: '700',
  },
  stepLabelCurrent: {
    color: colors.brandRoyal,
    fontWeight: '800',
  },
  stepDesc: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  descQuoteBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.brandNavy,
  },
  descQuoteLabel: {
    color: colors.brandRoyal,
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },
  descQuoteText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
});
