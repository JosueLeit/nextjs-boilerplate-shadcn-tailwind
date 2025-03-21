import { Caveat } from 'next/font/google';
import type { Metadata } from "next";
// import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
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
  title: "FavoritePerson",
  description: "Compartilhe momentos especiais com sua pessoa favorita",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      {/* <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger /> */}
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        caveat.className
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-neutral-100">
            <header className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-pink-600 font-handwriting">FavoritePerson</h1>
              </div>
            </header>
            {children}
            <footer className="bg-white border-t py-6 mt-10 text-center text-sm text-gray-500">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="mb-2">Feito com ❤️ para capturar momentos especiais</p>
                <p className="text-xs text-gray-400">© {new Date().getFullYear()} FavoritePerson - Todos os direitos reservados</p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    {/* </SidebarProvider> */}
    </html>
  );
}
