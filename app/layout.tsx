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
      <head>
        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://images-api.printify.com" />
        
        {/* Preconnect to Google Fonts for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload most common fonts used in the customizer */}
        <link 
          rel="preload" 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Montserrat:wght@400;700&family=Playfair+Display:wght@400;700&display=swap" 
          as="style"
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Montserrat:wght@400;700&family=Playfair+Display:wght@400;700&display=swap" 
          rel="stylesheet"
        />
        
        {/* Preload critical mockup images */}
        <link rel="preload" href="/mockups/living-room.png" as="image" type="image/png" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
