'use server';
/**
 * @fileOverview An AI flow to generate a cloud-native attack script based on a user's description.
 *
 * - generateAttackScript - A function that handles the script generation process.
 * - GenerateAttackScriptInput - The input type for the generateAttackScript function.
 * - GenerateAttackScriptOutput - The return type for the generateAttackScript function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateAttackScriptInputSchema = z.object({
  description: z.string().describe('A natural language description of the cloud-native attack to simulate.'),
});
export type GenerateAttackScriptInput = z.infer<typeof GenerateAttackScriptInputSchema>;

const GenerateAttackScriptOutputSchema = z.object({
    script: z.string().describe('The generated PowerShell or shell script for the described attack.'),
});
export type GenerateAttackScriptOutput = z.infer<typeof GenerateAttackScriptOutputSchema>;

export async function generateAttackScript(input: GenerateAttackScriptInput): Promise<GenerateAttackScriptOutput> {
  return generateAttackScriptFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateAttackScriptPrompt',
    input: { schema: GenerateAttackScriptInputSchema },
    output: { schema: GenerateAttackScriptOutputSchema },
    prompt: `You are a cybersecurity expert specializing in cloud security and red teaming. Your task is to write a realistic but **simulated** attack script based on a user's request.

The script should target **cloud-native services** (e.g., AWS S3, Lambda, IAM; Azure Blob Storage, Functions; GCP Cloud Storage, Cloud Functions).

**IMPORTANT RULES:**
1.  **Simulation Only:** The script must NOT perform any real destructive actions. Use comments and commands like 'Write-Host' or 'echo' to describe what *would* happen. For example, instead of deleting a file, use 'Write-Host "Simulating deletion of file: $($file.Name)"'.
2.  **Cloud-Native Focus:** The attack vector must be plausible for a cloud environment.
3.  **Realism:** The script should look like a real attack script, using common PowerShell or shell commands and patterns for the specified cloud environment.
4.  **Clarity:** Add comments mapping actions to MITRE ATT&CK techniques where appropriate (e.g., '# T1530: Data from Cloud Storage Object').

User Request: "{{{description}}}"

Generate the script that simulates this attack.
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

const generateAttackScriptFlow = ai.defineFlow(
  {
    name: 'generateAttackScriptFlow',
    inputSchema: GenerateAttackScriptInputSchema,
    outputSchema: GenerateAttackScriptOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
