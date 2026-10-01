import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { colors, spacing, radius, shadows } from '../theme';
import Header from '../components/Header';

const STAKEHOLDERS = [
  {
    id: 'internal',
    title: 'Internal Employees',
    desc: 'Workplace, HR policies, compensation, POSH & team concerns',
    icon: '👤',
    accent: colors.stakeholderInternal,
  },
  {
    id: 'contract',
    title: 'Contract Workforce',
    desc: 'Site safety, contractor dues, wages, working conditions',
    icon: '🔨',
    accent: colors.stakeholderContract,
  },
  {
    id: 'external',
    title: 'External Stakeholders',
    desc: 'Homeowners, residents, vendors, suppliers & public relations',
    icon: '🌐',
    accent: colors.stakeholderExternal,
  },
];

const JOURNEY_STEPS = [
  { step: '01', title: 'Received & Logged', desc: 'Securely recorded in the central compliance ledger with tracking ID' },
  { step: '02', title: 'Routed & Triaged', desc: 'Dispatched to specialized department officers with locked SLA' },
  { step: '03', title: 'Under Investigation', desc: 'Active inquiry, fact-finding, and management review' },
  { step: '04', title: 'Resolved & Closed', desc: 'Formal resolution logged, verified and communicated' },
];

export default function HomeScreen({ onNavigate, onSelectTicket }) {
  const [quickRef, setQuickRef] = useState('');

  const handleTrackSubmit = () => {
    if (quickRef.trim()) {
      onSelectTicket?.(quickRef.trim());
    } else {
      onNavigate?.('track');
    }
  };

  const handleSampleDemo = () => {
    const sample = 'GRM-2026-0412';
    setQuickRef(sample);
    onSelectTicket?.(sample);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Grievance Redressal"
        subtitle="Transparent. Fast. Accountable."
        onSelectTicket={onSelectTicket}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ================= HERO SECTION (Exact website hero) ================= */}
        <View style={styles.heroSection}>
          <View style={styles.heroGlow} />

          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>GRIEVANCE REDRESSAL MECHANISM</Text>
          </View>

          <Text style={styles.heroHeadline}>
            Transparent. Fast.{'\n'}
            <Text style={{ color: '#ffffff' }}>Accountable.</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            A multi-stakeholder resolution system ensuring timely, ethical and auditable redressal across all Puravankara operations.
          </Text>

          {/* Hero Buttons */}
          <View style={styles.heroBtnRow}>
            <TouchableOpacity
              style={styles.heroPrimaryBtn}
              onPress={() => onNavigate?.('lodge')}
              activeOpacity={0.85}
            >
              <Text style={styles.heroPrimaryBtnText}>+ Lodge a Grievance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroSecondaryBtn}
              onPress={() => onNavigate?.('track')}
              activeOpacity={0.85}
            >
              <Text style={styles.heroSecondaryBtnText}>Track Status</Text>
            </TouchableOpacity>
          </View>

          {/* Stakeholder Tag Strip */}
          <View style={styles.stakeholderStrip}>
            <View style={styles.stripPill}>
              <Text style={styles.stripText}>👤 Employees</Text>
            </View>
            <View style={styles.stripPill}>
              <Text style={styles.stripText}>🔨 Workforce</Text>
            </View>
            <View style={styles.stripPill}>
              <Text style={styles.stripText}>🌐 Stakeholders</Text>
            </View>
          </View>
        </View>

        {/* ================= QUICK TRACK CARD (From website hero right) ================= */}
        <View style={styles.quickTrackCard}>
          <Text style={styles.cardHeaderSmall}>CHECK RESOLUTION STATUS</Text>
          <Text style={styles.quickTrackTitle}>Track by Reference Code</Text>
          <Text style={styles.quickTrackSub}>
            Enter your tracking ID or reference code (e.g. GRM-2026-0412 or UUID)
          </Text>

          <View style={styles.quickInputRow}>
            <TextInput
              style={styles.quickInput}
              placeholder="e.g. GRM-2026-0412"
              placeholderTextColor={colors.textMuted}
              value={quickRef}
              onChangeText={setQuickRef}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.quickSearchBtn}
              onPress={handleTrackSubmit}
              activeOpacity={0.85}
            >
              <Text style={styles.quickSearchBtnText}>Track</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.demoLink} onPress={handleSampleDemo}>
            <Text style={styles.demoLinkText}>Try sample reference demo (GRM-2026-0412)</Text>
          </TouchableOpacity>
        </View>

        {/* ================= ASK PURVA AI BANNER ================= */}
        <TouchableOpacity
          style={styles.aiBanner}
          onPress={() => onNavigate?.('assistant')}
          activeOpacity={0.9}
        >
          <View style={styles.aiBannerLeft}>
            <View style={styles.aiAvatar}>
              <Text style={{ fontSize: 24 }}>🤖</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.aiTagRow}>
                <Text style={styles.aiName}>Purva AI</Text>
                <View style={styles.aiPill}>
                  <Text style={styles.aiPillText}>RAG Intelligence</Text>
                </View>
              </View>
              <Text style={styles.aiDesc}>
                Have a policy or compliance query? Chat with Purva AI for immediate citations.
              </Text>
            </View>
          </View>
          <Text style={styles.aiArrow}>➔</Text>
        </TouchableOpacity>

        {/* ================= STAKEHOLDER PORTAL SECTION ================= */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionPre}>DEDICATED PORTALS</Text>
          <Text style={styles.sectionHeading}>Select Your Stakeholder Category</Text>
          <Text style={styles.sectionDesc}>
            Custom pathways tailored to the specific nature and urgency of your relationship with Puravankara.
          </Text>

          <View style={styles.stakeholderGroup}>
            {STAKEHOLDERS.map((stk) => (
              <TouchableOpacity
                key={stk.id}
                style={[styles.portalCard, { borderLeftColor: stk.accent }]}
                onPress={() => onNavigate?.('lodge')}
                activeOpacity={0.85}
              >
                <View style={styles.portalCardHeader}>
                  <View style={[styles.portalIconBox, { backgroundColor: `${stk.accent}15` }]}>
                    <Text style={styles.portalIcon}>{stk.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.portalTitle, { color: stk.accent }]}>{stk.title}</Text>
                    <Text style={styles.portalDesc}>{stk.desc}</Text>
                  </View>
                  <Text style={[styles.portalArrow, { color: stk.accent }]}>➔</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ================= RESOLUTION JOURNEY (4 STEPS) ================= */}
        <View style={styles.journeyCard}>
          <Text style={styles.sectionPre}>PROCESS OVERVIEW</Text>
          <Text style={styles.sectionHeading}>How Your Grievance is Resolved</Text>

          <View style={styles.journeyStepsList}>
            {JOURNEY_STEPS.map((js, idx) => (
              <View key={js.step} style={styles.journeyStepRow}>
                <View style={styles.journeyStepNumBox}>
                  <Text style={styles.journeyStepNum}>{js.step}</Text>
                  {idx < JOURNEY_STEPS.length - 1 && <View style={styles.journeyLine} />}
                </View>
                <View style={styles.journeyStepBody}>
                  <Text style={styles.journeyStepTitle}>{js.title}</Text>
                  <Text style={styles.journeyStepDesc}>{js.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ================= COMMITMENT BANNER ================= */}
        <View style={styles.footerBanner}>
          <Text style={styles.footerBrand}>PURAVANKARA LIMITED</Text>
          <Text style={styles.footerCommitment}>
            Committed to fair, confidential and auditable grievance redressal in compliance with corporate governance standards.
          </Text>
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
    paddingBottom: spacing.xl * 2,
  },
  heroSection: {
    backgroundColor: colors.brandNavy,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl + 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.brandRoyal,
    opacity: 0.35,
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroHeadline: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    color: '#c4d2ec',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  heroBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  heroPrimaryBtn: {
    backgroundColor: colors.brandRed,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    ...shadows.accent,
  },
  heroPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  heroSecondaryBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  heroSecondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  stakeholderStrip: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.xs,
  },
  stripPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  stripText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  quickTrackCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: -spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.hover,
  },
  cardHeaderSmall: {
    color: colors.brandNavy,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  quickTrackTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  quickTrackSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  quickInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickSearchBtn: {
    backgroundColor: colors.brandNavy,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickSearchBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  demoLink: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  demoLinkText: {
    color: colors.brandRoyal,
    fontSize: 11,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  aiBanner: {
    backgroundColor: '#ffffff',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: '#c7d2fe',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.card,
  },
  aiBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    flex: 1,
  },
  aiAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  aiTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  aiName: {
    color: colors.brandNavy,
    fontSize: 14,
    fontWeight: '800',
  },
  aiPill: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
  },
  aiPillText: {
    color: '#4338ca',
    fontSize: 9,
    fontWeight: '800',
  },
  aiDesc: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  aiArrow: {
    color: colors.brandRoyal,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  sectionWrap: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionPre: {
    color: colors.brandNavy,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  sectionHeading: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionDesc: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  stakeholderGroup: {
    gap: spacing.sm,
  },
  portalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    ...shadows.card,
  },
  portalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  portalIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalIcon: {
    fontSize: 18,
  },
  portalTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  portalDesc: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  portalArrow: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  journeyCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  journeyStepsList: {
    marginTop: spacing.md,
  },
  journeyStepRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  journeyStepNumBox: {
    alignItems: 'center',
    width: 28,
  },
  journeyStepNum: {
    color: colors.brandRoyal,
    fontSize: 13,
    fontWeight: '900',
  },
  journeyLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  journeyStepBody: {
    flex: 1,
    paddingBottom: spacing.md + 4,
  },
  journeyStepTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  journeyStepDesc: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  footerBanner: {
    backgroundColor: colors.surfaceAlt,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  footerBrand: {
    color: colors.brandNavy,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  footerCommitment: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: spacing.md,
  },
});
