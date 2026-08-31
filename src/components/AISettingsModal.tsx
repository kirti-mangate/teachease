import React, { useState, useEffect } from "react";
import { storage } from "../services/storageService";
import { testGeminiApiKey } from "../services/geminiService";
import { Key, ShieldCheck, AlertCircle, CheckCircle2, Eye, EyeOff, Sparkles, ExternalLink, X, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
  onKeyUpdated?: (hasKey: boolean) => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({
  isOpen,
  onClose,
  teacherId,
  onKeyUpdated
}) => {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [rememberKey, setRememberKey] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && teacherId) {
      const existing = storage.getTeacherApiKey(teacherId);
      setApiKey(existing || "");
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen, teacherId]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({ valid: false, message: "Please enter an API key to test." });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testGeminiApiKey(apiKey.trim());
      setTestResult(result);
    } catch (err: any) {
      setTestResult({ valid: false, message: err.message || "Test failed unexpectedly." });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (!apiKey.trim()) {
      storage.clearTeacherApiKey(teacherId);
      onKeyUpdated?.(false);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 800);
      return;
    }

    storage.setTeacherApiKey(teacherId, apiKey.trim(), rememberKey);
    onKeyUpdated?.(true);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    storage.clearTeacherApiKey(teacherId);
    setApiKey("");
    setTestResult(null);
    onKeyUpdated?.(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl glass-card p-8 border border-white/10 relative overflow-hidden bg-[#12151f] shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Key size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              AI Configuration
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                BYOK
              </span>
            </h3>
            <p className="text-xs text-white/50">Bring Your Own Gemini API Key for academic generation</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200/80 mb-6 leading-relaxed flex items-start gap-3">
          <ShieldCheck size={20} className="text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Your Privacy & Cost Control: </span>
            TeachEase uses the BYOK architecture. Your API key is stored securely in your browser session and is only used to process your teaching prompts. No centralized key is required.
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/60">
              Google Gemini API Key
            </label>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline"
            >
              Get Free Key <ExternalLink size={12} />
            </a>
          </div>

          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestResult(null);
              }}
              placeholder="AIzaSy..."
              className="w-full bg-black/50 border border-white/10 rounded-xl p-4 pr-24 text-white font-mono text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder:text-white/20"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="p-2 text-white/40 hover:text-white rounded-lg transition-colors"
                title={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-xs text-white/60 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberKey}
                onChange={(e) => setRememberKey(e.target.checked)}
                className="rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/40"
              />
              <span>Remember key on this device</span>
            </label>
            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="text-white/40 hover:text-red-400 transition-colors text-[11px]"
              >
                Clear Key
              </button>
            )}
          </div>
        </div>

        {/* Validation Result Box */}
        <AnimatePresence>
          {testResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-4 rounded-xl mb-6 text-xs flex items-start gap-3 border ${
                testResult.valid
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}
            >
              {testResult.valid ? (
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">{testResult.valid ? "Key Validated" : "Validation Error"}</p>
                <p className="opacity-90 mt-0.5">{testResult.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={testing || !apiKey.trim()}
            className="px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white/80 hover:text-white text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {testing ? (
              <>
                <RefreshCw size={14} className="animate-spin text-indigo-400" />
                Testing...
              </>
            ) : (
              <>
                <Sparkles size={14} className="text-indigo-400" />
                Test API Key
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl text-white/50 hover:text-white text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 size={15} />
                  Saved!
                </>
              ) : (
                "Save Configuration"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default AISettingsModal;
