'use server';
/**
 * @fileOverview An AI flow to generate an incident response plan for a security event.
 *
 * - generateResponsePlan - A function that handles generating the response plan.
 * - GenerateResponsePlanInput - The input type for the generateResponsePlan function.
 * - GenerateResponsePlanOutput - The return type for the generateResponsePlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SecurityEventSchema = z.object({
    id: z.string().describe("A unique event identifier."),
    timestamp: z.string().describe("The event timestamp."),
    severity: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The severity of the event.'),
    description: z.string().describe('A concise description of the event.'),
    status: z.enum(['Investigating', 'Contained', 'Resolved', 'Action Required']).describe('The current status of the event.'),
});
export type GenerateResponsePlanInput = z.infer<typeof SecurityEventSchema>;


const GenerateResponsePlanOutputSchema = z.object({
    suggestedSteps: z.array(z.string()).describe("A list of 3-4 concrete, actionable steps an analyst should take to respond to this specific event."),
    suggestedStatus: z.enum(['Contained', 'Resolved']).describe("The suggested status to move this event to after taking the initial steps."),
    justification: z.string().describe("A brief justification for the suggested steps and status.")
});
export type GenerateResponsePlanOutput = z.infer<typeof GenerateResponsePlanOutputSchema>;

export async function generateResponsePlan(input: GenerateResponsePlanInput): Promise<GenerateResponsePlanOutput> {
  return generateResponsePlanFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateResponsePlanPrompt',
    input: { schema: SecurityEventSchema },
    output: { schema: GenerateResponsePlanOutputSchema },
    prompt: `You are a Tier 2 Security Operations Center (SOC) Analyst playbook generator. Your task is to create a concise incident response plan for a given security event.

Security Event Details:
- Event ID: {{{id}}}
- Timestamp: {{{timestamp}}}
- Severity: {{{severity}}}
- Description: {{{description}}}
- Current Status: {{{status}}}

Based on this event, provide a response plan in JSON format with the following fields:
1.  **suggestedSteps**: A list of 3-4 clear, actionable steps a security engineer should take immediately. Be specific. For example, instead of "Check logs", say "Correlate firewall logs with web server access logs for the 5 minutes surrounding the event timestamp."
2.  **suggestedStatus**: The most appropriate status to assign this event after the initial steps are taken, either 'Contained' or 'Resolved'.
3.  **justification**: A single sentence explaining why these steps are recommended.
`,
});

const generateResponsePlanFlow = ai.defineFlow(
  {
    name: 'generateResponsePlanFlow',
    inputSchema: SecurityEventSchema,
    outputSchema: GenerateResponsePlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
