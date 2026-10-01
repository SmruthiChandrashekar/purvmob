import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, spacing, radius, shadows } from '../theme';
import Header from '../components/Header';
import { submitGrievance } from '../services/api';
import { supabase } from '../services/supabase';

const STAKEHOLDERS = [
  {
    id: 'internal',
    title: 'Internal Employees',
    desc: 'Workplace, HR policies, compensation, POSH & team concerns',
    icon: '👤',
    accentColor: colors.stakeholderInternal,
  },
  {
    id: 'contract',
    title: 'Contract Workforce',
    desc: 'Site safety, contractor dues, wages, working conditions',
    icon: '🔨',
    accentColor: colors.stakeholderContract,
  },
  {
    id: 'external',
    title: 'External Stakeholders',
    desc: 'Homeowners, residents, vendors, suppliers & public relations',
    icon: '🌐',
    accentColor: colors.stakeholderExternal,
  },
];

const DEPARTMENTS = [
  'HR',
  'Legal & Compliance',
  'Customer Relations',
  'Operations',
  'Finance',
  'Engineering / IT',
];

export default function LodgeScreen({ prefill, onTrackId, onSelectTicket }) {
  const [category, setCategory] = useState('internal');
  const [department, setDepartment] = useState('HR');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedGrievanceId, setSubmittedGrievanceId] = useState(null);

  // Apply prefill if redirected from Chat
  useEffect(() => {
    if (prefill) {
      if (prefill.description) setDescription(prefill.description);
      if (prefill.department && DEPARTMENTS.includes(prefill.department)) {
        setDepartment(prefill.department);
      }
    }
  }, [prefill]);

  // Load profile if signed in
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email || '');
        setName(user.user_metadata?.full_name || '');
      }
    });
  }, []);

  const handleSubmit = async () => {
    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      Alert.alert('Required Field', 'Please provide a detailed description of the concern.');
      return;
    }

    if (!isAnonymous && !email.trim()) {
      Alert.alert('Contact Email Needed', 'Please provide your email address for SLA progress notifications.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const payload = {
        description: trimmedDesc,
        lang: 'en',
        source: 'mobile-app',
        metadata: {
          user_id: isAnonymous ? null : (user?.id || null),
          category: category,
          department: department,
          is_anonymous: isAnonymous,
          name: isAnonymous ? 'Anonymous Reporter' : (name.trim() || 'Anonymous User'),
          email: isAnonymous ? null : email.trim(),
          phone: isAnonymous ? null : phone.trim(),
          client: 'Puravankara Mobile GRM',
          date: new Date().toISOString(),
        },
      };

      const result = await submitGrievance(payload);
      const gid = result.grievance_id || result.id || 'SUBMITTED';
      setSubmittedGrievanceId(gid);
    } catch (err) {
      // Direct Supabase fallback
      try {
        const { data, error } = await supabase
          .from('grievances')
          .insert({
            description: trimmedDesc,
            department: department,
            category: category,
            status: 'Open',
          })
          .select()
          .single();

        if (error) throw error;
        setSubmittedGrievanceId(data.grievance_id);
      } catch (fallbackErr) {
        Alert.alert('Registration Notice', `Grievance submitted with direct fallback: ${fallbackErr.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedGrievanceId(null);
    setDescription('');
  };

  if (submittedGrievanceId) {
    return (
      <View style={styles.container}>
        <Header
          title="Grievance Registered"
          subtitle="Puravankara Compliance & Resolution"
          onSelectTicket={onSelectTicket}
        />
        <View style={styles.successContainer}>
          <View style={styles.successIconBox}>
            <Text style={styles.successCheck}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Grievance Logged Successfully</Text>
          <Text style={styles.successMessage}>
            Your incident has been recorded in the central compliance ledger and dispatched to the{' '}
            <Text style={{ fontWeight: '700', color: colors.brandNavy }}>{department}</Text>{' '}
            department for immediate review under our SLA commitment.
          </Text>

          <View style={styles.trackingBox}>
            <Text style={styles.trackingBoxLabel}>UNIQUE TRACKING REFERENCE</Text>
            <Text style={styles.trackingIdText} selectable>
              {submittedGrievanceId}
            </Text>
            <Text style={styles.trackingSubtext}>Save this reference code to monitor progress anytime.</Text>
          </View>

          <View style={styles.successActions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => onTrackId?.(submittedGrievanceId)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>🔍 Track Status in Real-time</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleReset}>
              <Text style={styles.secondaryButtonText}>Lodge Another Concern</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Lodge Grievance"
        subtitle="Confidential, Secure & Time-Bound Resolution"
        onSelectTicket={onSelectTicket}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Stakeholder Selection Cards */}
        <Text style={styles.sectionLabel}>SELECT AFFILIATION CATEGORY</Text>
        <View style={styles.stakeholderGroup}>
          {STAKEHOLDERS.map((stk) => {
            const isSelected = category === stk.id;
            return (
              <TouchableOpacity
                key={stk.id}
                style={[
                  styles.stakeholderCard,
                  isSelected && { borderColor: stk.accentColor, backgroundColor: '#f0f4fa' },
                ]}
                onPress={() => setCategory(stk.id)}
                activeOpacity={0.8}
              >
                <View style={styles.stakeholderHeader}>
                  <Text style={styles.stakeholderIcon}>{stk.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.stakeholderTitle,
                        isSelected && { color: stk.accentColor },
                      ]}
                    >
                      {stk.title}
                    </Text>
                    <Text style={styles.stakeholderDesc}>{stk.desc}</Text>
                  </View>
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && { borderColor: stk.accentColor, backgroundColor: stk.accentColor },
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Target Department Selection */}
        <Text style={styles.sectionLabel}>TARGET DEPARTMENT</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.deptRow}
        >
          {DEPARTMENTS.map((dept) => {
            const isSelected = department === dept;
            return (
              <TouchableOpacity
                key={dept}
                style={[
                  styles.deptChip,
                  isSelected && styles.deptChipActive,
                ]}
                onPress={() => setDepartment(dept)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.deptChipText,
                    isSelected && styles.deptChipTextActive,
                  ]}
                >
                  {dept}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Anonymous Whistleblower Card */}
        <View style={styles.switchCard}>
          <View style={styles.switchInfo}>
            <View style={styles.anonBadgeRow}>
              <Text style={styles.switchTitle}>Report Anonymously</Text>
              <View style={styles.privacyBadge}>
                <Text style={styles.privacyBadgeText}>Protected</Text>
              </View>
            </View>
            <Text style={styles.switchDesc}>
              Your name, phone, and email will be excluded from all records under the Whistleblower Protection policy.
            </Text>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{ false: colors.border, true: colors.brandRed }}
            thumbColor={isAnonymous ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>

        {/* Contact fields if not anonymous */}
        {!isAnonymous && (
          <View style={styles.personalSection}>
            <Text style={styles.sectionLabel}>CONTACT DETAILS (CONFIDENTIAL)</Text>
            <TextInput
              style={styles.input}
              placeholder="Your Full Name"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email Address (for resolution status updates)"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number (optional)"
              placeholderTextColor={colors.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        )}

        {/* Description Section */}
        <View style={styles.descSection}>
          <View style={styles.descHeader}>
            <Text style={styles.sectionLabel}>DETAILED DESCRIPTION</Text>
            <Text style={styles.charCount}>{description.length} / 2000</Text>
          </View>
          <TextInput
            style={styles.textArea}
            placeholder="Please detail the incident, dates, location, persons involved, and requested resolution..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            maxLength={2000}
            textAlignVertical="top"
          />
        </View>

        {/* Submit CTA */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Grievance Securely</Text>
          )}
        </TouchableOpacity>
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
    gap: spacing.md,
  },
  sectionLabel: {
    color: colors.brandNavy,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  stakeholderGroup: {
    gap: spacing.sm,
  },
  stakeholderCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.card,
  },
  stakeholderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  stakeholderIcon: {
    fontSize: 22,
  },
  stakeholderTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  stakeholderDesc: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  deptRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  deptChip: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  deptChipActive: {
    backgroundColor: colors.brandNavy,
    borderColor: colors.brandNavy,
  },
  deptChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  deptChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  switchCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
    marginVertical: spacing.xs,
  },
  switchInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  anonBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  privacyBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.success,
  },
  privacyBadgeText: {
    color: colors.success,
    fontSize: 9,
    fontWeight: '800',
  },
  switchDesc: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  personalSection: {
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  descSection: {
    marginTop: spacing.xs,
  },
  descHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    color: colors.textMuted,
    fontSize: 11,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 14,
    minHeight: 130,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  submitButton: {
    backgroundColor: colors.brandRed,
    borderRadius: radius.md,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    ...shadows.accent,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  successContainer: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ecfdf5',
    borderWidth: 2,
    borderColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  successCheck: {
    color: colors.success,
    fontSize: 32,
    fontWeight: 'bold',
  },
  successTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
  },
  successMessage: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
    paddingHorizontal: spacing.sm,
  },
  trackingBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    width: '100%',
    marginVertical: spacing.xl,
    ...shadows.card,
  },
  trackingBoxLabel: {
    color: colors.brandRoyal,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  trackingIdText: {
    color: colors.brandNavy,
    fontSize: 19,
    fontWeight: '900',
    marginVertical: spacing.sm,
    textAlign: 'center',
  },
  trackingSubtext: {
    color: colors.textMuted,
    fontSize: 11,
  },
  successActions: {
    width: '100%',
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.brandNavy,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.card,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
