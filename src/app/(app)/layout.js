'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../componentes/layout/Sidebar';
import Header  from '../../componentes/layout/Header';
import Loading from '../../componentes/ui/Loading';
import styles from './AppLayout.module.css';

export default function AppLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // H3 Nielsen: redireciona para login se não autenticado
  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [user, loading, router]);

  if (loading) return <Loading />;
  if (!user)   return null;

  return (
    <div className={styles.appLayout}>
      <Sidebar />
      <div className={styles.mainArea}>
        <Header />
        {/* H8 Nielsen: layout limpo, foco no conteúdo */}
        <main className={styles.conteudo}>
          {children}
        </main>
      </div>
    </div>
  );
}
