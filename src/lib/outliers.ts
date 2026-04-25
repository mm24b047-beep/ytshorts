export function calculateOutlierStats(values: number[]): {
  mean: number;
  stdDev: number;
  upperThreshold: number;
} {
  if (values.length === 0) {
    return { mean: 0, stdDev: 0, upperThreshold: 0 };
  }

  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Upper threshold: mean + 1.5 standard deviations
  const upperThreshold = mean + 1.5 * stdDev;

  return { mean, stdDev, upperThreshold };
}

export function getOutlierMultiplier(value: number, values: number[]): number {
  const { mean } = calculateOutlierStats(values);
  if (mean <= 0) return 0;
  return value / mean;
}

export function isOutlier(value: number, values: number[]): boolean {
  const { upperThreshold } = calculateOutlierStats(values);
  return value > upperThreshold;
}
