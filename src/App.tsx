/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { getLocalUser, logout as localLogout } from "./lib/firebase";
import { 
  LayoutDashboard, 
  UserCheck, 
  FileText, 
  StickyNote, 
  Presentation, 
  LogOut, 
  Settings,
  GraduationCap,
  Users,
  Key,
  ShieldCheck
} from "lucide-react";
import { cn } from "./lib/utils";
import { motion, AnimatePresence } from "motion/react";

// Components for modules
import AttendanceModule from "./components/AttendanceModule";
import AssignmentModule from "./components/AssignmentModule";
import NotesModule from "./components/NotesModule";
import PPTModule from "./components/PPTModule";
import DashboardHome from "./components/DashboardHome";
import ProfileRegistration from "./components/ProfileRegistration";
import StudentDashboard from "./components/StudentDashboard";
import AuthForm from "./components/AuthForm";
import StudentManagementModule from "./components/StudentManagementModule";
import AISettingsModal from "./components/AISettingsModal";
import { storage, UserProfile } from "./services/storageService";

type Module = "dashboard" | "attendance" | "students" | "assignments" | "notes" | "ppt";

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrationRequired, setRegistrationRequired] = useState(false);
  const [activeModule, setActiveModule] = useState<Module>("dashboard");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const u = getLocalUser();
    if (u) {
      setUser(u);
      checkProfile(u);
      checkApiKey(u.uid);
    }
    setLoading(false);
  }, []);

  const checkApiKey = (teacherId: string) => {
    const key = storage.getTeacherApiKey(teacherId) || import.meta.env.VITE_GEMINI_API_KEY;
    setHasApiKey(Boolean(key && key.trim()));
  };

  const checkProfile = (u: UserProfile) => {
    if (u.role === "teacher" && !u.department) {
      setRegistrationRequired(true);
    } else if (u.role === "student" && !u.enrollmentNumber) {
      setRegistrationRequired(true);
    } else {
      setRegistrationRequired(false);
    }
  };

  const handleLogin = (u: UserProfile) => {
    setUser(u);
    checkProfile(u);
    checkApiKey(u.uid);
  };

  const handleRegistrationComplete = () => {
    const u = getLocalUser();
    if (u) {
      setUser(u);
      setRegistrationRequired(false);
      checkApiKey(u.uid);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0c0e14]">
        <div className="mesh-bg"></div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onLogin={handleLogin} />;
  }

  if (registrationRequired) {
    return <ProfileRegistration user={user as any} onComplete={handleRegistrationComplete} />;
  }

  const isTeacher = user.role === "teacher";

  const navItems = isTeacher ? [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "attendance", label: "Smart Attendance", icon: UserCheck },
    { id: "students", label: "Student Directory", icon: Users },
    { id: "assignments", label: "AI Assignments", icon: FileText },
    { id: "notes", label: "Lecture Notes", icon: StickyNote },
    { id: "ppt", label: "PPT Content", icon: Presentation },
  ] : [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <div className="h-screen w-screen flex bg-[#0c0e14] text-white overflow-hidden relative font-sans">
      <div className="mesh-bg"></div>
      
      {/* Sidebar */}
      <aside className="w-64 glass-nav flex flex-col shrink-0 z-20">
        <div className="p-7 pb-8">
          <div className="flex items-center gap-3 mb-1">
             <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
               <GraduationCap size={20} className="text-white" />
             </div>
             <span className="font-extrabold text-2xl tracking-tighter">Teach<span className="text-indigo-400">Ease</span></span>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-medium">Smart Tools for Smarter Teaching</p>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id as Module)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all group",
                activeModule === item.id 
                  ? "bg-white/10 text-white border border-white/10 shadow-sm" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={17} className={cn(activeModule === item.id ? "text-indigo-400" : "group-hover:text-white")} />
              {item.label}
              {activeModule === item.id && <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full ml-auto" />}
            </button>
          ))}

          {isTeacher && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-white/60 hover:bg-white/5 hover:text-white transition-all group"
            >
              <Key size={17} className="text-indigo-400/80 group-hover:text-indigo-400" />
              AI Key (BYOK)
              {hasApiKey ? (
                <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400" title="Key Active" />
              ) : (
                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">Set</span>
              )}
            </button>
          )}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-white/5">
          <div className="glass-card p-3.5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border border-white/10 bg-indigo-500/10 flex items-center justify-center font-bold text-sm text-indigo-400">
                {user.name[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate text-white">{user.name}</p>
                <p className="text-[10px] text-white/40 truncate uppercase tracking-wider">{user.role}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                localLogout();
                window.location.reload();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-all border border-white/5"
            >
              <LogOut size={13} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="h-20 flex items-center px-10 justify-between border-b border-white/5">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 mb-0.5">
              {user.role} Workspace
            </h2>
            <h3 className="text-xl font-bold tracking-tight capitalize text-white">
              {activeModule === "dashboard" ? (
                <>Welcome back, <span className="text-indigo-400">{user.name.split(" ")[0]}</span></>
              ) : (
                navItems.find(n => n.id === activeModule)?.label || activeModule
              )}
            </h3>
          </div>
          
          <div className="flex items-center gap-4">
            {isTeacher && (
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card text-xs font-medium hover:bg-white/10 transition-all"
              >
                <Key size={14} className="text-indigo-400" />
                <span className="text-white/80">Gemini Key:</span>
                {hasApiKey ? (
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Not Set
                  </span>
                )}
              </button>
            )}

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
              title="AI Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto h-full"
            >
              {isTeacher ? (
                <>
                  {activeModule === "dashboard" && (
                    <DashboardHome 
                      user={user as any} 
                      onNavigate={(mod) => setActiveModule(mod)} 
                      onOpenSettings={() => setIsSettingsOpen(true)} 
                    />
                  )}
                  {activeModule === "attendance" && <AttendanceModule user={user as any} />}
                  {activeModule === "students" && <StudentManagementModule teacher={user as any} />}
                  {activeModule === "assignments" && <AssignmentModule user={user as any} />}
                  {activeModule === "notes" && <NotesModule user={user as any} />}
                  {activeModule === "ppt" && <PPTModule user={user as any} />}
                </>
              ) : (
                <StudentDashboard user={user as any} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Global AI Settings Modal (BYOK) */}
      {isTeacher && (
        <AISettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          teacherId={user.uid}
          onKeyUpdated={(active) => setHasApiKey(active)}
        />
      )}
    </div>
  );
}
