import { Platform } from "react-native";

// ✨ Avant-Garde Color System - Deep, Rich, Intentional
export const Colors = {
  light: {
    text: "#0F0F0F",
    textSecondary: "#5C5C5C",
    buttonText: "#FFFFFF",
    tabIconDefault: "#A0A0A0",
    tabIconSelected: "#0D7377",
    link: "#0D7377",
    accent: "#0D7377", // Teal - Distinctive & Premium
    accentSecondary: "#14FFEC", // Electric Cyan
    incognitoAccent: "#8B5CF6",
    success: "#059669",
    error: "#DC2626",
    warning: "#D97706",
    backgroundRoot: "#FAFAFA",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F5F5F5",
    backgroundTertiary: "#EBEBEB",
    backgroundElevated: "rgba(255, 255, 255, 0.95)",
    incognitoBackground: "#1E1B4B",
    border: "#E5E5E5",
    borderSubtle: "#F0F0F0",
    glass: "rgba(255, 255, 255, 0.75)",
    glassStrong: "rgba(255, 255, 255, 0.92)",
    glassBorder: "rgba(255, 255, 255, 0.3)",
    shadow: "rgba(0, 0, 0, 0.08)",
    overlay: "rgba(0, 0, 0, 0.4)",
  },
  dark: {
    text: "#FAFAFA",
    textSecondary: "#A3A3A3",
    buttonText: "#0A0A0A",
    tabIconDefault: "#525252",
    tabIconSelected: "#14FFEC",
    link: "#14FFEC",
    accent: "#14FFEC", // Electric Cyan - Signature Dark Mode
    accentSecondary: "#0D7377",
    incognitoAccent: "#A78BFA",
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    backgroundRoot: "#050505", // Pure Black for OLED
    backgroundDefault: "#0A0A0A",
    backgroundSecondary: "#141414",
    backgroundTertiary: "#1F1F1F",
    backgroundElevated: "rgba(20, 20, 20, 0.95)",
    incognitoBackground: "#0F0A2E",
    border: "#262626",
    borderSubtle: "#1A1A1A",
    glass: "rgba(10, 10, 10, 0.85)",
    glassStrong: "rgba(10, 10, 10, 0.95)",
    glassBorder: "rgba(255, 255, 255, 0.08)",
    shadow: "rgba(0, 0, 0, 0.6)",
    overlay: "rgba(0, 0, 0, 0.7)",
  },
};

export type ColorScheme = keyof typeof Colors;
export type ColorKeys = keyof (typeof Colors.dark);

export function getColors(isDark: boolean) {
  return isDark ? Colors.dark : Colors.light;
}

// ✨ Refined Spacing - Golden Ratio Inspired
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  "2xl": 36,
  "3xl": 48,
  "4xl": 64,
  "5xl": 80,
  inputHeight: 52,
  buttonHeight: 56,
  headerHeight: 80,
  bottomNavHeight: 72,
  fabSize: 60,
};

// ✨ Sophisticated Border Radii
export const BorderRadius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  "2xl": 36,
  "3xl": 48,
  full: 9999,
  pill: 200,
};

// ✨ Typographic Scale - Modular & Distinctive
export const Typography = {
  display: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: "800" as const,
    letterSpacing: -1.5,
  },
  h1: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "600" as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600" as const,
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600" as const,
    letterSpacing: 0,
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: "400" as const,
    letterSpacing: 0.1,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "400" as const,
    letterSpacing: 0.1,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500" as const,
    letterSpacing: 0.3,
  },
  overline: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600" as const,
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500" as const,
    letterSpacing: 0,
  },
};

// ✨ Arabic-First Font Stack
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
    sans: "Tajawal, system-ui, -apple-system, sans-serif",
    sansBold: "Tajawal, system-ui, -apple-system, sans-serif",
    sansMedium: "Tajawal, system-ui, -apple-system, sans-serif",
  },
});

// ✨ Elevated Shadow System
export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 12,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  }),
};

// ✨ Animation Presets
export const AnimationConfig = {
  spring: {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
  },
  springBouncy: {
    damping: 12,
    stiffness: 180,
    mass: 0.6,
  },
  springGentle: {
    damping: 25,
    stiffness: 200,
    mass: 1,
  },
  timing: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
};

// ✨ Glass Effect Presets
export const GlassPresets = {
  light: {
    intensity: 60,
    tint: "light" as const,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  dark: {
    intensity: 80,
    tint: "dark" as const,
    backgroundColor: "rgba(10, 10, 10, 0.8)",
  },
  subtle: {
    intensity: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
};
