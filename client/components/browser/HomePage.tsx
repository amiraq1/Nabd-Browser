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
    ImageBackground,
    Image,
} from "react-native";

// شعار نبض - الدرع السداسي
const NabdLogo = require("@/../../assets/images/nabd_logo.png");
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur"; // <-- تأثير الزجاج
import { useBrowser } from "@/context/BrowserContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ألوان Banana Pro (Dark & Neon)
const PRO_THEME = {
    background: ["#0f172a", "#1e1b4b"], // Deep Navy -> Indigo
    cardGlass: "rgba(255, 255, 255, 0.1)", // شفاف
    accent: "#6366f1", // Indigo Accent
    text: "#f8fafc",
    textSecondary: "#94a3b8",
    border: "rgba(255, 255, 255, 0.15)"
};

const shortcuts = [
    { name: "Google", url: "https://google.com", icon: "search", color: "#4285F4" },
    { name: "YouTube", url: "https://youtube.com", icon: "youtube", color: "#FF0000" },
    { name: "X (Twitter)", url: "https://twitter.com", icon: "twitter", color: "#FFF" },
    { name: "GitHub", url: "https://github.com", icon: "github", color: "#FFF" },
    { name: "ChatGPT", url: "https://chat.openai.com", icon: "message-square", color: "#10A37F" },
    { name: "Amazon", url: "https://amazon.com", icon: "shopping-cart", color: "#FF9900" },
];

export function HomePage() {
    const { navigateTo } = useBrowser();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 50, useNativeDriver: true })
        ]).start();
    }, []);

    const handleSearch = (text: string) => {
        if (!text.trim()) return;
        const url = text.includes(".") ? (text.startsWith("http") ? text : `https://${text}`) : `https://www.google.com/search?q=${encodeURIComponent(text)}`;
        navigateTo(url);
    };

    return (
        <View style={styles.container}>
            {/* الخلفية المتدرجة الاحترافية */}
            <LinearGradient
                colors={PRO_THEME.background as any}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* قسم الهيدر مع الشعار */}
                <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={NabdLogo}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <View style={styles.glow} />
                    </View>
                    <Text style={styles.title}>NABDH <Text style={{ color: PRO_THEME.accent }}>PRO</Text></Text>
                    <Text style={styles.subtitle}>تصفح المستقبل، اليوم.</Text>
                </Animated.View>

                {/* شريط البحث الزجاجي */}
                <BlurView intensity={20} tint="dark" style={styles.searchContainer}>
                    <Feather name="search" size={20} color={PRO_THEME.textSecondary} />
                    <TextInput
                        style={styles.input}
                        placeholder="ابحث أو اكتب عنوان URL..."
                        placeholderTextColor={PRO_THEME.textSecondary}
                        onSubmitEditing={(e) => handleSearch(e.nativeEvent.text)}
                        returnKeyType="search"
                        textAlign="right" // للكتابة العربية
                    />
                    <View style={styles.micButton}>
                        <Feather name="mic" size={16} color="#FFF" />
                    </View>
                </BlurView>

                {/* شبكة الاختصارات */}
                <View style={styles.gridContainer}>
                    {shortcuts.map((item, index) => (
                        <Pressable
                            key={index}
                            onPress={() => navigateTo(item.url)}
                            style={({ pressed }) => [
                                styles.cardWrapper,
                                { opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] }
                            ]}
                        >
                            <BlurView intensity={30} tint="dark" style={styles.card}>
                                <View style={[styles.iconBox, { backgroundColor: item.color === "#FFF" ? "rgba(255,255,255,0.1)" : `${item.color}20` }]}>
                                    <Feather name={item.icon as any} size={24} color={item.color} />
                                </View>
                                <Text style={styles.cardText}>{item.name}</Text>
                            </BlurView>
                        </Pressable>
                    ))}
                </View>

                {/* بطاقة معلومات إضافية (طقس/أخبار) */}
                <BlurView intensity={15} tint="dark" style={styles.infoCard}>
                    <View style={styles.infoHeader}>
                        <Feather name="zap" size={18} color="#fbbf24" />
                        <Text style={styles.infoTitle}>اقتراحات الذكاء الاصطناعي</Text>
                    </View>
                    <Text style={styles.infoDesc}>جرب استخدام ميزة التلخيص الجديدة لقراءة المقالات الطويلة في ثوانٍ.</Text>
                </BlurView>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.xl,
        paddingTop: 80,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoBg: {
        width: 80,
        height: 80,
        borderRadius: 25, // شكل Squircle حديث
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    logoImage: {
        width: 100,
        height: 100,
        zIndex: 2,
    },
    glow: {
        position: 'absolute',
        width: 90,
        height: 90,
        borderRadius: 30,
        backgroundColor: PRO_THEME.accent,
        opacity: 0.4,
        zIndex: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: PRO_THEME.text,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        color: PRO_THEME.textSecondary,
        marginTop: 5,
        fontWeight: '300',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 56,
        borderRadius: 28,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: PRO_THEME.border,
        marginBottom: 40,
        overflow: 'hidden',
    },
    input: {
        flex: 1,
        color: '#FFF',
        fontSize: 16,
        marginHorizontal: 10,
        height: '100%',
    },
    micButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 15,
        width: '100%',
    },
    cardWrapper: {
        width: '30%',
        aspectRatio: 1,
        borderRadius: 20,
        overflow: 'hidden',
    },
    card: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: PRO_THEME.border,
    },
    iconBox: {
        width: 45,
        height: 45,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    cardText: {
        color: PRO_THEME.text,
        fontSize: 12,
        fontWeight: '600',
    },
    infoCard: {
        width: '100%',
        marginTop: 40,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: PRO_THEME.border,
        overflow: 'hidden',
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    infoTitle: {
        color: PRO_THEME.text,
        fontWeight: 'bold',
        fontSize: 16,
    },
    infoDesc: {
        color: PRO_THEME.textSecondary,
        lineHeight: 22,
        textAlign: 'left',
    }
});
