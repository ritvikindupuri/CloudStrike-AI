'use client';
import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import type { ModelAttackScenarioOutput } from '@/ai/flows/types/simulate-attack-types';
import { modelAttackScenario } from '@/ai/flows/simulate-attack-flow';
import { useToast } from '@/hooks/use-toast';
import { defaultAttackData } from '@/lib/default-simulation-data';


interface SimulationState {
    data: ModelAttackScenarioOutput | null;
    setData: (data: ModelAttackScenarioOutput | null) => void;
    isLoading: boolean;
    setIsLoading: (script: string) => void;
}

const SimulationContext = createContext<SimulationState | undefined>(undefined);

export function SimulationProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast();
    const [data, setData] = useState<ModelAttackScenarioOutput | null>(defaultAttackData);
    const [isLoading, setIsLoading] = useState(false);
    const [currentScript, setCurrentScript] = useState<string>('');

    useEffect(() => {
        const runSimulation = async () => {
            if (isLoading && currentScript) {
                try {
                    const result = await modelAttackScenario({ script: currentScript });
                    setData(result);
                     toast({
                        title: 'Simulation Complete',
                        description: 'The attack scenario has been successfully modeled.',
                    });
                } catch (error) {
                    console.error("Failed to model attack scenario:", error);
                    toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: 'Could not model the attack scenario. Please try again.',
                    });
                    setData(null);
                } finally {
                    setIsLoading(false);
                    setCurrentScript('');
                }
            }
        };
        runSimulation();
    }, [isLoading, currentScript, toast]);

    const startLoading = useCallback((script: string) => {
        setData(null);
        setCurrentScript(script);
        setIsLoading(true);
    }, []);

    const value = useMemo(() => ({
        data,
        setData,
        isLoading,
        setIsLoading: startLoading,
    }), [data, isLoading, startLoading]);

    return (
        <SimulationContext.Provider value={value}>
            {children}
        </SimulationContext.Provider>
    );
}

export function useSimulation() {
    const context = useContext(SimulationContext);
    if (context === undefined) {
        throw new Error('useSimulation must be used within a SimulationProvider');
    }
    return context;
}
