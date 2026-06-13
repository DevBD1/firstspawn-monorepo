"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dusk" | "day";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // The blocking script in the root layout has already set data-theme before
  // hydration, so the attribute is the source of truth on the client.
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === "undefined") {
      return "dusk";
    }
    return document.documentElement.getAttribute("data-theme") === "day" ? "day" : "dusk";
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("fsproto.mode", theme);
    } catch (e) {
      console.error("Failed to write theme changes", e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dusk" ? "day" : "dusk"));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
