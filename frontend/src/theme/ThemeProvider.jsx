import { useMemo, useState } from "react";
import { designs } from "./designs";
import { ThemeContext } from "./ThemeContext";

const DEFAULT_THEME = "professional";
const THEME_STORAGE_KEY = "eld-trip-planner-theme";

function getStoredThemeName() {
  if (typeof window === "undefined") return DEFAULT_THEME;

  const storedThemeName = window.localStorage.getItem(THEME_STORAGE_KEY);
  return designs[storedThemeName] ? storedThemeName : DEFAULT_THEME;
}

/** Provides the active theme name, theme classes, and theme registry to the React tree. */
export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(getStoredThemeName);

  // Memoize the context value so consumers rerender only when the active theme changes.
  const value = useMemo(() => {
    const activeThemeName = designs[themeName] ? themeName : DEFAULT_THEME;
    const updateThemeName = (nextThemeName) => {
      const safeThemeName = designs[nextThemeName] ? nextThemeName : DEFAULT_THEME;

      if (typeof window !== "undefined") {
        window.localStorage.setItem(THEME_STORAGE_KEY, safeThemeName);
      }

      setThemeName(safeThemeName);
    };

    return {
      themeName: activeThemeName,
      setThemeName: updateThemeName,
      designs,
      theme: designs[activeThemeName],
    };
  }, [themeName]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
