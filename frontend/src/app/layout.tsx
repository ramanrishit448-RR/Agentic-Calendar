import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@descope/nextjs-sdk";
import { cn } from "@/lib/utils";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const heading = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Meeting Assistant",
  description: "Calendar meeting assistant with Descope",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const projectId = process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID ?? "";

  const cookieOptions = {
    sameSite: "Lax" as const,
    secure: process.env.NODE_ENV !== "development",
  };

  return (
    <AuthProvider
      projectId={projectId}
      sessionTokenViaCookie={cookieOptions}
      refreshTokenViaCookie={cookieOptions}
    >
      <html lang="en" className={cn(sans.variable, heading.variable)}>
        <body className="min-h-svh bg-background font-sans text-foreground antialiased">
          {children}
        </body>
      </html>
    </AuthProvider>
  );
}
