import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable, Linking, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useColors } from "@/hooks/useColors";
import { Spacing, BorderRadius } from "@/constants/theme";
import { downloadStorage } from "@/lib/storage";
import type { DownloadItem } from "@/types/browser";

interface DownloadItemRowProps {
  item: DownloadItem;
  onPress: () => void;
  onDelete: () => void;
  index: number;
}

function DownloadItemRow({ item, onPress, onDelete, index }: DownloadItemRowProps) {
  const colors = useColors();
  
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("ar-SA", {
      day: "numeric",
      month: "short",
    });
  };

  const getFileIcon = (mimeType: string): keyof typeof Feather.glyphMap => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "music";
    if (mimeType.includes("pdf")) return "file-text";
    if (mimeType.includes("zip") || mimeType.includes("rar")) return "archive";
    return "file";
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
        <View style={[styles.fileIcon, { backgroundColor: `${colors.accent}15` }]}>
          <Feather
            name={getFileIcon(item.mimeType)}
            size={22}
            color={colors.accent}
          />
        </View>
        <View style={styles.itemContent}>
          <ThemedText numberOfLines={1} style={[styles.itemTitle, { color: colors.text }]}>
            {item.filename}
          </ThemedText>
          <View style={styles.itemMeta}>
            <ThemedText style={[styles.itemSize, { color: colors.textSecondary }]}>
              {formatSize(item.fileSize)}
            </ThemedText>
            <ThemedText style={[styles.itemDate, { color: colors.textSecondary }]}>
              {formatDate(item.downloadedAt)}
            </ThemedText>
          </View>
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
        <Feather name="download" size={64} color={colors.accent} />
      </View>
      <ThemedText type="h3" style={[styles.emptyTitle, { color: colors.text }]}>
        لا توجد تنزيلات
      </ThemedText>
      <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
        ستظهر هنا الملفات التي تقوم بتحميلها
      </ThemedText>
    </View>
  );
}

export default function DownloadsScreen() {
  const colors = useColors();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  const loadDownloads = useCallback(async () => {
    const data = await downloadStorage.getAll();
    setDownloads(data);
  }, []);

  useEffect(() => {
    loadDownloads();
  }, [loadDownloads]);

  const handleDelete = useCallback(async (id: string) => {
    await downloadStorage.remove(id);
    loadDownloads();
  }, [loadDownloads]);

  const handleOpen = useCallback((url: string) => {
    if (Platform.OS !== "web") {
      Linking.openURL(url).catch(() => {});
    }
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: DownloadItem; index: number }) => (
      <DownloadItemRow
        item={item}
        onPress={() => handleOpen(item.url)}
        onDelete={() => handleDelete(item.id)}
        index={index}
      />
    ),
    [handleOpen, handleDelete]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundRoot }]}>
      <FlatList
        data={downloads}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.lg,
          },
          downloads.length === 0 && styles.emptyList,
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
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.md,
  },
  itemContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "right",
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.md,
  },
  itemSize: {
    fontSize: 12,
  },
  itemDate: {
    fontSize: 12,
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
