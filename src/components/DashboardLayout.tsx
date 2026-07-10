'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  Cpu, 
  BarChart3, 
  Terminal, 
  Activity,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NeuralNetBackground from './NeuralNetBackground';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemStatus: {
    datasetName: string;
    modelName: string;
    isTrained: boolean;
    accuracy?: number;
  };
}

export default function DashboardLayout({
  children,
  activeTab,
  setActiveTab,
  systemStatus,
}: DashboardLayoutProps) {
  const [isAssistantOpen, setIsAssistantOpen] = useState(true);
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [assistantLogs, setAssistantLogs] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    { sender: 'assistant', text: 'Hello! I am your ClassifyIQ Assistant. How can I help you improve your classification models today?' }
  ]);

  const menuItems = [
    { id: 'overview', name: 'Mission Control', icon: LayoutDashboard },
    { id: 'dataset', name: 'Dataset Explorer', icon: Database },
    { id: 'trainer', name: 'Model Trainer', icon: Cpu },
    { id: 'results', name: 'Evaluation & Results', icon: BarChart3 },
    { id: 'insights', name: 'AI Insights', icon: Terminal },
  ];

  const handleAssistantSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantPrompt.trim()) return;

    const userText = assistantPrompt;
    setAssistantPrompt('');
    setAssistantLogs((prev) => [...prev, { sender: 'user', text: userText }]);

    // Simulated reply based on content keywords
    setTimeout(() => {
      let reply = "I've analyzed your parameters. If accuracy is below 85%, try adjusting your learning rate to 0.01 and ensuring your feature set is clean of outliers.";
      if (userText.toLowerCase().includes('overfit') || userText.toLowerCase().includes('depth')) {
        reply = "High Decision Tree depths often trigger overfitting. Consider capping depth at 5 or employing the bagging strategy of Random Forest.";
      } else if (userText.toLowerCase().includes('iris')) {
        reply = "The Iris Flower dataset is highly clean. Random Forest or Neural Network (MLP) should achieve over 95% accuracy easily here.";
      } else if (userText.toLowerCase().includes('neural') || userText.toLowerCase().includes('mlp')) {
        reply = "Neural Networks are flexible but converge slower. Ensure you set training epochs to 40+ with a ReLU activation for best results.";
      }

      setAssistantLogs((prev) => [...prev, { sender: 'assistant', text: reply }]);
    }, 1000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#020205] text-slate-100 font-sans scanlines-overlay relative">
      {/* Animated Network nodes background */}
      <NeuralNetBackground />

      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#05050f]/60 backdrop-blur-2xl flex flex-col z-20 relative">
        <div className="absolute top-12 left-6 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="p-6 border-b border-white/5 flex items-center gap-3 relative">
          <div className="relative">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 blur-md opacity-60 pulse-cyber animate-pulse" />
            <div className="relative bg-black p-2.5 rounded-xl border border-cyan-500/40">
              <Activity className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
              ClassifyIQ
              <Sparkles className="h-3 w-3 text-cyan-400" />
            </h1>
            <span className="text-[9px] uppercase tracking-widest text-cyan-400 font-mono font-semibold">
              AI ENGINE LABS
            </span>
          </div>
        </div>

        {/* Sidebar Nav links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative font-semibold text-xs uppercase tracking-wider group ${
                  isActive 
                    ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_15px_rgba(0,243,255,0.05)]' 
                    : 'text-slate-400 hover:text-cyan-300 hover:bg-white/5 border border-transparent'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 w-1.5 h-6 bg-cyan-400 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Status Footer */}
        <div className="p-4 border-t border-white/5 bg-black/30 backdrop-blur-md">
          <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mb-2">
            <span>PLATFORM SPEED</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          </div>
          <div className="space-y-1 text-[11px] font-mono">
            <div className="flex justify-between text-slate-400">
              <span className="text-slate-600">Dataset:</span>
              <span className="text-cyan-400 truncate max-w-[120px] font-semibold">{systemStatus.datasetName}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span className="text-slate-600">Model:</span>
              <span className="text-purple-400 truncate max-w-[120px] font-semibold">{systemStatus.modelName}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span className="text-slate-600">Accuracy:</span>
              <span className={systemStatus.isTrained ? "text-emerald-400 font-semibold" : "text-slate-600"}>
                {systemStatus.isTrained && systemStatus.accuracy 
                  ? `${(systemStatus.accuracy * 100).toFixed(1)}%` 
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel Content container */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header toolbar */}
        <header className="h-16 border-b border-white/5 bg-[#05050f]/30 backdrop-blur-xl flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-mono font-bold">CORE CORE //</span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-300">
              {menuItems.find(m => m.id === activeTab)?.name}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-purple-950/20 px-3 py-1.5 rounded-lg border border-purple-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
              <span className="text-[9px] uppercase tracking-wider text-purple-300 font-mono font-bold">NEURAL NET CONTEXT TRIGGERED</span>
            </div>

            {/* Toggle button for Right-side AI Assistant Drawer */}
            <button
              onClick={() => setIsAssistantOpen(!isAssistantOpen)}
              className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-cyan-500/20 hover:text-cyan-400 transition-all text-slate-400 flex items-center gap-1.5 text-xs font-mono"
            >
              <MessageSquare className="h-4 w-4" />
              {isAssistantOpen ? 'HIDE ASSISTANT' : 'SHOW ASSISTANT'}
            </button>
          </div>
        </header>

        {/* Scrollable dashboard cards panel */}
        <main className="flex-1 overflow-y-auto p-8 relative z-10 bg-gradient-to-b from-transparent to-[#020205]/40">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Right Drawer: AI Assistant Panel */}
      <AnimatePresence>
        {isAssistantOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="border-l border-white/5 bg-[#05050f]/80 backdrop-blur-2xl flex flex-col z-20 relative shrink-0"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <h3 className="text-xs uppercase tracking-wider font-extrabold text-slate-200">AI Assistant Panel</h3>
              </div>
              <button 
                onClick={() => setIsAssistantOpen(false)}
                className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Conversation Log */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto font-mono text-[11px]">
              {assistantLogs.map((msg, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-xl border ${
                    msg.sender === 'assistant' 
                      ? 'bg-cyan-950/10 border-cyan-500/10 text-cyan-100 self-start mr-8' 
                      : 'bg-purple-950/10 border-purple-500/10 text-purple-200 self-end ml-8'
                  }`}
                >
                  <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">
                    {msg.sender === 'assistant' ? '✦ ASSISTANT Agent' : '✦ USER Operator'}
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Prompt input field */}
            <form onSubmit={handleAssistantSend} className="p-4 border-t border-white/5 bg-black/40">
              <div className="relative">
                <input
                  type="text"
                  value={assistantPrompt}
                  onChange={(e) => setAssistantPrompt(e.target.value)}
                  placeholder="Ask model tuning advice..."
                  className="w-full text-xs bg-white/5 border border-white/5 hover:border-white/10 rounded-xl py-2.5 pl-3.5 pr-10 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 p-1.5 rounded-lg bg-cyan-500 text-black hover:bg-cyan-400 transition-all cursor-pointer"
                >
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
