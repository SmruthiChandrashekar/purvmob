import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, radius, shadows } from '../theme';
import Header from '../components/Header';
import { sendChatMessage } from '../services/api';

const SUGGESTED_PROMPTS = [
  'What is the POSH policy?',
  'Can I report a grievance anonymously?',
  'What qualifies as harassment?',
  'What is the resolution timeline?',
  'Who investigates high severity cases?',
];

export default function PolicyAssistantScreen({ onNavigateToLodge }) {
  const [messages, setMessages] = useState([
    {
      id: 'greeting',
      isBot: true,
      text: 'Namaste & Welcome. I am Purva AI, your dedicated Puravankara Policy & Grievance assistant. Ask me questions about company policies, HR compliance, POSH guidelines, or get immediate support lodging a concern.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isLoading]);

  const handleSend = async (customText = null) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      isBot: false,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const data = await sendChatMessage(textToSend, 'en');
      let botText = data.response || "I couldn't locate specific company policy clauses on that query.";

      const botMsg = {
        id: `b-${Date.now()}`,
        isBot: true,
        text: botText,
        sources: data.sources || [],
        severity: data.severity ? data.severity.toLowerCase() : null,
        department: data.department || null,
        trigger_form: data.trigger_form || false,
        routed: data.routed || false,
        grievance_id: data.grievance_id || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          isBot: true,
          isError: true,
          text: `⚠️ Unable to reach policy RAG service. Verify backend URL in Settings.\n(${err.message})`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityStyle = (sev) => {
    switch (sev) {
      case 'critical':
      case 'high':
        return { border: colors.danger, bg: '#fde8ea', text: colors.danger };
      case 'medium':
        return { border: colors.warning, bg: '#fef3c7', text: colors.warning };
      case 'low':
        return { border: colors.success, bg: '#ecfdf5', text: colors.success };
      default:
        return { border: colors.brandRoyal, bg: colors.surfaceAlt, text: colors.brandRoyal };
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Header
        title="Policy Assistant"
        subtitle="RAG Compliance & Policy Guidance"
      />

      {/* Suggested prompts carousel matching website pill buttons */}
      <View style={styles.promptBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promptScroll}
        >
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.promptChip}
              onPress={() => handleSend(prompt)}
              activeOpacity={0.7}
            >
              <Text style={styles.promptText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Messages list */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((item) => (
          <View
            key={item.id}
            style={[
              styles.messageRow,
              item.isBot ? styles.botRow : styles.userRow,
            ]}
          >
            {item.isBot && (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>🤖</Text>
              </View>
            )}

            <View
              style={[
                styles.bubble,
                item.isBot ? styles.botBubble : styles.userBubble,
                item.isError && styles.errorBubble,
              ]}
            >
              {item.isBot && (
                <View style={styles.botBadgeRow}>
                  <Text style={styles.botName}>Purva AI</Text>
                  <View style={styles.verifiedDot} />
                </View>
              )}

              <Text style={[styles.bubbleText, item.isBot ? styles.botText : styles.userText]}>
                {item.text}
              </Text>

              {/* Source citations */}
              {item.sources && item.sources.length > 0 && (
                <View style={styles.sourcesBox}>
                  <Text style={styles.sourcesHeader}>📑 Verified References:</Text>
                  {item.sources.map((src, sIdx) => (
                    <Text key={sIdx} style={styles.sourceItem}>
                      • {src.source} {src.page ? `(p. ${src.page})` : ''}
                    </Text>
                  ))}
                </View>
              )}

              {/* Severity & Department Badges */}
              {item.severity && (
                <View style={styles.metaRow}>
                  {(() => {
                    const st = getSeverityStyle(item.severity);
                    return (
                      <View style={[styles.sevTag, { borderColor: st.border, backgroundColor: st.bg }]}>
                        <Text style={[styles.sevTagText, { color: st.text }]}>
                          Severity: {item.severity.toUpperCase()}
                        </Text>
                      </View>
                    );
                  })()}
                  {item.department ? (
                    <View style={styles.deptTag}>
                      <Text style={styles.deptTagText}>Routed: {item.department}</Text>
                    </View>
                  ) : null}
                </View>
              )}

              {/* Action Button: Lodge Grievance directly from chat */}
              {(item.trigger_form || item.severity === 'high' || item.severity === 'critical') && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    onNavigateToLodge?.({
                      description: item.text,
                      severity: item.severity,
                      department: item.department,
                    })
                  }
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionButtonText}>📋 Lodge Formal Grievance with this info</Text>
                </TouchableOpacity>
              )}

              <Text style={[styles.timestamp, item.isBot ? styles.timestampBot : styles.timestampUser]}>
                {item.timestamp}
              </Text>
            </View>
          </View>
        ))}

        {isLoading && (
          <View style={[styles.messageRow, styles.botRow]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>🤖</Text>
            </View>
            <View style={[styles.bubble, styles.botBubble, styles.loadingBubble]}>
              <ActivityIndicator color={colors.brandRoyal} size="small" />
              <Text style={styles.loadingText}>Searching Puravankara policies & guidelines...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask policy questions or describe an issue..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendDisabled]}
          onPress={() => handleSend()}
          disabled={!inputText.trim() || isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  promptBar: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  promptScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  promptChip: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  promptText: {
    color: colors.brandRoyal,
    fontSize: 12,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  avatarText: {
    fontSize: 16,
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderRadius: radius.lg,
  },
  botBubble: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  userBubble: {
    backgroundColor: colors.userBubble,
    borderTopRightRadius: radius.xs,
    ...shadows.card,
  },
  errorBubble: {
    borderColor: colors.danger,
    backgroundColor: '#fff1f2',
  },
  botBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  botName: {
    color: colors.brandRoyal,
    fontSize: 11,
    fontWeight: '800',
  },
  verifiedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 22,
  },
  botText: {
    color: colors.text,
  },
  userText: {
    color: colors.userBubbleText,
  },
  sourcesBox: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: '#f8fafc',
    padding: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  sourcesHeader: {
    color: colors.brandRoyal,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  sourceItem: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  sevTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  sevTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  deptTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deptTagText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  actionButton: {
    marginTop: spacing.sm + 2,
    backgroundColor: colors.brandRed,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    ...shadows.accent,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  timestamp: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  timestampBot: {
    color: colors.textMuted,
  },
  timestampUser: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
    ...shadows.card,
  },
  textInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.brandNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    backgroundColor: colors.surfaceAlt,
    opacity: 0.6,
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
