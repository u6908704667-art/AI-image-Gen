import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NovaZone XI - AI Anime Art Generator',
  description: 'Generate stunning anime masterpieces with cutting-edge AI technology powered by Stable Diffusion XL',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
