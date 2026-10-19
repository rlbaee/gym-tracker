import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lifted — gym tracker",
  description: "A calm, simple place to keep your training moving.",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
