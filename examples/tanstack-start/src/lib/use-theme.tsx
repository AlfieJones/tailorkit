import { useEffect, useState } from "react";

export function useThemeMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextIsDark = storedTheme ? storedTheme === "dark" : prefersDark;

    document.documentElement.classList.toggle("dark", nextIsDark);
    setIsDark(nextIsDark);
  }, []);

  function toggleTheme() {
    setIsDark((currentIsDark) => {
      const nextIsDark = !currentIsDark;

      document.documentElement.classList.toggle("dark", nextIsDark);
      window.localStorage.setItem("theme", nextIsDark ? "dark" : "light");

      return nextIsDark;
    });
  }

  return { isDark, toggleTheme };
}
