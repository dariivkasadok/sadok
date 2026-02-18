import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings2 } from "lucide-react";

export interface ReportColumn {
  key: string;
  label: string;
}

export const availableColumns: ReportColumn[] = [
  { key: "index", label: "№ з/п" },
  { key: "fullName", label: "ПІБ дитини" },
  { key: "birthDate", label: "Дата народження" },
  { key: "address", label: "Адреса проживання" },
  { key: "group", label: "Група" },
  { key: "gender", label: "Стать" },
  { key: "status", label: "Статус" },
  { key: "socialStatus", label: "Соціальний статус" },
  { key: "warStatus", label: "Статус пов'язаний з війною" },
  { key: "territorialStatus", label: "Територіальне перебування" },
  { key: "parentFullName", label: "ПІБ батьків" },
  { key: "parentPhone", label: "Телефон батьків" },
];

export interface ReportSettings {
  title: string;
  columns: string[]; // array of column keys
}

const defaultSettings: ReportSettings = {
  title: "",
  columns: ["fullName", "birthDate", "address", "parentFullName", "parentPhone"],
};

interface ReportSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ReportSettings;
  onSave: (settings: ReportSettings) => void;
}

const ReportSettingsModal = ({ open, onOpenChange, settings, onSave }: ReportSettingsModalProps) => {
  const [title, setTitle] = useState(settings.title);
  const [columnCount, setColumnCount] = useState(String(settings.columns.length));
  const [selectedColumns, setSelectedColumns] = useState<string[]>(settings.columns);

  useEffect(() => {
    setTitle(settings.title);
    setColumnCount(String(settings.columns.length));
    setSelectedColumns([...settings.columns]);
  }, [settings, open]);

  const handleColumnCountChange = (value: string) => {
    const count = parseInt(value);
    setColumnCount(value);
    if (count > selectedColumns.length) {
      // Add empty slots
      setSelectedColumns([...selectedColumns, ...Array(count - selectedColumns.length).fill("")]);
    } else {
      // Trim
      setSelectedColumns(selectedColumns.slice(0, count));
    }
  };

  const handleColumnChange = (index: number, value: string) => {
    const updated = [...selectedColumns];
    updated[index] = value;
    setSelectedColumns(updated);
  };

  const handleSave = () => {
    const validColumns = selectedColumns.filter((c) => c !== "");
    onSave({ title, columns: validColumns.length > 0 ? validColumns : defaultSettings.columns });
    onOpenChange(false);
  };

  // Get already selected keys excluding current index
  const getUsedKeys = (currentIndex: number) => {
    return selectedColumns.filter((_, i) => i !== currentIndex);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Settings2 className="h-5 w-5" />
            Параметри звіту
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Report title */}
          <div className="space-y-1.5">
            <Label>Заголовок звіту</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введіть заголовок звіту"
            />
          </div>

          {/* Column count */}
          <div className="space-y-1.5">
            <Label>Кількість колонок</Label>
            <Select value={columnCount} onValueChange={handleColumnCountChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: availableColumns.length }, (_, i) => i + 1).map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Column selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Вибір даних для колонок</Label>
            {selectedColumns.map((col, index) => {
              const usedKeys = getUsedKeys(index);
              return (
                <div key={index} className="flex items-center gap-3">
                  <span className="w-8 shrink-0 text-sm font-medium text-muted-foreground">
                    {index + 1}.
                  </span>
                  <Select value={col} onValueChange={(v) => handleColumnChange(index, v)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Оберіть дані" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableColumns.map((ac) => (
                        <SelectItem
                          key={ac.key}
                          value={ac.key}
                          disabled={usedKeys.includes(ac.key)}
                        >
                          {ac.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Скасувати
          </Button>
          <Button onClick={handleSave}>Зберегти</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportSettingsModal;
