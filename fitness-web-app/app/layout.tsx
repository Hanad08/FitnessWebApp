"use client";

import "./globals.css";
import Provider from "@/components/Provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-100">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
