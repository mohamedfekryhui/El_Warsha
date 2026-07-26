/**
 * Pure-JS Real Excel export using Microsoft XMLSS format.
 * Produces a genuine .xls file that Excel opens natively with proper
 * Arabic RTL support, bold headers, and column auto-width hints.
 *
 * @param {string[][]} rows  - 2D array: first row = headers, rest = data
 * @param {string} filename  - Output filename without extension
 */
export function exportToExcel(rows, filename = "export") {
  if (!rows || rows.length === 0) return;

  const escapeXml = (val) => {
    const s = val == null ? "" : String(val);
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  const cellType = (val) => {
    if (val === null || val === undefined || val === "") return "String";
    if (typeof val === "number" || (!isNaN(val) && val !== "")) return "Number";
    return "String";
  };

  const headers = rows[0];
  const dataRows = rows.slice(1);

  // Build column widths based on max content length
  const colWidths = headers.map((h, ci) => {
    const maxLen = Math.max(
      String(h).length,
      ...dataRows.map((r) => String(r[ci] ?? "").length)
    );
    return Math.min(Math.max(maxLen * 7, 60), 300); // px approximation
  });

  const headerCells = headers
    .map(
      (h) =>
        `<Cell ss:StyleID="header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`
    )
    .join("");

  const bodyRowsXml = dataRows
    .map((row) => {
      const cells = row
        .map((val) => {
          const type = cellType(val);
          return `<Cell ss:StyleID="data"><Data ss:Type="${type}">${escapeXml(val)}</Data></Cell>`;
        })
        .join("");
      return `<Row>${cells}</Row>`;
    })
    .join("");

  const columnsXml = colWidths
    .map((w) => `<Column ss:Width="${w}"/>`)
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook
  xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:x="urn:schemas-microsoft-com:office:excel">
  <ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">
    <WindowHeight>9000</WindowHeight>
    <WindowWidth>14400</WindowWidth>
    <ActiveSheet>0</ActiveSheet>
  </ExcelWorkbook>
  <Styles>
    <Style ss:ID="header">
      <Font ss:Bold="1" ss:Size="11" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#1E40AF" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:ReadingOrder="RightToLeft"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#93C5FD"/>
      </Borders>
    </Style>
    <Style ss:ID="data">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:ReadingOrder="RightToLeft"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
    </Style>
  </Styles>
  <Worksheet ss:Name="البيانات">
    <Table ss:DefaultRowHeight="20">
      ${columnsXml}
      <Row ss:Height="24">${headerCells}</Row>
      ${bodyRowsXml}
    </Table>
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <Selected/>
      <FreezePanes/>
      <FrozenNoSplit/>
      <SplitHorizontal>1</SplitHorizontal>
      <TopRowBottomPane>1</TopRowBottomPane>
      <ActivePane>2</ActivePane>
      <DisplayRightToLeft/>
    </WorksheetOptions>
  </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
