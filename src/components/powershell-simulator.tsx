'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAttackSimulation } from '@/context/attack-simulation-context';
import { Loader2 } from 'lucide-react';

const attacks = [
    {
        value: "dns-flood",
        name: "DNS Flood (DDoS)",
        description: "A type of Distributed Denial of Service (DDoS) attack where the attacker floods a particular domain's DNS servers in an attempt to disrupt DNS resolution for that domain."
    },
    {
        value: "http-flood",
        name: "HTTP Flood (DDoS)",
        description: "A type of DDoS attack where the attacker exploits legitimate-seeming HTTP GET or POST requests to attack a web server or application. It requires less bandwidth than other attacks to bring down the targeted site or server."
    },
    {
        value: "credential-stuffing",
        name: "Credential Stuffing",
        description: "A cyberattack in which stolen account credentials, typically consisting of lists of usernames and/or email addresses and the corresponding passwords, are used to gain unauthorized access to user accounts through large-scale automated login requests."
    },
];


export function PowerShellSimulator() {
    const { runAttack, loading } = useAttackSimulation();
    const [selectedAttack, setSelectedAttack] = useState(attacks[0]);

    const handleRunSimulation = () => {
        if (selectedAttack) {
            runAttack(selectedAttack.name, selectedAttack.description);
        }
    };
    
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Attack Simulator</h1>
                <p className="text-muted-foreground">
                    Select and run a simulated cyber attack to test the detection system.
                </p>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>Select an Attack Scenario</CardTitle>
                    <CardDescription>Choose a scenario. The AI will generate realistic security events and metrics based on your selection.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue={attacks[0].value} className="w-full" onValueChange={(v) => setSelectedAttack(attacks.find(a => a.value === v)!)}>
                        <TabsList className="grid w-full grid-cols-3">
                            {attacks.map(attack => (
                                <TabsTrigger key={attack.value} value={attack.value}>{attack.name}</TabsTrigger>
                            ))}
                        </TabsList>
                        {attacks.map(attack => (
                            <TabsContent key={attack.value} value={attack.value}>
                               <Card className="mt-4">
                                   <CardHeader>
                                       <CardTitle>{attack.name}</CardTitle>
                                   </CardHeader>
                                   <CardContent>
                                       <p className="text-sm text-muted-foreground">{attack.description}</p>
                                   </CardContent>
                               </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                     <div className="flex w-full items-center justify-end mt-6">
                        <Button 
                            onClick={handleRunSimulation} 
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Simulating...' : `Run ${selectedAttack.name} Simulation`}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
