import type { Metadata } from "next";
import Providers from "@/components/Providers";
import Popunder from "@/components/Popunder";
import "./globals.css";

export const metadata: Metadata = {
  title: "AnimeLove AI — Your Anime Girlfriend Awaits",
  description:
    "Chat with your perfect anime girlfriend. Normal, romantic & adult moods. AI-powered, always online.",
  keywords: ["anime ai girlfriend", "ai chatbot", "anime chat", "virtual girlfriend"],
  openGraph: {
    title: "AnimeLove AI",
    description: "Your perfect anime girlfriend, powered by AI.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-base">
        <Providers>
          {children}
          <Popunder />
        </Providers>
      </body>
    </html>
  );
}