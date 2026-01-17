import { Colors } from "@/constants/theme";
import { useTheme as useThemeContext } from "@/context/ThemeContext";

export function useTheme() {
  const { isDark } = useThemeContext();
  const theme = isDark ? Colors.dark : Colors.light;

  return {
    theme,
    isDark,
  };
}
