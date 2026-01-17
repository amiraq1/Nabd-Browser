export interface BrowserTab {
  id: string;
  url: string;
  title: string;
  favicon: string | null;
  isIncognito: boolean;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  favicon: string | null;
  createdAt: number;
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  favicon: string | null;
  visitedAt: number;
}

export interface DownloadItem {
  id: string;
  filename: string;
  url: string;
  fileSize: number;
  downloadedAt: number;
  mimeType: string;
}

export type AIAction = "summarize" | "explain" | "ask";

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}
