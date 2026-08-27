'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

const CHAVE_USUARIOS = 'vizati_usuarios';
const CHAVE_SESSAO = 'vizati_sessao';
const USUARIOS_INICIAIS = [
  { id: 1, login: 'tecnico', senha: 'ti123', nome: 'Guilherme Possenti', cargo: 'Assistente de TI', avatar: 'GP' },
  { id: 2, login: 'gestor', senha: 'ti123', nome: 'Guilherme Bridi', cargo: 'Gestor de TI', avatar: 'GB' },
  { id: 3, login: 'admin', senha: 'admin123', nome: 'Administrador', cargo: 'Administrador', avatar: 'AD' },
];

export const CARGOS = ['Assistente de TI', 'Técnico de TI', 'Estagiário', 'Menor aprendiz', 'Analista de TI', 'Gestor de TI', 'Administrador'];

const CARGOS_GERENCIAVEIS = {
  'Técnico de TI': ['Assistente de TI', 'Estagiário', 'Menor aprendiz'],
  'Analista de TI': ['Técnico de TI', 'Assistente de TI', 'Estagiário', 'Menor aprendiz'],
  'Gestor de TI': ['Analista de TI', 'Técnico de TI', 'Assistente de TI', 'Estagiário', 'Menor aprendiz'],
};

export const cargosGerenciaveis = (cargo) => cargo === 'Administrador' ? CARGOS : (CARGOS_GERENCIAVEIS[cargo] || []);
export const podeGerenciarCargo = (cargoResponsavel, cargoAlvo) => cargosGerenciaveis(cargoResponsavel).includes(cargoAlvo);

const AuthContext = createContext({});
const semSenha = ({ senha: _, ...usuario }) => usuario;
const gerarAvatar = (nome = '') => nome.split(' ').filter(Boolean).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase() || 'US';
const salvarUsuarios = (usuarios) => localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(USUARIOS_INICIAIS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const salvos = JSON.parse(localStorage.getItem(CHAVE_USUARIOS));
      const usuarios = Array.isArray(salvos) && salvos.length ? salvos : USUARIOS_INICIAIS;
      setUsers(usuarios);
      if (!localStorage.getItem(CHAVE_USUARIOS)) salvarUsuarios(usuarios);

      // A sessão vale apenas enquanto o navegador estiver aberto. Assim, ao
      // iniciar o sistema novamente, a tela de login é sempre apresentada.
      localStorage.removeItem('nexati_user');
      const saved = sessionStorage.getItem(CHAVE_SESSAO);
      if (saved) {
        const usuarioAtual = usuarios.find((item) => item.login === JSON.parse(saved).login);
        if (usuarioAtual) {
          const dadosPublicos = semSenha(usuarioAtual);
          setUser(dadosPublicos);
          sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(dadosPublicos));
        }
      }
    } catch {
      localStorage.removeItem('nexati_user');
      sessionStorage.removeItem(CHAVE_SESSAO);
      salvarUsuarios(USUARIOS_INICIAIS);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (loginInput, senha) => {
    const usuario = users.find((item) => item.login === loginInput.trim().toLowerCase() && item.senha === senha);
    if (!usuario) return { ok: false, erro: 'Login ou senha incorretos. Verifique os dados e tente novamente.' };
    const dadosPublicos = semSenha(usuario);
    setUser(dadosPublicos);
    sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(dadosPublicos));
    return { ok: true };
  };

  const criarUsuario = (dados) => {
    const loginNovo = dados.login.trim().toLowerCase();
    if (!podeGerenciarCargo(user?.cargo, dados.cargo)) return { ok: false, erro: 'Você não tem permissão para criar este cargo.' };
    if (users.some((item) => item.login === loginNovo)) return { ok: false, erro: 'Este login já está em uso.' };
    const novo = { id: Date.now(), ...dados, login: loginNovo, avatar: gerarAvatar(dados.nome) };
    const proximaLista = [...users, novo];
    setUsers(proximaLista);
    salvarUsuarios(proximaLista);
    return { ok: true };
  };

  const atualizarUsuario = (id, dados) => {
    const usuarioAtual = users.find((item) => item.id === id);
    if (!usuarioAtual || !podeGerenciarCargo(user?.cargo, usuarioAtual.cargo) || !podeGerenciarCargo(user?.cargo, dados.cargo)) return { ok: false, erro: 'Você não tem permissão para alterar este usuário.' };
    const loginNovo = dados.login.trim().toLowerCase();
    if (users.some((item) => item.id !== id && item.login === loginNovo)) return { ok: false, erro: 'Este login já está em uso.' };
    const proximaLista = users.map((item) => item.id === id ? { ...item, ...dados, login: loginNovo, avatar: gerarAvatar(dados.nome) } : item);
    setUsers(proximaLista);
    salvarUsuarios(proximaLista);
    const atualizado = proximaLista.find((item) => item.id === id);
    if (user?.id === id && atualizado) {
      const dadosPublicos = semSenha(atualizado);
      setUser(dadosPublicos);
      sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(dadosPublicos));
    }
    return { ok: true };
  };

  const excluirUsuario = (id) => {
    if (user?.id === id) return { ok: false, erro: 'Não é possível excluir o usuário atualmente conectado.' };
    const usuarioAtual = users.find((item) => item.id === id);
    if (!usuarioAtual || !podeGerenciarCargo(user?.cargo, usuarioAtual.cargo)) return { ok: false, erro: 'Você não tem permissão para excluir este usuário.' };
    const proximaLista = users.filter((item) => item.id !== id);
    setUsers(proximaLista);
    salvarUsuarios(proximaLista);
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(CHAVE_SESSAO);
  };

  return <AuthContext.Provider value={{ user, users: users.map(semSenha), loading, login, logout, criarUsuario, atualizarUsuario, excluirUsuario, cargosGerenciaveis: cargosGerenciaveis(user?.cargo) }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};
