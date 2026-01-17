import React, { useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface BookmarkItemProps {
  item: Bookmark;
  onPress: () => void;
  onDelete: () => void;
  index: number;
}

function BookmarkItem({ item, onPress, onDelete, index }: BookmarkItemProps) {
  const colors = useColors();
  
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 50).duration(200)}
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
        <View style={[styles.favicon, { backgroundColor: colors.backgroundSecondary }]}>
          <Feather name="globe" size={20} color={colors.textSecondary} />
        </View>
        <View style={styles.itemContent}>
          <ThemedText numberOfLines={1} style={[styles.itemTitle, { color: colors.text }]}>
            {item.title}
          </ThemedText>
          <ThemedText numberOfLines={1} style={[styles.itemUrl, { color: colors.textSecondary }]}>
            {getDomain(item.url)}
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
}

function EmptyState() {
  const colors = useColors();
  
  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: `${colors.accent}15` }]}>
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

  const handleBookmarkPress = useCallback(
    (url: string) => {
      navigateTo(url);
      navigation.goBack();
    },
    [navigateTo, navigation]
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
    [handleBookmarkPress, removeBookmark]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundRoot }]}>
      <FlatList
        data={bookmarks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.lg,
          },
          bookmarks.length === 0 && styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyState}
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
