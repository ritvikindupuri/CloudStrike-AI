'use server';
/**
 * @fileOverview An AI flow to simulate and analyze the interaction between an attack script and a defense script.
 *
 * - analyzeInteraction - A function that handles the interaction analysis.
 * - AnalyzeInteractionInput - The input type for the analyzeInteraction function.
 * - AnalyzeInteractionOutput - The return type for the analyzeInteraction function.
 * - InteractionStep - The type for a single step in the interaction log.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnalyzeInteractionInputSchema = z.object({
  attackScript: z.string().describe('The original attack script.'),
  defenseScript: z.string().describe('The countermeasure script designed to mitigate the attack.'),
});
export type AnalyzeInteractionInput = z.infer<typeof AnalyzeInteractionInputSchema>;

const InteractionStepSchema = z.object({
    step: z.number().describe("The sequence number of the step."),
    action: z.enum(['Attack', 'Defense', 'System']).describe("The entity performing the action."),
    description: z.string().describe("A concise, single-sentence description of the action taken, referencing the specific command or line if possible."),
    result: z.string().describe("The immediate outcome of the action, e.g., 'Success', 'Blocked by Rule X', 'No Effect', 'Policy Applied'."),
});
export type InteractionStep = z.infer<typeof InteractionStepSchema>;

const AnalyzeInteractionOutputSchema = z.object({
    effectivenessScore: z.number().min(0).max(100).describe('A score from 0 (ineffective) to 100 (fully effective) on how well the defense mitigates the attack.'),
    outcomeSummary: z.string().describe('A summary of what the defense script successfully prevented and where it fell short.'),
    modifiedDefenseScript: z.string().describe('An improved version of the defense script that addresses identified weaknesses.'),
    interactionLog: z.array(InteractionStepSchema).describe("A step-by-step log simulating the interaction between the scripts. It should have between 5 and 10 steps."),
});
export type AnalyzeInteractionOutput = z.infer<typeof AnalyzeInteractionOutputSchema>;


export async function analyzeInteraction(input: AnalyzeInteractionInput): Promise<AnalyzeInteractionOutput> {
  return analyzeInteractionFlow(input);
}

const prompt = ai.definePrompt({
    name: 'analyzeInteractionPrompt',
    input: { schema: AnalyzeInteractionInputSchema },
    output: { schema: AnalyzeInteractionOutputSchema },
    prompt: `You are a "Purple Team" cybersecurity expert, simulating and analyzing a cyber engagement in real-time. Your task is to analyze an attack script and a corresponding defense script. You will simulate the interaction step-by-step.

Attack Script:
\`\`\`
{{{attackScript}}}
\`\`\`

Defense Script:
\`\`\`
{{{defenseScript}}}
\`\`\`

First, provide a final analysis of the engagement:
1.  **effectivenessScore**: An integer score from 0 to 100 representing how well the defense script mitigates the attack.
2.  **outcomeSummary**: A concise summary explaining the final outcome, what was blocked, and what succeeded.
3.  **modifiedDefenseScript**: An improved version of the defense script that addresses any identified weaknesses.

Second, and most importantly, generate a step-by-step **interactionLog**. Simulate the attacker's actions and the defender's responses chronologically. Each step should be a distinct action.
- For each step in the \`interactionLog\`, the \`description\` must be a concise, single-sentence summary of the action taken, **referencing the specific command or line from the script where possible.**
- An **Attack** action is a command from the attack script being executed.
- A **Defense** action is a command from the defense script being executed or a pre-existing policy that blocks an attack.
- A **System** action can be used for context, like "Simulation starting".
- The log must clearly show cause and effect. The \`result\` should state the immediate outcome (e.g., 'Success', 'Blocked by Rule X', 'No Effect').

Provide the entire output in the specified JSON format.
`,
    config: {
        safetySettings: [
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE',
            },
        ],
    },
});

const analyzeInteractionFlow = ai.defineFlow(
  {
    name: 'analyzeInteractionFlow',
    inputSchema: AnalyzeInteractionInputSchema,
    outputSchema: AnalyzeInteractionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
