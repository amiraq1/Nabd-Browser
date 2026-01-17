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
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useBrowser } from "@/context/BrowserContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FABProps {
  onTabsPress: () => void;
}

export function FAB({ onTabsPress }: FABProps) {
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
    ? Colors.dark.incognitoAccent
    : Colors.dark.accent;

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
        <View style={styles.tabCount}>
          <ThemedText style={styles.tabCountText}>{tabs.length}</ThemedText>
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
          style={[styles.menu, { bottom: bottomOffset + Spacing.fabSize + Spacing.sm }]}
        >
          <Pressable
            onPress={() => handleNewTab(false)}
            style={styles.menuItem}
          >
            <Feather name="plus" size={20} color={Colors.dark.accent} />
            <ThemedText style={styles.menuText}>تبويب جديد</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => handleNewTab(true)}
            style={styles.menuItem}
          >
            <Feather name="eye-off" size={20} color={Colors.dark.incognitoAccent} />
            <ThemedText style={[styles.menuText, { color: Colors.dark.incognitoAccent }]}>
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
    borderColor: Colors.dark.buttonText,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.dark.buttonText,
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
    backgroundColor: Colors.dark.backgroundDefault,
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
    color: Colors.dark.text,
  },
});
