import React, { useCallback, useMemo, forwardRef, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Keyboard,
} from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInUp,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import { useColors } from "@/hooks/useColors";
import { Spacing, BorderRadius, Shadows, AnimationConfig } from "@/constants/theme";
import { useBrowser } from "@/context/BrowserContext";
import { apiRequest } from "@/lib/query-client";
import type { AIMessage, AIAction } from "@/types/browser";
import { ScaleButton } from "@/components/ui/ScaleButton";

interface AIPanelSheetProps {
  onClose: () => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ✨ Animated Action Card Component
const ActionCard = ({
  icon,
  label,
  sublabel,
  onPress,
  disabled,
  gradientColors,
  index,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  sublabel?: string;
  onPress: () => void;
  disabled?: boolean;
  gradientColors: string[];
  index: number;
}) => {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.96, AnimationConfig.springBouncy);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, AnimationConfig.spring);
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 80).duration(400).springify()}
      style={animatedStyle}
    >
      <ScaleButton
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.actionCard,
          {
            backgroundColor: colors.backgroundSecondary,
            borderColor: disabled ? colors.border : colors.glassBorder,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <LinearGradient
          colors={disabled ? [colors.backgroundTertiary, colors.backgroundTertiary] : gradientColors as any}
          style={styles.actionIconBg}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Feather
            name={icon}
            size={22}
            color={disabled ? colors.textSecondary : "#FFF"}
          />
        </LinearGradient>
        <View style={styles.actionTextContainer}>
          <ThemedText style={[styles.actionLabel, { color: disabled ? colors.textSecondary : colors.text }]}>
            {label}
          </ThemedText>
          {sublabel && (
            <ThemedText style={[styles.actionSublabel, { color: colors.textSecondary }]}>
              {sublabel}
            </ThemedText>
          )}
        </View>
        <Feather
          name="chevron-left"
          size={18}
          color={disabled ? colors.textSecondary : colors.accent}
        />
      </ScaleButton>
    </Animated.View>
  );
};

// ✨ Message Bubble Component
const MessageBubble = ({
  message,
  index
}: {
  message: AIMessage;
  index: number;
}) => {
  const colors = useColors();
  const isUser = message.role === "user";

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 60).duration(300)}
      style={[
        styles.messageBubble,
        isUser
          ? [styles.userMessage, { backgroundColor: colors.accent }]
          : [styles.assistantMessage, { backgroundColor: colors.backgroundTertiary }],
      ]}
    >
      {!isUser && (
        <View style={[styles.aiAvatar, { backgroundColor: `${colors.accent}20` }]}>
          <Feather name="cpu" size={14} color={colors.accent} />
        </View>
      )}
      <ThemedText
        style={[
          styles.messageText,
          { color: isUser ? "#000" : colors.text },
        ]}
      >
        {message.content}
      </ThemedText>
    </Animated.View>
  );
};

// ✨ Typing Indicator
const TypingIndicator = () => {
  const colors = useColors();
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  React.useEffect(() => {
    const animate = () => {
      dot1.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.3, { duration: 300 })
      );
      setTimeout(() => {
        dot2.value = withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.3, { duration: 300 })
        );
      }, 150);
      setTimeout(() => {
        dot3.value = withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.3, { duration: 300 })
        );
      }, 300);
    };
    const interval = setInterval(animate, 900);
    animate();
    return () => clearInterval(interval);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={[styles.typingContainer, { backgroundColor: colors.backgroundTertiary }]}>
      <View style={[styles.aiAvatar, { backgroundColor: `${colors.accent}20` }]}>
        <Feather name="cpu" size={14} color={colors.accent} />
      </View>
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, { backgroundColor: colors.accent }, dot1Style]} />
        <Animated.View style={[styles.dot, { backgroundColor: colors.accent }, dot2Style]} />
        <Animated.View style={[styles.dot, { backgroundColor: colors.accent }, dot3Style]} />
      </View>
    </View>
  );
};

export const AIPanelSheet = forwardRef<BottomSheet, AIPanelSheetProps>(
  function AIPanelSheet({ onClose }, ref) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { selectedText, pageContent } = useBrowser();
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [question, setQuestion] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const snapPoints = useMemo(() => ["55%", "90%"], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.6}
        />
      ),
      [],
    );

    const handleAction = async (action: AIAction) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsLoading(true);

      try {
        const contentToSend = pageContent || "";
        let response;
        let userMessage = "";
        let assistantMessage = "";

        if (!contentToSend && action !== "ask") {
          setMessages((prev) => [
            ...prev,
            {
              id: generateId(),
              role: "assistant",
              content: "عذراً، لم يتم تحميل محتوى الصفحة بعد. يرجى الانتظار قليلاً.",
              timestamp: Date.now(),
            },
          ]);
          setIsLoading(false);
          return;
        }

        if (action === "summarize") {
          userMessage = "تلخيص الصفحة الحالية";
          response = await apiRequest("POST", "/api/ai/summarize", {
            content: contentToSend,
          });
          const data = await response.json();
          assistantMessage = data.summary || "لم أتمكن من تلخيص الصفحة";
        } else if (action === "explain") {
          if (!selectedText) {
            setMessages((prev) => [
              ...prev,
              {
                id: generateId(),
                role: "assistant",
                content: "الرجاء تحديد نص أولاً لشرحه (اضغط مطولاً على أي كلمة في الصفحة)",
                timestamp: Date.now(),
              },
            ]);
            setIsLoading(false);
            return;
          }
          userMessage = `شرح: "${selectedText}"`;
          response = await apiRequest("POST", "/api/ai/explain", {
            selectedText,
            pageContext: contentToSend,
          });
          const data = await response.json();
          assistantMessage = data.explanation || "لم أتمكن من شرح النص";
        } else if (action === "translate") {
          if (!selectedText) {
            setMessages((prev) => [
              ...prev,
              {
                id: generateId(),
                role: "assistant",
                content: "الرجاء تحديد نص أولاً لترجمته.",
                timestamp: Date.now(),
              },
            ]);
            setIsLoading(false);
            return;
          }
          userMessage = `ترجمة: "${selectedText.slice(0, 50)}..."`;
          response = await apiRequest("POST", "/api/ai/translate", {
            selectedText,
            targetLang: "ar",
          });
          const data = await response.json();
          assistantMessage = data.translation || "عذراً، فشلت الترجمة.";
        } else if (action === "ask") {
          if (!question.trim()) {
            setIsLoading(false);
            return;
          }
          userMessage = question;
          response = await apiRequest("POST", "/api/ai/ask", {
            question,
            pageContent: contentToSend,
          });
          const data = await response.json();
          assistantMessage = data.answer || "لم أتمكن من الإجابة";
          setQuestion("");
          Keyboard.dismiss();
        }

        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: "user",
            content: userMessage,
            timestamp: Date.now(),
          },
          {
            id: generateId(),
            role: "assistant",
            content: assistantMessage,
            timestamp: Date.now(),
          },
        ]);

        // Scroll to bottom
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: "assistant",
            content: "حدث خطأ في الاتصال بالذكاء الاصطناعي. الرجاء التحقق من الإنترنت.",
            timestamp: Date.now(),
          },
        ]);
        console.error("AI Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleSendQuestion = () => {
      if (question.trim()) {
        handleAction("ask");
      }
    };

    const hasSelectedText = !!selectedText;

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={[
          styles.background,
          { backgroundColor: colors.backgroundRoot },
        ]}
        handleIndicatorStyle={[
          styles.indicator,
          { backgroundColor: colors.textSecondary },
        ]}
        onClose={onClose}
        keyboardBehavior="extend"
      >
        <BottomSheetView
          style={[
            styles.content,
            { paddingBottom: insets.bottom + Spacing.lg },
          ]}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={styles.header}
          >
            <LinearGradient
              colors={[colors.accent, "#6366F1"]}
              style={styles.aiLogo}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="cpu" size={20} color="#FFF" />
            </LinearGradient>
            <View style={styles.headerTextContainer}>
              <ThemedText type="h3" style={[styles.title, { color: colors.text }]}>
                مساعد نبض
              </ThemedText>
              <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
                الذكاء الاصطناعي في خدمتك
              </ThemedText>
            </View>
            <ScaleButton onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={22} color={colors.textSecondary} />
            </ScaleButton>
          </Animated.View>

          {/* Content */}
          {messages.length === 0 ? (
            <View style={styles.actionButtons}>
              <ActionCard
                icon="file-text"
                label="تلخيص الصفحة"
                sublabel="احصل على ملخص سريع للمحتوى"
                onPress={() => handleAction("summarize")}
                gradientColors={[colors.accent, "#0891B2"]}
                index={0}
              />
              <ActionCard
                icon="help-circle"
                label="شرح النص المحدد"
                sublabel={hasSelectedText ? `"${selectedText?.slice(0, 30)}..."` : "حدد نصاً أولاً"}
                onPress={() => handleAction("explain")}
                disabled={!hasSelectedText}
                gradientColors={["#8B5CF6", "#6366F1"]}
                index={1}
              />
              <ActionCard
                icon="globe"
                label="ترجمة النص"
                sublabel={hasSelectedText ? "ترجمة للعربية" : "حدد نصاً أولاً"}
                onPress={() => handleAction("translate")}
                disabled={!hasSelectedText}
                gradientColors={["#059669", "#10B981"]}
                index={2}
              />
            </View>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((msg, index) => (
                <MessageBubble key={msg.id} message={msg} index={index} />
              ))}
              {isLoading && <TypingIndicator />}
            </ScrollView>
          )}

          {/* Input */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(300)}
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: question.trim() ? colors.accent : colors.border,
              }
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={question}
              onChangeText={setQuestion}
              placeholder="اسأل عن أي شيء..."
              placeholderTextColor={colors.textSecondary}
              onSubmitEditing={handleSendQuestion}
              returnKeyType="send"
              multiline
              maxLength={500}
            />
            <ScaleButton
              onPress={handleSendQuestion}
              disabled={!question.trim()}
              style={[
                styles.sendButton,
                {
                  backgroundColor: question.trim() ? colors.accent : colors.backgroundTertiary,
                },
              ]}
              scaleTo={0.85}
            >
              <Feather
                name="send"
                size={18}
                color={question.trim() ? "#000" : colors.textSecondary}
              />
            </ScaleButton>
          </Animated.View>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  background: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    ...Shadows.xl,
  },
  indicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  aiLogo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    textAlign: "right",
  },
  subtitle: {
    fontSize: 13,
    textAlign: "right",
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtons: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    ...Shadows.sm,
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.md,
  },
  actionTextContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  actionSublabel: {
    fontSize: 12,
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  messageBubble: {
    maxWidth: "88%",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  userMessage: {
    alignSelf: "flex-end",
    borderBottomLeftRadius: BorderRadius.xs,
  },
  assistantMessage: {
    alignSelf: "flex-start",
    borderBottomRightRadius: BorderRadius.xs,
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  messageText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    textAlign: "right",
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    fontSize: 15,
    maxHeight: 100,
    textAlign: "right",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
