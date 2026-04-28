import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

/** Typed-by-convention hook for reading theme context with a clear setup error. */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
