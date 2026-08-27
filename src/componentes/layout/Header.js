'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './Header.module.css';

// H1 Nielsen: breadcrumb mostra onde o usuário está
const BREADCRUMBS = {
  '/dashboard': [{ label: 'Visão geral' }],
  '/equipamentos': [{ label: 'Equipamentos' }],
  '/estoque': [{ label: 'Controle de estoque' }],
  '/estoque/atencao': [{ label: 'Controle de estoque' }, { label: 'Itens em atenção' }],
  '/estoque/historico': [{ label: 'Controle de estoque' }, { label: 'Histórico de movimentações' }],
  '/chamados': [{ label: 'Chamados' }],
  '/relatorios': [{ label: 'Relatórios' }],
  '/lojas': [{ label: 'Lojas' }],
  '/usuarios': [{ label: 'Usuários' }],
};

export default function Header() {
  const pathname = usePathname();
  const crumbs   = BREADCRUMBS[pathname] ?? [];

  return (
    <header className={styles.header}>
      {/* Breadcrumb — H1: visibilidade do status (localização) */}
      <nav className={styles.breadcrumb} aria-label="Localização">
        <Link href="/dashboard" className={styles.crumbHome} title="Painel principal">
          Central de Operações de TI
        </Link>
        {crumbs.map((c, i) => (
          <span key={i} className={styles.crumbItem}>
            <span className={styles.sep}>›</span>
            <span className={styles.crumbAtual}>{c.label}</span>
          </span>
        ))}
      </nav>

      {/* Info do ano letivo — H2: linguagem do mundo real */}
      <div className={styles.info}>
        <span className={styles.badge}>Sistema operacional</span>
      </div>
    </header>
  );
}
