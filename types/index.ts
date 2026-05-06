export type Perfil = "pesquisador" | "gestor" | "coordenador"

export interface Usuario {
  id: string
  nome: string
  email: string
  perfil: Perfil
  criado_em: string
}

export interface Categoria {
  id: string
  nome: string
  criado_em: string
}

export interface Orcamento {
  id: string
  total: number
  periodo: string
  criado_em: string
}

export type TipoComprovante = "pdf" | "jpg" | "png"
export type StatusComprovante = "comprovado" | "pendente"

export interface Comprovante {
  id: string
  gasto_id: string
  arquivo: string
  tipo: TipoComprovante
  criado_em: string
}

export interface Cotacao {
  id: string
  gasto_id: string
  fornecedor: string
  valor: number
  data_cotacao: string
  prazo: string | null
  observacoes: string | null
  arquivo: string | null
  aprovada: boolean
  criado_em: string
}

export interface Gasto {
  id: string
  data: string
  descricao: string
  valor: number
  categoria_id: string
  responsavel_id: string
  bloqueado: boolean
  criado_em: string
  categoria?: Categoria
  responsavel?: Usuario
  comprovantes?: Comprovante[]
  cotacoes?: Cotacao[]
}

export interface GastoComRelacoes extends Gasto {
  categoria: Categoria
  responsavel: Usuario
  comprovantes: Comprovante[]
  cotacoes: Cotacao[]
}

export interface LogExportacao {
  id: string
  usuario_id: string
  periodo_inicio: string
  periodo_fim: string
  formato: "pdf" | "xlsx"
  criado_em: string
}

export interface DashboardData {
  orcamentoTotal: number
  gastoTotal: number
  saldoDisponivel: number
  percentualUtilizado: number
  alertaSaldo: boolean
  ultimosGastos: GastoComRelacoes[]
  gastosPorCategoria: { nome: string; total: number; count: number }[]
  alertas: Alerta[]
}

export interface Alerta {
  tipo: "saldo_critico" | "sem_comprovante" | "cotacao_incompleta" | "orcamento_excedido"
  mensagem: string
  gastoId?: string
}

export interface FiltrosGasto {
  categoriaId?: string
  responsavelId?: string
  dataInicio?: string
  dataFim?: string
  statusComprovante?: "comprovado" | "pendente"
  statusCotacao?: "completa" | "incompleta"
}

export interface RelatorioFiltros {
  dataInicio: string
  dataFim: string
  categoriaId?: string
  responsavelId?: string
}

export interface ResumoRelatorio {
  totalGastos: number
  totalPorCategoria: { categoria: string; total: number; count: number }[]
  numComprovantes: number
  numCotacoes: number
  gastosSemdComprovante: GastoComRelacoes[]
}
