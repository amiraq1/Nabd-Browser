import React from "react";
import { Pressable, ViewStyle, StyleProp, PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { AnimationConfig } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  hapticStyle?: "light" | "medium" | "heavy" | "none";
}

export function ScaleButton({
  children,
  onPress,
  onPressIn,
  onPressOut,
  style,
  scaleTo = 0.96,
  hapticStyle = "light",
  disabled,
  ...pressableProps
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(scaleTo, AnimationConfig.springBouncy);
      onPressIn?.();
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, AnimationConfig.spring);
    onPressOut?.();
  };

  const handlePress = () => {
    if (!disabled) {
      // Haptic feedback
      if (hapticStyle !== "none") {
        const feedbackStyle = {
          light: Haptics.ImpactFeedbackStyle.Light,
          medium: Haptics.ImpactFeedbackStyle.Medium,
          heavy: Haptics.ImpactFeedbackStyle.Heavy,
        };
        Haptics.impactAsync(feedbackStyle[hapticStyle]);
      }
      onPress?.();
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[animatedStyle, style]}
      {...pressableProps}
    >
      {children}
    </AnimatedPressable>
  );
}
