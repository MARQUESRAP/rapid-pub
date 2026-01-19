import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout";

export const metadata: Metadata = {
  title: "Rapid-Pub Dashboard",
  description: "Gestion des devis, commandes et clients pour Rapid-Pub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased bg-gray-50">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
