import React from "react";
import { View, StyleSheet, Pressable, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, SlideInLeft } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useBrowser } from "@/context/BrowserContext";

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: "bookmarks" | "history" | "downloads" | "settings") => void;
}

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
  index: number;
}

function MenuItem({ icon, label, onPress, color, index }: MenuItemProps) {
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
          pressed && styles.menuItemPressed,
        ]}
      >
        <Feather name={icon} size={22} color={color || Colors.dark.text} />
        <ThemedText style={[styles.menuLabel, color && { color }]}>
          {label}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

export function DrawerMenu({ visible, onClose, onNavigate }: DrawerMenuProps) {
  const insets = useSafeAreaInsets();
  const { isCurrentPageBookmarked, addBookmark, removeBookmark, activeTab, bookmarks } =
    useBrowser();

  const isBookmarked = isCurrentPageBookmarked();

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
          style={[styles.backdrop]}
        />
      </Pressable>
      <Animated.View
        entering={SlideInLeft.duration(200)}
        style={[
          styles.drawer,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Feather name="activity" size={28} color={Colors.dark.accent} />
          </View>
          <ThemedText type="h2" style={styles.appName}>
            نبض
          </ThemedText>
        </View>

        <View style={styles.menu}>
          <MenuItem
            icon={isBookmarked ? "bookmark" : "bookmark"}
            label={isBookmarked ? "إزالة من المفضلة" : "إضافة للمفضلة"}
            onPress={handleBookmarkToggle}
            color={isBookmarked ? Colors.dark.accent : undefined}
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
          <View style={styles.divider} />
          <MenuItem
            icon="settings"
            label="الإعدادات"
            onPress={() => {
              onClose();
              onNavigate("settings");
            }}
            index={4}
          />
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  drawer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "75%",
    maxWidth: 320,
    backgroundColor: Colors.dark.backgroundRoot,
    paddingHorizontal: Spacing.lg,
    borderLeftWidth: 1,
    borderLeftColor: Colors.dark.border,
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
    backgroundColor: "rgba(0, 217, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.md,
  },
  appName: {
    color: Colors.dark.text,
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
  menuItemPressed: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: Spacing.md,
  },
});
