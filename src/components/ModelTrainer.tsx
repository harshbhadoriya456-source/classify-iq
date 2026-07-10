'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dataset, ModelType, ModelConfig, TrainingResult, EpochLog } from '../types';
import { runSimulation } from '../utils/trainingSim';
import { Play, Sliders, CheckCircle, Database, Cpu, BarChart3, Terminal, Sparkles, Loader } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AnimatedCounter from './AnimatedCounter';
import { motion, AnimatePresence } from 'framer-motion';

interface ModelTrainerProps {
  dataset: Dataset;
  activeModel: ModelType;
  setActiveModel: (model: ModelType) => void;
  onTrainingComplete: (result: TrainingResult) => void;
}

const MODEL_CONFIGS: ModelConfig[] = [
  {
    id: 'logistic_regression',
    name: 'Logistic Regression',
    description: 'A linear classifier that models probabilities using a logistic function. Best for linearly separable problems.',
    hyperparameters: [
      {
        name: 'c_reg',
        label: 'Regularization strength (C)',
        description: 'Inverse of regularization strength. Smaller values specify stronger regularization.',
        type: 'number',
        default: 1.0,
        min: 0.01,
        max: 10,
        step: 0.1,
      },
    ],
  },
  {
    id: 'decision_tree',
    name: 'Decision Tree Classifier',
    description: 'A non-linear model that partitions the feature space recursively. Highly interpretable but prone to overfitting.',
    hyperparameters: [
      {
        name: 'max_depth',
        label: 'Max Depth',
        description: 'The maximum depth of the tree. Deeper trees capture more complexity but may overfit.',
        type: 'number',
        default: 5,
        min: 1,
        max: 15,
        step: 1,
      },
    ],
  },
  {
    id: 'random_forest',
    name: 'Random Forest Ensemble',
    description: 'An ensemble of bagging decision trees that reduces variance and improves generalization accuracy.',
    hyperparameters: [
      {
        name: 'n_estimators',
        label: 'Number of Estimators',
        description: 'The number of trees in the forest. More trees improve stability but cost training speed.',
        type: 'number',
        default: 50,
        min: 10,
        max: 150,
        step: 10,
      },
      {
        name: 'max_depth',
        label: 'Max Depth',
        description: 'The maximum depth of individual estimator trees.',
        type: 'number',
        default: 6,
        min: 1,
        max: 15,
        step: 1,
      },
    ],
  },
  {
    id: 'svm',
    name: 'Support Vector Machine (SVM)',
    description: 'Finds the optimal hyperplane that maximizes the margin separating distinct data classes.',
    hyperparameters: [
      {
        name: 'c_reg',
        label: 'Regularization Parameter (C)',
        description: 'Trade-off between smooth boundary and classifying training points correctly.',
        type: 'number',
        default: 1.0,
        min: 0.01,
        max: 10,
        step: 0.1,
      },
    ],
  },
  {
    id: 'neural_network',
    name: 'Neural Network (MLP)',
    description: 'A Multi-Layer Perceptron neural network. Extremely flexible, capable of learning high-dimensional non-linear interactions.',
    hyperparameters: [
      {
        name: 'learning_rate',
        label: 'Learning Rate',
        description: 'Step size for weight optimization gradient descent steps.',
        type: 'number',
        default: 0.01,
        min: 0.001,
        max: 0.5,
        step: 0.005,
      },
      {
        name: 'activation',
        label: 'Activation Function',
        description: 'The activation mathematical function for the hidden neuron layers.',
        type: 'select',
        default: 'relu',
        options: [
          { label: 'ReLU', value: 'relu' },
          { label: 'Sigmoid', value: 'sigmoid' },
          { label: 'Tanh', value: 'tanh' },
        ],
      },
    ],
  },
];

export default function ModelTrainer({
  dataset,
  activeModel,
  setActiveModel,
  onTrainingComplete,
}: ModelTrainerProps) {
  const modelConfig = MODEL_CONFIGS.find((m) => m.id === activeModel) || MODEL_CONFIGS[0];
  
  const [hyperparams, setHyperparams] = useState<Record<string, any>>({});
  const [isTraining, setIsTraining] = useState(false);
  const [epochsConfig, setEpochsConfig] = useState(30);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [liveChartLogs, setLiveChartLogs] = useState<EpochLog[]>([]);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Initialize hyperparameters for the active model with a loading state
  useEffect(() => {
    setIsLoadingConfig(true);
    const timer = setTimeout(() => {
      const initialParams: Record<string, any> = {};
      modelConfig.hyperparameters.forEach((hp) => {
        initialParams[hp.name] = hp.default;
      });
      setHyperparams(initialParams);
      setTerminalLogs([
        `[sys] Workspace workspace re-routed for ${modelConfig.name}.`,
        `[sys] Dataset bind: ${dataset.name} (${dataset.rows.length} records).`
      ]);
      setLiveChartLogs([]);
      setIsLoadingConfig(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [activeModel, dataset]);

  // Handle hyperparameter changes
  const handleParamChange = (name: string, val: any) => {
    setHyperparams((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  // Autoscroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // Training simulation trigger
  const handleTrain = () => {
    if (isTraining) return;

    setIsTraining(true);
    setShowSuccessOverlay(false);
    setLiveChartLogs([]);
    setCurrentProgress(0);

    setTerminalLogs([
      `[sys] Establishing training pipelines Matrix...`,
      `[sys] Processing: Dataset (${dataset.name}) -> Core Training Nodes.`,
      `[sys] Hyperparameter matrix initialized.`,
      `[sys] Executing epoch calculations...`,
    ]);

    const fullResult = runSimulation(dataset, activeModel, {
      ...hyperparams,
      epochs: epochsConfig,
    });

    let epochIndex = 0;
    const intervalTime = Math.max(40, 1200 / epochsConfig);

    const timer = setInterval(() => {
      if (epochIndex < fullResult.epochLogs.length) {
        const log = fullResult.epochLogs[epochIndex];
        
        setLiveChartLogs((prev) => [...prev, log]);
        setCurrentProgress(Math.round(((epochIndex + 1) / epochsConfig) * 100));

        setTerminalLogs((prev) => [
          ...prev,
          `Epoch ${log.epoch}/${epochsConfig} - Loss: ${log.loss.toFixed(4)} | Acc: ${(log.accuracy * 100).toFixed(1)}% | Val Acc: ${(log.valAccuracy * 100).toFixed(1)}%`
        ]);

        epochIndex++;
      } else {
        clearInterval(timer);
        setIsTraining(false);
        setTerminalLogs((prev) => [
          ...prev,
          `[sys] Model training convergence attained.`,
          `[sys] Validation complete. Outputting metrics maps.`,
        ]);
        onTrainingComplete(fullResult);
        setShowSuccessOverlay(true);
      }
    }, intervalTime);
  };

  return (
    <div className="space-y-6">
      {/* 11. Visual model training pipeline */}
      <div className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-cyan-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          Active Model Pipeline Flow
        </h3>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto relative px-4">
          {[
            { label: '1. Dataset Explorer', desc: dataset.name, icon: Database, active: true },
            { label: '2. Trainer Config', desc: modelConfig.name, icon: Cpu, active: true },
            { label: '3. Realtime Evaluation', desc: isTraining ? `Epochs ${currentProgress}%` : liveChartLogs.length > 0 ? 'Model Trained' : 'Awaiting Run', icon: BarChart3, active: isTraining || liveChartLogs.length > 0, highlight: isTraining },
            { label: '4. Results Insights', desc: liveChartLogs.length > 0 ? 'Metrics Unlocked' : 'Locked', icon: Terminal, active: liveChartLogs.length > 0 },
          ].map((step, i) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center text-center relative z-10">
                  <div className={`p-4 rounded-full border-2 transition-all duration-500 ${
                    step.highlight 
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(0,243,255,0.2)] animate-pulse'
                      : step.active 
                        ? 'border-purple-500/50 bg-purple-950/20 text-purple-300' 
                        : 'border-white/5 bg-black/40 text-slate-600'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-300 mt-2.5">{step.label}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 max-w-[120px] truncate">{step.desc}</span>
                </div>
                {i < 3 && (
                  <div className="hidden md:block flex-1 h-0.5 mx-4 bg-white/5 relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 transition-transform duration-500 origin-left ${
                      step.active ? 'scale-x-100' : 'scale-x-0'
                    }`} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Configurations card */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
          {isLoadingConfig ? (
            // 15. Premium Loading Skeletons
            <div className="space-y-6 flex-1">
              <div className="h-4 w-1/3 bg-white/5 rounded skeleton-premium" />
              <div className="h-10 w-full bg-white/5 rounded-xl skeleton-premium" />
              <div className="space-y-2">
                <div className="h-3 w-1/2 bg-white/5 rounded skeleton-premium" />
                <div className="h-3 w-full bg-white/5 rounded skeleton-premium" />
              </div>
              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="h-8 w-full bg-white/5 rounded skeleton-premium" />
                <div className="h-8 w-full bg-white/5 rounded skeleton-premium" />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Sliders className="h-4.5 w-4.5 text-cyan-400" />
                Model Parameters
              </h3>

              <div>
                <label className="text-[9px] uppercase font-mono tracking-wider text-slate-600 mb-1.5 block">Select Classification Model</label>
                <select
                  value={activeModel}
                  onChange={(e) => setActiveModel(e.target.value as ModelType)}
                  disabled={isTraining}
                  className="w-full text-xs bg-black/40 border border-white/5 rounded-xl p-3 text-slate-300 focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
                >
                  {MODEL_CONFIGS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  {modelConfig.description}
                </p>
              </div>

              <div className="border-t border-white/5 pt-4 space-y-4">
                {/* General Epoch Configuration */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Epochs (Iterations)</span>
                    <span className="text-cyan-400 font-bold">{epochsConfig}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={epochsConfig}
                    onChange={(e) => setEpochsConfig(Number(e.target.value))}
                    disabled={isTraining}
                    className="w-full h-1 bg-black/50 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-50"
                  />
                </div>

                {/* Dynamic Hyperparameter sliders */}
                {modelConfig.hyperparameters.map((hp) => {
                  const currentValue = hyperparams[hp.name] ?? hp.default;
                  return (
                    <div key={hp.name}>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-400">{hp.label}</span>
                        <span className="text-purple-400 font-bold">{currentValue}</span>
                      </div>
                      {hp.type === 'number' && (
                        <input
                          type="range"
                          min={hp.min}
                          max={hp.max}
                          step={hp.step}
                          value={currentValue}
                          onChange={(e) => handleParamChange(hp.name, Number(e.target.value))}
                          disabled={isTraining}
                          className="w-full h-1 bg-black/50 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-50"
                        />
                      )}
                      {hp.type === 'select' && (
                        <select
                          value={currentValue}
                          onChange={(e) => handleParamChange(hp.name, e.target.value)}
                          disabled={isTraining}
                          className="w-full text-xs bg-black/40 border border-white/5 rounded-xl p-2.5 text-slate-300 focus:outline-none focus:border-cyan-500/50"
                        >
                          {hp.options?.map((opt) => (
                            <option key={String(opt.value)} value={String(opt.value)}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                      <p className="text-[10px] text-slate-600 mt-1 leading-snug">{hp.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={handleTrain}
            disabled={isTraining || isLoadingConfig}
            className="w-full mt-6 py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isTraining ? (
              <>
                <Loader className="h-4 w-4 animate-spin text-black" />
                TRAINING IN PROGRESS...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-black" />
                RUN MODEL TRAINING
              </>
            )}
          </button>
        </div>

        {/* Live Training Diagnostics Visualizations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real-time Loss/Accuracy Charts */}
          <div className="glass-card rounded-2xl p-6 relative">
            {/* 20. Floating AI Orb & Live Training Monitor */}
            <div className="absolute top-4 right-4 flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                {isTraining ? 'TUNING WAVES' : 'ORB ENGINE'}
              </span>
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 ${
                isTraining 
                  ? 'bg-cyan-950/20 border-cyan-400/50 shadow-[0_0_15px_rgba(0,243,255,0.3)] orb-glow' 
                  : 'bg-black/40 border-white/5'
              }`}>
                <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  isTraining ? 'bg-cyan-400 scale-125 animate-ping' : 'bg-slate-600'
                }`} />
              </div>
            </div>

            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-purple-400 animate-spin" />
              Live Diagnostics Monitor
            </h3>

            {/* 12. Live training monitor stats */}
            {liveChartLogs.length > 0 && (
              <div className="grid grid-cols-3 gap-2.5 mb-6 text-center font-mono bg-black/40 p-3 rounded-xl border border-white/5">
                <div>
                  <div className="text-[9px] text-slate-600 uppercase">Current Epoch</div>
                  <div className="text-sm font-bold text-slate-300 mt-0.5">
                    {liveChartLogs[liveChartLogs.length - 1].epoch} / {epochsConfig}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-600 uppercase">Val Loss</div>
                  <div className="text-sm font-bold text-rose-400 mt-0.5">
                    {liveChartLogs[liveChartLogs.length - 1].valLoss.toFixed(4)}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-600 uppercase">Val Accuracy</div>
                  <div className="text-sm font-bold text-cyan-400 mt-0.5">
                    <AnimatedCounter 
                      value={liveChartLogs[liveChartLogs.length - 1].valAccuracy * 100} 
                      formatter={(val) => `${val.toFixed(1)}%`}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="h-60">
              {liveChartLogs.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={liveChartLogs} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                    <XAxis dataKey="epoch" tick={{ fill: '#4b5563', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ background: '#070710', border: '1px solid rgba(0, 243, 255, 0.15)', borderRadius: '12px', fontSize: 10 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                    <Line type="monotone" dataKey="loss" stroke="#ff0055" strokeWidth={2} name="Train Loss" dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="valLoss" stroke="#bd00ff" strokeWidth={2} strokeDasharray="4 4" name="Val Loss" dot={false} />
                    <Line type="monotone" dataKey="accuracy" stroke="#00f3ff" strokeWidth={2} name="Train Acc" dot={false} />
                    <Line type="monotone" dataKey="valAccuracy" stroke="#00ffaa" strokeWidth={2} strokeDasharray="4 4" name="Val Acc" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/5 rounded-xl bg-black/20 text-slate-500 text-xs">
                  <Cpu className="h-8 w-8 text-slate-700 mb-2 pulse-cyber" />
                  <p>Click "RUN MODEL TRAINING" to initialize dashboard.</p>
                </div>
              )}
            </div>
          </div>

          {/* Console logs */}
          <div className="glass-card rounded-2xl p-6 bg-black/60 border border-white/5">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2.5">
              <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Virtual Terminal logs
              </h3>
              <span className="text-[9px] font-mono text-slate-600">WORKSPACE MATRIX SYSTEM</span>
            </div>
            <div className="h-32 overflow-y-auto font-mono text-xs text-slate-400 space-y-1.5 pr-2">
              {terminalLogs.map((log, idx) => {
                const isSys = log.includes('[sys]');
                const isMetric = log.includes('[metrics]');
                let textColor = 'text-slate-500';
                if (isSys) textColor = 'text-cyan-400 font-bold';
                else if (isMetric) textColor = 'text-emerald-400 font-bold';
                else if (log.startsWith('Epoch')) textColor = 'text-slate-300';

                return (
                  <div key={idx} className={`${textColor} break-all flex items-start gap-1`}>
                    <span className="text-slate-700 shrink-0">&gt;</span>
                    <span>{log}</span>
                  </div>
                );
              })}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* 13. Animated success states overlay */}
      <AnimatePresence>
        {showSuccessOverlay && liveChartLogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-[#020205]/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="max-w-md w-full glass-card rounded-2xl p-8 border border-cyan-500/20 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-500 animate-pulse" />
              <div className="w-16 h-16 rounded-full bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-center mx-auto mb-5 text-cyan-400 animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Model Convergence Reached</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Trained weights for <strong>{modelConfig.name}</strong> successfully generated. Matrix logs re-routing parameters to Results dashboard.
              </p>

              <div className="mt-6 p-4 rounded-xl bg-black/40 border border-white/5 grid grid-cols-2 gap-2 text-left font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Test Accuracy</span>
                  <span className="text-sm font-bold text-cyan-400">
                    {((liveChartLogs[liveChartLogs.length - 1]?.valAccuracy ?? 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Model Iterations</span>
                  <span className="text-sm font-bold text-purple-400">{epochsConfig} Epochs</span>
                </div>
              </div>

              <button
                onClick={() => setShowSuccessOverlay(false)}
                className="w-full mt-6 py-3 bg-cyan-500 text-black font-bold text-xs rounded-xl hover:bg-cyan-400 transition-all cursor-pointer"
              >
                PROCEED TO RESULTS SCREEN
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
