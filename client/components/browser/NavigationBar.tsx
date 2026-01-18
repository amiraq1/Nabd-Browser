import React from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBrowser } from "@/context/BrowserContext";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { PulseButton } from "./PulseButton";
import { Spacing, BorderRadius, AnimationConfig } from "@/constants/theme";

interface NavigationBarProps {
  onMenuPress: () => void;
  onTabsPress: () => void;
  onAIPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ✨ Refined Nav Button with micro-interactions
const NavButton = ({
  icon,
  onPress,
  disabled = false,
  color,
  badge,
}: {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  color: string;
  badge?: number;
}) => {
  const scale = useSharedValue(1);
  const colors = useColors();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.35 : 1,
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.85, AnimationConfig.springBouncy);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, AnimationConfig.spring);
  };

  const handlePress = () => {
    if (!disabled) {
      Haptics.selectionAsync();
      onPress();
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.navButton, animatedStyle]}
      hitSlop={12}
    >
      <Feather name={icon} size={22} color={color} />
      {badge !== undefined && badge > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.accent }]}>
          <Animated.Text style={styles.badgeText}>
            {badge > 9 ? "9+" : badge}
          </Animated.Text>
        </View>
      )}
    </AnimatedPressable>
  );
};

export function NavigationBar({ onMenuPress, onTabsPress, onAIPress }: NavigationBarProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  const { goBack, goForward, activeTab, tabs } = useBrowser();
  const insets = useSafeAreaInsets();

  const handleAIPress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onAIPress();
  };

  const renderContent = () => (
    <View style={styles.content}>
      {/* Right Group - Navigation */}
      <View style={styles.navGroup}>
        <NavButton
          icon="chevron-right"
          onPress={goBack}
          disabled={!activeTab?.canGoBack}
          color={colors.text}
        />
        <NavButton
          icon="chevron-left"
          onPress={goForward}
          disabled={!activeTab?.canGoForward}
          color={colors.text}
        />
      </View>

      {/* Center - Pulse Button (Elevated) */}
      <View style={styles.centerContainer}>
        <View style={styles.pulseWrapper}>
          <PulseButton onPress={handleAIPress} />
        </View>
      </View>

      {/* Left Group - Tabs & Menu */}
      <View style={styles.navGroup}>
        <NavButton
          icon="layers"
          onPress={onTabsPress}
          color={colors.text}
          badge={tabs.length}
        />
        <NavButton
          icon="grid"
          onPress={onMenuPress}
          color={colors.text}
        />
      </View>
    </View>
  );

  // iOS: Use BlurView | Android: Solid background with subtle transparency
  if (Platform.OS === "ios") {
    return (
      <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
        <BlurView
          intensity={90}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.topBorder, { backgroundColor: colors.glassBorder }]} />
        {renderContent()}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: insets.bottom,
          backgroundColor: colors.backgroundElevated,
        }
      ]}
    >
      <View style={[styles.topBorder, { backgroundColor: colors.border }]} />
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  topBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 0.5,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: Spacing.bottomNavHeight,
    paddingHorizontal: Spacing.lg,
  },
  navGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    width: 100,
    justifyContent: "center",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseWrapper: {
    marginTop: -28, // Elevate the pulse button
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "700",
  },
});
