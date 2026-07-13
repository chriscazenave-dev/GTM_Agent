import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Sidebar from "@/components/Sidebar";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GTM Agent",
  description: "Go-to-market agent for enterprise software sellers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased`}>
        <StoreProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
