import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { JsonLd } from "../components/JsonLd";
import "./globals.css";

const SITE = "https://decolonize.wiki";
const LOGO = `${SITE}/opengraph-image`;
const DESCRIPTION =
  "Reading the world's encyclopedia against a public decolonial methodology — and publishing the receipts.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "decolonize.wiki — the receipts on colonial framing",
    template: "%s · decolonize.wiki",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "decolonize.wiki",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "decolonize.wiki",
  url: SITE,
  description: DESCRIPTION,
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "decolonize.wiki",
  url: SITE,
  logo: LOGO,
  sameAs: ["https://github.com/decolonize-wiki"],
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
        <JsonLd data={websiteLd} />
        <JsonLd data={organizationLd} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
