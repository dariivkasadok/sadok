import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Stats {
  total: number;
  girls: number;
  boys: number;
  groups: number;
  teachers: number;
}

export function useStats(studyYear: string) {
  return useQuery({
    queryKey: ["stats", studyYear],
    queryFn: async (): Promise<Stats> => {
      // Get all children who were in groups of this study year (any history record)
      const { data: historyRows, error: histErr } = await supabase
        .from("child_group_history")
        .select("child_id, group:groups!inner(study_year)")
        .eq("groups.study_year", studyYear);
      if (histErr) throw histErr;

      // Get unique child IDs for this study year
      const childIds = [...new Set((historyRows ?? []).map((r: any) => r.child_id))];

      // Fetch gender for those children
      let activeChildren: { gender: string }[] = [];
      if (childIds.length > 0) {
        const { data: kids, error: kidErr } = await supabase
          .from("childrens")
          .select("gender")
          .in("id", childIds);
        if (kidErr) throw kidErr;
        activeChildren = kids ?? [];
      }

      // Count groups for this study year
      const { count: groupCount, error: groupErr } = await supabase
        .from("groups")
        .select("*", { count: "exact", head: true })
        .eq("study_year", studyYear);
      if (groupErr) throw groupErr;

      // Count teachers
      const { count: teacherCount, error: teacherErr } = await supabase
        .from("teachers")
        .select("*", { count: "exact", head: true });
      if (teacherErr) throw teacherErr;

      return {
        total: activeChildren.length,
        girls: activeChildren.filter((c: any) => c.gender === "female").length,
        boys: activeChildren.filter((c: any) => c.gender === "male").length,
        groups: groupCount ?? 0,
        teachers: teacherCount ?? 0,
      };
    },
  });
}
