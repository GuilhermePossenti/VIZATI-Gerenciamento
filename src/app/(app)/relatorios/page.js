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
const opcoesRelatorio = [
  { id: 'todoEstoque', titulo: 'Todo o estoque (com e sem saldo)', aba: 'Todo o estoque' },
  { id: 'itensDisponiveis', titulo: 'Itens disponíveis em estoque', aba: 'Itens disponíveis' },
  { id: 'semEstoque', titulo: 'Itens sem estoque', aba: 'Sem estoque' },
  { id: 'estoqueBaixo', titulo: 'Itens com estoque baixo', aba: 'Estoque baixo' },
  { id: 'chamadosPorLoja', titulo: 'Chamados por loja', aba: 'Chamados por loja' },
];

function dadosRelatorio(equipamentos, chamados) {
  const todoEstoque = equipamentos;
  const itensDisponiveis = equipamentos.filter((item) => Number(item.quantidade) > 0);
  const semEstoque = equipamentos.filter((item) => Number(item.quantidade) === 0);
  const estoqueBaixo = equipamentos.filter((item) => Number(item.quantidade) > 0 && Number(item.quantidade) <= Number(item.minimo));
  const chamadosPorLoja = Object.values(chamados.reduce((acumulado, chamado) => {
    const loja = chamado.loja || 'Não informada';
    acumulado[loja] = acumulado[loja] || { loja, total: 0, abertos: 0, concluidos: 0 };
    acumulado[loja].total += 1;
    acumulado[loja][chamado.status === 'Concluído' ? 'concluidos' : 'abertos'] += 1;
    return acumulado;
  }, {}));
  return { todoEstoque, itensDisponiveis, semEstoque, estoqueBaixo, chamadosPorLoja };
}

export default function Relatorios() {
  const { user } = useAuth();
  const router = useRouter();
  const [equipamentos, setEquipamentos] = useState(EQUIPAMENTOS_INICIAIS);
  const [chamados, setChamados] = useState(CHAMADOS_INICIAIS);
  const [exportacaoAberta, setExportacaoAberta] = useState(false);
  const [selecionados, setSelecionados] = useState({ todoEstoque: true, itensDisponiveis: true, semEstoque: true, estoqueBaixo: true, chamadosPorLoja: true });
  const relatorio = useMemo(() => dadosRelatorio(equipamentos, chamados), [equipamentos, chamados]);

  useEffect(() => {
    if (user && !autorizado(user)) router.replace('/dashboard');
    setEquipamentos(carregar('nexati_equipamentos', EQUIPAMENTOS_INICIAIS));
    setChamados(carregar('nexati_chamados', CHAMADOS_INICIAIS));
  }, [router, user]);

  if (!autorizado(user)) return null;

  const secoesSelecionadas = () => opcoesRelatorio.filter((opcao) => selecionados[opcao.id]);

  const exportarExcel = () => {
    const secoes = secoesSelecionadas();
    if (!secoes.length) return;
    const workbook = XLSX.utils.book_new();
    const criarAba = (nome, linhas) => XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(linhas), nome);
    const linhaEstoque = (item) => ({ Código: item.codigo, Equipamento: item.nome, Local: item.local, Quantidade: item.quantidade, Mínimo: item.minimo, Situação: Number(item.quantidade) === 0 ? 'Sem estoque' : Number(item.quantidade) <= Number(item.minimo) ? 'Estoque baixo' : 'Disponível' });
    if (selecionados.todoEstoque) criarAba('Todo o estoque', relatorio.todoEstoque.map(linhaEstoque));
    if (selecionados.itensDisponiveis) criarAba('Itens disponíveis', relatorio.itensDisponiveis.map(linhaEstoque));
    if (selecionados.semEstoque) criarAba('Sem estoque', relatorio.semEstoque.map((item) => ({ Código: item.codigo, Equipamento: item.nome, Local: item.local, Quantidade: item.quantidade, Mínimo: item.minimo })));
    if (selecionados.estoqueBaixo) criarAba('Estoque baixo', relatorio.estoqueBaixo.map((item) => ({ Código: item.codigo, Equipamento: item.nome, Local: item.local, Quantidade: item.quantidade, Mínimo: item.minimo })));
    if (selecionados.chamadosPorLoja) criarAba('Chamados por loja', relatorio.chamadosPorLoja.map((item) => ({ Loja: item.loja, Total: item.total, Abertos: item.abertos, Concluídos: item.concluidos })));
    XLSX.writeFile(workbook, 'relatorio-superviza-ti.xlsx');
    setExportacaoAberta(false);
  };

  const exportarPdf = () => {
    const secoes = secoesSelecionadas();
    if (!secoes.length) return;
    const documento = new jsPDF({ orientation: 'portrait' });
    documento.setFontSize(18);
    documento.text('SUPERVIZA TI - Relatórios selecionados', 14, 16);
    documento.setFontSize(10);
    documento.text(`Emitido em ${new Date().toLocaleDateString('pt-BR')}`, 14, 23);
    let posicaoY = 30;
    const adicionarTabela = (titulo, cabecalho, linhas) => {
      if (posicaoY > 165) { documento.addPage(); posicaoY = 18; }
      documento.setFontSize(12);
      documento.text(titulo, 14, posicaoY);
      autoTable(documento, { startY: posicaoY + 5, head: [cabecalho], body: linhas });
      posicaoY = documento.lastAutoTable.finalY + 12;
    };
    if (selecionados.todoEstoque) adicionarTabela('Todo o estoque', ['Equipamento', 'Código', 'Local', 'Qtd.', 'Situação'], relatorio.todoEstoque.map((item) => [item.nome, item.codigo, item.local, item.quantidade, Number(item.quantidade) === 0 ? 'Sem estoque' : Number(item.quantidade) <= Number(item.minimo) ? 'Baixo' : 'Disponível']));
    if (selecionados.itensDisponiveis) adicionarTabela('Itens disponíveis em estoque', ['Equipamento', 'Código', 'Local', 'Qtd.', 'Situação'], relatorio.itensDisponiveis.map((item) => [item.nome, item.codigo, item.local, item.quantidade, Number(item.quantidade) <= Number(item.minimo) ? 'Baixo' : 'Disponível']));
    if (selecionados.semEstoque) adicionarTabela('Itens sem estoque', ['Equipamento', 'Código', 'Local'], relatorio.semEstoque.map((item) => [item.nome, item.codigo, item.local]));
    if (selecionados.estoqueBaixo) adicionarTabela('Itens com estoque baixo', ['Equipamento', 'Código', 'Qtd.', 'Mínimo'], relatorio.estoqueBaixo.map((item) => [item.nome, item.codigo, item.quantidade, item.minimo]));
    if (selecionados.chamadosPorLoja) adicionarTabela('Chamados por loja', ['Loja', 'Total de chamados', 'Abertos', 'Concluídos'], relatorio.chamadosPorLoja.map((item) => [item.loja, item.total, item.abertos, item.concluidos]));
    documento.save('relatorio-superviza-ti.pdf');
    setExportacaoAberta(false);
  };

  return <div className={styles.pagina}>
    <div className={styles.cabecalho}><div><h1 className={styles.titulo}>Relatórios</h1><p className={styles.subtitulo}>Visão para diretoria e compras sobre necessidades de estoque e atendimentos.</p></div><button className="btn btn-primary" onClick={() => setExportacaoAberta(true)}>Exportar relatórios</button></div>
    <div className={styles.resumo}><Resumo valor={relatorio.semEstoque.length} texto="itens sem estoque"/><Resumo valor={relatorio.estoqueBaixo.length} texto="itens com estoque baixo"/><Resumo valor={chamados.length} texto="chamados registrados"/></div>
    <RelatorioTabela titulo="Itens sem estoque" colunas={['Código', 'Equipamento', 'Local', 'Mínimo']} linhas={relatorio.semEstoque.map((item) => [item.codigo, item.nome, item.local, item.minimo])}/>
    <RelatorioTabela titulo="Itens com estoque baixo" colunas={['Código', 'Equipamento', 'Local', 'Atual', 'Mínimo']} linhas={relatorio.estoqueBaixo.map((item) => [item.codigo, item.nome, item.local, item.quantidade, item.minimo])}/>
    <RelatorioTabela titulo="Chamados por loja" colunas={['Loja', 'Total', 'Abertos', 'Concluídos']} linhas={relatorio.chamadosPorLoja.map((item) => [item.loja, item.total, item.abertos, item.concluidos])}/>
    {exportacaoAberta && <Modal titulo="Selecionar relatórios para exportação" fechar={() => setExportacaoAberta(false)}><p className={styles.subtitulo}>Marque um ou mais relatórios que deseja incluir no arquivo.</p><div className={styles.opcoesExportacao}>{opcoesRelatorio.map((opcao) => <label className={styles.opcaoExportacao} key={opcao.id}><input type="checkbox" checked={selecionados[opcao.id]} onChange={(event) => setSelecionados({ ...selecionados, [opcao.id]: event.target.checked })}/><span>{opcao.titulo}</span></label>)}</div><div className={styles.acoes}><button className="btn btn-secondary" onClick={() => setExportacaoAberta(false)}>Cancelar</button><button className="btn btn-secondary" disabled={!secoesSelecionadas().length} onClick={exportarExcel}>Exportar Excel</button><button className="btn btn-primary" disabled={!secoesSelecionadas().length} onClick={exportarPdf}>Exportar PDF</button></div></Modal>}
  </div>;
}

function Resumo({ valor, texto }) { return <div className={styles.resumoItem}><strong>{valor}</strong><span>{texto}</span></div>; }
function RelatorioTabela({ titulo, colunas, linhas }) { return <div className="card"><div className="card-header"><span className="card-title">{titulo}</span></div><div className="tabela-wrapper"><table><thead><tr>{colunas.map((coluna) => <th key={coluna}>{coluna}</th>)}</tr></thead><tbody>{linhas.length ? linhas.map((linha, indice) => <tr key={indice}>{linha.map((valor, coluna) => <td key={coluna}>{valor}</td>)}</tr>) : <tr><td colSpan={colunas.length} className="text-muted">Nenhum dado para este relatório.</td></tr>}</tbody></table></div></div>; }
function Modal({ titulo, fechar, children }) { return <div className={styles.modalOverlay} onMouseDown={(event) => event.target === event.currentTarget && fechar()}><div className={styles.modal}><div className={styles.modalHeader}><h2>{titulo}</h2><button className="btn btn-ghost" onClick={fechar}>Fechar</button></div><div className={styles.modalBody}>{children}</div></div></div>; }
