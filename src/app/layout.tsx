import type { Metadata } from "next";
import { Roboto, Roboto_Serif, Roboto_Condensed } from "next/font/google";
import "./globals.css";

// Match kofc10325.org exactly: Roboto Serif (headings), Roboto (body),
// Roboto Condensed (labels). next/font self-hosts these at build time.
const robotoSerif = Roboto_Serif({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-head",
  display: "swap",
});
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});
const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-label",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Council 10325 Newsletter Studio",
  description: "Assemble and publish the monthly council newsletter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${robotoSerif.variable} ${robotoCondensed.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
