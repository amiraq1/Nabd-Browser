import React, { useState } from "react";
import { View, Pressable, StyleSheet, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { useColors } from "@/hooks/useColors";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useBrowser } from "@/context/BrowserContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FABProps {
  onTabsPress: () => void;
}

export function FAB({ onTabsPress }: FABProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tabs, createTab, isIncognitoMode } = useBrowser();
  const [showMenu, setShowMenu] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onTabsPress();
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowMenu(true);
  };

  const handleNewTab = (isIncognito: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createTab(isIncognito);
    setShowMenu(false);
  };

  const bottomOffset = Spacing.bottomNavHeight + insets.bottom + Spacing.lg;
  const backgroundColor = isIncognitoMode
    ? colors.incognitoAccent
    : colors.accent;

  return (
    <>
      <AnimatedPressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={() => (scale.value = withSpring(0.9))}
        onPressOut={() => (scale.value = withSpring(1))}
        style={[
          styles.fab,
          { bottom: bottomOffset, backgroundColor },
          animatedStyle,
        ]}
      >
        <View style={[styles.tabCount, { borderColor: colors.buttonText }]}>
          <ThemedText
            style={[styles.tabCountText, { color: colors.buttonText }]}
          >
            {tabs.length}
          </ThemedText>
        </View>
      </AnimatedPressable>

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowMenu(false)}>
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(100)}
            style={styles.backdrop}
          />
        </Pressable>
        <Animated.View
          entering={FadeIn.duration(150)}
          style={[
            styles.menu,
            {
              bottom: bottomOffset + Spacing.fabSize + Spacing.sm,
              backgroundColor: colors.backgroundDefault,
            },
          ]}
        >
          <Pressable
            onPress={() => handleNewTab(false)}
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
          >
            <Feather name="plus" size={20} color={colors.accent} />
            <ThemedText style={[styles.menuText, { color: colors.text }]}>
              تبويب جديد
            </ThemedText>
          </Pressable>
          <Pressable onPress={() => handleNewTab(true)} style={styles.menuItem}>
            <Feather name="eye-off" size={20} color={colors.incognitoAccent} />
            <ThemedText
              style={[styles.menuText, { color: colors.incognitoAccent }]}
            >
              تصفح خفي
            </ThemedText>
          </Pressable>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: Spacing.lg,
    width: Spacing.fabSize,
    height: Spacing.fabSize,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tabCount: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabCountText: {
    fontSize: 12,
    fontWeight: "700",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menu: {
    position: "absolute",
    right: Spacing.lg,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    minWidth: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  menuText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
