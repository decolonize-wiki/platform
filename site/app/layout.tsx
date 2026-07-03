import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://decolonize.wiki"),
  title: "decolonize.wiki",
  description:
    "Reading the world's encyclopedia against a public decolonial methodology — and publishing the receipts.",
  openGraph: {
    siteName: "decolonize.wiki",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // lang is hardcoded to en for launch (en-only); the routing is i18n-ready.
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
