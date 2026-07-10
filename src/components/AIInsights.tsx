'use client';

import React, { useState, useEffect } from 'react';
import { TrainingResult, Dataset, ModelType } from '../types';
import { Terminal, Lightbulb, TrendingUp, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';

interface AIInsightsProps {
  dataset: Dataset;
  modelType: ModelType;
  result: TrainingResult | null;
}

export default function AIInsights({
  dataset,
  modelType,
  result,
}: AIInsightsProps) {
  const [displayText, setDisplayText] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const insightsText = React.useMemo(() => {
    if (!result) {
      return `SYSTEM DIAGNOSTICS: LOCKED
=============================
Awaiting trained model weights checkpoints to initiate AI Cognitive Analyst Engine...
Please complete a model training cycle in the "Model Trainer" section.`;
    }

    const acc = result.metrics.accuracy;
    const f1 = result.metrics.f1;
    
    let modelName = modelType.replace('_', ' ').toUpperCase();
    
    let observations = [
      `AI COGNITIVE ANALYST REPORT`,
      `===========================`,
      `[MODEL]: ${modelName}`,
      `[DATASET]: ${dataset.name.toUpperCase()}`,
      `[ACCURACY]: ${(acc * 100).toFixed(1)}%`,
      `[F1-SCORE]: ${(f1 * 100).toFixed(1)}%`,
      ``,
      `PRIMARY EVALUATION ANALYSIS:`,
    ];

    if (acc >= 0.92) {
      observations.push(
        `✦ HIGH-PERFORMANCE DETECTED: The ${modelName} model has successfully mapped the classification boundary for the ${dataset.name} dataset.`,
        `✦ GENERALIZATION STATUS: The low variance between final training accuracy and validation accuracy suggests the model will generalize well to unseen test records.`
      );
    } else if (acc >= 0.75) {
      observations.push(
        `✦ ACCEPTABLE CONVERGENCE: The model converges to moderate accuracy but exhibits structural bottlenecks fitting the boundary.`,
        `✦ RECOMMENDATION: Explore non-linear algorithms or adjust model depth to capture higher-dimensional interactions.`
      );
    } else {
      observations.push(
        `⚠ UNDERFITTING/STABILITY ALERT: The classifier accuracy is low (${(acc * 100).toFixed(1)}%). The model is failing to extract robust decision features.`,
        `✦ ACTION REQUIRED: Increase epochs or adjust learning rates/regularization hyperparameters.`
      );
    }

    observations.push(
      ``,
      `ALGORITHM-SPECIFIC LOGIC & FEEDBACK:`
    );

    switch (modelType) {
      case 'logistic_regression':
        observations.push(
          `✦ Logistic Regression constructs a linear separator plane. Because of this, it struggles with non-linear borders.`,
          `✦ If performance is sub-optimal, try transitioning to the Neural Network (MLP) or Random Forest ensemble.`
        );
        break;
      case 'decision_tree':
        observations.push(
          `✦ Decision Trees are prone to high-variance overfitting if "Max Depth" is set too high.`,
          `✦ If validation accuracy trails training accuracy by > 8%, prune depth settings or switch to Random Forest.`
        );
        break;
      case 'random_forest':
        observations.push(
          `✦ Random Forest averages out individual tree variances. Boosting estimators generally increases stability.`,
          `✦ Note that raising estimators beyond 100 yields diminishing returns and increases training latency.`
        );
        break;
      case 'svm':
        observations.push(
          `✦ SVM relies on maximizing structural classification margins. Regularization (C) scales penalty weights.`,
          `✦ Ensure the dataset is scaled properly, as SVM is highly sensitive to mismatched feature ranges.`
        );
        break;
      case 'neural_network':
        observations.push(
          `✦ Neural Networks (MLP) are highly expressive but very sensitive to learning rate spikes.`,
          `✦ A learning rate > 0.1 may cause gradients to explode, leading to unstable accuracy oscillations.`
        );
        break;
    }

    return observations.join('\n');
  }, [result, dataset, modelType]);

  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
  }, [insightsText]);

  useEffect(() => {
    if (currentIndex < insightsText.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + insightsText[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 4); // Fast typewriter speed
      return () => clearTimeout(timer);
    }
  }, [currentIndex, insightsText]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 10. AI typing animation inside terminal */}
      <div className="lg:col-span-2 glass-card rounded-2xl p-6 bg-black/50 border border-white/5 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        <div>
          <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-2 mb-4 border-b border-white/5 pb-2.5">
            <Terminal className="h-4 w-4" />
            AI Analytical Terminal
          </h3>
          <pre className="font-mono text-[11px] text-cyan-100/90 whitespace-pre-wrap leading-relaxed max-h-[420px] overflow-y-auto pr-2 select-text">
            {displayText}
            {currentIndex < insightsText.length && (
              <span className="w-1.5 h-3.5 ml-0.5 bg-cyan-400 inline-block animate-pulse align-middle" />
            )}
          </pre>
        </div>
        <div className="text-[10px] text-slate-600 mt-4 font-mono">
          SYSTEM LEVEL LOGS: ACTIVE Checkpoints
        </div>
      </div>

      {/* Suggested next experiments */}
      <div className="lg:col-span-1 glass-card rounded-2xl p-6 flex flex-col justify-between relative">
        <div className="space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Lightbulb className="h-4.5 w-4.5 text-purple-400" />
            Suggested Iterations
          </h3>

          <div className="space-y-3">
            {[
              {
                title: 'Compare Boundaries',
                desc: 'Compare SVM margin lines vs Neural Network complex curve decision areas.',
                icon: TrendingUp,
              },
              {
                title: 'Detect Overfitting',
                desc: 'Train a Decision Tree with Max Depth = 15, then observe validation loss gaps.',
                icon: AlertTriangle,
              },
              {
                title: 'Upload Custom CSV Files',
                desc: 'Download clean classification CSVs from Kaggle/UCI and upload to ClassifyIQ.',
                icon: ArrowRight,
              },
            ].map((step, idx) => (
              <div key={idx} className="bg-black/30 p-3.5 rounded-xl border border-white/5 hover:border-cyan-500/10 transition-all flex gap-3 group cursor-pointer">
                <div className="p-2 rounded-lg bg-cyan-950/20 border border-cyan-500/10 shrink-0 self-start group-hover:border-cyan-500/30 transition-all">
                  <step.icon className="h-4 w-4 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-all">{step.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
