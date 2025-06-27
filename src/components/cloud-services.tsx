
'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, ShieldAlert, ShieldCheck, ShieldOff, BrainCircuit, Info } from "lucide-react";
import { useThreatAnalysis } from "@/context/attack-simulation-context";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const ProviderLogo = ({ provider }: { provider: string }) => {
    return <div className="text-xs font-bold text-muted-foreground">{provider}</div>
}

const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
        case 'Compromised':
            return <ShieldAlert className="h-5 w-5 text-destructive" />;
        case 'Vulnerable':
            return <ShieldOff className="h-5 w-5 text-orange-500" />;
        case 'Investigating':
            return <BrainCircuit className="h-5 w-5 text-blue-500" />;
        case 'Protected':
        default:
            return <ShieldCheck className="h-5 w-5 text-primary" />;
    }
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Compromised':
            return 'text-destructive';
        case 'Vulnerable':
            return 'text-orange-500';
        case 'Investigating':
            return 'text-blue-500';
        case 'Protected':
        default:
            return 'text-primary';
    }
}


export function CloudServices() {
    const { loading, analysisRun, cloudResources } = useThreatAnalysis();

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Cloud Services</h1>
                <p className="text-muted-foreground">
                    View the status of cloud assets affected by the scenario analysis.
                </p>
            </header>

            {!analysisRun && !loading && (
                <div className="flex flex-col items-center justify-center text-center gap-4 h-96">
                    <Info className="h-12 w-12 text-muted-foreground"/>
                    <h3 className="text-xl font-semibold">No Scenario Data</h3>
                    <p className="text-muted-foreground">Affected cloud resources will be shown here after running an analysis.</p>
                     <p className="text-muted-foreground">Go to the <Link href="/powershell-simulator" className="font-medium text-primary underline">Threat Sandbox</Link> to start.</p>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {loading && Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <Skeleton className="h-5 w-3/5" />
                            <Skeleton className="h-5 w-1/5" />
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-5 w-1/3" />
                                <Skeleton className="h-4 w-1/4" />
                            </div>
                            <Skeleton className="h-10 w-full" />
                            <div>
                                <Skeleton className="h-6 w-1/2 mb-2" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {!loading && analysisRun && cloudResources.map((resource, index) => (
                    <Card key={index} className="flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                               <Server className="h-5 w-5 text-muted-foreground" />
                               {resource.name}
                            </CardTitle>
                             <ProviderLogo provider={resource.provider} />
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <Badge variant="outline">{resource.service}</Badge>
                                <span>{resource.region}</span>
                            </div>
                             <p className="font-mono text-xs bg-muted p-2 rounded-md break-all">{resource.resourceId}</p>
                            <div>
                                <div className="flex items-center gap-2">
                                    <StatusIcon status={resource.status} />
                                    <p className={`text-lg font-bold ${getStatusColor(resource.status)}`}>{resource.status}</p>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{resource.reasonForStatus}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </main>
    )
}
