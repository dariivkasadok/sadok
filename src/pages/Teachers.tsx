import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, User, Phone, Mail, School } from "lucide-react";
import { useTeachers, useAddTeacher, useUpdateTeacher, useDeleteTeacher } from "@/hooks/useTeachers";
import type { DbTeacher, DbTeacherWithGroup } from "@/types/database";

type TeacherFormData = Omit<DbTeacher, "id" | "created_at" | "updated_at">;

const emptyTeacher: TeacherFormData = {
  full_name: "",
  position: "Вихователь",
  phone: "",
  email: "",
  experience: 0,
  education: "",
  category: "",
  pedagogical_title: "",
};

const Teachers = () => {
  const { data: teachers = [], isLoading } = useTeachers();
  const addTeacher = useAddTeacher();
  const updateTeacher = useUpdateTeacher();
  const deleteTeacher = useDeleteTeacher();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<DbTeacherWithGroup | null>(null);
  const [form, setForm] = useState<TeacherFormData>({ ...emptyTeacher });

  const openAdd = () => {
    setEditingTeacher(null);
    setForm({ ...emptyTeacher });
    setDialogOpen(true);
  };

  const openEdit = (t: DbTeacherWithGroup) => {
    setEditingTeacher(t);
    setForm({
      full_name: t.full_name,
      position: t.position,
      phone: t.phone,
      email: t.email,
      experience: t.experience,
      education: t.education,
      category: t.category,
      pedagogical_title: t.pedagogical_title,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.full_name) return;
    if (editingTeacher) {
      updateTeacher.mutate({ id: editingTeacher.id, teacher: form }, {
        onSuccess: () => setDialogOpen(false),
      });
    } else {
      addTeacher.mutate(form, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteTeacher.mutate(id);
  };

  const updateForm = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto space-y-6 px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Вихователі</h1>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" /> Додати вихователя
          </Button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Завантаження...</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((t) => (
              <Card key={t.id} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="absolute right-4 top-4 flex gap-2">
                    <button onClick={() => openEdit(t)} className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="flex h-8 w-8 items-center justify-center rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Видалити вихователя?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ви дійсно хочете видалити запис «{t.full_name}»? Цю дію неможливо скасувати.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Скасувати</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(t.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Видалити
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="mb-4 flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent">
                      <User className="h-10 w-10 text-primary" />
                    </div>
                  </div>

                  <h3 className="text-center text-lg font-bold text-foreground">{t.full_name}</h3>
                  <p className="mb-4 text-center text-sm font-semibold text-primary">{t.position}</p>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <School className="h-4 w-4" />
                      <span>{t.current_group_name || "Не призначено"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{t.phone || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{t.email || "—"}</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1 border-t pt-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Досвід:</span>
                      <span className="font-semibold">{t.experience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Освіта:</span>
                      <span className="font-semibold">{t.education || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Категорія:</span>
                      <span className="font-semibold">{t.category || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Педагогічне звання:</span>
                      <span className="font-semibold">{t.pedagogical_title || "—"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTeacher ? "Редагувати вихователя" : "Додати вихователя"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>ПІБ</Label>
                <Input value={form.full_name} onChange={(e) => updateForm("full_name", e.target.value)} placeholder="Прізвище Ім'я По батькові" />
              </div>
              <div className="space-y-1.5">
                <Label>Посада</Label>
                <Input value={form.position} onChange={(e) => updateForm("position", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Телефон</Label>
                <Input value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => updateForm("email", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Досвід (років)</Label>
                <Input type="number" value={form.experience} onChange={(e) => updateForm("experience", parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label>Освіта</Label>
                <Input value={form.education} onChange={(e) => updateForm("education", e.target.value)} placeholder="Напр. Вища" />
              </div>
              <div className="space-y-1.5">
                <Label>Категорія</Label>
                <Input value={form.category} onChange={(e) => updateForm("category", e.target.value)} placeholder="Напр. Перша" />
              </div>
              <div className="space-y-1.5">
                <Label>Педагогічне звання</Label>
                <Input value={form.pedagogical_title} onChange={(e) => updateForm("pedagogical_title", e.target.value)} placeholder="Напр. Старший вихователь" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Скасувати</Button>
              <Button onClick={handleSave}>{editingTeacher ? "Зберегти" : "Додати"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Teachers;
