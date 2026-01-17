import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Bookmark, HistoryItem, DownloadItem } from "@/types/browser";

const BOOKMARKS_KEY = "@nabdh_bookmarks";
const HISTORY_KEY = "@nabdh_history";
const DOWNLOADS_KEY = "@nabdh_downloads";

export const bookmarkStorage = {
  async getAll(): Promise<Bookmark[]> {
    try {
      const data = await AsyncStorage.getItem(BOOKMARKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async add(bookmark: Bookmark): Promise<void> {
    const bookmarks = await this.getAll();
    const exists = bookmarks.some((b) => b.url === bookmark.url);
    if (!exists) {
      bookmarks.unshift(bookmark);
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    }
  },

  async remove(id: string): Promise<void> {
    const bookmarks = await this.getAll();
    const filtered = bookmarks.filter((b) => b.id !== id);
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered));
  },

  async isBookmarked(url: string): Promise<boolean> {
    const bookmarks = await this.getAll();
    return bookmarks.some((b) => b.url === url);
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(BOOKMARKS_KEY);
  },
};

export const historyStorage = {
  async getAll(): Promise<HistoryItem[]> {
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async add(item: HistoryItem): Promise<void> {
    const history = await this.getAll();
    const existingIndex = history.findIndex((h) => h.url === item.url);
    if (existingIndex !== -1) {
      history.splice(existingIndex, 1);
    }
    history.unshift(item);
    if (history.length > 500) {
      history.pop();
    }
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(HISTORY_KEY);
  },
};

export const downloadStorage = {
  async getAll(): Promise<DownloadItem[]> {
    try {
      const data = await AsyncStorage.getItem(DOWNLOADS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async add(item: DownloadItem): Promise<void> {
    const downloads = await this.getAll();
    downloads.unshift(item);
    await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads));
  },

  async remove(id: string): Promise<void> {
    const downloads = await this.getAll();
    const filtered = downloads.filter((d) => d.id !== id);
    await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(filtered));
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(DOWNLOADS_KEY);
  },
};
