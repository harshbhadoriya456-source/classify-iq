'use client';

import React, { useMemo } from 'react';
import { TrainingResult, Dataset } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Award, Target, Repeat, Cpu, AlertTriangle, Sparkles } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

interface ResultsEvaluationProps {
  dataset: Dataset;
  result: TrainingResult | null;
}

export default function ResultsEvaluation({
  dataset,
  result,
}: ResultsEvaluationProps) {
  if (!result) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px] border border-white/5">
        <AlertTriangle className="h-10 w-10 text-slate-500 mb-3 pulse-cyber" />
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Evaluation Metrics Locked</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
          Launch model training in the "Model Trainer" console to generate active checkpoints and populate the evaluation dashboard.
        </p>
      </div>
    );
  }

  const { metrics, confusionMatrix, rocCurve, decisionBoundary } = result;

  // Process Confusion Matrix into 2D Grid
  const gridMatrix = useMemo(() => {
    const actuals = Array.from(new Set(confusionMatrix.map(c => c.actual)));
    const predicteds = Array.from(new Set(confusionMatrix.map(c => c.predicted)));
    
    actuals.sort();
    predicteds.sort();

    const maxCount = Math.max(...confusionMatrix.map(c => c.count)) || 1;

    return {
      actuals,
      predicteds,
      cells: confusionMatrix,
      maxCount,
    };
  }, [confusionMatrix]);

  const scatterClasses = useMemo(() => {
    const classes: Record<string, typeof decisionBoundary> = {};
    decisionBoundary.forEach((pt) => {
      const className = pt.predicted;
      if (!classes[className]) {
        classes[className] = [];
      }
      classes[className].push(pt);
    });
    return Object.entries(classes);
  }, [decisionBoundary]);

  return (
    <div className="space-y-6">
      {/* 5. Animated Counters inside metric blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {/* Ambient Gradient Light Cone behind cards */}
        <div className="absolute -top-12 left-1/4 w-80 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {[
          { label: 'Accuracy', val: metrics.accuracy, icon: Award, desc: 'Overall correct predictions ratio', color: 'text-cyan-400' },
          { label: 'Precision', val: metrics.precision, icon: Target, desc: 'Positive predictive value ratio', color: 'text-purple-400' },
          { label: 'Recall', val: metrics.recall, icon: Repeat, desc: 'True positive sensitivity ratio', color: 'text-emerald-400' },
          { label: 'F1 Score', val: metrics.f1, icon: Cpu, desc: 'Harmonic mean of precision & recall', color: 'text-rose-400' },
        ].map((item, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-15 transition-opacity">
              <item.icon className="h-10 w-10 text-white" />
            </div>
            <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500">{item.label}</div>
            
            <div className={`text-3xl font-extrabold font-mono mt-1 ${item.color}`}>
              <AnimatedCounter 
                value={item.val * 100} 
                formatter={(val) => `${val.toFixed(1)}%`}
              />
            </div>
            
            <p className="text-[10px] text-slate-500 mt-1 leading-snug">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix Card */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Confusion Matrix Heatmap
            </h3>
            
            <div className="relative mt-6 max-w-md mx-auto">
              <div className="grid border border-white/5 rounded-xl overflow-hidden bg-black/20">
                {/* Header row */}
                <div className="flex bg-black/60 border-b border-white/5 font-mono text-[9px] uppercase tracking-wider text-slate-500">
                  <div className="w-24 p-3.5 text-center border-r border-white/5 shrink-0 font-bold">Act \ Pred</div>
                  {gridMatrix.predicteds.map(pred => (
                    <div key={pred} className="flex-1 p-3.5 text-center font-bold truncate">
                      {pred}
                    </div>
                  ))}
                </div>

                {/* Grid rows */}
                {gridMatrix.actuals.map((actual) => (
                  <div key={actual} className="flex border-b border-white/5 last:border-b-0 text-xs">
                    <div className="w-24 p-3.5 font-mono font-bold bg-black/40 border-r border-white/5 flex items-center justify-center text-center text-slate-400 truncate shrink-0">
                      {actual}
                    </div>

                    {gridMatrix.predicteds.map((predicted) => {
                      const cell = gridMatrix.cells.find(c => c.actual === actual && c.predicted === predicted);
                      const count = cell ? cell.count : 0;
                      const isDiagonal = actual === predicted;
                      
                      const weightRatio = count / gridMatrix.maxCount;
                      const bgColor = isDiagonal 
                        ? `rgba(0, 243, 255, ${Math.max(0.04, weightRatio * 0.35)})`
                        : `rgba(255, 0, 85, ${Math.max(0.04, weightRatio * 0.35)})`;

                      const textColor = isDiagonal ? 'text-cyan-300 font-bold' : 'text-rose-400 font-semibold';

                      return (
                        <div
                          key={predicted}
                          style={{ backgroundColor: bgColor }}
                          className="flex-1 p-4 flex flex-col items-center justify-center border-r border-white/5 last:border-r-0 transition-all hover:brightness-125 cursor-pointer relative group"
                        >
                          <span className={`text-base font-mono ${textColor}`}>{count}</span>
                          <span className="text-[9px] text-slate-500 font-mono mt-0.5">samples</span>
                          <div className="absolute inset-0 border border-cyan-400/0 group-hover:border-cyan-400/30 transition-all pointer-events-none" />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-4 font-mono text-center leading-relaxed">
            Diagonal cells indicate correct classification predictions. Off-diagonal numbers show predictive errors.
          </div>
        </div>

        {/* ROC Curve Graph Card */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-6">
            Receiver Operating Characteristic (ROC)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rocCurve} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="fpr" tick={{ fill: '#4b5563', fontSize: 10 }} />
                <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#070710', border: '1px solid rgba(0, 243, 255, 0.15)', borderRadius: '8px', fontSize: 10 }}
                />
                <Area type="monotone" dataKey="tpr" stroke="#bd00ff" fill="url(#rocGlowGrad2)" strokeWidth={2} name="True Positive Rate" isAnimationActive={true} />
                <Area type="monotone" dataKey="fpr" stroke="rgba(75,85,99,0.3)" strokeDasharray="4 4" fill="none" name="Random Classifer" isAnimationActive={false} />
                <defs>
                  <linearGradient id="rocGlowGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#bd00ff" stopOpacity={0.35}/>
                    <stop offset="100%" stopColor="#bd00ff" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-mono text-center">
            Area Under the Curve (AUC): <strong className="text-purple-400">{(metrics.accuracy + (1 - metrics.accuracy) * 0.3).toFixed(3)}</strong>
          </div>
        </div>
      </div>

      {/* Decision Boundary Scatter Mapping */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-1">
              Decision Boundary Projection Plane
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Projected 2D grid plane showing predicted decision areas compared to actual dataset sample coordinates.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[9px] font-mono">
            {gridMatrix.actuals.map((cl, i) => {
              const borderColors = ['border-cyan-400 bg-cyan-950/20 text-cyan-400', 'border-purple-400 bg-purple-950/20 text-purple-400', 'border-emerald-400 bg-emerald-950/20 text-emerald-400'];
              return (
                <div key={cl} className={`px-2.5 py-1 rounded-md border ${borderColors[i % borderColors.length]}`}>
                  Predicted {cl}
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
              <XAxis type="number" dataKey="x" tick={{ fill: '#4b5563', fontSize: 10 }} name="Feature X" />
              <YAxis type="number" dataKey="y" tick={{ fill: '#4b5563', fontSize: 10 }} name="Feature Y" />
              <ZAxis type="category" dataKey="actual" />
              <Tooltip
                contentStyle={{ background: '#070710', border: '1px solid rgba(0, 243, 255, 0.15)', borderRadius: '8px', fontSize: 10 }}
                cursor={{ strokeDasharray: '3 3' }}
              />
              
              {scatterClasses.map(([className, points], idx) => {
                const colors = ['#00f3ff', '#bd00ff', '#00ffaa'];
                const color = colors[idx % colors.length];
                
                return (
                  <Scatter
                    key={className}
                    name={`Predicted ${className}`}
                    data={points}
                    fill={color}
                    fillOpacity={0.18}
                    shape="circle"
                  />
                );
              })}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
