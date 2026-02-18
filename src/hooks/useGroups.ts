import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DbGroup } from "@/types/database";
import { toast } from "@/hooks/use-toast";

export function useGroups(studyYear?: string) {
  return useQuery({
    queryKey: ["groups", studyYear],
    queryFn: async (): Promise<DbGroup[]> => {
      let query = supabase.from("groups").select("*").order("name");
      if (studyYear) {
        query = query.eq("study_year", studyYear);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as DbGroup[];
    },
  });
}

export function useAllGroups() {
  return useQuery({
    queryKey: ["groups"],
    queryFn: async (): Promise<DbGroup[]> => {
      const { data, error } = await supabase.from("groups").select("*").order("name");
      if (error) throw error;
      return (data ?? []) as DbGroup[];
    },
  });
}

export function useAddGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (group: Omit<DbGroup, "id" | "created_at">) => {
      const { data, error } = await supabase.from("groups").insert(group).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"] });
      qc.invalidateQueries({ queryKey: ["academic_years"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast({ title: "Групу створено" });
    },
    onError: (err: Error) => {
      toast({ title: "Помилка", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; group: Partial<Omit<DbGroup, "id" | "created_at">> }) => {
      const { error } = await supabase.from("groups").update(params.group).eq("id", params.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"] });
      toast({ title: "Групу оновлено" });
    },
    onError: (err: Error) => {
      toast({ title: "Помилка", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("groups").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"] });
      qc.invalidateQueries({ queryKey: ["academic_years"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast({ title: "Групу видалено" });
    },
    onError: (err: Error) => {
      toast({ title: "Помилка", description: err.message, variant: "destructive" });
    },
  });
}

// Transfer children between groups
export function useTransferChildren() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { childIds: string[]; targetGroupId: string }) => {
      // First deactivate all current assignments for these children
      const { error: deactivateError } = await supabase
        .from("child_group_history")
        .update({ is_current: false })
        .in("child_id", params.childIds)
        .eq("is_current", true);
      if (deactivateError) throw deactivateError;

      // Then insert new group assignments
      const inserts = params.childIds.map((child_id) => ({
        child_id,
        group_id: params.targetGroupId,
        is_current: true,
      }));
      const { error } = await supabase.from("child_group_history").insert(inserts);
      if (error) throw error;
    },
    onSuccess: (_, params) => {
      qc.invalidateQueries({ queryKey: ["children"] });
      qc.invalidateQueries({ queryKey: ["child_group_history"] });
      toast({ title: `Переведено ${params.childIds.length} дітей` });
    },
    onError: (err: Error) => {
      toast({ title: "Помилка переведення", description: err.message, variant: "destructive" });
    },
  });
}

// Get children in a specific group
export function useChildrenInGroup(groupId: string | undefined) {
  return useQuery({
    queryKey: ["child_group_history", groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("child_group_history")
        .select("child_id, is_current, childrens(id, last_name, first_name, middle_name)")
        .eq("group_id", groupId!)
        .eq("is_current", true);
      if (error) throw error;
      return data ?? [];
    },
  });
}

// Count children per group using children_with_group view (source of truth)
export function useGroupChildCounts() {
  return useQuery({
    queryKey: ["group_child_counts"],
    queryFn: async () => {
      const { data: children, error } = await supabase
        .from("children_with_group")
        .select("current_group_name, current_study_year");
      if (error) throw error;

      const { data: groups, error: gErr } = await supabase
        .from("groups")
        .select("id, name, study_year");
      if (gErr) throw gErr;

      // Count children per group_name + study_year
      const nameCounts: Record<string, number> = {};
      (children ?? []).forEach((c: any) => {
        if (c.current_group_name && c.current_study_year) {
          const key = `${c.current_group_name}|||${c.current_study_year}`;
          nameCounts[key] = (nameCounts[key] || 0) + 1;
        }
      });

      // Map to group IDs
      const counts: Record<string, number> = {};
      (groups ?? []).forEach((g: any) => {
        const key = `${g.name}|||${g.study_year}`;
        counts[g.id] = nameCounts[key] || 0;
      });

      return counts;
    },
  });
}
