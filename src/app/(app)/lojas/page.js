'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LOJAS_INICIAIS, carregar, salvar } from '../../../services/inventoryStore';
import { useAuth } from '../../../context/AuthContext';
import styles from '../Operations.module.css';

const vazio = { codigo: '', nome: '' };
const autorizado = (user) => ['Gestor de TI', 'Administrador', 'Analista de TI'].includes(user?.cargo);

export default function Lojas() {
  const { user } = useAuth();
  const router = useRouter();
  const [lojas, setLojas] = useState(LOJAS_INICIAIS);
  const [form, setForm] = useState(vazio);
  const [editando, setEditando] = useState(null);
  const [aberto, setAberto] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user && !autorizado(user)) router.replace('/dashboard');
    setLojas(carregar('vizati_lojas', LOJAS_INICIAIS));
  }, [router, user]);

  if (!autorizado(user)) return null;

  const fechar = () => { setAberto(false); setEditando(null); setForm(vazio); };
  const gravar = (e) => {
    e.preventDefault();
    const codigo = form.codigo.trim();
    const nome = form.nome.trim();
    if (lojas.some((loja) => loja.id !== editando?.id && loja.codigo.toLowerCase() === codigo.toLowerCase())) return setMsg('Já existe uma loja com este código.');
    const proximaLista = editando
      ? lojas.map((loja) => loja.id === editando.id ? { ...loja, codigo, nome } : loja)
      : [...lojas, { id: Date.now(), codigo, nome }];
    setLojas(proximaLista);
    salvar('vizati_lojas', proximaLista);
    setMsg(editando ? 'Loja alterada com sucesso.' : 'Loja cadastrada com sucesso.');
    fechar();
  };
  const excluir = (loja) => {
    if (!window.confirm(`Excluir a loja ${loja.codigo} - ${loja.nome}?`)) return;
    const proximaLista = lojas.filter((item) => item.id !== loja.id);
    setLojas(proximaLista);
    salvar('vizati_lojas', proximaLista);
    setMsg('Loja excluída com sucesso.');
  };

  return <div className={styles.pagina}>
    <div className={styles.cabecalho}><div><h1 className={styles.titulo}>Lojas</h1><p className={styles.subtitulo}>Cadastre e mantenha as lojas disponíveis para os chamados.</p></div><button className="btn btn-primary" onClick={() => setAberto(true)}>+ Criar loja</button></div>
    {msg && <div className={styles.toast}>{msg}</div>}
    <div className="card"><div className="tabela-wrapper"><table><thead><tr><th>Código</th><th>Loja</th><th>Ações</th></tr></thead><tbody>{lojas.map((loja) => <tr key={loja.id}><td><b>{loja.codigo}</b></td><td>{loja.nome}</td><td><div className={styles.ajustes}><button className="btn btn-secondary btn-sm" onClick={() => { setEditando(loja); setForm({ codigo: loja.codigo, nome: loja.nome }); setAberto(true); }}>Alterar</button><button className="btn btn-danger btn-sm" onClick={() => excluir(loja)}>Excluir</button></div></td></tr>)}</tbody></table></div></div>
    {aberto && <Modal titulo={editando ? 'Alterar loja' : 'Criar loja'} fechar={fechar}><form onSubmit={gravar} className={styles.grid}><Campo label="Código da loja" value={form.codigo} set={(codigo) => setForm({ ...form, codigo })}/><Campo label="Nome da loja" value={form.nome} set={(nome) => setForm({ ...form, nome })}/><div className={`${styles.acoes} ${styles.full}`}><button type="button" className="btn btn-secondary" onClick={fechar}>Cancelar</button><button className="btn btn-primary">{editando ? 'Salvar alterações' : 'Criar loja'}</button></div></form></Modal>}
  </div>;
}

function Campo({ label, value, set }) { return <label className="form-group"><span className="form-label">{label}</span><input required className="form-control" value={value} onChange={(e) => set(e.target.value)}/></label>; }
function Modal({ titulo, fechar, children }) { return <div className={styles.modalOverlay} onMouseDown={(e) => e.target === e.currentTarget && fechar()}><div className={styles.modal}><div className={styles.modalHeader}><h2>{titulo}</h2><button className="btn btn-ghost" onClick={fechar}>Fechar</button></div><div className={styles.modalBody}>{children}</div></div></div>; }
