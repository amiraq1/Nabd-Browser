import React, { useCallback, useMemo, useState, useEffect } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { ThemedText } from "@/components/ThemedText";
import { useColors } from "@/hooks/useColors";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useBrowser } from "@/context/BrowserContext";
import type { Bookmark } from "@/types/browser";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Skeleton } from "@/components/ui/Skeleton"; // Import Skeleton

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface BookmarkItemProps {
  item: Bookmark;
  onPress: () => void;
  onDelete: () => void;
  index: number;
}

const BookmarkItem = React.memo(
  function BookmarkItem({ item, onPress, onDelete, index }: BookmarkItemProps) {
    const colors = useColors();

    const domain = useMemo(() => {
      try {
        return new URL(item.url).hostname;
      } catch {
        return item.url;
      }
    }, [item.url]);

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    return (
      <Animated.View
        entering={FadeInRight.delay(Math.min(index * 50, 300)).duration(200)}
        exiting={FadeOutLeft.duration(150)}
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
              styles.favicon,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <Image
              source={{ uri: faviconUrl }}
              style={{ width: 24, height: 24 }}
              contentFit="contain"
              cachePolicy="memory-disk"
              transition={200}
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
              {domain}
            </ThemedText>
          </View>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onDelete();
            }}
            hitSlop={12}
            style={styles.deleteButton}
          >
            <Feather name="trash-2" size={18} color={colors.error} />
          </Pressable>
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
        <Feather name="bookmark" size={64} color={colors.accent} />
      </View>
      <ThemedText type="h3" style={[styles.emptyTitle, { color: colors.text }]}>
        لا توجد مفضلات بعد
      </ThemedText>
      <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
        اضغط على أيقونة المفضلة لحفظ الصفحات
      </ThemedText>
    </View>
  );
}

export default function BookmarksScreen() {
  const colors = useColors();
  const navigation = useNavigation<NavigationProp>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { bookmarks, removeBookmark, navigateTo } = useBrowser();

  // حالة التحميل والمحاكاة
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleBookmarkPress = useCallback(
    (url: string) => {
      navigateTo(url);
      navigation.goBack();
    },
    [navigateTo, navigation],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Bookmark; index: number }) => (
      <BookmarkItem
        item={item}
        onPress={() => handleBookmarkPress(item.url)}
        onDelete={() => removeBookmark(item.id)}
        index={index}
      />
    ),
    [handleBookmarkPress, removeBookmark],
  );

  // 👇 Skeleton Loader للمفضلة
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
        {[1, 2, 3, 4].map((i) => (
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
            <Skeleton width={40} height={40} borderRadius={20} />
            <View
              style={{
                flex: 1,
                marginRight: Spacing.sm,
                alignItems: "flex-end",
                paddingVertical: 4,
                gap: 8,
              }}
            >
              <Skeleton width="50%" height={16} />
              <Skeleton width="30%" height={12} />
            </View>
            <Skeleton width={20} height={20} borderRadius={4} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colors.backgroundRoot }]}
    >
      <FlashList
        data={bookmarks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.lg,
          paddingHorizontal: Spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyState}
        estimatedItemSize={80}
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
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  favicon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.md,
    overflow: "hidden",
  },
  itemContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "right",
    marginBottom: 2,
  },
  itemUrl: {
    fontSize: 13,
    textAlign: "right",
  },
  deleteButton: {
    padding: Spacing.sm,
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
