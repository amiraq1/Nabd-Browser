import React, { useCallback, useMemo } from "react";
import { View, StyleSheet, FlatList, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInRight } from "react-native-reanimated";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { ThemedText } from "@/components/ThemedText";
import { useColors } from "@/hooks/useColors";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useBrowser } from "@/context/BrowserContext";
import type { HistoryItem } from "@/types/browser";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface HistoryItemRowProps {
  item: HistoryItem;
  onPress: () => void;
  index: number;
}

// ✅ 1. استخدام React.memo لتحسين الأداء
const HistoryItemRow = React.memo(function HistoryItemRow({ item, onPress, index }: HistoryItemRowProps) {
  const colors = useColors();

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Animated.View entering={FadeInRight.delay(Math.min(index * 30, 300)).duration(200)}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        style={({ pressed }) => [
          styles.item,
          { backgroundColor: colors.backgroundDefault },
          pressed && { backgroundColor: colors.backgroundSecondary },
        ]}
      >
        <View style={[styles.favicon, { backgroundColor: colors.backgroundSecondary }]}>
          <Feather name="globe" size={18} color={colors.textSecondary} />
        </View>
        <View style={styles.itemContent}>
          <ThemedText numberOfLines={1} style={[styles.itemTitle, { color: colors.text }]}>
            {item.title}
          </ThemedText>
          <ThemedText numberOfLines={1} style={[styles.itemUrl, { color: colors.textSecondary }]}>
            {getDomain(item.url)}
          </ThemedText>
        </View>
        <ThemedText style={[styles.timestamp, { color: colors.textSecondary }]}>
          {formatTime(item.visitedAt)}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}, (prev, next) => prev.item.id === next.item.id && prev.index === next.index);

function EmptyState() {
  const colors = useColors();

  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: `${colors.accent}15` }]}>
        <Feather name="clock" size={64} color={colors.accent} />
      </View>
      <ThemedText type="h3" style={[styles.emptyTitle, { color: colors.text }]}>
        لا يوجد سجل
      </ThemedText>
      <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
        ستظهر هنا الصفحات التي تزورها
      </ThemedText>
    </View>
  );
}

interface GroupedHistory {
  date: string;
  items: HistoryItem[];
}

export default function HistoryScreen() {
  const colors = useColors();
  const navigation = useNavigation<NavigationProp>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { history, clearHistory, navigateTo } = useBrowser();

  const groupedHistory = useMemo(() => {
    const groups: Record<string, HistoryItem[]> = {};
    history.forEach((item) => {
      const date = new Date(item.visitedAt).toLocaleDateString("ar-SA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    });
    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  }, [history]);

  const handleClearHistory = useCallback(() => {
    Alert.alert(
      "مسح السجل",
      "هل أنت متأكد من مسح كل السجل؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "مسح",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            clearHistory();
          },
        },
      ]
    );
  }, [clearHistory]);

  const handleHistoryPress = useCallback(
    (url: string) => {
      navigateTo(url);
      navigation.goBack();
    },
    [navigateTo, navigation]
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        history.length > 0 ? (
          <Pressable onPress={handleClearHistory} hitSlop={12}>
            <ThemedText style={[styles.clearButton, { color: colors.error }]}>مسح الكل</ThemedText>
          </Pressable>
        ) : null,
    });
  }, [navigation, history.length, handleClearHistory, colors]);

  const renderSection = useCallback(
    ({ item: group }: { item: GroupedHistory }) => (
      <View style={styles.section}>
        <ThemedText style={[styles.sectionHeader, { color: colors.accent }]}>{group.date}</ThemedText>
        {group.items.map((item, index) => (
          <HistoryItemRow
            key={item.id}
            item={item}
            onPress={() => handleHistoryPress(item.url)}
            index={index}
          />
        ))}
      </View>
    ),
    [handleHistoryPress, colors]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundRoot }]}>
      <FlatList
        data={groupedHistory}
        renderItem={renderSection}
        keyExtractor={(item) => item.date}
        contentContainerStyle={[
          styles.list,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.lg,
          },
          history.length === 0 && styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyState}

        // ✅ 2. إعدادات الأداء (Performance Props)
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={3}
        removeClippedSubviews={true} // لأداء أفضل على Android
        updateCellsBatchingPeriod={50}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: Spacing.lg,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.sm,
    textAlign: "right",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  favicon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
  itemContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "right",
    marginBottom: 2,
  },
  itemUrl: {
    fontSize: 12,
    textAlign: "right",
  },
  timestamp: {
    fontSize: 12,
  },
  clearButton: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 15,
  },
});
