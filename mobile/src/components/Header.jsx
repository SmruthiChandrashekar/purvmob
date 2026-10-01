import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, shadows } from '../theme';

export default function Header({ title, subtitle, rightElement }) {
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Text style={styles.brandName}>PURAVANKARA</Text>
          <View style={styles.grmBadge}>
            <Text style={styles.grmText}>GRM</Text>
          </View>
        </View>

        {rightElement ? <View style={styles.rightWrap}>{rightElement}</View> : null}
      </View>

      <View style={styles.titleWrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.card,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 2,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    color: colors.brandNavy,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  grmBadge: {
    backgroundColor: colors.brandRed,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  grmText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  titleWrap: {
    marginTop: 2,
  },
  title: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  rightWrap: {
    marginLeft: spacing.md,
  },
});
