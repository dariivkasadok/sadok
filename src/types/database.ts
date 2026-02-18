// Types matching the database schema

export interface DbChild {
  id: string;
  last_name: string;
  first_name: string;
  middle_name: string;
  gender: string;
  birth_date: string | null;
  household_book_number: string;
  settlement: string;
  street: string;
  house: string;
  apartment: string;
  enrolled: string | null;
  withdrawn: string | null;
  birth_certificate: string;
  location_status: string;
  orphan: boolean;
  low_income: boolean;
  inclusion: boolean;
  chornobyl: boolean;
  ato: boolean;
  many_children_family: boolean;
  idp: boolean;
  war_child: boolean;
  deprived_parental_care: boolean;
  missing_parents: boolean;
  parents_ubd: boolean;
  parents_military: boolean;
  parents_full_name: string;
  phone: string;
  workplace: string;
  guardian: string;
  child_notes: string;
  parents_note: string;
  created_at: string;
  updated_at: string;
}

// Extended child with view fields
export interface DbChildWithGroup extends DbChild {
  current_group_name: string | null;
  current_study_year: string | null;
  status: string;
}

export interface DbGroup {
  id: string;
  name: string;
  study_year: string;
  study_start_date: string | null;
  study_end_date: string | null;
  created_at: string;
}

export interface DbTeacher {
  id: string;
  full_name: string;
  position: string;
  phone: string;
  email: string;
  experience: number;
  education: string;
  category: string;
  pedagogical_title: string;
  created_at: string;
  updated_at: string;
}

export interface DbTeacherWithGroup extends DbTeacher {
  current_group_name: string | null;
  current_study_year: string | null;
}

export interface DbChildGroupHistory {
  id: string;
  child_id: string;
  group_id: string;
  is_current: boolean;
  created_at: string;
}

export interface DbTeacherGroupHistory {
  id: string;
  teacher_id: string;
  group_id: string;
  is_current: boolean;
  created_at: string;
}
