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
    <html lang="pt-BR">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (typeof window !== 'undefined') {
                  let currentFetch = window.fetch;
                  try {
                    Object.defineProperty(window, 'fetch', {
                      get: () => currentFetch,
                      set: (v) => { if (v) currentFetch = v; },
                      configurable: true
                    });
                  } catch (err) {}
                }
              } catch (e) {}
            `
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

