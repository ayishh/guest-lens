import { Playfair_Display, Jost } from "next/font/google";
import "./globals.css";

// Next.js downloads these fonts at build time and serves them from your own
// site — faster than the old <style jsx> Google Fonts import, and it works
// on every page automatically, no "use client" needed just for fonts.
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Guest Lens",
  description: "Share your photos from Fatin & Fazreen's wedding day",
};

// This tells phone browsers to render the page at the phone's real width,
// instead of zoomed out like a desktop site. Without this, mobile layouts
// (like the gold-bordered cards) can look tiny and squished.
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${jost.variable}`}>
      <body style={{ margin: 0, background: "#0A1628" }}>{children}</body>
    </html>
  );
}
