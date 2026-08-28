"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { carregar } from "../../../../services/inventoryStore";
import { useAuth } from "../../../../context/AuthContext";
import styles from "../../Operations.module.css";

const autorizado = (user) =>
  ["Administrador", "Gestor de TI", "Analista de TI"].includes(user?.cargo);

export default function HistoricoEstoque() {
  const { user } = useAuth();
  const router = useRouter();
  const [movimentacoes, setMovimentacoes] = useState([]);

  useEffect(() => {
    if (user && !autorizado(user)) router.replace("/estoque");
    setMovimentacoes(carregar("vizati_movimentacoes", []));
  }, [router, user]);

  if (!autorizado(user)) return null;

  return (
    <div className={styles.pagina}>
      <div>
        <h1 className={styles.titulo}>Histórico de movimentações</h1>
        <p className={styles.subtitulo}>
          Entradas e saídas registradas no estoque, com responsável e saldo
          atualizado.
        </p>
      </div>
      <div className="card">
        <div className="tabela-wrapper">
          <table>
            <thead>
              <tr>
                <th>Data e hora</th>
                <th>Equipamento</th>
                <th>Tipo</th>
                <th>Origem / referência</th>
                <th>Qtd.</th>
                <th>Saldo</th>
                <th>Responsável</th>
              </tr>
            </thead>
            <tbody>
              {movimentacoes.length ? (
                movimentacoes.map((movimento) => (
                  <tr key={movimento.id}>
                    <td>{movimento.data}</td>
                    <td>
                      <b>{movimento.equipamento}</b>
                      <br />
                      <span className="text-muted">{movimento.codigo}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${movimento.tipo === "Entrada" ? "badge-regular" : "badge-atencao"}`}
                      >
                        {movimento.tipo}
                      </span>
                    </td>
                    <td>{movimento.origem || "—"}</td>
                    <td>{movimento.quantidade}</td>
                    <td>
                      {movimento.saldoAnterior} → <b>{movimento.saldoAtual}</b>
                    </td>
                    <td>
                      <b>{movimento.usuario}</b>
                      <br />
                      <span className="text-muted">{movimento.cargo}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-muted">
                    Nenhuma movimentação registrada até o momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
