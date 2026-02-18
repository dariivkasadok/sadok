import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Filter, FileText, Download, CalendarIcon, Settings2 } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useChildren } from "@/hooks/useChildren";
import { useAllGroups } from "@/hooks/useGroups";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { supabase } from "@/integrations/supabase/client";
import type { DbChildWithGroup } from "@/types/database";
import ReportSettingsModal, { availableColumns, type ReportSettings } from "@/components/reports/ReportSettingsModal";
import ExportReportModal from "@/components/reports/ExportReportModal";

const DateFilterField = ({ label, value, setter }: { label: string; value: string; setter: (v: string) => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(new Date(value), "dd.MM.yyyy") : "Оберіть дату"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value ? new Date(value) : undefined} onSelect={(d) => { setter(d ? format(d, "yyyy-MM-dd") : ""); setOpen(false); }} initialFocus locale={uk} />
        </PopoverContent>
      </Popover>
    </div>
  );
};

const socialStatuses = [
  { key: "orphan", label: "Сирота" },
  { key: "inclusion", label: "Інклюзія" },
  { key: "many_children_family", label: "Багатодітна сім'я" },
  { key: "low_income", label: "Малозабезпечений" },
  { key: "deprived_parental_care", label: "Позбавлений піклування" },
  { key: "chornobyl", label: "Чорнобиль" },
];

const warStatuses = [
  { key: "ato", label: "АТО" },
  { key: "idp", label: "ВПО" },
  { key: "war_child", label: "Дитина війни" },
  { key: "parents_military", label: "Батьки військовослужбовці" },
  { key: "parents_ubd", label: "Батьки УБД" },
  { key: "missing_parents", label: "Батьки зниклі безвісті" },
];

const locationStatusMap: Record<string, string> = {
  "village": "На території села",
  "ukraine": "На території України",
  "abroad": "За кордоном",
  "На території села": "На території села",
  "На території України": "На території України",
  "За кордоном": "За кордоном",
};

const translateLocationStatus = (status: string | null): string => {
  if (!status) return "";
  return locationStatusMap[status.toLowerCase()] || locationStatusMap[status] || status;
};

const Reports = () => {
  const { data: allChildren = [] } = useChildren();
  const { data: allGroups = [] } = useAllGroups();
  const { data: academicYears = [] } = useAcademicYears();

  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [group, setGroup] = useState("all");
  const [gender, setGender] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [territorialStatus, setTerritorialStatus] = useState("all");
  const [socialChecks, setSocialChecks] = useState<Record<string, boolean>>({});
  const [warChecks, setWarChecks] = useState<Record<string, boolean>>({});
  const [birthDateFrom, setBirthDateFrom] = useState("");
  const [birthDateTo, setBirthDateTo] = useState("");
  const [enrollmentDateFrom, setEnrollmentDateFrom] = useState("");
  const [enrollmentDateTo, setEnrollmentDateTo] = useState("");
  const [results, setResults] = useState<DbChildWithGroup[] | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [reportSettings, setReportSettings] = useState<ReportSettings>({
    title: "",
    columns: ["fullName", "birthDate", "address", "parentFullName", "parentPhone"],
  });

  const toggleSocial = (key: string) => setSocialChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleWar = (key: string) => setWarChecks((prev) => ({ ...prev, [key]: !prev[key] }));

  const uniqueGroupNames = [...new Set(allChildren.map((c) => c.current_group_name).filter(Boolean))] as string[];

  const handleGenerateReport = async () => {
    let filtered: DbChildWithGroup[] = [];

    if (academicYear !== "all") {
      // Query children through child_group_history to find ALL children
      // who were in groups of the selected year (not just currently assigned)
      const { data: historyRows, error: histErr } = await supabase
        .from("child_group_history")
        .select("child_id, group:groups!inner(study_year)")
        .eq("groups.study_year", academicYear);
      if (histErr) {
        console.error(histErr);
        return;
      }
      const childIds = [...new Set((historyRows ?? []).map((r: any) => r.child_id))];
      filtered = allChildren.filter((c) => childIds.includes(c.id!));
    } else {
      filtered = [...allChildren];
    }

    if (group !== "all") {
      filtered = filtered.filter((c) => c.current_group_name === group);
    }
    if (gender !== "all") {
      filtered = filtered.filter((c) => c.gender === gender);
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }
    if (territorialStatus !== "all") {
      filtered = filtered.filter((c) => {
        const translated = translateLocationStatus(c.location_status);
        return c.location_status === territorialStatus || translated === territorialStatus;
      });
    }
    if (birthDateFrom) {
      filtered = filtered.filter((c) => (c.birth_date ?? "") >= birthDateFrom);
    }
    if (birthDateTo) {
      filtered = filtered.filter((c) => (c.birth_date ?? "") <= birthDateTo);
    }
    if (enrollmentDateFrom) {
      filtered = filtered.filter((c) => (c.enrolled ?? "") >= enrollmentDateFrom);
    }
    if (enrollmentDateTo) {
      filtered = filtered.filter((c) => (c.enrolled ?? "") <= enrollmentDateTo);
    }

    Object.entries(socialChecks).forEach(([key, checked]) => {
      if (checked) filtered = filtered.filter((c) => (c as any)[key]);
    });
    Object.entries(warChecks).forEach(([key, checked]) => {
      if (checked) filtered = filtered.filter((c) => (c as any)[key]);
    });

    setResults(filtered);
  };

  const boysCount = results ? results.filter((c) => c.gender === "male").length : 0;
  const girlsCount = results ? results.filter((c) => c.gender === "female").length : 0;
  const uniqueGroups = results ? [...new Set(results.map((c) => c.current_group_name).filter(Boolean))] : [];

  const formatAddress = (c: DbChildWithGroup) => {
    const parts: string[] = [];
    if (c.settlement) parts.push(c.settlement);
    if (c.street) parts.push(`вул. ${c.street}`);
    if (c.house) parts.push(`б. ${c.house}`);
    if (c.apartment) parts.push(`кв. ${c.apartment}`);
    return parts.join(", ");
  };

  const getSocialStatusText = (c: DbChildWithGroup) => {
    const s: string[] = [];
    if (c.orphan) s.push("Сирота");
    if (c.inclusion) s.push("Інклюзія");
    if (c.many_children_family) s.push("Багатодітна сім'я");
    if (c.low_income) s.push("Малозабезпечений");
    if (c.deprived_parental_care) s.push("Позбавлений піклування");
    if (c.chornobyl) s.push("Чорнобиль");
    return s.join(", ") || "—";
  };

  const getWarStatusText = (c: DbChildWithGroup) => {
    const s: string[] = [];
    if (c.ato) s.push("АТО");
    if (c.idp) s.push("ВПО");
    if (c.war_child) s.push("Дитина війни");
    if (c.parents_military) s.push("Батьки військовослужбовці");
    if (c.parents_ubd) s.push("Батьки УБД");
    if (c.missing_parents) s.push("Батьки зниклі безвісті");
    return s.join(", ") || "—";
  };

  const getCellValue = (child: DbChildWithGroup, columnKey: string, rowIndex: number): string => {
    switch (columnKey) {
      case "index": return String(rowIndex + 1);
      case "fullName": return `${child.last_name} ${child.first_name} ${child.middle_name}`;
      case "birthDate": return child.birth_date ? child.birth_date.split("-").reverse().join(".") : "";
      case "address": return formatAddress(child);
      case "group": return child.current_group_name || "";
      case "gender": return child.gender === "male" ? "Хлопчик" : "Дівчинка";
      case "status": return child.status;
      case "socialStatus": return getSocialStatusText(child);
      case "warStatus": return getWarStatusText(child);
      case "territorialStatus": return translateLocationStatus(child.location_status);
      case "parentFullName": return child.parents_full_name;
      case "parentPhone": return child.phone;
      default: return "";
    }
  };

  const activeColumns = reportSettings.columns
    .map((key) => availableColumns.find((ac) => ac.key === key))
    .filter(Boolean) as { key: string; label: string }[];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto space-y-6 px-6 py-8">
        <h1 className="text-3xl font-bold text-foreground">Звіти</h1>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Filter className="h-5 w-5" /> Фільтри
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label>Навчальний рік</Label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {academicYears.map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                    <SelectItem value="all">Всі</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Група</Label>
                <Select value={group} onValueChange={setGroup}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всі групи</SelectItem>
                    {uniqueGroupNames.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Стать</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всі</SelectItem>
                    <SelectItem value="male">Хлопчик</SelectItem>
                    <SelectItem value="female">Дівчинка</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Статус</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всі</SelectItem>
                    <SelectItem value="Наявний">Наявний</SelectItem>
                    <SelectItem value="Вибув">Вибув</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date filters */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Дата народження з", value: birthDateFrom, setter: setBirthDateFrom },
                { label: "Дата народження по", value: birthDateTo, setter: setBirthDateTo },
                { label: "Дата навчання з", value: enrollmentDateFrom, setter: setEnrollmentDateFrom },
                { label: "Дата навчання по", value: enrollmentDateTo, setter: setEnrollmentDateTo },
              ].map(({ label, value, setter }) => (
                <DateFilterField key={label} label={label} value={value} setter={setter} />
              ))}
            </div>

            {/* Social & War */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-2 rounded-lg border p-4">
                <Label className="text-sm font-semibold">Соціальний статус</Label>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {socialStatuses.map((s) => (
                    <label key={s.key} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={!!socialChecks[s.key]} onCheckedChange={() => toggleSocial(s.key)} />
                      {s.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2 rounded-lg border p-4">
                <Label className="text-sm font-semibold">Статус пов'язаний з війною</Label>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {warStatuses.map((s) => (
                    <label key={s.key} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={!!warChecks[s.key]} onCheckedChange={() => toggleWar(s.key)} />
                      {s.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Territorial */}
            <div className="max-w-sm space-y-1.5">
              <Label>Територіальне перебування</Label>
              <Select value={territorialStatus} onValueChange={setTerritorialStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всі</SelectItem>
                  <SelectItem value="На території села">На території села</SelectItem>
                  <SelectItem value="На території України">На території України</SelectItem>
                  <SelectItem value="За кордоном">За кордоном</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSettingsOpen(true)} className="gap-2">
                <Settings2 className="h-4 w-4" /> Параметри звіту
              </Button>
              <Button onClick={handleGenerateReport} className="gap-2">
                <FileText className="h-4 w-4" /> Сформувати звіт
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results !== null && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <FileText className="h-5 w-5" /> {reportSettings.title || "Результати звіту"}
                </CardTitle>
                <Button variant="outline" className="gap-2 border-primary/50 text-primary hover:bg-primary/5" onClick={() => setExportOpen(true)}>
                  <Download className="h-4 w-4" /> Експортувати
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Всього дітей</p>
                  <p className="text-2xl font-bold text-primary">{results.length}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Хлопчиків</p>
                  <p className="text-2xl font-bold text-accent-foreground">{boysCount}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Дівчаток</p>
                  <p className="text-2xl font-bold text-secondary-foreground">{girlsCount}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Груп</p>
                  <p className="text-2xl font-bold text-stat-green-text">{uniqueGroups.length}</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10">
                      {activeColumns.map((col) => (
                        <TableHead key={col.key} className="font-semibold text-primary">{col.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={activeColumns.length} className="py-8 text-center text-muted-foreground">
                          Немає дітей за обраними фільтрами
                        </TableCell>
                      </TableRow>
                    ) : (
                      results.map((child, rowIndex) => (
                        <TableRow key={child.id}>
                          {activeColumns.map((col) => (
                            <TableCell key={col.key}>{getCellValue(child, col.key, rowIndex)}</TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        <ReportSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} settings={reportSettings} onSave={setReportSettings} />

        {results && (
          <ExportReportModal
            open={exportOpen}
            onOpenChange={setExportOpen}
            data={results}
            columns={activeColumns}
            title={reportSettings.title || "Звіт"}
            getCellValue={getCellValue}
          />
        )}
      </main>
    </div>
  );
};

export default Reports;
