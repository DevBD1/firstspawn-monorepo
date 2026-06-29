import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { JetBrains_Mono, Onest, Unbounded } from "next/font/google";

import "../globals.css";
import { getAuthState } from "@/lib/auth";
import { ThemeProvider } from "@/components/providers/ThemeProvider.client";
import AdminShell from "./_components/AdminShell.client";

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-display-base",
  weight: ["400", "500", "600", "700"],
});
const onestUi = Onest({
  subsets: ["latin"],
  variable: "--font-ui-base",
  weight: ["400", "500", "600", "700"],
});
const onestBody = Onest({
  subsets: ["latin"],
  variable: "--font-body-base",
  weight: ["400", "500", "600", "700"],
});
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-base" });

// The admin console is English-only (docs/releases/v1-mvp.md) and must never be
// indexed. The proxy also strips it from the i18n redirect and sets a noindex
// header; this is the in-app belt-and-braces.
export const metadata: Metadata = {
  title: "Admin · FirstSpawn",
  robots: { index: false, follow: false },
};

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const authState = await getAuthState();

  // Gate the whole subtree. Unauthenticated → login with a return path;
  // signed-in-but-not-admin → home. The API enforces the same allowlist on
  // every admin endpoint, so this is access UX, not the security boundary.
  if (!authState.isAuthenticated) {
    redirect("/en/login?next=%2Fadmin");
  }
  if (!authState.user?.is_admin) {
    redirect("/en");
  }

  const user = authState.user;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${unbounded.variable} ${onestUi.variable} ${onestBody.variable} ${jetBrainsMono.variable} antialiased min-h-screen`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("fsproto.mode");if(t==="day"||t==="dusk"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`,
          }}
        />
        <ThemeProvider>
          <AdminShell username={user.username} email={user.email}>
            {children}
          </AdminShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
