import { useTheme } from "../theme/useTheme";

/**
 * Icon button for toggling between professional light and dark themes.
 * Theme changes flow through ThemeProvider and update all themed components.
 */
export default function ThemeSwitcher() {
  const { themeName, setThemeName, theme } = useTheme();
  const isDark = themeName === "professionalDark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setThemeName(isDark ? "professional" : "professionalDark")}
      className={`${theme.pill} h-10 w-10 px-0`}
    >
      <LightModeIcon />
    </button>
  );
}

function LightModeIcon() {
  return (
    <svg
      className="h-4.5 w-4.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}
