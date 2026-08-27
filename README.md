# Viza TI — Gestão de Estoque de Equipamentos

Sistema web para organização e acompanhamento do estoque de equipamentos de TI da Viza TI.

O projeto foi desenvolvido para sanar o problema de controle de estoque e dar à diretoria e ao setor de compras uma visão clara do que está disponível, do que está em falta e do que precisa ser comprado. Assim, as decisões de reposição podem ser tomadas com base nas quantidades registradas no sistema.

---

## Objetivo

A Viza TI centraliza as informações dos ativos e suprimentos de tecnologia em um único painel. Com ela, a operação consegue:

- Registrar equipamentos e suas quantidades em estoque;
- Identificar materiais sem estoque ou com quantidade baixa;
- Consultar a relação de itens que precisam de atenção;
- Abrir e acompanhar chamados técnicos para lojas;
- Apoiar a diretoria e o setor de compras no planejamento de reposições.

---

## Visão para diretoria e compras

O painel inicial mostra os principais indicadores da operação: quantidade de itens cadastrados, chamados em aberto e alertas de estoque. A área **Atenção no estoque** apresenta uma amostra dos itens críticos e direciona para a lista completa.

Um item entra em atenção quando possui menos de **3 unidades**. Dessa forma, a diretoria e o setor de compras podem consultar rapidamente quais produtos precisam ser adquiridos, como fontes, periféricos, cabos, monitores, impressoras e equipamentos de rede.

| Situação | Critério | Ação recomendada |
|---|---:|---|
| Disponível | Quantidade acima do mínimo | Acompanhamento normal |
| Estoque baixo | Quantidade igual ou inferior ao mínimo cadastrado | Avaliar reposição |
| Sem estoque | Quantidade igual a zero | Priorizar compra |
| Em atenção | Menos de 3 unidades | Incluir no planejamento de compras |

---

## Funcionalidades

- **Login** — Acesso ao sistema com sessão local persistida no navegador.
- **Visão geral** — Indicadores do estoque, chamados recentes e alertas de materiais críticos.
- **Equipamentos** — Cadastro, consulta e busca de equipamentos por código, nome ou categoria.
- **Controle de estoque** — Visualização das quantidades, locais e status de cada item.
- **Estoque em atenção** — Relação completa dos itens com menos de 3 unidades para apoio às compras.
- **Chamados técnicos** — Registro de técnico, cargo, código, loja de destino, descrição, prioridade, data de abertura e data de conclusão.

---

## Fluxo de trabalho

```text
Cadastro de equipamentos
        ↓
Atualização das quantidades em estoque
        ↓
Identificação automática de itens críticos
        ↓
Diretoria e Compras consultam "Estoque em atenção"
        ↓
Planejamento e realização das compras
```

---

## Estrutura do projeto

```text
src/
├── app/
│   ├── (app)/
│   │   ├── dashboard/          # Painel principal
│   │   ├── equipamentos/       # Cadastro e consulta de equipamentos
│   │   ├── estoque/             # Controle de estoque
│   │   │   └── atencao/         # Itens com estoque crítico
│   │   ├── chamados/            # Abertura e gestão de chamados
│   │   └── layout.js            # Rotas protegidas e estrutura da aplicação
│   ├── page.js                  # Tela de login
│   └── globals.css              # Estilos globais e tokens visuais
├── componentes/
│   ├── layout/                  # Menu lateral e cabeçalho
│   └── ui/                      # Componentes reutilizáveis
├── context/
│   └── AuthContext.js           # Autenticação e sessão local
├── lib/
│   └── appPath.js               # Caminho base para desenvolvimento e publicação
└── services/
    └── inventoryStore.js        # Persistência local de estoque e chamados
```

---

## Tecnologias

- **Next.js 15**
- **React 19**
- **Tailwind CSS 4** e **CSS Modules**
- **Lucide React** para ícones
- **localStorage** para persistência dos dados de demonstração no navegador

---

## Instalação e execução

```bash
git clone <url-do-repositorio>
cd VIZATI-Gerenciamento
npm install
npm run dev
```

Por padrão, o Next.js inicia em `http://localhost:3000`. Caso essa porta esteja ocupada, informe outra porta:

```bash
npm run dev -- -p 3010
```

No ambiente local, acesse:

```text
http://localhost:3010/VIZATI-Gerenciamento/
```

Para validar a versão de produção:

```bash
npm run build
```

---

## Credenciais de demonstração

| Login | Senha | Perfil |
|---|---|---|
| `tecnico` | `ti123` | Guilherme Possenti — Assistente de TI |
| `gestor` | `ti123` | Guilherme Bridi — Gestor de TI |
| `admin` | `admin123` | Administrador |

---

## Rotas principais

| Rota | Descrição |
|---|---|
| `/` | Login |
| `/dashboard` | Visão geral e indicadores |
| `/equipamentos` | Cadastro e busca de equipamentos |
| `/estoque` | Controle de estoque |
| `/estoque/atencao` | Itens com menos de 3 unidades |
| `/chamados` | Chamados técnicos |

---

## Observação sobre os dados

Esta versão utiliza dados locais no navegador para demonstração. Para uso corporativo com vários usuários simultâneos, recomenda-se integrar uma API e um banco de dados centralizado, permitindo que diretoria, compras e equipe técnica visualizem sempre as mesmas informações atualizadas.
