import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Footer } from "@/components/sections/Footer";
import { Nav } from "@/components/sections/Nav";
import { Providers } from "@/components/providers/Providers";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { ProductModal } from "@/components/shop/ProductModal";
import { THEME_STORAGE_KEY, SITE_URL } from "@/lib/constants";
import "./globals.css";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#ff6b6b",
          borderRadius: "0px",
          fontFamily: "var(--font-grotesk), sans-serif",
        },
      }}
    >
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
        </body>
      </html>
    </ClerkProvider>
  );
}
