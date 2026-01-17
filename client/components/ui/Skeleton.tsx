import React, { useEffect, useRef } from "react";
import {
  Animated,
  View,
  StyleSheet,
  ViewStyle,
  DimensionValue,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface SkeletonProps {
  width: DimensionValue;
  height: DimensionValue;
  style?: ViewStyle;
  borderRadius?: number;
}

export function Skeleton({
  width,
  height,
  style,
  borderRadius = 8,
}: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // حلقة لانهائية من التوهج
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // تغيير الشفافية لخلق تأثير النبض
  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        { opacity, width, height, borderRadius, overflow: "hidden" },
        style,
      ]}
    >
      <LinearGradient
        colors={["#334155", "#475569", "#334155"]} // ألوان رمادية مزرقة تناسب الوضع الليلي
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}
