/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  GraduationCap
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
import { UserProfile } from "./services/storageService";

type Module = "dashboard" | "attendance" | "assignments" | "notes" | "ppt";

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrationRequired, setRegistrationRequired] = useState(false);
  const [activeModule, setActiveModule] = useState<Module>("dashboard");

  useEffect(() => {
    const u = getLocalUser();
    if (u) {
      setUser(u);
      checkProfile(u);
    }
    setLoading(false);
  }, []);

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
  };

  const handleRegistrationComplete = () => {
    const u = getLocalUser();
    if (u) {
      setUser(u);
      setRegistrationRequired(false);
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
    { id: "attendance", label: "AI Attendance", icon: UserCheck },
    { id: "assignments", label: "Assignments", icon: FileText },
    { id: "notes", label: "Study Notes", icon: StickyNote },
    { id: "ppt", label: "PPT Content", icon: Presentation },
  ] : [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <div className="h-screen w-screen flex bg-[#0c0e14] text-white overflow-hidden relative">
      <div className="mesh-bg"></div>
      
      {/* Sidebar */}
      <aside className="w-64 glass-nav flex flex-col">
        <div className="p-8 pb-10">
          <div className="flex items-center gap-3 mb-1">
             <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <GraduationCap size={18} className="text-white" />
             </div>
             <span className="font-extrabold text-2xl tracking-tighter">Teach<span className="text-indigo-400">Ease</span></span>
          </div>
          <p className="text-[10px] uppercase tracking-widest opacity-40">AI Academic Suite</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id as Module)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                activeModule === item.id 
                  ? "bg-white/10 text-white border border-white/5 shadow-sm" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={18} className={cn(activeModule === item.id ? "text-indigo-400" : "group-hover:text-white")} />
              {item.label}
              {activeModule === item.id && <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="p-6">
          <div className="glass-card p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-white/10 bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-400">
                {user.name[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{user.name}</p>
                <p className="text-[10px] opacity-40 truncate uppercase tracking-tighter">Verified {user.role}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                localLogout();
                window.location.reload();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all border border-white/5"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-24 flex items-center px-12 justify-between">
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold opacity-40 mb-1">
              {user.role} Workspace
            </h2>
            <h3 className="text-3xl font-extralight tracking-tight capitalize">
              {activeModule === "dashboard" ? (
                <>Welcome, <span className="accent-text text-indigo-400">{user.name.split(" ")[0]}</span>.</>
              ) : activeModule.replace("-", " ")}
            </h3>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="hidden md:flex gap-4">
                <div className="glass-card px-4 py-2 flex flex-col justify-center min-w-[120px]">
                  <span className="text-[10px] uppercase opacity-40 font-bold">Role</span>
                  <span className="text-sm font-bold flex items-center gap-1.5 capitalize">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                    {user.role}
                  </span>
                </div>
             </div>
             <button className="w-12 h-12 glass-card flex items-center justify-center text-white/40 hover:text-white transition-all">
                <Settings size={20} />
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto h-full"
            >
              {isTeacher ? (
                <>
                  {activeModule === "dashboard" && <DashboardHome user={user as any} onNavigate={setActiveModule} />}
                  {activeModule === "attendance" && <AttendanceModule user={user as any} />}
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
    </div>
  );
}


