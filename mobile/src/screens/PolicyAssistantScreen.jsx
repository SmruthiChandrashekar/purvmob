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
import { colors, spacing, radius } from '../theme';
import Header from '../components/Header';
import { sendChatMessage } from '../services/api';

const SUGGESTED_PROMPTS = [
  'What is the POSH policy?',
  'Can I report a grievance anonymously?',
  'What is the standard resolution timeline?',
  'Who investigates high severity complaints?',
];

export default function PolicyAssistantScreen({ onNavigateToLodge }) {
  const [messages, setMessages] = useState([
    {
      id: 'greeting',
      isBot: true,
      text: 'Hello! I am the Puravankara Policy & Grievance AI Assistant. You can ask me questions about internal policies, POSH, HR guidelines, or get immediate help logging a concern.',
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
      let botText = data.response || "I couldn't locate specific policy information on that.";
      
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
          text: `⚠️ Unable to connect to backend service. Check server connection in Settings.\n(${err.message})`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'critical':
      case 'high':
        return colors.danger;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.success;
      default:
        return colors.primary;
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
        subtitle="RAG-Powered HR & Compliance Intelligence"
      />

      {/* Suggested prompts carousel */}
      <View style={styles.promptBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptScroll}>
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.promptChip}
              onPress={() => handleSend(prompt)}
              activeOpacity={0.7}
            >
              <Text style={styles.promptText}>💬 {prompt}</Text>
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
              <Text style={[styles.bubbleText, item.isBot ? styles.botText : styles.userText]}>
                {item.text}
              </Text>

              {/* Citations if available */}
              {item.sources && item.sources.length > 0 && (
                <View style={styles.sourcesBox}>
                  <Text style={styles.sourcesHeader}>📑 Cited Policies:</Text>
                  {item.sources.map((src, sIdx) => (
                    <Text key={sIdx} style={styles.sourceItem}>
                      • {src.source} {src.page ? `(p. ${src.page})` : ''}
                    </Text>
                  ))}
                </View>
              )}

              {/* Severity & Routing Tag */}
              {item.severity && (
                <View style={styles.metaRow}>
                  <View style={[styles.sevTag, { borderColor: getSeverityColor(item.severity) }]}>
                    <Text style={[styles.sevTagText, { color: getSeverityColor(item.severity) }]}>
                      Severity: {item.severity.toUpperCase()}
                    </Text>
                  </View>
                  {item.department ? (
                    <View style={styles.deptTag}>
                      <Text style={styles.deptTagText}>Dept: {item.department}</Text>
                    </View>
                  ) : null}
                </View>
              )}

              {/* Action Button: Lodge Grievance directly from chat */}
              {(item.trigger_form || item.severity === 'high' || item.severity === 'critical') && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onNavigateToLodge?.({
                    description: item.text,
                    severity: item.severity,
                    department: item.department,
                  })}
                >
                  <Text style={styles.actionButtonText}>📋 Lodge Formal Grievance</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </View>
          </View>
        ))}

        {isLoading && (
          <View style={[styles.messageRow, styles.botRow]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>🤖</Text>
            </View>
            <View style={[styles.bubble, styles.botBubble, styles.loadingBubble]}>
              <ActivityIndicator color={colors.accent} size="small" />
              <Text style={styles.loadingText}>Searching compliance documents...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask a policy question or describe an issue..."
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
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  promptText: {
    color: colors.textSecondary,
    fontSize: 12,
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
  },
  botBubble: {
    backgroundColor: colors.botBubble,
    borderTopLeftRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userBubble: {
    backgroundColor: colors.userBubble,
    borderTopRightRadius: radius.xs,
  },
  errorBubble: {
    borderColor: colors.danger,
    backgroundColor: '#2D1515',
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 21,
  },
  botText: {
    color: colors.text,
  },
  userText: {
    color: '#FFFFFF',
  },
  sourcesBox: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sourcesHeader: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  sourceItem: {
    color: colors.textMuted,
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
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  sevTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  deptTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  deptTagText: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  actionButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.accent,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 12,
  },
  timestamp: {
    color: colors.textMuted,
    fontSize: 9,
    alignSelf: 'flex-end',
    marginTop: 4,
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
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    backgroundColor: colors.surface,
    opacity: 0.5,
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
