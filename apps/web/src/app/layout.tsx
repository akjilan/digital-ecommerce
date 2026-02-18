import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { ToastContextProvider } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Digital E-Commerce",
    template: "%s | Digital E-Commerce",
  },
  description:
    "Discover premium tech products. Fast, secure, and beautifully designed for the modern shopper.",
  keywords: ["e-commerce", "tech", "shopping", "products"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen flex flex-col antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastContextProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-[var(--color-border)] py-8 mt-auto">
              <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--color-muted-foreground)]">
                <p>© 2026 Digital E-Commerce. All rights reserved.</p>
                <div className="flex gap-4">
                  <a
                    href="/products"
                    className="hover:text-[var(--color-foreground)] transition-colors"
                  >
                    Products
                  </a>
                  <a
                    href="/auth/login"
                    className="hover:text-[var(--color-foreground)] transition-colors"
                  >
                    Login
                  </a>
                  <a
                    href="/auth/register"
                    className="hover:text-[var(--color-foreground)] transition-colors"
                  >
                    Register
                  </a>
                </div>
              </div>
            </footer>
          </ToastContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
