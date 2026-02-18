import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Fetches distinct study_year values from the groups table */
export function useAcademicYears() {
  return useQuery({
    queryKey: ["academic_years"],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("groups")
        .select("study_year")
        .order("study_year");
      if (error) throw error;
      const unique = [...new Set((data ?? []).map((r) => r.study_year))];
      return unique;
    },
  });
}

/** Returns academic years from groups + one extra future year */
export function useAcademicYearsWithNext() {
  const query = useAcademicYears();

  const yearsWithNext = (() => {
    const years = query.data ?? [];
    if (years.length === 0) return [];

    const last = years[years.length - 1]; // e.g. "2025-2026"
    const endYear = parseInt(last.split("-")[1], 10);
    const nextYear = `${endYear}-${endYear + 1}`;

    if (!years.includes(nextYear)) {
      return [...years, nextYear];
    }
    return years;
  })();

  return { ...query, data: yearsWithNext, baseYears: query.data ?? [] };
}
