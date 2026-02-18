import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DbTeacher, DbTeacherWithGroup } from "@/types/database";
import { toast } from "@/hooks/use-toast";

export function useTeachers() {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: async (): Promise<DbTeacherWithGroup[]> => {
      const { data, error } = await supabase
        .from("teachers_with_group")
        .select("*")
        .order("full_name");
      if (error) throw error;
      return (data ?? []) as DbTeacherWithGroup[];
    },
  });
}

export function useAddTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (teacher: Omit<DbTeacher, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("teachers").insert(teacher).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teachers"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast({ title: "Вихователя додано" });
    },
    onError: (err: Error) => {
      toast({ title: "Помилка", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; teacher: Partial<Omit<DbTeacher, "id" | "created_at" | "updated_at">> }) => {
      const { error } = await supabase.from("teachers").update(params.teacher).eq("id", params.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teachers"] });
      toast({ title: "Дані оновлено" });
    },
    onError: (err: Error) => {
      toast({ title: "Помилка", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("teachers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teachers"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast({ title: "Вихователя видалено" });
    },
    onError: (err: Error) => {
      toast({ title: "Помилка", description: err.message, variant: "destructive" });
    },
  });
}

// Assign teacher to group
export function useAssignTeacherToGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { teacherId: string; groupId: string }) => {
      const { error } = await supabase
        .from("teacher_group_history")
        .insert({ teacher_id: params.teacherId, group_id: params.groupId, is_current: true });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teachers"] });
      qc.invalidateQueries({ queryKey: ["teacher_group_history"] });
      toast({ title: "Вихователя призначено до групи" });
    },
    onError: (err: Error) => {
      toast({ title: "Помилка", description: err.message, variant: "destructive" });
    },
  });
}
