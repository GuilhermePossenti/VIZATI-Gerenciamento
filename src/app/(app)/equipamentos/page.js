'use client';

import { useEffect, useMemo, useState } from 'react';
import { EQUIPAMENTOS_INICIAIS, carregar, salvar } from '../../../services/inventoryStore';
import styles from '../Operations.module.css';

const vazio = { nome: '', categoria: 'Notebook', quantidade: 1, minimo: 1, status: 'Disponível', local: 'Matriz', patrimonio: '', numeroSerie: '', garantia: '' };

function proximoCodigo(lista) {
  const maiorNumero = lista.reduce((maior, equipamento) => {
    const numeros = String(equipamento.codigo).match(/(\d+)/g);
    const numero = numeros ? Number(numeros.at(-1)) : 0;
    return Math.max(maior, numero);
  }, 0);
  return `EQ-${String(maiorNumero + 1).padStart(3, '0')}`;
}

function situacaoDoEstoque(equipamento) {
  if (equipamento.quantidade === 0) return 'Sem estoque';
  if (equipamento.quantidade <= equipamento.minimo) return 'Estoque baixo';
  return 'Disponível';
}

export default function Equipamentos() {
  const [lista, setLista] = useState(EQUIPAMENTOS_INICIAIS);
  const [busca, setBusca] = useState('');
  const [filtroEstoque, setFiltroEstoque] = useState('');
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState(vazio);
  const [msg, setMsg] = useState('');

  useEffect(() => setLista(carregar('nexati_equipamentos', EQUIPAMENTOS_INICIAIS)), []);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return lista.filter((equipamento) => {
      const correspondeBusca = !termo || equipamento.codigo.toLowerCase().includes(termo) || equipamento.nome.toLowerCase().includes(termo);
      const correspondeEstoque = !filtroEstoque || situacaoDoEstoque(equipamento) === filtroEstoque;
      return correspondeBusca && correspondeEstoque;
    });
  }, [lista, busca, filtroEstoque]);

  const cadastrar = (e) => {
    e.preventDefault();
    const novo = { ...form, id: Date.now(), codigo: proximoCodigo(lista), quantidade: Number(form.quantidade), minimo: Number(form.minimo) };
    const proximaLista = [novo, ...lista];
    setLista(proximaLista);
    salvar('nexati_equipamentos', proximaLista);
    setForm(vazio);
    setAberto(false);
    setMsg(`Equipamento ${novo.codigo} cadastrado com sucesso.`);
  };

  return <div className={styles.pagina}>
    <div className={styles.cabecalho}><div><h1 className={styles.titulo}>Equipamentos</h1><p className={styles.subtitulo}>Cadastre e localize os ativos de TI da operação.</p></div><button className="btn btn-primary" onClick={() => setAberto(true)}>+ Novo equipamento</button></div>
    {msg && <div className={styles.toast}>{msg}</div>}
    <div className="card"><div className="card-body"><div className={styles.filtros}><label className="form-group"><span className="form-label">Buscar equipamento</span><input className="form-control" type="search" placeholder="Digite o nome ou o código do equipamento" value={busca} onChange={(e) => setBusca(e.target.value)} /></label><label className="form-group"><span className="form-label">Situação do estoque</span><select className="form-control" value={filtroEstoque} onChange={(e) => setFiltroEstoque(e.target.value)}><option value="">Todos os itens</option><option>Disponível</option><option>Estoque baixo</option><option>Sem estoque</option></select></label></div></div></div>
    <div className="card"><div className="tabela-wrapper"><table><thead><tr><th>Código</th><th>Equipamento</th><th>Patrimônio</th><th>Nº de série</th><th>Garantia</th><th>Categoria</th><th>Local</th><th>Quantidade</th><th>Status</th></tr></thead><tbody>{filtrados.map((equipamento) => { const situacao = situacaoDoEstoque(equipamento); return <tr key={equipamento.id}><td className="font-semibold">{equipamento.codigo}</td><td>{equipamento.nome}</td><td>{equipamento.patrimonio || '—'}</td><td>{equipamento.numeroSerie || '—'}</td><td>{equipamento.garantia || '—'}</td><td>{equipamento.categoria}</td><td>{equipamento.local}</td><td><span className={styles.quantidade}>{equipamento.quantidade}</span></td><td><span className={`badge ${situacao === 'Sem estoque' ? 'badge-risco' : situacao === 'Estoque baixo' ? 'badge-atencao' : 'badge-regular'}`}>{situacao}</span></td></tr>; })}</tbody></table></div></div>
    {aberto && <Modal titulo="Cadastrar equipamento" fechar={() => setAberto(false)}><form onSubmit={cadastrar} className={styles.grid}><label className="form-group"><span className="form-label">Código</span><input className="form-control" value={proximoCodigo(lista)} readOnly aria-label="Código gerado automaticamente" /></label><Campo label="Nome do equipamento" value={form.nome} set={(nome) => setForm({ ...form, nome })}/><Campo label="Patrimônio" value={form.patrimonio} set={(patrimonio) => setForm({ ...form, patrimonio })}/><Campo label="Número de série" value={form.numeroSerie} set={(numeroSerie) => setForm({ ...form, numeroSerie })}/><Campo label="Garantia" type="date" value={form.garantia} set={(garantia) => setForm({ ...form, garantia })}/><Campo label="Categoria" value={form.categoria} set={(categoria) => setForm({ ...form, categoria })}/><Campo label="Local / loja" value={form.local} set={(local) => setForm({ ...form, local })}/><Campo label="Quantidade" type="number" value={form.quantidade} set={(quantidade) => setForm({ ...form, quantidade })}/><Campo label="Estoque mínimo" type="number" value={form.minimo} set={(minimo) => setForm({ ...form, minimo })}/><div className={`${styles.acoes} ${styles.full}`}><button type="button" className="btn btn-secondary" onClick={() => setAberto(false)}>Cancelar</button><button className="btn btn-primary">Cadastrar</button></div></form></Modal>}
  </div>;
}

function Campo({ label, value, set, type = 'text' }) { return <label className="form-group"><span className="form-label">{label}</span><input required type={type} min={type === 'number' ? '0' : undefined} className="form-control" value={value} onChange={(e) => set(e.target.value)}/></label>; }
function Modal({ titulo, fechar, children }) { return <div className={styles.modalOverlay} onMouseDown={(e) => e.target === e.currentTarget && fechar()}><div className={styles.modal}><div className={styles.modalHeader}><h2>{titulo}</h2><button className="btn btn-ghost" onClick={fechar}>Fechar</button></div><div className={styles.modalBody}>{children}</div></div></div>; }
