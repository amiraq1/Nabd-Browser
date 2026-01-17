import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    TextInput,
    Animated,
    Dimensions,
    I18nManager,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useBrowser } from "@/context/BrowserContext";
import { Spacing, BorderRadius, Typography, Shadows } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Shortcut {
    name: string;
    nameAr: string;
    url: string;
    icon: keyof typeof Feather.glyphMap;
    gradient: readonly [string, string];
}

interface QuickTip {
    id: string;
    title: string;
    description: string;
    icon: keyof typeof Feather.glyphMap;
}

const shortcuts: Shortcut[] = [
    {
        name: "Google",
        nameAr: "جوجل",
        url: "https://google.com",
        icon: "search",
        gradient: ["#4285F4", "#34A853"] as const,
    },
    {
        name: "YouTube",
        nameAr: "يوتيوب",
        url: "https://youtube.com",
        icon: "youtube",
        gradient: ["#FF0000", "#CC0000"] as const,
    },
    {
        name: "Twitter",
        nameAr: "تويتر",
        url: "https://twitter.com",
        icon: "twitter",
        gradient: ["#1DA1F2", "#0A8AD8"] as const,
    },
    {
        name: "GitHub",
        nameAr: "جيت هب",
        url: "https://github.com",
        icon: "github",
        gradient: ["#333333", "#24292E"] as const,
    },
    {
        name: "Wikipedia",
        nameAr: "ويكيبيديا",
        url: "https://ar.wikipedia.org",
        icon: "book-open",
        gradient: ["#636466", "#8B8D8F"] as const,
    },
    {
        name: "LinkedIn",
        nameAr: "لينكد إن",
        url: "https://linkedin.com",
        icon: "linkedin",
        gradient: ["#0077B5", "#005582"] as const,
    },
    {
        name: "Reddit",
        nameAr: "ريديت",
        url: "https://reddit.com",
        icon: "message-circle",
        gradient: ["#FF4500", "#FF5722"] as const,
    },
    {
        name: "Pinterest",
        nameAr: "بنترست",
        url: "https://pinterest.com",
        icon: "image",
        gradient: ["#E60023", "#BD081C"] as const,
    },
];

const quickTips: QuickTip[] = [
    {
        id: "1",
        title: "تصفح خاص",
        description: "اضغط مطولاً على زر + لفتح تبويب متخفي",
        icon: "eye-off",
    },
    {
        id: "2",
        title: "الذكاء الاصطناعي",
        description: "استخدم AI لتلخيص أي صفحة فوراً",
        icon: "cpu",
    },
    {
        id: "3",
        title: "البحث السريع",
        description: "اكتب في شريط العنوان للبحث مباشرة",
        icon: "zap",
    },
];

export function HomePage() {
    const colors = useColors();
    const { navigateTo } = useBrowser();

    // Animation refs
    const logoScale = useRef(new Animated.Value(0)).current;
    const logoRotate = useRef(new Animated.Value(0)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const searchBarSlide = useRef(new Animated.Value(50)).current;
    const cardAnimations = useRef(
        shortcuts.map(() => new Animated.Value(0))
    ).current;
    const tipSlide = useRef(new Animated.Value(100)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Staggered entrance animations
        Animated.sequence([
            // Logo entrance
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(logoRotate, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
            // Title fade in
            Animated.timing(titleOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            // Search bar slide up
            Animated.spring(searchBarSlide, {
                toValue: 0,
                tension: 60,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // Staggered cards animation
        cardAnimations.forEach((anim, index) => {
            Animated.timing(anim, {
                toValue: 1,
                duration: 400,
                delay: 300 + index * 80,
                useNativeDriver: true,
            }).start();
        });

        // Tips slide in
        Animated.timing(tipSlide, {
            toValue: 0,
            duration: 600,
            delay: 800,
            useNativeDriver: true,
        }).start();

        // Continuous pulse animation for logo
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const logoRotation = logoRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    const handleSearch = (text: string) => {
        if (text.trim()) {
            const isUrl = /^(https?:\/\/|www\.)/i.test(text) || /\.[a-z]{2,}$/i.test(text);
            if (isUrl) {
                const url = text.startsWith("http") ? text : `https://${text}`;
                navigateTo(url);
            } else {
                navigateTo(`https://www.google.com/search?q=${encodeURIComponent(text)}`);
            }
        }
    };

    return (
        <ScrollView
            style={[styles.scrollView, { backgroundColor: colors.backgroundRoot }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* Header Section with Gradient */}
            <LinearGradient
                colors={[colors.backgroundSecondary, colors.backgroundRoot]}
                style={styles.headerGradient}
            >
                {/* Animated Logo */}
                <Animated.View
                    style={[
                        styles.logoContainer,
                        {
                            transform: [
                                { scale: Animated.multiply(logoScale, pulseAnim) },
                                { rotate: logoRotation },
                            ],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={[colors.accent, "#0891B2"]}
                        style={styles.logoCircle}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Feather name="activity" size={48} color="#FFFFFF" />
                    </LinearGradient>
                </Animated.View>

                {/* Title & Subtitle */}
                <Animated.View style={{ opacity: titleOpacity }}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        متصفح نبض
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        تصفح العالم بأمان وسرعة ✨
                    </Text>
                </Animated.View>

                {/* Search Bar */}
                <Animated.View
                    style={[
                        styles.searchContainer,
                        {
                            backgroundColor: colors.backgroundDefault,
                            borderColor: colors.border,
                            transform: [{ translateY: searchBarSlide }],
                        },
                    ]}
                >
                    <Feather name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="ابحث أو اكتب عنوان URL..."
                        placeholderTextColor={colors.textSecondary}
                        onSubmitEditing={(e) => handleSearch(e.nativeEvent.text)}
                        returnKeyType="search"
                        textAlign="right"
                    />
                    <Pressable
                        style={({ pressed }) => [
                            styles.voiceButton,
                            { backgroundColor: colors.accent, opacity: pressed ? 0.8 : 1 },
                        ]}
                    >
                        <Feather name="mic" size={16} color="#FFFFFF" />
                    </Pressable>
                </Animated.View>
            </LinearGradient>

            {/* Quick Shortcuts Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Feather name="grid" size={18} color={colors.accent} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        الاختصارات السريعة
                    </Text>
                </View>

                <View style={styles.shortcutsGrid}>
                    {shortcuts.map((item, index) => (
                        <Animated.View
                            key={item.name}
                            style={{
                                opacity: cardAnimations[index],
                                transform: [
                                    {
                                        translateY: cardAnimations[index].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [30, 0],
                                        }),
                                    },
                                    {
                                        scale: cardAnimations[index].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.8, 1],
                                        }),
                                    },
                                ],
                            }}
                        >
                            <Pressable
                                style={({ pressed }) => [
                                    styles.shortcutCard,
                                    {
                                        backgroundColor: colors.backgroundSecondary,
                                        borderColor: pressed ? colors.accent : colors.border,
                                        transform: [{ scale: pressed ? 0.95 : 1 }],
                                    },
                                ]}
                                onPress={() => navigateTo(item.url)}
                            >
                                <LinearGradient
                                    colors={item.gradient}
                                    style={styles.shortcutIcon}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Feather name={item.icon} size={22} color="#FFFFFF" />
                                </LinearGradient>
                                <Text
                                    style={[styles.shortcutName, { color: colors.text }]}
                                    numberOfLines={1}
                                >
                                    {item.nameAr}
                                </Text>
                            </Pressable>
                        </Animated.View>
                    ))}
                </View>
            </View>

            {/* Quick Tips Section */}
            <Animated.View
                style={[
                    styles.section,
                    { transform: [{ translateX: tipSlide }] },
                ]}
            >
                <View style={styles.sectionHeader}>
                    <Feather name="info" size={18} color={colors.accent} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        نصائح سريعة
                    </Text>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tipsContainer}
                >
                    {quickTips.map((tip) => (
                        <View
                            key={tip.id}
                            style={[
                                styles.tipCard,
                                {
                                    backgroundColor: colors.backgroundSecondary,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.tipIconContainer,
                                    { backgroundColor: `${colors.accent}20` },
                                ]}
                            >
                                <Feather name={tip.icon} size={20} color={colors.accent} />
                            </View>
                            <Text style={[styles.tipTitle, { color: colors.text }]}>
                                {tip.title}
                            </Text>
                            <Text
                                style={[styles.tipDescription, { color: colors.textSecondary }]}
                            >
                                {tip.description}
                            </Text>
                        </View>
                    ))}
                </ScrollView>
            </Animated.View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                    مرحباً بك في نبض 💙
                </Text>
                <Text style={[styles.versionText, { color: colors.textSecondary }]}>
                    الإصدار 1.0.0
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: Spacing["4xl"],
    },
    headerGradient: {
        alignItems: "center",
        paddingTop: Spacing["4xl"],
        paddingBottom: Spacing["3xl"],
        paddingHorizontal: Spacing.xl,
        borderBottomLeftRadius: BorderRadius.xl,
        borderBottomRightRadius: BorderRadius.xl,
    },
    logoContainer: {
        marginBottom: Spacing.xl,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
        ...Shadows.lg,
    },
    title: {
        ...Typography.h1,
        fontSize: 32,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: Spacing.sm,
    },
    subtitle: {
        ...Typography.body,
        textAlign: "center",
        marginBottom: Spacing["2xl"],
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        maxWidth: 400,
        height: Spacing.inputHeight + 4,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        paddingHorizontal: Spacing.lg,
        gap: Spacing.md,
        ...Shadows.md,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        height: "100%",
    },
    voiceButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    section: {
        paddingHorizontal: Spacing.xl,
        marginTop: Spacing["2xl"],
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        ...Typography.h3,
        fontWeight: "700",
    },
    shortcutsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: Spacing.md,
        justifyContent: "center",
    },
    shortcutCard: {
        width: (SCREEN_WIDTH - Spacing.xl * 2 - Spacing.md * 3) / 4,
        minWidth: 75,
        maxWidth: 90,
        aspectRatio: 0.85,
        borderRadius: BorderRadius.md,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        padding: Spacing.sm,
        ...Shadows.sm,
    },
    shortcutIcon: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.sm,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: Spacing.sm,
    },
    shortcutName: {
        ...Typography.caption,
        fontWeight: "600",
        textAlign: "center",
    },
    tipsContainer: {
        paddingRight: Spacing.xl,
        gap: Spacing.md,
    },
    tipCard: {
        width: 200,
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        ...Shadows.sm,
    },
    tipIconContainer: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.xs,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: Spacing.md,
    },
    tipTitle: {
        ...Typography.h4,
        marginBottom: Spacing.xs,
    },
    tipDescription: {
        ...Typography.caption,
        lineHeight: 18,
    },
    footer: {
        alignItems: "center",
        marginTop: Spacing["4xl"],
        paddingVertical: Spacing.xl,
    },
    footerText: {
        ...Typography.small,
    },
    versionText: {
        ...Typography.caption,
        marginTop: Spacing.xs,
        opacity: 0.7,
    },
});
