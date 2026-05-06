import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor)
}

export function formatarData(data: string): string {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(data + "T00:00:00"))
}

export function formatarDataHora(data: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(data))
}

export function calcularPercentual(parte: number, total: number): number {
  if (total === 0) return 0
  return Math.round((parte / total) * 100)
}

export function getCorSaldo(percentualRestante: number): string {
  if (percentualRestante <= 0) return "text-red-600"
  if (percentualRestante <= 20) return "text-orange-500"
  if (percentualRestante <= 40) return "text-yellow-500"
  return "text-emerald-600"
}

export function getBgCorSaldo(percentualRestante: number): string {
  if (percentualRestante <= 0) return "bg-red-50 border-red-200"
  if (percentualRestante <= 20) return "bg-orange-50 border-orange-200"
  if (percentualRestante <= 40) return "bg-yellow-50 border-yellow-200"
  return "bg-emerald-50 border-emerald-200"
}

export function dataParaISO(data: string): string {
  return data.split("/").reverse().join("-")
}

export function isoParaData(iso: string): string {
  return iso.split("-").reverse().join("/")
}

export function periodoAtual(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

export const CORES_CATEGORIAS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
]
