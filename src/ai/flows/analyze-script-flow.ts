'use server';
/**
 * @fileOverview An AI flow to analyze a script for malicious content.
 *
 * - analyzeScript - A function that handles the script analysis process.
 * - AnalyzeScriptInput - The input type for the analyzeScript function.
 * - AnalyzeScriptOutput - The return type for the analyzeScript function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnalyzeScriptInputSchema = z.object({
  script: z.string().describe('The script content to analyze (e.g., PowerShell, bash).'),
});
export type AnalyzeScriptInput = z.infer<typeof AnalyzeScriptInputSchema>;

const AnalyzeScriptOutputSchema = z.object({
    isMalicious: z.boolean().describe('Whether or not the script is deemed malicious.'),
    riskScore: z.number().min(0).max(100).describe('A risk score from 0 (safe) to 100 (critical).'),
    summary: z.string().describe('A concise summary of what the script does.'),
    recommendations: z.string().describe('Recommended actions for the user (e.g., "Block and quarantine", "Monitor execution").'),
});
export type AnalyzeScriptOutput = z.infer<typeof AnalyzeScriptOutputSchema>;


export async function analyzeScript(input: AnalyzeScriptInput): Promise<AnalyzeScriptOutput> {
  return analyzeScriptFlow(input);
}

const prompt = ai.definePrompt({
    name: 'analyzeScriptPrompt',
    input: { schema: AnalyzeScriptInputSchema },
    output: { schema: AnalyzeScriptOutputSchema },
    prompt: `You are a senior cybersecurity analyst specializing in malware and script analysis. Your task is to analyze the provided script and determine if it is malicious.

Analyze the following script:
\`\`\`
{{{script}}}
\`\`\`

Based on your analysis, provide the following:
1.  **isMalicious**: A boolean value indicating if the script is malicious.
2.  **riskScore**: An integer risk score from 0 (safe) to 100 (critically dangerous). Base this score on the potential impact and intent of the script.
3.  **summary**: A brief, technical summary of the script's functionality. Explain what it attempts to do.
4.  **recommendations**: A clear, actionable recommendation for a security administrator. Examples: "Safe to run," "Monitor with caution," "Block immediately and investigate."

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

const analyzeScriptFlow = ai.defineFlow(
  {
    name: 'analyzeScriptFlow',
    inputSchema: AnalyzeScriptInputSchema,
    outputSchema: AnalyzeScriptOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
