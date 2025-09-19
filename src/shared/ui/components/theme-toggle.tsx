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
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={`Current theme: ${theme}. Click to cycle through themes.`}
    >
      <span className="text-lg">{getThemeIcon()}</span>
      <span className="ml-2 text-sm capitalize">{theme}</span>
    </button>
  );
}
