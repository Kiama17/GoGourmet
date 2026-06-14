import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

export function useApp() {
  const theme = useTheme();
  const lang = useLanguage();
  return { ...theme, ...lang };
}
