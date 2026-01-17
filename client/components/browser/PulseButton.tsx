import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Shadows } from '@/constants/theme';

interface PulseButtonProps {
    onPress: () => void;
}

export function PulseButton({ onPress }: PulseButtonProps) {
    const colors = useColors();
    // قيم الأنميشن (الحجم والشفافية)
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // تشغيل أنميشن "النبض" بشكل مستمر
        const breathe = Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 1500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 0.6,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ])
            ])
        );
        breathe.start();
    }, []);

    return (
        <View style={styles.container}>
            {/* هالة النبض الخلفية */}
            <Animated.View
                style={[
                    styles.glow,
                    {
                        backgroundColor: colors.accent,
                        transform: [{ scale: pulseAnim }],
                        opacity: glowAnim,
                    }
                ]}
            />

            {/* الزر الأساسي */}
            <Pressable onPress={onPress} style={styles.buttonWrapper}>
                <LinearGradient
                    colors={[colors.accent, '#6366f1']} // تدرج بنفسجي وازرق
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Feather name="activity" size={28} color="#FFF" />
                </LinearGradient>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
        top: -20, // لرفع الزر للأعلى قليلاً (عائم)
    },
    buttonWrapper: {
        width: 56,
        height: 56,
        borderRadius: 28,
        ...Shadows.lg, // ظل قوي
        elevation: 8,
    },
    gradient: {
        width: '100%',
        height: '100%',
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    glow: {
        position: 'absolute',
        width: 70,
        height: 70,
        borderRadius: 35,
        zIndex: -1,
    },
});
