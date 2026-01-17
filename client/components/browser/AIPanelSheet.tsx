import React, { useCallback, useMemo, forwardRef, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useColors } from "@/hooks/useColors";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useBrowser } from "@/context/BrowserContext";
import { apiRequest } from "@/lib/query-client";
import type { AIMessage, AIAction } from "@/types/browser";
import { ScaleButton } from "@/components/ui/ScaleButton"; // ✅ Import ScaleButton

interface AIPanelSheetProps {
  onClose: () => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export const AIPanelSheet = forwardRef<BottomSheet, AIPanelSheetProps>(
  function AIPanelSheet({ onClose }, ref) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { extractPageContent, selectedText, webViewRef, pageContent } =
      useBrowser();
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [question, setQuestion] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const snapPoints = useMemo(() => ["60%", "90%"], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.7}
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
              content:
                "عذراً، لم يتم تحميل محتوى الصفحة بعد. يرجى الانتظار قليلاً.",
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
                content:
                  "الرجاء تحديد نص أولاً لشرحه (اضغط مطولاً على أي كلمة في الصفحة)",
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
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: "assistant",
            content:
              "حدث خطأ في الاتصال بالذكاء الاصطناعي. الرجاء التحقق من الإنترنت.",
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
          <View style={styles.header}>
            <View
              style={[styles.aiLogo, { backgroundColor: `${colors.accent}20` }]}
            >
              <Feather name="cpu" size={20} color={colors.accent} />
            </View>
            <ThemedText
              type="h3"
              style={[styles.title, { color: colors.text }]}
            >
              AI
            </ThemedText>
            <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
              <Feather name="x" size={24} color={colors.text} />
            </Pressable>
          </View>

          {messages.length === 0 ? (
            <View style={styles.actionButtons}>
              {/* ✅ استخدام ScaleButton */}
              <ScaleButton
                onPress={() => handleAction("summarize")}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: colors.backgroundDefault,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Feather name="file-text" size={24} color={colors.accent} />
                <ThemedText style={[styles.actionText, { color: colors.text }]}>
                  تلخيص الصفحة
                </ThemedText>
              </ScaleButton>

              <View style={styles.actionButtonsRow}>
                <ScaleButton
                  onPress={() => selectedText && handleAction("explain")}
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: colors.backgroundDefault,
                      borderColor: colors.border,
                      flex: 1,
                    },
                    !selectedText && styles.actionButtonDisabled,
                  ]}
                >
                  <Feather
                    name="help-circle"
                    size={24}
                    color={selectedText ? colors.accent : colors.textSecondary}
                  />
                  <ThemedText
                    style={[
                      styles.actionText,
                      {
                        color: selectedText
                          ? colors.text
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    شرح
                  </ThemedText>
                </ScaleButton>

                <ScaleButton
                  onPress={() => selectedText && handleAction("translate")}
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: colors.backgroundDefault,
                      borderColor: colors.border,
                      flex: 1,
                    },
                    !selectedText && styles.actionButtonDisabled,
                  ]}
                >
                  <Feather
                    name="globe"
                    size={24}
                    color={selectedText ? colors.accent : colors.textSecondary}
                  />
                  <ThemedText
                    style={[
                      styles.actionText,
                      {
                        color: selectedText
                          ? colors.text
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    ترجمة
                  </ThemedText>
                </ScaleButton>
              </View>

              <ScaleButton
                onPress={() => handleAction("ask")}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: colors.backgroundDefault,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Feather
                  name="message-circle"
                  size={24}
                  color={colors.accent}
                />
                <ThemedText style={[styles.actionText, { color: colors.text }]}>
                  سؤال عن الصفحة
                </ThemedText>
              </ScaleButton>
            </View>
          ) : (
            <ScrollView
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((msg, index) => (
                <Animated.View
                  key={msg.id}
                  entering={FadeInUp.delay(index * 50).duration(200)}
                  style={[
                    styles.messageBubble,
                    msg.role === "user"
                      ? [styles.userMessage, { backgroundColor: colors.accent }]
                      : [
                          styles.assistantMessage,
                          { backgroundColor: colors.backgroundSecondary },
                        ],
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.messageText,
                      {
                        color:
                          msg.role === "user" ? colors.buttonText : colors.text,
                      },
                    ]}
                  >
                    {msg.content}
                  </ThemedText>
                </Animated.View>
              ))}
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={colors.accent} size="small" />
                  <ThemedText
                    style={[
                      styles.loadingText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    جاري التفكير...
                  </ThemedText>
                </View>
              ) : null}
            </ScrollView>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundSecondary,
                  color: colors.text,
                },
              ]}
              value={question}
              onChangeText={setQuestion}
              placeholder="اسأل عن أي شيء..."
              placeholderTextColor={colors.textSecondary}
              onSubmitEditing={handleSendQuestion}
              returnKeyType="send"
              multiline
            />
            {/* استخدام ScaleButton لزر الإرسال أيضاً */}
            <ScaleButton
              onPress={handleSendQuestion}
              style={[
                styles.sendButton,
                {
                  backgroundColor: question.trim()
                    ? colors.accent
                    : colors.backgroundSecondary,
                },
              ]}
              scaleTo={0.8}
            >
              <Feather
                name="send"
                size={20}
                color={
                  question.trim() ? colors.buttonText : colors.textSecondary
                }
              />
            </ScaleButton>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  background: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  indicator: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  aiLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  title: {
    flex: 1,
    textAlign: "left",
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  actionButtons: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingBottom: Spacing.md,
  },
  messageBubble: {
    maxWidth: "85%",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  userMessage: {
    alignSelf: "flex-end",
  },
  assistantMessage: {
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "right",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  loadingText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  input: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 15,
    maxHeight: 100,
    textAlign: "right",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
