import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#1A1A1A",
    textSecondary: "#6B7280",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: "#0891B2",
    link: "#0891B2",
    accent: "#0891B2",
    incognitoAccent: "#6366F1",
    success: "#10B981",
    error: "#EF4444",
    backgroundRoot: "#F9FAFB",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F3F4F6",
    backgroundTertiary: "#E5E7EB",
    incognitoBackground: "#312E81",
    border: "#E5E7EB",
    glass: "rgba(255, 255, 255, 0.8)",
    glassStrong: "rgba(255, 255, 255, 0.95)",
    shadow: "rgba(0, 0, 0, 0.1)",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#9CA3AF",
    buttonText: "#0A0A0A",
    tabIconDefault: "#6B7280",
    tabIconSelected: "#00D9FF",
    link: "#00D9FF",
    accent: "#00D9FF",
    incognitoAccent: "#818CF8",
    success: "#34D399",
    error: "#F87171",
    backgroundRoot: "#0A0A0A",
    backgroundDefault: "#161616",
    backgroundSecondary: "#1F1F1F",
    backgroundTertiary: "#2A2A2A",
    incognitoBackground: "#1E1B4B",
    border: "#2A2A2A",
    glass: "rgba(26, 26, 26, 0.85)",
    glassStrong: "rgba(22, 22, 22, 0.95)",
    shadow: "rgba(0, 0, 0, 0.4)",
  },
};

export type ColorScheme = keyof typeof Colors;
export type ColorKeys = keyof typeof Colors.dark;

export function getColors(isDark: boolean) {
  return isDark ? Colors.dark : Colors.light;
}

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
    sansBold:
      "Tajawal, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    sansMedium:
      "Tajawal, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
});

export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
};
