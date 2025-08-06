import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from '@/components/ui/sidebar';
import { MainLayout } from '@/components/main-layout';
import { AlertProvider } from '@/context/alert-context';

export const metadata: Metadata = {
  title: 'Aegis Vision AI - Smart Surveillance',
  description: 'AI-powered security monitoring for real-time threat detection.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider defaultOpen={true}>
          <AlertProvider>
            <MainLayout>
                {children}
            </MainLayout>
          </AlertProvider>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
