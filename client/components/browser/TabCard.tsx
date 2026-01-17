import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import type { BrowserTab } from "@/types/browser";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TabCardProps {
  tab: BrowserTab;
  isActive: boolean;
  onPress: () => void;
  onClose: () => void;
  index: number;
}

export function TabCard({ tab, isActive, onPress, onClose, index }: TabCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
  };

  const backgroundColor = tab.isIncognito
    ? Colors.dark.incognitoBackground
    : Colors.dark.backgroundSecondary;

  const borderColor = isActive
    ? Colors.dark.accent
    : tab.isIncognito
    ? Colors.dark.incognitoAccent
    : "transparent";

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <Animated.View entering={FadeIn.delay(index * 50).duration(200)}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={() => (scale.value = withSpring(0.97))}
        onPressOut={() => (scale.value = withSpring(1))}
        style={[
          styles.container,
          { backgroundColor, borderColor },
          animatedStyle,
        ]}
      >
        <View style={styles.header}>
          {tab.isIncognito ? (
            <Feather
              name="eye-off"
              size={14}
              color={Colors.dark.incognitoAccent}
            />
          ) : (
            <Feather name="globe" size={14} color={Colors.dark.textSecondary} />
          )}
          <Pressable
            onPress={handleClose}
            hitSlop={8}
            style={styles.closeButton}
          >
            <Feather name="x" size={16} color={Colors.dark.textSecondary} />
          </Pressable>
        </View>
        <View style={styles.content}>
          <ThemedText
            numberOfLines={1}
            style={[
              styles.title,
              tab.isIncognito && { color: Colors.dark.incognitoAccent },
            ]}
          >
            {tab.title}
          </ThemedText>
          <ThemedText numberOfLines={1} style={styles.url}>
            {getDomain(tab.url)}
          </ThemedText>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 2,
    minHeight: 120,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  url: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
});
