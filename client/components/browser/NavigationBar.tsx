import React from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur"; // القاعدة 5: Blur
import * as Haptics from "expo-haptics"; // القاعدة 8
import { useBrowser } from "@/context/BrowserContext";
import { useColors } from "@/hooks/useColors";
import { PulseButton } from "./PulseButton"; // الزر الذي أنشأناه سابقاً
import { Spacing } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // القاعدة 10: Edge-to-edge

interface NavigationBarProps {
  onMenuPress: () => void;
  onTabsPress: () => void;
  onAIPress: () => void;
}

// مكون زر صغير مع Haptics
const NavButton = ({ icon, onPress, disabled = false, color }: any) => (
  <Pressable
    onPress={() => {
      if (!disabled) {
        Haptics.selectionAsync(); // اهتزاز خفيف جداً عند التنقل
        onPress();
      }
    }}
    disabled={disabled}
    style={({ pressed }) => ({
      opacity: disabled ? 0.3 : pressed ? 0.6 : 1,
      padding: 10,
    })}
  >
    <Feather name={icon} size={24} color={color} />
  </Pressable>
);

export function NavigationBar({ onMenuPress, onTabsPress, onAIPress }: NavigationBarProps) {
  const colors = useColors();
  const { goBack, goForward, activeTab } = useBrowser();
  const insets = useSafeAreaInsets(); // لحساب المساحة الآمنة في الأسفل

  // القاعدة 5: Fallback للـ Blur على أندرويد لتجنب مشاكل الأداء
  // ملاحظة: expo-blur أصبح يدعم Android بشكل جيد مؤخراً، لكن الحذر واجب.
  // إذا أردت التأكد من الأداء الأقصى، View هو الخيار الآمن.
  // سأستخدم BlurView مع fallback لتلوين الخلفية إذا لم يتم دعم الشفافية
  const Container = Platform.OS === 'ios' ? BlurView : View;
  const containerProps = Platform.OS === 'ios'
    ? { intensity: 80, tint: "dark" as const, style: styles.absoluteFill }
    : { style: [styles.absoluteFill, { backgroundColor: colors.backgroundSecondary + 'F2' }] }; // لون شبه شفاف قليلاً (F2 = 95%)

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
      <Container {...containerProps as any}>
        {/* محتوى الـ Blur فارغ، هو فقط للخلفية */}
      </Container>

      {/* المحتوى الفعلي */}
      <View style={styles.content}>
        {/* يمين: التنقل */}
        <View style={styles.group}>
          <NavButton icon="chevron-right" onPress={goBack} disabled={!activeTab?.canGoBack} color={colors.text} />
          <NavButton icon="chevron-left" onPress={goForward} disabled={!activeTab?.canGoForward} color={colors.text} />
        </View>

        {/* وسط: نبض */}
        <View style={styles.center}>
          <PulseButton onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onAIPress();
          }} />
        </View>

        {/* يسار: القوائم */}
        <View style={styles.group}>
          <NavButton icon="layers" onPress={onTabsPress} color={colors.text} />
          <NavButton icon="grid" onPress={onMenuPress} color={colors.text} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 65,
    paddingHorizontal: Spacing.lg,
  },
  group: {
    flexDirection: 'row',
    gap: 16,
    width: '35%',
    justifyContent: 'space-around',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    top: -20, // رفع الزر للأعلى
  }
});
