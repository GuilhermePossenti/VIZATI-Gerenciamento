"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  EQUIPAMENTOS_INICIAIS,
  carregar,
  salvar,
} from "../../../services/inventoryStore";
import { useAuth } from "../../../context/AuthContext";
import styles from "../Operations.module.css";

const equipamentoVazio = {
  nome: "",
  categoria: "Periféricos",
  quantidade: 0,
  minimo: 1,
  local: "Matriz",
  patrimonio: "",
  numeroSerie: "",
  garantia: "",
};
const movimentoVazio = {
  equipamentoId: "",
  quantidade: 1,
  origemTipo: "Fornecedor",
  origem: "",
  observacao: "",
};
const podeVerHistorico = (user) =>
  ["Administrador", "Gestor de TI", "Analista de TI"].includes(user?.cargo);

function situacaoDoEstoque(item) {
  if (Number(item.quantidade) === 0) return "Sem estoque";
  if (Number(item.quantidade) <= Number(item.minimo)) return "Estoque baixo";
  return "Disponível";
}

function proximoCodigo(lista) {
  const maiorNumero = lista.reduce((maior, item) => {
    const numeros = String(item.codigo).match(/(\d+)/g);
    return Math.max(maior, numeros ? Number(numeros.at(-1)) : 0);
  }, 0);
  return `EQ-${String(maiorNumero + 1).padStart(3, "0")}`;
}

export default function Estoque() {
  const { user } = useAuth();
  const [lista, setLista] = useState(EQUIPAMENTOS_INICIAIS);
  const [busca, setBusca] = useState("");
  const [filtroEstoque, setFiltroEstoque] = useState("");
  const [modalEquipamento, setModalEquipamento] = useState(false);
  const [modalMovimento, setModalMovimento] = useState(false);
  const [tipoMovimento, setTipoMovimento] = useState("Entrada");
  const [formEquipamento, setFormEquipamento] = useState(equipamentoVazio);
  const [formMovimento, setFormMovimento] = useState(movimentoVazio);
  const [msg, setMsg] = useState("");
  const [erroMovimento, setErroMovimento] = useState("");

  useEffect(
    () => setLista(carregar("nexati_equipamentos", EQUIPAMENTOS_INICIAIS)),
    [],
  );

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return lista.filter((item) => {
      const buscaOk =
        !termo ||
        item.codigo.toLowerCase().includes(termo) ||
        item.nome.toLowerCase().includes(termo);
      return (
        buscaOk && (!filtroEstoque || situacaoDoEstoque(item) === filtroEstoque)
      );
    });
  }, [lista, busca, filtroEstoque]);

  const abrirMovimento = (tipo, equipamentoId = "") => {
    setTipoMovimento(tipo);
    setErroMovimento("");
    setFormMovimento({
      ...movimentoVazio,
      equipamentoId: String(equipamentoId),
    });
    setModalMovimento(true);
  };

  const cadastrarEquipamento = (event) => {
    event.preventDefault();
    const novo = {
      ...formEquipamento,
      id: Date.now(),
      codigo: proximoCodigo(lista),
      quantidade: Number(formEquipamento.quantidade),
      minimo: Number(formEquipamento.minimo),
    };
    const proximaLista = [novo, ...lista];
    setLista(proximaLista);
    salvar("nexati_equipamentos", proximaLista);
    setFormEquipamento(equipamentoVazio);
    setModalEquipamento(false);
    setMsg(`${novo.nome} foi cadastrado com o código ${novo.codigo}.`);
  };

  const registrarMovimento = (event) => {
    event.preventDefault();
    const equipamento = lista.find(
      (item) => String(item.id) === formMovimento.equipamentoId,
    );
    const quantidade = Number(formMovimento.quantidade);
    if (!equipamento || !Number.isInteger(quantidade) || quantidade < 1)
      return setErroMovimento(
        "Selecione um equipamento e informe uma quantidade válida.",
      );
    if (
      tipoMovimento === "Saída" &&
      quantidade > Number(equipamento.quantidade)
    )
      return setErroMovimento(
        `A saída é maior que o saldo disponível (${equipamento.quantidade} un.).`,
      );

    const saldoAnterior = Number(equipamento.quantidade);
    const saldoAtual =
      tipoMovimento === "Entrada"
        ? saldoAnterior + quantidade
        : saldoAnterior - quantidade;
    const proximaLista = lista.map((item) =>
      item.id === equipamento.id ? { ...item, quantidade: saldoAtual } : item,
    );
    const origem =
      tipoMovimento === "Entrada"
        ? `${formMovimento.origemTipo}: ${formMovimento.origem.trim()}`
        : formMovimento.observacao.trim() || "Saída manual de estoque";
    const historico = carregar("vizati_movimentacoes", []);
    const movimento = {
      id: Date.now(),
      data: new Date().toLocaleString("pt-BR"),
      equipamento: equipamento.nome,
      codigo: equipamento.codigo,
      tipo: tipoMovimento,
      quantidade,
      saldoAnterior,
      saldoAtual,
      origem,
      observacao: formMovimento.observacao.trim(),
      usuario: user?.nome || "Usuário não identificado",
      cargo: user?.cargo || "",
    };
    setLista(proximaLista);
    salvar("nexati_equipamentos", proximaLista);
    salvar("vizati_movimentacoes", [movimento, ...historico]);
    setModalMovimento(false);
    setMsg(
      `${tipoMovimento} de ${quantidade} un. de ${equipamento.nome} registrada com sucesso.`,
    );
  };

  const total = lista.reduce((soma, item) => soma + Number(item.quantidade), 0);
  const baixo = lista.filter(
    (item) => Number(item.quantidade) > 0 && Number(item.quantidade) < 3,
  ).length;
  const zerado = lista.filter((item) => Number(item.quantidade) === 0).length;

  return (
    <div className={styles.pagina}>
      <div className={styles.cabecalho}>
        <div>
          <h1 className={styles.titulo}>Controle de estoque</h1>
          <p className={styles.subtitulo}>
            Cadastre itens, registre entradas e saídas e acompanhe os
            equipamentos da operação.
          </p>
        </div>
        <div className={styles.ajustes}>
          {podeVerHistorico(user) && (
            <Link href="/estoque/historico" className="btn btn-secondary">
              Histórico
            </Link>
          )}
          <button
            className="btn btn-secondary"
            onClick={() => abrirMovimento("Entrada")}
          >
            + Registrar entrada
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setModalEquipamento(true)}
          >
            + Cadastrar item
          </button>
        </div>
      </div>
      {msg && <div className={styles.toast}>{msg}</div>}
      <div className={styles.resumo}>
        <Resumo valor={total} texto="unidades disponíveis" />
        <Resumo valor={baixo} texto="itens em atenção" />
        <Resumo valor={zerado} texto="itens sem estoque" />
      </div>
      <div className="card">
        <div className="card-body">
          <div className={styles.filtros}>
            <label className="form-group">
              <span className="form-label">Buscar item</span>
              <input
                className="form-control"
                type="search"
                placeholder="Nome ou código"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
              />
            </label>
            <label className="form-group">
              <span className="form-label">Situação</span>
              <select
                className="form-control"
                value={filtroEstoque}
                onChange={(event) => setFiltroEstoque(event.target.value)}
              >
                <option value="">Todos os itens</option>
                <option>Disponível</option>
                <option>Estoque baixo</option>
                <option>Sem estoque</option>
              </select>
            </label>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="tabela-wrapper">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Equipamento</th>
                <th>Patrimônio</th>
                <th>Nº de série</th>
                <th>Garantia</th>
                <th>Local</th>
                <th>Limite</th>
                <th>Atual</th>
                <th>Situação</th>
                <th>Movimentar</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((equipamento) => {
                const situacao = situacaoDoEstoque(equipamento);
                return (
                  <tr key={equipamento.id}>
                    <td className="font-semibold">{equipamento.codigo}</td>
                    <td>
                      <b>{equipamento.nome}</b>
                      <br />
                      <span className="text-muted">
                        {equipamento.categoria}
                      </span>
                    </td>
                    <td>{equipamento.patrimonio || "—"}</td>
                    <td>{equipamento.numeroSerie || "—"}</td>
                    <td>{equipamento.garantia || "—"}</td>
                    <td>{equipamento.local}</td>
                    <td>{equipamento.minimo}</td>
                    <td>
                      <span className={styles.quantidade}>
                        {equipamento.quantidade}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${situacao === "Sem estoque" ? "badge-risco" : situacao === "Estoque baixo" ? "badge-atencao" : "badge-regular"}`}
                      >
                        {situacao}
                      </span>
                    </td>
                    <td>
                      <div className={styles.ajustes}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() =>
                            abrirMovimento("Saída", equipamento.id)
                          }
                        >
                          − Saída
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() =>
                            abrirMovimento("Entrada", equipamento.id)
                          }
                        >
                          + Entrada
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalEquipamento && (
        <Modal
          titulo="Cadastrar item no estoque"
          fechar={() => setModalEquipamento(false)}
        >
          <form onSubmit={cadastrarEquipamento} className={styles.grid}>
            <label className="form-group">
              <span className="form-label">Código</span>
              <input
                className="form-control"
                value={proximoCodigo(lista)}
                readOnly
              />
            </label>
            <Campo
              label="Nome do equipamento"
              value={formEquipamento.nome}
              set={(nome) => setFormEquipamento({ ...formEquipamento, nome })}
            />
            <Campo
              label="Categoria"
              value={formEquipamento.categoria}
              set={(categoria) =>
                setFormEquipamento({ ...formEquipamento, categoria })
              }
            />
            <Campo
              label="Local / loja"
              value={formEquipamento.local}
              set={(local) => setFormEquipamento({ ...formEquipamento, local })}
            />
            <Campo
              label="Patrimônio"
              value={formEquipamento.patrimonio}
              opcional
              set={(patrimonio) =>
                setFormEquipamento({ ...formEquipamento, patrimonio })
              }
            />
            <Campo
              label="Número de série"
              value={formEquipamento.numeroSerie}
              opcional
              set={(numeroSerie) =>
                setFormEquipamento({ ...formEquipamento, numeroSerie })
              }
            />
            <Campo
              label="Garantia"
              type="date"
              value={formEquipamento.garantia}
              opcional
              set={(garantia) =>
                setFormEquipamento({ ...formEquipamento, garantia })
              }
            />
            <Campo
              label="Quantidade inicial"
              type="number"
              value={formEquipamento.quantidade}
              set={(quantidade) =>
                setFormEquipamento({ ...formEquipamento, quantidade })
              }
            />
            <Campo
              label="Estoque mínimo"
              type="number"
              value={formEquipamento.minimo}
              set={(minimo) =>
                setFormEquipamento({ ...formEquipamento, minimo })
              }
            />
            <div className={`${styles.acoes} ${styles.full}`}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setModalEquipamento(false)}
              >
                Cancelar
              </button>
              <button className="btn btn-primary">Cadastrar item</button>
            </div>
          </form>
        </Modal>
      )}

      {modalMovimento && (
        <Modal
          titulo={`Registrar ${tipoMovimento.toLowerCase()}`}
          fechar={() => setModalMovimento(false)}
        >
          <form onSubmit={registrarMovimento} className={styles.grid}>
            <label className={`form-group ${styles.full}`}>
              <span className="form-label">Equipamento</span>
              <select
                required
                className="form-control"
                value={formMovimento.equipamentoId}
                onChange={(event) =>
                  setFormMovimento({
                    ...formMovimento,
                    equipamentoId: event.target.value,
                  })
                }
              >
                <option value="" disabled>
                  Selecione o item
                </option>
                {lista.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.codigo} — {item.nome} ({item.quantidade} un.)
                  </option>
                ))}
              </select>
            </label>
            <Campo
              label="Quantidade"
              type="number"
              value={formMovimento.quantidade}
              set={(quantidade) =>
                setFormMovimento({ ...formMovimento, quantidade })
              }
            />
            {tipoMovimento === "Entrada" ? (
              <>
                <label className="form-group">
                  <span className="form-label">Origem</span>
                  <select
                    className="form-control"
                    value={formMovimento.origemTipo}
                    onChange={(event) =>
                      setFormMovimento({
                        ...formMovimento,
                        origemTipo: event.target.value,
                      })
                    }
                  >
                    <option>Fornecedor</option>
                    <option>Loja</option>
                    <option>Transferência</option>
                    <option>Outro</option>
                  </select>
                </label>
                <Campo
                  label="Nome do fornecedor ou loja"
                  value={formMovimento.origem}
                  set={(origem) =>
                    setFormMovimento({ ...formMovimento, origem })
                  }
                />
              </>
            ) : (
              <Campo
                label="Motivo da saída"
                value={formMovimento.observacao}
                opcional
                set={(observacao) =>
                  setFormMovimento({ ...formMovimento, observacao })
                }
              />
            )}{" "}
            {tipoMovimento === "Entrada" && (
              <label className={`form-group ${styles.full}`}>
                <span className="form-label">Observação (opcional)</span>
                <input
                  className="form-control"
                  value={formMovimento.observacao}
                  onChange={(event) =>
                    setFormMovimento({
                      ...formMovimento,
                      observacao: event.target.value,
                    })
                  }
                />
              </label>
            )}
            {erroMovimento && (
              <p className={`${styles.full} text-danger`}>{erroMovimento}</p>
            )}
            <div className={`${styles.acoes} ${styles.full}`}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setModalMovimento(false)}
              >
                Cancelar
              </button>
              <button className="btn btn-primary">
                Confirmar {tipoMovimento.toLowerCase()}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Resumo({ valor, texto }) {
  return (
    <div className={styles.resumoItem}>
      <strong>{valor}</strong>
      <span>{texto}</span>
    </div>
  );
}
function Campo({ label, value, set, type = "text", opcional = false }) {
  return (
    <label className="form-group">
      <span className="form-label">{label}</span>
      <input
        required={!opcional}
        type={type}
        min={type === "number" ? "0" : undefined}
        className="form-control"
        value={value}
        onChange={(event) => set(event.target.value)}
      />
    </label>
  );
}
function Modal({ titulo, fechar, children }) {
  return (
    <div
      className={styles.modalOverlay}
      onMouseDown={(event) => event.target === event.currentTarget && fechar()}
    >
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{titulo}</h2>
          <button className="btn btn-ghost" onClick={fechar}>
            Fechar
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}
