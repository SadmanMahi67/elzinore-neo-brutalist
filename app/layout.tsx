import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#000000",
          colorText: "#000000",
          borderRadius: "0px",
        },
        elements: {
          card: "border-4 border-border shadow-brutal rounded-none bg-panel",
          modalContent: "border-4 border-border rounded-none shadow-brutal-md",
          socialButtonsBlockButton:
            "border-4 border-border rounded-none font-grotesk font-black uppercase shadow-brutal hover:-translate-y-0.5 hover:shadow-brutal-md active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all",
          socialButtonsBlockButtonText: "font-grotesk font-black uppercase text-sm",
          headerTitle: "font-grotesk font-black uppercase tracking-tight text-2xl",
          headerSubtitle: "font-grotesk font-bold text-sm text-foreground/80",
          formButtonPrimary:
            "border-4 border-border bg-accent text-black font-grotesk font-black uppercase rounded-none shadow-brutal hover:shadow-brutal-md active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
          footerActionLink: "font-black underline hover:text-accent",
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
