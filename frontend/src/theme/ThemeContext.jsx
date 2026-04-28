import { createContext } from "react";

// Null default lets useTheme fail fast when a component renders outside ThemeProvider.
export const ThemeContext = createContext(null);
