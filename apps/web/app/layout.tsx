import type { Metadata } from "next";
import { Raleway, Roboto_Slab, Comfortaa } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Providers } from "@/components/providers/SessionProvider";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Czech Rocket Society | CRS",
  description: "Official platform of Czech Rocket Society - Showcasing our rocket projects, team members, and space technology innovations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body
        className={`${raleway.variable} ${robotoSlab.variable} ${comfortaa.variable} font-sans antialiased`}
      >
        <Providers>
          <ScrollToTop />
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
