'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAttackSimulation } from "@/context/attack-simulation-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from "lucide-react";
import Link from "next/link";

export function SecurityEvents() {
    const { events, simulationRun, loading } = useAttackSimulation();

    const getBadgeVariant = (severity: string): "destructive" | "secondary" | "outline" => {
        switch (severity) {
            case 'Critical':
            case 'High':
                return 'destructive';
            case 'Medium':
                return 'secondary';
            case 'Low':
            default:
                return 'outline';
        }
    };

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Security Events</h1>
                <p className="text-muted-foreground">
                    Review and analyze all security events across your cloud infrastructure.
                </p>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>Event Log</CardTitle>
                    <CardDescription>
                        {simulationRun 
                            ? 'A log of the latest security events detected by the system from the simulation.'
                            : 'No simulation is running. Run an attack to see a log of events.'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!simulationRun && (
                        <div className="flex flex-col items-center justify-center text-center gap-4 h-96">
                            <Info className="h-12 w-12 text-muted-foreground"/>
                            <h3 className="text-xl font-semibold">No Event Data</h3>
                            <p className="text-muted-foreground">Go to the <Link href="/powershell-simulator" className="font-medium text-primary underline">Attack Simulator</Link> to start a simulation.</p>
                        </div>
                    )}
                    {simulationRun && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Event ID</TableHead>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && Array.from({ length: 10 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    </TableRow>
                                ))}
                                {!loading && events.map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell className="font-medium">{event.id}</TableCell>
                                        <TableCell>{event.timestamp}</TableCell>
                                        <TableCell>
                                            <Badge variant={getBadgeVariant(event.severity)}>{event.severity}</Badge>
                                        </TableCell>
                                        <TableCell>{event.description}</TableCell>
                                        <TableCell>{event.status}</TableCell>
                                    </TableRow>
                                ))}
                                {!loading && events.length === 0 && (
                                     <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            The simulation ran, but no events were generated. This might indicate a problem.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </main>
    )
}
