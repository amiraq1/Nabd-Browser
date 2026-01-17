import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import * as Speech from "expo-speech";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { useBrowser } from "@/context/BrowserContext";

export function AudioPlayer() {
    const colors = useColors();
    const { pageContent, activeTab } = useBrowser();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [slideAnim] = useState(new Animated.Value(100));

    // إظهار المشغل فقط إذا كان هناك محتوى نصي كافٍ في الصفحة
    useEffect(() => {
        if (pageContent && pageContent.length > 200) {
            setIsVisible(true);
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
            }).start();
        } else {
            setIsVisible(false);
            Speech.stop();
        }
    }, [pageContent]);

    const toggleSpeech = async () => {
        const speaking = await Speech.isSpeakingAsync();

        if (speaking) {
            Speech.stop();
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            // قراءة النص (يدعم العربية والإنجليزية تلقائياً)
            Speech.speak(pageContent, {
                language: "ar", // يحاول القراءة بالعربية
                pitch: 1.0,
                rate: 0.9, // سرعة قراءة مريحة
                onDone: () => setIsPlaying(false),
                onStopped: () => setIsPlaying(false),
            });
        }
    };

    if (!isVisible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.accent,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <View style={styles.info}>
                <Text style={[styles.label, { color: colors.accent }]}>
                    {isPlaying ? "جاري الاستماع..." : "استمع للمقالة"}
                </Text>
                <Text
                    numberOfLines={1}
                    style={[styles.title, { color: colors.text }]}
                >
                    {activeTab?.title || "صفحة ويب"}
                </Text>
            </View>

            <Pressable
                onPress={toggleSpeech}
                style={({ pressed }) => [
                    styles.playButton,
                    { backgroundColor: colors.accent, opacity: pressed ? 0.8 : 1 },
                ]}
            >
                <Feather name={isPlaying ? "pause" : "play"} size={24} color="#FFF" />
            </Pressable>

            {isPlaying && (
                <Pressable
                    onPress={() => {
                        Speech.stop();
                        setIsVisible(false);
                    }}
                    style={styles.closeBtn}
                >
                    <Feather name="x" size={18} color={colors.textSecondary} />
                </Pressable>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 90, // فوق شريط التنقل السفلي
        left: 20,
        right: 20,
        flexDirection: "row",
        alignItems: "center",
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        ...Shadows.lg,
        zIndex: 100,
    },
    info: {
        flex: 1,
        marginRight: Spacing.md,
    },
    label: {
        fontSize: 10,
        fontWeight: "bold",
        marginBottom: 2,
        textAlign: "left",
    },
    title: {
        fontSize: 14,
        fontWeight: "600",
        textAlign: "left",
    },
    playButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    closeBtn: {
        marginLeft: 10,
        padding: 5,
    },
});
