import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useColors } from "@/hooks/useColors";
import BrowserScreen from "@/screens/BrowserScreen";
import BookmarksScreen from "@/screens/BookmarksScreen";
import HistoryScreen from "@/screens/HistoryScreen";
import DownloadsScreen from "@/screens/DownloadsScreen";
import SettingsScreen from "@/screens/SettingsScreen";

export type RootStackParamList = {
  Browser: undefined;
  Bookmarks: undefined;
  History: undefined;
  Downloads: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const colors = useColors();
  const screenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator
      screenOptions={{
        ...screenOptions,
        headerStyle: {
          backgroundColor: colors.backgroundDefault,
        },
        headerTintColor: colors.text,
        contentStyle: {
          backgroundColor: colors.backgroundRoot,
        },
      }}
    >
      <Stack.Screen
        name="Browser"
        component={BrowserScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{
          title: "المفضلة",
          headerBackTitle: "رجوع",
        }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: "السجل",
          headerBackTitle: "رجوع",
        }}
      />
      <Stack.Screen
        name="Downloads"
        component={DownloadsScreen}
        options={{
          title: "التنزيلات",
          headerBackTitle: "رجوع",
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "الإعدادات",
          headerBackTitle: "رجوع",
        }}
      />
    </Stack.Navigator>
  );
}
