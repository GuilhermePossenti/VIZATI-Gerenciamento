'use client';

import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRouter } from 'next/navigation';
import { CHAMADOS_INICIAIS, EQUIPAMENTOS_INICIAIS, carregar } from '../../../services/inventoryStore';
import { useAuth } from '../../../context/AuthContext';
import styles from '../Operations.module.css';

const autorizado = (user) => ['Administrador', 'Gestor de TI', 'Analista de TI'].includes(user?.cargo);

function dadosRelatorio(equipamentos, chamados) {
  const semEstoque = equipamentos.filter((item) => Number(item.quantidade) === 0);
  const estoqueBaixo = equipamentos.filter((item) => Number(item.quantidade) > 0 && Number(item.quantidade) <= Number(item.minimo));
  const chamadosPorLoja = Object.values(chamados.reduce((acumulado, chamado) => {
    const loja = chamado.loja || 'Não informada';
    acumulado[loja] = acumulado[loja] || { loja, total: 0, abertos: 0, concluidos: 0 };
    acumulado[loja].total += 1;
    acumulado[loja][chamado.status === 'Concluído' ? 'concluidos' : 'abertos'] += 1;
    return acumulado;
  }, {}));
  return { semEstoque, estoqueBaixo, chamadosPorLoja };
}

export default function Relatorios() {
  const { user } = useAuth();
  const router = useRouter();
  const [equipamentos, setEquipamentos] = useState(EQUIPAMENTOS_INICIAIS);
  const [chamados, setChamados] = useState(CHAMADOS_INICIAIS);
  const relatorio = useMemo(() => dadosRelatorio(equipamentos, chamados), [equipamentos, chamados]);

  useEffect(() => {
    if (user && !autorizado(user)) router.replace('/dashboard');
    setEquipamentos(carregar('nexati_equipamentos', EQUIPAMENTOS_INICIAIS));
    setChamados(carregar('nexati_chamados', CHAMADOS_INICIAIS));
  }, [router, user]);

  if (!autorizado(user)) return null;

  const exportarExcel = () => {
    const workbook = XLSX.utils.book_new();
    const criarAba = (nome, linhas) => XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(linhas), nome);
    criarAba('Sem estoque', relatorio.semEstoque.map((item) => ({ Código: item.codigo, Equipamento: item.nome, Local: item.local, Quantidade: item.quantidade, Mínimo: item.minimo })));
    criarAba('Estoque baixo', relatorio.estoqueBaixo.map((item) => ({ Código: item.codigo, Equipamento: item.nome, Local: item.local, Quantidade: item.quantidade, Mínimo: item.minimo })));
    criarAba('Chamados por loja', relatorio.chamadosPorLoja.map((item) => ({ Loja: item.loja, Total: item.total, Abertos: item.abertos, Concluídos: item.concluidos })));
    XLSX.writeFile(workbook, 'relatorio-superviza-ti.xlsx');
  };

  const exportarPdf = () => {
    const documento = new jsPDF({ orientation: 'landscape' });
    documento.setFontSize(18);
    documento.text('SUPERVIZA TI - Relatório de estoque e chamados', 14, 16);
    documento.setFontSize(10);
    documento.text(`Emitido em ${new Date().toLocaleDateString('pt-BR')}`, 14, 23);
    autoTable(documento, { startY: 30, head: [['Itens sem estoque', 'Código', 'Local']], body: relatorio.semEstoque.map((item) => [item.nome, item.codigo, item.local]) });
    autoTable(documento, { startY: documento.lastAutoTable.finalY + 10, head: [['Itens com estoque baixo', 'Código', 'Qtd.', 'Mínimo']], body: relatorio.estoqueBaixo.map((item) => [item.nome, item.codigo, item.quantidade, item.minimo]) });
    autoTable(documento, { startY: documento.lastAutoTable.finalY + 10, head: [['Loja', 'Total de chamados', 'Abertos', 'Concluídos']], body: relatorio.chamadosPorLoja.map((item) => [item.loja, item.total, item.abertos, item.concluidos]) });
    documento.save('relatorio-superviza-ti.pdf');
  };

  return <div className={styles.pagina}>
    <div className={styles.cabecalho}><div><h1 className={styles.titulo}>Relatórios</h1><p className={styles.subtitulo}>Visão para diretoria e compras sobre necessidades de estoque e atendimentos.</p></div><div className={styles.ajustes}><button className="btn btn-secondary" onClick={exportarExcel}>Exportar Excel</button><button className="btn btn-primary" onClick={exportarPdf}>Exportar PDF</button></div></div>
    <div className={styles.resumo}><Resumo valor={relatorio.semEstoque.length} texto="itens sem estoque"/><Resumo valor={relatorio.estoqueBaixo.length} texto="itens com estoque baixo"/><Resumo valor={chamados.length} texto="chamados registrados"/></div>
    <RelatorioTabela titulo="Itens sem estoque" colunas={['Código', 'Equipamento', 'Local', 'Mínimo']} linhas={relatorio.semEstoque.map((item) => [item.codigo, item.nome, item.local, item.minimo])}/>
    <RelatorioTabela titulo="Itens com estoque baixo" colunas={['Código', 'Equipamento', 'Local', 'Atual', 'Mínimo']} linhas={relatorio.estoqueBaixo.map((item) => [item.codigo, item.nome, item.local, item.quantidade, item.minimo])}/>
    <RelatorioTabela titulo="Chamados por loja" colunas={['Loja', 'Total', 'Abertos', 'Concluídos']} linhas={relatorio.chamadosPorLoja.map((item) => [item.loja, item.total, item.abertos, item.concluidos])}/>
  </div>;
}

function Resumo({ valor, texto }) { return <div className={styles.resumoItem}><strong>{valor}</strong><span>{texto}</span></div>; }
function RelatorioTabela({ titulo, colunas, linhas }) { return <div className="card"><div className="card-header"><span className="card-title">{titulo}</span></div><div className="tabela-wrapper"><table><thead><tr>{colunas.map((coluna) => <th key={coluna}>{coluna}</th>)}</tr></thead><tbody>{linhas.length ? linhas.map((linha, indice) => <tr key={indice}>{linha.map((valor, coluna) => <td key={coluna}>{valor}</td>)}</tr>) : <tr><td colSpan={colunas.length} className="text-muted">Nenhum dado para este relatório.</td></tr>}</tbody></table></div></div>; }
