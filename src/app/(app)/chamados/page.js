'use client';

import { useEffect, useMemo, useState } from 'react';
import { CHAMADOS_INICIAIS, EQUIPAMENTOS_INICIAIS, LOJAS_INICIAIS, carregar, salvar } from '../../../services/inventoryStore';
import { useAuth } from '../../../context/AuthContext';
import styles from '../Operations.module.css';

const hoje = () => new Date().toISOString().split('T')[0];
const formularioInicial = () => ({
  tecnico: '', cargo: '', descricao: '', loja: '',
  prioridade: 'Média', status: 'Aberto', dataAbertura: hoje(), equipamentoId: '', quantidadeEquipamento: 1,
});

function normalizarCodigo(codigo) {
  const legado = String(codigo).match(/^CH-(\d+)$/i);
  return legado ? String(Math.max(1, Number(legado[1]) - 1040)) : String(codigo);
}

function proximoCodigo(lista) {
  const maiorCodigo = lista.reduce((maior, chamado) => {
    const codigo = Number(normalizarCodigo(chamado.codigo));
    return Number.isInteger(codigo) && codigo > maior ? codigo : maior;
  }, 0);

  return String(maiorCodigo + 1);
}

function formatarData(data) {
  if (!data) return '—';
  if (data.includes('/')) return data;
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

function paraDataISO(data) {
  if (!data) return '';
  if (!data.includes('/')) return data;
  const [dia, mes, ano] = data.split('/');
  return `${ano}-${mes}-${dia}`;
}

function cargoPadronizado(cargo) {
  return cargo === 'Analista de Suporte' ? 'Analista de TI' : cargo;
}

function podeReabrirChamado(usuario, chamado) {
  const cargoResponsavel = cargoPadronizado(usuario?.cargo);
  const cargoDoChamado = cargoPadronizado(chamado.cargo);
  if (cargoResponsavel === 'Administrador') return true;
  const permissoes = {
    'Gestor de TI': ['Analista de TI', 'Técnico de TI', 'Assistente de TI', 'Estagiário', 'Menor aprendiz'],
    'Analista de TI': ['Técnico de TI', 'Assistente de TI', 'Estagiário', 'Menor aprendiz'],
    'Técnico de TI': ['Assistente de TI', 'Estagiário', 'Menor aprendiz'],
  };
  return permissoes[cargoResponsavel]?.includes(cargoDoChamado) || false;
}

export default function Chamados() {
  const { user } = useAuth();
  const [lista, setLista] = useState(CHAMADOS_INICIAIS);
  const [equipamentos, setEquipamentos] = useState(EQUIPAMENTOS_INICIAIS);
  const [lojas, setLojas] = useState(LOJAS_INICIAIS);
  const [form, setForm] = useState(formularioInicial());
  const [aberto, setAberto] = useState(false);
  const [chamadoConcluir, setChamadoConcluir] = useState(null);
  const [dataConclusao, setDataConclusao] = useState(hoje());
  const [filtro, setFiltro] = useState('');
  const [filtroTecnico, setFiltroTecnico] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [filtroLoja, setFiltroLoja] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState('');
  const [msg, setMsg] = useState('');
  const [erroFormulario, setErroFormulario] = useState('');

  useEffect(() => {
    const chamados = carregar('nexati_chamados', CHAMADOS_INICIAIS).map((chamado) => ({
      ...chamado,
      codigo: normalizarCodigo(chamado.codigo),
    }));
    setLista(chamados);
    salvar('nexati_chamados', chamados);
    setLojas(carregar('vizati_lojas', LOJAS_INICIAIS));
    setEquipamentos(carregar('nexati_equipamentos', EQUIPAMENTOS_INICIAIS));
  }, []);
  const lojasComChamados = useMemo(() => [...new Set(lista.map((chamado) => chamado.loja).filter(Boolean))].sort(), [lista]);
  const vistos = useMemo(() => lista.filter((chamado) => {
    const tecnicoCorresponde = !filtroTecnico || chamado.tecnico.toLowerCase().includes(filtroTecnico.trim().toLowerCase());
    const dataCorresponde = !filtroData || paraDataISO(chamado.dataAbertura || chamado.data) === filtroData;
    const lojaCorresponde = !filtroLoja || chamado.loja === filtroLoja;
    const prioridadeCorresponde = !filtroPrioridade || chamado.prioridade === filtroPrioridade;
    const statusCorresponde = !filtro || chamado.status === filtro;
    return tecnicoCorresponde && dataCorresponde && lojaCorresponde && prioridadeCorresponde && statusCorresponde;
  }), [lista, filtro, filtroTecnico, filtroData, filtroLoja, filtroPrioridade]);

  const criar = (e) => {
    e.preventDefault();
    const codigo = proximoCodigo(lista);
    const quantidadeUtilizada = Number(form.quantidadeEquipamento);
    const equipamentoSelecionado = equipamentos.find((item) => String(item.id) === form.equipamentoId);
    if (form.equipamentoId && (!Number.isInteger(quantidadeUtilizada) || quantidadeUtilizada < 1)) {
      setErroFormulario('Informe uma quantidade válida para o equipamento utilizado.');
      return;
    }
    if (equipamentoSelecionado && quantidadeUtilizada > Number(equipamentoSelecionado.quantidade)) {
      setErroFormulario(`O estoque de ${equipamentoSelecionado.nome} possui somente ${equipamentoSelecionado.quantidade} un.`);
      return;
    }
    const novo = {
      ...form,
      id: Date.now(),
      codigo,
      data: formatarData(form.dataAbertura),
      dataConclusao: '',
      equipamentoUtilizado: equipamentoSelecionado?.nome || '',
      equipamentoCodigo: equipamentoSelecionado?.codigo || '',
      quantidadeEquipamento: equipamentoSelecionado ? quantidadeUtilizada : 0,
    };
    const proximaLista = [novo, ...lista];
    if (equipamentoSelecionado) {
      const saldoAnterior = Number(equipamentoSelecionado.quantidade);
      const saldoAtual = saldoAnterior - quantidadeUtilizada;
      const proximaListaEquipamentos = equipamentos.map((item) => item.id === equipamentoSelecionado.id ? { ...item, quantidade: saldoAtual } : item);
      const historico = carregar('vizati_movimentacoes', []);
      const movimento = {
        id: Date.now() + 1,
        data: new Date().toLocaleString('pt-BR'),
        equipamento: equipamentoSelecionado.nome,
        codigo: equipamentoSelecionado.codigo,
        tipo: 'Saída para chamado',
        quantidade: quantidadeUtilizada,
        saldoAnterior,
        saldoAtual,
        origem: `Chamado ${codigo} — ${form.loja}`,
        usuario: user?.nome || form.tecnico,
        cargo: user?.cargo || form.cargo,
      };
      setEquipamentos(proximaListaEquipamentos);
      salvar('nexati_equipamentos', proximaListaEquipamentos);
      salvar('vizati_movimentacoes', [movimento, ...historico]);
    }
    setLista(proximaLista);
    salvar('nexati_chamados', proximaLista);
    setForm(formularioInicial());
    setAberto(false);
    setMsg(equipamentoSelecionado ? `Chamado aberto e ${quantidadeUtilizada} un. de ${equipamentoSelecionado.nome} baixadas do estoque.` : 'Chamado aberto e registrado com sucesso.');
  };

  const solicitarConclusao = (chamado) => {
    setChamadoConcluir(chamado);
    setDataConclusao(hoje());
  };

  const confirmarConclusao = (e) => {
    e.preventDefault();
    const proximaLista = lista.map((chamado) => chamado.id === chamadoConcluir.id
      ? { ...chamado, status: 'Concluído', dataConclusao }
      : chamado);
    setLista(proximaLista);
    salvar('nexati_chamados', proximaLista);
    setChamadoConcluir(null);
    setMsg(`Chamado ${chamadoConcluir.codigo} concluído em ${formatarData(dataConclusao)}.`);
  };

  const reabrir = (chamado) => {
    const proximaLista = lista.map((item) => item.id === chamado.id ? { ...item, status: 'Aberto', dataConclusao: '' } : item);
    setLista(proximaLista);
    salvar('nexati_chamados', proximaLista);
    setMsg(`Chamado ${chamado.codigo} reaberto com sucesso.`);
  };

  const abrirNovoChamado = () => {
    setForm({ ...formularioInicial(), tecnico: user?.nome || '', cargo: user?.cargo || '' });
    setErroFormulario('');
    setAberto(true);
  };

  return (
    <div className={styles.pagina}>
      <div className={styles.cabecalho}>
        <div><h1 className={styles.titulo}>Chamados técnicos</h1><p className={styles.subtitulo}>Registre serviços, responsáveis e lojas atendidas.</p></div>
        <button className="btn btn-primary" onClick={abrirNovoChamado}>+ Abrir chamado</button>
      </div>
      {msg && <div className={styles.toast}>{msg}</div>}

      <div className="card"><div className="card-body"><div className={styles.filtros}>
        <label className="form-group"><span className="form-label">Técnico</span><input className="form-control" type="search" placeholder="Buscar por nome do técnico" value={filtroTecnico} onChange={(e) => setFiltroTecnico(e.target.value)} /></label>
        <label className="form-group"><span className="form-label">Data de abertura</span><input className="form-control" type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} /></label>
        <label className="form-group"><span className="form-label">Loja</span><select className="form-control" value={filtroLoja} onChange={(e) => setFiltroLoja(e.target.value)}><option value="">Todas as lojas</option>{lojasComChamados.map((loja) => <option key={loja} value={loja}>{loja}</option>)}</select></label>
        <label className="form-group"><span className="form-label">Prioridade</span><select className="form-control" value={filtroPrioridade} onChange={(e) => setFiltroPrioridade(e.target.value)}><option value="">Todas as prioridades</option><option>Baixa</option><option>Média</option><option>Alta</option></select></label>
        <label className="form-group"><span className="form-label">Status</span>
        <select className="form-control" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="">Todos os status</option><option>Aberto</option><option>Em andamento</option><option>Concluído</option>
        </select></label>
      </div></div></div>

      <div className="card"><div className="tabela-wrapper"><table>
        <thead><tr><th>Código</th><th>Datas</th><th>Técnico</th><th>Serviço</th><th>Loja</th><th>Prioridade</th><th>Status</th><th>Ação</th></tr></thead>
        <tbody>{vistos.map((chamado) => (
          <tr key={chamado.id}>
            <td><b>{chamado.codigo}</b></td>
            <td><span className="text-muted">Abertura:</span> <b>{formatarData(chamado.dataAbertura || chamado.data)}</b><br/>{chamado.dataConclusao && <><span className="text-muted">Conclusão:</span> <b>{formatarData(chamado.dataConclusao)}</b></>}</td>
            <td><b>{chamado.tecnico}</b><br/><span className="text-muted">{chamado.cargo}</span></td>
            <td>{chamado.descricao}{chamado.equipamentoUtilizado && <><br/><span className="text-muted">Material: {chamado.quantidadeEquipamento}x {chamado.equipamentoUtilizado}</span></>}</td><td>{chamado.loja}</td>
            <td><span className={`badge ${chamado.prioridade === 'Alta' ? 'badge-risco' : 'badge-atencao'}`}>{chamado.prioridade}</span></td>
            <td><span className="badge badge-primary">{chamado.status}</span></td>
            <td>{chamado.status !== 'Concluído' ? <button className="btn btn-ghost btn-sm" onClick={() => solicitarConclusao(chamado)}>Concluir</button> : podeReabrirChamado(user, chamado) && <button className="btn btn-secondary btn-sm" onClick={() => reabrir(chamado)}>Reabrir</button>}</td>
          </tr>
        ))}</tbody>
      </table></div></div>

      {aberto && <Modal titulo="Abrir novo chamado" fechar={() => setAberto(false)}>
        <form onSubmit={criar} className={styles.grid}>
          <Campo label="Nome do técnico" value={form.tecnico} set={(v) => setForm({...form, tecnico:v})} somenteLeitura/>
          <Campo label="Cargo" value={form.cargo} set={(v) => setForm({...form, cargo:v})} somenteLeitura/>
          <label className="form-group"><span className="form-label">Código do chamado</span><input className="form-control" value={proximoCodigo(lista)} readOnly aria-label="Código do chamado gerado automaticamente" /></label>
          <label className="form-group"><span className="form-label">Loja de destino</span><select required className="form-control" value={form.loja} onChange={(e) => setForm({...form, loja:e.target.value})}><option value="" disabled>Selecione a loja</option>{lojas.map((loja) => <option key={loja.id} value={`${loja.codigo} - ${loja.nome}`}>{loja.codigo} - {loja.nome}</option>)}</select></label>
          <Campo label="Data de abertura" type="date" value={form.dataAbertura} set={(v) => setForm({...form, dataAbertura:v})}/>
          <label className="form-group"><span className="form-label">Prioridade</span><select className="form-control" value={form.prioridade} onChange={(e) => setForm({...form, prioridade:e.target.value})}><option>Baixa</option><option>Média</option><option>Alta</option></select></label>
          <label className="form-group"><span className="form-label">Equipamento utilizado (opcional)</span><select className="form-control" value={form.equipamentoId} onChange={(e) => setForm({...form, equipamentoId:e.target.value})}><option value="">Nenhum equipamento</option>{equipamentos.map((item) => <option key={item.id} value={item.id} disabled={Number(item.quantidade) === 0}>{item.codigo} — {item.nome} ({item.quantidade} un.)</option>)}</select></label>
          <Campo label="Quantidade utilizada" type="number" value={form.quantidadeEquipamento} set={(v) => setForm({...form, quantidadeEquipamento:v})} opcional={!form.equipamentoId}/>
          <label className={`form-group ${styles.full}`}><span className="form-label">Descrição do serviço</span><textarea required rows="4" className="form-control" value={form.descricao} onChange={(e) => setForm({...form, descricao:e.target.value})}/></label>
          {erroFormulario && <p className={`${styles.full} text-danger`}>{erroFormulario}</p>}
          <div className={`${styles.acoes} ${styles.full}`}><button type="button" className="btn btn-secondary" onClick={() => setAberto(false)}>Cancelar</button><button className="btn btn-primary">Abrir chamado</button></div>
        </form>
      </Modal>}

      {chamadoConcluir && <Modal titulo={`Concluir ${chamadoConcluir.codigo}`} fechar={() => setChamadoConcluir(null)}>
        <form onSubmit={confirmarConclusao}>
          <p className={styles.subtitulo}>Informe a data em que o serviço foi concluído.</p>
          <label className="form-group" style={{marginTop:16}}><span className="form-label">Data de conclusão</span><input required type="date" min={chamadoConcluir.dataAbertura || ''} max={hoje()} className="form-control" value={dataConclusao} onChange={(e) => setDataConclusao(e.target.value)}/></label>
          <div className={styles.acoes}><button type="button" className="btn btn-secondary" onClick={() => setChamadoConcluir(null)}>Cancelar</button><button className="btn btn-primary">Confirmar conclusão</button></div>
        </form>
      </Modal>}
    </div>
  );
}

function Campo({ label, value, set, placeholder, type='text', opcional=false, somenteLeitura=false }) {
  return <label className="form-group"><span className="form-label">{label}</span><input required={!opcional} type={type} className="form-control" value={value} placeholder={placeholder} readOnly={somenteLeitura} onChange={(e) => set(e.target.value)}/></label>;
}

function Modal({ titulo, fechar, children }) {
  return <div className={styles.modalOverlay} onMouseDown={(e) => e.target === e.currentTarget && fechar()}><div className={styles.modal}><div className={styles.modalHeader}><h2>{titulo}</h2><button className="btn btn-ghost" onClick={fechar}>Fechar</button></div><div className={styles.modalBody}>{children}</div></div></div>;
}
