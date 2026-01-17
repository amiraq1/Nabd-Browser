import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
} from "react-native";
import * as Speech from "expo-speech";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { useBrowser } from "@/context/BrowserContext";

export function AudioPlayer() {
    const colors = useColors();
    const { pageContent, activeTab } = useBrowser();

    // حالات المشغل
    const [isPlaying, setIsPlaying] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [slideAnim] = useState(new Animated.Value(100));

    // إعدادات الصوت
    const [rate, setRate] = useState(1.0); // السرعة
    const [voices, setVoices] = useState<Speech.Voice[]>([]);
    const [currentVoiceIndex, setCurrentVoiceIndex] = useState(0);

    // 1. تحميل الأصوات المتاحة عند البدء
    useEffect(() => {
        async function loadVoices() {
            const availableVoices = await Speech.getAvailableVoicesAsync();
            // تصفية الأصوات لدعم العربية أو الإنجليزية حسب المحتوى (هنا نفضل العربية)
            const arVoices = availableVoices.filter((v) =>
                v.language.includes("ar")
            );
            const enVoices = availableVoices.filter((v) =>
                v.language.includes("en")
            );

            // ندمجهم بحيث تكون العربية أولاً
            setVoices([...arVoices, ...enVoices]);
        }
        loadVoices();
    }, []);

    // 2. إظهار المشغل فقط إذا كان هناك محتوى
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
            setIsPlaying(false);
        }
    }, [pageContent]);

    // دالة تغيير السرعة
    const toggleSpeed = () => {
        const speeds = [1.0, 1.5, 0.75];
        const nextSpeed = speeds[(speeds.indexOf(rate) + 1) % speeds.length];
        setRate(nextSpeed);

        // إذا كان يقرأ حالياً، نعيد التشغيل بالسرعة الجديدة
        if (isPlaying) {
            Speech.stop();
            setTimeout(() => startSpeaking(nextSpeed), 100);
        }
    };

    // دالة تغيير الصوت
    const toggleVoice = () => {
        if (voices.length > 1) {
            const nextIndex = (currentVoiceIndex + 1) % voices.length;
            setCurrentVoiceIndex(nextIndex);

            if (isPlaying) {
                Speech.stop();
                setTimeout(() => startSpeaking(rate, nextIndex), 100);
            }
        }
    };

    const startSpeaking = (speed = rate, voiceIdx = currentVoiceIndex) => {
        const voice = voices[voiceIdx]?.identifier;

        Speech.speak(pageContent, {
            language: "ar", // محاولة القراءة بالعربية
            voice: voice,
            pitch: 1.0,
            rate: speed,
            onDone: () => setIsPlaying(false),
            onStopped: () => setIsPlaying(false),
            onError: () => setIsPlaying(false),
        });
        setIsPlaying(true);
    };

    const togglePlay = async () => {
        const speaking = await Speech.isSpeakingAsync();
        if (speaking) {
            Speech.stop();
            setIsPlaying(false);
        } else {
            startSpeaking();
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
            {/* معلومات المقال */}
            <View style={styles.info}>
                <Text style={[styles.label, { color: colors.accent }]}>
                    قارئ نبض الذكي 🎧
                </Text>
                <Text
                    numberOfLines={1}
                    style={[styles.title, { color: colors.text }]}
                >
                    {activeTab?.title || "جاري التحميل..."}
                </Text>
            </View>

            {/* أزرار التحكم */}
            <View style={styles.controls}>
                {/* زر السرعة */}
                <Pressable onPress={toggleSpeed} style={styles.controlBtn}>
                    <Text style={[styles.speedText, { color: colors.textSecondary }]}>
                        {rate}x
                    </Text>
                </Pressable>

                {/* زر تغيير الصوت (يظهر فقط لو وجدنا أصواتاً متعددة) */}
                {voices.length > 1 && (
                    <Pressable onPress={toggleVoice} style={styles.controlBtn}>
                        <Feather name="users" size={18} color={colors.textSecondary} />
                    </Pressable>
                )}

                {/* زر التشغيل الرئيسي */}
                <Pressable
                    onPress={togglePlay}
                    style={({ pressed }) => [
                        styles.playButton,
                        { backgroundColor: colors.accent, opacity: pressed ? 0.8 : 1 },
                    ]}
                >
                    <Feather
                        name={isPlaying ? "pause" : "play"}
                        size={22}
                        color="#FFF"
                    />
                </Pressable>

                {/* زر الإغلاق */}
                <Pressable
                    onPress={() => {
                        Speech.stop();
                        setIsVisible(false);
                    }}
                    style={styles.closeBtn}
                >
                    <Feather name="x" size={18} color={colors.textSecondary} />
                </Pressable>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 90,
        left: 16,
        right: 16,
        flexDirection: "row",
        alignItems: "center",
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        ...Shadows.lg,
        zIndex: 9999, // تأكدنا أنه فوق كل شيء
    },
    info: {
        flex: 1,
        marginRight: Spacing.sm,
    },
    label: {
        fontSize: 10,
        fontWeight: "bold",
        marginBottom: 2,
        textAlign: "left",
    },
    title: {
        fontSize: 13,
        fontWeight: "600",
        textAlign: "left",
    },
    controls: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    controlBtn: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: "rgba(0,0,0,0.05)",
    },
    speedText: {
        fontSize: 12,
        fontWeight: "bold",
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 4,
    },
    closeBtn: {
        padding: 4,
        marginLeft: 4,
    },
});
