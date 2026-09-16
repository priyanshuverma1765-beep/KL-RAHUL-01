import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "KLR01 — The Rahul Archive",
  description: "An independent KL Rahul fan archive with verified Cricsheet analytics, a chronological journey, century vault, gallery and grounded AI fan assistant.",
  applicationName: "KLR01",
  keywords: ["KL Rahul", "cricket analytics", "fan archive", "Cricsheet"],
  openGraph: {
    title: "KLR01 — The Rahul Archive",
    description: "A cinematic, data-grounded KL Rahul fan archive.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070809",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
