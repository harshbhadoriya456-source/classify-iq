export type ColumnType = 'numeric' | 'categorical';

export interface Bin {
  binStart: number;
  binEnd: number;
  count: number;
}

export interface ColumnStats {
  min: number;
  max: number;
  mean: number;
  stdDev: number;
  distribution: Bin[];
}

export interface DatasetColumn {
  name: string;
  type: ColumnType;
  stats?: ColumnStats;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  columns: DatasetColumn[];
  rows: Record<string, string | number>[];
  targetColumn: string;
  source: 'preset' | 'upload';
}

export type ModelType =
  | 'logistic_regression'
  | 'decision_tree'
  | 'random_forest'
  | 'svm'
  | 'neural_network';

export type HyperparameterValue = string | number | boolean;

export interface HyperparameterField {
  name: string;
  label: string;
  description: string;
  type: 'number' | 'select' | 'boolean';
  default: HyperparameterValue;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: HyperparameterValue }[];
}

export interface ModelConfig {
  id: ModelType;
  name: string;
  description: string;
  hyperparameters: HyperparameterField[];
}

export interface EpochLog {
  epoch: number;
  loss: number;
  valLoss: number;
  accuracy: number;
  valAccuracy: number;
}

export interface ConfusionMatrixCell {
  actual: string;
  predicted: string;
  count: number;
}

export interface ROCPoint {
  fpr: number;
  tpr: number;
}

export interface DecisionBoundaryPoint {
  x: number;
  y: number;
  actual: string;
  predicted: string;
}

export interface EvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
}

export interface TrainingResult {
  epochLogs: EpochLog[];
  metrics: EvaluationMetrics;
  confusionMatrix: ConfusionMatrixCell[];
  rocCurve: ROCPoint[];
  decisionBoundary: DecisionBoundaryPoint[];
}
