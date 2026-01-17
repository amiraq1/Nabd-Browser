import React, { useState, useCallback } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";
import { ProgressBar } from "./ProgressBar";
import { Colors } from "@/constants/theme";
import { useBrowser } from "@/context/BrowserContext";
import { historyStorage } from "@/lib/storage";
import type { HistoryItem } from "@/types/browser";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function WebViewContainer() {
  const {
    activeTab,
    activeTabId,
    updateTab,
    webViewRef,
    isIncognitoMode,
    loadHistory,
  } = useBrowser();
  const [progress, setProgress] = useState(0);

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

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === "pageContent") {
          // Page content extracted - this is handled by BrowserContext
        }
      } catch {
        // Ignore parsing errors
      }
    },
    []
  );

  if (!activeTab) {
    return (
      <View
        style={[styles.container, { backgroundColor: Colors.dark.backgroundRoot }]}
      />
    );
  }

  const backgroundColor = isIncognitoMode
    ? Colors.dark.incognitoBackground
    : Colors.dark.backgroundRoot;

  return (
    <View style={[styles.container, { backgroundColor }]}>
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
          incognito={isIncognitoMode}
          javaScriptEnabled
          domStorageEnabled={!isIncognitoMode}
          startInLoadingState
          allowsBackForwardNavigationGestures
          sharedCookiesEnabled={!isIncognitoMode}
          thirdPartyCookiesEnabled={!isIncognitoMode}
          injectedJavaScript={`
            (function() {
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
            true;
          `}
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
});
