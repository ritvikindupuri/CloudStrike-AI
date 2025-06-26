
'use server';

import { analyzeAttackRisk, type AnalyzeAttackRiskInput, type AnalyzeAttackRiskOutput } from '@/ai/flows/analyze-attack-risk';

export async function runAttackAnalysis(input: AnalyzeAttackRiskInput): Promise<AnalyzeAttackRiskOutput> {
  try {
    const result = await analyzeAttackRisk(input);
    return result;
  } catch (error) {
    console.error("Error in Genkit flow:", error);
    throw new Error("Failed to get analysis from AI model.");
  }
}
