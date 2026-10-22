import { Manrope, Syne } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import SiteHeaderWithRealms from "@/components/SiteHeaderWithRealms";
import { rootSiteMetadata } from "@/lib/site-metadata";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body"
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display"
});

export const metadata = rootSiteMetadata();

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${syne.variable} font-sans antialiased`}>
        <div className="flex min-h-screen flex-col">
          <SiteHeaderWithRealms />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
