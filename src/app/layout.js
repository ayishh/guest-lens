import { Playfair_Display, Jost, Great_Vibes } from "next/font/google";
import "./globals.css";

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

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-script",
});

export const metadata = {
  title: "Melalui Mata Anda / Through Your Eyes — Fatin & Fazreen",
  description:
    "Gambar acah-acah professional kami serah pada photographer. Kongsi real story dari sudut anda — including a handsome/cantik photo of yourself.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ms"
      className={`${playfairDisplay.variable} ${jost.variable} ${greatVibes.variable}`}
    >
      <body style={{ margin: 0, background: "#0A1628" }}>{children}</body>
    </html>
  );
}
