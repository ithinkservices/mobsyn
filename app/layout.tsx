import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'MobPlan ERP - Gestão para Móveis Planejados',
  description: 'Sistema de gestão vertical e SaaS multi-empresa para marcenarias e lojas de móveis sob medida.',
  openGraph: {
    title: 'MobPlan ERP - Gestão para Móveis Planejados',
    description: 'Sistema de gestão vertical e SaaS multi-empresa para marcenarias e lojas de móveis sob medida.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MobPlan ERP - Gestão para Móveis Planejados',
    description: 'Sistema de gestão vertical e SaaS multi-empresa para marcenarias e lojas de móveis sob medida.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  const origError = console.error;
                  console.error = function(...args) {
                    const msg = typeof args[0] === 'string' ? args[0] : '';
                    if (
                      msg.includes('hydration-mismatch') ||
                      msg.includes('hydrated but some attributes') ||
                      msg.includes('bis_skin_checked') ||
                      msg.includes('Extra attributes') ||
                      msg.includes('did not match') ||
                      msg.includes('Hydration failed')
                    ) {
                      return;
                    }
                    origError.apply(console, args);
                  };

                  const origWarn = console.warn;
                  console.warn = function(...args) {
                    const msg = typeof args[0] === 'string' ? args[0] : '';
                    if (msg.includes('hydration') || msg.includes('bis_skin_checked')) {
                      return;
                    }
                    origWarn.apply(console, args);
                  };
                }
              })();
            `
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

