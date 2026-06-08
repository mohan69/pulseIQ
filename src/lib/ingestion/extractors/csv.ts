export function extractCsv(buffer: Buffer): string {
  const text = buffer.toString("utf8").replace(/\u0000/g, "").trim();
  const lines = text.split(/\r?\n/);
  if (lines.length <= 1) return text;

  const [header, ...rows] = lines;
  return [
    `CSV headers: ${header}`,
    ...rows.map((row, index) => `Row ${index + 1}: ${row}`),
  ].join("\n");
}
