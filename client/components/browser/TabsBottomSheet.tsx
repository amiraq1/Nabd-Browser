import React, { useCallback, useMemo, forwardRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  useWindowDimensions,
} from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { TabCard } from "./TabCard";
import { useColors } from "@/hooks/useColors";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { useBrowser } from "@/context/BrowserContext";
import { ScaleButton } from "@/components/ui/ScaleButton";

interface TabsBottomSheetProps {
  onClose: () => void;
}

// ✨ New Tab Button Component
const NewTabButton = ({
  icon,
  label,
  onPress,
  gradientColors,
  iconColor,
  isIncognito,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  gradientColors: string[];
  iconColor: string;
  isIncognito?: boolean;
}) => {
  const colors = useColors();

  return (
    <ScaleButton
      onPress={onPress}
      hapticStyle="medium"
      style={[
        styles.newTabButton,
        {
          backgroundColor: isIncognito ? `${colors.incognitoAccent}15` : colors.backgroundSecondary,
          borderColor: isIncognito ? colors.incognitoAccent : colors.border,
        },
      ]}
    >
      <LinearGradient
        colors={gradientColors as any}
        style={styles.newTabIconBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Feather name={icon} size={18} color="#FFF" />
      </LinearGradient>
      <ThemedText style={[styles.newTabText, { color: iconColor }]}>
        {label}
      </ThemedText>
    </ScaleButton>
  );
};

export const TabsBottomSheet = forwardRef<BottomSheet, TabsBottomSheetProps>(
  function TabsBottomSheet({ onClose }, ref) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const { tabs, activeTabId, switchTab, closeTab, createTab } = useBrowser();

    const snapPoints = useMemo(() => ["65%", "90%"], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.6}
        />
      ),
      [],
    );

    const handleTabPress = (tabId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      switchTab(tabId);
      onClose();
    };

    const handleNewTab = (isIncognito: boolean) => {
      createTab(isIncognito);
      onClose();
    };

    const numColumns = 2;
    const gap = Spacing.md;
    const cardWidth = (width - Spacing.lg * 2 - gap) / numColumns;

    const renderItem = useCallback(
      ({ item, index }: { item: any; index: number }) => (
        <View style={{ width: cardWidth, marginBottom: gap }}>
          <TabCard
            tab={item}
            isActive={item.id === activeTabId}
            onPress={() => handleTabPress(item.id)}
            onClose={() => closeTab(item.id)}
            index={index}
          />
        </View>
      ),
      [activeTabId, cardWidth],
    );

    const regularTabs = tabs.filter(t => !t.isIncognito);
    const incognitoTabs = tabs.filter(t => t.isIncognito);

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
        handleIndicatorStyle={[
          styles.indicator,
          { backgroundColor: colors.textSecondary },
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
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={styles.header}
          >
            <View style={styles.headerLeft}>
              <View style={[styles.tabCountBadge, { backgroundColor: colors.accent }]}>
                <ThemedText style={styles.tabCountText}>
                  {tabs.length}
                </ThemedText>
              </View>
              <ThemedText type="h3" style={[styles.title, { color: colors.text }]}>
                التبويبات
              </ThemedText>
            </View>
            <ScaleButton onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={22} color={colors.textSecondary} />
            </ScaleButton>
          </Animated.View>

          {/* New Tab Buttons */}
          <Animated.View
            entering={FadeInUp.delay(100).duration(300)}
            style={styles.newTabRow}
          >
            <NewTabButton
              icon="plus"
              label="تبويب جديد"
              onPress={() => handleNewTab(false)}
              gradientColors={[colors.accent, "#0891B2"]}
              iconColor={colors.accent}
            />
            <NewTabButton
              icon="eye-off"
              label="تصفح خفي"
              onPress={() => handleNewTab(true)}
              gradientColors={[colors.incognitoAccent, "#6366F1"]}
              iconColor={colors.incognitoAccent}
              isIncognito
            />
          </Animated.View>

          {/* Tabs List */}
          {tabs.length === 0 ? (
            <Animated.View
              entering={FadeInUp.delay(200).duration(300)}
              style={styles.emptyState}
            >
              <View style={[styles.emptyIcon, { backgroundColor: `${colors.accent}15` }]}>
                <Feather name="layers" size={32} color={colors.accent} />
              </View>
              <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
                لا توجد تبويبات
              </ThemedText>
              <ThemedText style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                اضغط على "+ تبويب جديد" للبدء
              </ThemedText>
            </Animated.View>
          ) : (
            <FlatList
              data={tabs}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  background: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    ...Shadows.xl,
  },
  indicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  tabCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  tabCountText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "700",
  },
  title: {
    textAlign: "right",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  newTabRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  newTabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  newTabIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  newTabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
  },
  list: {
    paddingBottom: Spacing.xl,
  },
  row: {
    gap: Spacing.md,
  },
});
