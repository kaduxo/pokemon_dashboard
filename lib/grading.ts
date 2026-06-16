import { GradeCompany, GradingSimResult } from "./types";

export interface GradingServiceTier {
  name: string;
  fee: number;
  turnaround: string;
  maxValue?: number;
}

export const GRADING_SERVICES: Record<GradeCompany, GradingServiceTier[]> = {
  PSA: [
    { name: "Economy", fee: 25, turnaround: "~65 business days", maxValue: 499 },
    { name: "Standard", fee: 50, turnaround: "~45 business days", maxValue: 999 },
    { name: "Express", fee: 150, turnaround: "~10 business days", maxValue: 2499 },
    { name: "Super Express", fee: 300, turnaround: "~5 business days", maxValue: 4999 },
  ],
  BGS: [
    { name: "Economy", fee: 22, turnaround: "~50 business days", maxValue: 299 },
    { name: "Standard", fee: 30, turnaround: "~20 business days", maxValue: 499 },
    { name: "Express", fee: 100, turnaround: "~10 business days", maxValue: 2499 },
    { name: "Super Express", fee: 250, turnaround: "~5 business days" },
  ],
  CGC: [
    { name: "Economy", fee: 12, turnaround: "~30 business days", maxValue: 499 },
    { name: "Standard", fee: 25, turnaround: "~15 business days", maxValue: 999 },
    { name: "Express", fee: 75, turnaround: "~8 business days", maxValue: 2499 },
    { name: "Super Express", fee: 200, turnaround: "~5 business days" },
  ],
  SGC: [
    { name: "Economy", fee: 18, turnaround: "~40 business days", maxValue: 499 },
    { name: "Standard", fee: 35, turnaround: "~20 business days", maxValue: 999 },
    { name: "Express", fee: 100, turnaround: "~10 business days" },
    { name: "Super Express", fee: 250, turnaround: "~5 business days" },
  ],
};

// Grade probability based on raw condition estimate (1-10)
export function getGradeProbabilities(rawEstimate: number): Record<number, number> {
  // Based on raw score 1-10, estimate distribution of professional grades
  if (rawEstimate >= 9.5) return { 10: 0.65, 9.5: 0.20, 9: 0.10, 8: 0.04, 7: 0.01 };
  if (rawEstimate >= 9) return { 10: 0.35, 9.5: 0.25, 9: 0.25, 8: 0.12, 7: 0.03 };
  if (rawEstimate >= 8.5) return { 10: 0.15, 9.5: 0.20, 9: 0.35, 8: 0.22, 7: 0.08 };
  if (rawEstimate >= 8) return { 10: 0.05, 9.5: 0.10, 9: 0.30, 8: 0.35, 7: 0.15, 6: 0.05 };
  if (rawEstimate >= 7) return { 10: 0.01, 9.5: 0.02, 9: 0.10, 8: 0.30, 7: 0.35, 6: 0.15, 5: 0.07 };
  return { 9: 0.02, 8: 0.10, 7: 0.20, 6: 0.30, 5: 0.25, 4: 0.13 };
}

// Grade multipliers over raw price (approximate market data)
export const GRADE_MULTIPLIERS: Record<GradeCompany, Record<number, number>> = {
  PSA: {
    10: 4.5,
    9.5: 2.5,
    9: 1.8,
    8: 1.2,
    7: 0.9,
    6: 0.7,
    5: 0.5,
    4: 0.4,
  },
  BGS: {
    10: 3.8,
    9.5: 3.0,
    9: 1.7,
    8: 1.15,
    7: 0.85,
    6: 0.65,
    5: 0.45,
    4: 0.35,
  },
  CGC: {
    10: 3.5,
    9.5: 2.2,
    9: 1.6,
    8: 1.1,
    7: 0.8,
    6: 0.6,
    5: 0.4,
    4: 0.3,
  },
  SGC: {
    10: 2.8,
    9.5: 1.9,
    9: 1.4,
    8: 1.0,
    7: 0.75,
    6: 0.55,
    5: 0.35,
    4: 0.25,
  },
};

export function calculateGradingROI(
  rawPrice: number,
  rawEstimate: number,
  company: GradeCompany,
  gradingFee: number,
  shippingCost: number
): GradingSimResult[] {
  const probabilities = getGradeProbabilities(rawEstimate);
  const multipliers = GRADE_MULTIPLIERS[company];
  const totalCost = gradingFee + shippingCost;
  
  return Object.entries(probabilities).map(([gradeStr, prob]) => {
    const grade = parseFloat(gradeStr);
    const multiplier = multipliers[grade] || 0.5;
    const gradedPrice = rawPrice * multiplier;
    const netProfit = gradedPrice - rawPrice - totalCost;
    const roi = ((gradedPrice - rawPrice - totalCost) / (rawPrice + totalCost)) * 100;
    
    let recommendation: "grade" | "sell_raw" | "hold" = "hold";
    if (netProfit > totalCost * 0.5 && prob >= 0.25) recommendation = "grade";
    else if (netProfit < 0 && prob >= 0.3) recommendation = "sell_raw";

    return {
      grade,
      probability: prob,
      gradedPrice: Math.round(gradedPrice * 100) / 100,
      gradingCost: totalCost,
      netProfit: Math.round(netProfit * 100) / 100,
      roi: Math.round(roi * 10) / 10,
      recommendation,
    };
  });
}

export function getExpectedValue(results: GradingSimResult[]): number {
  return results.reduce((sum, r) => sum + r.gradedPrice * r.probability, 0);
}

export function getExpectedProfit(
  results: GradingSimResult[],
  rawPrice: number,
  gradingFee: number,
  shippingCost: number
): number {
  const ev = getExpectedValue(results);
  return ev - rawPrice - gradingFee - shippingCost;
}

export function getOverallRecommendation(
  rawPrice: number,
  results: GradingSimResult[],
  gradingFee: number,
  shippingCost: number
): { action: "grade" | "sell_raw" | "hold"; reason: string; ev: number; profit: number } {
  const ev = getExpectedValue(results);
  const profit = getExpectedProfit(results, rawPrice, gradingFee, shippingCost);
  const profitPercent = (profit / (rawPrice + gradingFee + shippingCost)) * 100;

  if (profitPercent > 30) {
    return { action: "grade", reason: `Strong ROI expected (+${profitPercent.toFixed(0)}%). Worth grading.`, ev, profit };
  } else if (profitPercent > 0) {
    return { action: "grade", reason: `Modest ROI (+${profitPercent.toFixed(0)}%). Consider grading if condition is confident.`, ev, profit };
  } else if (rawPrice < 50) {
    return { action: "sell_raw", reason: `Grading fees outweigh potential gains. Sell raw or hold.`, ev, profit };
  } else {
    return { action: "sell_raw", reason: `Expected loss after fees. Better to sell raw.`, ev, profit };
  }
}
