import React, { Suspense } from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useColors } from "@/hooks/useColors";

// شاشة المتصفح الأساسية (تحميل مباشر لسرعة البدء)
import BrowserScreen from "@/screens/BrowserScreen";

// الشاشات الثانوية (تحميل كسول لتقليل حجم الحزمة الابتدائية)
const BookmarksScreen = React.lazy(() => import("@/screens/BookmarksScreen"));
const HistoryScreen = React.lazy(() => import("@/screens/HistoryScreen"));
const DownloadsScreen = React.lazy(() => import("@/screens/DownloadsScreen"));
const SettingsScreen = React.lazy(() => import("@/screens/SettingsScreen"));

export type RootStackParamList = {
  Browser: undefined;
  Bookmarks: undefined;
  History: undefined;
  Downloads: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// مكون التحميل البسيط
const LoadingFallback = () => {
  const colors = useColors();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.backgroundRoot,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
};

// تغليف المكونات الكسولة بـ Suspense
const LazyScreen =
  (Component: React.LazyExoticComponent<any>) => (props: any) => (
    <Suspense fallback={<LoadingFallback />}>
      <Component {...props} />
    </Suspense>
  );

export default function RootStackNavigator() {
  const colors = useColors();
  const screenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade_from_bottom", // انتقال سلس وعصري مدعوم أصلياً
        gestureEnabled: true,
        gestureDirection: "horizontal",
        contentStyle: {
          backgroundColor: "transparent", // يمنع الوميض
        },
        headerStyle: {
          backgroundColor: colors.backgroundDefault,
        },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen
        name="Browser"
        component={BrowserScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Bookmarks"
        component={LazyScreen(BookmarksScreen)}
        options={{
          title: "المفضلة",
          headerBackTitle: "رجوع",
        }}
      />
      <Stack.Screen
        name="History"
        component={LazyScreen(HistoryScreen)}
        options={{
          title: "السجل",
          headerBackTitle: "رجوع",
        }}
      />
      <Stack.Screen
        name="Downloads"
        component={LazyScreen(DownloadsScreen)}
        options={{
          title: "التنزيلات",
          headerBackTitle: "رجوع",
        }}
      />
      <Stack.Screen
        name="Settings"
        component={LazyScreen(SettingsScreen)}
        options={{
          title: "الإعدادات",
          headerBackTitle: "رجوع",
        }}
      />
    </Stack.Navigator>
  );
}
