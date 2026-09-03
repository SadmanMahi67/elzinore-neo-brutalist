"use client";

import { CartProvider } from "./CartProvider";
import { ModalProvider } from "./ModalProvider";
import { ThemeProvider } from "./ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CartProvider>
        <ModalProvider>{children}</ModalProvider>
      </CartProvider>
    </ThemeProvider>
  );
}
