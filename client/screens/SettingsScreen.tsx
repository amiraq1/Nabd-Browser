import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  Alert,
  Pressable,
  Dimensions,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";

import { ThemedText } from "@/components/ThemedText";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { useSettings } from "@/context/SettingsContext";
import { useBrowser } from "@/context/BrowserContext";
import {
  bookmarkStorage,
  historyStorage,
  downloadStorage,
} from "@/lib/storage";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

const { width } = Dimensions.get("window");

// مكون إحصائيات سريع
const StatCard = ({ icon, value, label, color, isDark }: any) => (
  <View
    style={[
      styles.statCard,
      {
        backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
        borderColor: color + "30",
      },
    ]}
  >
    <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
      <Feather name={icon} size={18} color={color} />
    </View>
    <ThemedText
      type="body"
      style={{ fontSize: 18, marginTop: 8, fontWeight: "600" }}
    >
      {value}
    </ThemedText>
    <ThemedText style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>
      {label}
    </ThemedText>
  </View>
);

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isDark, setThemeMode } = useTheme();
  const {
    settings,
    updateSettings,
    updateUserProfile,
    blockStats,
    resetStats,
    toggleAdBlock,
    toggleDataSaver,
  } = useSettings();
  const { loadHistory, loadBookmarks } = useBrowser();

  // حالة لتوسيع قسم الملف الشخصي
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);

  const handleThemeChange = () => {
    setThemeMode(isDark ? "light" : "dark");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleClearAllData = async () => {
    Alert.alert(
      "تنظيف شامل",
      "سيتم حذف السجل، المفضلة، والكاش. هل أنت متأكد؟",
      [
        { text: "تراجع", style: "cancel" },
        {
          text: "حذف نهائي",
          style: "destructive",
          onPress: async () => {
            await bookmarkStorage.clear();
            await historyStorage.clear();
            await downloadStorage.clear();
            await loadHistory();
            await loadBookmarks();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ],
    );
  };

  const handleResetStats = async () => {
    Alert.alert("إعادة تعيين", "هل تريد تصفير عداد الإعلانات المحظورة؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "تصفير",
        style: "destructive",
        onPress: async () => {
          await resetStats();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.backgroundRoot }]}
    >
      {/* خلفية جمالية علوية */}
      <LinearGradient
        colors={
          isDark
            ? ["#1e1b4b", colors.backgroundRoot]
            : ["#e0e7ff", colors.backgroundRoot]
        }
        style={[styles.headerGradient, { height: insets.top + 200 }]}
      />

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 100,
          paddingTop: insets.top + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* رأس الصفحة */}
        <View style={styles.header}>
          <View>
            <ThemedText type="h2">الإعدادات</ThemedText>
            <ThemedText style={{ opacity: 0.6 }}>تخصيص تجربتك</ThemedText>
          </View>
          <View
            style={[
              styles.logoPlaceholder,
              { backgroundColor: colors.accent + "20" },
            ]}
          >
            <Feather name="settings" size={24} color={colors.accent} />
          </View>
        </View>

        {/* الإحصائيات */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScroll}
        >
          <StatCard
            icon="shield"
            value={blockStats.totalBlocked}
            label="إعلان محظور"
            color="#ef4444" // Red
            isDark={isDark}
          />
          <StatCard
            icon="zap"
            value={settings.trackersBlocked}
            label="متتبع موقوف"
            color="#f59e0b" // Amber
            isDark={isDark}
          />
          <StatCard
            icon="hard-drive"
            value={settings.dataSaverEnabled ? "مفعل" : "معطل"}
            label="توفير البيانات"
            color="#3b82f6" // Blue
            isDark={isDark}
          />
        </ScrollView>

        {/* قسم الملف الشخصي */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <Pressable
            style={styles.sectionHeader}
            onPress={() => {
              Haptics.selectionAsync();
              setIsProfileExpanded(!isProfileExpanded);
            }}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: colors.accent + "15" },
              ]}
            >
              <Feather name="user" size={20} color={colors.accent} />
            </View>
            <View style={{ flex: 1, marginHorizontal: 12 }}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                الملف الشخصي
              </ThemedText>
              <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
                للتعبئة التلقائية للنماذج
              </ThemedText>
            </View>
            <Feather
              name={isProfileExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>

          {isProfileExpanded && (
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>الاسم الكامل</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.backgroundRoot,
                    },
                  ]}
                  placeholder="الاسم..."
                  placeholderTextColor={colors.textSecondary}
                  value={settings.userProfile.fullName}
                  onChangeText={(t) => updateUserProfile({ fullName: t })}
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>البريد الإلكتروني</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.backgroundRoot,
                    },
                  ]}
                  placeholder="email@example.com"
                  placeholderTextColor={colors.textSecondary}
                  value={settings.userProfile.email}
                  onChangeText={(t) => updateUserProfile({ email: t })}
                  keyboardType="email-address"
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>رقم الهاتف</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.backgroundRoot,
                    },
                  ]}
                  placeholder="+966..."
                  placeholderTextColor={colors.textSecondary}
                  value={settings.userProfile.phone}
                  onChangeText={(t) => updateUserProfile({ phone: t })}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          )}
        </View>

        {/* قسم كلمات المرور */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: colors.accent + "15" },
              ]}
            >
              <Feather name="key" size={20} color={colors.accent} />
            </View>
            <View style={{ flex: 1, marginHorizontal: 12 }}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                كلمات المرور
              </ThemedText>
              <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
                إدارة بيانات الدخول المحفوظة
              </ThemedText>
            </View>
            <Pressable
              onPress={() => {
                // هنا نفتح حوار إضافة كلمة مرور (سنستخدم Alert مبسط للتجربة)
                Alert.prompt(
                  "إضافة كلمة مرور",
                  "أدخل: النطاق, اسم المستخدم, كلمة المرور (مفصولة بفاصلة)",
                  async (text) => {
                    if (text) {
                      const [url, username, password] = text.split(",");
                      if (url && username && password) {
                        const { passwordStorage } = await import(
                          "@/lib/passwordStorage"
                        );
                        await passwordStorage.saveLogin({
                          url: url.trim(),
                          username: username.trim(),
                          password: password.trim(),
                        });
                        Alert.alert("تم", "تم حفظ كلمة المرور بنجاح");
                      } else {
                        Alert.alert("خطأ", "تنسيق غير صحيح");
                      }
                    }
                  },
                );
              }}
              style={{ padding: 8 }}
            >
              <Feather name="plus" size={20} color={colors.accent} />
            </Pressable>
          </View>
        </View>

        {/* أدوات الخصوصية */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <View style={styles.sectionTitle}>
            <ThemedText
              type="body"
              style={{
                opacity: 0.5,
                fontSize: 13,
                marginBottom: 8,
                fontWeight: "600",
              }}
            >
              الحماية والخصوصية
            </ThemedText>
          </View>

          <View style={styles.row}>
            <View style={styles.rowContent}>
              <ThemedText>حجب الإعلانات</ThemedText>
            </View>
            <Switch
              value={settings.adBlockEnabled}
              onValueChange={toggleAdBlock}
              trackColor={{ true: colors.accent, false: "#555" }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.row}>
            <View style={styles.rowContent}>
              <ThemedText>إشعارات الحظر</ThemedText>
              <ThemedText style={{ fontSize: 11, opacity: 0.5 }}>
                اهتزاز عند حجب إعلان
              </ThemedText>
            </View>
            <Switch
              value={settings.showBlockNotifications}
              onValueChange={(v) =>
                updateSettings({ showBlockNotifications: v })
              }
              trackColor={{ true: colors.accent, false: "#555" }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Pressable style={styles.row} onPress={handleResetStats}>
            <ThemedText style={{ color: colors.text }}>تصفير العداد</ThemedText>
            <Feather
              name="refresh-ccw"
              size={16}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>

        {/* المظهر والتجربة */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <View style={styles.sectionTitle}>
            <ThemedText
              type="body"
              style={{
                opacity: 0.5,
                fontSize: 13,
                marginBottom: 8,
                fontWeight: "600",
              }}
            >
              المظهر
            </ThemedText>
          </View>

          <View style={styles.row}>
            <View style={styles.rowContent}>
              <ThemedText>الوضع الليلي</ThemedText>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleThemeChange}
              trackColor={{ true: colors.accent, false: "#555" }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.row}>
            <View style={styles.rowContent}>
              <ThemedText>توفير البيانات</ThemedText>
              <ThemedText style={{ fontSize: 11, opacity: 0.5 }}>
                تقليل استهلاك الصور
              </ThemedText>
            </View>
            <Switch
              value={settings.dataSaverEnabled}
              onValueChange={toggleDataSaver}
              trackColor={{ true: colors.accent, false: "#555" }}
            />
          </View>
        </View>

        {/* زر الخطر */}
        <Pressable
          style={[
            styles.dangerButton,
            {
              backgroundColor: "#ef4444" + "15",
              borderColor: "#ef4444" + "40",
            },
          ]}
          onPress={handleClearAllData}
        >
          <Feather name="trash-2" size={20} color="#ef4444" />
          <ThemedText style={{ color: "#ef4444", fontWeight: "600" }}>
            مسح كافة بيانات التصفح
          </ThemedText>
        </Pressable>

        <ThemedText
          style={{
            textAlign: "center",
            opacity: 0.3,
            marginTop: 20,
            fontSize: 12,
          }}
        >
          Nabd Browser v2.1.0 Beta
        </ThemedText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  statsScroll: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 12,
  },
  statCard: {
    width: 110,
    height: 100,
    borderRadius: 16,
    padding: 12,
    justifyContent: "center",
    borderWidth: 1,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 16,
    paddingVertical: 20,
    ...Shadows.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    marginBottom: 4,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  rowContent: {
    flex: 1,
  },
  divider: {
    height: 1,
    opacity: 0.1,
    marginVertical: 4,
  },
  formContainer: {
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 6,
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    textAlign: "right",
    fontSize: 14,
  },
  dangerButton: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
  },
});
