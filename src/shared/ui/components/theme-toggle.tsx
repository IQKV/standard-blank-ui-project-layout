import { useTheme, useUIStore } from "@/shared";

export function ThemeToggle() {
  const theme = useTheme();
  const { setTheme } = useUIStore();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return "☀️";
      case "dark":
        return "🌙";
      case "system":
        return "💻";
      default:
        return "☀️";
    }
  };

  return (
    <button
      onClick={toggleTheme}
      title={`Current theme: ${theme}. Click to cycle through themes.`}
      aria-label={`Switch theme from ${theme}`}
    >
      <span>{getThemeIcon()}</span>
      <span>{theme}</span>
    </button>
  );
}
