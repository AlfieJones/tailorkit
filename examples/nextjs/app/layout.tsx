import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { demoAuthCookieName, getDemoUser } from "@examples/shared";
import { AuthScreen } from "@/components/auth-screen";
import { TailorKitShell } from "@/components/tailorkit-shell";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "TailorKit CRM",
  description: "A Next.js App Router host application for TailorKit.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const user = getDemoUser(cookieStore.get(demoAuthCookieName)?.value);

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {user ? <TailorKitShell user={user}>{children}</TailorKitShell> : <AuthScreen />}
        </ThemeProvider>
      </body>
    </html>
  );
}
