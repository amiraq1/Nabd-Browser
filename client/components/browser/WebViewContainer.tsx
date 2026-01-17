import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, StyleSheet, Platform, Animated, Text } from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ProgressBar } from "./ProgressBar";
import { useColors } from "@/hooks/useColors";
import { useBrowser } from "@/context/BrowserContext";
import { useSettings } from "@/context/SettingsContext";
import { historyStorage } from "@/lib/storage";
import {
  createAdBlockScript,
  shouldBlockRequest,
  isWhitelisted,
} from "@/lib/adBlocker";
import type { HistoryItem } from "@/types/browser";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// مكون إشعار الحظر
function BlockNotification({
  visible,
  count,
}: {
  visible: boolean;
  count: number;
}) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // إخفاء بعد 2 ثانية
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -50,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visible, count]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.notification,
        {
          backgroundColor: colors.accent,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Feather name="shield" size={16} color="#FFFFFF" />
      <Text style={styles.notificationText}>
        تم حظر إعلان! ({count} في هذه الجلسة)
      </Text>
    </Animated.View>
  );
}

export function WebViewContainer() {
  const colors = useColors();
  const { settings, incrementBlockCount, blockStats } = useSettings();
  const {
    activeTab,
    activeTabId,
    updateTab,
    webViewRef,
    isIncognitoMode,
    loadHistory,
    setPageContent,
    setSelectedText,
  } = useBrowser();
  const [progress, setProgress] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const notificationCount = useRef(0);

  const handleNavigationStateChange = useCallback(
    async (navState: WebViewNavigation) => {
      if (activeTabId) {
        updateTab(activeTabId, {
          url: navState.url,
          title: navState.title || navState.url,
          canGoBack: navState.canGoBack,
          canGoForward: navState.canGoForward,
          isLoading: navState.loading,
        });

        if (!isIncognitoMode && navState.url && !navState.loading) {
          const historyItem: HistoryItem = {
            id: generateId(),
            url: navState.url,
            title: navState.title || navState.url,
            favicon: null,
            visitedAt: Date.now(),
          };
          await historyStorage.add(historyItem);
          await loadHistory();
        }
      }
    },
    [activeTabId, updateTab, isIncognitoMode, loadHistory]
  );

  const handleLoadProgress = useCallback(
    ({ nativeEvent }: { nativeEvent: { progress: number } }) => {
      setProgress(nativeEvent.progress);
    },
    []
  );

  // معالجة الرسائل من WebView (بما فيها إشعارات الحظر)
  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        // 1. التعامل مع النص المحدد
        if (data.type === "selection") {
          setSelectedText(data.text);
        }

        // 2. التعامل مع محتوى الصفحة الكامل (للذكاء الاصطناعي)
        if (data.type === "pageContent") {
          setPageContent(data.content);
        }

        // 3. التعامل مع حظر الإعلانات
        if (data.type === "adBlocked" || data.type === "popupBlocked") {
          // تحديث العداد
          incrementBlockCount();
          notificationCount.current = blockStats.sessionBlocked + 1;

          // عرض الإشعار إذا كان مفعلاً
          if (settings.showBlockNotifications) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowNotification(false);
            setTimeout(() => setShowNotification(true), 50);
          }
        }
      } catch {
        // تجاهل الأخطاء
      }
    },
    [
      setSelectedText,
      setPageContent,
      incrementBlockCount,
      settings.showBlockNotifications,
      blockStats.sessionBlocked,
    ]
  );

  // التحقق من الطلبات قبل تحميلها
  const handleShouldStartLoad = useCallback(
    (event: { url: string }) => {
      // تجاوز الحظر للمواقع في القائمة البيضاء
      if (activeTab?.url && isWhitelisted(activeTab.url)) {
        return true;
      }

      if (settings.adBlockEnabled) {
        const result = shouldBlockRequest(event.url, activeTab?.url);
        if (result.blocked) {
          // تحديث العداد
          incrementBlockCount();
          notificationCount.current = blockStats.sessionBlocked + 1;

          // عرض الإشعار إذا كان مفعلاً
          if (settings.showBlockNotifications) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowNotification(false);
            setTimeout(() => setShowNotification(true), 50);
          }

          return false;
        }
      }
      return true;
    },
    [
      settings.adBlockEnabled,
      settings.showBlockNotifications,
      activeTab?.url,
      incrementBlockCount,
      blockStats.sessionBlocked,
    ]
  );

  if (!activeTab) {
    return (
      <View
        style={[styles.container, { backgroundColor: colors.backgroundRoot }]}
      />
    );
  }

  const backgroundColor = isIncognitoMode
    ? colors.incognitoBackground
    : colors.backgroundRoot;

  // السكريبت المحقون
  const injectedJS = `
    (function() {
      // 1. استخراج محتوى الصفحة تلقائياً عند التحميل (للمشغل الصوتي و AI)
      function extractPageContent() {
        const content = document.body.innerText;
        if (content && content.length > 100) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'pageContent',
            content: content.slice(0, 50000)
          }));
        }
      }
      
      // استخراج عند التحميل
      if (document.readyState === 'complete') {
        setTimeout(extractPageContent, 1000);
      } else {
        window.addEventListener('load', function() {
          setTimeout(extractPageContent, 1000);
        });
      }
      
      // 2. مراقبة تحديد النص
      document.addEventListener('selectionchange', function() {
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'selection',
            text: selection.toString()
          }));
        }
      });
    })();
    ${settings.adBlockEnabled && !isWhitelisted(activeTab.url) ? createAdBlockScript() : ""}
    true;
  `;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* إشعار الحظر */}
      <BlockNotification
        visible={showNotification}
        count={notificationCount.current}
      />

      <ProgressBar isLoading={activeTab.isLoading} progress={progress} />

      {Platform.OS === "web" ? (
        <View style={styles.webFallback}>
          <iframe
            src={activeTab.url}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            title="Browser"
          />
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: activeTab.url }}
          style={styles.webview}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadProgress={handleLoadProgress}
          onMessage={handleMessage}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          incognito={isIncognitoMode}
          javaScriptEnabled
          domStorageEnabled={!isIncognitoMode}
          startInLoadingState
          allowsBackForwardNavigationGestures
          sharedCookiesEnabled={!isIncognitoMode}
          thirdPartyCookiesEnabled={!isIncognitoMode}
          cacheEnabled={!isIncognitoMode && !settings.dataSaverEnabled}
          injectedJavaScript={injectedJS}
          mediaPlaybackRequiresUserAction={settings.dataSaverEnabled}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  webFallback: {
    flex: 1,
    overflow: "hidden",
  },
  notification: {
    position: "absolute",
    top: 8,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    zIndex: 1000,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  notificationText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
