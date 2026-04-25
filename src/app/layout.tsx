import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YT Shorts Tracker",
  description: "Track and analyze YouTube Shorts performance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-neutral-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
