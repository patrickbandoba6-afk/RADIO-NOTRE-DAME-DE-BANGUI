import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Administration — Radio Notre-Dame de Bangui",
  description:
    "Back-office éditorial de Radio Notre-Dame de Bangui, 103.3 FM. Gestion des actualités, annonces, émissions, podcasts et contenus spirituels.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
