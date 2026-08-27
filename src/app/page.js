'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { appBasePath } from '../lib/appPath';
import styles from './Login.module.css';
export default function LoginPage() {
  const { login, user, loading } = useAuth(); const router = useRouter();
  const [loginInput,setLoginInput]=useState(''); const [senha,setSenha]=useState(''); const [erro,setErro]=useState(''); const [carregando,setCarregando]=useState(false);
  const credenciaisDemo = [
    ['tecnico', 'ti123'],
    ['gestor', 'ti123'],
    ['admin', 'admin123'],
  ];
  useEffect(()=>{ if(!loading&&user) router.replace('/dashboard'); },[user,loading,router]); if(loading)return null;
  const entrar=async(e)=>{e.preventDefault();if(!loginInput.trim()||!senha)return setErro('Informe seu usuário e senha.');setCarregando(true);setErro('');await new Promise(r=>setTimeout(r,350));const resultado=login(loginInput,senha);setCarregando(false);if(resultado.ok)router.push('/dashboard');else setErro(resultado.erro);};
  return <main className={styles.pagina}><div className={styles.glow}/><section className={styles.card}>
    <div className={styles.marca}><img src={`${appBasePath}/logo.png`} alt="Viza TI"/><div><strong>Viza TI</strong><span>Gestão de equipamentos</span></div></div>
    <div className={styles.conteudo}><p className={styles.eyebrow}>ACESSO SEGURO</p><h1>FAÇA SEU LOGIN<span>.</span></h1><p className={styles.subtitulo}>Entre para gerenciar o estoque e os atendimentos da sua operação de TI.</p>
      <form onSubmit={entrar} className={styles.form}>{erro&&<div className={styles.alertaErro} role="alert">{erro}</div>}<label>Usuário<input value={loginInput} onChange={e=>setLoginInput(e.target.value)} placeholder="tecnico" autoFocus/></label><label>Senha<input type="password" value={senha} onChange={e=>setSenha(e.target.value)} placeholder="••••••••"/></label><button disabled={carregando}>{carregando?'Entrando…':'Entrar no sistema'}<span>→</span></button></form>
      <div className={styles.demo}>
        <span>Acessos de demonstração</span>
        <div className={styles.credenciaisDemo}>
          {credenciaisDemo.map(([usuario, senha]) => <code key={usuario}>{usuario} / {senha}</code>)}
        </div>
      </div>
    </div></section></main>;
}
