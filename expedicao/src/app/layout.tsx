import '../app/styles/globals.css';

export const metadata = {
  title: 'Conferência de Expedição',
  description: 'Sistema de conferência entre nota fiscal e etiqueta',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
