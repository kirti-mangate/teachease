import React from "react";
import { UserProfile } from "../services/storageService";
import { LayoutDashboard, UserCheck, FileText, BookOpen, StickyNote, Presentation, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface DashboardHomeProps {
  user: UserProfile;
  onNavigate: (module: any) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ user, onNavigate }) => {
  const stats = [
    { label: "Today's Attendance", value: "94.2%", change: "+2% from yesterday" },
    { label: "AI Content Generated", value: "24", change: "Across all tools" },
    { label: "Tasks Today", value: "12", change: "Active across modules" },
  ];

  const quickTools = [
    { id: "attendance", label: "Attendance Tracker", icon: UserCheck, desc: "Mark attendance and auto-gen reports.", color: "bg-emerald-500/20 text-emerald-400" },
    { id: "assignments", label: "Assignment Gen", icon: FileText, desc: "Generate topic-based homework.", color: "bg-orange-500/20 text-orange-400" },
    { id: "ppt", label: "PPT Creator", icon: Presentation, desc: "AI-structured presentation outlines.", color: "bg-pink-500/20 text-pink-400" },
    { id: "notes", label: "Note Summarizer", icon: StickyNote, desc: "Turn topics into scannable notes.", color: "bg-sky-500/20 text-sky-400" },
  ];

  return (
    <div className="space-y-10">
      {/* Quick AI Command / Search Bar Equivalent */}
      <section className="glass-card p-10 border-indigo-500/30 bg-indigo-500/5 relative overflow-hidden">
        <div className="relative z-10">
           <div className="flex justify-between items-center mb-6 text-xs font-bold uppercase tracking-widest text-indigo-300">
            <span className="flex items-center gap-2">✨ Quick AI Generator</span>
            <span className="opacity-40">System Active</span>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="e.g. Generate a Grade 10 assignment on Photosynthesis..." 
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-white/20"
            />
            <button className="absolute right-3 top-3 bottom-3 px-10 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-95">
              Generate
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4" />
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="glass-card p-8 flex flex-col"
          >
            <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">{stat.label}</p>
            <h3 className="text-4xl font-extrabold mt-2 text-indigo-400 leading-none">{stat.value}</h3>
            <p className="text-[10px] text-white/40 mt-3">{stat.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Tools */}
      <div>
        <h2 className="text-xs uppercase font-bold tracking-[0.4em] mb-8 opacity-40">Interactive Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickTools.map((tool, i) => (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 + 0.3 }}
              key={tool.id}
              onClick={() => onNavigate(tool.id)}
              className="group glass-card p-8 text-left hover:bg-white/5 transition-all hover:-translate-y-1"
            >
              <div className={`w-14 h-14 ${tool.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                <tool.icon size={28} />
              </div>
              <h3 className="font-bold text-xl mb-3">{tool.label}</h3>
              <p className="text-xs text-white/50 leading-relaxed">{tool.desc}</p>
              <div className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Launch Module <ArrowRight size={14} />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
