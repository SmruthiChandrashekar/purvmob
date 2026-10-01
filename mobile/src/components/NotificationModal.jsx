import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, radius, shadows } from '../theme';
import { apiClient } from '../services/api';
import { supabase } from '../services/supabase';

export default function NotificationModal({ visible, onClose, onSelectTicket }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadNotifications();
    }
  }, [visible]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Fallback: load recent notifications from Supabase table
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        if (!error && data) {
          setNotifications(data);
        }
        return;
      }

      const res = await apiClient('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      } else {
        // Direct table query fallback
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(15);
        if (data) setNotifications(data);
      }
    } catch (_) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient('/api/notifications/read-all', { method: 'PATCH' });
    } catch (_) {}
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleNotificationPress = (notif) => {
    if (notif.ticket_id) {
      onSelectTicket?.(notif.ticket_id);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.bellIcon}>🔔</Text>
              <Text style={styles.title}>Notifications</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleMarkAllRead}>
                <Text style={styles.markReadText}>Mark all read</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* List */}
          {loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator color={colors.brandRoyal} />
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>No New Notifications</Text>
              <Text style={styles.emptyDesc}>
                You will be notified here whenever your grievance status changes or when an SLA update is logged.
              </Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.listContent}>
              {notifications.map((item) => (
                <TouchableOpacity
                  key={item.id || item.notification_id}
                  style={[styles.itemCard, !item.is_read && styles.itemCardUnread]}
                  onPress={() => handleNotificationPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{item.title || 'Status Update'}</Text>
                    {!item.is_read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.itemMessage}>{item.message}</Text>
                  {item.ticket_id && (
                    <Text style={styles.itemTicket}>Reference: {item.ticket_id}</Text>
                  )}
                  <Text style={styles.itemTime}>
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 35, 79, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bellIcon: {
    fontSize: 18,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.brandNavy,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  markReadText: {
    color: colors.brandRoyal,
    fontSize: 12,
    fontWeight: '600',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: 'bold',
  },
  loaderWrap: {
    padding: spacing.xl * 2,
    alignItems: 'center',
  },
  emptyWrap: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  emptyDesc: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: spacing.md,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  itemCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemCardUnread: {
    backgroundColor: '#ffffff',
    borderColor: colors.brandRoyal,
    borderLeftWidth: 4,
    borderLeftColor: colors.brandRoyal,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brandNavy,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brandRed,
  },
  itemMessage: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  itemTicket: {
    fontSize: 11,
    color: colors.brandRoyal,
    fontWeight: '600',
    marginTop: 4,
  },
  itemTime: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
});
