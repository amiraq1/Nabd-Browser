import React, { useCallback, useMemo, useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
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
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Skeleton } from "@/components/ui/Skeleton";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface HistoryItemRowProps {
  item: HistoryItem;
  onPress: () => void;
  index: number;
}

const HistoryItemRow = React.memo(
  function HistoryItemRow({ item, onPress, index }: HistoryItemRowProps) {
    const colors = useColors();

    const domain = useMemo(() => {
      try {
        return new URL(item.url).hostname;
      } catch {
        return "";
      }
    }, [item.url]);

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    const formatTime = (timestamp: number) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("ar-SA", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return (
      <Animated.View
        entering={FadeInRight.delay(Math.min(index * 30, 300)).duration(200)}
      >
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
          <View
            style={[
              styles.faviconContainer,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <Image
              source={{ uri: faviconUrl }}
              style={styles.faviconImage}
              contentFit="contain"
              transition={200}
              cachePolicy="memory-disk"
            />
          </View>

          <View style={styles.itemContent}>
            <ThemedText
              numberOfLines={1}
              style={[styles.itemTitle, { color: colors.text }]}
            >
              {item.title}
            </ThemedText>
            <ThemedText
              numberOfLines={1}
              style={[styles.itemUrl, { color: colors.textSecondary }]}
            >
              {domain || item.url}
            </ThemedText>
          </View>
          <ThemedText
            style={[styles.timestamp, { color: colors.textSecondary }]}
          >
            {formatTime(item.visitedAt)}
          </ThemedText>
        </Pressable>
      </Animated.View>
    );
  },
  (prev, next) => prev.item.id === next.item.id && prev.index === next.index,
);

function EmptyState() {
  const colors = useColors();

  return (
    <View style={styles.emptyContainer}>
      <View
        style={[styles.emptyIcon, { backgroundColor: `${colors.accent}15` }]}
      >
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

  // حالة التحميل (للعرض فقط حالياً)
  const [isLoading, setIsLoading] = useState(true);

  // محاكاة التحميل
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

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
    Alert.alert("مسح السجل", "هل أنت متأكد من مسح كل السجل؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "مسح",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          clearHistory();
        },
      },
    ]);
  }, [clearHistory]);

  const handleHistoryPress = useCallback(
    (url: string) => {
      navigateTo(url);
      navigation.goBack();
    },
    [navigateTo, navigation],
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        !isLoading && history.length > 0 ? (
          <Pressable onPress={handleClearHistory} hitSlop={12}>
            <ThemedText style={[styles.clearButton, { color: colors.error }]}>
              مسح الكل
            </ThemedText>
          </Pressable>
        ) : null,
    });
  }, [navigation, history.length, handleClearHistory, colors, isLoading]);

  const renderSection = useCallback(
    ({ item: group }: { item: GroupedHistory }) => (
      <View style={styles.section}>
        <ThemedText style={[styles.sectionHeader, { color: colors.accent }]}>
          {group.date}
        </ThemedText>
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
    [handleHistoryPress, colors],
  );

  // 👇 عرض الـ Skeleton Loader أثناء التحميل
  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.backgroundRoot,
            padding: Spacing.lg,
            paddingTop: headerHeight + Spacing.lg,
          },
        ]}
      >
        <View style={{ marginBottom: Spacing.xl }}>
          <Skeleton
            width={120}
            height={20}
            style={{ marginBottom: Spacing.md, alignSelf: "flex-end" }}
          />
          {[1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={[
                styles.item,
                {
                  backgroundColor: colors.backgroundDefault,
                  marginBottom: Spacing.sm,
                },
              ]}
            >
              <Skeleton width={36} height={36} borderRadius={18} />
              <View
                style={{
                  flex: 1,
                  marginRight: Spacing.sm,
                  alignItems: "flex-end",
                  paddingVertical: 4,
                  gap: 8,
                }}
              >
                <Skeleton width="70%" height={14} />
                <Skeleton width="40%" height={10} />
              </View>
              <Skeleton width={40} height={10} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colors.backgroundRoot }]}
    >
      <FlashList
        data={groupedHistory}
        renderItem={renderSection}
        keyExtractor={(item) => item.date}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.lg,
          paddingHorizontal: Spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyState}
        estimatedItemSize={100}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  faviconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
    overflow: "hidden",
  },
  faviconImage: {
    width: 24,
    height: 24,
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
