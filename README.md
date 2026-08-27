# SUPERVIZA TI — Gestão de Estoque de Equipamentos

Sistema web para controlar equipamentos de TI, movimentações de estoque, chamados técnicos e necessidades de compra da SUPERVIZA TI.

O projeto foi desenvolvido para resolver a dificuldade de controle de estoque e entregar à diretoria e ao setor de compras uma visão objetiva do que está disponível, do que está em falta e do que precisa ser adquirido.

---

## Objetivo

Centralizar as informações de ativos, suprimentos e atendimentos técnicos em um único painel. Com o sistema, a operação consegue:

- Cadastrar equipamentos com código automático, patrimônio, número de série e garantia;
- Registrar entradas e saídas de materiais;
- Identificar itens com estoque baixo ou zerado;
- Consultar o histórico de movimentações, com responsável, data e quantidade;
- Abrir, concluir e, conforme o perfil, reabrir chamados técnicos para as lojas;
- Gerar relatórios para a diretoria e o setor de compras.

---

## Visão para diretoria e compras

O painel inicial apresenta indicadores do estoque, equipamentos cadastrados, chamados em aberto e alertas. A área **Atenção no estoque** mostra os itens críticos e direciona para a lista completa.

| Situação | Critério | Ação recomendada |
|---|---:|---|
| Disponível | Quantidade acima do mínimo cadastrado | Acompanhamento normal |
| Estoque baixo | Quantidade acima de zero e igual ou inferior ao mínimo | Avaliar reposição |
| Sem estoque | Quantidade igual a zero | Priorizar compra |
| Em atenção | Menos de 3 unidades | Incluir no planejamento de compras |

Os relatórios consolidados podem ser exportados em **Excel** ou **PDF**, contendo itens sem estoque, itens com estoque baixo e chamados agrupados por loja.

---

## Funcionalidades

- **Login protegido** — O sistema inicia na tela de login. As páginas internas exigem uma sessão ativa.
- **Visão geral** — Indicadores, chamados recentes e alertas de estoque.
- **Equipamentos** — Cadastro com código automático, busca por nome ou código e filtros por situação de estoque. Cada equipamento pode ter patrimônio, número de série e garantia.
- **Controle de estoque** — Registro de entradas e saídas, saldo atual e identificação automática de itens críticos.
- **Histórico de movimentações** — Registra quem movimentou, tipo de operação, data, quantidade e saldo antes/depois. Disponível para Administrador, Gestor e Analista.
- **Estoque em atenção** — Lista completa de itens com menos de 3 unidades.
- **Chamados técnicos** — Código sequencial automático, técnico logado preenchido automaticamente, loja de destino, prioridade, data de abertura, conclusão e reabertura conforme permissão.
- **Lojas** — Cadastro, alteração e exclusão de lojas para uso nos chamados.
- **Usuários** — Cadastro, alteração e exclusão de usuários de acordo com o perfil de acesso.
- **Relatórios** — Exportação de dados em Excel e PDF para diretoria e compras.

---

## Perfis e permissões

| Perfil | Pode criar e alterar usuários | Pode consultar histórico e relatórios | Pode reabrir chamados de |
|---|---|---|---|
| Administrador | Todos os cargos | Sim | Todos |
| Gestor de TI | Analista, Técnico, Assistente, Estagiário e Menor Aprendiz | Sim | Analista, Técnico, Assistente, Estagiário e Menor Aprendiz |
| Analista de TI | Técnico, Assistente, Estagiário e Menor Aprendiz | Sim | Técnico, Assistente, Estagiário e Menor Aprendiz |
| Técnico de TI | Assistente, Estagiário e Menor Aprendiz | Não | Assistente, Estagiário e Menor Aprendiz |
| Assistente, Estagiário e Menor Aprendiz | Não | Não | Não |

Administrador, Gestor e Analista também podem criar, alterar e excluir lojas.

---

## Fluxo de trabalho

```text
Cadastro de equipamentos
        ↓
Entradas e saídas registradas no estoque
        ↓
Identificação automática de itens críticos
        ↓
Histórico e relatórios para Diretoria e Compras
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
│   │   ├── equipamentos/       # Cadastro, busca e filtros de equipamentos
│   │   ├── estoque/             # Controle de estoque
│   │   │   ├── atencao/         # Itens com estoque crítico
│   │   │   └── historico/       # Histórico de movimentações
│   │   ├── chamados/            # Abertura e gestão de chamados
│   │   ├── lojas/               # Gestão de lojas
│   │   ├── usuarios/            # Gestão de usuários
│   │   ├── relatorios/          # Relatórios e exportações
│   │   └── layout.js            # Rotas protegidas e estrutura da aplicação
│   ├── page.js                  # Tela de login
│   └── globals.css              # Estilos globais e tokens visuais
├── componentes/
│   ├── layout/                  # Menu lateral e cabeçalho
│   └── ui/                      # Componentes reutilizáveis
├── context/
│   └── AuthContext.js           # Autenticação, usuários e sessão local
├── lib/
│   └── appPath.js               # Caminho base para desenvolvimento e publicação
└── services/
    └── inventoryStore.js        # Persistência local de estoque, lojas e chamados
```

---

## Tecnologias

- **Next.js 15**
- **React 19**
- **Tailwind CSS 4** e **CSS Modules**
- **Lucide React** para ícones
- **SheetJS (xlsx)** para exportação Excel
- **jsPDF** e **jsPDF-AutoTable** para exportação PDF
- **localStorage** e **sessionStorage** para persistência local da demonstração

---

## Instalação e execução

```bash
git clone https://github.com/GuilhermePossenti/VIZATI-Gerenciamento.git
cd VIZATI-Gerenciamento
npm install
npm run dev
```

Com o servidor iniciado, acesse:

```text
http://localhost:3000/VIZATI-Gerenciamento/
```

Se a porta 3000 estiver ocupada, use outra porta:

```bash
npm run dev -- -p 3010
```

Então acesse:

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
| `/equipamentos` | Cadastro, busca e filtros de equipamentos |
| `/estoque` | Controle de estoque |
| `/estoque/atencao` | Itens com menos de 3 unidades |
| `/estoque/historico` | Histórico de entradas e saídas |
| `/chamados` | Chamados técnicos |
| `/lojas` | Gestão de lojas |
| `/usuarios` | Gestão de usuários |
| `/relatorios` | Relatórios para diretoria e compras |

---

## Observação sobre os dados

Esta versão armazena os dados no navegador do usuário. Equipamentos, chamados, lojas, usuários e movimentações ficam salvos localmente no dispositivo e não são compartilhados entre navegadores ou computadores.

Para utilização corporativa com múltiplos usuários simultâneos, o próximo passo recomendado é integrar uma API e um banco de dados centralizado, com autenticação segura e controle de acesso no servidor.
