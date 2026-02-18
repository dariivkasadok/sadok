import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Plus, Trash2, Clock, Bell, Pencil, Save } from "lucide-react";
import { useCalendarEvents, useCreateCalendarEvent, useUpdateCalendarEvent, useDeleteCalendarEvent, CalendarEvent } from "@/hooks/useCalendarEvents";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
const MONTHS = [
  "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
  "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень",
];

const COLOR_OPTIONS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899",
];

const CalendarSection = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0]);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data: events = [] } = useCalendarEvents(month, year);
  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.event_date === dateStr);
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setDialogOpen(true);
    resetForm();
  };

  const resetForm = () => {
    setNewTitle("");
    setNewDesc("");
    setNewTime("");
    setNewColor(COLOR_OPTIONS[0]);
    setEditingEvent(null);
  };

  const startEditing = (ev: CalendarEvent) => {
    setEditingEvent(ev);
    setNewTitle(ev.title);
    setNewDesc(ev.description || "");
    setNewTime(ev.event_time ? ev.event_time.slice(0, 5) : "");
    setNewColor(ev.color);
  };

  const cancelEditing = () => {
    resetForm();
  };

  const handleSaveEvent = async () => {
    if (!newTitle.trim()) return;

    if (editingEvent) {
      try {
        await updateEvent.mutateAsync({
          id: editingEvent.id,
          title: newTitle.trim(),
          description: newDesc.trim(),
          event_time: newTime || null,
          color: newColor,
        });
        resetForm();
        toast({ title: "Подію оновлено" });
      } catch {
        toast({ title: "Помилка при оновленні", variant: "destructive" });
      }
    } else {
      if (selectedDay === null) return;
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
      try {
        await createEvent.mutateAsync({
          title: newTitle.trim(),
          description: newDesc.trim(),
          event_date: dateStr,
          event_time: newTime || null,
          color: newColor,
        });
        resetForm();
        toast({ title: "Подію додано" });
      } catch {
        toast({ title: "Помилка при додаванні", variant: "destructive" });
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEvent.mutateAsync(id);
      if (editingEvent?.id === id) resetForm();
      toast({ title: "Подію видалено" });
    } catch {
      toast({ title: "Помилка при видаленні", variant: "destructive" });
    }
  };

  const dayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  // Reminder system: fetch today's events independently and check every 15s
  const notifiedRef = useRef<Set<string>>(new Set());
  const todayEventsRef = useRef<CalendarEvent[]>([]);

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Fetch today's events for reminders (independent of displayed month)
  useEffect(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const fetchTodayEvents = async () => {
      const { data } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("event_date", todayStr)
        .not("event_time", "is", null);
      todayEventsRef.current = (data as CalendarEvent[]) || [];
    };

    fetchTodayEvents();
    const refetchInterval = setInterval(fetchTodayEvents, 60000);
    return () => clearInterval(refetchInterval);
  }, []);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      todayEventsRef.current.forEach((ev) => {
        if (!ev.event_time || notifiedRef.current.has(ev.id)) return;
        const [h, m] = ev.event_time.split(":").map(Number);
        const evMinutes = h * 60 + m;
        if (nowMinutes >= evMinutes && nowMinutes - evMinutes < 5) {
          notifiedRef.current.add(ev.id);
          toast({ title: `🔔 Нагадування: ${ev.title}` });
          if (Notification.permission === "granted") {
            new Notification("Нагадування", { body: ev.title, icon: "/favicon.ico" });
          }
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl bg-card p-8 shadow-sm">
      <h2 className="mb-6 text-xl font-extrabold text-foreground">Календар</h2>
      <div className="mb-4 flex items-center justify-center gap-4">
        <button onClick={prevMonth} className="rounded-lg p-1 text-primary hover:bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-lg font-bold text-foreground">
          {MONTHS[month]}
        </span>
        <button onClick={nextMonth} className="rounded-lg p-1 text-primary hover:bg-muted">
          <ChevronRight className="h-5 w-5" />
        </button>
        <div className="ml-2 flex items-center gap-1">
          <span className="text-lg font-bold text-foreground">{year}</span>
          <div className="flex flex-col">
            <button onClick={() => setCurrentDate(new Date(year + 1, month, 1))} className="rounded p-0.5 text-primary hover:bg-muted">
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setCurrentDate(new Date(year - 1, month, 1))} className="rounded p-0.5 text-primary hover:bg-muted">
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-bold text-muted-foreground">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          const dayEvs = day ? getEventsForDay(day) : [];
          return (
            <div
              key={i}
              onClick={() => day && handleDayClick(day)}
              className={`flex flex-col items-center justify-center rounded-lg text-sm font-semibold transition-colors min-h-[3rem] ${
                day === null
                  ? ""
                  : isToday(day)
                  ? "bg-primary text-primary-foreground cursor-pointer"
                  : "text-foreground hover:bg-muted cursor-pointer"
              }`}
            >
              <span>{day}</span>
              {dayEvs.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayEvs.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className="block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: e.color }}
                    />
                  ))}
                  {dayEvs.length > 3 && (
                    <span className="text-[8px] text-muted-foreground leading-none">+{dayEvs.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDay && `${selectedDay} ${MONTHS[month]} ${year}`}
            </DialogTitle>
          </DialogHeader>

          {/* Existing events */}
          {dayEvents.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {dayEvents.map((ev) => (
                <div key={ev.id} className={`flex items-start gap-2 rounded-lg border p-3 ${editingEvent?.id === ev.id ? "border-primary" : ""}`}>
                  <span className="mt-1 block h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm text-foreground">{ev.title}</p>
                      {ev.event_time && (
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {ev.event_time.slice(0, 5)}
                        </span>
                      )}
                    </div>
                    {ev.description && <p className="text-xs text-muted-foreground mt-0.5">{ev.description}</p>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => startEditing(ev)}>
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleDelete(ev.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Event form (add or edit) */}
          <div className="space-y-3 border-t pt-3">
            {editingEvent && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">Редагування події</span>
                <Button variant="ghost" size="sm" onClick={cancelEditing} className="text-xs">
                  Скасувати
                </Button>
              </div>
            )}
            <Input placeholder="Назва події" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="pl-8"
                />
                <Bell className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
            <Textarea placeholder="Опис (необов'язково)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="min-h-[60px]" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Колір:</span>
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className={`h-6 w-6 rounded-full border-2 transition-all ${newColor === c ? "border-foreground scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSaveEvent} disabled={!newTitle.trim() || createEvent.isPending || updateEvent.isPending}>
              {editingEvent ? (
                <><Save className="h-4 w-4 mr-1" /> Зберегти</>
              ) : (
                <><Plus className="h-4 w-4 mr-1" /> Додати подію</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarSection;
