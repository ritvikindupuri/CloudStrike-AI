'use server';
/**
 * @fileOverview An AI flow to analyze the effectiveness of a defense script against an attack script.
 *
 * - analyzeDefense - A function that handles the defense effectiveness analysis.
 * - AnalyzeDefenseInput - The input type for the analyzeDefense function.
 * - AnalyzeDefenseOutput - The return type for the analyzeDefense function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnalyzeDefenseInputSchema = z.object({
  attackScript: z.string().describe('The original attack script.'),
  defenseScript: z.string().describe('The countermeasure script designed to mitigate the attack.'),
});
export type AnalyzeDefenseInput = z.infer<typeof AnalyzeDefenseInputSchema>;

const AnalyzeDefenseOutputSchema = z.object({
    effectivenessScore: z.number().min(0).max(100).describe('A score from 0 (ineffective) to 100 (fully effective) on how well the defense mitigates the attack.'),
    outcomeSummary: z.string().describe('A summary of what the defense script successfully prevented and where it fell short.'),
    modifiedDefenseScript: z.string().describe('An improved version of the defense script that addresses identified weaknesses.'),
});
export type AnalyzeDefenseOutput = z.infer<typeof AnalyzeDefenseOutputSchema>;


export async function analyzeDefense(input: AnalyzeDefenseInput): Promise<AnalyzeDefenseOutput> {
  return analyzeDefenseFlow(input);
}

const prompt = ai.definePrompt({
    name: 'analyzeDefensePrompt',
    input: { schema: AnalyzeDefenseInputSchema },
    output: { schema: AnalyzeDefenseOutputSchema },
    prompt: `You are a "Purple Team" cybersecurity expert, specializing in evaluating defensive measures against specific attack scripts. Your task is to analyze an attack script and a corresponding defense script to determine the effectiveness of the defense.

Attack Script:
\`\`\`
{{{attackScript}}}
\`\`\`

Defense Script:
\`\`\`
{{{defenseScript}}}
\`\`\`

Based on your analysis, provide the following:
1.  **effectivenessScore**: An integer score from 0 (completely ineffective) to 100 (completely effective) representing how well the defense script mitigates the specific threats in the attack script.
2.  **outcomeSummary**: A concise summary explaining what the defense script successfully prevented and where it fell short. For example, "The defense script successfully blocked the network connection but failed to remove the persistence mechanism."
3.  **modifiedDefenseScript**: A new, improved version of the defense script that addresses the weaknesses you identified. If the original script was already 100% effective, return it unmodified with a comment explaining why no changes were needed.

Provide the output in the specified JSON format.
`,
    config: {
        safetySettings: [
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_ONLY_HIGH',
            },
        ],
    },
});

const analyzeDefenseFlow = ai.defineFlow(
  {
    name: 'analyzeDefenseFlow',
    inputSchema: AnalyzeDefenseInputSchema,
    outputSchema: AnalyzeDefenseOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
