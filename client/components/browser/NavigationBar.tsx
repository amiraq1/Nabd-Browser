import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Spacing } from "@/constants/theme";
import { useBrowser } from "@/context/BrowserContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface NavButtonProps {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  disabled?: boolean;
}

function NavButton({ icon, onPress, disabled = false }: NavButtonProps) {
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
      style={[styles.button, animatedStyle]}
    >
      <Feather
        name={icon}
        size={22}
        color={disabled ? Colors.dark.textSecondary : Colors.dark.text}
      />
    </AnimatedPressable>
  );
}

interface NavigationBarProps {
  onAIPress: () => void;
}

export function NavigationBar({ onAIPress }: NavigationBarProps) {
  const insets = useSafeAreaInsets();
  const { activeTab, goBack, goForward, reload, goHome, isIncognitoMode } =
    useBrowser();

  const backgroundColor = isIncognitoMode
    ? Colors.dark.incognitoBackground
    : Colors.dark.backgroundDefault;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor, paddingBottom: insets.bottom + Spacing.xs },
      ]}
    >
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
      <NavButton icon="cpu" onPress={onAIPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  button: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
  },
});
