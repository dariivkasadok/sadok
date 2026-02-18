import { useState, useMemo } from "react";
import { Search, ArrowUp, ArrowDown, ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { DbChildWithGroup } from "@/types/database";

interface ChildrenListProps {
  children: DbChildWithGroup[];
  onEdit: (child: DbChildWithGroup) => void;
  onDelete: (id: string) => void;
}

type SortField = "last_name" | "birth_date" | "group" | "enrolled";
type SortDir = "asc" | "desc";

const statuses = ["Всі", "Наявний", "Вибув"];

const ChildrenList = ({ children, onEdit, onDelete }: ChildrenListProps) => {
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("Всі групи");
  const [statusFilter, setStatusFilter] = useState("Всі");
  const [sortField, setSortField] = useState<SortField>("last_name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Extract unique group names from data
  const groupNames = useMemo(() => {
    const names = new Set(children.map((c) => c.current_group_name).filter(Boolean));
    return ["Всі групи", ...Array.from(names)] as string[];
  }, [children]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5" />;
    return sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;
  };

  const filtered = useMemo(() => {
    let result = [...children];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          (c.last_name ?? "").toLowerCase().includes(q) ||
          (c.first_name ?? "").toLowerCase().includes(q) ||
          (c.middle_name ?? "").toLowerCase().includes(q)
      );
    }
    if (groupFilter !== "Всі групи") {
      result = result.filter((c) => c.current_group_name === groupFilter);
    }
    if (statusFilter !== "Всі") {
      result = result.filter((c) => c.status === statusFilter);
    }
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "last_name") cmp = (a.last_name ?? "").localeCompare(b.last_name ?? "");
      else if (sortField === "birth_date") cmp = (a.birth_date ?? "").localeCompare(b.birth_date ?? "");
      else if (sortField === "group") cmp = (a.current_group_name ?? "").localeCompare(b.current_group_name ?? "");
      else if (sortField === "enrolled") cmp = (a.enrolled ?? "").localeCompare(b.enrolled ?? "");
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [children, search, groupFilter, statusFilter, sortField, sortDir]);

  const formatDate = (d: string | null) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return `${day}.${m}.${y}`;
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-[1fr_200px_200px]">
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">Пошук за ПІБ</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Введіть прізвище, ім'я або по батькові..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">Група</label>
          <Select value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {groupNames.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">Статус</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sort buttons */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Сортувати за:</span>
        {([
          ["last_name", "Прізвище"],
          ["birth_date", "Дата народження"],
          ["group", "Група"],
          ["enrolled", "Дата зарахування"],
        ] as [SortField, string][]).map(([field, label]) => (
          <button
            key={field}
            onClick={() => toggleSort(field)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              sortField === field
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            {label} <SortIcon field={field} />
          </button>
        ))}
      </div>

      <p className="mb-3 text-sm text-muted-foreground">Знайдено: {filtered.length} дітей</p>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ПІБ</TableHead>
            <TableHead>Стать</TableHead>
            <TableHead>Дата народження</TableHead>
            <TableHead>Група</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="text-center">Дії</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((child) => (
            <TableRow key={child.id}>
              <TableCell className="font-medium">{child.last_name} {child.first_name}</TableCell>
              <TableCell>
                <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  child.gender === "male" ? "bg-stat-blue text-stat-blue-text" : "bg-stat-pink text-stat-pink-text"
                }`}>
                  {child.gender === "male" ? "♂" : "♀"}
                </span>
              </TableCell>
              <TableCell>{formatDate(child.birth_date)}</TableCell>
              <TableCell>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {child.current_group_name || "—"}
                </span>
              </TableCell>
              <TableCell>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  child.status === "Наявний" ? "bg-stat-green text-stat-green-text" : "bg-destructive/10 text-destructive"
                }`}>
                  {child.status}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(child)} className="h-8 w-8 text-primary hover:bg-primary/10">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Видалити дитину?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ви дійсно хочете видалити запис «{child.last_name} {child.first_name}»? Цю дію неможливо скасувати.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Скасувати</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(child.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Видалити
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                Дітей не знайдено
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ChildrenList;
