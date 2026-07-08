import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Cliente {
  nome: string;
}
interface Obra {
  centroCusto: string;
  tipo: string;
  status: string;
  inicio: string;
  previsaoFim: string;
  contrato: number;
  orcamentoMat: number;
  orcamentoMO: number;
  gastoMat: number;
  gastoMO: number;
  gastoEsporadico: number;
  cliente: Cliente;
}
interface Material {
  nome: string;
  orcado: number;
  utilizado: number;
}
interface Pagamento {
  diarista: { nome: string; funcao: string };
  diasTrab: number;
  valorDia: number;
  total: number;
  status: string;
}
interface Gasto {
  descricao: string;
  justificativa: string;
  valor: number;
  data: string;
}
interface Lancamento {
  descricao: string;
  tipo: string;
  categoria: string;
  valor: number;
  data: string;
}

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR");
}

export async function gerarRelatorioPDF(
  obra: Obra,
  materiais: Material[],
  pagamentos: Pagamento[],
  gastos: Gasto[],
  lancamentos: Lancamento[],
) {
  const doc = new jsPDF();
  const azul = "#185FA5";
  const cinza = "#888888";
  const pageW = doc.internal.pageSize.getWidth();

  // ── CABEÇALHO ──────────────────────────────────────────
  doc.setFillColor(24, 95, 165);
  doc.rect(0, 0, pageW, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Engetech Soluções LTDA", 14, 12);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Relatório de Obra — Gestão e Controle", 14, 20);

  doc.setFontSize(9);
  doc.text(
    `Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
    pageW - 14,
    20,
    { align: "right" },
  );

  // ── IDENTIFICAÇÃO DA OBRA ───────────────────────────────
  let y = 36;

  doc.setTextColor(24, 95, 165);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(`${obra.centroCusto} — ${obra.cliente?.nome}`, 14, y);
  y += 7;

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Tipo: ${obra.tipo}  |  Status: ${obra.status}  |  Início: ${formatDate(obra.inicio)}  |  Entrega: ${formatDate(obra.previsaoFim)}`,
    14,
    y,
  );
  y += 10;

  // ── RESUMO FINANCEIRO ───────────────────────────────────
  const gastoTotal = obra.gastoMat + obra.gastoMO + obra.gastoEsporadico;
  const margem =
    obra.contrato > 0
      ? (((obra.contrato - gastoTotal) / obra.contrato) * 100).toFixed(1)
      : "0";
  const resultado = obra.contrato - gastoTotal;

  doc.setTextColor(24, 95, 165);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo Financeiro", 14, y);
  y += 6;

  // Cards de resumo
  const cards = [
    {
      label: "Contrato",
      value: formatMoney(obra.contrato),
      color: [24, 95, 165],
    },
    {
      label: "Total gasto",
      value: formatMoney(gastoTotal),
      color: [226, 75, 74],
    },
    {
      label: "Margem",
      value: `${margem}%`,
      color: Number(margem) >= 30 ? [29, 158, 117] : [186, 117, 23],
    },
    {
      label: "Resultado est.",
      value: formatMoney(resultado),
      color: resultado >= 0 ? [29, 158, 117] : [226, 75, 74],
    },
  ];

  const cardW = (pageW - 28 - 9) / 4;
  cards.forEach((card, i) => {
    const x = 14 + i * (cardW + 3);
    doc.setFillColor(248, 248, 246);
    doc.roundedRect(x, y, cardW, 18, 2, 2, "F");
    doc.setTextColor(136, 136, 136);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(card.label.toUpperCase(), x + 4, y + 6);
    doc.setTextColor(...(card.color as [number, number, number]));
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(card.value, x + 4, y + 14);
  });
  y += 26;

  // Detalhamento dos gastos
  autoTable(doc, {
    startY: y,
    head: [["Categoria", "Orçado", "Realizado", "Saldo"]],
    body: [
      [
        "Materiais",
        formatMoney(obra.orcamentoMat),
        formatMoney(obra.gastoMat),
        formatMoney(obra.orcamentoMat - obra.gastoMat),
      ],
      [
        "Mão de Obra",
        formatMoney(obra.orcamentoMO),
        formatMoney(obra.gastoMO),
        formatMoney(obra.orcamentoMO - obra.gastoMO),
      ],
      [
        "Esporádicos",
        "—",
        formatMoney(obra.gastoEsporadico),
        `—${formatMoney(obra.gastoEsporadico)}`,
      ],
      [
        "TOTAL",
        formatMoney(obra.orcamentoMat + obra.orcamentoMO),
        formatMoney(gastoTotal),
        formatMoney(obra.orcamentoMat + obra.orcamentoMO - gastoTotal),
      ],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [24, 95, 165],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: { textColor: [50, 50, 50] },
    alternateRowStyles: { fillColor: [248, 248, 246] },
    columnStyles: { 0: { fontStyle: "bold" } },
    didParseCell: (data) => {
      if (data.row.index === 3) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [235, 244, 255];
      }
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ── MATERIAIS ───────────────────────────────────────────
  if (materiais.length > 0) {
    doc.setTextColor(24, 95, 165);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Controle de Materiais", 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["Material", "Orçado", "Utilizado", "Saldo", "Status"]],
      body: materiais.map((m) => {
        const saldo = m.orcado - m.utilizado;
        const status =
          saldo < 0 ? "Estourado" : saldo < m.orcado * 0.15 ? "Atenção" : "Ok";
        return [
          m.nome,
          formatMoney(m.orcado),
          formatMoney(m.utilizado),
          formatMoney(saldo),
          status,
        ];
      }),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: [24, 95, 165],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      alternateRowStyles: { fillColor: [248, 248, 246] },
      didParseCell: (data) => {
        if (data.column.index === 4 && data.section === "body") {
          const v = data.cell.raw as string;
          if (v === "Estourado") data.cell.styles.textColor = [226, 75, 74];
          else if (v === "Atenção") data.cell.styles.textColor = [186, 117, 23];
          else data.cell.styles.textColor = [29, 158, 117];
        }
        if (data.column.index === 3 && data.section === "body") {
          const v = data.cell.text[0];
          if (v.startsWith("-")) data.cell.styles.textColor = [226, 75, 74];
          else data.cell.styles.textColor = [29, 158, 117];
        }
      },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ── DIARISTAS E PAGAMENTOS ──────────────────────────────
  if (pagamentos.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(24, 95, 165);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Mão de Obra — Diaristas", 14, y);
    y += 4;

    const totalPago = pagamentos
      .filter((p) => p.status === "pago")
      .reduce((a, p) => a + p.total, 0);
    const totalPendente = pagamentos
      .filter((p) => p.status === "pendente")
      .reduce((a, p) => a + p.total, 0);

    autoTable(doc, {
      startY: y,
      head: [["Diarista", "Função", "Dias", "Valor/dia", "Total", "Status"]],
      body: [
        ...pagamentos.map((p) => [
          p.diarista?.nome || "—",
          p.diarista?.funcao || "—",
          String(p.diasTrab),
          formatMoney(p.valorDia),
          formatMoney(p.total),
          p.status,
        ]),
        ["", "", "", "Pago:", formatMoney(totalPago), ""],
        ["", "", "", "Pendente:", formatMoney(totalPendente), ""],
      ],
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: [24, 95, 165],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      alternateRowStyles: { fillColor: [248, 248, 246] },
      didParseCell: (data) => {
        const total = pagamentos.length;
        if (data.row.index >= total) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [235, 244, 255];
        }
        if (
          data.column.index === 5 &&
          data.section === "body" &&
          data.row.index < total
        ) {
          data.cell.styles.textColor =
            data.cell.raw === "pago" ? [29, 158, 117] : [186, 117, 23];
        }
      },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ── GASTOS ESPORÁDICOS ──────────────────────────────────
  if (gastos.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(24, 95, 165);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Gastos Esporádicos", 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["Data", "Descrição", "Justificativa", "Valor"]],
      body: gastos.map((g) => [
        formatDate(g.data),
        g.descricao,
        g.justificativa,
        formatMoney(g.valor),
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: [226, 75, 74],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      alternateRowStyles: { fillColor: [253, 235, 235] },
      columnStyles: { 3: { textColor: [226, 75, 74], fontStyle: "bold" } },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ── LANÇAMENTOS FINANCEIROS ─────────────────────────────
  if (lancamentos.length > 0) {
    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(24, 95, 165);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Lançamentos Financeiros", 14, y);
    y += 4;

    const entradas = lancamentos
      .filter((l) => l.tipo === "entrada")
      .reduce((a, l) => a + l.valor, 0);
    const saidas = lancamentos
      .filter((l) => l.tipo === "saida")
      .reduce((a, l) => a + l.valor, 0);

    autoTable(doc, {
      startY: y,
      head: [["Data", "Descrição", "Categoria", "Tipo", "Valor"]],
      body: [
        ...lancamentos.map((l) => [
          formatDate(l.data),
          l.descricao,
          l.categoria.replace("_", " "),
          l.tipo,
          `${l.tipo === "entrada" ? "+" : "-"}${formatMoney(l.valor)}`,
        ]),
        ["", "", "", "Entradas:", formatMoney(entradas)],
        ["", "", "", "Saídas:", formatMoney(saidas)],
        ["", "", "", "Saldo:", formatMoney(entradas - saidas)],
      ],
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: [24, 95, 165],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      alternateRowStyles: { fillColor: [248, 248, 246] },
      didParseCell: (data) => {
        const total = lancamentos.length;
        if (data.row.index >= total) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [235, 244, 255];
        }
        if (
          data.column.index === 3 &&
          data.section === "body" &&
          data.row.index < total
        ) {
          data.cell.styles.textColor =
            data.cell.raw === "entrada" ? [29, 158, 117] : [226, 75, 74];
        }
        if (
          data.column.index === 4 &&
          data.section === "body" &&
          data.row.index < total
        ) {
          const v = data.cell.text[0];
          data.cell.styles.textColor = v.startsWith("+")
            ? [29, 158, 117]
            : [226, 75, 74];
        }
      },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ── RODAPÉ ──────────────────────────────────────────────
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFillColor(248, 248, 246);
    doc.rect(0, pageH - 14, pageW, 14, "F");
    doc.setTextColor(136, 136, 136);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Engetech Soluções LTDA — Sistema de Gestão de Obras",
      14,
      pageH - 5,
    );
    doc.text(`Página ${i} de ${pageCount}`, pageW - 14, pageH - 5, {
      align: "right",
    });
  }

  // ── DOWNLOAD ────────────────────────────────────────────
  const nomeArquivo = `Relatorio_${obra.centroCusto}_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`;
  doc.save(nomeArquivo);
}
