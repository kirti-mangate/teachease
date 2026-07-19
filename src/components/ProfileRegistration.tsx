import React, { useState, useRef } from "react";
import { setLocalSession } from "../lib/firebase";
import { storage, UserProfile } from "../services/storageService";
import { GraduationCap, BookOpen, UserCircle, Briefcase, Hash, GraduationCap as StudentIcon, Mic, Camera, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { faceService } from "../services/faceRecognitionService";
import { cn } from "../lib/utils";

interface ProfileRegistrationProps {
  user: UserProfile;
  onComplete: () => void;
}

const ProfileRegistration: React.FC<ProfileRegistrationProps> = ({ user, onComplete }) => {
  const [role, setRole] = useState<"teacher" | "student" | null>(user.role || null);
  const [step, setStep] = useState(role ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Teacher fields
  const [department, setDepartment] = useState("");
  const [subject, setSubject] = useState("");

  // Student fields
  const [enrollment, setEnrollment] = useState("");
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [faceDescriptor, setFaceDescriptor] = useState<number[] | null>(null);
  
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = async () => {
          const descriptor = await faceService.getFaceEmbedding(img);
          if (descriptor) {
            setFaceDescriptor(Array.from(descriptor));
          } else {
            alert("No face detected. Please try another photo.");
          }
          setAiLoading(false);
        };
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setAiLoading(false);
    }
  };

  const handleFinish = () => {
    setLoading(true);
    try {
      const updatedUser: UserProfile = {
        ...user,
        role: role!,
        ...(role === "teacher" ? { department, subject } : { enrollmentNumber: enrollment, year, branch, faceDescriptor: faceDescriptor || undefined })
      };

      storage.saveUser(updatedUser);
      setLocalSession(updatedUser);
      onComplete();
    } catch (err) {
      console.error("Profile update failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0c0e14] p-6 overflow-y-auto">
      <div className="mesh-bg"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full glass-card p-10 space-y-8"
      >
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tighter mb-2">Complete your <span className="text-indigo-400">Profile</span></h2>
          <p className="text-white/40 text-sm">To provide the best AI experience, we need a few more details.</p>
        </div>

        {step === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => { setRole("teacher"); setStep(2); }}
              className="p-8 glass-card border-none bg-white/5 hover:bg-indigo-500/10 hover:ring-2 hover:ring-indigo-500/50 transition-all flex flex-col items-center gap-4 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <GraduationCap size={40} />
              </div>
              <span className="font-bold tracking-tight">I am a Teacher</span>
            </button>
            <button 
              onClick={() => { setRole("student"); setStep(2); }}
              className="p-8 glass-card border-none bg-white/5 hover:bg-sky-500/10 hover:ring-2 hover:ring-sky-500/50 transition-all flex flex-col items-center gap-4 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                <StudentIcon size={40} />
              </div>
              <span className="font-bold tracking-tight">I am a Student</span>
            </button>
          </div>
        )}

        {step === 2 && role === "teacher" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Department</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Science, Humanities"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pl-12 text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Subject</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Physics, History"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pl-12 text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 py-4 border border-white/10 rounded-xl font-bold hover:bg-white/5 transition-all">Back</button>
              <button 
                onClick={handleFinish} 
                disabled={!department || !subject || loading}
                className="flex-[2] py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-400 transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Finish Registration"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && role === "student" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Enrollment Number</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="text"
                    value={enrollment}
                    onChange={(e) => setEnrollment(e.target.value)}
                    placeholder="XYZ-202X-001"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pl-12 text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Year</label>
                <input 
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g. 2024"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Branch</label>
                <input 
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. CS, ME"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            
            <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
              <p className="text-[10px] text-indigo-400 font-bold uppercase mb-4 text-center">AI Biometric Identity</p>
              
              <div className="flex flex-col items-center gap-4">
                <label className="cursor-pointer group flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-all border-2 border-dashed",
                    faceDescriptor ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-white/5 border-white/20 text-white/40 group-hover:border-indigo-500 group-hover:text-indigo-400"
                  )}>
                    {aiLoading ? <RefreshCw className="animate-spin" size={24} /> : (faceDescriptor ? <UserCircle size={32} /> : <Camera size={24} />)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                    {faceDescriptor ? "Face Scan Extracted" : "Upload Face Sample"}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>

                <div className="w-full h-px bg-white/5" />

                <div className="flex items-center gap-3 opacity-30 cursor-not-allowed">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                    <Mic size={14} />
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-widest leading-none">Voice ID <br/><span className="text-[6px] opacity-50">(Future Integration)</span></span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                type="button" 
                 onClick={() => setStep(1)} 
                 className="flex-1 py-4 border border-white/10 rounded-xl font-bold hover:bg-white/5 transition-all"
              >
                Back
              </button>
              <button 
                type="button" 
                onClick={handleFinish} 
                disabled={!enrollment || !year || !branch || !faceDescriptor || loading}
                className="flex-[2] py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-400 transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Finish Registration"}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProfileRegistration;
