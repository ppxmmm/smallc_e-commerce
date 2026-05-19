import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmallC Storefront",
  description: "E-commerce frontend for SmallC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
