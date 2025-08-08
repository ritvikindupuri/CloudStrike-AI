'use client';
import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import type { ModelAttackScenarioOutput } from '@/ai/flows/types/simulate-attack-types';
import { modelAttackScenario } from '@/ai/flows/simulate-attack-flow';
import { useToast } from '@/hooks/use-toast';
import { defaultAttackData } from '@/lib/default-simulation-data';

interface Session extends ModelAttackScenarioOutput {
    id: string;
    timestamp: number;
    name: string;
}

interface SimulationState {
    data: ModelAttackScenarioOutput | null;
    setData: (data: ModelAttackScenarioOutput | null) => void;
    isLoading: boolean;
    setIsLoading: (script: string, description: string) => void;
    clearSimulation: () => void;
    history: Session[];
    loadFromHistory: (id: string) => void;
    clearHistory: () => void;
}

const SimulationContext = createContext<SimulationState | undefined>(undefined);

export function SimulationProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast();
    const [data, setData] = useState<ModelAttackScenarioOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentScript, setCurrentScript] = useState<string>('');
    const [currentDescription, setCurrentDescription] = useState('');
    const [history, setHistory] = useState<Session[]>([]);

     useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('simulationHistory');
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error("Could not load history from localStorage", error);
        }
    }, []);

    const saveHistory = (newHistory: Session[]) => {
        try {
            localStorage.setItem('simulationHistory', JSON.stringify(newHistory));
            setHistory(newHistory);
        } catch (error) {
            console.error("Could not save history to localStorage", error);
        }
    };

    const addToHistory = (newData: ModelAttackScenarioOutput, name: string) => {
        const newSession: Session = {
            ...newData,
            id: `SESSION-${Date.now()}`,
            timestamp: Date.now(),
            name: name || "Untitled Scenario",
        };
        const updatedHistory = [newSession, ...history].slice(0, 10); // Keep last 10 sessions
        saveHistory(updatedHistory);
    };

    const loadFromHistory = (id: string) => {
        const session = history.find(s => s.id === id);
        if (session) {
            setData(session);
            toast({
                title: 'Scenario Loaded',
                description: `Loaded "${session.name}" from history.`,
            });
        }
    };

    const clearHistory = () => {
        saveHistory([]);
        toast({
            title: 'History Cleared',
            description: 'All saved simulation sessions have been removed.',
        });
    };

    useEffect(() => {
        const runSimulation = async () => {
            if (isLoading && currentScript) {
                try {
                    const result = await modelAttackScenario({ script: currentScript });
                    setData(result);
                    addToHistory(result, currentDescription);
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
                    setCurrentDescription('');
                }
            }
        };
        runSimulation();
    }, [isLoading, currentScript, currentDescription, toast]);

    const startLoading = useCallback((script: string, description: string) => {
        setData(null);
        setCurrentScript(script);
        setCurrentDescription(description);
        setIsLoading(true);
    }, []);

    const clearSimulation = useCallback(() => {
        setData(null);
    }, []);

    const value = useMemo(() => ({
        data,
        setData,
        isLoading,
        setIsLoading: startLoading,
        clearSimulation,
        history,
        loadFromHistory,
        clearHistory,
    }), [data, isLoading, startLoading, clearSimulation, history]);

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
