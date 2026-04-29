export const themes = ["system", "light", "dark"] as const;

export type AppTheme = (typeof themes)[number];

export const fallbackTheme = "system" satisfies AppTheme;
export const themeCookieName = "theme";
export const themeStorageKey = "theme";

export const isAppTheme = (value: unknown): value is AppTheme =>
  typeof value === "string" && themes.includes(value as AppTheme);

export const getUserTheme = (user: unknown): AppTheme | undefined => {
  if (!(user && typeof user === "object" && "theme" in user)) {
    return;
  }

  const theme = (user as { theme?: unknown }).theme;
  return isAppTheme(theme) ? theme : undefined;
};

export const getCachedThemeScript = () => `(() => {
  const themes = new Set(["system", "light", "dark"]);
  const fallbackTheme = "${fallbackTheme}";
  const storageKey = "${themeStorageKey}";
  const cookieName = "${themeCookieName}";
  const cookiePrefix = \`\${cookieName}=\`;
  const cachedCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(cookiePrefix))
    ?.slice(cookiePrefix.length);
  const cachedStorage = localStorage.getItem(storageKey);
  const theme = themes.has(cachedStorage) ? cachedStorage : themes.has(cachedCookie) ? cachedCookie : fallbackTheme;
  const resolvedTheme =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  document.documentElement.style.colorScheme = resolvedTheme;
})();`;
