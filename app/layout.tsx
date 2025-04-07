import './styles/globals.css';
import './styles/reactflow.css';
import { Inter } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import dynamic from 'next/dynamic';

// Load Navigation component without SSR since it uses client features
const Navigation = dynamic(() => import('./components/Navigation'), {
  ssr: true,
});

// Configure font with optimized loading
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
  variable: '--font-inter' // Allow the font to be used in CSS variables
});

// Enhanced metadata configuration
export const metadata: Metadata = {
  title: {
    template: '%s | ServiceNow Agentic AI Visualization',
    default: 'ServiceNow Agentic AI Workflow Visualization'
  },
  description: 'Visualize ServiceNow Agentic AI workflows, agents, and process interactions',
  keywords: ['ServiceNow', 'Agentic AI', 'Visualization', 'Workflow', 'AI Agent'],
  authors: [{ name: 'ServiceNow' }],
  creator: 'ServiceNow',
  publisher: 'ServiceNow',
};

// Optimize viewport settings
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50`}>
        <Navigation />
        <main className="flex-grow">{children}</main>
        <footer className="py-4 px-6 text-center text-sm text-gray-500 border-t">
          <p>© {new Date().getFullYear()} ServiceNow Agentic AI Visualization</p>
        </footer>
      </body>
    </html>
  );
} 