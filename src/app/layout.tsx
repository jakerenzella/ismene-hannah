import type { Metadata } from "next";
import { Caveat, Esteban, Plus_Jakarta_Sans, Work_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-caveat",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
});

const esteban = Esteban({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  variable: "--font-esteban",
});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Ismene + Hannah's Wedding — 27 February 2027 in Melbourne",
  description:
    "Ismene & Hannah are tying the knot in Melbourne on 27 February 2027. Join us at the Village Green at Ceres in Brunswick for the ceremony, then on to Maharaja Palace in Northcote for dinner and dancing.",
  icons: {
    icon: "/assets/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVariables = `${plusJakarta.variable} ${caveat.variable} ${workSans.variable} ${esteban.variable}`;
  return (
    <html
      lang="en"
      className={`scroll-smooth ${fontVariables}`}
      data-scroll-behavior="smooth"
    >
      <head>
        {/* Material Symbols is an icon font; not in next/font/google's catalog. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
