import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("http"));
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database helper operations with graceful degradation
export const supabaseDb = {
  // Profiles
  async getProfiles() {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("Supabase profiles query failed:", err);
      return null;
    }
  },

  async upsertProfile(profile: any) {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from("profiles").upsert(profile).select();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("Supabase upsertProfile failed:", err);
      return null;
    }
  },

  // Students
  async getStudents() {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from("students").select("*, student_faces(*)");
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("Supabase getStudents failed:", err);
      return null;
    }
  },

  async saveStudent(student: any, faceDescriptor?: number[]) {
    if (!supabase) return null;
    try {
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .upsert(student)
        .select()
        .single();
      if (studentError) throw studentError;

      if (faceDescriptor && studentData) {
        await supabase.from("student_faces").upsert({
          student_id: studentData.id,
          descriptor: faceDescriptor,
        });
      }
      return studentData;
    } catch (err) {
      console.warn("Supabase saveStudent failed:", err);
      return null;
    }
  },

  // Attendance
  async saveAttendanceRecords(records: any[]) {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from("attendance").insert(records);
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("Supabase saveAttendanceRecords failed:", err);
      return null;
    }
  },

  // Content (Assignments, Notes, Presentations)
  async saveAIContent(content: any) {
    if (!supabase) return null;
    try {
      const table = content.type === "assignment" ? "assignments" : content.type === "note" ? "notes" : "presentations";
      const { data, error } = await supabase.from(table).insert([content]);
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn(`Supabase saveAIContent failed for table ${content.type}:`, err);
      return null;
    }
  }
};
