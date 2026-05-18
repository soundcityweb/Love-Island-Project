import { Bebas_Neue, Outfit } from "next/font/google";
import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "500"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "Love Island Nigeria",
  description: "Welcome to Love Island Nigeria",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${bebas.variable} ${outfit.variable}`}>{children}</body>
    </html>
  );
}
