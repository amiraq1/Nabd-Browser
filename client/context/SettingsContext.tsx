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
  resetSessionStats,
} from "@/lib/adBlocker";

// تعريف شكل بيانات الملف الشخصي (للتعبئة التلقائية)
interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

interface Settings {
  adBlockEnabled: boolean;
  dataSaverEnabled: boolean;
  searchEngine: "google" | "duckduckgo" | "bing";
  homePage: string;
  showBlockNotifications: boolean;
  trackersBlocked: number;
  userProfile: UserProfile;
}

interface BlockStats {
  totalBlocked: number;
  sessionBlocked: number;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  // Toggle functions
  toggleAdBlock: () => void;
  toggleDataSaver: () => void;
  incrementBlockedTrackers: () => void;
  // User profile
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  // القائمة البيضاء
  whitelist: string[];
  addSiteToWhitelist: (domain: string) => Promise<void>;
  removeSiteFromWhitelist: (domain: string) => Promise<void>;
  // إحصائيات الحظر
  blockStats: BlockStats;
  incrementBlockCount: () => void;
  resetStats: () => Promise<void>;
}

const defaultUserProfile: UserProfile = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
};

const defaultSettings: Settings = {
  adBlockEnabled: true,
  dataSaverEnabled: false,
  searchEngine: "google",
  homePage: "https://www.google.com",
  showBlockNotifications: true,
  trackersBlocked: 0,
  userProfile: defaultUserProfile,
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

const SETTINGS_STORAGE_KEY = "@nabdh_settings_v2";
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
          WHITELIST_STORAGE_KEY,
        );
        if (storedWhitelist) {
          const parsed = JSON.parse(storedWhitelist);
          setWhitelistState(parsed);
          setWhitelist(parsed);
        }

        // تحميل الإحصائيات
        const storedStats = await AsyncStorage.getItem(BLOCK_STATS_STORAGE_KEY);
        if (storedStats) {
          const parsed = JSON.parse(storedStats);
          setBlockStatsState({
            totalBlocked: parsed.totalBlocked || 0,
            sessionBlocked: 0,
          });
        }
      } catch (e) {
        console.error("[Settings] Load error:", e);
      }
    };

    loadAll();
  }, []);

  // حفظ الإعدادات
  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(newSettings),
      );
    } catch (e) {
      console.error("[Settings] Save error:", e);
    }
  };

  // تحديث الإعدادات
  const updateSettings = useCallback(
    async (updates: Partial<Settings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      await saveSettings(newSettings);
    },
    [settings],
  );

  // Toggle functions
  const toggleAdBlock = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, adBlockEnabled: !prev.adBlockEnabled };
      saveSettings(next);
      return next;
    });
  }, []);

  const toggleDataSaver = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, dataSaverEnabled: !prev.dataSaverEnabled };
      saveSettings(next);
      return next;
    });
  }, []);

  const incrementBlockedTrackers = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, trackersBlocked: prev.trackersBlocked + 1 };
      saveSettings(next);
      return next;
    });
  }, []);

  // تحديث بيانات الملف الشخصي
  const updateUserProfile = useCallback((profile: Partial<UserProfile>) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        userProfile: { ...prev.userProfile, ...profile },
      };
      saveSettings(next);
      return next;
    });
  }, []);

  // إضافة موقع للقائمة البيضاء
  const addSiteToWhitelist = useCallback(async (domain: string) => {
    if (addToWhitelist(domain)) {
      const newList = getWhitelist();
      setWhitelistState(newList);
      await AsyncStorage.setItem(
        WHITELIST_STORAGE_KEY,
        JSON.stringify(newList),
      );
    }
  }, []);

  // إزالة موقع من القائمة البيضاء
  const removeSiteFromWhitelist = useCallback(async (domain: string) => {
    if (removeFromWhitelist(domain)) {
      const newList = getWhitelist();
      setWhitelistState(newList);
      await AsyncStorage.setItem(
        WHITELIST_STORAGE_KEY,
        JSON.stringify(newList),
      );
    }
  }, []);

  // زيادة عداد الحظر
  const incrementBlockCount = useCallback(() => {
    setBlockStatsState((prev) => {
      const newStats = {
        totalBlocked: prev.totalBlocked + 1,
        sessionBlocked: prev.sessionBlocked + 1,
      };
      AsyncStorage.setItem(
        BLOCK_STATS_STORAGE_KEY,
        JSON.stringify({ totalBlocked: newStats.totalBlocked }),
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
      JSON.stringify({ totalBlocked: 0 }),
    );
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        toggleAdBlock,
        toggleDataSaver,
        incrementBlockedTrackers,
        updateUserProfile,
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
