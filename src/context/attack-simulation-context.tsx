
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { modelAttackScenario } from '@/ai/flows/simulate-attack-flow';
import type { ModelAttackScenarioOutput, SecurityEvent, ChartDataPoint, AttackAnalysis, CloudResource } from '@/ai/flows/simulate-attack-flow';
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

interface ThreatAnalysisState {
    analysisRun: boolean;
    loading: boolean;
    events: SecurityEvent[];
    metrics: AttackMetrics | null;
    chartData: ChartData | null;
    analysis: AttackAnalysis | null;
    cloudResources: CloudResource[];
    originalScript: string | null;
    runAnalysis: (script: string) => Promise<void>;
    updateEventStatus: (eventId: string, newStatus: 'Contained' | 'Resolved') => void;
}

const ThreatAnalysisContext = createContext<ThreatAnalysisState | undefined>(undefined);

export function ThreatAnalysisProvider({ children }: { children: ReactNode }) {
    const [analysisRun, setAnalysisRun] = useState(false);
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState<SecurityEvent[]>([]);
    const [metrics, setMetrics] = useState<AttackMetrics | null>(null);
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [analysis, setAnalysis] = useState<AttackAnalysis | null>(null);
    const [cloudResources, setCloudResources] = useState<CloudResource[]>([]);
    const [originalScript, setOriginalScript] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const runAnalysis = useCallback(async (script: string) => {
        setLoading(true);
        setAnalysisRun(true); 

        setEvents([]);
        setMetrics(null);
        setChartData(null);
        setAnalysis(null);
        setCloudResources([]);
        setOriginalScript(script);

        try {
            const scenarioResult: ModelAttackScenarioOutput = await modelAttackScenario({ script });
            let finalMetrics = scenarioResult.metrics;

            if (scenarioResult.analysis?.suggestedCountermeasure) {
                try {
                    const interactionResult = await analyzeInteraction({
                        attackScript: script,
                        defenseScript: scenarioResult.analysis.suggestedCountermeasure,
                    });
                    
                    const realisticBlockedCount = Math.round(
                        (scenarioResult.metrics.totalEvents / 10) * (interactionResult.effectivenessScore / 100)
                    );
                    
                    finalMetrics = {
                        ...scenarioResult.metrics,
                        blockedAttacks: realisticBlockedCount,
                    };

                } catch (interactionError) {
                    console.error("Failed to run interaction analysis, using default metrics:", interactionError);
                }
            }
            
            setAnalysis(scenarioResult.analysis);
            setEvents(scenarioResult.events);
            setMetrics(finalMetrics);
            setCloudResources(scenarioResult.affectedResources);
            setChartData({
                topProcesses: scenarioResult.topProcesses,
                topEvents: scenarioResult.topEvents,
            });

            toast({
                title: "Analysis Complete",
                description: `The scenario modeling and data generation is complete.`,
            });
            router.push('/');
        } catch (error) {
            console.error("Attack analysis failed:", error);
            setAnalysisRun(false);
            toast({
                variant: "destructive",
                title: "Analysis Error",
                description: "Failed to run the scenario analysis. Please try again.",
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
        analysisRun,
        loading,
        events,
        metrics,
        chartData,
        analysis,
        cloudResources,
        originalScript,
        runAnalysis,
        updateEventStatus,
    }), [
        analysisRun,
        loading,
        events,
        metrics,
        chartData,
        analysis,
        cloudResources,
        originalScript,
        runAnalysis,
        updateEventStatus
    ]);

    return (
        <ThreatAnalysisContext.Provider value={value}>
            {children}
        </ThreatAnalysisContext.Provider>
    );
}

export function useThreatAnalysis() {
    const context = useContext(ThreatAnalysisContext);
    if (context === undefined) {
        throw new Error('useThreatAnalysis must be used within a ThreatAnalysisProvider');
    }
    return context;
}
