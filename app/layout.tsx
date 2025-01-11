import { Caveat } from 'next/font/google';
import type { Metadata } from "next";
// import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
// import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
// import { AppSidebar } from "@/components/app-sidebar"

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

const caveat = Caveat({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Minha Tata",
  description: "Feliz aniversário",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="Pt-Br">
      {/* <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger /> */}
      <body
        className={`${caveat.className} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          >
          
            {children}
          </ThemeProvider>
      </body>
    {/* </SidebarProvider> */}
    </html>
  );
}
