'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Headset, Laptop, Package, TriangleAlert } from 'lucide-react';
import { EQUIPAMENTOS_INICIAIS, CHAMADOS_INICIAIS, carregar } from '../../../services/inventoryStore';

export default function Dashboard() {
  const [equipamentos, setEquipamentos] = useState(EQUIPAMENTOS_INICIAIS);
  const [chamados, setChamados] = useState(CHAMADOS_INICIAIS);

  useEffect(() => {
    setEquipamentos(carregar('nexati_equipamentos', EQUIPAMENTOS_INICIAIS));
    setChamados(carregar('nexati_chamados', CHAMADOS_INICIAIS));
  }, []);

  const total = equipamentos.reduce((soma, item) => soma + Number(item.quantidade), 0);
  const itensAtencao = equipamentos.filter((item) => Number(item.quantidade) < 3);
  const chamadosAbertos = chamados.filter((chamado) => chamado.status !== 'Concluído').length;

  return (
    <div className="relative flex w-full flex-1 flex-col gap-8">
      <div className="flex flex-wrap items-start gap-4">
        <div>
          <p className="mb-1 text-[11px] font-extrabold tracking-[1.4px] text-brand-dark">CENTRAL DE OPERAÇÕES</p>
          <h1 className="text-2xl font-bold text-app-text">Visão geral</h1>
          <p className="mt-0.5 text-sm text-app-muted">Acompanhe equipamentos, estoque e atendimentos em um só lugar.</p>
        </div>
        <div className="flex gap-2 sm:absolute sm:right-0 sm:top-0">
          <Link href="/equipamentos" className="btn btn-secondary">+ Equipamento</Link>
          <Link href="/chamados" className="btn btn-primary">+ Abrir chamado</Link>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Metric valor={total} label="Itens em estoque" Icon={Package} />
          <Metric valor={equipamentos.length} label="Equipamentos cadastrados" Icon={Laptop} />
          <Metric valor={chamadosAbertos} label="Chamados em aberto" Icon={Headset} />
          <Metric valor={itensAtencao.length} label="Alertas de estoque" Icon={TriangleAlert} alerta />
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,.9fr)]">
          <div className="card min-w-0">
            <div className="card-header"><span className="card-title">Chamados recentes</span><Link href="/chamados" className="btn btn-ghost btn-sm">Ver todos</Link></div>
            <div className="tabela-wrapper"><table><thead><tr><th>Código</th><th>Serviço</th><th>Loja</th><th>Status</th></tr></thead><tbody>
              {chamados.slice(0, 5).map((chamado) => <tr key={chamado.id}><td className="font-semibold">{chamado.codigo}</td><td>{chamado.descricao}</td><td>{chamado.loja}</td><td><span className="badge badge-primary">{chamado.status}</span></td></tr>)}
            </tbody></table></div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Atenção no estoque</span><span className="badge badge-atencao">{itensAtencao.length} itens</span></div>
            <div className="card-body p-6">
              {itensAtencao.slice(0, 6).map((item) => (
                <div className="flex items-center justify-between gap-5 border-b border-app-border py-4 last:border-b-0" key={item.id}>
                  <div className="flex min-w-0 flex-col gap-0.5"><strong>{item.nome}</strong><span className="text-xs text-app-muted">{item.codigo} · limite de atenção: 3</span></div>
                  <b className="whitespace-nowrap text-danger">{item.quantidade} un.</b>
                </div>
              ))}
              <Link href="/estoque/atencao" className="btn btn-primary mt-4 w-full justify-center">Ver estoque em atenção</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ valor, label, Icon, alerta = false }) {
  return (
    <div className={`relative flex min-h-30 items-center justify-center rounded-lg border border-app-border border-t-[3px] bg-app-surface p-6 shadow-sm ${alerta ? 'border-t-warning' : 'border-t-brand'}`}>
      <div className="flex flex-col items-center text-center">
        <span className="text-[28px] font-bold leading-none text-app-text">{valor}</span>
        <span className="mt-1 text-[13px] text-app-muted">{label}</span>
      </div>
      <span className={`absolute right-0.5 top-0.5 flex size-11 items-center justify-center rounded-xl ${alerta ? 'bg-warning-light text-warning' : 'bg-brand-soft text-brand-dark'}`} aria-hidden="true">
        <Icon size={22} strokeWidth={2.1} />
      </span>
    </div>
  );
}
