// src/context/ThemeContext.js
import { createContext, useContext, useState, useEffect } from "react";

const defaultTheme = {
  // Colors
  accent: "#e8a838",
  accentHover: "#f0b84a",
  bg: "#0a0a0a",
  surface: "#141414",
  surface2: "#1c1c1c",
  surface3: "#242424",
  border: "#2a2a2a",
  text: "#f0f0f0",
  textMuted: "#888888",
  danger: "#e85454",
  success: "#4ade80",
  // Typography
  fontBody: "'DM Sans', sans-serif",
  fontDisplay: "'Playfair Display', serif",
  // Store settings
  storeName: "PIXORUS",
  promoBanner: "⚡ FLASH SALE — Up to 40% off on select items | Free shipping on orders over $100",
  heroTitle: "Discover Premium Style, Unmatched Quality",
  heroSubtitle: "Explore our curated collection of premium products — from luxury accessories to cutting-edge electronics.",
  // Layout
  borderRadius: "12px",
  headerHeight: "70px",
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem("px_theme");
      return stored ? { ...defaultTheme, ...JSON.parse(stored) } : defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  useEffect(() => {
    // Apply CSS variables to document root
    const root = document.documentElement;
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--accent-hover", theme.accentHover);
    root.style.setProperty("--accent-glow", hexToRgba(theme.accent, 0.15));
    root.style.setProperty("--bg", theme.bg);
    root.style.setProperty("--surface", theme.surface);
    root.style.setProperty("--surface-2", theme.surface2);
    root.style.setProperty("--surface-3", theme.surface3);
    root.style.setProperty("--border", theme.border);
    root.style.setProperty("--text", theme.text);
    root.style.setProperty("--text-muted", theme.textMuted);
    root.style.setProperty("--danger", theme.danger);
    root.style.setProperty("--success", theme.success);
    root.style.setProperty("--radius", theme.borderRadius);
    root.style.setProperty("--header-height", theme.headerHeight);
    root.style.setProperty("--font-body", theme.fontBody);
    root.style.setProperty("--font-display", theme.fontDisplay);
    document.body.style.background = theme.bg;
    document.body.style.color = theme.text;
    document.body.style.fontFamily = theme.fontBody;
  }, [theme]);

  const updateTheme = (updates) => {
    setTheme((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem("px_theme", JSON.stringify(next));
      return next;
    });
  };

  const resetTheme = () => {
    localStorage.removeItem("px_theme");
    setTheme(defaultTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme, defaultTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

function hexToRgba(hex, alpha) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(232,168,56,${alpha})`;
  return `rgba(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)},${alpha})`;
}
