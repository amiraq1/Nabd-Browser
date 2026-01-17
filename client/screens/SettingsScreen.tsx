import React, { useState } from "react";
import { View, StyleSheet, Pressable, Switch, Alert, ScrollView, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
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
        pressed && !toggle && styles.settingItemPressed,
      ]}
      disabled={toggle}
    >
      <View style={[styles.settingIcon, danger && styles.settingIconDanger]}>
        <Feather
          name={icon}
          size={20}
          color={danger ? Colors.dark.error : Colors.dark.accent}
        />
      </View>
      <View style={styles.settingContent}>
        <ThemedText
          style={[styles.settingLabel, danger && { color: Colors.dark.error }]}
        >
          {label}
        </ThemedText>
        {value ? (
          <ThemedText style={styles.settingValue}>{value}</ThemedText>
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
            false: Colors.dark.backgroundSecondary,
            true: Colors.dark.accent,
          }}
          thumbColor={Colors.dark.text}
        />
      ) : (
        <Feather
          name="chevron-left"
          size={20}
          color={Colors.dark.textSecondary}
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
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { clearHistory, loadHistory, loadBookmarks } = useBrowser();
  const [blockAds, setBlockAds] = useState(false);
  const [saveData, setSaveData] = useState(false);

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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Feather name="activity" size={40} color={Colors.dark.accent} />
        </View>
        <ThemedText type="h2" style={styles.appName}>
          نبض
        </ThemedText>
        <ThemedText style={styles.version}>الإصدار 1.0.0</ThemedText>
      </View>

      <SettingsSection title="الخصوصية">
        <SettingItem
          icon="trash"
          label="مسح ذاكرة التخزين المؤقت"
          onPress={handleClearCache}
        />
        <SettingItem
          icon="shield"
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
      </SettingsSection>

      <SettingsSection title="الميزات">
        <SettingItem
          icon="shield-off"
          label="حظر الإعلانات"
          toggle
          toggleValue={blockAds}
          onToggle={setBlockAds}
        />
        <SettingItem
          icon="download-cloud"
          label="توفير البيانات"
          toggle
          toggleValue={saveData}
          onToggle={setSaveData}
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
    backgroundColor: Colors.dark.backgroundRoot,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "rgba(0, 217, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  appName: {
    marginBottom: Spacing.xs,
  },
  version: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.accent,
    marginBottom: Spacing.sm,
    textAlign: "right",
  },
  sectionContent: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  settingItemPressed: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(0, 217, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.md,
  },
  settingIconDanger: {
    backgroundColor: "rgba(255, 61, 0, 0.1)",
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
    color: Colors.dark.textSecondary,
    textAlign: "right",
    marginTop: 2,
  },
});
