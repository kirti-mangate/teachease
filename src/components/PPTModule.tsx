import React, { useState } from "react";
import { generatePPTContent } from "../services/geminiService";
import { Presentation, Sparkles, Download, Copy, RefreshCw, Layout } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { storage, UserProfile, AIContent } from "../services/storageService";

interface PPTModuleProps {
  user: UserProfile;
}

const PPTModule: React.FC<PPTModuleProps> = ({ user }) => {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const content = await generatePPTContent(topic);
      const output = content || "Failed to generate content.";
      setResult(output);
      
      const newContent: AIContent = {
        id: Math.random().toString(36).substr(2, 9),
        type: "ppt",
        teacherId: user.uid,
        subject: "General",
        topic,
        content: output,
        createdAt: new Date().toISOString()
      };
      
      storage.saveContent(newContent);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <div className="glass-card p-8">
          <h3 className="font-bold text-xl mb-8 flex items-center gap-3">
             <div className="w-10 h-10 bg-pink-500/20 text-pink-400 rounded-xl flex items-center justify-center">
              <Presentation size={20} />
            </div>
            Slide Content Designer
          </h3>
          
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Presentation Topic</label>
              <input 
                type="text" 
                placeholder="e.g. Climate Change and its Effects" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-4 bg-white/5 rounded-xl border border-white/5 focus:ring-1 focus:ring-indigo-500/30 focus:outline-none transition-all placeholder:text-white/20"
              />
            </div>
          </div>

          <button 
            disabled={!topic || loading}
            onClick={handleGenerate}
            className="w-full mt-10 py-5 bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-400 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
            Generate Slide Structure
          </button>
        </div>
        
        <div className="glass-card p-8 bg-white/5 border-white/10 relative overflow-hidden group">
           <Layout size={120} className="absolute -top-6 -right-6 text-white/5 group-hover:scale-110 transition-transform" />
           <div className="relative z-10">
             <h4 className="font-bold text-lg mb-4">Structural Pillars</h4>
             <ul className="space-y-3 text-xs text-white/50 uppercase tracking-widest font-bold">
               <li className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                 Dynamic slide breakdown
               </li>
               <li className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                 Engaging bullet points
               </li>
               <li className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                 Presentation flow guidance
               </li>
               <li className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                 Visual suggestion anchors
               </li>
             </ul>
           </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden flex flex-col h-full min-h-[500px]">
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Presentation Blueprint</span>
          {result && (
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(result)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white">
                <Copy size={16} />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white">
                <Download size={16} />
              </button>
            </div>
          )}
        </div>
        <div className="flex-1 p-10 overflow-y-auto markdown-body">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-full space-y-6">
               <RefreshCw size={40} className="animate-spin text-indigo-400/20 mb-4" />
               <p className="text-xs font-bold uppercase tracking-widest text-white/20">Designing presentation flow...</p>
             </div>
          ) : result ? (
            <ReactMarkdown>{result}</ReactMarkdown>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white/10 opacity-30">
               <Presentation size={80} />
               <p className="mt-6 text-[10px] font-bold uppercase tracking-widest">Outline viewport</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PPTModule;
