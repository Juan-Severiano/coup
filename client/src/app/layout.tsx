import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coup Online",
  description: "A online multiplayer card game of deception and strategy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
