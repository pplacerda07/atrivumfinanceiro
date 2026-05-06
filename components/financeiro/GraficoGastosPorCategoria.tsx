"use client"
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"
import { formatarMoeda, CORES_CATEGORIAS } from "@/lib/utils"

interface GraficoProps {
  dados: { nome: string; total: number; count: number }[]
  tipo?: "pizza" | "barras"
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-3 shadow-sm text-sm">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-muted-foreground">{formatarMoeda(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export function GraficoGastosPorCategoria({ dados, tipo = "pizza" }: GraficoProps) {
  if (dados.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        Nenhum dado disponível para o período
      </div>
    )
  }

  if (tipo === "pizza") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={dados}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={110}
            paddingAngle={3}
            dataKey="total"
            nameKey="nome"
          >
            {dados.map((_, index) => (
              <Cell key={index} fill={CORES_CATEGORIAS[index % CORES_CATEGORIAS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => <span className="text-xs">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={dados} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="total" name="Total" radius={[4, 4, 0, 0]}>
          {dados.map((_, index) => (
            <Cell key={index} fill={CORES_CATEGORIAS[index % CORES_CATEGORIAS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
