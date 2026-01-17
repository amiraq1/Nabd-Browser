import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";

interface ProgressBarProps {
  isLoading: boolean;
  progress: number;
}

export function ProgressBar({ isLoading, progress }: ProgressBarProps) {
  const colors = useColors();
  const width = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isLoading) {
      opacity.value = withTiming(1, { duration: 100 });
      width.value = withTiming(progress * 100, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });
    } else {
      width.value = withSequence(
        withTiming(100, { duration: 100 }),
        withTiming(100, { duration: 200 }),
      );
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isLoading, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.bar, { backgroundColor: colors.accent }, animatedStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 3,
    backgroundColor: "transparent",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  bar: {
    height: "100%",
    borderRadius: 2,
  },
});
