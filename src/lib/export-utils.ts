import * as XLSX from "xlsx";

export type Column<T> = { header: string; value: (row: T) => string | number | null | undefined };

function cell(v: string | number | null | undefined) {
  if (v === null || v === undefined) return "";
  return typeof v === "number" ? v : String(v);
}

export function toRows<T>(rows: T[], columns: Column<T>[]) {
  return rows.map((r) => Object.fromEntries(columns.map((c) => [c.header, cell(c.value(r))])));
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCsv<T>(filename: string, rows: T[], columns: Column<T>[]) {
  const esc = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const lines = [
    columns.map((c) => esc(c.header)).join(","),
    ...rows.map((r) => columns.map((c) => esc(String(cell(c.value(r))))).join(",")),
  ];
  download(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }), `${filename}.csv`);
}

export function exportXlsx<T>(filename: string, sheetName: string, rows: T[], columns: Column<T>[]) {
  const ws = XLSX.utils.json_to_sheet(toRows(rows, columns), { header: columns.map((c) => c.header) });
  ws["!cols"] = columns.map((c) => ({ wch: Math.min(40, Math.max(12, c.header.length + 6)) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 30) || "Sheet1");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  download(
    new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `${filename}.xlsx`,
  );
}
