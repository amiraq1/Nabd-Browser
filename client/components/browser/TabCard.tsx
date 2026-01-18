import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { Shadows, BorderRadius, Spacing, AnimationConfig } from "@/constants/theme";
import type { BrowserTab } from "@/types/browser";
import { ScaleButton } from "@/components/ui/ScaleButton";

interface TabCardProps {
  tab: BrowserTab;
  isActive: boolean;
  onPress: () => void;
  onClose: () => void;
  index: number;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function TabCard({ tab, isActive, onPress, onClose, index }: TabCardProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  const faviconUrl = tab.favicon ||
    `https://www.google.com/s2/favicons?domain=${getDomain(tab.url)}&sz=64`;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, AnimationConfig.springBouncy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, AnimationConfig.spring);
  };

  const isIncognito = tab.isIncognito;
  const borderColor = isActive
    ? (isIncognito ? colors.incognitoAccent : colors.accent)
    : colors.border;

  return (
    <AnimatedView
      layout={Layout.springify().damping(18)}
      entering={FadeIn.delay(index * 50).duration(200)}
      exiting={FadeOut.duration(150)}
      style={[styles.wrapper, animatedStyle]}
    >
      <ScaleButton
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        hapticStyle="none"
        style={[
          styles.container,
          {
            backgroundColor: colors.backgroundDefault,
            borderColor,
          },
        ]}
      >
        {/* Active Indicator Gradient */}
        {isActive && (
          <LinearGradient
            colors={isIncognito
              ? [`${colors.incognitoAccent}20`, "transparent"]
              : [`${colors.accent}15`, "transparent"]
            }
            style={styles.activeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        )}

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: `${colors.border}60` }]}>
          {/* Favicon */}
          <View
            style={[
              styles.faviconContainer,
              {
                backgroundColor: isIncognito
                  ? `${colors.incognitoAccent}15`
                  : `${colors.accent}10`
              }
            ]}
          >
            {isIncognito ? (
              <Feather name="eye-off" size={14} color={colors.incognitoAccent} />
            ) : (
              <Image
                source={{ uri: faviconUrl }}
                style={styles.favicon}
                contentFit="contain"
                transition={200}
                cachePolicy="memory-disk"
              />
            )}
          </View>

          {/* Title */}
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              {
                color: isActive
                  ? (isIncognito ? colors.incognitoAccent : colors.accent)
                  : colors.text,
                fontWeight: isActive ? "600" : "500",
              }
            ]}
          >
            {tab.title || "تبويب جديد"}
          </Text>

          {/* Close Button */}
          <ScaleButton
            onPress={handleClose}
            scaleTo={0.85}
            hitSlop={10}
            style={[
              styles.closeBtn,
              { backgroundColor: `${colors.error}10` }
            ]}
          >
            <Feather name="x" size={14} color={colors.error} />
          </ScaleButton>
        </View>

        {/* Preview Area */}
        <View style={[styles.preview, { backgroundColor: colors.backgroundSecondary }]}>
          {/* URL Display */}
          <View style={styles.urlContainer}>
            <Feather
              name={isIncognito ? "eye-off" : "globe"}
              size={12}
              color={colors.textSecondary}
            />
            <Text
              numberOfLines={1}
              style={[styles.urlText, { color: colors.textSecondary }]}
            >
              {getDomain(tab.url)}
            </Text>
          </View>

          {/* Placeholder Icon */}
          <View style={styles.previewIcon}>
            <Feather
              name="layout"
              size={28}
              color={colors.textSecondary}
              style={{ opacity: 0.15 }}
            />
          </View>
        </View>

        {/* Active Badge */}
        {isActive && (
          <View
            style={[
              styles.activeBadge,
              {
                backgroundColor: isIncognito ? colors.incognitoAccent : colors.accent
              }
            ]}
          >
            <Feather name="check" size={10} color="#000" />
          </View>
        )}
      </ScaleButton>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    height: 150,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    overflow: "hidden",
    ...Shadows.md,
  },
  activeGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    borderBottomWidth: 1,
    height: 46,
    zIndex: 1,
  },
  faviconContainer: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
    borderRadius: 8,
  },
  favicon: {
    width: 16,
    height: 16,
  },
  title: {
    flex: 1,
    fontSize: 13,
    textAlign: "right",
    marginRight: Spacing.xs,
  },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  preview: {
    flex: 1,
    padding: Spacing.sm,
    justifyContent: "space-between",
  },
  urlContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-end",
  },
  urlText: {
    fontSize: 11,
    maxWidth: 100,
  },
  previewIcon: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  activeBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
