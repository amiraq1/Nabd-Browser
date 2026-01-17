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
import { YOUTUBE_SCRIPT } from "@/lib/youtube";

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

const AD_BLOCK_SCRIPT = createAdBlockScript(); // تجهيز سكريبت الحظر

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
    // 👇 إضافة الدوال المهمة لاستقبال البيانات
    setSelectedText,
    setPageContent,
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
    [activeTabId, updateTab, isIncognitoMode, loadHistory],
  );

  const handleLoadProgress = useCallback(
    ({ nativeEvent }: { nativeEvent: { progress: number } }) => {
      setProgress(nativeEvent.progress);
    },
    [],
  );

  // 👇 تحديث دالة معالجة الرسائل القادمة من الموقع
  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        // 1. حالة تحديد نص (Selection)
        if (data.type === "selection") {
          setSelectedText(data.text);
        }

        // 2. حالة استقبال محتوى الصفحة (Page Content)
        if (data.type === "pageContent") {
          setPageContent(data.content);
        }

        // 3. التعامل مع حظر الإعلانات (موجود سابقاً)
        if (data.type === "adBlocked" || data.type === "popupBlocked") {
          incrementBlockCount();
          notificationCount.current = blockStats.sessionBlocked + 1;
          if (settings.showBlockNotifications) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowNotification(false);
            setTimeout(() => setShowNotification(true), 50);
          }
        }

        // 4. رسائل التنبيه (Toasts)
        if (data.type === "toast") {
          // يمكن إضافة ToastAndroid.show هنا إذا أردت
        }
      } catch (e) {
        // تجاهل الأخطاء غير المهمة
      }
    },
    [
      setSelectedText,
      setPageContent,
      incrementBlockCount,
      settings.showBlockNotifications,
      blockStats.sessionBlocked,
    ],
  );

  const handleShouldStartLoad = useCallback(
    (event: { url: string }) => {
      // 1. منع فتح التطبيقات الخارجية
      const isHttp =
        event.url.startsWith("http://") || event.url.startsWith("https://");
      const isAbout = event.url.startsWith("about:");

      if (!isHttp && !isAbout) {
        // يمكن إضافة استثناءات هنا مثل mailto: أو tel: إذا رغب المستخدم
        // حالياً نمنع كل شيء خارجي
        return false;
      }

      // 2. القائمة البيضاء
      if (activeTab?.url && isWhitelisted(activeTab.url)) {
        return true;
      }

      // 3. مانع الإعلانات
      if (settings.adBlockEnabled) {
        const result = shouldBlockRequest(event.url, activeTab?.url);
        if (result.blocked) {
          incrementBlockCount();
          notificationCount.current = blockStats.sessionBlocked + 1;

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
    ],
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

  // 👇 الكود المحقون (Injected JavaScript)
  // هذا الكود يستمع لأي تغيير في التحديد داخل الصفحة ويرسله للتطبيق
  const injectedJS = `
    (function() {
      // إرسال النص المحدد عند التغيير
      document.addEventListener('selectionchange', function() {
        const selection = window.getSelection();
        const text = selection ? selection.toString().trim() : '';
        
        // نرسل الرسالة فقط إذا كان هناك نص محدد لتخفيف الضغط
        if (text.length > 0) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'selection',
                text: text
            }));
        } else {
             // إرسال نص فارغ عند إلغاء التحديد
             window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'selection',
                text: ''
            }));
        }
      });

      // إرسال محتوى الصفحة عند التحميل (لأجل القارئ الصوتي والتلخيص)
      setTimeout(function() {
          const content = document.body.innerText;
          if(content && content.length > 50) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'pageContent',
                content: content.substring(0, 100000) // حد أقصى للحجم
            }));
          }
      }, 1500);

    })();
    ${settings.adBlockEnabled && !isWhitelisted(activeTab.url) ? AD_BLOCK_SCRIPT : ""}
    ${settings.adBlockEnabled ? YOUTUBE_SCRIPT : ""} 
    true;
  `;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <BlockNotification
        visible={showNotification}
        count={notificationCount.current}
      />
      <ProgressBar isLoading={activeTab.isLoading} progress={progress} />
      {Platform.OS === "web" ? (
        <View style={styles.webFallback}>
          <iframe
            src={activeTab.url}
            style={{ width: "100%", height: "100%", border: "none" }}
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
          // 🔥 إصلاح مشكلة تسجيل دخول جوجل: استخدام هوية Chrome رسمية
          userAgent="Mozilla/5.0 (Linux; Android 10; Android SDK built for x86) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
          // إعدادات إضافية للتوافق
          setSupportMultipleWindows={false} // تجنب فتح نوافذ جديدة تفصل الجلسة
          originWhitelist={["*"]}
          allowsInlineMediaPlayback={true}
          // تفعيل القوائم المنسدلة وتحديد النصوص بشكل أفضل
          overScrollMode="content"
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
