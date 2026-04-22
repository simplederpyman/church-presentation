import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Church Presentation System",
  description: "Live worship presentation software",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-neutral-950 text-white antialiased">{children}</body>
    </html>
  );
}
