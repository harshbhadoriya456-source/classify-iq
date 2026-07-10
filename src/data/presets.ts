import { Dataset, ColumnStats } from '../types';

// Helper to compute stats for numerical columns
function computeColumnStats(values: number[]): ColumnStats {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;
  
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Generate 5 bins for distribution histogram
  const binSize = (max - min) / 5 || 1;
  const distribution = Array.from({ length: 5 }, (_, i) => {
    const binStart = min + i * binSize;
    const binEnd = binStart + binSize;
    return { binStart, binEnd, count: 0 };
  });

  values.forEach((v) => {
    let placed = false;
    for (let i = 0; i < 5; i++) {
      if (v >= distribution[i].binStart && v <= distribution[i].binEnd) {
        distribution[i].count++;
        placed = true;
        break;
      }
    }
    if (!placed) {
      // Catch edges
      if (v < min) distribution[0].count++;
      if (v > max) distribution[4].count++;
    }
  });

  return { min, max, mean, stdDev, distribution };
}

// Preset 1: Iris Dataset (truncated but representative subset of 45 samples)
const irisRows = [
  { sepal_length: 5.1, sepal_width: 3.5, petal_length: 1.4, petal_width: 0.2, species: 'setosa' },
  { sepal_length: 4.9, sepal_width: 3.0, petal_length: 1.4, petal_width: 0.2, species: 'setosa' },
  { sepal_length: 4.7, sepal_width: 3.2, petal_length: 1.3, petal_width: 0.2, species: 'setosa' },
  { sepal_length: 4.6, sepal_width: 3.1, petal_length: 1.5, petal_width: 0.2, species: 'setosa' },
  { sepal_length: 5.0, sepal_width: 3.6, petal_length: 1.4, petal_width: 0.2, species: 'setosa' },
  { sepal_length: 5.4, sepal_width: 3.9, petal_length: 1.7, petal_width: 0.4, species: 'setosa' },
  { sepal_length: 4.6, sepal_width: 3.4, petal_length: 1.4, petal_width: 0.3, species: 'setosa' },
  { sepal_length: 5.0, sepal_width: 3.4, petal_length: 1.5, petal_width: 0.2, species: 'setosa' },
  { sepal_length: 4.4, sepal_width: 2.9, petal_length: 1.4, petal_width: 0.2, species: 'setosa' },
  { sepal_length: 4.9, sepal_width: 3.1, petal_length: 1.5, petal_width: 0.1, species: 'setosa' },
  { sepal_length: 7.0, sepal_width: 3.2, petal_length: 4.7, petal_width: 1.4, species: 'versicolor' },
  { sepal_length: 6.4, sepal_width: 3.2, petal_length: 4.5, petal_width: 1.5, species: 'versicolor' },
  { sepal_length: 6.9, sepal_width: 3.1, petal_length: 4.9, petal_width: 1.5, species: 'versicolor' },
  { sepal_length: 5.5, sepal_width: 2.3, petal_length: 4.0, petal_width: 1.3, species: 'versicolor' },
  { sepal_length: 6.5, sepal_width: 2.8, petal_length: 4.6, petal_width: 1.5, species: 'versicolor' },
  { sepal_length: 5.7, sepal_width: 2.8, petal_length: 4.5, petal_width: 1.3, species: 'versicolor' },
  { sepal_length: 6.3, sepal_width: 3.3, petal_length: 4.7, petal_width: 1.6, species: 'versicolor' },
  { sepal_length: 4.9, sepal_width: 2.4, petal_length: 3.3, petal_width: 1.0, species: 'versicolor' },
  { sepal_length: 6.6, sepal_width: 2.9, petal_length: 4.6, petal_width: 1.3, species: 'versicolor' },
  { sepal_length: 5.2, sepal_width: 2.7, petal_length: 3.9, petal_width: 1.4, species: 'versicolor' },
  { sepal_length: 6.3, sepal_width: 3.3, petal_length: 6.0, petal_width: 2.5, species: 'virginica' },
  { sepal_length: 5.8, sepal_width: 2.7, petal_length: 5.1, petal_width: 1.9, species: 'virginica' },
  { sepal_length: 7.1, sepal_width: 3.0, petal_length: 5.9, petal_width: 2.1, species: 'virginica' },
  { sepal_length: 6.3, sepal_width: 2.9, petal_length: 5.6, petal_width: 1.8, species: 'virginica' },
  { sepal_length: 6.5, sepal_width: 3.0, petal_length: 5.8, petal_width: 2.2, species: 'virginica' },
  { sepal_length: 7.6, sepal_width: 3.0, petal_length: 6.6, petal_width: 2.1, species: 'virginica' },
  { sepal_length: 4.9, sepal_width: 2.5, petal_length: 4.5, petal_width: 1.7, species: 'virginica' },
  { sepal_length: 7.3, sepal_width: 2.9, petal_length: 6.3, petal_width: 1.8, species: 'virginica' },
  { sepal_length: 6.7, sepal_width: 2.5, petal_length: 5.8, petal_width: 1.8, species: 'virginica' },
  { sepal_length: 7.2, sepal_width: 3.6, petal_length: 6.1, petal_width: 2.5, species: 'virginica' },
];

const breastCancerRows = [
  { radius_mean: 17.99, texture_mean: 10.38, perimeter_mean: 122.8, area_mean: 1001, smoothness_mean: 0.1184, diagnosis: 'Malignant' },
  { radius_mean: 20.57, texture_mean: 17.77, perimeter_mean: 132.9, area_mean: 1326, smoothness_mean: 0.0847, diagnosis: 'Malignant' },
  { radius_mean: 19.69, texture_mean: 21.25, perimeter_mean: 130, area_mean: 1203, smoothness_mean: 0.1096, diagnosis: 'Malignant' },
  { radius_mean: 11.42, texture_mean: 20.38, perimeter_mean: 77.58, area_mean: 386.1, smoothness_mean: 0.1425, diagnosis: 'Malignant' },
  { radius_mean: 20.29, texture_mean: 14.34, perimeter_mean: 135.1, area_mean: 1297, smoothness_mean: 0.1003, diagnosis: 'Malignant' },
  { radius_mean: 12.45, texture_mean: 15.7, perimeter_mean: 82.57, area_mean: 477.1, smoothness_mean: 0.1278, diagnosis: 'Malignant' },
  { radius_mean: 18.25, texture_mean: 19.98, perimeter_mean: 119.6, area_mean: 1040, smoothness_mean: 0.0946, diagnosis: 'Malignant' },
  { radius_mean: 13.71, texture_mean: 20.83, perimeter_mean: 90.2, area_mean: 577.9, smoothness_mean: 0.1189, diagnosis: 'Malignant' },
  { radius_mean: 13.0, texture_mean: 21.82, perimeter_mean: 87.5, area_mean: 519.8, smoothness_mean: 0.1273, diagnosis: 'Malignant' },
  { radius_mean: 12.46, texture_mean: 24.04, perimeter_mean: 83.97, area_mean: 475.9, smoothness_mean: 0.1186, diagnosis: 'Malignant' },
  { radius_mean: 13.54, texture_mean: 14.36, perimeter_mean: 87.46, area_mean: 566.3, smoothness_mean: 0.0977, diagnosis: 'Benign' },
  { radius_mean: 13.08, texture_mean: 15.71, perimeter_mean: 85.63, area_mean: 520.0, smoothness_mean: 0.1075, diagnosis: 'Benign' },
  { radius_mean: 9.504, texture_mean: 12.44, perimeter_mean: 60.34, area_mean: 273.9, smoothness_mean: 0.1024, diagnosis: 'Benign' },
  { radius_mean: 13.03, texture_mean: 18.42, perimeter_mean: 82.61, area_mean: 523.8, smoothness_mean: 0.0898, diagnosis: 'Benign' },
  { radius_mean: 11.51, texture_mean: 23.93, perimeter_mean: 74.52, area_mean: 403.5, smoothness_mean: 0.0926, diagnosis: 'Benign' },
  { radius_mean: 13.85, texture_mean: 17.21, perimeter_mean: 88.44, area_mean: 585.3, smoothness_mean: 0.1078, diagnosis: 'Benign' },
  { radius_mean: 13.61, texture_mean: 24.98, perimeter_mean: 88.21, area_mean: 574.7, smoothness_mean: 0.0694, diagnosis: 'Benign' },
  { radius_mean: 11.29, texture_mean: 20.37, perimeter_mean: 72.93, area_mean: 386.0, smoothness_mean: 0.0812, diagnosis: 'Benign' },
  { radius_mean: 8.196, texture_mean: 16.84, perimeter_mean: 51.71, area_mean: 201.9, smoothness_mean: 0.0860, diagnosis: 'Benign' },
  { radius_mean: 12.02, texture_mean: 14.62, perimeter_mean: 78.04, area_mean: 449.3, smoothness_mean: 0.0921, diagnosis: 'Benign' },
];

const syntheticRows = [
  { feature_1: -1.2, feature_2: 0.8, label: 'Class A' },
  { feature_1: -0.9, feature_2: 1.1, label: 'Class A' },
  { feature_1: -1.5, feature_2: -0.2, label: 'Class A' },
  { feature_1: -0.5, feature_2: 0.5, label: 'Class A' },
  { feature_1: -0.2, feature_2: 1.4, label: 'Class A' },
  { feature_1: -1.0, feature_2: 0.2, label: 'Class A' },
  { feature_1: -1.4, feature_2: 0.9, label: 'Class A' },
  { feature_1: -0.7, feature_2: 0.7, label: 'Class A' },
  { feature_1: -0.6, feature_2: -0.5, label: 'Class A' },
  { feature_1: -1.1, feature_2: 1.2, label: 'Class A' },
  { feature_1: 0.8, feature_2: -0.9, label: 'Class B' },
  { feature_1: 1.2, feature_2: -1.2, label: 'Class B' },
  { feature_1: 0.5, feature_2: -0.4, label: 'Class B' },
  { feature_1: 1.4, feature_2: 0.1, label: 'Class B' },
  { feature_1: 0.9, feature_2: -0.7, label: 'Class B' },
  { feature_1: 0.2, feature_2: -1.1, label: 'Class B' },
  { feature_1: 1.1, feature_2: -0.5, label: 'Class B' },
  { feature_1: 0.6, feature_2: -0.8, label: 'Class B' },
  { feature_1: 1.3, feature_2: -1.0, label: 'Class B' },
  { feature_1: 0.4, feature_2: -0.6, label: 'Class B' },
];

export function buildDataset(id: string, name: string, description: string, targetColumn: string, rows: Record<string, string | number>[]): Dataset {
  const keys = Object.keys(rows[0]);
  const columns = keys.map((key) => {
    const values = rows.map((r) => r[key]);
    const isNumeric = values.every((v) => typeof v === 'number');
    
    return {
      name: key,
      type: (isNumeric ? 'numeric' : 'categorical') as 'numeric' | 'categorical',
      stats: isNumeric ? computeColumnStats(values as number[]) : undefined,
    };
  });

  return {
    id,
    name,
    description,
    columns,
    rows,
    targetColumn,
    source: 'preset',
  };
}

export const PRESET_DATASETS: Dataset[] = [
  buildDataset(
    'iris',
    'Iris Flower Dataset',
    'A classic ML dataset classification of Iris species based on sepal and petal measurements.',
    'species',
    irisRows
  ),
  buildDataset(
    'breast_cancer',
    'Breast Cancer Wisconsin',
    'Diagnostic dataset for classifying breast masses as Malignant or Benign from visual features.',
    'diagnosis',
    breastCancerRows
  ),
  buildDataset(
    'synthetic_binary',
    'Synthetic Binary Clusters',
    'Artificially generated 2D clusters optimized for verifying linear/non-linear classification boundaries.',
    'label',
    syntheticRows
  ),
];
