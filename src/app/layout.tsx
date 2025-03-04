import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <title>Gerenciador de Produtos</title>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
