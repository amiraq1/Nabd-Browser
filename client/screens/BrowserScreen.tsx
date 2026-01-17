import React, { useRef, useCallback, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { UrlBar } from "@/components/browser/UrlBar";
import { WebViewContainer } from "@/components/browser/WebViewContainer";
import { NavigationBar } from "@/components/browser/NavigationBar";
import { FAB } from "@/components/browser/FAB";
import { TabsBottomSheet } from "@/components/browser/TabsBottomSheet";
import { AIPanelSheet } from "@/components/browser/AIPanelSheet";
import { DrawerMenu } from "@/components/browser/DrawerMenu";
import { Colors, Spacing } from "@/constants/theme";
import { useBrowser } from "@/context/BrowserContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BrowserScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { tabs, isIncognitoMode } = useBrowser();
  const tabsSheetRef = useRef<BottomSheet>(null);
  const aiSheetRef = useRef<BottomSheet>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleTabsOpen = useCallback(() => {
    tabsSheetRef.current?.snapToIndex(0);
  }, []);

  const handleTabsClose = useCallback(() => {
    tabsSheetRef.current?.close();
  }, []);

  const handleAIOpen = useCallback(() => {
    aiSheetRef.current?.snapToIndex(0);
  }, []);

  const handleAIClose = useCallback(() => {
    aiSheetRef.current?.close();
  }, []);

  const handleNavigate = useCallback(
    (screen: "bookmarks" | "history" | "downloads" | "settings") => {
      switch (screen) {
        case "bookmarks":
          navigation.navigate("Bookmarks");
          break;
        case "history":
          navigation.navigate("History");
          break;
        case "downloads":
          navigation.navigate("Downloads");
          break;
        case "settings":
          navigation.navigate("Settings");
          break;
      }
    },
    [navigation]
  );

  const backgroundColor = isIncognitoMode
    ? Colors.dark.incognitoBackground
    : Colors.dark.backgroundRoot;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable
          onPress={() => setDrawerVisible(true)}
          hitSlop={8}
          style={styles.menuButton}
        >
          <Feather name="menu" size={24} color={Colors.dark.text} />
        </Pressable>
        <View style={styles.urlBarContainer}>
          <UrlBar />
        </View>
        <Pressable onPress={handleTabsOpen} hitSlop={8} style={styles.tabsButton}>
          <View style={styles.tabsCount}>
            <Feather name="layers" size={18} color={Colors.dark.text} />
          </View>
        </Pressable>
      </View>

      <WebViewContainer />

      <NavigationBar onAIPress={handleAIOpen} />

      <FAB onTabsPress={handleTabsOpen} />

      <DrawerMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onNavigate={handleNavigate}
      />

      <TabsBottomSheet ref={tabsSheetRef} onClose={handleTabsClose} />
      <AIPanelSheet ref={aiSheetRef} onClose={handleAIClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.dark.backgroundDefault,
  },
  menuButton: {
    padding: Spacing.sm,
  },
  urlBarContainer: {
    flex: 1,
  },
  tabsButton: {
    padding: Spacing.sm,
  },
  tabsCount: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.dark.text,
    alignItems: "center",
    justifyContent: "center",
  },
});
