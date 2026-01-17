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
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useBrowser } from "@/context/BrowserContext";
import { apiRequest } from "@/lib/query-client";
import type { AIMessage, AIAction } from "@/types/browser";

interface AIPanelSheetProps {
  onClose: () => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export const AIPanelSheet = forwardRef<BottomSheet, AIPanelSheetProps>(
  function AIPanelSheet({ onClose }, ref) {
    const insets = useSafeAreaInsets();
    const { extractPageContent, selectedText, webViewRef } = useBrowser();
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [question, setQuestion] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [pageContent, setPageContent] = useState("");

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
      []
    );

    const getPageContent = useCallback((): Promise<string> => {
      return new Promise((resolve) => {
        webViewRef.current?.injectJavaScript(`
          (function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'pageContent',
              content: document.body.innerText
            }));
          })();
          true;
        `);
        setTimeout(() => resolve(""), 500);
      });
    }, [webViewRef]);

    const handleAction = async (action: AIAction) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsLoading(true);

      try {
        let content = "";
        webViewRef.current?.injectJavaScript(`
          (function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'pageContent',
              content: document.body.innerText.slice(0, 50000)
            }));
          })();
          true;
        `);
        
        await new Promise((resolve) => setTimeout(resolve, 300));

        let response;
        let userMessage = "";
        let assistantMessage = "";

        if (action === "summarize") {
          userMessage = "تلخيص الصفحة الحالية";
          response = await apiRequest("POST", "/api/ai/summarize", {
            content: "الرجاء تلخيص هذه الصفحة",
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
                content: "الرجاء تحديد نص أولاً لشرحه",
                timestamp: Date.now(),
              },
            ]);
            setIsLoading(false);
            return;
          }
          userMessage = `شرح: "${selectedText}"`;
          response = await apiRequest("POST", "/api/ai/explain", {
            selectedText,
          });
          const data = await response.json();
          assistantMessage = data.explanation || "لم أتمكن من شرح النص";
        } else if (action === "ask") {
          if (!question.trim()) return;
          userMessage = question;
          response = await apiRequest("POST", "/api/ai/ask", {
            question,
            pageContent: "",
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
            content: "حدث خطأ. الرجاء المحاولة مرة أخرى.",
            timestamp: Date.now(),
          },
        ]);
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
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.indicator}
        onClose={onClose}
        keyboardBehavior="extend"
      >
        <BottomSheetView
          style={[styles.content, { paddingBottom: insets.bottom + Spacing.lg }]}
        >
          <View style={styles.header}>
            <View style={styles.aiLogo}>
              <Feather name="cpu" size={20} color={Colors.dark.accent} />
            </View>
            <ThemedText type="h3" style={styles.title}>
              AI
            </ThemedText>
            <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
              <Feather name="x" size={24} color={Colors.dark.text} />
            </Pressable>
          </View>

          {messages.length === 0 ? (
            <View style={styles.actionButtons}>
              <Pressable
                onPress={() => handleAction("summarize")}
                style={styles.actionButton}
                disabled={isLoading}
              >
                <Feather name="file-text" size={24} color={Colors.dark.accent} />
                <ThemedText style={styles.actionText}>تلخيص الصفحة</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => handleAction("explain")}
                style={[
                  styles.actionButton,
                  !selectedText && styles.actionButtonDisabled,
                ]}
                disabled={isLoading || !selectedText}
              >
                <Feather
                  name="help-circle"
                  size={24}
                  color={selectedText ? Colors.dark.accent : Colors.dark.textSecondary}
                />
                <ThemedText
                  style={[
                    styles.actionText,
                    !selectedText && { color: Colors.dark.textSecondary },
                  ]}
                >
                  شرح النص المحدد
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => handleAction("ask")}
                style={styles.actionButton}
                disabled={isLoading}
              >
                <Feather name="message-circle" size={24} color={Colors.dark.accent} />
                <ThemedText style={styles.actionText}>سؤال عن الصفحة</ThemedText>
              </Pressable>
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
                      ? styles.userMessage
                      : styles.assistantMessage,
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.messageText,
                      msg.role === "user" && { color: Colors.dark.buttonText },
                    ]}
                  >
                    {msg.content}
                  </ThemedText>
                </Animated.View>
              ))}
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={Colors.dark.accent} size="small" />
                  <ThemedText style={styles.loadingText}>جاري التفكير...</ThemedText>
                </View>
              ) : null}
            </ScrollView>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={question}
              onChangeText={setQuestion}
              placeholder="اسأل عن أي شيء..."
              placeholderTextColor={Colors.dark.textSecondary}
              onSubmitEditing={handleSendQuestion}
              returnKeyType="send"
              multiline
            />
            <Pressable
              onPress={handleSendQuestion}
              style={[
                styles.sendButton,
                !question.trim() && styles.sendButtonDisabled,
              ]}
              disabled={!question.trim() || isLoading}
            >
              <Feather
                name="send"
                size={20}
                color={question.trim() ? Colors.dark.buttonText : Colors.dark.textSecondary}
              />
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  background: {
    backgroundColor: Colors.dark.backgroundRoot,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  indicator: {
    backgroundColor: Colors.dark.textSecondary,
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
    backgroundColor: "rgba(0, 217, 255, 0.15)",
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
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.dark.backgroundDefault,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.dark.text,
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
    backgroundColor: Colors.dark.accent,
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: Colors.dark.backgroundSecondary,
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
    color: Colors.dark.textSecondary,
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
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.dark.text,
    fontSize: 15,
    maxHeight: 100,
    textAlign: "right",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
});
