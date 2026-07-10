'use client';

import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import DatasetExplorer from '../components/DatasetExplorer';
import ModelTrainer from '../components/ModelTrainer';
import ResultsEvaluation from '../components/ResultsEvaluation';
import AIInsights from '../components/AIInsights';
import { PRESET_DATASETS } from '../data/presets';
import { Dataset, ModelType, TrainingResult } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Database, BarChart3, Terminal, Play, Sparkles, Activity, ShieldAlert, Award } from 'lucide-react';
import AnimatedCounter from '../components/AnimatedCounter';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedDataset, setSelectedDataset] = useState<Dataset>(PRESET_DATASETS[0]);
  const [activeModel, setActiveModel] = useState<ModelType>('neural_network');
  const [trainingResult, setTrainingResult] = useState<TrainingResult | null>(null);
  const [trainedCount, setTrainedCount] = useState<number>(0);

  const handleTrainingComplete = (result: TrainingResult) => {
    setTrainingResult(result);
    setTrainedCount((prev) => prev + 1);
    // Transition to results screen automatically
    setTimeout(() => {
      setActiveTab('results');
    }, 1800);
  };

  const systemStatus = {
    datasetName: selectedDataset.name,
    modelName: activeModel.replace('_', ' ').toUpperCase(),
    isTrained: !!trainingResult,
    accuracy: trainingResult?.metrics.accuracy,
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      systemStatus={systemStatus}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Mission Control Hero Banner */}
              <div className="relative rounded-2xl overflow-hidden glass-card p-8 border border-white/5">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl -z-10" />
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 bg-cyan-950/20 border border-cyan-500/20 px-3 py-1 rounded-full text-[10px] text-cyan-400 font-mono font-bold mb-5 tracking-wider">
                    <Sparkles className="h-3 w-3" />
                    MISSION CONTROL CENTER // ACTIVE SESSION
                  </div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                    ClassifyIQ <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-purple-500 bg-clip-text text-transparent">AI Modeling Workspace</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                    Welcome to the central node command center. Design, simulate, configure and audit machine learning classification networks inside an integrated cyber-physical environment.
                  </p>
                  
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveTab('dataset')}
                      className="px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(0,243,255,0.25)] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Database className="h-3.5 w-3.5" />
                      SELECT DATASET
                    </button>
                    <button
                      onClick={() => setActiveTab('trainer')}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all border border-purple-500/20 cursor-pointer flex items-center gap-1.5"
                    >
                      <Cpu className="h-3.5 w-3.5" />
                      TUNING WORKBENCH
                    </button>
                  </div>
                </div>
              </div>

              {/* Status metrics grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Active Dataset',
                    val: selectedDataset.name,
                    label: `${selectedDataset.rows.length} rows | ${selectedDataset.columns.length} columns`,
                    color: 'text-cyan-400',
                  },
                  {
                    title: 'Trained Models',
                    val: trainedCount > 0 ? `${trainedCount} models` : '0 trained',
                    label: trainingResult ? `Last Acc: ${(trainingResult.metrics.accuracy * 100).toFixed(1)}%` : 'Ready to train',
                    color: 'text-purple-400',
                  },
                  {
                    title: 'Last Precision Score',
                    val: trainingResult ? `${(trainingResult.metrics.precision * 100).toFixed(1)}%` : 'N/A',
                    label: trainingResult ? 'Evaluation metrics unlocked' : 'Launch simulation to populate',
                    color: trainingResult ? 'text-emerald-400' : 'text-slate-600',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/2 to-transparent rounded-full blur-xl pointer-events-none" />
                    <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{item.title}</div>
                    <div className={`text-base font-bold mt-2 truncate ${item.color}`}>{item.val}</div>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Interactive Pipeline summary block */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  Workspace Pipeline Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { title: '1. Choose Dataset', desc: 'Presets or custom CSV uploads.', active: true },
                    { title: '2. Tweak Model', desc: 'Set depths, learning rates, epochs.', active: true },
                    { title: '3. Simulation', desc: 'Track accuracy training curves.', active: trainingResult !== null },
                    { title: '4. Evaluation', desc: 'Audit confusion matrices.', active: trainingResult !== null }
                  ].map((p, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border transition-all ${
                      p.active 
                        ? 'bg-cyan-950/10 border-cyan-500/20 text-cyan-300' 
                        : 'bg-black/20 border-white/5 text-slate-600'
                    }`}>
                      <div className="text-xs font-bold">{p.title}</div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guide links grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: 'Dataset Explorer',
                    desc: 'Select classic presets or upload CSVs to explore column summaries and histograms.',
                    icon: Database,
                    tab: 'dataset',
                  },
                  {
                    title: 'Model Trainer',
                    desc: 'Tweak classification parameters and follow real-time loss and accuracy training curves.',
                    icon: Cpu,
                    tab: 'trainer',
                  },
                  {
                    title: 'Evaluation & Results',
                    desc: 'Analyze model predictions using interactive heatmaps, ROC curves, and decision boundaries.',
                    icon: BarChart3,
                    tab: 'results',
                  },
                  {
                    title: 'AI Insights',
                    desc: 'Receive narrative interpretations and optimization suggestions from the cognitive agent.',
                    icon: Terminal,
                    tab: 'insights',
                  },
                ].map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveTab(feature.tab)}
                      className="glass-card border-glow-cyan rounded-2xl p-6 cursor-pointer flex flex-col justify-between group transition-all"
                    >
                      <div>
                        <div className="p-3 bg-cyan-500/5 rounded-xl border border-white/5 w-fit mb-4 group-hover:border-cyan-500/30 transition-all">
                          <Icon className="h-4.5 w-4.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200 group-hover:text-cyan-400 transition-colors">
                          {feature.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                          {feature.desc}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-slate-600 group-hover:text-cyan-400 transition-colors">
                        Enter workspace
                        <Play className="h-2 w-2 fill-current" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'dataset' && (
            <DatasetExplorer
              selectedDataset={selectedDataset}
              onDatasetSelect={setSelectedDataset}
            />
          )}

          {activeTab === 'trainer' && (
            <ModelTrainer
              dataset={selectedDataset}
              activeModel={activeModel}
              setActiveModel={setActiveModel}
              onTrainingComplete={handleTrainingComplete}
            />
          )}

          {activeTab === 'results' && (
            <ResultsEvaluation
              dataset={selectedDataset}
              result={trainingResult}
            />
          )}

          {activeTab === 'insights' && (
            <AIInsights
              dataset={selectedDataset}
              modelType={activeModel}
              result={trainingResult}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}
