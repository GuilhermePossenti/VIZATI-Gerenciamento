import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Viza TI — Gestão de Equipamentos',
  description: 'Controle de estoque, equipamentos e chamados de TI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
