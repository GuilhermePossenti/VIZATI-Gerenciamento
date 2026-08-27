'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import styles from '../Operations.module.css';

const vazio = { nome: '', login: '', senha: '', cargo: 'Assistente de TI' };

export default function Usuarios() {
  const { user, users, criarUsuario, atualizarUsuario, excluirUsuario, cargosGerenciaveis } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(vazio);
  const [editando, setEditando] = useState(null);
  const [aberto, setAberto] = useState(false);
  const [msg, setMsg] = useState('');

  const autorizado = cargosGerenciaveis.length > 0;
  useEffect(() => { if (user && !autorizado) router.replace('/dashboard'); }, [router, user, autorizado]);
  if (!autorizado) return null;

  const fechar = () => { setAberto(false); setEditando(null); setForm(vazio); };
  const gravar = (e) => {
    e.preventDefault();
    const dados = { ...form, nome: form.nome.trim(), login: form.login.trim() };
    if (editando && !dados.senha) delete dados.senha;
    const resultado = editando ? atualizarUsuario(editando.id, dados) : criarUsuario(dados);
    if (!resultado.ok) return setMsg(resultado.erro);
    setMsg(editando ? 'Usuário alterado com sucesso.' : 'Usuário criado com sucesso.');
    fechar();
  };
  const excluir = (item) => {
    if (!window.confirm(`Excluir o usuário ${item.nome}?`)) return;
    const resultado = excluirUsuario(item.id);
    setMsg(resultado.ok ? 'Usuário excluído com sucesso.' : resultado.erro);
  };

  return <div className={styles.pagina}>
    <div className={styles.cabecalho}><div><h1 className={styles.titulo}>Usuários</h1><p className={styles.subtitulo}>Crie e administre os acessos ao sistema.</p></div><button className="btn btn-primary" onClick={() => { setEditando(null); setForm({ ...vazio, cargo: cargosGerenciaveis[0] }); setAberto(true); }}>+ Criar usuário</button></div>
    {msg && <div className={styles.toast}>{msg}</div>}
    <div className="card"><div className="tabela-wrapper"><table><thead><tr><th>Nome</th><th>Login</th><th>Perfil</th><th>Ações</th></tr></thead><tbody>{users.map((item) => { const podeAlterar = cargosGerenciaveis.includes(item.cargo); return <tr key={item.id}><td><b>{item.nome}</b></td><td>{item.login}</td><td><span className="badge badge-primary">{item.cargo}</span></td><td>{podeAlterar ? <div className={styles.ajustes}><button className="btn btn-secondary btn-sm" onClick={() => { setEditando(item); setForm({ nome: item.nome, login: item.login, senha: '', cargo: item.cargo }); setAberto(true); }}>Alterar</button><button className="btn btn-danger btn-sm" onClick={() => excluir(item)}>Excluir</button></div> : <span className="text-muted">Sem permissão</span>}</td></tr>; })}</tbody></table></div></div>
    {aberto && <Modal titulo={editando ? 'Alterar usuário' : 'Criar usuário'} fechar={fechar}><form onSubmit={gravar} className={styles.grid}><Campo label="Nome completo" value={form.nome} set={(nome) => setForm({ ...form, nome })}/><Campo label="Login" value={form.login} set={(login) => setForm({ ...form, login })}/><Campo label={editando ? 'Nova senha (opcional)' : 'Senha'} value={form.senha} type="password" required={!editando} set={(senha) => setForm({ ...form, senha })}/><label className="form-group"><span className="form-label">Perfil</span><select className="form-control" value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })}>{cargosGerenciaveis.map((cargo) => <option key={cargo}>{cargo}</option>)}</select></label><div className={`${styles.acoes} ${styles.full}`}><button type="button" className="btn btn-secondary" onClick={fechar}>Cancelar</button><button className="btn btn-primary">{editando ? 'Salvar alterações' : 'Criar usuário'}</button></div></form></Modal>}
  </div>;
}

function Campo({ label, value, set, type = 'text', required = true }) { return <label className="form-group"><span className="form-label">{label}</span><input required={required} type={type} className="form-control" value={value} onChange={(e) => set(e.target.value)}/></label>; }
function Modal({ titulo, fechar, children }) { return <div className={styles.modalOverlay} onMouseDown={(e) => e.target === e.currentTarget && fechar()}><div className={styles.modal}><div className={styles.modalHeader}><h2>{titulo}</h2><button className="btn btn-ghost" onClick={fechar}>Fechar</button></div><div className={styles.modalBody}>{children}</div></div></div>; }
