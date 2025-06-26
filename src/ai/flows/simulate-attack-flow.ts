
'use server';
/**
 * @fileOverview An AI flow to simulate a cyber attack based on a provided script and generate corresponding security events, metrics, and a detailed analysis.
 *
 * - simulateAttack - A function that handles the attack simulation process.
 * - SimulateAttackInput - The input type for the simulateAttack function.
 * - SimulateAttackOutput - The return type for the simulateAttack function.
 * - SecurityEvent - The type for an individual security event.
 * - CloudResource - The type for an individual cloud resource.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SimulateAttackInputSchema = z.object({
  script: z.string().describe('The PowerShell or shell script to simulate.'),
});
export type SimulateAttackInput = z.infer<typeof SimulateAttackInputSchema>;

const SecurityEventSchema = z.object({
    id: z.string().describe('A unique event identifier, e.g., "EVT-001".'),
    timestamp: z.string().describe('The event timestamp in "YYYY-MM-DD HH:mm:ss" format.'),
    severity: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The severity of the event.'),
    description: z.string().describe('A concise description of the event, referencing MITRE ATT&CK techniques where possible (e.g., "T1059.001: PowerShell Execution").'),
    status: z.enum(['Investigating', 'Contained', 'Resolved', 'Action Required']).describe('The current status of the event.'),
});
export type SecurityEvent = z.infer<typeof SecurityEventSchema>;

const CloudResourceSchema = z.object({
    name: z.string().describe('A specific, realistic name for the cloud resource, e.g., "web-server-prod-01" or "customer-data-bucket".'),
    provider: z.enum(['AWS', 'Azure', 'GCP']).describe('The cloud provider for the resource.'),
    service: z.string().describe('The service type, e.g., "EC2 Instance", "Blob Storage", "Cloud Function".'),
    status: z.enum(['Compromised', 'Vulnerable', 'Investigating', 'Protected']).describe('The security status of this resource as a result of the attack.'),
});
export type CloudResource = z.infer<typeof CloudResourceSchema>;

const ChartDataPointSchema = z.object({
    name: z.string().describe('The name of the entity (e.g., process name, event name).'),
    count: z.number().describe('The number of occurrences.'),
});
export type ChartDataPoint = z.infer<typeof ChartDataPointSchema>;

const AnalysisSchema = z.object({
    executiveSummary: z.string().describe("A high-level summary of the attack and its business impact, suitable for a non-technical audience. This must be based on the provided script."),
    technicalBreakdown: z.string().describe("A detailed technical explanation of the attack vector, observed IOCs (Indicators of Compromise), and system behavior based on the provided script."),
    riskScore: z.number().min(0).max(100).describe("A risk score from 0 (low) to 100 (critical) based on the severity and potential impact of the provided script."),
    recommendedActions: z.array(z.string()).describe("A list of 3-5 concrete, actionable steps the security team should take to mitigate the threat from the provided script."),
    suggestedCountermeasure: z.string().describe("A PowerShell or shell script that acts as a countermeasure to the attack. This should be a practical script that an administrator could run to help mitigate the threat (e.g., blocking IPs, terminating processes, reverting changes).")
});
export type AttackAnalysis = z.infer<typeof AnalysisSchema>;

const SimulateAttackOutputSchema = z.object({
    analysis: AnalysisSchema.describe("A detailed analysis of the simulated attack, including summaries, risk score, recommended actions, and a countermeasure script."),
    events: z.array(SecurityEventSchema).describe('A list of 20-30 security events that would be generated if this script were executed in a cloud environment.'),
    metrics: z.object({
        totalEvents: z.number().describe('The total number of events generated as an integer. This should be a high number to reflect the attack.'),
        activeThreats: z.number().describe('The number of active threats detected as an integer.'),
        blockedAttacks: z.number().describe('The number of attacks automatically blocked as an integer.'),
        detectionAccuracy: z.string().describe('The detection accuracy of the system as a percentage, e.g., "99.7%".'),
    }).describe('Key metrics for the dashboard, reflecting the impact of the attack script.'),
    affectedResources: z.array(CloudResourceSchema).describe('A list of 5-10 specific cloud resources that would be affected by this script, including their provider and status.'),
    topProcesses: z.array(ChartDataPointSchema).describe('A list of the top 10 most frequent "process.exe" names and their counts that would result from this script.'),
    topEvents: z.array(ChartDataPointSchema).describe('A list of the top 10 most frequent "event.exe" names and their counts that would result from this script.'),
});
export type SimulateAttackOutput = z.infer<typeof SimulateAttackOutputSchema>;


export async function simulateAttack(input: SimulateAttackInput): Promise<SimulateAttackOutput> {
  return simulateAttackFlow(input);
}

const prompt = ai.definePrompt({
    name: 'simulateAttackPrompt',
    input: { schema: SimulateAttackInputSchema },
    output: { schema: SimulateAttackOutputSchema },
    prompt: `You are a Cloud Intrusion Detection System (CIDS) simulator and a senior security automation engineer. Your role is to generate realistic security data and a professional threat analysis based on a cyber attack script provided by the user.

First, meticulously analyze the following script to understand its intent, methodology, and potential impact. Determine the specific type of attack it is performing (e.g., Credential Dumping, Data Exfiltration, Port Scanning) and map its actions to the MITRE ATT&CK framework if possible.

Script to analyze:
\`\`\`
{{{script}}}
\`\`\`

Based on your analysis of this script, generate a complete simulation output. This includes:
1.  **Threat Analysis**: A detailed analysis including a risk score, executive summary, technical breakdown, and recommended actions. The analysis must be specific to the actions in the script.
2.  **Suggested Countermeasure**: Write a practical PowerShell or shell script that a security administrator could run to help mitigate the threat. For example, it could block IPs found in the attack, terminate malicious processes, or revert system changes. This must be a functional script.
3.  **Affected Cloud Resources**: A list of 5 to 10 specific, realistically named cloud resources that would be directly affected by the script's execution. Assign a relevant security status to each.
4.  **Security Events**: A list of 20 to 30 diverse security events that would be generated if this script were executed in a cloud environment. When possible, make the event descriptions specific and reference relevant cybersecurity frameworks like MITRE ATT&CK (e.g., 'T1059.001: PowerShell Execution' or 'Data Exfiltration via C2 Channel').
5.  **Dashboard Metrics**: Plausible metrics (total events, active threats, etc.) reflecting the script's impact. The numbers should be high integers to reflect a serious incident.
6.  **Chart Data**: Top processes and events that would be observed as a result of the script's execution.

Provide the entire output in the specified JSON format.
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
