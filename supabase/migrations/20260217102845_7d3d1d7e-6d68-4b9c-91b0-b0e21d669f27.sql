
-- ============================================
-- 1. FUNCTION: auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- 2. TABLE: childrens
-- ============================================
CREATE TABLE public.childrens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  middle_name TEXT DEFAULT '',
  gender TEXT NOT NULL DEFAULT 'male',
  birth_date DATE,
  household_book_number TEXT DEFAULT '',
  settlement TEXT DEFAULT '',
  street TEXT DEFAULT '',
  house TEXT DEFAULT '',
  apartment TEXT DEFAULT '',
  enrolled DATE,
  withdrawn DATE,
  birth_certificate TEXT DEFAULT '',
  location_status TEXT DEFAULT '',
  orphan BOOLEAN DEFAULT FALSE,
  low_income BOOLEAN DEFAULT FALSE,
  inclusion BOOLEAN DEFAULT FALSE,
  chornobyl BOOLEAN DEFAULT FALSE,
  ato BOOLEAN DEFAULT FALSE,
  many_children_family BOOLEAN DEFAULT FALSE,
  idp BOOLEAN DEFAULT FALSE,
  war_child BOOLEAN DEFAULT FALSE,
  deprived_parental_care BOOLEAN DEFAULT FALSE,
  missing_parents BOOLEAN DEFAULT FALSE,
  parents_ubd BOOLEAN DEFAULT FALSE,
  parents_military BOOLEAN DEFAULT FALSE,
  parents_full_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  workplace TEXT DEFAULT '',
  guardian TEXT DEFAULT 'мати',
  child_notes TEXT DEFAULT '',
  parents_note TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Validation trigger for gender
CREATE OR REPLACE FUNCTION public.validate_children_gender()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.gender NOT IN ('male', 'female') THEN
    RAISE EXCEPTION 'gender must be male or female';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_validate_children_gender
  BEFORE INSERT OR UPDATE ON public.childrens
  FOR EACH ROW EXECUTE FUNCTION public.validate_children_gender();

-- Validation trigger for guardian
CREATE OR REPLACE FUNCTION public.validate_children_guardian()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.guardian NOT IN ('батько', 'мати', 'опікун') THEN
    RAISE EXCEPTION 'guardian must be батько, мати or опікун';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_validate_children_guardian
  BEFORE INSERT OR UPDATE ON public.childrens
  FOR EACH ROW EXECUTE FUNCTION public.validate_children_guardian();

CREATE TRIGGER trg_childrens_updated_at
  BEFORE UPDATE ON public.childrens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 3. TABLE: groups
-- ============================================
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  study_year TEXT NOT NULL,
  study_start_date DATE,
  study_end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint: one group name per study year
ALTER TABLE public.groups ADD CONSTRAINT uq_groups_name_year UNIQUE (name, study_year);

-- ============================================
-- 4. TABLE: teachers
-- ============================================
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  position TEXT DEFAULT 'Вихователь',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  experience INTEGER DEFAULT 0,
  education TEXT DEFAULT '',
  category TEXT DEFAULT '',
  pedagogical_title TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_teachers_updated_at
  BEFORE UPDATE ON public.teachers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 5. TABLE: child_group_history
-- ============================================
CREATE TABLE public.child_group_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.childrens(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  is_current BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (child_id, group_id)
);

CREATE INDEX idx_cgh_child ON public.child_group_history(child_id);
CREATE INDEX idx_cgh_group ON public.child_group_history(group_id);
CREATE INDEX idx_cgh_current ON public.child_group_history(is_current) WHERE is_current = TRUE;

-- Trigger: when inserting a new current assignment, deactivate previous ones
CREATE OR REPLACE FUNCTION public.deactivate_old_child_group()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_current = TRUE THEN
    UPDATE public.child_group_history
    SET is_current = FALSE
    WHERE child_id = NEW.child_id
      AND id != NEW.id
      AND is_current = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_deactivate_old_child_group
  AFTER INSERT OR UPDATE ON public.child_group_history
  FOR EACH ROW EXECUTE FUNCTION public.deactivate_old_child_group();

-- ============================================
-- 6. TABLE: teacher_group_history
-- ============================================
CREATE TABLE public.teacher_group_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  is_current BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (teacher_id, group_id)
);

CREATE INDEX idx_tgh_teacher ON public.teacher_group_history(teacher_id);
CREATE INDEX idx_tgh_group ON public.teacher_group_history(group_id);
CREATE INDEX idx_tgh_current ON public.teacher_group_history(is_current) WHERE is_current = TRUE;

-- Trigger: deactivate old teacher assignments
CREATE OR REPLACE FUNCTION public.deactivate_old_teacher_group()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_current = TRUE THEN
    UPDATE public.teacher_group_history
    SET is_current = FALSE
    WHERE teacher_id = NEW.teacher_id
      AND id != NEW.id
      AND is_current = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_deactivate_old_teacher_group
  AFTER INSERT OR UPDATE ON public.teacher_group_history
  FOR EACH ROW EXECUTE FUNCTION public.deactivate_old_teacher_group();

-- ============================================
-- 7. VIEW: children with current group
-- ============================================
CREATE OR REPLACE VIEW public.children_with_group AS
SELECT
  c.*,
  g.name AS current_group_name,
  g.study_year AS current_study_year,
  CASE WHEN c.withdrawn IS NULL THEN 'Наявний' ELSE 'Вибув' END AS status
FROM public.childrens c
LEFT JOIN public.child_group_history cgh ON cgh.child_id = c.id AND cgh.is_current = TRUE
LEFT JOIN public.groups g ON g.id = cgh.group_id;

-- ============================================
-- 8. VIEW: teachers with current group
-- ============================================
CREATE OR REPLACE VIEW public.teachers_with_group AS
SELECT
  t.*,
  g.name AS current_group_name,
  g.study_year AS current_study_year
FROM public.teachers t
LEFT JOIN public.teacher_group_history tgh ON tgh.teacher_id = t.id AND tgh.is_current = TRUE
LEFT JOIN public.groups g ON g.id = tgh.group_id;

-- ============================================
-- 9. RLS (permissive — no auth yet)
-- ============================================
ALTER TABLE public.childrens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_group_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_group_history ENABLE ROW LEVEL SECURITY;

-- Childrens
CREATE POLICY "Allow all on childrens" ON public.childrens FOR ALL USING (true) WITH CHECK (true);

-- Groups
CREATE POLICY "Allow all on groups" ON public.groups FOR ALL USING (true) WITH CHECK (true);

-- Teachers
CREATE POLICY "Allow all on teachers" ON public.teachers FOR ALL USING (true) WITH CHECK (true);

-- Child group history
CREATE POLICY "Allow all on child_group_history" ON public.child_group_history FOR ALL USING (true) WITH CHECK (true);

-- Teacher group history
CREATE POLICY "Allow all on teacher_group_history" ON public.teacher_group_history FOR ALL USING (true) WITH CHECK (true);
