import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { Shadows, AnimationConfig } from "@/constants/theme";
import { useEffect } from "react";

interface PulseButtonProps {
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export function PulseButton({ onPress }: PulseButtonProps) {
  const colors = useColors();

  // Breathing animation values
  const breathe = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Organic breathing animation
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 2000,
          easing: Easing.bezier(0.4, 0, 0.2, 1)
        }),
        withTiming(0, {
          duration: 2000,
          easing: Easing.bezier(0.4, 0, 0.2, 1)
        }),
      ),
      -1, // Infinite
      false
    );

    // Subtle glow pulse
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1800 }),
        withTiming(0.2, { duration: 1800 }),
      ),
      -1,
      false
    );

    // Very subtle ambient rotation
    rotation.value = withRepeat(
      withSequence(
        withTiming(3, { duration: 4000 }),
        withTiming(-3, { duration: 4000 }),
      ),
      -1,
      true
    );
  }, []);

  // Outer glow ring animation
  const glowStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(breathe.value, [0, 1], [1, 1.25]);
    return {
      transform: [{ scale: scaleValue }],
      opacity: glowOpacity.value,
    };
  });

  // Inner shimmer ring
  const innerRingStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(breathe.value, [0, 1], [1, 1.12]);
    const opacityValue = interpolate(breathe.value, [0, 1], [0.5, 0.2]);
    return {
      transform: [{ scale: scaleValue }],
      opacity: opacityValue,
    };
  });

  // Button press animation
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, AnimationConfig.springBouncy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, AnimationConfig.spring);
  };

  return (
    <View style={styles.container}>
      {/* Outer Glow Ring */}
      <Animated.View
        style={[
          styles.glowRing,
          { backgroundColor: colors.accent },
          glowStyle,
        ]}
      />

      {/* Inner Shimmer Ring */}
      <Animated.View
        style={[
          styles.innerRing,
          { borderColor: colors.accent },
          innerRingStyle,
        ]}
      />

      {/* Main Button */}
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.buttonWrapper, buttonStyle]}
      >
        <LinearGradient
          colors={[colors.accent, "#6366F1", "#8B5CF6"]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Glass overlay effect */}
          <View style={styles.glassOverlay} />

          {/* Icon */}
          <Feather
            name="activity"
            size={26}
            color="#FFF"
            style={styles.icon}
          />
        </LinearGradient>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  glowRing: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  innerRing: {
    position: "absolute",
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1.5,
    backgroundColor: "transparent",
  },
  buttonWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    ...Shadows.xl,
  },
  gradient: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: "50%",
  },
  icon: {
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
