import React from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { Image } from "expo-image"; // القاعدة 3: صور أسرع وأجمل
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics"; // القاعدة 8: إحساس الواجهة
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated"; // القاعدة 6: أنيميشن ناعمة
import { useColors } from "@/hooks/useColors";
import { Shadows, BorderRadius, Spacing } from "@/constants/theme"; // القاعدة 1: نظام التصميم
import type { BrowserTab } from "@/types/browser"; // تصحيح اسم النوع

interface TabCardProps {
  tab: BrowserTab; // تصحيح اسم النوع
  isActive: boolean;
  onPress: () => void;
  onClose: () => void;
  index: number; // الإبقاء على index لأنه قد يستخدم لاحقاً، حتى لو لم نستخدمه الآن
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TabCard({ tab, isActive, onPress, onClose }: TabCardProps) {
  const colors = useColors();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // اهتزاز خفيف عند الإغلاق
    onClose();
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  // استخدام Google Favicon Kit إذا لم يكن Favicon التبويب موجوداً
  const faviconUrl = tab.favicon || `https://www.google.com/s2/favicons?domain=${getDomain(tab.url)}&sz=64`;

  return (
    <AnimatedPressable
      layout={Layout.springify().damping(15)} // تحريك العناصر المجاورة بنعومة عند الحذف
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      onPress={handlePress}
      style={[
        styles.container,
        {
          backgroundColor: isActive ? colors.backgroundSecondary : colors.backgroundDefault, // تعديل طفيف ليتماشى مع الوضع الداكن
          borderColor: isActive ? colors.accent : colors.border,
        },
      ]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border + '40' }]}>
        {/* أيقونة الموقع باستخدام expo-image */}
        <View style={styles.faviconContainer}>
          <Image
            source={{ uri: faviconUrl }}
            style={styles.favicon}
            contentFit="contain"
            transition={200} // انتقال ناعم لمنع الوميض
            cachePolicy="memory-disk" // كاش قوي
          />
        </View>

        <Text
          numberOfLines={1}
          style={[
            styles.title,
            { color: isActive ? colors.accent : colors.text, fontWeight: isActive ? "600" : "400" }
          ]}
        >
          {tab.title || "تبويب جديد"}
        </Text>

        <Pressable
          onPress={handleClose}
          hitSlop={10} // توسيع مساحة اللمس
          style={({ pressed }) => [
            styles.closeBtn,
            { backgroundColor: pressed ? colors.error + "20" : "transparent" },
          ]}
        >
          <Feather name="x" size={16} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* معاينة بسيطة (يمكن تطويرها لاحقاً لتعرض Screenshot حقيقي) */}
      <View style={[styles.preview, { backgroundColor: colors.backgroundRoot }]} >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.1 }}>
          <Feather name="layout" size={40} color={colors.textSecondary} />
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 160, // ارتفاع ثابت
    borderRadius: BorderRadius.lg, // 16
    borderWidth: 2,
    marginBottom: Spacing.md, // 12
    overflow: "hidden",
    ...Shadows.sm, // القاعدة 1: ظلال موحدة
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm, // 8
    borderBottomWidth: 1,
    height: 48,
  },
  faviconContainer: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
  },
  favicon: {
    width: 18,
    height: 18,
  },
  title: {
    flex: 1,
    fontSize: 14,
    textAlign: "right", // للعربية
    marginRight: 8,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    flex: 1,
    opacity: 0.8,
  },
});
