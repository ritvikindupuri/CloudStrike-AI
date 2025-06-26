'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Terminal } from 'lucide-react';

interface AttackSimulatorProps {
  onStartSimulation: (attackType: string, intensity: number) => void;
  onReset: () => void;
  isLoading: boolean;
  isFinished: boolean;
}

const attackTypes = ['SYN Flood', 'UDP Flood', 'ICMP Flood', 'HTTP Flood'];

export function AttackSimulator({ onStartSimulation, onReset, isLoading, isFinished }: AttackSimulatorProps) {
  const [attackType, setAttackType] = useState(attackTypes[0]);
  const [intensity, setIntensity] = useState(50);
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['PS C:\\> Ready for simulation.']);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  const handleRun = () => {
    const newOutput: string[] = [
      `PS C:\\> Start-DDoSAttack -Type ${attackType} -Intensity ${intensity}`,
      'Initializing simulation environment...',
      `Injecting malicious packets (${attackType})...`,
      'Monitoring network traffic response...',
    ];
    setTerminalOutput(newOutput);
    onStartSimulation(attackType, intensity);

    setTimeout(() => {
        setTerminalOutput(prev => [...prev, 'Attack analysis in progress...']);
    }, 1500);

     setTimeout(() => {
        setTerminalOutput(prev => [...prev, 'Simulation complete. Check analysis panel.']);
    }, 4000);
  };
  
  const handleReset = () => {
      onReset();
      setTerminalOutput(['PS C:\\> Simulation reset. Ready for new simulation.']);
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="text-primary" />
          DDoS Attack Simulator
        </CardTitle>
        <CardDescription>Configure and launch a simulated DDoS attack in a sandboxed environment.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="attack-type">Attack Type</Label>
              <Select value={attackType} onValueChange={setAttackType} disabled={isLoading}>
                <SelectTrigger id="attack-type" className="font-code">
                  <SelectValue placeholder="Select attack type" />
                </SelectTrigger>
                <SelectContent>
                  {attackTypes.map(type => (
                    <SelectItem key={type} value={type} className="font-code">{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="intensity">Attack Intensity ({intensity}%)</Label>
              <Slider
                id="intensity"
                min={10}
                max={100}
                step={10}
                value={[intensity]}
                onValueChange={(value) => setIntensity(value[0])}
                disabled={isLoading}
              />
            </div>
          </div>
          <div ref={terminalRef} className="bg-slate-950 rounded-lg p-4 font-code text-sm text-white h-48 overflow-y-auto border border-slate-800">
            {terminalOutput.map((line, index) => (
              <p key={index}><span className="text-green-400">&gt;</span> {line}</p>
            ))}
            {isLoading && <div className="text-green-400 animate-pulse">&gt; _</div>}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRun} disabled={isLoading} className="flex-1">
              {isLoading ? 'Simulation in Progress...' : 'Run Simulation'}
            </Button>
            {isFinished && (
                <Button onClick={handleReset} variant="outline">
                Reset
                </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
