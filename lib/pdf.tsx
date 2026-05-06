import React from "react"
import {
  Document, Page, Text, View, StyleSheet, Font
} from "@react-pdf/renderer"
import type { GastoComRelacoes } from "@/types"
import { formatarMoeda, formatarData } from "@/lib/utils"

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#1e293b" },
  capa: { marginBottom: 30 },
  titulo: { fontSize: 22, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subtitulo: { fontSize: 12, color: "#64748b", marginBottom: 2 },
  secao: { marginBottom: 20 },
  secaoTitulo: { fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  row: { flexDirection: "row", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  colData: { width: "10%" },
  colDesc: { width: "30%" },
  colCat: { width: "15%" },
  colResp: { width: "15%" },
  colValor: { width: "12%", textAlign: "right" },
  colComp: { width: "9%" },
  colCot: { width: "9%" },
  header: { fontFamily: "Helvetica-Bold", backgroundColor: "#f8fafc", paddingVertical: 6 },
  total: { fontFamily: "Helvetica-Bold", backgroundColor: "#f1f5f9", paddingVertical: 6 },
  resumoRow: { flexDirection: "row", paddingVertical: 4 },
  resumoLabel: { width: "40%", color: "#64748b" },
  resumoValor: { fontFamily: "Helvetica-Bold" },
  badge: { backgroundColor: "#dcfce7", color: "#166534", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, fontSize: 8 },
  badgeWarning: { backgroundColor: "#fef3c7", color: "#92400e", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, fontSize: 8 },
})

interface Props {
  gastos: GastoComRelacoes[]
  periodo: { inicio: string; fim: string }
  orcamentoTotal?: number
}

export function RelatorioPDF({ gastos, periodo, orcamentoTotal = 0 }: Props) {
  const total = gastos.reduce((s, g) => s + g.valor, 0)
  const saldo = orcamentoTotal - total

  const porCategoria = gastos.reduce((acc, g) => {
    const nome = g.categoria?.nome ?? "Sem categoria"
    acc[nome] = (acc[nome] ?? 0) + g.valor
    return acc
  }, {} as Record<string, number>)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.capa}>
          <Text style={styles.titulo}>Prestação de Contas</Text>
          <Text style={styles.subtitulo}>Laboratório Atrivm — CRM Financeiro</Text>
          <Text style={styles.subtitulo}>
            Período: {formatarData(periodo.inicio)} a {formatarData(periodo.fim)}
          </Text>
          <Text style={{ ...styles.subtitulo, marginTop: 4 }}>
            Gerado em: {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR")}
          </Text>
        </View>

        {/* Sumário financeiro */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Sumário Financeiro</Text>
          {orcamentoTotal > 0 && (
            <View style={styles.resumoRow}>
              <Text style={styles.resumoLabel}>Orçamento total:</Text>
              <Text style={styles.resumoValor}>{formatarMoeda(orcamentoTotal)}</Text>
            </View>
          )}
          <View style={styles.resumoRow}>
            <Text style={styles.resumoLabel}>Total de gastos:</Text>
            <Text style={styles.resumoValor}>{formatarMoeda(total)}</Text>
          </View>
          {orcamentoTotal > 0 && (
            <View style={styles.resumoRow}>
              <Text style={styles.resumoLabel}>Saldo disponível:</Text>
              <Text style={styles.resumoValor}>{formatarMoeda(saldo)}</Text>
            </View>
          )}
          <View style={styles.resumoRow}>
            <Text style={styles.resumoLabel}>Nº de registros:</Text>
            <Text style={styles.resumoValor}>{gastos.length}</Text>
          </View>
        </View>

        {/* Por categoria */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Gastos por Categoria</Text>
          {Object.entries(porCategoria).map(([nome, valor]) => (
            <View key={nome} style={styles.resumoRow}>
              <Text style={styles.resumoLabel}>{nome}:</Text>
              <Text style={styles.resumoValor}>{formatarMoeda(valor)}</Text>
            </View>
          ))}
        </View>

        {/* Tabela de gastos */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Detalhamento de Gastos</Text>
          <View style={{ ...styles.row, ...styles.header }}>
            <Text style={styles.colData}>Data</Text>
            <Text style={styles.colDesc}>Descrição</Text>
            <Text style={styles.colCat}>Categoria</Text>
            <Text style={styles.colResp}>Responsável</Text>
            <Text style={styles.colValor}>Valor</Text>
            <Text style={styles.colComp}>Comp.</Text>
            <Text style={styles.colCot}>Cot.</Text>
          </View>

          {gastos.map((g) => (
            <View key={g.id} style={styles.row}>
              <Text style={styles.colData}>{formatarData(g.data)}</Text>
              <Text style={styles.colDesc}>{g.descricao}</Text>
              <Text style={styles.colCat}>{g.categoria?.nome ?? "—"}</Text>
              <Text style={styles.colResp}>{g.responsavel?.nome ?? "—"}</Text>
              <Text style={styles.colValor}>{formatarMoeda(g.valor)}</Text>
              <Text style={styles.colComp}>{g.comprovantes.length > 0 ? "✓" : "⚠"}</Text>
              <Text style={styles.colCot}>{g.cotacoes.length}/3</Text>
            </View>
          ))}

          <View style={{ ...styles.row, ...styles.total }}>
            <Text style={{ ...styles.colData }}></Text>
            <Text style={{ ...styles.colDesc }}>TOTAL</Text>
            <Text style={{ ...styles.colCat }}></Text>
            <Text style={{ ...styles.colResp }}></Text>
            <Text style={{ ...styles.colValor }}>{formatarMoeda(total)}</Text>
            <Text style={{ ...styles.colComp }}></Text>
            <Text style={{ ...styles.colCot }}></Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
