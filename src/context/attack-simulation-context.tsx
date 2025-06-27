'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { simulateAttack } from '@/ai/flows/simulate-attack-flow';
import type { SimulateAttackOutput, SecurityEvent, ChartDataPoint, AttackAnalysis, CloudResource } from '@/ai/flows/simulate-attack-flow';
import { analyzeInteraction } from '@/ai/flows/analyze-interaction-flow';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


interface AttackMetrics {
    totalEvents: number;
    activeThreats: number;
    blockedAttacks: number;
    detectionAccuracy: string;
}

export interface ChartData {
    topProcesses: ChartDataPoint[];
    topEvents: ChartDataPoint[];
}

interface AttackSimulationState {
    simulationRun: boolean;
    loading: boolean;
    events: SecurityEvent[];
    metrics: AttackMetrics | null;
    chartData: ChartData | null;
    analysis: AttackAnalysis | null;
    cloudResources: CloudResource[];
    originalScript: string | null;
    runAttack: (script: string) => Promise<void>;
    updateEventStatus: (eventId: string, newStatus: 'Contained' | 'Resolved') => void;
}

const AttackSimulationContext = createContext<AttackSimulationState | undefined>(undefined);

export function AttackSimulationProvider({ children }: { children: ReactNode }) {
    const [simulationRun, setSimulationRun] = useState(false);
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState<SecurityEvent[]>([]);
    const [metrics, setMetrics] = useState<AttackMetrics | null>(null);
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [analysis, setAnalysis] = useState<AttackAnalysis | null>(null);
    const [cloudResources, setCloudResources] = useState<CloudResource[]>([]);
    const [originalScript, setOriginalScript] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const runAttack = useCallback(async (script: string) => {
        setLoading(true);
        setSimulationRun(true); 

        // Clear previous data immediately
        setEvents([]);
        setMetrics(null);
        setChartData(null);
        setAnalysis(null);
        setCloudResources([]);
        setOriginalScript(script);

        try {
            // Step 1: Get the main simulation data, including the AI-suggested countermeasure
            const simResult: SimulateAttackOutput = await simulateAttack({ script });
            let finalMetrics = simResult.metrics;

            // Step 2: If a countermeasure was suggested, run a second simulation to see how effective it is.
            if (simResult.analysis?.suggestedCountermeasure) {
                try {
                    const interactionResult = await analyzeInteraction({
                        attackScript: script,
                        defenseScript: simResult.analysis.suggestedCountermeasure,
                    });
                    
                    // Step 3: Recalculate the 'blockedAttacks' metric based on the effectiveness score.
                    const realisticBlockedCount = Math.round(
                        (simResult.metrics.totalEvents / 10) * (interactionResult.effectivenessScore / 100)
                    );
                    
                    finalMetrics = {
                        ...simResult.metrics,
                        blockedAttacks: realisticBlockedCount,
                    };

                } catch (interactionError) {
                    console.error("Failed to run interaction analysis, using default metrics:", interactionError);
                    // If the interaction analysis fails, we can just fall back to the originally generated metrics.
                }
            }
            
            setAnalysis(simResult.analysis);
            setEvents(simResult.events);
            setMetrics(finalMetrics);
            setCloudResources(simResult.affectedResources);
            setChartData({
                topProcesses: simResult.topProcesses,
                topEvents: simResult.topEvents,
            });

            toast({
                title: "Simulation Complete",
                description: `The script analysis and data generation is complete.`,
            });
            router.push('/');
        } catch (error) {
            console.error("Attack simulation failed:", error);
            setSimulationRun(false); // Reset if it fails
            toast({
                variant: "destructive",
                title: "Simulation Error",
                description: "Failed to run the attack simulation. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    }, [toast, router]);
    
    const updateEventStatus = useCallback((eventId: string, newStatus: 'Contained' | 'Resolved') => {
        setEvents(prevEvents => 
            prevEvents.map(event => 
                event.id === eventId ? { ...event, status: newStatus } : event
            )
        );
    }, []);

    const value = useMemo(() => ({
        simulationRun,
        loading,
        events,
        metrics,
        chartData,
        analysis,
        cloudResources,
        originalScript,
        runAttack,
        updateEventStatus,
    }), [
        simulationRun,
        loading,
        events,
        metrics,
        chartData,
        analysis,
        cloudResources,
        originalScript,
        runAttack,
        updateEventStatus
    ]);

    return (
        <AttackSimulationContext.Provider value={value}>
            {children}
        </AttackSimulationContext.Provider>
    );
}

export function useAttackSimulation() {
    const context = useContext(AttackSimulationContext);
    if (context === undefined) {
        throw new Error('useAttackSimulation must be used within an AttackSimulationProvider');
    }
    return context;
}
