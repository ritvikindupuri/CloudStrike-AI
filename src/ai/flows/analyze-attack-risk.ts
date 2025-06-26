'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing the risk of a simulated DDoS attack.
 *
 * - analyzeAttackRisk - The main function to analyze the attack and provide a risk score.
 * - AnalyzeAttackRiskInput - The input type for the analyzeAttackRisk function.
 * - AnalyzeAttackRiskOutput - The output type for the analyzeAttackRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAttackRiskInputSchema = z.object({
  attackType: z.string().describe('Type of the DDoS attack (e.g., SYN flood, UDP flood).'),
  attackIntensity: z
    .number()
    .describe('Intensity of the DDoS attack on a scale of 1-100.'),
  otherParameters: z
    .string()
    .optional()
    .describe('Other relevant parameters as a JSON string, such as target system details.'),
});

export type AnalyzeAttackRiskInput = z.infer<typeof AnalyzeAttackRiskInputSchema>;

const AnalyzeAttackRiskOutputSchema = z.object({
  riskScore: z.number().describe('The risk score of the attack (e.g., 1-10, where 10 is highest risk).'),
  reasoning: z.string().describe('Reasoning behind the assigned risk score based on the input data.'),
});

export type AnalyzeAttackRiskOutput = z.infer<typeof AnalyzeAttackRiskOutputSchema>;

export async function analyzeAttackRisk(input: AnalyzeAttackRiskInput): Promise<AnalyzeAttackRiskOutput> {
  return analyzeAttackRiskFlow(input);
}

const analyzeAttackRiskPrompt = ai.definePrompt({
  name: 'analyzeAttackRiskPrompt',
  input: {schema: AnalyzeAttackRiskInputSchema},
  output: {schema: AnalyzeAttackRiskOutputSchema},
  prompt: `You are a cybersecurity expert analyzing DDoS attacks.

  Based on the following information about a simulated DDoS attack, assess the risk and provide a risk score (1-10) along with your reasoning.

  Attack Type: {{{attackType}}}
  Attack Intensity: {{{attackIntensity}}}%
  Other Parameters: {{{otherParameters}}}

  The attack intensity is a percentage from 10 to 100.
  Provide a risk score and detailed reasoning for the score. Focus on the potential impact on system stability.
  Ensure that the risk score is a number between 1 and 10.
`,
});

const analyzeAttackRiskFlow = ai.defineFlow(
  {
    name: 'analyzeAttackRiskFlow',
    inputSchema: AnalyzeAttackRiskInputSchema,
    outputSchema: AnalyzeAttackRiskOutputSchema,
  },
  async input => {
    const {output} = await analyzeAttackRiskPrompt(input);
    return output!;
  }
);
