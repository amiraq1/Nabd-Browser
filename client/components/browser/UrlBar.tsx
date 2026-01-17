import React, { useState, useEffect } from "react";
import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useBrowser } from "@/context/BrowserContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function UrlBar() {
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
    ? Colors.dark.incognitoBackground
    : Colors.dark.backgroundDefault;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
        ]}
      >
        {isIncognitoMode ? (
          <Feather
            name="eye-off"
            size={18}
            color={Colors.dark.incognitoAccent}
            style={styles.icon}
          />
        ) : (
          <Feather
            name="search"
            size={18}
            color={Colors.dark.textSecondary}
            style={styles.icon}
          />
        )}
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={setInputValue}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={handleSubmit}
          placeholder="ابحث أو أدخل الرابط"
          placeholderTextColor={Colors.dark.textSecondary}
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
            <Feather name="x" size={18} color={Colors.dark.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      <AnimatedPressable
        onPress={handleSubmit}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.goButton, animatedStyle]}
      >
        <Feather name="arrow-left" size={20} color={Colors.dark.buttonText} />
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputContainerFocused: {
    borderColor: Colors.dark.accent,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    color: Colors.dark.text,
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
    backgroundColor: Colors.dark.accent,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
});
