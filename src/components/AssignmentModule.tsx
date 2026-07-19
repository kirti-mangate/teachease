import React, { useState } from "react";
import { generateAssignment } from "../services/geminiService";
import { FileText, Sparkles, Download, Copy, RefreshCw, Layers } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { storage, UserProfile, AIContent } from "../services/storageService";

interface AssignmentModuleProps {
  user: UserProfile;
}

const AssignmentModule: React.FC<AssignmentModuleProps> = ({ user }) => {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!subject || !topic) return;
    setLoading(true);
    try {
      const content = await generateAssignment(subject, topic, difficulty);
      const output = content || "Failed to generate content.";
      setResult(output);
      
      // Save to local storage
      const newContent: AIContent = {
        id: Math.random().toString(36).substr(2, 9),
        type: "assignment",
        teacherId: user.uid,
        subject,
        topic,
        difficulty,
        content: output,
        createdAt: new Date().toISOString()
      };
      
      storage.saveContent(newContent);
    } catch (err) {
      console.error(err);
      alert("Error generating assignment.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    alert("Copied to clipboard!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Input Panel */}
      <div className="space-y-6">
        <div className="glass-card p-8">
          <h3 className="font-bold text-xl mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center">
              <FileText size={20} />
            </div>
            Parameters
          </h3>
          
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Subject</label>
              <input 
                type="text" 
                placeholder="e.g. Mathematics, Biology" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-4 bg-white/5 rounded-xl border border-white/5 focus:ring-1 focus:ring-indigo-500/30 focus:outline-none transition-all placeholder:text-white/20"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Topic</label>
              <input 
                type="text" 
                placeholder="e.g. Calculus, Photosynthesis" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-4 bg-white/5 rounded-xl border border-white/5 focus:ring-1 focus:ring-indigo-500/30 focus:outline-none transition-all placeholder:text-white/20"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-3">
                {["Easy", "Medium", "Hard"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setDifficulty(lvl)}
                    className={`py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                      difficulty === lvl 
                        ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]" 
                        : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            disabled={!subject || !topic || loading}
            onClick={handleGenerate}
            className="w-full mt-10 py-5 bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-[0.98]"
          >
            {loading ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Sparkles size={18} />
            )}
            Begin AI Generation
          </button>
        </div>

        <div className="glass-card p-6 bg-orange-500/5 border-orange-500/20">
          <h4 className="text-xs font-bold flex items-center gap-2 mb-2 uppercase tracking-widest text-orange-400">
            <Layers size={14} />
             Pedagogical Context
          </h4>
          <p className="text-[10px] text-white/60 leading-relaxed italic">
            Provide specific historical constraints or scientific parameters to narrow the AI's question bank.
          </p>
        </div>
      </div>

      {/* Result Panel */}
      <div className="glass-card overflow-hidden flex flex-col h-full min-h-[500px]">
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Generated Result</span>
          {result && (
            <div className="flex gap-2">
              <button 
                onClick={copyToClipboard}
                className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors" 
                title="Copy"
              >
                <Copy size={16} />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors" title="Download">
                <Download size={16} />
              </button>
            </div>
          )}
        </div>
        <div className="flex-1 p-10 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <div className="w-16 h-16 bg-indigo-500/20 glass-card flex items-center justify-center animate-pulse">
                <Sparkles size={32} className="text-indigo-400" />
              </div>
              <p className="text-sm font-bold tracking-widest text-white/40 animate-pulse uppercase">Synthesizing Content...</p>
            </div>
          ) : result ? (
            <div className="markdown-body">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/10">
                <FileText size={40} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/20">Awaiting Input Parameters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentModule;
