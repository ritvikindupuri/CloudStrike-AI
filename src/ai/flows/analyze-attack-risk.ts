'use server';
/**
 * @fileOverview An AI flow to simulate a cyber attack and generate corresponding security events and metrics.
 *
 * - simulateAttack - A function that handles the attack simulation process.
 * - SimulateAttackInput - The input type for the simulateAttack function.
 * - SimulateAttackOutput - The return type for the simulateAttack function.
 * - SecurityEvent - The type for an individual security event.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SimulateAttackInputSchema = z.object({
  attackType: z.string().describe('The type of attack to simulate (e.g., "DNS Flood", "HTTP Flood", "Credential Stuffing").'),
  description: z.string().describe('A brief description of the attack being simulated.'),
});
export type SimulateAttackInput = z.infer<typeof SimulateAttackInputSchema>;

const SecurityEventSchema = z.object({
    id: z.string().describe('A unique event identifier, e.g., "EVT-001".'),
    timestamp: z.string().describe('The event timestamp in "YYYY-MM-DD HH:mm:ss" format.'),
    severity: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The severity of the event.'),
    description: z.string().describe('A concise description of the event.'),
    status: z.enum(['Investigating', 'Contained', 'Resolved', 'Action Required']).describe('The current status of the event.'),
});
export type SecurityEvent = z.infer<typeof SecurityEventSchema>;

const SimulateAttackOutputSchema = z.object({
    events: z.array(SecurityEventSchema).describe('A list of 20-30 security events generated as a result of the simulated attack.'),
    metrics: z.object({
        totalEvents: z.string().describe('The total number of events generated in a 24-hour-style format, e.g., "23,518". This should be a high number to reflect the attack.'),
        activeThreats: z.string().describe('The number of active threats detected, e.g., "47".'),
        blockedAttacks: z.string().describe('The number of attacks automatically blocked, e.g., "1,247".'),
        detectionAccuracy: z.string().describe('The detection accuracy of the system as a percentage, e.g., "99.7%".'),
    }).describe('Key metrics for the dashboard, reflecting the impact of the attack.'),
});
export type SimulateAttackOutput = z.infer<typeof SimulateAttackOutputSchema>;


export async function simulateAttack(input: SimulateAttackInput): Promise<SimulateAttackOutput> {
  return simulateAttackFlow(input);
}

const prompt = ai.definePrompt({
    name: 'simulateAttackPrompt',
    input: { schema: SimulateAttackInputSchema },
    output: { schema: SimulateAttackOutputSchema },
    prompt: `You are a Cloud Intrusion Detection System (CIDS) simulator. Your role is to generate realistic security data based on a simulated cyber attack.

The user is simulating the following attack:
- Attack Type: {{{attackType}}}
- Description: {{{description}}}

Based on this attack, generate a list of 20 to 30 diverse security events. These events should be a direct consequence of the attack. For example, a DDoS attack would generate many events related to traffic spikes, resource exhaustion, and firewall blocks. A credential stuffing attack would generate many failed login attempts followed by a potential successful but anomalous login.

Also, generate plausible dashboard metrics that reflect the scale and nature of the attack. The metrics should tell a story consistent with the generated events. Ensure the numbers are high to reflect a serious incident.

Provide the output in the specified JSON format.
`,
});

const simulateAttackFlow = ai.defineFlow(
  {
    name: 'simulateAttackFlow',
    inputSchema: SimulateAttackInputSchema,
    outputSchema: SimulateAttackOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
