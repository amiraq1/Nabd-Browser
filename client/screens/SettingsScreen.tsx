import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
} from "react-native";
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
import {
  bookmarkStorage,
  historyStorage,
  downloadStorage,
} from "@/lib/storage";

interface SettingItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  badge?: number;
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
  badge,
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
      <View
        style={[
          styles.settingIcon,
          {
            backgroundColor: danger
              ? `${colors.error}15`
              : `${colors.accent}15`,
          },
        ]}
      >
        <Feather
          name={icon}
          size={20}
          color={danger ? colors.error : colors.accent}
        />
      </View>
      <View style={styles.settingContent}>
        <ThemedText
          style={[
            styles.settingLabel,
            { color: danger ? colors.error : colors.text },
          ]}
        >
          {label}
        </ThemedText>
        {value ? (
          <ThemedText
            style={[styles.settingValue, { color: colors.textSecondary }]}
          >
            {value}
          </ThemedText>
        ) : null}
      </View>
      {badge !== undefined && badge > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.accent }]}>
          <ThemedText style={styles.badgeText}>{badge}</ThemedText>
        </View>
      )}
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
        <Feather name="chevron-left" size={20} color={colors.textSecondary} />
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
      <View
        style={[
          styles.sectionContent,
          { backgroundColor: colors.backgroundDefault },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

// مكون إدارة القائمة البيضاء
function WhitelistModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { whitelist, addSiteToWhitelist, removeSiteFromWhitelist } =
    useSettings();
  const [newDomain, setNewDomain] = useState("");

  const handleAdd = async () => {
    if (newDomain.trim()) {
      await addSiteToWhitelist(newDomain.trim());
      setNewDomain("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleRemove = async (domain: string) => {
    Alert.alert("إزالة من القائمة البيضاء", `هل تريد إزالة ${domain}؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "إزالة",
        style: "destructive",
        onPress: async () => {
          await removeSiteFromWhitelist(domain);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.modalContainer,
          {
            backgroundColor: colors.backgroundRoot,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.modalHeader,
            { borderBottomColor: colors.border },
          ]}
        >
          <Pressable onPress={onClose} style={styles.modalCloseButton}>
            <Feather name="x" size={24} color={colors.text} />
          </Pressable>
          <ThemedText type="h2" style={{ color: colors.text }}>
            القائمة البيضاء
          </ThemedText>
          <View style={{ width: 40 }} />
        </View>

        {/* Add new domain */}
        <View style={styles.addContainer}>
          <TextInput
            style={[
              styles.addInput,
              {
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="أدخل اسم الموقع (مثال: example.com)"
            placeholderTextColor={colors.textSecondary}
            value={newDomain}
            onChangeText={setNewDomain}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            textAlign="right"
          />
          <Pressable
            style={[styles.addButton, { backgroundColor: colors.accent }]}
            onPress={handleAdd}
          >
            <Feather name="plus" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* List */}
        {whitelist.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather
              name="shield-off"
              size={48}
              color={colors.textSecondary}
            />
            <ThemedText
              style={[styles.emptyText, { color: colors.textSecondary }]}
            >
              لا توجد مواقع في القائمة البيضاء
            </ThemedText>
            <ThemedText
              style={[styles.emptySubtext, { color: colors.textSecondary }]}
            >
              المواقع المضافة هنا لن يتم حظر الإعلانات فيها
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={whitelist}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.whitelistItem,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.whitelistItemContent}>
                  <Feather
                    name="globe"
                    size={18}
                    color={colors.textSecondary}
                  />
                  <ThemedText
                    style={[styles.whitelistDomain, { color: colors.text }]}
                  >
                    {item}
                  </ThemedText>
                </View>
                <Pressable
                  onPress={() => handleRemove(item)}
                  style={({ pressed }) => [
                    styles.removeButton,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Feather name="trash-2" size={18} color={colors.error} />
                </Pressable>
              </View>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { isDark, setThemeMode } = useTheme();
  const {
    settings,
    updateSettings,
    whitelist,
    blockStats,
    resetStats,
  } = useSettings();
  const { loadHistory, loadBookmarks } = useBrowser();

  const [whitelistModalVisible, setWhitelistModalVisible] = useState(false);

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

  const handleResetBlockStats = () => {
    Alert.alert("إعادة تعيين العداد", "هل تريد إعادة تعيين عداد الإعلانات المحظورة؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "إعادة تعيين",
        style: "destructive",
        onPress: async () => {
          await resetStats();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const handleThemeChange = () => {
    const newTheme = isDark ? "light" : "dark";
    setThemeMode(newTheme);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <>
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
          <ThemedText
            style={[styles.version, { color: colors.textSecondary }]}
          >
            الإصدار 1.1.0
          </ThemedText>
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
            <ThemedText
              style={[styles.statNumber, { color: colors.text }]}
            >
              {blockStats.totalBlocked.toLocaleString()}
            </ThemedText>
            <ThemedText
              style={[styles.statLabel, { color: colors.textSecondary }]}
            >
              إعلان محظور (إجمالي)
            </ThemedText>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: colors.border }]}
          />
          <View style={styles.statItem}>
            <Feather name="zap" size={24} color={colors.success} />
            <ThemedText
              style={[styles.statNumber, { color: colors.text }]}
            >
              {blockStats.sessionBlocked}
            </ThemedText>
            <ThemedText
              style={[styles.statLabel, { color: colors.textSecondary }]}
            >
              في هذه الجلسة
            </ThemedText>
          </View>
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

        <SettingsSection title="حظر الإعلانات">
          <SettingItem
            icon="shield"
            label="تفعيل حظر الإعلانات"
            toggle
            toggleValue={settings.adBlockEnabled}
            onToggle={(val) => updateSettings({ adBlockEnabled: val })}
          />
          <SettingItem
            icon="bell"
            label="إشعارات الحظر"
            toggle
            toggleValue={settings.showBlockNotifications}
            onToggle={(val) => updateSettings({ showBlockNotifications: val })}
          />
          <SettingItem
            icon="check-circle"
            label="القائمة البيضاء"
            value={`${whitelist.length} موقع`}
            onPress={() => setWhitelistModalVisible(true)}
          />
          <SettingItem
            icon="refresh-cw"
            label="إعادة تعيين العداد"
            onPress={handleResetBlockStats}
          />
        </SettingsSection>

        <SettingsSection title="الخصوصية">
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
            onPress={() => { }}
          />
          <SettingItem
            icon="home"
            label="الصفحة الرئيسية"
            value="google.com"
            onPress={() => { }}
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
          <SettingItem icon="info" label="سياسة الخصوصية" onPress={() => { }} />
          <SettingItem icon="file-text" label="شروط الخدمة" onPress={() => { }} />
          <SettingItem icon="github" label="المصدر المفتوح" onPress={() => { }} />
        </SettingsSection>
      </ScrollView>

      {/* Modal القائمة البيضاء */}
      <WhitelistModal
        visible={whitelistModalVisible}
        onClose={() => setWhitelistModalVisible(false)}
      />
    </>
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
  appName: {
    marginBottom: Spacing.xs,
  },
  version: {
    fontSize: 14,
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
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: Spacing.sm,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  modalCloseButton: {
    padding: Spacing.sm,
  },
  addContainer: {
    flexDirection: "row",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  addInput: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    fontSize: 15,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  whitelistItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  whitelistItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  whitelistDomain: {
    fontSize: 15,
  },
  removeButton: {
    padding: Spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["4xl"],
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
});
