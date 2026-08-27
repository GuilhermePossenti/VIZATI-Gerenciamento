'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { EQUIPAMENTOS_INICIAIS, carregar } from '../../../../services/inventoryStore';
import styles from '../../Operations.module.css';

export default function EstoqueAtencaoPage() {
  const [itens, setItens] = useState([]);

  useEffect(() => {
    const equipamentos = carregar('nexati_equipamentos', EQUIPAMENTOS_INICIAIS);
    setItens(equipamentos.filter((item) => Number(item.quantidade) < 3));
  }, []);

  return (
    <div className={styles.pagina}>
      <div className={styles.cabecalho}>
        <div>
          <h1 className={styles.titulo}>Estoque em atenção</h1>
          <p className={styles.subtitulo}>{itens.length} itens com menos de 3 unidades disponíveis.</p>
        </div>
        <Link href="/estoque" className="btn btn-secondary">← Voltar ao estoque</Link>
      </div>

      {itens.length === 0 ? (
        <div className="card estado-vazio">
          <span className="estado-vazio-titulo">Nenhum item exige atenção</span>
          <span className="estado-vazio-subtitulo">Todos os equipamentos possuem pelo menos 3 unidades.</span>
        </div>
      ) : (
        <div className={styles.listaAtencao}>
          {itens.map((item) => (
            <article className={styles.itemAtencao} key={item.id}>
              <div>
                <span className={styles.codigoAtencao}>{item.codigo}</span>
                <h2>{item.nome}</h2>
                <p>{item.categoria} · {item.local}</p>
              </div>
              <div className={styles.saldoAtencao}>
                <strong>{item.quantidade}</strong>
                <span>unidade{item.quantidade === 1 ? '' : 's'}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
