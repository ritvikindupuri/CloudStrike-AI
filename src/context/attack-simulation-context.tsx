'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { simulateAttack } from '@/ai/flows/simulate-attack-flow';
import type { SimulateAttackOutput, SecurityEvent, ChartDataPoint, AttackAnalysis, CloudResource } from '@/ai/flows/simulate-attack-flow';
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
    runAttack: (script: string) => Promise<void>;
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
    const { toast } = useToast();
    const router = useRouter();

    const runAttack = async (script: string) => {
        setLoading(true);
        setSimulationRun(true); 

        // Clear previous data immediately
        setEvents([]);
        setMetrics(null);
        setChartData(null);
        setAnalysis(null);
        setCloudResources([]);

        try {
            const result: SimulateAttackOutput = await simulateAttack({ script });
            
            setAnalysis(result.analysis);
            setEvents(result.events);
            setMetrics(result.metrics);
            setCloudResources(result.affectedResources);
            setChartData({
                topProcesses: result.topProcesses,
                topEvents: result.topEvents,
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
    };

    const value = {
        simulationRun,
        loading,
        events,
        metrics,
        chartData,
        analysis,
        cloudResources,
        runAttack,
    };

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
