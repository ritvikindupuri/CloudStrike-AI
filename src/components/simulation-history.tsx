'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { SimulationRecord } from './dashboard';
import { History } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface SimulationHistoryProps {
  history: SimulationRecord[];
}

export function SimulationHistory({ history }: SimulationHistoryProps) {
  const getRiskBadgeVariant = (score: number): 'destructive' | 'default' => {
    if (score > 7) return 'destructive';
    return 'default';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <History className="text-primary"/>
            Simulation Log
        </CardTitle>
        <CardDescription>A log of all past attack simulations and their outcomes.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[240px]">
        {history.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground text-center py-4">No simulations run yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attack</TableHead>
                <TableHead className="text-right">Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="font-medium">{record.attackType}</div>
                    <div className="text-xs text-muted-foreground">Intensity: {record.attackIntensity}%</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={getRiskBadgeVariant(record.riskScore)}>{record.riskScore}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
