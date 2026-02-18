
-- Fix security definer views by recreating with security_invoker=on
DROP VIEW IF EXISTS public.children_with_group;
DROP VIEW IF EXISTS public.teachers_with_group;

CREATE VIEW public.children_with_group
WITH (security_invoker=on) AS
SELECT
  c.*,
  g.name AS current_group_name,
  g.study_year AS current_study_year,
  CASE WHEN c.withdrawn IS NULL THEN 'Наявний' ELSE 'Вибув' END AS status
FROM public.childrens c
LEFT JOIN public.child_group_history cgh ON cgh.child_id = c.id AND cgh.is_current = TRUE
LEFT JOIN public.groups g ON g.id = cgh.group_id;

CREATE VIEW public.teachers_with_group
WITH (security_invoker=on) AS
SELECT
  t.*,
  g.name AS current_group_name,
  g.study_year AS current_study_year
FROM public.teachers t
LEFT JOIN public.teacher_group_history tgh ON tgh.teacher_id = t.id AND tgh.is_current = TRUE
LEFT JOIN public.groups g ON g.id = tgh.group_id;
