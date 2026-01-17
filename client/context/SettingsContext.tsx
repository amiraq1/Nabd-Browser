import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  setWhitelist,
  getWhitelist,
  addToWhitelist,
  removeFromWhitelist,
  getBlockStats,
  loadStats,
  resetSessionStats,
} from "@/lib/adBlocker";

interface Settings {
  adBlockEnabled: boolean;
  dataSaverEnabled: boolean;
  searchEngine: "google" | "duckduckgo" | "bing";
  homePage: string;
  showBlockNotifications: boolean;
}

interface BlockStats {
  totalBlocked: number;
  sessionBlocked: number;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  // القائمة البيضاء
  whitelist: string[];
  addSiteToWhitelist: (domain: string) => Promise<void>;
  removeSiteFromWhitelist: (domain: string) => Promise<void>;
  // إحصائيات الحظر
  blockStats: BlockStats;
  incrementBlockCount: () => void;
  resetStats: () => Promise<void>;
}

const defaultSettings: Settings = {
  adBlockEnabled: true,
  dataSaverEnabled: false,
  searchEngine: "google",
  homePage: "https://www.google.com",
  showBlockNotifications: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

const SETTINGS_STORAGE_KEY = "@nabdh_settings";
const WHITELIST_STORAGE_KEY = "@nabdh_whitelist";
const BLOCK_STATS_STORAGE_KEY = "@nabdh_block_stats";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [whitelistState, setWhitelistState] = useState<string[]>([]);
  const [blockStatsState, setBlockStatsState] = useState<BlockStats>({
    totalBlocked: 0,
    sessionBlocked: 0,
  });

  // تحميل الإعدادات والقائمة البيضاء والإحصائيات
  useEffect(() => {
    const loadAll = async () => {
      try {
        // تحميل الإعدادات
        const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (storedSettings) {
          const parsed = JSON.parse(storedSettings);
          setSettings({ ...defaultSettings, ...parsed });
        }

        // تحميل القائمة البيضاء
        const storedWhitelist = await AsyncStorage.getItem(
          WHITELIST_STORAGE_KEY
        );
        if (storedWhitelist) {
          const parsed = JSON.parse(storedWhitelist);
          setWhitelistState(parsed);
          setWhitelist(parsed); // تحديث الوحدة
        }

        // تحميل الإحصائيات
        const storedStats = await AsyncStorage.getItem(BLOCK_STATS_STORAGE_KEY);
        if (storedStats) {
          const parsed = JSON.parse(storedStats);
          setBlockStatsState({
            totalBlocked: parsed.totalBlocked || 0,
            sessionBlocked: 0, // نبدأ الجلسة من صفر
          });
          loadStats({ totalBlocked: parsed.totalBlocked || 0 });
        }
      } catch (e) {
        console.error("[Settings] Load error:", e);
      }
    };

    loadAll();
  }, []);

  // تحديث الإعدادات
  const updateSettings = useCallback(
    async (updates: Partial<Settings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      await AsyncStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(newSettings)
      );
    },
    [settings]
  );

  // إضافة موقع للقائمة البيضاء
  const addSiteToWhitelist = useCallback(
    async (domain: string) => {
      if (addToWhitelist(domain)) {
        const newList = getWhitelist();
        setWhitelistState(newList);
        await AsyncStorage.setItem(
          WHITELIST_STORAGE_KEY,
          JSON.stringify(newList)
        );
      }
    },
    []
  );

  // إزالة موقع من القائمة البيضاء
  const removeSiteFromWhitelist = useCallback(
    async (domain: string) => {
      if (removeFromWhitelist(domain)) {
        const newList = getWhitelist();
        setWhitelistState(newList);
        await AsyncStorage.setItem(
          WHITELIST_STORAGE_KEY,
          JSON.stringify(newList)
        );
      }
    },
    []
  );

  // زيادة عداد الحظر
  const incrementBlockCount = useCallback(() => {
    setBlockStatsState((prev) => {
      const newStats = {
        totalBlocked: prev.totalBlocked + 1,
        sessionBlocked: prev.sessionBlocked + 1,
      };
      // حفظ الإحصائيات بشكل غير متزامن
      AsyncStorage.setItem(
        BLOCK_STATS_STORAGE_KEY,
        JSON.stringify({ totalBlocked: newStats.totalBlocked })
      );
      return newStats;
    });
  }, []);

  // إعادة تعيين الإحصائيات
  const resetStats = useCallback(async () => {
    setBlockStatsState({ totalBlocked: 0, sessionBlocked: 0 });
    resetSessionStats();
    await AsyncStorage.setItem(
      BLOCK_STATS_STORAGE_KEY,
      JSON.stringify({ totalBlocked: 0 })
    );
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        whitelist: whitelistState,
        addSiteToWhitelist,
        removeSiteFromWhitelist,
        blockStats: blockStatsState,
        incrementBlockCount,
        resetStats,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
