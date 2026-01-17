import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#FFFFFF",
    textSecondary: "#A0A0A0",
    buttonText: "#0A0A0A",
    tabIconDefault: "#A0A0A0",
    tabIconSelected: "#00D9FF",
    link: "#00D9FF",
    accent: "#00D9FF",
    incognitoAccent: "#3D5AFE",
    success: "#00E676",
    error: "#FF3D00",
    backgroundRoot: "#0A0A0A",
    backgroundDefault: "#1A1A1A",
    backgroundSecondary: "#252525",
    backgroundTertiary: "#303030",
    incognitoBackground: "#1A237E",
    border: "#333333",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#A0A0A0",
    buttonText: "#0A0A0A",
    tabIconDefault: "#A0A0A0",
    tabIconSelected: "#00D9FF",
    link: "#00D9FF",
    accent: "#00D9FF",
    incognitoAccent: "#3D5AFE",
    success: "#00E676",
    error: "#FF3D00",
    backgroundRoot: "#0A0A0A",
    backgroundDefault: "#1A1A1A",
    backgroundSecondary: "#252525",
    backgroundTertiary: "#303030",
    incognitoBackground: "#1A237E",
    border: "#333333",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
  headerHeight: 72,
  bottomNavHeight: 56,
  fabSize: 56,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 28,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "Tajawal_400Regular",
    sansBold: "Tajawal_700Bold",
    sansMedium: "Tajawal_500Medium",
  },
  android: {
    sans: "Tajawal_400Regular",
    sansBold: "Tajawal_700Bold",
    sansMedium: "Tajawal_500Medium",
  },
  default: {
    sans: "Tajawal_400Regular",
    sansBold: "Tajawal_700Bold",
    sansMedium: "Tajawal_500Medium",
  },
  web: {
    sans: "Tajawal, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    sansBold: "Tajawal, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    sansMedium: "Tajawal, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
});
