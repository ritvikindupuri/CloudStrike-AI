
'use server';
/**
 * @fileOverview An AI flow to model a cyber attack based on a provided script and generate corresponding security events, metrics, and a detailed analysis.
 *
 * - modelAttackScenario - A function that handles the attack modeling process.
 * - ModelAttackScenarioInput - The input type for the modelAttackScenario function.
 * - ModelAttackScenarioOutput - The return type for the modelAttackScenario function.
 * - SecurityEvent - The type for an individual security event.
 * - CloudResource - The type for an individual cloud resource.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ModelAttackScenarioInputSchema = z.object({
  script: z.string().describe('The PowerShell or shell script to model.'),
});
export type ModelAttackScenarioInput = z.infer<typeof ModelAttackScenarioInputSchema>;

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
    resourceId: z.string().describe('A realistic but fictional resource identifier, e.g., "i-0a1b2c3d4e5f6g7h8" for an EC2 instance or an ARN for AWS resources.'),
    provider: z.enum(['AWS', 'Azure', 'GCP']).describe('The cloud provider for the resource.'),
    service: z.string().describe('The service type, e.g., "EC2 Instance", "Blob Storage", "Cloud Function".'),
    region: z.string().describe('The cloud region where the resource is located, e.g., "us-east-1".'),
    status: z.enum(['Compromised', 'Vulnerable', 'Investigating', 'Protected']).describe('The security status of this resource as a result of the attack.'),
    reasonForStatus: z.string().describe("A brief, single-sentence explanation for the resource's status, explicitly tying it to a specific action or command in the attack script.")
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

const ModelAttackScenarioOutputSchema = z.object({
    analysis: AnalysisSchema.describe("A detailed analysis of the modeled attack, including summaries, risk score, recommended actions, and a countermeasure script."),
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
export type ModelAttackScenarioOutput = z.infer<typeof ModelAttackScenarioOutputSchema>;


export async function modelAttackScenario(input: ModelAttackScenarioInput): Promise<ModelAttackScenarioOutput> {
  return modelAttackScenarioFlow(input);
}

const prompt = ai.definePrompt({
    name: 'modelAttackScenarioPrompt',
    input: { schema: ModelAttackScenarioInputSchema },
    output: { schema: ModelAttackScenarioOutputSchema },
    prompt: `You are a Cloud Intrusion Detection System (CIDS) analyzer and a senior security automation engineer. Your role is to generate realistic security data and a professional threat analysis based on a cyber attack script provided by the user.

First, meticulously analyze the following script to understand its intent, methodology, and potential impact.

Script to analyze:
\`\`\`
{{{script}}}
\`\`\`

Based on your analysis of this script, generate a complete scenario analysis output. This includes:
1.  **Threat Analysis**: A detailed analysis including a risk score, executive summary, technical breakdown, and recommended actions. The analysis must be specific to the actions in the script.
2.  **Suggested Countermeasure**: Write a practical PowerShell or shell script that a security administrator could run to help mitigate the threat.
3.  **Affected Cloud Resources**: Generate a list of 5 to 10 specific and realistic cloud resources that would be directly impacted by the actions in the provided script. The connection between the script and the resource must be direct and logical. For each resource, the 'reasonForStatus' field is critical and must explicitly tie the status to a specific action in the attack script (e.g., "Status is 'Compromised' because the script successfully downloaded sensitive data from this S3 bucket.").
4.  **Security Events**: A list of 20 to 30 diverse security events that would be generated if this script were executed in a cloud environment. Reference MITRE ATT&CK techniques where possible.
5.  **Dashboard Metrics**: Plausible metrics (total events, active threats, etc.) reflecting the script's impact.
6.  **Chart Data**: Top processes and events that would be observed as a result of the script's execution.

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

const modelAttackScenarioFlow = ai.defineFlow(
  {
    name: 'modelAttackScenarioFlow',
    inputSchema: ModelAttackScenarioInputSchema,
    outputSchema: ModelAttackScenarioOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
    
