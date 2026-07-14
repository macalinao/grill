import { createContext, useContext } from "react";

export type Theme = "dark" | "light" | "system";

export interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => {
    // Replaced by ThemeProvider; a bare context read is a no-op.
  },
};

export const ThemeProviderContext =
  createContext<ThemeProviderState>(initialState);

export const useTheme = (): ThemeProviderState => {
  const context = useContext(ThemeProviderContext);
  return context;
};
