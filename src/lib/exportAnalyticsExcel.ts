import type ExcelJS from "exceljs";
import type { AnalyticsSummary } from "@/lib/analytics";

const THEME = {
  red: "B91C1C",
  darkRed: "7F1D1D",
  yellow: "FACC15",
  green: "16A34A",
  blue: "2563EB",
  orange: "F97316",
  gray: "F3F4F6",
  dark: "111827",
  white: "FFFFFF",
  muted: "6B7280",
  border: "E5E7EB",
};

type RowValue = string | number;
type TableRow = RowValue[];

const headerFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: THEME.red } };
const sectionFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: THEME.darkRed } };
const border = {
  top: { style: "thin" as const, color: { argb: THEME.border } },
  left: { style: "thin" as const, color: { argb: THEME.border } },
  bottom: { style: "thin" as const, color: { argb: THEME.border } },
  right: { style: "thin" as const, color: { argb: THEME.border } },
};

export async function exportAnalyticsExcel(data: AnalyticsSummary) {
  const Excel = await import("exceljs");
  const workbook = new Excel.Workbook();
  workbook.creator = "Fort Alimentos";
  workbook.created = new Date();
  workbook.modified = new Date();

  const totalButtonClicks = data.buttonClicks.whatsapp + data.buttonClicks.instagram + data.buttonClicks.maps;
  const totalProductClicks = data.topProductClicks.reduce((sum, item) => sum + item.count, 0);

  addSummarySheet(workbook, [
    ["Total de visitas", data.totalVisits],
    ["Cliques nos botões", totalButtonClicks],
    ["Cliques em produtos", totalProductClicks],
    ["Cliques no WhatsApp", data.buttonClicks.whatsapp],
    ["Cliques no Instagram", data.buttonClicks.instagram],
    ["Cliques em localização", data.buttonClicks.maps],
  ]);

  addTableSheet(workbook, "Visitas por dia", ["Data", "Visitas"], data.dailyVisits.map((item) => [formatDate(item.date), item.visits]));
  addTableSheet(workbook, "Produtos", ["Produto", "Cliques"], data.topProductClicks.map((item) => [item.name, item.count]));
  addTableSheet(workbook, "Pesquisas", ["Termo pesquisado", "Pesquisas"], data.topSearches.map((item) => [item.term, item.count]));
  addTableSheet(
    workbook,
    "Atividade",
    ["Data e hora", "Tipo", "Detalhe"],
    data.recentEvents.map((event) => [
      new Date(event.time).toLocaleString("pt-BR"),
      getEventTypeName(event.type),
      getEventLabel(event.type, event.data),
    ]),
  );
  addChartsSheet(workbook, data);

  const buffer = await workbook.xlsx.writeBuffer();
  downloadWorkbook(buffer);
}

const addSummarySheet = (workbook: ExcelJS.Workbook, rows: TableRow[]) => {
  const sheet = workbook.addWorksheet("Resumo", { views: [{ showGridLines: false }] });
  addTitle(sheet, "Relatório Fort Alimentos", "Resumo dos acessos, cliques e interações do site.");

  sheet.columns = [
    { width: 32 },
    { width: 16 },
    { width: 4 },
    { width: 32 },
    { width: 16 },
  ];

  rows.forEach(([label, value], index) => {
    const row = 4 + index;
    sheet.getCell(row, 1).value = label;
    sheet.getCell(row, 2).value = value;
    sheet.getCell(row, 1).font = { bold: true, color: { argb: THEME.dark } };
    sheet.getCell(row, 2).font = { bold: true, size: 14, color: { argb: THEME.red } };
    [1, 2].forEach((column) => {
      const cell = sheet.getCell(row, column);
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: index % 2 === 0 ? "FFF7ED" : THEME.gray } };
      cell.border = border;
      cell.alignment = { vertical: "middle" };
    });
  });
};

const addTableSheet = (workbook: ExcelJS.Workbook, title: string, headers: string[], rows: TableRow[]) => {
  const sheet = workbook.addWorksheet(title, { views: [{ showGridLines: false }] });
  addTitle(sheet, title, rows.length ? `${rows.length} registros exportados.` : "Nenhum registro encontrado.");
  sheet.columns = headers.map((header, index) => ({ header, width: index === 0 ? 36 : 18 }));

  const headerRow = sheet.getRow(4);
  headerRow.values = headers;
  styleHeaderRow(headerRow);

  if (rows.length) {
    rows.forEach((row, index) => {
      const sheetRow = sheet.getRow(5 + index);
      sheetRow.values = row;
      styleDataRow(sheetRow, index);
    });
  } else {
    sheet.getCell("A5").value = "Sem dados no período selecionado.";
    sheet.getCell("A5").font = { italic: true, color: { argb: THEME.muted } };
  }

  sheet.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: Math.max(5, rows.length + 4), column: headers.length },
  };
};

const addChartsSheet = (workbook: ExcelJS.Workbook, data: AnalyticsSummary) => {
  const sheet = workbook.addWorksheet("Gráficos", { views: [{ showGridLines: false }] });
  addTitle(sheet, "Gráficos visuais", "Barras coloridas para leitura rápida dentro do Excel.");
  sheet.columns = [
    { width: 34 },
    { width: 12 },
    ...Array.from({ length: 20 }, () => ({ width: 3 })),
  ];

  let nextRow = 4;
  nextRow = addBarSection(sheet, nextRow, "Cliques nos botões", [
    { label: "WhatsApp", value: data.buttonClicks.whatsapp, color: THEME.green },
    { label: "Instagram", value: data.buttonClicks.instagram, color: "DB2777" },
    { label: "Localização", value: data.buttonClicks.maps, color: THEME.blue },
  ]);

  nextRow = addBarSection(
    sheet,
    nextRow + 2,
    "Produtos mais clicados",
    data.topProductClicks.slice(0, 10).map((item) => ({ label: item.name, value: item.count, color: THEME.orange })),
  );

  nextRow = addBarSection(
    sheet,
    nextRow + 2,
    "Termos mais pesquisados",
    data.topSearches.slice(0, 10).map((item) => ({ label: item.term, value: item.count, color: THEME.red })),
  );

  addBarSection(
    sheet,
    nextRow + 2,
    "Visitas por dia",
    data.dailyVisits.slice(-10).map((item) => ({ label: formatDate(item.date), value: item.visits, color: THEME.yellow })),
  );
};

const addBarSection = (
  sheet: ExcelJS.Worksheet,
  startRow: number,
  title: string,
  items: { label: string; value: number; color: string }[],
) => {
  sheet.mergeCells(startRow, 1, startRow, 22);
  const titleCell = sheet.getCell(startRow, 1);
  titleCell.value = title;
  titleCell.fill = sectionFill;
  titleCell.font = { bold: true, color: { argb: THEME.white } };
  titleCell.alignment = { vertical: "middle" };

  const maxValue = Math.max(...items.map((item) => item.value), 1);
  if (!items.length) {
    sheet.getCell(startRow + 1, 1).value = "Sem dados para exibir.";
    sheet.getCell(startRow + 1, 1).font = { italic: true, color: { argb: THEME.muted } };
    return startRow + 2;
  }

  items.forEach((item, index) => {
    const row = startRow + index + 1;
    const barSize = Math.max(1, Math.round((item.value / maxValue) * 20));
    sheet.getCell(row, 1).value = item.label;
    sheet.getCell(row, 2).value = item.value;
    sheet.getCell(row, 1).alignment = { vertical: "middle" };
    sheet.getCell(row, 2).alignment = { vertical: "middle", horizontal: "center" };
    sheet.getCell(row, 1).border = border;
    sheet.getCell(row, 2).border = border;

    for (let column = 3; column <= 22; column += 1) {
      const cell = sheet.getCell(row, column);
      cell.value = "";
      cell.border = border;
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: column - 2 <= barSize ? item.color : THEME.gray },
      };
    }
  });

  return startRow + items.length + 1;
};

const addTitle = (sheet: ExcelJS.Worksheet, title: string, subtitle: string) => {
  sheet.mergeCells("A1:E1");
  sheet.mergeCells("A2:E2");
  sheet.getCell("A1").value = title;
  sheet.getCell("A1").font = { bold: true, size: 18, color: { argb: THEME.white } };
  sheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: THEME.red } };
  sheet.getCell("A1").alignment = { vertical: "middle" };
  sheet.getCell("A2").value = subtitle;
  sheet.getCell("A2").font = { color: { argb: THEME.muted } };
};

const styleHeaderRow = (row: ExcelJS.Row) => {
  row.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = { bold: true, color: { argb: THEME.white } };
    cell.border = border;
    cell.alignment = { vertical: "middle" };
  });
};

const styleDataRow = (row: ExcelJS.Row, index: number) => {
  row.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: index % 2 === 0 ? "FFFFFF" : THEME.gray } };
    cell.border = border;
    cell.alignment = { vertical: "middle" };
  });
};

const formatDate = (value: string) => {
  const [year, month, day] = value.split("-");
  return day && month && year ? `${day}/${month}/${year}` : value;
};

const getEventTypeName = (type: string) => {
  switch (type) {
    case "page_view": return "Visita";
    case "button_click": return "Clique em botão";
    case "product_click": return "Clique em produto";
    case "product_search": return "Pesquisa";
    default: return type;
  }
};

const getEventLabel = (type: string, data: Record<string, unknown> | null) => {
  switch (type) {
    case "page_view": return `Visita na página ${String(data?.path || "/")}`;
    case "button_click": return `Clique no botão ${String(data?.button || "")}`;
    case "product_click": return `Clicou em "${String(data?.product_name || "")}"`;
    case "product_search": return `Pesquisou "${String(data?.term || "")}"`;
    default: return type;
  }
};

const downloadWorkbook = (buffer: ExcelJS.Buffer) => {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `relatorios-fort-alimentos-${new Date().toISOString().slice(0, 10)}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
};
