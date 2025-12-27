import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P, VT323 } from "next/font/google";
import "../globals.css"; // Reuse global styles

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
});

export const metadata: Metadata = {
  title: "Admin Panel | FirstSpawn",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`
        ${geistSans.variable} 
        ${geistMono.variable} 
        ${pressStart2P.variable} 
        ${vt323.variable} 
        bg-background text-foreground font-retro antialiased min-h-screen flex
      `}>
        <div className="crt-overlay" />
        
        {/* Sidebar */}
        <aside className="w-64 bg-navbar-bg p-6 border-r border-black hidden md:block z-10 relative">
          <div className="font-bold text-xl mb-8 text-fs-diamond pixel-font">ADMIN</div>
          <nav className="flex flex-col gap-2">
            <a href="/admin" className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded transition font-mono">Dashboard</a>
            <a href="/admin/servers" className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded transition font-mono">Servers</a>
            <div className="p-2 text-slate-600 cursor-not-allowed font-mono">Settings</div>
            <div className="p-2 text-slate-600 cursor-not-allowed font-mono">Users</div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 z-10 relative">
          {children}
        </main>
      </body>
    </html>
  );
}
