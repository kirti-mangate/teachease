import React, { useState, useEffect } from "react";
import { storage, UserProfile, AttendanceRecord } from "../services/storageService";
import { UserCheck, Save, Calendar as CalendarIcon, Users, CheckCircle2, XCircle, Camera, Sparkles, RefreshCw, ScanFace, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import { faceService } from "../services/faceRecognitionService";

interface AttendanceModuleProps {
  user: UserProfile;
}

interface StudentRecord {
  uid: string;
  name: string;
  faceDescriptor?: number[];
  enrollmentNumber: string;
}

const AttendanceModule: React.FC<AttendanceModuleProps> = ({ user }) => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [attendance, setAttendance] = useState<Record<string, "present" | "absent">>({});
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [scanResult, setScanResult] = useState<{ name: string; id: string }[] | null>(null);
  const [sessionSubject, setSessionSubject] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchRecentRecords();
  }, [user]);

  const fetchStudents = () => {
    const allUsers = storage.getUsers();
    const studentList = allUsers
      .filter(u => u.role === "student")
      .map(u => ({
        uid: u.uid,
        name: u.name,
        faceDescriptor: u.faceDescriptor,
        enrollmentNumber: u.enrollmentNumber || "N/A"
      }));
    setStudents(studentList);
  };

  const fetchRecentRecords = () => {
    const allAttendance = storage.getAttendance();
    const teacherRecords = allAttendance
      .filter(r => r.teacherId === user.uid)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setRecentRecords(teacherRecords.slice(0, 10));
  };

  const handleMark = (studentId: string, status: "present" | "absent") => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleAIPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || students.length === 0) return;

    setAiLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = async () => {
          const registeredStudents = students
            .filter(s => s.faceDescriptor)
            .map(s => ({
              id: s.uid,
              name: s.name,
              descriptor: new Float32Array(s.faceDescriptor!)
            }));

          const detectedFaces = await faceService.detectAllFaces(img);
          const matches = faceService.findMatches(detectedFaces, registeredStudents);
          
          const newAttendance: Record<string, "present" | "absent"> = {};
          const matchedList: { name: string; id: string }[] = [];

          students.forEach(s => {
            newAttendance[s.uid] = "absent";
          });

          matches.forEach(match => {
            if (match.id !== "unknown") {
              newAttendance[match.id] = "present";
              matchedList.push({ name: match.name, id: match.id });
            }
          });

          setAttendance(newAttendance);
          setScanResult(matchedList);
          setAiLoading(false);
        };
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setAiLoading(false);
    }
  };

  const handleSave = () => {
    if (Object.keys(attendance).length === 0) return;
    setSaving(true);
    try {
      const records: AttendanceRecord[] = Object.entries(attendance).map(([studentId, status]) => {
        const student = students.find(s => s.uid === studentId);
        return {
          id: Math.random().toString(36).substr(2, 9),
          studentId: studentId,
          studentName: student?.name || "Unknown",
          status: status,
          date: date,
          subject: sessionSubject || "General",
          teacherId: user.uid,
          method: scanResult ? "ai" : "manual",
          createdAt: new Date().toISOString()
        };
      });
      
      storage.saveAttendance(records);
      setAttendance({});
      setScanResult(null);
      fetchRecentRecords();
      alert("Attendance records saved locally.");
    } catch (err) {
      console.error("Failed to save attendance:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-card p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-500/20 text-sky-400 rounded-2xl flex items-center justify-center">
                <ScanFace size={24} />
              </div>
              <div>
                <h3 className="font-bold text-xl">AI Attendance Scanner</h3>
                <p className="text-[10px] uppercase tracking-widest text-white/40">Visual Recognition Terminal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="cursor-pointer group">
                <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-5 py-3 rounded-2xl text-indigo-400 font-bold text-sm hover:bg-indigo-500/20 transition-all">
                  {aiLoading ? <RefreshCw className="animate-spin" size={18} /> : <Camera size={18} />}
                  Scan Class Photo
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleAIPhotoUpload} disabled={aiLoading} />
              </label>
              
              <div className="flex items-center gap-2 bg-white/5 p-3 rounded-2xl border border-white/5">
                <CalendarIcon size={16} className="text-white/40" />
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent text-sm font-bold focus:outline-none text-white/80"
                />
              </div>

              <div className="flex items-center gap-2 bg-white/5 p-3 rounded-2xl border border-white/5">
                <BookOpen size={16} className="text-white/40" />
                <input 
                  type="text" 
                  placeholder="Subject"
                  value={sessionSubject} 
                  onChange={(e) => setSessionSubject(e.target.value)}
                  className="bg-transparent text-sm font-bold focus:outline-none text-white/80 w-24"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
               <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Status Present</span>
               <p className="text-2xl font-black mt-2">{Object.values(attendance).filter(v => v === "present").length}</p>
            </div>
            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
               <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">Status Absent</span>
               <p className="text-2xl font-black mt-2">{Object.values(attendance).filter(v => v === "absent").length}</p>
            </div>
          </div>

          <div className="space-y-3">
            {students.length > 0 ? students.map((student) => (
              <div key={student.uid} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 group transition-all hover:bg-white/10">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center font-bold text-xs">
                      {student.name.split(" ").map(n => n[0]).join("")}
                   </div>
                   <div>
                     <p className="font-bold text-white/90">{student.name}</p>
                     <p className="text-[9px] font-bold uppercase opacity-30">{student.enrollmentNumber}</p>
                   </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleMark(student.uid, "present")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all",
                      attendance[student.uid] === "present" ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "bg-white/5 text-white/40 border border-white/5 hover:border-emerald-500/50"
                    )}
                  >
                    <CheckCircle2 size={14} />
                    Present
                  </button>
                  <button 
                    onClick={() => handleMark(student.uid, "absent")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all",
                      attendance[student.uid] === "absent" ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "bg-white/5 text-white/40 border border-white/5 hover:border-red-500/50"
                    )}
                  >
                    <XCircle size={14} />
                    Absent
                  </button>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center space-y-4">
                 <Users size={48} className="mx-auto opacity-10" />
                 <p className="text-sm text-white/40">No students registered in the database yet.</p>
              </div>
            )}
          </div>

          <button 
            disabled={Object.keys(attendance).length === 0 || saving}
            onClick={handleSave}
            className="w-full mt-10 py-5 bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(99,102,241,0.3)] active:scale-[0.98]"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} />
                Save & Synchronize Records
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-8 bg-black/20">
          <h3 className="text-xs uppercase font-bold tracking-[0.2em] mb-6 opacity-40 flex items-center gap-2 text-sky-400">
            <Sparkles size={14} />
            AI Calibration
          </h3>
          <div className="space-y-4">
             <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/20 space-y-2">
                <p className="text-[10px] uppercase font-bold tracking-widest text-sky-400">Recognition Model</p>
                <p className="text-xs font-semibold text-white/80">SSD MobileNet V1</p>
             </div>
             <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">Confidence Threshold</p>
                <div className="h-1 bg-white/10 rounded-full">
                  <div className="h-full bg-sky-400 w-[60%]" />
                </div>
             </div>
          </div>
        </div>

        <div className="glass-card p-8">
          <h3 className="text-xs uppercase font-bold tracking-[0.2em] mb-6 opacity-40 flex items-center gap-2">
            <CalendarIcon size={14} />
            Recent Snapshots
          </h3>
          <div className="space-y-4">
            {recentRecords.length > 0 ? recentRecords.map((record, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  record.status === "present" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                )} />
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold truncate tracking-tight">{record.studentName}</p>
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">{record.date}</p>
                </div>
                {record.method === "ai" && <Sparkles size={12} className="text-sky-400" />}
              </div>
            )) : (
              <p className="text-sm text-white/40 italic">No historical data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModule;
