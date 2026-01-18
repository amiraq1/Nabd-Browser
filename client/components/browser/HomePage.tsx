import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Dimensions,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  FadeInUp,
  FadeInDown,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useBrowser } from "@/context/BrowserContext";
import { useColors } from "@/hooks/useColors";
import { Spacing, BorderRadius, Shadows, AnimationConfig } from "@/constants/theme";

// Logo
const NabdLogo = require("@/../../assets/images/nabd_logo.png");

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ✨ Avant-Garde Dark Theme
const THEME = {
  gradientStart: "#030712",
  gradientMid: "#0F172A",
  gradientEnd: "#1E1B4B",
  accent: "#14FFEC",
  accentSecondary: "#8B5CF6",
  text: "#FAFAFA",
  textSecondary: "#94A3B8",
  glassBorder: "rgba(255, 255, 255, 0.08)",
  glassBackground: "rgba(255, 255, 255, 0.04)",
};

// ✨ Shortcut Data
const shortcuts = [
  { name: "Google", url: "https://google.com", icon: "search", gradient: ["#4285F4", "#34A853"] },
  { name: "YouTube", url: "https://youtube.com", icon: "youtube", gradient: ["#FF0000", "#CC0000"] },
  { name: "X", url: "https://twitter.com", icon: "twitter", gradient: ["#1DA1F2", "#14171A"] },
  { name: "GitHub", url: "https://github.com", icon: "github", gradient: ["#6E5494", "#24292E"] },
  { name: "ChatGPT", url: "https://chat.openai.com", icon: "message-square", gradient: ["#10A37F", "#1A7F64"] },
  { name: "Amazon", url: "https://amazon.com", icon: "shopping-cart", gradient: ["#FF9900", "#FF6600"] },
];

// ✨ Shortcut Card Component
const ShortcutCard = ({
  item,
  index,
  onPress
}: {
  item: typeof shortcuts[0];
  index: number;
  onPress: () => void;
}) => {
  const scale = useSharedValue(1);
  const colors = useColors();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, AnimationConfig.springBouncy);
    Haptics.selectionAsync();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, AnimationConfig.spring);
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 60).duration(400).springify()}
      style={[styles.cardWrapper, animatedStyle]}
    >
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.cardPressable}
      >
        <BlurView intensity={25} tint="dark" style={styles.card}>
          <LinearGradient
            colors={item.gradient as any}
            style={styles.iconBox}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name={item.icon as any} size={22} color="#FFF" />
          </LinearGradient>
          <Text style={styles.cardText}>{item.name}</Text>
        </BlurView>
      </AnimatedPressable>
    </Animated.View>
  );
};

// ✨ Animated Glow Orb
const GlowOrb = ({ delay = 0, size = 200, color = THEME.accent }) => {
  const opacity = useSharedValue(0.15);
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.3, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 4000 }),
          withTiming(1, { duration: 4000 })
        ),
        -1,
        true
      )
    );

    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-20, { duration: 5000 }),
          withTiming(20, { duration: 5000 })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

export function HomePage() {
  const { navigateTo } = useBrowser();
  const colors = useColors();

  const handleSearch = (text: string) => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = text.includes(".")
      ? text.startsWith("http") ? text : `https://${text}`
      : `https://www.google.com/search?q=${encodeURIComponent(text)}`;
    navigateTo(url);
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={[THEME.gradientStart, THEME.gradientMid, THEME.gradientEnd]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Ambient Glow Orbs */}
      <View style={styles.orbContainer}>
        <View style={styles.orbLeft}>
          <GlowOrb size={250} color={THEME.accent} delay={0} />
        </View>
        <View style={styles.orbRight}>
          <GlowOrb size={200} color={THEME.accentSecondary} delay={1500} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(600).springify()}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoGlow} />
            <Image
              source={NabdLogo}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>
            NABDH <Text style={styles.titleAccent}>PRO</Text>
          </Text>
          <Text style={styles.subtitle}>تصفح المستقبل، اليوم</Text>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(400)}
          style={styles.searchWrapper}
        >
          <BlurView intensity={20} tint="dark" style={styles.searchContainer}>
            <Feather name="search" size={20} color={THEME.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="ابحث أو اكتب عنوان URL..."
              placeholderTextColor={THEME.textSecondary}
              onSubmitEditing={(e) => handleSearch(e.nativeEvent.text)}
              returnKeyType="search"
              textAlign="right"
            />
            <Pressable
              style={styles.micButton}
              onPress={() => Haptics.selectionAsync()}
            >
              <Feather name="mic" size={16} color={THEME.accent} />
            </Pressable>
          </BlurView>
        </Animated.View>

        {/* Shortcuts Grid */}
        <View style={styles.gridContainer}>
          {shortcuts.map((item, index) => (
            <ShortcutCard
              key={index}
              item={item}
              index={index}
              onPress={() => navigateTo(item.url)}
            />
          ))}
        </View>

        {/* AI Suggestion Card */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(400)}
          style={styles.suggestionWrapper}
        >
          <BlurView intensity={15} tint="dark" style={styles.suggestionCard}>
            <LinearGradient
              colors={[`${THEME.accent}20`, `${THEME.accentSecondary}10`]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.suggestionHeader}>
              <View style={styles.suggestionIconBg}>
                <Feather name="zap" size={18} color={THEME.accent} />
              </View>
              <Text style={styles.suggestionTitle}>اقتراحات الذكاء الاصطناعي</Text>
            </View>
            <Text style={styles.suggestionDesc}>
              جرب ميزة التلخيص الجديدة لقراءة المقالات الطويلة في ثوانٍ. اضغط على زر النبض للبدء.
            </Text>
          </BlurView>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  orbLeft: {
    position: "absolute",
    top: "10%",
    left: "-20%",
  },
  orbRight: {
    position: "absolute",
    bottom: "20%",
    right: "-15%",
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingTop: 100,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoContainer: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: THEME.accent,
    opacity: 0.25,
  },
  logoImage: {
    width: 90,
    height: 90,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: THEME.text,
    letterSpacing: 2,
  },
  titleAccent: {
    color: THEME.accent,
  },
  subtitle: {
    fontSize: 15,
    color: THEME.textSecondary,
    marginTop: 8,
    fontWeight: "400",
    letterSpacing: 0.5,
  },
  searchWrapper: {
    width: "100%",
    marginBottom: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 56,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: 20,
    backgroundColor: THEME.glassBackground,
    borderWidth: 1,
    borderColor: THEME.glassBorder,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    color: THEME.text,
    fontSize: 16,
    marginHorizontal: 12,
    height: "100%",
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${THEME.accent}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
    width: "100%",
  },
  cardWrapper: {
    width: "30%",
    aspectRatio: 1,
  },
  cardPressable: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  card: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.glassBackground,
    borderWidth: 1,
    borderColor: THEME.glassBorder,
    gap: 10,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    color: THEME.text,
    fontSize: 12,
    fontWeight: "600",
  },
  suggestionWrapper: {
    width: "100%",
    marginTop: 40,
  },
  suggestionCard: {
    width: "100%",
    padding: 20,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: THEME.glassBorder,
    overflow: "hidden",
  },
  suggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  suggestionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${THEME.accent}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionTitle: {
    color: THEME.text,
    fontWeight: "700",
    fontSize: 16,
    flex: 1,
    textAlign: "right",
  },
  suggestionDesc: {
    color: THEME.textSecondary,
    lineHeight: 24,
    textAlign: "right",
    fontSize: 14,
  },
});
