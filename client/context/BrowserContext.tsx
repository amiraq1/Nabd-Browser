import React, { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from "react";
import { WebView } from "react-native-webview";
import type { BrowserTab, Bookmark, HistoryItem } from "@/types/browser";
import { bookmarkStorage, historyStorage } from "@/lib/storage";

interface BrowserContextType {
  tabs: BrowserTab[];
  activeTabId: string | null;
  activeTab: BrowserTab | null;
  isIncognitoMode: boolean;
  bookmarks: Bookmark[];
  history: HistoryItem[];
  pageContent: string;
  selectedText: string;
  webViewRef: React.RefObject<WebView>;
  createTab: (isIncognito?: boolean) => void;
  closeTab: (id: string) => void;
  switchTab: (id: string) => void;
  navigateTo: (url: string) => void;
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
  goHome: () => void;
  updateTab: (id: string, updates: Partial<BrowserTab>) => void;
  addBookmark: () => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  isCurrentPageBookmarked: () => boolean;
  clearHistory: () => Promise<void>;
  loadBookmarks: () => Promise<void>;
  loadHistory: () => Promise<void>;
  extractPageContent: () => void;
  setSelectedText: (text: string) => void;
}

const BrowserContext = createContext<BrowserContextType | undefined>(undefined);

const HOME_URL = "https://www.google.com";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function formatUrl(input: string): string {
  const trimmed = input.trim();
  if (isValidUrl(trimmed)) {
    return trimmed;
  }
  if (trimmed.includes(".") && !trimmed.includes(" ")) {
    return `https://${trimmed}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
}

export function BrowserProvider({ children }: { children: ReactNode }) {
  const webViewRef = useRef<WebView>(null);
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: generateId(),
      url: HOME_URL,
      title: "الصفحة الرئيسية",
      favicon: null,
      isIncognito: false,
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [pageContent, setPageContent] = useState<string>("");
  const [selectedText, setSelectedText] = useState<string>("");

  const activeTab = tabs.find((t) => t.id === activeTabId) || null;
  const isIncognitoMode = activeTab?.isIncognito || false;

  const loadBookmarks = useCallback(async () => {
    const data = await bookmarkStorage.getAll();
    setBookmarks(data);
  }, []);

  const loadHistory = useCallback(async () => {
    const data = await historyStorage.getAll();
    setHistory(data);
  }, []);

  useEffect(() => {
    loadBookmarks();
    loadHistory();
  }, [loadBookmarks, loadHistory]);

  const createTab = useCallback((isIncognito = false) => {
    const newTab: BrowserTab = {
      id: generateId(),
      url: HOME_URL,
      title: isIncognito ? "تصفح خفي" : "تبويب جديد",
      favicon: null,
      isIncognito,
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, []);

  const closeTab = useCallback((id: string) => {
    setTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      if (filtered.length === 0) {
        const newTab: BrowserTab = {
          id: generateId(),
          url: HOME_URL,
          title: "الصفحة الرئيسية",
          favicon: null,
          isIncognito: false,
          isLoading: false,
          canGoBack: false,
          canGoForward: false,
        };
        setActiveTabId(newTab.id);
        return [newTab];
      }
      return filtered;
    });
    setActiveTabId((currentId) => {
      if (currentId === id) {
        const currentTabs = tabs.filter((t) => t.id !== id);
        return currentTabs.length > 0 ? currentTabs[0].id : "";
      }
      return currentId;
    });
  }, [tabs]);

  const switchTab = useCallback((id: string) => {
    setActiveTabId(id);
    setPageContent("");
    setSelectedText("");
  }, []);

  const updateTab = useCallback((id: string, updates: Partial<BrowserTab>) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === id ? { ...tab, ...updates } : tab))
    );
  }, []);

  const navigateTo = useCallback((input: string) => {
    const url = formatUrl(input);
    if (activeTabId) {
      updateTab(activeTabId, { url, isLoading: true });
    }
  }, [activeTabId, updateTab]);

  const goBack = useCallback(() => {
    webViewRef.current?.goBack();
  }, []);

  const goForward = useCallback(() => {
    webViewRef.current?.goForward();
  }, []);

  const reload = useCallback(() => {
    webViewRef.current?.reload();
  }, []);

  const goHome = useCallback(() => {
    navigateTo(HOME_URL);
  }, [navigateTo]);

  const addBookmark = useCallback(async () => {
    if (!activeTab || activeTab.isIncognito) return;
    const bookmark: Bookmark = {
      id: generateId(),
      url: activeTab.url,
      title: activeTab.title,
      favicon: activeTab.favicon,
      createdAt: Date.now(),
    };
    await bookmarkStorage.add(bookmark);
    await loadBookmarks();
  }, [activeTab, loadBookmarks]);

  const removeBookmark = useCallback(async (id: string) => {
    await bookmarkStorage.remove(id);
    await loadBookmarks();
  }, [loadBookmarks]);

  const isCurrentPageBookmarked = useCallback(() => {
    if (!activeTab) return false;
    return bookmarks.some((b) => b.url === activeTab.url);
  }, [activeTab, bookmarks]);

  const clearHistory = useCallback(async () => {
    await historyStorage.clear();
    setHistory([]);
  }, []);

  const extractPageContent = useCallback(() => {
    webViewRef.current?.injectJavaScript(`
      (function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'pageContent',
          content: document.body.innerText
        }));
      })();
      true;
    `);
  }, []);

  return (
    <BrowserContext.Provider
      value={{
        tabs,
        activeTabId,
        activeTab,
        isIncognitoMode,
        bookmarks,
        history,
        pageContent,
        selectedText,
        webViewRef,
        createTab,
        closeTab,
        switchTab,
        navigateTo,
        goBack,
        goForward,
        reload,
        goHome,
        updateTab,
        addBookmark,
        removeBookmark,
        isCurrentPageBookmarked,
        clearHistory,
        loadBookmarks,
        loadHistory,
        extractPageContent,
        setSelectedText,
      }}
    >
      {children}
    </BrowserContext.Provider>
  );
}

export function useBrowser() {
  const context = useContext(BrowserContext);
  if (!context) {
    throw new Error("useBrowser must be used within a BrowserProvider");
  }
  return context;
}
