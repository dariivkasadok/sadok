import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Pencil, Trash2, Users, ArrowRightLeft, CalendarIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useAllGroups, useAddGroup, useUpdateGroup, useDeleteGroup, useGroupChildCounts, useTransferChildren } from "@/hooks/useGroups";
import { useChildren } from "@/hooks/useChildren";
import { useAcademicYears, useAcademicYearsWithNext } from "@/hooks/useAcademicYears";
import type { DbGroup, DbChildWithGroup } from "@/types/database";

type GroupFormData = Omit<DbGroup, "id" | "created_at">;

const emptyForm: GroupFormData = {
  name: "",
  study_year: "2025-2026",
  study_start_date: "2025-09-01",
  study_end_date: "2026-05-31",
};

const Groups = () => {
  const { data: groups = [], isLoading } = useAllGroups();
  const { data: children = [] } = useChildren();
  const { data: childCounts = {} } = useGroupChildCounts();
  const { data: academicYears = [] } = useAcademicYears();
  const { data: academicYearsWithNext = [] } = useAcademicYearsWithNext();
  const addGroup = useAddGroup();
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();
  const transferChildren = useTransferChildren();

  const currentAcademicYear = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  })();

  // Transfer state
  const [sourceYear, setSourceYear] = useState("2025-2026");
  const [sourceGroupId, setSourceGroupId] = useState("");
  const [targetYear, setTargetYear] = useState("2025-2026");
  const [targetGroupId, setTargetGroupId] = useState("");
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<DbGroup | null>(null);
  const [formData, setFormData] = useState<GroupFormData>({ ...emptyForm });
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Children in source group
  const sourceChildren = children.filter((c) => {
    const g = groups.find((g) => g.id === sourceGroupId);
    return g && c.current_group_name === g.name && c.current_study_year === g.study_year;
  });

  const handleTransfer = () => {
    if (!targetGroupId || selectedChildIds.length === 0) {
      toast({ title: "Оберіть дітей та цільову групу", variant: "destructive" });
      return;
    }
    if (sourceGroupId === targetGroupId) {
      toast({ title: "Групи мають бути різними", variant: "destructive" });
      return;
    }
    transferChildren.mutate({ childIds: selectedChildIds, targetGroupId }, {
      onSuccess: () => setSelectedChildIds([]),
    });
  };

  const openCreateDialog = () => {
    setEditingGroup(null);
    setFormData({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEditDialog = (group: DbGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      study_year: group.study_year,
      study_start_date: group.study_start_date,
      study_end_date: group.study_end_date,
    });
    setDialogOpen(true);
  };

  const handleSaveGroup = () => {
    if (!formData.name.trim()) {
      toast({ title: "Введіть назву групи", variant: "destructive" });
      return;
    }
    if (editingGroup) {
      updateGroup.mutate({ id: editingGroup.id, group: formData }, {
        onSuccess: () => setDialogOpen(false),
      });
    } else {
      addGroup.mutate(formData, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  const handleDeleteGroup = (id: string) => {
    if ((childCounts[id] ?? 0) > 0) {
      toast({ title: "Неможливо видалити групу з дітьми", variant: "destructive" });
      return;
    }
    deleteGroup.mutate(id);
  };

  const toggleChild = (childId: string) => {
    setSelectedChildIds((prev) =>
      prev.includes(childId) ? prev.filter((id) => id !== childId) : [...prev, childId]
    );
  };

  const filteredGroupsByYear = (year: string) => groups.filter((g) => g.study_year === year);
  const formatDateStr = (d: string | null) => d ? d.split("-").reverse().join(".") : "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto space-y-8 px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Управління групами</h1>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" /> Створити групу
          </Button>
        </div>

        {/* Transfer Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" /> Вибір дітей для переведення
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Навчальний рік</Label>
                <Select value={sourceYear} onValueChange={setSourceYear}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{academicYears.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Група</Label>
                <Select value={sourceGroupId} onValueChange={(v) => { setSourceGroupId(v); setSelectedChildIds([]); }}>
                  <SelectTrigger><SelectValue placeholder="Оберіть групу" /></SelectTrigger>
                  <SelectContent>
                    {filteredGroupsByYear(sourceYear).map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {sourceGroupId && (
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                  {sourceChildren.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Немає дітей у цій групі</p>
                  ) : (
                    sourceChildren.map((child) => (
                      <label key={child.id} className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted">
                        <Checkbox checked={selectedChildIds.includes(child.id)} onCheckedChange={() => toggleChild(child.id)} />
                        <span className="text-sm">{child.last_name} {child.first_name} {child.middle_name}</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ArrowRightLeft className="h-5 w-5 text-primary" /> Цільова група
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Навчальний рік</Label>
                <Select value={targetYear} onValueChange={setTargetYear}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{academicYears.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Група</Label>
                <Select value={targetGroupId} onValueChange={setTargetGroupId}>
                  <SelectTrigger><SelectValue placeholder="Оберіть групу" /></SelectTrigger>
                  <SelectContent>
                    {filteredGroupsByYear(targetYear).map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Обрано дітей для переведення</Label>
                <div className="rounded-lg border border-border p-3 text-2xl font-bold text-foreground">
                  {selectedChildIds.length}
                </div>
              </div>
              <Button onClick={handleTransfer} className="w-full gap-2" size="lg" disabled={selectedChildIds.length === 0 || !targetGroupId}>
                Перевести дітей
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Groups List */}
        <div>
          <div className="mb-4 flex items-center gap-4">
            <h2 className="text-xl font-bold text-foreground">Список груп</h2>
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              {currentAcademicYear}
            </span>
          </div>
          {isLoading ? (
            <p className="text-muted-foreground">Завантаження...</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groups.filter((g) => g.study_year === currentAcademicYear).map((group) => (
                <Card key={group.id} className="relative border-l-4 border-l-primary transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{group.name}</h3>
                        <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                          {group.study_year}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(group)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Видалити групу?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Ви дійсно хочете видалити групу «{group.name}»? Цю дію неможливо скасувати.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Скасувати</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteGroup(group.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Видалити
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Наповнення: <span className="font-semibold text-foreground">{childCounts[group.id] ?? 0}</span></p>
                      <p>Період: <span className="font-semibold text-foreground">{formatDateStr(group.study_start_date)} — {formatDateStr(group.study_end_date)}</span></p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingGroup ? "Редагувати групу" : "Створити групу"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Назва групи</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Навчальний рік</Label>
                <Select value={formData.study_year} onValueChange={(v) => setFormData({ ...formData, study_year: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{academicYearsWithNext.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Початок навч. року</Label>
                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.study_start_date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.study_start_date ? format(new Date(formData.study_start_date), "dd.MM.yyyy") : "Оберіть дату"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={formData.study_start_date ? new Date(formData.study_start_date) : undefined} onSelect={(d) => { setFormData({ ...formData, study_start_date: d ? format(d, "yyyy-MM-dd") : null }); setStartDateOpen(false); }} initialFocus locale={uk} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Кінець навч. року</Label>
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.study_end_date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.study_end_date ? format(new Date(formData.study_end_date), "dd.MM.yyyy") : "Оберіть дату"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={formData.study_end_date ? new Date(formData.study_end_date) : undefined} onSelect={(d) => { setFormData({ ...formData, study_end_date: d ? format(d, "yyyy-MM-dd") : null }); setEndDateOpen(false); }} initialFocus locale={uk} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Скасувати</Button>
              <Button onClick={handleSaveGroup}>{editingGroup ? "Зберегти" : "Створити"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Groups;
