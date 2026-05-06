import type { GastoComRelacoes, DashboardData, Categoria, Usuario, Orcamento } from "@/types"

export const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

const cats = {
  consumo: { id: "cat-001", nome: "Material de consumo", criado_em: "2026-01-01T00:00:00Z" },
  equip:   { id: "cat-002", nome: "Equipamento",          criado_em: "2026-01-01T00:00:00Z" },
  servico: { id: "cat-003", nome: "Serviço",               criado_em: "2026-01-01T00:00:00Z" },
  outros:  { id: "cat-004", nome: "Outros",                criado_em: "2026-01-01T00:00:00Z" },
}

const users = {
  joao:  { id: "usr-001", nome: "João Silva",    email: "joao@lab.com",  perfil: "pesquisador"  as const, criado_em: "2026-01-01T00:00:00Z" },
  maria: { id: "usr-002", nome: "Maria Santos",  email: "maria@lab.com", perfil: "gestor"        as const, criado_em: "2026-01-01T00:00:00Z" },
  pedro: { id: "usr-003", nome: "Pedro Alves",   email: "pedro@lab.com", perfil: "coordenador"   as const, criado_em: "2026-01-01T00:00:00Z" },
}

export const DEMO_GASTOS: GastoComRelacoes[] = [
  {
    id: "gasto-001", data: "2026-05-01", descricao: "Reagente DMSO — 500 mL",
    valor: 450.00, categoria_id: "cat-001", responsavel_id: "usr-001",
    bloqueado: false, criado_em: "2026-05-01T10:00:00Z",
    categoria: cats.consumo, responsavel: users.joao,
    comprovantes: [{ id: "c1", gasto_id: "gasto-001", arquivo: "#", tipo: "pdf", criado_em: "2026-05-01T10:30:00Z" }],
    cotacoes: [
      { id: "q1", gasto_id: "gasto-001", fornecedor: "LabSupply Brasil",   valor: 450.00, data_cotacao: "2026-04-28", prazo: "3 dias úteis", observacoes: null, arquivo: null, aprovada: true,  criado_em: "2026-04-28T00:00:00Z" },
      { id: "q2", gasto_id: "gasto-001", fornecedor: "Sigma-Aldrich",      valor: 520.00, data_cotacao: "2026-04-28", prazo: "5 dias úteis", observacoes: "Frete incluso", arquivo: null, aprovada: false, criado_em: "2026-04-28T00:00:00Z" },
      { id: "q3", gasto_id: "gasto-001", fornecedor: "Química Fina Ltda",  valor: 480.00, data_cotacao: "2026-04-29", prazo: "2 dias úteis", observacoes: null, arquivo: null, aprovada: false, criado_em: "2026-04-29T00:00:00Z" },
    ],
  },
  {
    id: "gasto-002", data: "2026-05-03", descricao: "Micropipeta Eppendorf 1000 μL",
    valor: 1850.00, categoria_id: "cat-002", responsavel_id: "usr-002",
    bloqueado: false, criado_em: "2026-05-03T09:00:00Z",
    categoria: cats.equip, responsavel: users.maria,
    comprovantes: [{ id: "c2", gasto_id: "gasto-002", arquivo: "#", tipo: "pdf", criado_em: "2026-05-03T14:00:00Z" }],
    cotacoes: [
      { id: "q4", gasto_id: "gasto-002", fornecedor: "Eppendorf Brasil",    valor: 1850.00, data_cotacao: "2026-05-01", prazo: "7 dias",  observacoes: null,                  arquivo: null, aprovada: true,  criado_em: "2026-05-01T00:00:00Z" },
      { id: "q5", gasto_id: "gasto-002", fornecedor: "Thermo Fisher",       valor: 2100.00, data_cotacao: "2026-05-01", prazo: "10 dias", observacoes: null,                  arquivo: null, aprovada: false, criado_em: "2026-05-01T00:00:00Z" },
      { id: "q6", gasto_id: "gasto-002", fornecedor: "Bio-Rad Laboratories",valor: 1920.00, data_cotacao: "2026-05-02", prazo: "5 dias",  observacoes: "Garantia 2 anos",     arquivo: null, aprovada: false, criado_em: "2026-05-02T00:00:00Z" },
    ],
  },
  {
    id: "gasto-003", data: "2026-05-05", descricao: "Manutenção preventiva do centrífugador",
    valor: 780.00, categoria_id: "cat-003", responsavel_id: "usr-001",
    bloqueado: false, criado_em: "2026-05-05T11:00:00Z",
    categoria: cats.servico, responsavel: users.joao,
    comprovantes: [],
    cotacoes: [
      { id: "q7", gasto_id: "gasto-003", fornecedor: "TechLab Manutenções", valor: 780.00, data_cotacao: "2026-05-04", prazo: "Imediato", observacoes: null, arquivo: null, aprovada: true,  criado_em: "2026-05-04T00:00:00Z" },
      { id: "q8", gasto_id: "gasto-003", fornecedor: "Precisão Técnica",    valor: 950.00, data_cotacao: "2026-05-04", prazo: "3 dias",   observacoes: null, arquivo: null, aprovada: false, criado_em: "2026-05-04T00:00:00Z" },
    ],
  },
  {
    id: "gasto-004", data: "2026-05-06", descricao: "Luvas nitrílicas descartáveis — cx 100 un",
    valor: 89.90, categoria_id: "cat-001", responsavel_id: "usr-003",
    bloqueado: false, criado_em: "2026-05-06T08:00:00Z",
    categoria: cats.consumo, responsavel: users.pedro,
    comprovantes: [{ id: "c3", gasto_id: "gasto-004", arquivo: "#", tipo: "jpg", criado_em: "2026-05-06T08:30:00Z" }],
    cotacoes: [],
  },
  {
    id: "gasto-005", data: "2026-04-15", descricao: "Balança analítica de precisão 0,0001 g",
    valor: 4200.00, categoria_id: "cat-002", responsavel_id: "usr-002",
    bloqueado: true, criado_em: "2026-04-15T14:00:00Z",
    categoria: cats.equip, responsavel: users.maria,
    comprovantes: [{ id: "c4", gasto_id: "gasto-005", arquivo: "#", tipo: "pdf", criado_em: "2026-04-15T15:00:00Z" }],
    cotacoes: [
      { id: "q9",  gasto_id: "gasto-005", fornecedor: "Mettler-Toledo",  valor: 4200.00, data_cotacao: "2026-04-10", prazo: "15 dias", observacoes: "Calibração inclusa", arquivo: null, aprovada: true,  criado_em: "2026-04-10T00:00:00Z" },
      { id: "q10", gasto_id: "gasto-005", fornecedor: "Shimadzu Brasil", valor: 4800.00, data_cotacao: "2026-04-11", prazo: "20 dias", observacoes: null,                  arquivo: null, aprovada: false, criado_em: "2026-04-11T00:00:00Z" },
      { id: "q11", gasto_id: "gasto-005", fornecedor: "Radwag Balanças", valor: 3950.00, data_cotacao: "2026-04-12", prazo: "10 dias", observacoes: "Sem certificado",     arquivo: null, aprovada: false, criado_em: "2026-04-12T00:00:00Z" },
    ],
  },
  {
    id: "gasto-006", data: "2026-05-02", descricao: "Assinatura software GraphPad Prism",
    valor: 620.00, categoria_id: "cat-003", responsavel_id: "usr-001",
    bloqueado: false, criado_em: "2026-05-02T16:00:00Z",
    categoria: cats.servico, responsavel: users.joao,
    comprovantes: [],
    cotacoes: [],
  },
  {
    id: "gasto-007", data: "2026-05-04", descricao: "Ponteiras para micropipeta — 3 caixas",
    valor: 134.50, categoria_id: "cat-001", responsavel_id: "usr-003",
    bloqueado: false, criado_em: "2026-05-04T09:30:00Z",
    categoria: cats.consumo, responsavel: users.pedro,
    comprovantes: [{ id: "c5", gasto_id: "gasto-007", arquivo: "#", tipo: "png", criado_em: "2026-05-04T10:00:00Z" }],
    cotacoes: [
      { id: "q12", gasto_id: "gasto-007", fornecedor: "LabSupply Brasil", valor: 134.50, data_cotacao: "2026-05-03", prazo: "2 dias", observacoes: null, arquivo: null, aprovada: true,  criado_em: "2026-05-03T00:00:00Z" },
      { id: "q13", gasto_id: "gasto-007", fornecedor: "Bio-Rad",          valor: 148.00, data_cotacao: "2026-05-03", prazo: "4 dias", observacoes: null, arquivo: null, aprovada: false, criado_em: "2026-05-03T00:00:00Z" },
      { id: "q14", gasto_id: "gasto-007", fornecedor: "Fisher Scientific", valor: 139.00, data_cotacao: "2026-05-03", prazo: "3 dias", observacoes: null, arquivo: null, aprovada: false, criado_em: "2026-05-03T00:00:00Z" },
    ],
  },
]

export const DEMO_CATEGORIAS: Categoria[] = Object.values(cats)

export const DEMO_USUARIOS: Usuario[] = Object.values(users)

export const DEMO_ORCAMENTO: Orcamento = {
  id: "orc-001",
  total: 15000.00,
  periodo: "2026-05",
  criado_em: "2026-05-01T00:00:00Z",
}

export function getDemoDashboard(): DashboardData {
  const gastosDoMes = DEMO_GASTOS.filter((g) => g.data.startsWith("2026-05"))
  const gastoTotal = gastosDoMes.reduce((s, g) => s + g.valor, 0)
  const orcamentoTotal = DEMO_ORCAMENTO.total
  const saldoDisponivel = orcamentoTotal - gastoTotal
  const percentualUtilizado = Math.round((gastoTotal / orcamentoTotal) * 100)
  const percentualRestante = 100 - percentualUtilizado
  const alertaSaldo = percentualRestante <= 20

  const mapCat = new Map<string, { nome: string; total: number; count: number }>()
  for (const g of gastosDoMes) {
    const nome = g.categoria?.nome ?? "Sem categoria"
    const atual = mapCat.get(nome) ?? { nome, total: 0, count: 0 }
    mapCat.set(nome, { nome, total: atual.total + g.valor, count: atual.count + 1 })
  }

  const alertas: DashboardData["alertas"] = []
  const semComp = gastosDoMes.filter((g) => g.comprovantes.length === 0)
  if (semComp.length > 0)
    alertas.push({ tipo: "sem_comprovante", mensagem: `${semComp.length} gasto(s) sem comprovante` })

  const cotIncompleta = gastosDoMes.filter((g) => g.cotacoes.length > 0 && g.cotacoes.length < 3)
  if (cotIncompleta.length > 0)
    alertas.push({ tipo: "cotacao_incompleta", mensagem: `${cotIncompleta.length} gasto(s) com cotações incompletas` })

  return {
    orcamentoTotal,
    gastoTotal,
    saldoDisponivel,
    percentualUtilizado,
    alertaSaldo,
    ultimosGastos: gastosDoMes.slice(0, 5),
    gastosPorCategoria: Array.from(mapCat.values()),
    alertas,
  }
}

export function getDemoResumoRelatorio(dataInicio: string, dataFim: string) {
  const gastos = DEMO_GASTOS.filter((g) => g.data >= dataInicio && g.data <= dataFim)
  const totalGastos = gastos.reduce((s, g) => s + g.valor, 0)

  const mapCat = new Map<string, { categoria: string; total: number; count: number }>()
  for (const g of gastos) {
    const nome = g.categoria?.nome ?? "Sem categoria"
    const atual = mapCat.get(nome) ?? { categoria: nome, total: 0, count: 0 }
    mapCat.set(nome, { ...atual, total: atual.total + g.valor, count: atual.count + 1 })
  }

  return {
    gastos,
    resumo: {
      totalGastos,
      totalPorCategoria: Array.from(mapCat.values()),
      numComprovantes: gastos.reduce((s, g) => s + g.comprovantes.length, 0),
      numCotacoes: gastos.reduce((s, g) => s + g.cotacoes.length, 0),
      gastosSemdComprovante: gastos.filter((g) => g.comprovantes.length === 0),
    },
  }
}
