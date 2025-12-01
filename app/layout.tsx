import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./styles.css";

export const metadata: Metadata = {
  title: "SoundPrints - Custom Audio Waveform Prints",
  description: "Transform your favorite audio moments into beautiful custom prints on posters, apparel, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
