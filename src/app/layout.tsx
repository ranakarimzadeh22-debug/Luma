import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { LocaleProvider } from "@/context/LocaleContext";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Luma – Dein Zyklus-Begleiter",
  description: "Perioden-Tracker und Gesundheits-App für Frauen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-rose-50 text-gray-800">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
