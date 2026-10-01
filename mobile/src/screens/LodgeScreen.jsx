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
import { colors, spacing, radius } from '../theme';
import Header from '../components/Header';
import { submitGrievance } from '../services/api';
import { supabase } from '../services/supabase';

const CATEGORIES = [
  { id: 'internal', label: 'Internal (Employee)' },
  { id: 'external', label: 'External (Customer / Vendor)' },
  { id: 'contract', label: 'Contractor / Agency' },
];

const DEPARTMENTS = [
  'HR',
  'Legal & Compliance',
  'Customer Relations',
  'Operations',
  'Finance',
  'Engineering / IT',
];

export default function LodgeScreen({ prefill, onTrackId }) {
  const [category, setCategory] = useState('internal');
  const [department, setDepartment] = useState('HR');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedGrievanceId, setSubmittedGrievanceId] = useState(null);

  // Apply prefill from Chat if redirected
  useEffect(() => {
    if (prefill) {
      if (prefill.description) setDescription(prefill.description);
      if (prefill.department && DEPARTMENTS.includes(prefill.department)) {
        setDepartment(prefill.department);
      }
    }
  }, [prefill]);

  // Load current user profile if available
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
      Alert.alert('Required Field', 'Please provide a description of the issue or concern.');
      return;
    }

    if (!isAnonymous && !email.trim()) {
      Alert.alert('Contact Email Needed', 'Please provide your email address so our team can follow up with you.');
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
          name: isAnonymous ? 'Anonymous' : (name.trim() || 'Anonymous User'),
          email: isAnonymous ? null : email.trim(),
          phone: isAnonymous ? null : phone.trim(),
          client: 'Puravankara Mobile React Native',
          date: new Date().toISOString(),
        },
      };

      const result = await submitGrievance(payload);
      const gid = result.grievance_id || result.id || 'SUBMITTED';
      setSubmittedGrievanceId(gid);
    } catch (err) {
      Alert.alert(
        'Submission Notice',
        `Unable to reach backend: ${err.message}. Trying direct registration...`
      );

      // Fallback: direct Supabase insert
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
        Alert.alert('Error', `Failed to register grievance: ${fallbackErr.message}`);
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
        <Header title="Lodge Grievance" subtitle="Registration Confirmation" />
        <View style={styles.successContainer}>
          <View style={styles.successIconBox}>
            <Text style={styles.successIcon}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Grievance Logged Successfully</Text>
          <Text style={styles.successMessage}>
            Your concern has been registered and routed to the {department} department for investigation under our SLA policy.
          </Text>

          <View style={styles.trackingBox}>
            <Text style={styles.trackingBoxLabel}>YOUR TRACKING ID</Text>
            <Text style={styles.trackingIdText} selectable>
              {submittedGrievanceId}
            </Text>
            <Text style={styles.trackingSubtext}>Save this ID to monitor progress anytime.</Text>
          </View>

          <View style={styles.successActions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => onTrackId?.(submittedGrievanceId)}
            >
              <Text style={styles.primaryButtonText}>🔍 Track Status Now</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleReset}>
              <Text style={styles.secondaryButtonText}>Lodge Another Grievance</Text>
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
        subtitle="Confidential & Secure Resolution Portal"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Category Selector */}
        <Text style={styles.sectionLabel}>AFFILIATION CATEGORY</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                category === cat.id && styles.categoryChipActive,
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  category === cat.id && styles.categoryChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Target Department */}
        <Text style={styles.sectionLabel}>RELEVANT DEPARTMENT</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deptRow}>
          {DEPARTMENTS.map((dept) => (
            <TouchableOpacity
              key={dept}
              style={[
                styles.deptChip,
                department === dept && styles.deptChipActive,
              ]}
              onPress={() => setDepartment(dept)}
            >
              <Text
                style={[
                  styles.deptChipText,
                  department === dept && styles.deptChipTextActive,
                ]}
              >
                {dept}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Anonymous Option */}
        <View style={styles.switchCard}>
          <View style={styles.switchInfo}>
            <Text style={styles.switchTitle}>Submit Anonymously</Text>
            <Text style={styles.switchDesc}>
              Your identity and contact info will be omitted completely from records.
            </Text>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={isAnonymous ? '#000000' : '#f4f3f4'}
          />
        </View>

        {/* Personal details if not anonymous */}
        {!isAnonymous && (
          <View style={styles.personalSection}>
            <Text style={styles.sectionLabel}>YOUR CONTACT DETAILS</Text>
            <TextInput
              style={styles.input}
              placeholder="Your Full Name (optional)"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email Address (for status updates)"
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

        {/* Grievance Description */}
        <View style={styles.descSection}>
          <View style={styles.descHeader}>
            <Text style={styles.sectionLabel}>DETAILED DESCRIPTION</Text>
            <Text style={styles.charCount}>{description.length}/2000</Text>
          </View>
          <TextInput
            style={styles.textArea}
            placeholder="Please detail what occurred, dates, parties involved, and any requested remedy..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            maxLength={2000}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Grievance Confidentiality</Text>
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
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  categoryRow: {
    flexDirection: 'column',
    gap: spacing.xs + 2,
  },
  categoryChip: {
    backgroundColor: colors.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  categoryChipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: colors.text,
  },
  deptRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  deptChip: {
    backgroundColor: colors.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deptChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  deptChipText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  deptChipTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  switchCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.xs,
  },
  switchInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  switchTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  switchDesc: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  personalSection: {
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 14,
    minHeight: 130,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
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
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 2,
    borderColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  successIcon: {
    color: colors.success,
    fontSize: 32,
    fontWeight: 'bold',
  },
  successTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  successMessage: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 19,
    paddingHorizontal: spacing.md,
  },
  trackingBox: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    marginVertical: spacing.xl,
  },
  trackingBoxLabel: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  trackingIdText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
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
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
