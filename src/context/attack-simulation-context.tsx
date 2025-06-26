'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { simulateAttack, SimulateAttackOutput, SecurityEvent, ChartDataPoint, AttackAnalysis } from '@/ai/flows/simulate-attack-flow';
import { useToast } from '@/hooks/use-toast';

interface AttackMetrics {
    totalEvents: string;
    activeThreats: string;
    blockedAttacks: string;
    detectionAccuracy: string;
}

export interface ChartData {
    topProcesses: ChartDataPoint[];
    topEvents: ChartDataPoint[];
    botConnections: ChartDataPoint[];
}

interface AttackSimulationState {
    simulationRun: boolean;
    loading: boolean;
    events: SecurityEvent[];
    metrics: AttackMetrics | null;
    chartData: ChartData | null;
    analysis: AttackAnalysis | null;
    runAttack: (attackType: string, description: string) => Promise<void>;
}

const AttackSimulationContext = createContext<AttackSimulationState | undefined>(undefined);

export function AttackSimulationProvider({ children }: { children: ReactNode }) {
    const [simulationRun, setSimulationRun] = useState(false);
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState<SecurityEvent[]>([]);
    const [metrics, setMetrics] = useState<AttackMetrics | null>(null);
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [analysis, setAnalysis] = useState<AttackAnalysis | null>(null);
    const { toast } = useToast();

    const runAttack = async (attackType: string, description: string) => {
        setLoading(true);
        setSimulationRun(true); 

        // Clear previous data immediately
        setEvents([]);
        setMetrics(null);
        setChartData(null);
        setAnalysis(null);

        try {
            const result: SimulateAttackOutput = await simulateAttack({ attackType, description });
            
            setAnalysis(result.analysis);
            setEvents(result.events);
            setMetrics(result.metrics);
            setChartData({
                topProcesses: result.topProcesses,
                topEvents: result.topEvents,
                botConnections: result.botConnections
            });

            toast({
                title: "Simulation Complete",
                description: `The "${attackType}" simulation has finished generating data.`,
            });
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
