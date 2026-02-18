import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Save, X } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { DbChild, DbChildWithGroup, DbGroup } from "@/types/database";

type ChildFormData = Omit<DbChild, "id" | "created_at" | "updated_at">;

interface ChildFormProps {
  onSubmit: (child: ChildFormData, groupId?: string) => void;
  onCancel: () => void;
  initialData?: DbChildWithGroup | null;
  groups: DbGroup[];
}

const emptyChild: ChildFormData = {
  last_name: "",
  first_name: "",
  middle_name: "",
  gender: "male",
  birth_date: null,
  household_book_number: "",
  settlement: "",
  street: "",
  house: "",
  apartment: "",
  enrolled: null,
  withdrawn: null,
  birth_certificate: "",
  location_status: "",
  orphan: false,
  low_income: false,
  inclusion: false,
  chornobyl: false,
  ato: false,
  many_children_family: false,
  idp: false,
  war_child: false,
  deprived_parental_care: false,
  missing_parents: false,
  parents_ubd: false,
  parents_military: false,
  parents_full_name: "",
  phone: "",
  workplace: "",
  guardian: "мати",
  child_notes: "",
  parents_note: "",
};

const territorialOptions = [
  "На території села",
  "На території України",
  "За кордоном",
];

const ChildForm = ({ onSubmit, onCancel, initialData, groups }: ChildFormProps) => {
  const [form, setForm] = useState<ChildFormData>({ ...emptyChild });
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  useEffect(() => {
    if (initialData) {
      const { current_group_name, current_study_year, status, created_at, updated_at, ...rest } = initialData;
      setForm(rest);
      // Find current group ID
      if (current_group_name && current_study_year) {
        const g = groups.find((g) => g.name === current_group_name && g.study_year === current_study_year);
        if (g) setSelectedGroupId(g.id);
      }
    } else {
      setForm({ ...emptyChild });
      setSelectedGroupId("");
    }
  }, [initialData, groups]);

  const set = <K extends keyof ChildFormData>(key: K, value: ChildFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form, selectedGroupId || undefined);
  };

  const DateField = ({ label, value, onChange }: { label: string; value: string | null; onChange: (v: string | null) => void }) => {
    const dateValue = value ? new Date(value) : undefined;
    const [open, setOpen] = useState(false);
    return (
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">{label}</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateValue ? format(dateValue, "dd.MM.yyyy") : "Оберіть дату"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateValue} onSelect={(d) => { onChange(d ? format(d, "yyyy-MM-dd") : null); setOpen(false); }} initialFocus locale={uk} />
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const CheckField = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center gap-2">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(v === true)} />
      <Label className="text-sm">{label}</Label>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-8">
        {/* Дані дитини */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-foreground">Дані дитини</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Прізвище *</Label>
              <Input required value={form.last_name} onChange={(e) => set("last_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Ім'я *</Label>
              <Input required value={form.first_name} onChange={(e) => set("first_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">По батькові</Label>
              <Input value={form.middle_name} onChange={(e) => set("middle_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Стать *</Label>
              <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Хлопчик</SelectItem>
                  <SelectItem value="female">Дівчинка</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DateField label="Дата народження *" value={form.birth_date} onChange={(v) => set("birth_date", v)} />
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Номер в господарській книзі</Label>
              <Input value={form.household_book_number} onChange={(e) => set("household_book_number", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Свідоцтво про народження</Label>
              <Input value={form.birth_certificate} onChange={(e) => set("birth_certificate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Група</Label>
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger><SelectValue placeholder="Оберіть групу" /></SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name} ({g.study_year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Адреса */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-foreground">Адреса проживання</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Населений пункт</Label>
              <Input value={form.settlement} onChange={(e) => set("settlement", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Вулиця</Label>
              <Input value={form.street} onChange={(e) => set("street", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">№ будинку</Label>
              <Input value={form.house} onChange={(e) => set("house", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">№ квартири</Label>
              <Input value={form.apartment} onChange={(e) => set("apartment", e.target.value)} />
            </div>
          </div>
        </section>

        {/* Статус перебування */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-foreground">Статус перебування</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DateField label="Дата зарахування" value={form.enrolled} onChange={(v) => set("enrolled", v)} />
            <DateField label="Дата вибуття" value={form.withdrawn} onChange={(v) => set("withdrawn", v)} />
          </div>
        </section>

        {/* Інформація про батьків */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-foreground">Інформація про батька/опікуна</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">ПІБ</Label>
              <Input value={form.parents_full_name} onChange={(e) => set("parents_full_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Телефон</Label>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Місце роботи</Label>
              <Input value={form.workplace} onChange={(e) => set("workplace", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Батько / Мати / Опікун</Label>
              <Select value={form.guardian} onValueChange={(v) => set("guardian", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="батько">Батько</SelectItem>
                  <SelectItem value="мати">Мати</SelectItem>
                  <SelectItem value="опікун">Опікун</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Соціальні категорії */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-foreground">Соціальні категорії</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Соціальний статус</h3>
              <CheckField label="Сирота" checked={form.orphan} onChange={(v) => set("orphan", v)} />
              <CheckField label="Інклюзія" checked={form.inclusion} onChange={(v) => set("inclusion", v)} />
              <CheckField label="Багатодітна сім'я" checked={form.many_children_family} onChange={(v) => set("many_children_family", v)} />
              <CheckField label="Малозабезпечений" checked={form.low_income} onChange={(v) => set("low_income", v)} />
              <CheckField label="Чорнобиль" checked={form.chornobyl} onChange={(v) => set("chornobyl", v)} />
              <CheckField label="Позбавлений піклування" checked={form.deprived_parental_care} onChange={(v) => set("deprived_parental_care", v)} />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Статус пов'язаний з війною</h3>
              <CheckField label="АТО" checked={form.ato} onChange={(v) => set("ato", v)} />
              <CheckField label="ВПО" checked={form.idp} onChange={(v) => set("idp", v)} />
              <CheckField label="Дитина війни" checked={form.war_child} onChange={(v) => set("war_child", v)} />
              <CheckField label="Батьки військовослужбовці" checked={form.parents_military} onChange={(v) => set("parents_military", v)} />
              <CheckField label="Батьки УБД" checked={form.parents_ubd} onChange={(v) => set("parents_ubd", v)} />
              <CheckField label="Батьки зниклі безвісті" checked={form.missing_parents} onChange={(v) => set("missing_parents", v)} />
            </div>
          </div>
        </section>

        {/* Територіальне перебування */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-foreground">Територіальне перебування</h2>
          <div className="max-w-sm">
            <Select value={form.location_status} onValueChange={(v) => set("location_status", v)}>
              <SelectTrigger><SelectValue placeholder="Оберіть статус" /></SelectTrigger>
              <SelectContent>
                {territorialOptions.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Примітки */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-foreground">Примітки</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Примітки про дитину</Label>
              <Textarea value={form.child_notes} onChange={(e) => set("child_notes", e.target.value)} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Примітки про батьків</Label>
              <Textarea value={form.parents_note} onChange={(e) => set("parents_note", e.target.value)} rows={3} />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center gap-3 border-t border-border pt-6">
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            {initialData ? "Зберегти зміни" : "Додати дитину"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="gap-2">
            <X className="h-4 w-4" />
            Скасувати
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ChildForm;
