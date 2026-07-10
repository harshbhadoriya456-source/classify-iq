import { Dataset, ModelType, HyperparameterValue, TrainingResult, EpochLog, ConfusionMatrixCell, ROCPoint, DecisionBoundaryPoint, EvaluationMetrics } from '../types';

export function runSimulation(
  dataset: Dataset,
  modelType: ModelType,
  hyperparameters: Record<string, HyperparameterValue>
): TrainingResult {
  // Extract hyperparams with default fallbacks
  const epochs = Number(hyperparameters.epochs || 30);
  const learningRate = Number(hyperparameters.learning_rate || 0.01);
  const maxDepth = Number(hyperparameters.max_depth || 5);
  const estimators = Number(hyperparameters.n_estimators || 50);
  const regularization = Number(hyperparameters.c_reg || 1.0);
  const activation = String(hyperparameters.activation || 'relu');

  // Determine difficulty/noise and size
  const nSamples = dataset.rows.length;
  
  // Model performance coefficients (simulate impact of model choice and parameters)
  let baseAccuracy = 0.75;
  let convergenceSpeed = 0.15;
  let noiseLevel = 0.05;

  switch (modelType) {
    case 'logistic_regression':
      // Linear boundary: good on synthetic binary, medium on iris, worse on complex non-linear
      baseAccuracy = dataset.id === 'synthetic_binary' ? 0.90 : dataset.id === 'iris' ? 0.85 : 0.72;
      // Regularization influence (C too low underfits, C too high overfits)
      if (regularization < 0.1) baseAccuracy -= 0.10;
      if (regularization > 10) baseAccuracy -= 0.02;
      convergenceSpeed = 0.1;
      break;

    case 'decision_tree':
      // Non-linear: prone to overfitting with high depth
      baseAccuracy = dataset.id === 'iris' ? 0.93 : dataset.id === 'breast_cancer' ? 0.88 : 0.85;
      if (maxDepth < 3) baseAccuracy -= 0.15; // Underfitting
      if (maxDepth > 10) {
        baseAccuracy -= 0.05; // Overfitting on validation
        noiseLevel = 0.12; // Higher gap between training and validation
      }
      convergenceSpeed = 0.25; // Quick convergence
      break;

    case 'random_forest':
      // Robust ensemble: high accuracy, less overfitting
      baseAccuracy = dataset.id === 'iris' ? 0.96 : dataset.id === 'breast_cancer' ? 0.93 : 0.90;
      if (estimators < 10) baseAccuracy -= 0.08;
      if (maxDepth < 3) baseAccuracy -= 0.12;
      convergenceSpeed = 0.20;
      break;

    case 'svm':
      // Margin classifier
      baseAccuracy = dataset.id === 'synthetic_binary' ? 0.95 : dataset.id === 'iris' ? 0.94 : 0.89;
      if (regularization < 0.1) baseAccuracy -= 0.12;
      convergenceSpeed = 0.08;
      break;

    case 'neural_network':
      // Deep/multi-layer model: depends heavily on learning rate and activation
      baseAccuracy = dataset.id === 'iris' ? 0.97 : dataset.id === 'breast_cancer' ? 0.94 : 0.92;
      if (learningRate > 0.3) {
        baseAccuracy -= 0.25; // Diverging learning rate
        convergenceSpeed = 0.5; // Unstable jump
      } else if (learningRate < 0.001) {
        baseAccuracy -= 0.15; // Too slow
        convergenceSpeed = 0.02;
      }
      if (activation === 'tanh') baseAccuracy += 0.01;
      break;
  }

  // Adjust for small datasets
  if (nSamples < 15) baseAccuracy -= 0.05;

  // Bound base accuracy between 0.5 and 0.99
  baseAccuracy = Math.max(0.5, Math.min(0.99, baseAccuracy));

  // Generate Epoch logs
  const epochLogs: EpochLog[] = [];
  let currentLoss = 1.2;
  let currentValLoss = 1.3;
  let currentAcc = 0.35;
  let currentValAcc = 0.33;

  for (let epoch = 1; epoch <= epochs; epoch++) {
    // Simulated training dynamics
    const learningProgress = 1 - Math.exp(-epoch * convergenceSpeed);
    const targetTrainAcc = baseAccuracy + (1 - baseAccuracy) * 0.05 * learningProgress;
    const targetValAcc = baseAccuracy - noiseLevel * (epoch / epochs);

    // Dynamic smoothing
    currentAcc = currentAcc + (targetTrainAcc - currentAcc) * 0.3 + (Math.random() - 0.5) * 0.02;
    currentValAcc = currentValAcc + (targetValAcc - currentValAcc) * 0.3 + (Math.random() - 0.5) * 0.03;

    // Constrain accuracies
    currentAcc = Math.min(1.0, Math.max(0.3, currentAcc));
    currentValAcc = Math.min(currentAcc, Math.max(0.3, currentValAcc));

    // Inverse relation for loss
    currentLoss = currentLoss * 0.85 + (1 - currentAcc) * 0.3 + (Math.random() - 0.5) * 0.02;
    currentValLoss = currentValLoss * 0.87 + (1 - currentValAcc) * 0.35 + (Math.random() - 0.5) * 0.03;

    epochLogs.push({
      epoch,
      loss: Number(Math.max(0.01, currentLoss).toFixed(4)),
      valLoss: Number(Math.max(0.02, currentValLoss).toFixed(4)),
      accuracy: Number(currentAcc.toFixed(4)),
      valAccuracy: Number(currentValAcc.toFixed(4)),
    });
  }

  // Final metrics
  const finalAcc = epochLogs[epochs - 1].valAccuracy;
  const metrics: EvaluationMetrics = {
    accuracy: finalAcc,
    precision: Math.min(0.99, finalAcc + (Math.random() - 0.5) * 0.04),
    recall: Math.min(0.99, finalAcc + (Math.random() - 0.5) * 0.04),
    f1: 0,
  };
  metrics.f1 = (2 * metrics.precision * metrics.recall) / (metrics.precision + metrics.recall) || 0;

  // Round metrics to 4 decimal places
  metrics.accuracy = Number(metrics.accuracy.toFixed(4));
  metrics.precision = Number(metrics.precision.toFixed(4));
  metrics.recall = Number(metrics.recall.toFixed(4));
  metrics.f1 = Number(metrics.f1.toFixed(4));

  // Determine classes in dataset
  const targetCol = dataset.targetColumn;
  const uniqueClasses = Array.from(new Set(dataset.rows.map(r => String(r[targetCol]))));
  
  // Confusion Matrix
  const confusionMatrix: ConfusionMatrixCell[] = [];
  const testSize = 100; // Simulated test size for matrix integers
  
  uniqueClasses.forEach((actualClass) => {
    let remaining = Math.round(testSize / uniqueClasses.length);
    uniqueClasses.forEach((predictedClass) => {
      let count = 0;
      if (actualClass === predictedClass) {
        count = Math.round(remaining * finalAcc);
      } else {
        count = Math.round(remaining * (1 - finalAcc) / (uniqueClasses.length - 1 || 1));
      }
      remaining -= count;
      confusionMatrix.push({
        actual: actualClass,
        predicted: predictedClass,
        count: Math.max(0, count)
      });
    });
    // Add residual to the true positive to balance out rounding
    if (remaining !== 0) {
      const idx = confusionMatrix.findIndex(cell => cell.actual === actualClass && cell.predicted === actualClass);
      if (idx !== -1) confusionMatrix[idx].count += remaining;
    }
  });

  // ROC Curve points
  const rocCurve: ROCPoint[] = [{ fpr: 0, tpr: 0 }];
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    const fpr = i / steps;
    // Perfect model would have tpr=1 immediately, poor model has tpr=fpr.
    const tpr = Math.min(1.0, Math.pow(fpr, 1 - finalAcc) + (1 - finalAcc) * 0.1 * Math.sin(fpr * Math.PI));
    rocCurve.push({
      fpr: Number(fpr.toFixed(2)),
      tpr: Number(Math.max(fpr, tpr).toFixed(2))
    });
  }
  rocCurve.push({ fpr: 1, tpr: 1 });

  // Decision Boundary (X/Y coordinate space projection)
  // Use first 2 numeric features of dataset
  const numericCols = dataset.columns.filter(c => c.type === 'numeric' && c.name !== targetCol);
  const xColName = numericCols[0]?.name || 'Feature 1';
  const yColName = numericCols[1]?.name || 'Feature 2';

  const xStats = dataset.columns.find(c => c.name === xColName)?.stats;
  const yStats = dataset.columns.find(c => c.name === yColName)?.stats;

  const minX = xStats?.min ?? -2;
  const maxX = xStats?.max ?? 2;
  const minY = yStats?.min ?? -2;
  const maxY = yStats?.max ?? 2;

  const decisionBoundary: DecisionBoundaryPoint[] = [];

  // Generate grid points for background decision area
  const xRange = maxX - minX;
  const yRange = maxY - minY;
  const gridSteps = 15;

  for (let i = 0; i <= gridSteps; i++) {
    for (let j = 0; j <= gridSteps; j++) {
      const x = minX + (i / gridSteps) * xRange;
      const y = minY + (j / gridSteps) * yRange;

      // Simulate a decision boundary classification prediction
      let decisionVal = 0.5;
      if (modelType === 'logistic_regression' || modelType === 'svm') {
        // Linear separator simulation
        decisionVal = (x - minX) / xRange - (y - minY) / yRange + 0.5;
      } else {
        // Non-linear boundary simulation
        decisionVal = Math.sin(x * 2) * Math.cos(y * 2) * 0.5 + 0.5;
      }

      // Add noise or threshold depending on class counts
      let predictedIndex = Math.floor(decisionVal * uniqueClasses.length);
      predictedIndex = Math.min(uniqueClasses.length - 1, Math.max(0, predictedIndex));
      const predicted = uniqueClasses[predictedIndex];

      // Match actual class by proximity to actual dataset points
      let closestPoint: Record<string, string | number> | null = null;
      let minDistance = Infinity;

      dataset.rows.forEach((r) => {
        const rx = Number(r[xColName] ?? 0);
        const ry = Number(r[yColName] ?? 0);
        const dist = Math.pow(rx - x, 2) + Math.pow(ry - y, 2);
        if (dist < minDistance) {
          minDistance = dist;
          closestPoint = r;
        }
      });

      const actual = closestPoint ? String((closestPoint as any)[targetCol]) : predicted;

      decisionBoundary.push({
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        actual,
        predicted
      });
    }
  }

  return {
    epochLogs,
    metrics,
    confusionMatrix,
    rocCurve,
    decisionBoundary,
  };
}
