import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { AppStateProvider } from "@/lib/AppState";
import { AuthGate } from "@/components/AuthGate";
import { Footer, Header } from "@/components/SiteShell";
export const metadata: Metadata = { title: "CollabAI — Find your people", description: "Thoughtful collaboration begins here." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AuthGate>
            <AppStateProvider>
              <Header />
              <main>{children}</main>
              <Footer />
            </AppStateProvider>
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
