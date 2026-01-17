import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  Text,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { useSettings } from "@/context/SettingsContext";
import { useBrowser } from "@/context/BrowserContext";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  bookmarkStorage,
  historyStorage,
  downloadStorage,
} from "@/lib/storage";

export default function SettingsScreen() {
  const colors = useColors();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { isDark, setThemeMode } = useTheme();
  const {
    settings,
    toggleAdBlock,
    toggleDataSaver,
    updateUserProfile,
    updateSettings,
    whitelist,
    blockStats,
    resetStats,
  } = useSettings();
  const { loadHistory, loadBookmarks } = useBrowser();

  const handleThemeChange = () => {
    const newTheme = isDark ? "light" : "dark";
    setThemeMode(newTheme);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  const handleResetStats = async () => {
    Alert.alert(
      "إعادة تعيين العداد",
      "هل تريد إعادة تعيين عداد الإعلانات المحظورة؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "إعادة تعيين",
          style: "destructive",
          onPress: async () => {
            await resetStats();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
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
      {/* Logo & Stats */}
      <View style={styles.logoContainer}>
        <View style={[styles.logo, { backgroundColor: `${colors.accent}20` }]}>
          <Feather name="activity" size={40} color={colors.accent} />
        </View>
        <ThemedText type="h2" style={{ color: colors.text }}>
          نبض
        </ThemedText>
        <Text style={[styles.version, { color: colors.textSecondary }]}>
          الإصدار 2.0.0
        </Text>
      </View>

      {/* إحصائيات الحظر */}
      <View
        style={[
          styles.statsContainer,
          { backgroundColor: colors.backgroundSecondary },
        ]}
      >
        <View style={styles.statItem}>
          <Feather name="shield" size={24} color={colors.accent} />
          <Text style={[styles.statNumber, { color: colors.text }]}>
            {blockStats.totalBlocked.toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            إعلان محظور
          </Text>
        </View>
        <View
          style={[styles.statDivider, { backgroundColor: colors.border }]}
        />
        <View style={styles.statItem}>
          <Feather name="zap" size={24} color={colors.success} />
          <Text style={[styles.statNumber, { color: colors.text }]}>
            {settings.trackersBlocked}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            متتبع محظور
          </Text>
        </View>
      </View>

      {/* قسم التعبئة التلقائية */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.backgroundSecondary },
        ]}
      >
        <View style={styles.sectionHeader}>
          <Feather name="user" size={20} color={colors.accent} />
          <ThemedText type="h4" style={{ color: colors.text }}>
            الملف الشخصي (للتعبئة التلقائية)
          </ThemedText>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            الاسم الكامل
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.backgroundDefault,
              },
            ]}
            placeholder="الاسم الذي سيظهر في النماذج"
            placeholderTextColor={colors.textSecondary}
            value={settings.userProfile.fullName}
            onChangeText={(t) => updateUserProfile({ fullName: t })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            البريد الإلكتروني
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.backgroundDefault,
              },
            ]}
            placeholder="example@mail.com"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={settings.userProfile.email}
            onChangeText={(t) => updateUserProfile({ email: t })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            رقم الهاتف
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.backgroundDefault,
              },
            ]}
            placeholder="+966..."
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
            value={settings.userProfile.phone}
            onChangeText={(t) => updateUserProfile({ phone: t })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            العنوان
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.backgroundDefault,
              },
            ]}
            placeholder="العنوان الكامل"
            placeholderTextColor={colors.textSecondary}
            value={settings.userProfile.address}
            onChangeText={(t) => updateUserProfile({ address: t })}
          />
        </View>
      </View>

      {/* قسم المظهر */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.backgroundSecondary },
        ]}
      >
        <View style={styles.sectionHeader}>
          <Feather name="moon" size={20} color={colors.accent} />
          <ThemedText type="h4" style={{ color: colors.text }}>
            المظهر
          </ThemedText>
        </View>

        <View style={styles.row}>
          <View style={styles.rowContent}>
            <ThemedText style={{ color: colors.text, fontWeight: "600" }}>
              الوضع الداكن
            </ThemedText>
          </View>
          <Switch
            value={isDark}
            onValueChange={handleThemeChange}
            trackColor={{ false: "#767577", true: colors.accent }}
            thumbColor="#f4f3f4"
          />
        </View>
      </View>

      {/* قسم حظر الإعلانات */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.backgroundSecondary },
        ]}
      >
        <View style={styles.sectionHeader}>
          <Feather name="shield" size={20} color={colors.accent} />
          <ThemedText type="h4" style={{ color: colors.text }}>
            حظر الإعلانات
          </ThemedText>
        </View>

        <View style={styles.row}>
          <View style={styles.rowContent}>
            <ThemedText style={{ color: colors.text, fontWeight: "600" }}>
              حجب الإعلانات
            </ThemedText>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              منع النوافذ المنبثقة والإعلانات المزعجة
            </Text>
          </View>
          <Switch
            value={settings.adBlockEnabled}
            onValueChange={toggleAdBlock}
            trackColor={{ false: "#767577", true: colors.accent }}
            thumbColor="#f4f3f4"
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.row}>
          <View style={styles.rowContent}>
            <ThemedText style={{ color: colors.text, fontWeight: "600" }}>
              إشعارات الحظر
            </ThemedText>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              إظهار إشعار عند حظر إعلان
            </Text>
          </View>
          <Switch
            value={settings.showBlockNotifications}
            onValueChange={(val) =>
              updateSettings({ showBlockNotifications: val })
            }
            trackColor={{ false: "#767577", true: colors.accent }}
            thumbColor="#f4f3f4"
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Pressable
          style={styles.row}
          onPress={handleResetStats}
        >
          <View style={styles.rowContent}>
            <ThemedText style={{ color: colors.text, fontWeight: "600" }}>
              إعادة تعيين العداد
            </ThemedText>
          </View>
          <Feather name="refresh-cw" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* قسم توفير البيانات */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.backgroundSecondary },
        ]}
      >
        <View style={styles.sectionHeader}>
          <Feather name="wifi" size={20} color={colors.accent} />
          <ThemedText type="h4" style={{ color: colors.text }}>
            البيانات
          </ThemedText>
        </View>

        <View style={styles.row}>
          <View style={styles.rowContent}>
            <ThemedText style={{ color: colors.text, fontWeight: "600" }}>
              توفير البيانات
            </ThemedText>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              تقليل استهلاك الإنترنت
            </Text>
          </View>
          <Switch
            value={settings.dataSaverEnabled}
            onValueChange={toggleDataSaver}
            trackColor={{ false: "#767577", true: colors.accent }}
            thumbColor="#f4f3f4"
          />
        </View>
      </View>

      {/* قسم الخصوصية */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.backgroundSecondary },
        ]}
      >
        <View style={styles.sectionHeader}>
          <Feather name="lock" size={20} color={colors.accent} />
          <ThemedText type="h4" style={{ color: colors.text }}>
            الخصوصية
          </ThemedText>
        </View>

        <Pressable style={styles.row} onPress={handleClearAllData}>
          <View style={styles.rowContent}>
            <ThemedText style={{ color: colors.error, fontWeight: "600" }}>
              مسح جميع البيانات
            </ThemedText>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              المفضلة والسجل والتنزيلات
            </Text>
          </View>
          <Feather name="trash-2" size={20} color={colors.error} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  version: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  statsContainer: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    marginHorizontal: Spacing.md,
  },
  section: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  rowContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlign: "right",
  },
});
