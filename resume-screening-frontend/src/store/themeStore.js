import { create } from "zustand";

const getInitialTheme = () => {
  const stored = localStorage.getItem("theme");
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const useThemeStore = create((set) => ({
  theme: getInitialTheme(),

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return { theme: next };
    }),

  initTheme: () => {
    const theme = getInitialTheme();
    document.documentElement.classList.toggle("dark", theme === "dark");
    set({ theme });
  },
}));

export default useThemeStore;
