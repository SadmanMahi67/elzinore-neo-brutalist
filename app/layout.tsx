import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Footer } from "@/components/sections/Footer";
import { Nav } from "@/components/sections/Nav";
import { Providers } from "@/components/providers/Providers";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { ProductModal } from "@/components/shop/ProductModal";
import { THEME_STORAGE_KEY } from "@/lib/constants";
import "./globals.css";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-grotesk",
});

export const metadata: Metadata = {
  title: {
    default: "Elzinore — Carbon Fiber RFID Wallet",
    template: "%s — Elzinore",
  },
  description:
    "Premium men's accessories from Bangladesh. Launching with a slim carbon fiber RFID-blocking wallet.",
};

const themeScript = `
(function() {
  try {
    var key = "${THEME_STORAGE_KEY}";
    var stored = localStorage.getItem(key);
    var dark = stored === "dark" || (stored !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${grotesk.variable} font-grotesk font-bold antialiased`}>
        <Providers>
          <Nav />
          {children}
          <Footer />
          <ProductModal />
          <CartDrawer />
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
