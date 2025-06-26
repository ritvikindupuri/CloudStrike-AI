'use client';

import { useState } from 'react';
import type { AnalyzeAttackRiskOutput } from '@/ai/flows/analyze-attack-risk';
import { runAttackAnalysis } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { AttackSimulator } from '@/components/attack-simulator';
import { RiskAnalysis } from '@/components/risk-analysis';
import { SimulationHistory } from '@/components/simulation-history';

export interface SimulationRecord {
  id: string;
  timestamp: string;
  attackType: string;
  attackIntensity: number;
  riskScore: number;
}

export function Dashboard() {
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'finished'>('idle');
  const [analysisResult, setAnalysisResult] = useState<AnalyzeAttackRiskOutput | null>(null);
  const [simulationHistory, setSimulationHistory] = useState<SimulationRecord[]>([]);
  const { toast } = useToast();

  const handleStartSimulation = async (attackType: string, attackIntensity: number) => {
    setSimulationState('running');
    setAnalysisResult(null);

    try {
      const result = await runAttackAnalysis({
        attackType,
        attackIntensity,
      });

      setAnalysisResult(result);
      
      const newRecord: SimulationRecord = {
        id: new Date().toISOString(),
        timestamp: new Date().toLocaleString(),
        attackType,
        attackIntensity,
        riskScore: result.riskScore,
      };
      setSimulationHistory(prev => [newRecord, ...prev]);

    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to analyze the attack risk. Please try again.',
      });
    } finally {
      setSimulationState('finished');
    }
  };

  const handleReset = () => {
    setSimulationState('idle');
    setAnalysisResult(null);
  };

  return (
    <div className="grid gap-8 grid-cols-1 mx-auto max-w-3xl w-full">
        <AttackSimulator
          onStartSimulation={handleStartSimulation}
          onReset={handleReset}
          isLoading={simulationState === 'running'}
          isFinished={simulationState === 'finished'}
        />
        <RiskAnalysis result={analysisResult} isLoading={simulationState === 'running'} />
        <SimulationHistory history={simulationHistory} />
    </div>
  );
}
