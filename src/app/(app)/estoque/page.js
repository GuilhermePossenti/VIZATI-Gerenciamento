'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { EQUIPAMENTOS_INICIAIS, carregar, salvar } from '../../../services/inventoryStore';
import { useAuth } from '../../../context/AuthContext';
import styles from '../Operations.module.css';

const podeVerHistorico = (user) => ['Administrador', 'Gestor de TI', 'Analista de TI'].includes(user?.cargo);

export default function Estoque() {
  const { user } = useAuth();
  const [lista, setLista] = useState(EQUIPAMENTOS_INICIAIS);

  useEffect(() => setLista(carregar('nexati_equipamentos', EQUIPAMENTOS_INICIAIS)), []);

  const ajustar = (id, variacao) => {
    const equipamento = lista.find((item) => item.id === id);
    if (!equipamento || (variacao < 0 && Number(equipamento.quantidade) === 0)) return;
    const quantidadeAnterior = Number(equipamento.quantidade);
    const quantidadeAtual = Math.max(0, quantidadeAnterior + variacao);
    const proximaLista = lista.map((item) => item.id === id ? { ...item, quantidade: quantidadeAtual } : item);
    const historico = carregar('vizati_movimentacoes', []);
    const movimento = {
      id: Date.now(),
      data: new Date().toLocaleString('pt-BR'),
      equipamento: equipamento.nome,
      codigo: equipamento.codigo,
      tipo: variacao > 0 ? 'Entrada' : 'Saída',
      quantidade: Math.abs(variacao),
      saldoAnterior: quantidadeAnterior,
      saldoAtual: quantidadeAtual,
      usuario: user?.nome || 'Usuário não identificado',
      cargo: user?.cargo || '',
    };
    setLista(proximaLista);
    salvar('nexati_equipamentos', proximaLista);
    salvar('vizati_movimentacoes', [movimento, ...historico]);
  };

  const total = lista.reduce((soma, item) => soma + Number(item.quantidade), 0);
  const baixo = lista.filter((item) => item.quantidade < 3 && item.quantidade > 0).length;
  const zerado = lista.filter((item) => item.quantidade === 0).length;

  return <div className={styles.pagina}>
    <div className={styles.cabecalho}><div><h1 className={styles.titulo}>Controle de estoque</h1><p className={styles.subtitulo}>Registre entradas e saídas rápidas. Menos de 3 unidades exige atenção.</p></div>{podeVerHistorico(user) && <Link href="/estoque/historico" className="btn btn-secondary">Histórico de movimentações</Link>}</div>
    <div className={styles.resumo}><Resumo valor={total} texto="unidades disponíveis"/><Resumo valor={baixo} texto="itens em atenção"/><Resumo valor={zerado} texto="itens sem estoque"/></div>
    <div className="card"><div className="tabela-wrapper"><table><thead><tr><th>Equipamento</th><th>Local</th><th>Limite</th><th>Atual</th><th>Situação</th><th>Movimentar</th></tr></thead><tbody>{lista.map((equipamento) => <tr key={equipamento.id}><td><b>{equipamento.nome}</b><br/><span className="text-muted">{equipamento.codigo}</span></td><td>{equipamento.local}</td><td>{equipamento.minimo}</td><td><span className={styles.quantidade}>{equipamento.quantidade}</span></td><td><span className={`badge ${equipamento.quantidade === 0 ? 'badge-risco' : equipamento.quantidade < 3 ? 'badge-atencao' : 'badge-regular'}`}>{equipamento.quantidade === 0 ? 'Sem estoque' : equipamento.quantidade < 3 ? 'Atenção' : 'Normal'}</span></td><td><div className={styles.ajustes}><button className="btn btn-secondary btn-sm" onClick={() => ajustar(equipamento.id, -1)} aria-label="Registrar saída">− Saída</button><button className="btn btn-primary btn-sm" onClick={() => ajustar(equipamento.id, 1)} aria-label="Registrar entrada">+ Entrada</button></div></td></tr>)}</tbody></table></div></div>
  </div>;
}

function Resumo({ valor, texto }) { return <div className={styles.resumoItem}><strong>{valor}</strong><span>{texto}</span></div>; }
