import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import PlausibleProvider from "next-plausible";
import "./globals.css";

const inter = Lexend({ subsets: ["latin"] });

let title = "Web Seek – AI Search Engine";
let description =
  "Search smarter and faster with our open source AI search engine";
let url = "https://webseeker.io/";
let ogimage = "https://webseeker.io/og-image.png";
let sitename = "Webseeker.io";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: { colorPrimary: '#624cf5' },
      }}
    >
    <html lang="en">
      <head>
        <PlausibleProvider domain="webseeker.io" />
      </head>
      <body
        className={`${inter.className} flex min-h-screen flex-col justify-center`}
      >
        {children}
      </body>
    </html>
  </ClerkProvider>
  );
}
