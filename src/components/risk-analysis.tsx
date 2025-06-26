'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Zap } from 'lucide-react';
import type { AnalyzeAttackRiskOutput } from '@/ai/flows/analyze-attack-risk';
import { Badge } from '@/components/ui/badge';
import { Label } from './ui/label';

interface RiskAnalysisProps {
  result: AnalyzeAttackRiskOutput | null;
  isLoading: boolean;
}

export function RiskAnalysis({ result, isLoading }: RiskAnalysisProps) {
  
  const getRiskBadgeVariant = (score: number): 'destructive' | 'default' => {
    if (score > 7) return 'destructive';
    return 'default';
  }
  
  const getRiskLevelText = (score: number) => {
      if (score > 7) return 'High';
      if (score > 4) return 'Medium';
      return 'Low';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="text-primary" />
          AI Risk Analysis
        </CardTitle>
        <CardDescription>AI-powered assessment of the simulated attack's impact.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 min-h-[200px]">
        {isLoading && (
          <div className="space-y-4 pt-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}
        {!isLoading && !result && (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 h-full">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p>Run a simulation to see the risk analysis.</p>
          </div>
        )}
        {!isLoading && result && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Label className="text-base">Risk Level</Label>
                <Badge variant={getRiskBadgeVariant(result.riskScore)} className="text-base px-4 py-2">
                    {getRiskLevelText(result.riskScore)}: {result.riskScore}/10
                </Badge>
            </div>
            <div>
              <Label className="font-semibold">Reasoning</Label>
              <p className="text-muted-foreground text-sm mt-1">{result.reasoning}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
