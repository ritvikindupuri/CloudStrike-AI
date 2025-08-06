import { z } from 'zod';

export const SecurityEventSchema = z.object({
    id: z.string().describe("A unique event identifier."),
    timestamp: z.string().describe("The event timestamp."),
    severity: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The severity of the event.'),
    description: z.string().describe('A concise description of the event.'),
    status: z.enum(['Investigating', 'Contained', 'Resolved', 'Action Required']).describe('The current status of the event.'),
});
export type GenerateResponsePlanInput = z.infer<typeof SecurityEventSchema>;


export const GenerateResponsePlanOutputSchema = z.object({
    suggestedSteps: z.array(z.string()).describe("A list of 3-4 concrete, actionable steps an analyst should take to respond to this specific event."),
    suggestedStatus: z.enum(['Contained', 'Resolved']).describe("The suggested status to move this event to after taking the initial steps."),
    justification: z.string().describe("A brief justification for the suggested steps and status.")
});
export type GenerateResponsePlanOutput = z.infer<typeof GenerateResponsePlanOutputSchema>;
