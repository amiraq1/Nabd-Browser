import React, { useState, useEffect } from "react";
import { View, TextInput, Pressable, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useBrowser } from "@/context/BrowserContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function UrlBar() {
  const colors = useColors();
  const { isDark } = useTheme();
  const { activeTab, navigateTo, isIncognitoMode } = useBrowser();
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (activeTab && !isFocused) {
      setInputValue(activeTab.url);
    }
  }, [activeTab?.url, isFocused]);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigateTo(inputValue.trim());
      setIsFocused(false);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const backgroundColor = isIncognitoMode
    ? colors.incognitoBackground
    : colors.backgroundDefault;

  const inputBg = isIncognitoMode
    ? "rgba(129, 140, 248, 0.15)"
    : colors.backgroundSecondary;

  const renderContent = () => (
    <>
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: inputBg },
          isFocused && { borderColor: colors.accent },
        ]}
      >
        {isIncognitoMode ? (
          <Feather
            name="eye-off"
            size={18}
            color={colors.incognitoAccent}
            style={styles.icon}
          />
        ) : (
          <Feather
            name="search"
            size={18}
            color={colors.textSecondary}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={inputValue}
          onChangeText={setInputValue}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={handleSubmit}
          placeholder="ابحث أو أدخل الرابط"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="go"
          selectTextOnFocus
        />
        {inputValue.length > 0 && isFocused ? (
          <Pressable
            onPress={() => setInputValue("")}
            hitSlop={8}
            style={styles.clearButton}
          >
            <Feather name="x" size={18} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      <AnimatedPressable
        onPress={handleSubmit}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.goButton,
          { backgroundColor: colors.accent },
          animatedStyle,
        ]}
      >
        <Feather name="arrow-left" size={20} color={colors.buttonText} />
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
    borderWidth: 1,
    borderColor: "transparent",
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    textAlign: "left",
    writingDirection: "ltr",
  },
  clearButton: {
    padding: Spacing.xs,
  },
  goButton: {
    width: Spacing.inputHeight,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
});
