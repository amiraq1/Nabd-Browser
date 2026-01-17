import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { useColors } from "@/hooks/useColors";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { BrowserTab } from "@/types/browser";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TabCardProps {
  tab: BrowserTab;
  isActive: boolean;
  onPress: () => void;
  onClose: () => void;
  index: number;
}

export function TabCard({
  tab,
  isActive,
  onPress,
  onClose,
  index,
}: TabCardProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
  };

  const triggerClose = () => {
    handleClose();
  };

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onUpdate((event) => {
      translateX.value = event.translationX * 0.5;
      opacity.value = 1 - Math.abs(event.translationX) / 300;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > 100) {
        translateX.value = withSpring(event.translationX > 0 ? 300 : -300);
        opacity.value = withSpring(0, {}, () => {
          runOnJS(triggerClose)();
        });
      } else {
        translateX.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    });

  const backgroundColor = tab.isIncognito
    ? colors.incognitoBackground
    : colors.backgroundSecondary;

  const borderColor = isActive
    ? colors.accent
    : tab.isIncognito
      ? colors.incognitoAccent
      : colors.border;

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  // ✅ استخدام Google Favicon Kit لجلب الأيقونات
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${getDomain(tab.url)}&sz=64`;

  return (
    <Animated.View entering={FadeIn.delay(index * 50).duration(200)}>
      <GestureDetector gesture={swipeGesture}>
        <AnimatedPressable
          onPress={handlePress}
          onPressIn={() =>
            (scale.value = withSpring(0.95, { damping: 10, stiffness: 300 }))
          }
          onPressOut={() =>
            (scale.value = withSpring(1, { damping: 10, stiffness: 300 }))
          }
          style={[
            styles.container,
            { backgroundColor, borderColor },
            animatedStyle,
          ]}
        >
          <View style={styles.header}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.backgroundTertiary },
              ]}
            >
              {tab.isIncognito ? (
                <Feather
                  name="eye-off"
                  size={12}
                  color={colors.incognitoAccent}
                />
              ) : (
                // ✅ استخدام expo-image
                <Image
                  source={{ uri: faviconUrl }}
                  style={{ width: 16, height: 16 }}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                  transition={200}
                />
              )}
            </View>
            <Pressable
              onPress={handleClose}
              hitSlop={8}
              style={[
                styles.closeButton,
                { backgroundColor: colors.backgroundTertiary },
              ]}
            >
              <Feather name="x" size={14} color={colors.textSecondary} />
            </Pressable>
          </View>
          <View style={styles.content}>
            <ThemedText
              numberOfLines={2}
              style={[
                styles.title,
                { color: colors.text },
                tab.isIncognito && { color: colors.incognitoAccent },
              ]}
            >
              {tab.title}
            </ThemedText>
            <ThemedText
              numberOfLines={1}
              style={[styles.url, { color: colors.textSecondary }]}
            >
              {getDomain(tab.url)}
            </ThemedText>
          </View>
          {isActive ? (
            <View
              style={[
                styles.activeIndicator,
                { backgroundColor: colors.accent },
              ]}
            />
          ) : null}
        </AnimatedPressable>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 2,
    minHeight: 140,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  url: {
    fontSize: 11,
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: Spacing.md,
    right: Spacing.md,
    height: 3,
    borderRadius: 2,
  },
});
