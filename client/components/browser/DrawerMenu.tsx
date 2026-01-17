import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
  Alert,
  ToastAndroid,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, SlideInLeft } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { useSettings } from "@/context/SettingsContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useBrowser } from "@/context/BrowserContext";
import { getAutoFillScript } from "@/lib/autoFill";

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (
    screen: "bookmarks" | "history" | "downloads" | "settings",
  ) => void;
}

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
  index: number;
}

function MenuItem({ icon, label, onPress, color, index }: MenuItemProps) {
  const colors = useColors();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View entering={SlideInLeft.delay(index * 50).duration(200)}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.menuItem,
          pressed && { backgroundColor: colors.backgroundSecondary },
        ]}
      >
        <Feather name={icon} size={22} color={color || colors.text} />
        <ThemedText style={[styles.menuLabel, { color: color || colors.text }]}>
          {label}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

export function DrawerMenu({ visible, onClose, onNavigate }: DrawerMenuProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const {
    isCurrentPageBookmarked,
    addBookmark,
    removeBookmark,
    activeTab,
    bookmarks,
    webViewRef,
  } = useBrowser();

  const isBookmarked = isCurrentPageBookmarked();

  // دالة عرض Toast
  const showToast = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("", message);
    }
  };

  // دالة التعبئة التلقائية
  const handleAutoFill = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { userProfile } = settings;
    if (!userProfile.fullName && !userProfile.email && !userProfile.phone) {
      showToast("يرجى إضافة بياناتك في الإعدادات أولاً 📝");
      onClose();
      onNavigate("settings");
      return;
    }

    const script = getAutoFillScript(userProfile);
    webViewRef.current?.injectJavaScript(script);
    onClose();
  };

  const handleBookmarkToggle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isBookmarked) {
      const bookmark = bookmarks.find((b) => b.url === activeTab?.url);
      if (bookmark) {
        await removeBookmark(bookmark.id);
      }
    } else {
      await addBookmark();
    }
  };

  const renderDrawerContent = () => (
    <>
      <View style={styles.header}>
        <View
          style={[
            styles.logoContainer,
            { backgroundColor: `${colors.accent}20` },
          ]}
        >
          <Feather name="activity" size={28} color={colors.accent} />
        </View>
        <ThemedText type="h2" style={[styles.appName, { color: colors.text }]}>
          نبض
        </ThemedText>
      </View>

      <View style={styles.menu}>
        <MenuItem
          icon={isBookmarked ? "bookmark" : "bookmark"}
          label={isBookmarked ? "إزالة من المفضلة" : "إضافة للمفضلة"}
          onPress={handleBookmarkToggle}
          color={isBookmarked ? colors.accent : undefined}
          index={0}
        />
        <MenuItem
          icon="star"
          label="المفضلة"
          onPress={() => {
            onClose();
            onNavigate("bookmarks");
          }}
          index={1}
        />
        <MenuItem
          icon="clock"
          label="السجل"
          onPress={() => {
            onClose();
            onNavigate("history");
          }}
          index={2}
        />
        <MenuItem
          icon="download"
          label="التنزيلات"
          onPress={() => {
            onClose();
            onNavigate("downloads");
          }}
          index={3}
        />
        <MenuItem
          icon="edit-3"
          label="تعبئة تلقائية ⚡"
          onPress={handleAutoFill}
          color={colors.accent}
          index={4}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <MenuItem
          icon="settings"
          label="الإعدادات"
          onPress={() => {
            onClose();
            onNavigate("settings");
          }}
          index={5}
        />
      </View>
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          entering={FadeIn.duration(150)}
          style={styles.backdrop}
        />
      </Pressable>
      <Animated.View
        entering={SlideInLeft.duration(200)}
        style={[
          styles.drawer,
          {
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: insets.bottom,
            backgroundColor: colors.backgroundRoot,
            borderLeftColor: colors.border,
          },
        ]}
      >
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={80}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          >
            <View style={styles.drawerContent}>{renderDrawerContent()}</View>
          </BlurView>
        ) : (
          <View style={styles.drawerContent}>{renderDrawerContent()}</View>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  drawer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "75%",
    maxWidth: 320,
    borderLeftWidth: 1,
    overflow: "hidden",
  },
  drawerContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.md,
  },
  appName: {},
  menu: {
    gap: Spacing.xs,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
});
