# CRM Financeiro — Laboratório de Estudos
## Documentação de Requisitos de Sistema
**Versão:** 1.0 | **Data:** 2026 | **Status:** Rascunho para validação

---

## Sumário

1. [Introdução](#1-introdução)
2. [Visão Geral do Sistema](#2-visão-geral-do-sistema)
3. [Módulos e Prioridades](#3-módulos-e-prioridades)
4. [Requisitos Funcionais](#4-requisitos-funcionais)
5. [Interfaces do Sistema](#5-interfaces-do-sistema)
6. [Requisitos Não Funcionais](#6-requisitos-não-funcionais)
7. [Regras de Negócio](#7-regras-de-negócio)
8. [Pontos em Aberto](#8-pontos-em-aberto)
9. [Glossário](#9-glossário)
10. [Histórico de Revisões](#10-histórico-de-revisões)

---

## 1. Introdução

### 1.1 Objetivo do Documento

Este documento formaliza os requisitos do sistema **CRM Financeiro** para um laboratório de estudos, elaborado a partir do relato inicial do cliente. O objetivo é traduzir as necessidades descritas de forma livre em requisitos estruturados, que possam guiar o desenvolvimento e servir de referência para validação com o cliente.

> **Nota de levantamento:** O relato original do cliente foi: *"crie uma planilha, ela tem que ter todas as interfaces do que temos de gastos, quanto tempos de gasto, recibos ao lado, os prints 3 orçamentos necessário, gestão financeira dos gastos com base nos materias"*. As interpretações feitas neste documento devem ser confirmadas com o cliente antes do início do desenvolvimento.

### 1.2 Problema a Resolver

O laboratório realiza compras e contratações regulares, mas **não possui um sistema centralizado** para:

- Registrar e categorizar os gastos realizados com materiais e serviços;
- Armazenar comprovantes de pagamento (recibos, notas fiscais, prints);
- Controlar o processo de cotação (mínimo de 3 orçamentos por compra);
- Acompanhar o saldo disponível em tempo real;
- Gerar relatórios financeiros e de prestação de contas.

A ausência de controle centralizado gera dificuldade de rastreabilidade, dificulta a prestação de contas e impede uma visão clara da saúde financeira do laboratório.

### 1.3 Escopo

O sistema contempla um CRM financeiro básico com as seguintes capacidades:

- Gestão financeira com dashboard e relatórios consolidados;
- Registro de gastos por categoria e período;
- Acompanhamento de saldo disponível com alertas;
- Controle de orçamentos com comparação de 3 cotações obrigatórias;
- Anexo e gestão de comprovantes vinculados a cada gasto.

**Fora do escopo (versão 1.0):**

- Integração com sistemas bancários ou ERPs externos;
- Módulo de RH ou folha de pagamento;
- Gestão de contratos de longo prazo.

---

## 2. Visão Geral do Sistema

O CRM Financeiro do Laboratório é uma **aplicação web de gestão financeira simplificada**, acessível via navegador. Não exige instalação local e deve ser operável por membros do laboratório sem formação técnica especializada.

### 2.1 Fluxo Principal de Uso

```
Identificar necessidade
        ↓
Coletar 3 cotações → Registrar cotações no sistema
        ↓
Realizar a compra
        ↓
Registrar o gasto (categoria, valor, responsável, material)
        ↓
Anexar comprovante (recibo / NF / print)
        ↓
Sistema atualiza saldo disponível automaticamente
        ↓
Gerar relatório de prestação de contas (quando necessário)
```

### 2.2 Perfis de Usuário

| Perfil | Descrição | Permissões Esperadas |
|---|---|---|
| **Pesquisador** | Realiza compras e registra gastos | Cadastrar gastos, anexar comprovantes, registrar cotações |
| **Gestor Financeiro** | Supervisiona o orçamento do laboratório | Tudo do pesquisador + aprovar gastos, definir orçamento, exportar relatórios |
| **Coordenador** | Valida e encaminha prestações de contas | Visualização completa + exportação de relatórios |

---

## 3. Módulos e Prioridades

Os módulos foram priorizados conforme definido no levantamento inicial:

| # | Código | Módulo | Prioridade | Justificativa |
|---|---|---|---|---|
| 1 | MOD-01 | Gestão Financeira e Relatórios | 🔴 Alta | Necessidade central: visão consolidada e prestação de contas |
| 2 | MOD-02 | Registro de Gastos com Categorias | 🔴 Alta | Base de dados para todos os demais módulos |
| 3 | MOD-03 | Acompanhamento de Saldo e Valores | 🔴 Alta | Controle operacional do orçamento disponível |
| 4 | MOD-04 | Controle de Orçamentos (3 Cotações) | 🟡 Média | Exigência para compras, mas não bloqueia operação básica |
| 5 | MOD-05 | Anexo de Recibos e Comprovantes | 🟡 Média | Necessário para prestação de contas — pode ser implementado após os módulos acima |

---

## 4. Requisitos Funcionais

### MOD-01 — Gestão Financeira e Relatórios *(Prioridade 1)*

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | O sistema deve exibir um **dashboard financeiro** com: total gasto no período, saldo disponível, gastos por categoria e últimas movimentações. | Alta |
| RF-02 | O dashboard deve apresentar **gráfico de gastos por categoria** (barras ou pizza), atualizável por período selecionável. | Alta |
| RF-03 | O sistema deve permitir **definir o orçamento total** do laboratório e exibir o percentual já utilizado. | Alta |
| RF-04 | O sistema deve permitir gerar **relatório de prestação de contas** filtrando por período (data início / data fim). | Alta |
| RF-05 | O relatório deve conter: lista de gastos, valores, categorias, responsáveis, comprovantes e cotações associadas. | Alta |
| RF-06 | O sistema deve permitir **exportar o relatório em PDF e em Excel (.xlsx)**. | Alta |
| RF-07 | O sistema deve registrar **data, hora e usuário** responsável por cada exportação de relatório (log de auditoria). | Média |
| RF-08 | O sistema deve permitir **filtrar o relatório** por categoria, responsável e status de comprovante. | Média |

---

### MOD-02 — Registro de Gastos com Categorias *(Prioridade 2)*

| ID | Requisito | Prioridade |
|---|---|---|
| RF-09 | O sistema deve permitir **cadastrar um novo gasto** informando: data, valor (R$), categoria, descrição do material/serviço e responsável. | Alta |
| RF-10 | O sistema deve disponibilizar **categorias de gasto pré-definidas** (ex: Material de consumo, Equipamento, Serviço, Outros). | Alta |
| RF-11 | O sistema deve permitir ao gestor **criar e editar categorias** personalizadas. | Média |
| RF-12 | O sistema deve listar os gastos em **tabela filtrável** por categoria, período e responsável, com totalizador por filtro ativo. | Alta |
| RF-13 | O sistema deve exibir o **total gasto por categoria** em cada período consultado. | Alta |
| RF-14 | O sistema deve permitir **editar ou excluir um gasto**, exceto se este já constar em um relatório exportado. | Média |
| RF-15 | Cada gasto deve ter um **status de comprovante** visível na listagem (✅ Comprovado / ⚠️ Pendente). | Alta |

---

### MOD-03 — Acompanhamento de Saldo e Valores *(Prioridade 3)*

| ID | Requisito | Prioridade |
|---|---|---|
| RF-16 | O sistema deve calcular e exibir o **saldo disponível em tempo real**, subtraindo automaticamente os gastos registrados do orçamento definido. | Alta |
| RF-17 | O sistema deve emitir **alerta visual** (destaque em vermelho/laranja) quando o saldo disponível atingir menos de 20% do orçamento total. | Alta |
| RF-18 | O sistema deve emitir **alerta de extrapolação** quando um novo gasto for cadastrado e o saldo for insuficiente para cobri-lo. | Alta |
| RF-19 | O sistema deve exibir o **histórico de saldo** ao longo do tempo (linha temporal de entradas e saídas). | Média |
| RF-20 | O sistema deve exibir um **resumo rápido** acessível no topo de todas as telas: orçamento total / gasto total / saldo disponível. | Média |

---

### MOD-04 — Controle de Orçamentos — 3 Cotações *(Prioridade 4)*

| ID | Requisito | Prioridade |
|---|---|---|
| RF-21 | O sistema deve permitir **vincular até 3 cotações** a cada gasto/compra antes de sua realização. | Alta |
| RF-22 | Cada cotação deve conter: **fornecedor, valor cotado, data, prazo de entrega** e campo para anexar o arquivo do orçamento (PDF ou imagem). | Alta |
| RF-23 | O sistema deve exibir as cotações em **tela de comparação lado a lado**, destacando o menor e o maior valor. | Alta |
| RF-24 | O sistema deve permitir **marcar a cotação aprovada/escolhida**, registrando quem aprovou e quando. | Alta |
| RF-25 | O sistema deve emitir **aviso** (não bloqueio) quando um gasto for registrado sem as 3 cotações preenchidas. | Média |
| RF-26 | As cotações e seus anexos devem ser **incluídas automaticamente** no relatório de prestação de contas vinculado ao gasto. | Alta |

---

### MOD-05 — Anexo de Recibos e Comprovantes *(Prioridade 5)*

| ID | Requisito | Prioridade |
|---|---|---|
| RF-27 | O sistema deve permitir **anexar arquivos** de comprovantes nos formatos PDF, JPG e PNG a cada registro de gasto. | Alta |
| RF-28 | O sistema deve suportar **múltiplos comprovantes por gasto** (ex: recibo + nota fiscal + print de transferência). | Alta |
| RF-29 | O sistema deve permitir **visualizar o comprovante** diretamente na tela de detalhe do gasto, sem sair do sistema. | Alta |
| RF-30 | O sistema deve **alertar o usuário** ao tentar exportar a prestação de contas caso haja gastos sem nenhum comprovante. | Alta |
| RF-31 | O sistema deve exibir **miniatura ou ícone** do tipo de comprovante (PDF / imagem) na listagem de gastos. | Média |

---

## 5. Interfaces do Sistema

### 5.1 Mapa de Telas

| Código | Nome da Tela | Módulo | Descrição |
|---|---|---|---|
| TELA-01 | Dashboard Principal | MOD-01 / MOD-03 | Visão geral: saldo, últimos gastos, alertas e atalhos rápidos |
| TELA-02 | Lista de Gastos | MOD-02 | Tabela filtrável com todos os gastos e indicadores de status |
| TELA-03 | Cadastro / Edição de Gasto | MOD-02 | Formulário para registrar nova despesa |
| TELA-04 | Detalhe do Gasto | MOD-02 / MOD-04 / MOD-05 | Visualização completa com cotações e comprovantes |
| TELA-05 | Controle de Cotações | MOD-04 | Tela de comparação das 3 cotações lado a lado |
| TELA-06 | Upload de Comprovante | MOD-05 | Interface para anexar recibo/NF ou print |
| TELA-07 | Relatório Financeiro | MOD-01 | Dashboard com gráficos e resumo por período |
| TELA-08 | Prestação de Contas | MOD-01 | Geração e exportação de relatório (PDF / Excel) |
| TELA-09 | Configurações | — | Categorias, responsáveis e orçamento do laboratório |

---

### 5.2 Detalhamento das Telas Críticas

#### TELA-01 — Dashboard Principal

**Componentes obrigatórios:**

- Barra de resumo financeiro no topo: Orçamento Total | Gasto Total | **Saldo Disponível** (com destaque de cor conforme criticidade)
- Gráfico de gastos por categoria (período selecionável: mês / trimestre / ano)
- Lista dos últimos 5 gastos com status de comprovante
- Alertas ativos (saldo abaixo de 20%, gastos sem comprovante, cotações incompletas)
- Atalhos rápidos: "+ Novo Gasto" | "+ Nova Cotação" | "Exportar Relatório"

---

#### TELA-02 — Lista de Gastos

**Colunas da tabela:**

| Data | Descrição | Categoria | Responsável | Valor (R$) | Comprovante | Cotações | Ações |
|---|---|---|---|---|---|---|---|
| 01/05/2026 | Reagente X | Material | João | R$ 320,00 | ✅ | 3/3 | 👁 ✏️ |

**Filtros disponíveis:** período, categoria, responsável, status de comprovante, status de cotações.

**Totalizador:** exibe soma dos valores filtrados no rodapé da tabela.

---

#### TELA-05 — Controle de Cotações (3 Orçamentos)

Layout de 3 colunas — uma por cotação:

```
┌─────────────────┬─────────────────┬─────────────────┐
│   COTAÇÃO 1     │   COTAÇÃO 2     │   COTAÇÃO 3     │
├─────────────────┼─────────────────┼─────────────────┤
│ Fornecedor: ... │ Fornecedor: ... │ Fornecedor: ... │
│ Valor: R$...    │ Valor: R$...    │ Valor: R$...    │
│ Data: ...       │ Data: ...       │ Data: ...       │
│ Prazo: ...      │ Prazo: ...      │ Prazo: ...      │
│ Obs.: ...       │ Obs.: ...       │ Obs.: ...       │
│ [📎 Anexo]      │ [📎 Anexo]      │ [📎 Anexo]      │
│                 │                 │                 │
│ ○ Selecionar    │ ● APROVADA ✅   │ ○ Selecionar    │
└─────────────────┴─────────────────┴─────────────────┘
         🏷 Menor valor: Cotação 2 — R$ 290,00
```

Cada fornecedor deve ser distinto. Campo de aprovação exige confirmação do gestor.

---

#### TELA-08 — Prestação de Contas

**Fluxo da tela:**

1. Selecionar período (data inicial → data final)
2. Pré-visualizar resumo: total de gastos, total por categoria, nº de comprovantes, nº de cotações
3. Verificar alertas: gastos sem comprovante são listados com destaque
4. Escolher formato de exportação: **PDF** ou **Excel (.xlsx)**
5. Confirmar e gerar

**Estrutura do relatório exportado:**
- Capa com dados do laboratório e período
- Sumário financeiro (orçamento × gastos × saldo)
- Tabela detalhada de gastos
- Seção de cotações por gasto (quando houver)
- Comprovantes organizados por gasto

---

## 6. Requisitos Não Funcionais

| ID | Categoria | Requisito | Prioridade |
|---|---|---|---|
| RNF-01 | Usabilidade | As telas devem ser operáveis sem treinamento técnico. Ações principais devem ser acessíveis em até 3 cliques. | Alta |
| RNF-02 | Desempenho | Listagens com até 500 registros devem carregar em menos de 3 segundos. | Média |
| RNF-03 | Segurança | Acesso por autenticação (usuário/senha). Transmissão de dados via HTTPS. | Alta |
| RNF-04 | Confiabilidade | Backup automático diário de dados e arquivos anexados. | Alta |
| RNF-05 | Armazenamento | Suporte mínimo de 5 GB para arquivos (comprovantes e cotações). | Média |
| RNF-06 | Compatibilidade | Funcionar nos navegadores Chrome, Firefox e Edge (versões recentes). | Alta |
| RNF-07 | Auditoria | Toda alteração em registros financeiros deve gerar log com data, hora e usuário. | Alta |
| RNF-08 | Manutenibilidade | O sistema deve ser desenvolvido com tecnologias web modernas que permitam manutenções sem indisponibilidade prolongada. | Média |

---

## 7. Regras de Negócio

| ID | Regra |
|---|---|
| RN-01 | Todo gasto deve ter ao menos **1 comprovante** para constar em relatório de prestação de contas. O sistema alerta, mas não bloqueia o cadastro do gasto. |
| RN-02 | Compras que passem pelo processo de cotação devem ter **3 orçamentos de fornecedores distintos**. O sistema emite aviso se o critério não for atendido, mas não bloqueia. |
| RN-03 | Quando um novo gasto ultrapassar o saldo disponível, o sistema deve exibir **alerta de extrapolação de orçamento** exigindo confirmação explícita do gestor para prosseguir. |
| RN-04 | Gastos vinculados a **relatórios já exportados ficam bloqueados** para edição e exclusão, garantindo integridade dos registros. |
| RN-05 | Não é permitido cadastrar **duas cotações do mesmo fornecedor** para o mesmo item/gasto. |
| RN-06 | O histórico de exportações de relatórios deve ser mantido por no mínimo **5 anos** para fins de auditoria. |
| RN-07 | O **saldo disponível** é calculado como: `Orçamento Total − Soma de todos os gastos registrados no período`. |

---

## 8. Pontos em Aberto

Os itens abaixo precisam ser confirmados com o cliente antes do início do desenvolvimento:

| # | Ponto em Aberto | Impacto |
|---|---|---|
| PA-01 | **Prestação de contas institucional:** O laboratório presta contas para algum órgão externo (governo, universidade, agência de fomento)? Se sim, o relatório pode precisar seguir um formato específico. | Alto — pode alterar estrutura do relatório exportado |
| PA-02 | **Multi-laboratório:** O sistema deve atender apenas um laboratório ou múltiplos laboratórios com orçamentos separados? | Alto — impacta arquitetura do sistema |
| PA-03 | **Fonte de orçamento:** O laboratório recebe recursos de uma única fonte ou de múltiplas verbas/projetos distintos? | Médio — pode exigir controle por rubrica ou projeto |
| PA-04 | **Aprovação de gastos:** Existe um fluxo de aprovação (ex: gestor precisa aprovar antes do gasto ser confirmado)? | Médio — pode exigir módulo de aprovação |
| PA-05 | **Volume esperado de dados:** Quantos gastos são registrados por mês em média? | Baixo — afeta requisitos de desempenho |
| PA-06 | **Acesso mobile:** Os usuários precisam acessar o sistema pelo celular com frequência? | Médio — pode exigir design responsivo prioritário |

---

## 9. Glossário

| Termo | Definição |
|---|---|
| **Gasto** | Registro de uma despesa realizada pelo laboratório, com data, valor, categoria e responsável. |
| **Comprovante** | Documento que comprova a realização do gasto: recibo, nota fiscal ou print de transação. |
| **Cotação / Orçamento** | Proposta de preço de um fornecedor. São obrigatórias 3 cotações de fornecedores distintos por compra. |
| **Prestação de Contas** | Relatório consolidado enviado a uma instância responsável comprovando os gastos realizados. |
| **Categoria de Gasto** | Classificação do tipo de despesa (ex: Material de consumo, Equipamento, Serviço). |
| **Saldo Disponível** | Orçamento total do laboratório subtraído dos gastos registrados no período. |
| **Dashboard** | Tela principal com visão resumida e gráfica da situação financeira do laboratório. |
| **Rubrica / Verba** | Divisão orçamentária dentro do laboratório por projeto ou origem de recurso. *(Pendente confirmação — PA-03)* |

---

## 10. Histórico de Revisões

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0 | 2026 | Analista de Requisitos | Versão inicial — elaborada com base no relato do cliente. Pendente validação. |

---

*Documento elaborado para fins de levantamento e validação. Todos os requisitos devem ser confirmados com o cliente antes do início do desenvolvimento.*