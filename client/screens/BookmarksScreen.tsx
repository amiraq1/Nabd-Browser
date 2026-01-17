import React, { useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
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
        style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
      >
        <View style={styles.favicon}>
          <Feather name="globe" size={20} color={Colors.dark.textSecondary} />
        </View>
        <View style={styles.itemContent}>
          <ThemedText numberOfLines={1} style={styles.itemTitle}>
            {item.title}
          </ThemedText>
          <ThemedText numberOfLines={1} style={styles.itemUrl}>
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
          <Feather name="trash-2" size={18} color={Colors.dark.error} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Feather name="bookmark" size={64} color={Colors.dark.accent} />
      </View>
      <ThemedText type="h3" style={styles.emptyTitle}>
        لا توجد مفضلات بعد
      </ThemedText>
      <ThemedText style={styles.emptyText}>
        اضغط على أيقونة المفضلة لحفظ الصفحات
      </ThemedText>
    </View>
  );
}

export default function BookmarksScreen() {
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
    <View style={styles.container}>
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
    backgroundColor: Colors.dark.backgroundRoot,
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
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  itemPressed: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  favicon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.backgroundSecondary,
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
    color: Colors.dark.textSecondary,
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
    backgroundColor: "rgba(0, 217, 255, 0.1)",
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
    color: Colors.dark.textSecondary,
    fontSize: 15,
  },
});
