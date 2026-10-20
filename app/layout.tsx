import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@svenskamodellen/components/Footer";
import { Page } from "@svenskamodellen/components/Page";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fackförbund",
  description: "A–Ö listan över Sveriges nuvarande fackförbund",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Page>
          {children}
          <Footer
            sourceCode={["fackforbund/fackforbund.github.io", "svenskamodellen/components"]}
          />
        </Page>
      </body>
    </html>
  );
}
