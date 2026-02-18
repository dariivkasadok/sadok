import { useState } from "react";
import robotoRegularUrl from "@/assets/fonts/Roboto-Regular.ttf";
import robotoBoldUrl from "@/assets/fonts/Roboto-Bold.ttf";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, FileSpreadsheet, FileText, File } from "lucide-react";
import type { DbChildWithGroup } from "@/types/database";

interface ExportReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DbChildWithGroup[];
  columns: { key: string; label: string }[];
  title: string;
  getCellValue: (child: DbChildWithGroup, columnKey: string, rowIndex: number) => string;
}

const exportFormats = [
  { value: "excel", label: "Excel (.xlsx)", icon: FileSpreadsheet },
  { value: "word", label: "Word (.docx)", icon: FileText },
  { value: "pdf", label: "PDF (.pdf)", icon: File },
];

const ExportReportModal = ({ open, onOpenChange, data, columns, title, getCellValue }: ExportReportModalProps) => {
  const [format, setFormat] = useState("excel");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [exporting, setExporting] = useState(false);

  const reportTitle = title || "Звіт";

  const handleExport = async () => {
    setExporting(true);
    try {
      const headers = columns.map((c) => c.label);
      const rows = data.map((child, i) => columns.map((col) => getCellValue(child, col.key, i)));

      if (format === "excel") {
        await exportExcel(headers, rows, reportTitle, orientation);
      } else if (format === "word") {
        await exportWord(headers, rows, reportTitle, orientation);
      } else if (format === "pdf") {
        await exportPdf(headers, rows, reportTitle, orientation);
      }
      onOpenChange(false);
    } catch (e) {
      console.error("Export error:", e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Експорт звіту
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Label className="text-sm font-semibold">Оберіть формат файлу</Label>
          <RadioGroup value={format} onValueChange={setFormat} className="space-y-3">
            {exportFormats.map((f) => (
              <label
                key={f.value}
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary/5"
              >
                <RadioGroupItem value={f.value} />
                <f.icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{f.label}</span>
              </label>
            ))}
          </RadioGroup>

          <Label className="text-sm font-semibold">Орієнтація сторінки</Label>
          <RadioGroup value={orientation} onValueChange={(v) => setOrientation(v as "portrait" | "landscape")} className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition-colors hover:bg-accent has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary/5">
              <RadioGroupItem value="portrait" />
              <span className="text-sm font-medium">Книжна</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition-colors hover:bg-accent has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary/5">
              <RadioGroupItem value="landscape" />
              <span className="text-sm font-medium">Альбомна</span>
            </label>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Скасувати</Button>
          <Button onClick={handleExport} disabled={exporting} className="gap-2">
            <Download className="h-4 w-4" />
            {exporting ? "Експорт..." : "Завантажити"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const mimeTypes: Record<string, string> = {
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
};

async function saveWithPicker(blob: Blob, filename: string, ext: string) {
  if ("showSaveFilePicker" in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: ext.toUpperCase(),
            accept: { [mimeTypes[ext] || "application/octet-stream"]: [`.${ext}`] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (e: any) {
      if (e.name === "AbortError") throw e;
    }
  }
  const { saveAs } = await import("file-saver");
  saveAs(blob, filename);
}

async function exportExcel(headers: string[], rows: string[][], title: string, orientation: "portrait" | "landscape") {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.aoa_to_sheet([[title], [], headers, ...rows]);
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Звіт");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: mimeTypes.xlsx });
  await saveWithPicker(blob, `${title}.xlsx`, "xlsx");
}

async function exportWord(headers: string[], rows: string[][], title: string, orientation: "portrait" | "landscape") {
  const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun, AlignmentType, BorderStyle } = await import("docx");
  const borderStyle = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
  const borders = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle };
  const headerRow = new TableRow({
    children: headers.map((h) => new TableCell({ borders, children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20 })] })] })),
  });
  const dataRows = rows.map((row) => new TableRow({
    children: row.map((cell) => new TableCell({ borders, children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20 })] })] })),
  }));
  const pageOrientation = orientation === "landscape" ? "landscape" : undefined;
  const doc = new Document({
    sections: [{
      properties: pageOrientation ? { page: { size: { orientation: pageOrientation as any } } } : {},
      children: [
        new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 28 })], alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
        new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...dataRows] }),
      ],
    }],
  });
  const blob = await Packer.toBlob(doc);
  await saveWithPicker(blob, `${title}.docx`, "docx");
}

async function loadFontAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function exportPdf(headers: string[], rows: string[][], title: string, orientation: "portrait" | "landscape") {
  const { default: jsPDF } = await import("jspdf");
  const autoTableModule = await import("jspdf-autotable");
  const autoTable = autoTableModule.default;
  const doc = new jsPDF({ orientation });
  const [regularBase64, boldBase64] = await Promise.all([loadFontAsBase64(robotoRegularUrl), loadFontAsBase64(robotoBoldUrl)]);
  doc.addFileToVFS("Roboto-Regular.ttf", regularBase64);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.addFileToVFS("Roboto-Bold.ttf", boldBase64);
  doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
  doc.setFont("Roboto", "bold");
  doc.setFontSize(14);
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 25,
    styles: { fontSize: 8, font: "Roboto" },
    headStyles: { fillColor: [59, 130, 246], fontStyle: "bold" },
    bodyStyles: { fontStyle: "normal" },
  });
  const blob = doc.output("blob");
  await saveWithPicker(blob, `${title}.pdf`, "pdf");
}

export default ExportReportModal;
