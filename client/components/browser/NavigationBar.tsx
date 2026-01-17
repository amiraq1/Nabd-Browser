import React from "react";
import { View, StyleSheet, Pressable, Platform, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useBrowser } from "@/context/BrowserContext";
import { useColors } from "@/hooks/useColors";
import { PulseButton } from "./PulseButton";
import { Spacing, BorderRadius } from "@/constants/theme";

interface NavigationBarProps {
  onMenuPress: () => void;
  onTabsPress: () => void;
  onAIPress: () => void;
}

export function NavigationBar({
  onMenuPress,
  onTabsPress,
  onAIPress,
}: NavigationBarProps) {
  const colors = useColors();
  const { goBack, goForward, activeTab } = useBrowser();

  return (
    <View style={styles.wrapper}>
      {/* الخلفية الزجاجية للشريط */}
      <BlurView
        intensity={Platform.OS === "ios" ? 80 : 100}
        tint="dark"
        style={styles.blurContainer}
      >
        <View
          style={[
            styles.container,
            { backgroundColor: colors.backgroundSecondary + "CC" },
          ]}
        >
          {/* الجانب الأيمن: الرجوع والتقدم */}
          <View style={styles.sideGroup}>
            <Pressable
              onPress={goBack}
              disabled={!activeTab?.canGoBack}
              style={({ pressed }) => [
                styles.iconBtn,
                { opacity: !activeTab?.canGoBack ? 0.3 : pressed ? 0.5 : 1 },
              ]}
            >
              <Feather name="chevron-right" size={24} color={colors.text} />
            </Pressable>

            <Pressable
              onPress={goForward}
              disabled={!activeTab?.canGoForward}
              style={({ pressed }) => [
                styles.iconBtn,
                { opacity: !activeTab?.canGoForward ? 0.3 : pressed ? 0.5 : 1 },
              ]}
            >
              <Feather name="chevron-left" size={24} color={colors.text} />
            </Pressable>
          </View>

          {/* المنتصف: زر نبض العائم */}
          <View style={styles.centerButtonContainer}>
            <PulseButton onPress={onAIPress} />
          </View>

          {/* الجانب الأيسر: التبويبات والقائمة */}
          <View style={styles.sideGroup}>
            <Pressable
              onPress={onTabsPress}
              style={({ pressed }) => [
                styles.iconBtn,
                { opacity: pressed ? 0.5 : 1 },
              ]}
            >
              <View style={styles.tabIcon}>
                <Feather name="layers" size={22} color={colors.text} />
                {/* رقم التبويبات المفتوحة يمكن إضافته هنا */}
              </View>
            </Pressable>

            <Pressable
              onPress={onMenuPress}
              style={({ pressed }) => [
                styles.iconBtn,
                { opacity: pressed ? 0.5 : 1 },
              ]}
            >
              <Feather name="grid" size={22} color={colors.text} />
            </Pressable>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  blurContainer: {
    width: "100%",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 80,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  sideGroup: {
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
    width: "35%",
    justifyContent: "space-around",
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    marginTop: -40,
  },
  iconBtn: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIcon: {
    position: "relative",
  },
});
