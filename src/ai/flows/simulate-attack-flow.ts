'use server';
/**
 * @fileOverview An AI flow to simulate a cyber attack and generate corresponding security events, metrics, and a detailed analysis.
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

const ChartDataPointSchema = z.object({
    name: z.string().describe('The name of the entity (e.g., process name, event name, IP address).'),
    count: z.number().describe('The number of occurrences.'),
});
export type ChartDataPoint = z.infer<typeof ChartDataPointSchema>;

const AnalysisSchema = z.object({
    executiveSummary: z.string().describe("A high-level summary of the attack and its business impact, suitable for a non-technical audience."),
    technicalBreakdown: z.string().describe("A detailed technical explanation of the attack vector, observed IOCs (Indicators of Compromise), and system behavior."),
    riskScore: z.number().min(0).max(100).describe("A risk score from 0 (low) to 100 (critical) based on the severity, potential impact, and data generated."),
    recommendedActions: z.array(z.string()).describe("A list of 3-5 concrete, actionable steps the security team should take to mitigate this threat."),
});
export type AttackAnalysis = z.infer<typeof AnalysisSchema>;

const SimulateAttackOutputSchema = z.object({
    analysis: AnalysisSchema.describe("A detailed analysis of the simulated attack, including summaries, risk score, and recommended actions."),
    events: z.array(SecurityEventSchema).describe('A list of 20-30 security events generated as a result of the simulated attack.'),
    metrics: z.object({
        totalEvents: z.string().describe('The total number of events generated in a 24-hour-style format, e.g., "23,518". This should be a high number to reflect the attack.'),
        activeThreats: z.string().describe('The number of active threats detected, e.g., "47".'),
        blockedAttacks: z.string().describe('The number of attacks automatically blocked, e.g., "1,247".'),
        detectionAccuracy: z.string().describe('The detection accuracy of the system as a percentage, e.g., "99.7%".'),
    }).describe('Key metrics for the dashboard, reflecting the impact of the attack.'),
    topProcesses: z.array(ChartDataPointSchema).describe('A list of the top 10 most frequent "process.exe" names and their counts.'),
    topEvents: z.array(ChartDataPointSchema).describe('A list of the top 10 most frequent "event.exe" names and their counts.'),
    botConnections: z.array(ChartDataPointSchema).describe('A list of the top 5 bot IP addresses and their connection counts.'),
});
export type SimulateAttackOutput = z.infer<typeof SimulateAttackOutputSchema>;


export async function simulateAttack(input: SimulateAttackInput): Promise<SimulateAttackOutput> {
  return simulateAttackFlow(input);
}

const prompt = ai.definePrompt({
    name: 'simulateAttackPrompt',
    input: { schema: SimulateAttackInputSchema },
    output: { schema: SimulateAttackOutputSchema },
    prompt: `You are a Cloud Intrusion Detection System (CIDS) simulator. Your role is to generate realistic security data and a professional threat analysis based on a simulated cyber attack.

The user is simulating the following attack:
- Attack Type: {{{attackType}}}
- Description: {{{description}}}

First, create a detailed threat analysis for this attack. This analysis must include:
1.  **riskScore**: An integer risk score from 0 (low) to 100 (critical).
2.  **executiveSummary**: A concise, non-technical summary for leadership.
3.  **technicalBreakdown**: A detailed technical explanation for security analysts.
4.  **recommendedActions**: A list of 3-5 immediate, actionable steps for the security team.

Next, based on this attack, generate a list of 20 to 30 diverse security events. These events must be a direct consequence of the attack. For example, a DDoS attack would generate events related to traffic spikes, resource exhaustion, and firewall blocks. A credential stuffing attack would generate many failed login attempts followed by a potential successful but anomalous login.

Then, generate plausible dashboard metrics that reflect the scale and nature of the attack. The metrics should tell a story consistent with the generated events and the analysis. Ensure the numbers are high to reflect a serious incident.

Finally, generate data for the following charts based on the simulated attack:
- A list of the top 10 most frequent "process.exe" names and their counts.
- A list of the top 10 most frequent "event.exe" names and their counts.
- A list of the top 5 bot IP addresses (use realistic but fake IPs) and their connection counts.

Provide the entire output in the specified JSON format.
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
