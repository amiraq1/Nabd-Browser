import React from "react";
import { View, StyleSheet, Pressable, Switch, Alert, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { useSettings } from "@/context/SettingsContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useBrowser } from "@/context/BrowserContext";
import { bookmarkStorage, historyStorage, downloadStorage } from "@/lib/storage";

interface SettingItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
}

function SettingItem({
  icon,
  label,
  value,
  onPress,
  danger,
  toggle,
  toggleValue,
  onToggle,
}: SettingItemProps) {
  const colors = useColors();
  
  return (
    <Pressable
      onPress={() => {
        if (!toggle && onPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }
      }}
      style={({ pressed }) => [
        styles.settingItem,
        { borderBottomColor: colors.border },
        pressed && !toggle && { backgroundColor: colors.backgroundSecondary },
      ]}
      disabled={toggle}
    >
      <View style={[
        styles.settingIcon, 
        { backgroundColor: danger ? `${colors.error}15` : `${colors.accent}15` }
      ]}>
        <Feather
          name={icon}
          size={20}
          color={danger ? colors.error : colors.accent}
        />
      </View>
      <View style={styles.settingContent}>
        <ThemedText
          style={[styles.settingLabel, { color: danger ? colors.error : colors.text }]}
        >
          {label}
        </ThemedText>
        {value ? (
          <ThemedText style={[styles.settingValue, { color: colors.textSecondary }]}>
            {value}
          </ThemedText>
        ) : null}
      </View>
      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={(val) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggle?.(val);
          }}
          trackColor={{
            false: colors.backgroundSecondary,
            true: colors.accent,
          }}
          thumbColor={colors.text}
        />
      ) : (
        <Feather
          name="chevron-left"
          size={20}
          color={colors.textSecondary}
        />
      )}
    </Pressable>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const colors = useColors();
  
  return (
    <View style={styles.section}>
      <ThemedText style={[styles.sectionTitle, { color: colors.accent }]}>
        {title}
      </ThemedText>
      <View style={[styles.sectionContent, { backgroundColor: colors.backgroundDefault }]}>
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { isDark, themeMode, setThemeMode } = useTheme();
  const { settings, updateSettings } = useSettings();
  const { clearHistory, loadHistory, loadBookmarks } = useBrowser();

  const handleClearCache = () => {
    Alert.alert("مسح ذاكرة التخزين المؤقت", "هل أنت متأكد؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "مسح",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert("تم", "تم مسح ذاكرة التخزين المؤقت");
        },
      },
    ]);
  };

  const handleClearCookies = () => {
    Alert.alert("مسح ملفات تعريف الارتباط", "هل أنت متأكد؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "مسح",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert("تم", "تم مسح ملفات تعريف الارتباط");
        },
      },
    ]);
  };

  const handleClearAllData = async () => {
    Alert.alert(
      "مسح جميع البيانات",
      "سيتم مسح المفضلة والسجل والتنزيلات. هل أنت متأكد؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "مسح الكل",
          style: "destructive",
          onPress: async () => {
            await bookmarkStorage.clear();
            await historyStorage.clear();
            await downloadStorage.clear();
            await loadHistory();
            await loadBookmarks();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("تم", "تم مسح جميع البيانات");
          },
        },
      ]
    );
  };

  const handleThemeChange = () => {
    const newTheme = themeMode === "dark" ? "light" : "dark";
    setThemeMode(newTheme);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.logoContainer}>
        <View style={[styles.logo, { backgroundColor: `${colors.accent}20` }]}>
          <Feather name="activity" size={40} color={colors.accent} />
        </View>
        <ThemedText type="h2" style={[styles.appName, { color: colors.text }]}>
          نبض
        </ThemedText>
        <ThemedText style={[styles.version, { color: colors.textSecondary }]}>
          الإصدار 1.1.0
        </ThemedText>
      </View>

      <SettingsSection title="المظهر">
        <SettingItem
          icon={isDark ? "moon" : "sun"}
          label="الوضع الداكن"
          toggle
          toggleValue={isDark}
          onToggle={handleThemeChange}
        />
      </SettingsSection>

      <SettingsSection title="الخصوصية">
        <SettingItem
          icon="shield"
          label="حظر الإعلانات"
          toggle
          toggleValue={settings.adBlockEnabled}
          onToggle={(val) => updateSettings({ adBlockEnabled: val })}
        />
        <SettingItem
          icon="trash"
          label="مسح ذاكرة التخزين المؤقت"
          onPress={handleClearCache}
        />
        <SettingItem
          icon="lock"
          label="مسح ملفات تعريف الارتباط"
          onPress={handleClearCookies}
        />
        <SettingItem
          icon="alert-triangle"
          label="مسح جميع البيانات"
          onPress={handleClearAllData}
          danger
        />
      </SettingsSection>

      <SettingsSection title="عام">
        <SettingItem
          icon="search"
          label="محرك البحث الافتراضي"
          value="Google"
          onPress={() => {}}
        />
        <SettingItem
          icon="home"
          label="الصفحة الرئيسية"
          value="google.com"
          onPress={() => {}}
        />
        <SettingItem
          icon="download-cloud"
          label="توفير البيانات"
          toggle
          toggleValue={settings.dataSaverEnabled}
          onToggle={(val) => updateSettings({ dataSaverEnabled: val })}
        />
      </SettingsSection>

      <SettingsSection title="حول">
        <SettingItem icon="info" label="سياسة الخصوصية" onPress={() => {}} />
        <SettingItem icon="file-text" label="شروط الخدمة" onPress={() => {}} />
        <SettingItem icon="github" label="المصدر المفتوح" onPress={() => {}} />
      </SettingsSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  appName: {
    marginBottom: Spacing.xs,
  },
  version: {
    fontSize: 14,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.sm,
    textAlign: "right",
  },
  sectionContent: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.md,
  },
  settingContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "right",
  },
  settingValue: {
    fontSize: 13,
    textAlign: "right",
    marginTop: 2,
  },
});
