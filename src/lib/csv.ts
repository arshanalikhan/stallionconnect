/** Quotes a CSV cell and neutralises spreadsheet formula injection. */
function cell(value: unknown) {
  let s = String(value ?? "");
  // Phone numbers like "+91 98765 43210" are safe; other leading + or - may be a formula.
  const isPhone = /^[+-][\d\s()-]*$/.test(s);
  if (/^[=+\-@\t\r]/.test(s) && !isPhone) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/** Rows to CSV (with a BOM so Excel reads UTF-8). Date, status, source first. */
export function toCsv(rows: Record<string, unknown>[]) {
  const first = ["createdAt", "status", "source", "note"];
  const headers = rows[0]
    ? [...first, ...Object.keys(rows[0]).filter((k) => !first.includes(k) && k !== "id"), "id"]
    : first;
  const lines = [
    headers.map(cell).join(","),
    ...rows.map((r) => headers.map((h) => cell(r[h])).join(",")),
  ];
  return "﻿" + lines.join("\r\n");
}

export const csvFilename = (kind: string) =>
  `stallion-${kind}-${new Date().toISOString().slice(0, 10)}.csv`;
