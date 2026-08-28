'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Boxes, FileChartColumn, LayoutDashboard, LogOut, MapPinPlus, MonitorCog, TicketCheck, UsersRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { appBasePath } from '../../lib/appPath';

const NAV = [
  { href: '/dashboard', label: 'Visão geral', Icon: LayoutDashboard },
  { href: '/equipamentos', label: 'Equipamentos', Icon: MonitorCog },
  { href: '/estoque', label: 'Controle de estoque', Icon: Boxes },
  { href: '/chamados', label: 'Chamados', Icon: TicketCheck },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, cargosGerenciaveis } = useAuth();
  const router = useRouter();
  const [perfilAberto, setPerfilAberto] = useState(false);
  const podeGerenciarLojas = ['Gestor de TI', 'Administrador', 'Analista de TI'].includes(user?.cargo);
  const podeVerRelatorios = ['Gestor de TI', 'Administrador', 'Analista de TI'].includes(user?.cargo);
  const navegacao = [...NAV,
    ...(podeVerRelatorios ? [{ href: '/relatorios', label: 'Relatórios', Icon: FileChartColumn }] : []),
    ...(podeGerenciarLojas ? [{ href: '/lojas', label: 'Criar loja', Icon: MapPinPlus }] : []),
    ...(cargosGerenciaveis.length ? [{ href: '/usuarios', label: 'Criar usuário', Icon: UsersRound }] : []),
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-100 flex w-[var(--sidebar-w)] flex-col overflow-hidden border-r border-white/10 bg-[#0d100d] shadow-[6px_0_24px_rgba(0,0,0,.16)]">
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#111511] px-5 py-5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#1a2017] shadow-sm ring-1 ring-white/10">
          <img className="size-8 object-contain" src={`${appBasePath}/logo.png`} alt="" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-extrabold tracking-[.2px] text-white">SUPERVIZA TI</span>
          <span className="text-[11px] font-medium tracking-[.2px] text-slate-300">Gestão de equipamentos</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-6">
        <span className="mb-1 px-3 text-[10px] font-bold tracking-[1.3px] text-slate-400">GERENCIAMENTO</span>
        {navegacao.map((item) => {
          const ativo = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.Icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={ativo
                ? 'relative flex min-h-13 items-center justify-center rounded-xl px-3 py-2.5 text-sm font-bold text-white bg-[#708d00] shadow-[inset_3px_0_0_#c8f40a,0_8px_20px_rgba(112,141,0,.18)] transition-all'
                : 'relative flex min-h-13 items-center justify-center rounded-xl px-3 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:shadow-sm'}
              aria-current={ativo ? 'page' : undefined}
            >
              <span className={ativo
                ? 'absolute left-3 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white ring-1 ring-white/20'
                : 'absolute left-3 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/8 text-white ring-1 ring-white/15'}>
                <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex shrink-0 flex-col gap-3 border-t border-white/10 bg-[#111511] px-4 py-4">
        {perfilAberto && <div className="rounded-xl bg-white/8 p-2 ring-1 ring-white/10"><button className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-red-500" onClick={handleLogout}><LogOut size={17} aria-hidden="true" /> Sair</button></div>}
        <button type="button" className="relative flex min-h-15 w-full items-center justify-center rounded-xl bg-white/6 p-3 ring-1 ring-white/10 transition-colors hover:bg-white/10" onClick={() => setPerfilAberto((aberto) => !aberto)} aria-expanded={perfilAberto} aria-label="Abrir menu do usuário">
          <div className="absolute left-3 flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-extrabold text-slate-950">{user?.avatar}</div>
          <div className="flex min-w-0 flex-col items-center text-center">
            <span className="max-w-45 truncate text-[13px] font-bold text-white">{user?.nome}</span>
            <span className="text-[11px] font-medium text-slate-300">{user?.cargo}</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
