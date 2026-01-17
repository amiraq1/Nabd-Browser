import React, { useCallback, useMemo, forwardRef } from "react";
import { View, StyleSheet, Pressable, FlatList, useWindowDimensions } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { TabCard } from "./TabCard";
import { useColors } from "@/hooks/useColors";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useBrowser } from "@/context/BrowserContext";

interface TabsBottomSheetProps {
  onClose: () => void;
}

export const TabsBottomSheet = forwardRef<BottomSheet, TabsBottomSheetProps>(
  function TabsBottomSheet({ onClose }, ref) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const { tabs, activeTabId, switchTab, closeTab, createTab } = useBrowser();

    const snapPoints = useMemo(() => ["70%", "90%"], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.7}
        />
      ),
      []
    );

    const handleTabPress = (tabId: string) => {
      switchTab(tabId);
      onClose();
    };

    const handleNewTab = (isIncognito: boolean) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
      [activeTabId, cardWidth]
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={[styles.background, { backgroundColor: colors.backgroundRoot }]}
        handleIndicatorStyle={[styles.indicator, { backgroundColor: colors.textSecondary }]}
        onClose={onClose}
      >
        <BottomSheetView
          style={[styles.content, { paddingBottom: insets.bottom + Spacing.lg }]}
        >
          <View style={styles.header}>
            <ThemedText type="h3" style={[styles.title, { color: colors.text }]}>
              التبويبات
            </ThemedText>
            <View style={[styles.tabCount, { backgroundColor: colors.accent }]}>
              <ThemedText style={[styles.tabCountText, { color: colors.buttonText }]}>
                {tabs.length}
              </ThemedText>
            </View>
            <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
              <Feather name="x" size={24} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.newTabRow}>
            <Pressable
              onPress={() => handleNewTab(false)}
              style={[
                styles.newTabButton, 
                { backgroundColor: colors.backgroundDefault, borderColor: colors.border }
              ]}
            >
              <Feather name="plus" size={20} color={colors.accent} />
              <ThemedText style={[styles.newTabText, { color: colors.accent }]}>
                تبويب جديد
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => handleNewTab(true)}
              style={[
                styles.newTabButton, 
                styles.incognitoButton,
                { borderColor: colors.incognitoAccent }
              ]}
            >
              <Feather name="eye-off" size={20} color={colors.incognitoAccent} />
              <ThemedText style={[styles.newTabText, { color: colors.incognitoAccent }]}>
                تصفح خفي
              </ThemedText>
            </Pressable>
          </View>

          <FlatList
            data={tabs}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  background: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  indicator: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    flex: 1,
    textAlign: "right",
  },
  tabCount: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  tabCountText: {
    fontSize: 12,
    fontWeight: "700",
  },
  closeBtn: {
    marginLeft: Spacing.md,
    padding: Spacing.xs,
  },
  newTabRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  newTabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  incognitoButton: {
    backgroundColor: "rgba(129, 140, 248, 0.1)",
  },
  newTabText: {
    fontWeight: "600",
  },
  list: {
    paddingBottom: Spacing.xl,
  },
  row: {
    gap: Spacing.md,
  },
});
