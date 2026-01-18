import React, { useState, useEffect } from "react";
import { View, TextInput, Pressable, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { Spacing, BorderRadius, Shadows, AnimationConfig } from "@/constants/theme";
import { useBrowser } from "@/context/BrowserContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

export function UrlBar() {
  const colors = useColors();
  const { isDark } = useTheme();
  const { activeTab, navigateTo, isIncognitoMode, reload, activeTabId } = useBrowser();
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Animation values
  const scale = useSharedValue(1);
  const borderProgress = useSharedValue(0);
  const iconRotation = useSharedValue(0);

  useEffect(() => {
    if (activeTab && !isFocused) {
      setInputValue(activeTab.url);
    }
  }, [activeTab?.url, isFocused]);

  useEffect(() => {
    borderProgress.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused]);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigateTo(inputValue.trim());
      setIsFocused(false);
    }
  };

  const handleReload = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    iconRotation.value = withSpring(iconRotation.value + 360, AnimationConfig.spring);
    reload();
  };

  // Button animation
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, AnimationConfig.springBouncy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, AnimationConfig.spring);
  };

  // Container animated style
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      ["transparent", colors.accent]
    ),
    borderWidth: 1.5,
  }));

  // Icon rotation style
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotation.value}deg` }],
  }));

  const backgroundColor = isIncognitoMode
    ? colors.incognitoBackground
    : colors.backgroundDefault;

  const inputBg = isIncognitoMode
    ? "rgba(139, 92, 246, 0.15)"
    : colors.backgroundSecondary;

  const renderContent = () => (
    <>
      <AnimatedView
        style={[
          styles.inputContainer,
          { backgroundColor: inputBg },
          containerAnimatedStyle,
        ]}
      >
        {/* Left Icon - Lock/Incognito indicator */}
        <View style={styles.leftIcon}>
          {isIncognitoMode ? (
            <Feather name="eye-off" size={18} color={colors.incognitoAccent} />
          ) : activeTab?.url?.startsWith("https") ? (
            <Feather name="lock" size={16} color={colors.success} />
          ) : (
            <Feather name="search" size={18} color={colors.textSecondary} />
          )}
        </View>

        {/* Input */}
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={inputValue}
          onChangeText={setInputValue}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={handleSubmit}
          placeholder={isIncognitoMode ? "تصفح خاص..." : "ابحث أو أدخل الرابط"}
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="go"
          selectTextOnFocus
        />

        {/* Right Actions */}
        <View style={styles.rightActions}>
          {inputValue.length > 0 && isFocused ? (
            <Pressable
              onPress={() => setInputValue("")}
              hitSlop={8}
              style={styles.clearButton}
            >
              <Feather name="x" size={18} color={colors.textSecondary} />
            </Pressable>
          ) : activeTab && !isFocused ? (
            <AnimatedPressable
              onPress={handleReload}
              hitSlop={8}
              style={[styles.clearButton, iconAnimatedStyle]}
            >
              <Feather name="refresh-cw" size={16} color={colors.textSecondary} />
            </AnimatedPressable>
          ) : null}
        </View>
      </AnimatedView>

      {/* Go Button */}
      <AnimatedPressable
        onPress={handleSubmit}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.goButton, buttonAnimatedStyle]}
      >
        <LinearGradient
          colors={[colors.accent, "#6366F1"]}
          style={styles.goButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Feather name="arrow-left" size={20} color="#FFF" />
        </LinearGradient>
      </AnimatedPressable>
    </>
  );

  if (Platform.OS === "ios" && !isIncognitoMode) {
    return (
      <BlurView
        intensity={80}
        tint={isDark ? "dark" : "light"}
        style={[styles.container, { backgroundColor: "transparent" }]}
      >
        <View style={styles.innerContainer}>{renderContent()}</View>
      </BlurView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.innerContainer}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.md,
    ...Shadows.sm,
  },
  leftIcon: {
    marginRight: Spacing.sm,
    width: 24,
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 15,
    textAlign: "left",
    writingDirection: "ltr",
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  clearButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  goButton: {
    width: Spacing.inputHeight,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    ...Shadows.md,
  },
  goButtonGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
