import React from "react";
import { View, Pressable, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { Spacing } from "@/constants/theme";
import { useBrowser } from "@/context/BrowserContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface NavButtonProps {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  highlight?: boolean;
}

function NavButton({ icon, onPress, disabled = false, highlight = false }: NavButtonProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.4 : 1,
  }));

  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => !disabled && (scale.value = withSpring(0.9))}
      onPressOut={() => (scale.value = withSpring(1))}
      disabled={disabled}
      style={[
        styles.button,
        animatedStyle,
        highlight && { backgroundColor: `${colors.accent}20` },
      ]}
    >
      <Feather
        name={icon}
        size={22}
        color={highlight ? colors.accent : disabled ? colors.textSecondary : colors.text}
      />
    </AnimatedPressable>
  );
}

interface NavigationBarProps {
  onAIPress: () => void;
}

export function NavigationBar({ onAIPress }: NavigationBarProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { activeTab, goBack, goForward, reload, goHome, isIncognitoMode } =
    useBrowser();

  const backgroundColor = isIncognitoMode
    ? colors.incognitoBackground
    : colors.backgroundDefault;

  const renderContent = () => (
    <View style={[styles.innerContainer, { paddingBottom: insets.bottom + Spacing.xs }]}>
      <NavButton
        icon="chevron-right"
        onPress={goBack}
        disabled={!activeTab?.canGoBack}
      />
      <NavButton
        icon="chevron-left"
        onPress={goForward}
        disabled={!activeTab?.canGoForward}
      />
      <NavButton icon="refresh-cw" onPress={reload} />
      <NavButton icon="home" onPress={goHome} />
      <NavButton icon="cpu" onPress={onAIPress} highlight />
    </View>
  );

  if (Platform.OS === "ios" && !isIncognitoMode) {
    return (
      <BlurView 
        intensity={80} 
        tint={isDark ? "dark" : "light"} 
        style={[styles.container, { borderTopColor: colors.border }]}
      >
        {renderContent()}
      </BlurView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor, borderTopColor: colors.border }]}>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: Spacing.sm,
  },
  button: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
  },
});
