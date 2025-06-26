'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { simulateAttack, SimulateAttackOutput, SecurityEvent } from '@/ai/flows/analyze-attack-risk';
import { useToast } from '@/hooks/use-toast';

interface AttackMetrics {
    totalEvents: string;
    activeThreats: string;
    blockedAttacks: string;
    detectionAccuracy: string;
}

interface AttackSimulationState {
    simulationRun: boolean;
    loading: boolean;
    events: SecurityEvent[];
    metrics: AttackMetrics | null;
    runAttack: (attackType: string, description: string) => Promise<void>;
}

const AttackSimulationContext = createContext<AttackSimulationState | undefined>(undefined);

export function AttackSimulationProvider({ children }: { children: ReactNode }) {
    const [simulationRun, setSimulationRun] = useState(false);
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState<SecurityEvent[]>([]);
    const [metrics, setMetrics] = useState<AttackMetrics | null>(null);
    const { toast } = useToast();

    const runAttack = async (attackType: string, description: string) => {
        setLoading(true);
        setSimulationRun(true); // Mark that a simulation is starting/has run

        // Clear previous data immediately
        setEvents([]);
        setMetrics(null);

        try {
            const result: SimulateAttackOutput = await simulateAttack({ attackType, description });
            
            setEvents(result.events);
            setMetrics(result.metrics);

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
