import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DbChild, DbChildWithGroup } from "@/types/database";
import { toast } from "@/hooks/use-toast";

export function useChildren() {
  return useQuery({
    queryKey: ["children"],
    queryFn: async (): Promise<DbChildWithGroup[]> => {
      const { data, error } = await supabase
        .from("children_with_group")
        .select("*")
        .order("last_name");
      if (error) throw error;
      return (data ?? []) as DbChildWithGroup[];
    },
  });
}

export function useAddChild() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      child: Omit<DbChild, "id" | "created_at" | "updated_at">;
      groupId?: string;
    }) => {
      const { data, error } = await supabase
        .from("childrens")
        .insert(params.child)
        .select()
        .single();
      if (error) throw error;

      // Assign to group if provided
      if (params.groupId && data) {
        await supabase
          .from("child_group_history")
          .update({ is_current: false })
          .eq("child_id", data.id)
          .eq("is_current", true);
        const { error: ghError } = await supabase
          .from("child_group_history")
          .insert({ child_id: data.id, group_id: params.groupId, is_current: true });
        if (ghError) throw ghError;
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["children"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast({ title: "Дитину додано" });
    },
    onError: (err: Error) => {
      toast({ title: "Помилка", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateChild() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      child: Partial<Omit<DbChild, "id" | "created_at" | "updated_at">>;
      groupId?: string;
    }) => {
      const { error } = await supabase
        .from("childrens")
        .update(params.child)
        .eq("id", params.id);
      if (error) throw error;

      // Deactivate old group assignment, then insert new one
      if (params.groupId) {
        await supabase
          .from("child_group_history")
          .update({ is_current: false })
          .eq("child_id", params.id)
          .eq("is_current", true);
        const { error: ghError } = await supabase
          .from("child_group_history")
          .insert({ child_id: params.id, group_id: params.groupId, is_current: true });
        if (ghError) throw ghError;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["children"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast({ title: "Дані оновлено" });
    },
    onError: (err: Error) => {
      toast({ title: "Помилка", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteChild() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("childrens").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["children"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast({ title: "Дитину видалено" });
    },
    onError: (err: Error) => {
      toast({ title: "Помилка", description: err.message, variant: "destructive" });
    },
  });
}
