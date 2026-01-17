import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  forwardRef,
} from "react";
import { View, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { useColors } from "@/hooks/useColors";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useBrowser } from "@/context/BrowserContext";

interface AudioReaderSheetProps {
  onClose: () => void;
}

export const AudioReaderSheet = forwardRef<BottomSheet, AudioReaderSheetProps>(
  function AudioReaderSheet({ onClose }, ref) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { pageContent, activeTab } = useBrowser();

    // Playback State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [rate, setRate] = useState(1.0);
    const [statusText, setStatusText] = useState("جاهز للقراءة");

    const snapPoints = useMemo(() => ["35%"], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    // Stop speech when closing (optional, usually users want background audio)
    // But for now, let's stop it on unmount to prevent zombie audio
    useEffect(() => {
      return () => {
        Speech.stop();
      };
    }, []);

    const speak = async () => {
      // If already playing and just paused, resume
      if (isPaused) {
        Speech.resume();
        setIsPlaying(true);
        setIsPaused(false);
        setStatusText("جاري القراءة...");
        return;
      }

      // If playing, pause
      if (isPlaying) {
        Speech.pause();
        setIsPlaying(false);
        setIsPaused(true);
        setStatusText("مُتوقف مؤقتاً");
        return;
      }

      // Start new speech
      const textToRead =
        pageContent || "لا يوجد محتوى قابل للقراءة في هذه الصفحة.";

      if (!textToRead) return;

      setStatusText("جاري القراءة...");
      setIsPlaying(true);

      Speech.speak(textToRead, {
        language: "ar-SA", // Default to Arabic, auto-detect would be better but simple for now
        rate: rate,
        pitch: 1.0,
        onDone: () => {
          setIsPlaying(false);
          setIsPaused(false);
          setStatusText("اكتملت القراءة");
        },
        onStopped: () => {
          setIsPlaying(false);
          setIsPaused(false);
          setStatusText("تم الإيقاف");
        },
        onError: () => {
          setIsPlaying(false);
          setStatusText("خطأ في القراءة");
        },
      });
    };

    const stop = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Speech.stop();
      setIsPlaying(false);
      setIsPaused(false);
      setStatusText("تم الإيقاف");
    };

    const toggleRate = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newRate = rate >= 2.0 ? 0.75 : rate + 0.25;
      setRate(newRate);
      // Note: Changing rate usually requires restarting speech in some engines,
      // but let's keep it simple. User might need to stop/start to hear effect.
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={[
          styles.background,
          { backgroundColor: colors.backgroundRoot },
        ]}
        onClose={onClose}
      >
        <BottomSheetView
          style={[
            styles.content,
            { paddingBottom: insets.bottom + Spacing.lg },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: colors.accent + "20" },
              ]}
            >
              <Feather name="headphones" size={24} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                القارئ الصوتي
              </ThemedText>
              <ThemedText
                style={{ fontSize: 12, opacity: 0.6 }}
                numberOfLines={1}
              >
                {activeTab?.title || "صفحة الويب"}
              </ThemedText>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Status Display */}
          <View
            style={[
              styles.statusContainer,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <View style={styles.waveVisualizer}>
              {/* Fake visualizer bars */}
              {[1, 2, 3, 4, 5].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.bar,
                    {
                      backgroundColor: isPlaying
                        ? colors.accent
                        : colors.border,
                      height: isPlaying ? 15 + Math.random() * 20 : 10,
                    },
                  ]}
                />
              ))}
            </View>
            <ThemedText style={{ marginTop: 12, opacity: 0.8 }}>
              {statusText}
            </ThemedText>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            {/* Speed Button */}
            <Pressable style={styles.controlBtnSmall} onPress={toggleRate}>
              <ThemedText style={{ fontWeight: "bold", color: colors.text }}>
                {rate}x
              </ThemedText>
            </Pressable>

            {/* Play/Pause Main Button */}
            <Pressable
              style={[styles.mainBtn, { backgroundColor: colors.accent }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                speak();
              }}
            >
              <Feather
                name={isPlaying ? "pause" : "play"}
                size={32}
                color="#FFF"
              />
            </Pressable>

            {/* Stop Button */}
            <Pressable style={styles.controlBtnSmall} onPress={stop}>
              <Feather name="square" size={20} color={colors.text} />
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  background: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    padding: 8,
  },
  statusContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: BorderRadius.lg,
    marginBottom: 24,
  },
  waveVisualizer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  mainBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  controlBtnSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(150,150,150,0.2)",
  },
});
