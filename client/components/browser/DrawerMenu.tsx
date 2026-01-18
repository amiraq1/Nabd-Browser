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
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  SlideInRight,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { useSettings } from "@/context/SettingsContext";
import { Spacing, BorderRadius, AnimationConfig } from "@/constants/theme";
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
  accentColor?: string;
  index: number;
  badge?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ✨ Enhanced Menu Item with micro-interactions
function MenuItem({ icon, label, onPress, accentColor, index, badge }: MenuItemProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, AnimationConfig.springBouncy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, AnimationConfig.spring);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View
      entering={SlideInRight.delay(index * 40).duration(300).springify()}
      style={animatedStyle}
    >
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.menuItem,
          { backgroundColor: `${accentColor || colors.text}08` }
        ]}
      >
        <View style={[
          styles.menuIconBg,
          { backgroundColor: `${accentColor || colors.textSecondary}15` }
        ]}>
          <Feather
            name={icon}
            size={20}
            color={accentColor || colors.text}
          />
        </View>
        <ThemedText
          style={[
            styles.menuLabel,
            { color: accentColor || colors.text }
          ]}
        >
          {label}
        </ThemedText>
        {badge && (
          <View style={[styles.badge, { backgroundColor: colors.accent }]}>
            <ThemedText style={styles.badgeText}>{badge}</ThemedText>
          </View>
        )}
        <Feather
          name="chevron-left"
          size={18}
          color={colors.textSecondary}
        />
      </AnimatedPressable>
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

  const showToast = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("", message);
    }
  };

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
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(300)}
        style={styles.header}
      >
        <LinearGradient
          colors={[colors.accent, "#6366F1"]}
          style={styles.logoContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Feather name="activity" size={26} color="#FFF" />
        </LinearGradient>
        <View style={styles.headerText}>
          <ThemedText type="h2" style={[styles.appName, { color: colors.text }]}>
            نبض
          </ThemedText>
          <ThemedText style={[styles.appVersion, { color: colors.textSecondary }]}>
            الإصدار ١.٠
          </ThemedText>
        </View>
        <Pressable
          onPress={onClose}
          style={[styles.closeBtn, { backgroundColor: colors.backgroundTertiary }]}
        >
          <Feather name="x" size={18} color={colors.textSecondary} />
        </Pressable>
      </Animated.View>

      {/* Menu Items */}
      <View style={styles.menu}>
        <MenuItem
          icon={isBookmarked ? "bookmark" : "bookmark"}
          label={isBookmarked ? "إزالة من المفضلة" : "إضافة للمفضلة"}
          onPress={handleBookmarkToggle}
          accentColor={isBookmarked ? colors.accent : undefined}
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
          badge={bookmarks.length > 0 ? String(bookmarks.length) : undefined}
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

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <MenuItem
          icon="edit-3"
          label="تعبئة تلقائية"
          onPress={handleAutoFill}
          accentColor={colors.accent}
          index={4}
          badge="⚡"
        />
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

      {/* Footer */}
      <Animated.View
        entering={FadeIn.delay(300).duration(300)}
        style={styles.footer}
      >
        <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
          صُنع بـ ❤️ في السعودية
        </ThemedText>
      </Animated.View>
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          entering={FadeIn.duration(200)}
          style={styles.backdrop}
        />
      </Pressable>

      {/* Drawer */}
      <Animated.View
        entering={SlideInRight.duration(300).springify()}
        style={[
          styles.drawer,
          {
            paddingTop: insets.top + Spacing.md,
            paddingBottom: insets.bottom + Spacing.md,
          },
        ]}
      >
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={95}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: colors.backgroundRoot }
            ]}
          />
        )}
        <View style={styles.drawerContent}>
          {renderDrawerContent()}
        </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  drawer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "78%",
    maxWidth: 340,
    overflow: "hidden",
    borderTopLeftRadius: BorderRadius.xl,
    borderBottomLeftRadius: BorderRadius.xl,
  },
  drawerContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
    paddingVertical: Spacing.md,
  },
  logoContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  appName: {
    textAlign: "right",
  },
  appVersion: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
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
  menuIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 24,
    alignItems: "center",
  },
  badgeText: {
    color: "#000",
    fontSize: 11,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
    marginHorizontal: Spacing.md,
  },
  footer: {
    marginTop: "auto",
    paddingTop: Spacing.xl,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
  },
});
