'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAttackSimulation } from "@/context/attack-simulation-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, Loader2, Wand2, ClipboardCheck, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { SecurityEvent } from '@/ai/flows/simulate-attack-flow';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { generateResponsePlan, type GenerateResponsePlanOutput } from '@/ai/flows/generate-response-plan-flow';
import { useToast } from '@/hooks/use-toast';

export function SecurityEvents() {
    const { events, simulationRun, loading, updateEventStatus } = useAttackSimulation();
    const { toast } = useToast();

    const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
    const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
    const [isResponding, setIsResponding] = useState(false);
    const [responsePlan, setResponsePlan] = useState<GenerateResponsePlanOutput | null>(null);

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
    
    const handleTakeAction = (event: SecurityEvent) => {
        setSelectedEvent(event);
        setIsActionDialogOpen(true);
        setResponsePlan(null); // Clear previous plan
        setIsResponding(true);
    };

    const handleUpdateStatus = (newStatus: 'Contained' | 'Resolved') => {
        if (selectedEvent) {
            updateEventStatus(selectedEvent.id, newStatus);
            toast({
                title: 'Event Status Updated',
                description: `Event ${selectedEvent.id} has been marked as ${newStatus}.`,
            });
            setIsActionDialogOpen(false);
        }
    };
    
    React.useEffect(() => {
        if (isActionDialogOpen && selectedEvent && !responsePlan) {
            generateResponsePlan(selectedEvent)
                .then(plan => {
                    setResponsePlan(plan);
                })
                .catch(err => {
                    console.error("Failed to generate response plan:", err);
                    toast({
                        variant: 'destructive',
                        title: 'AI Error',
                        description: 'Could not generate a response plan for this event.',
                    });
                })
                .finally(() => {
                    setIsResponding(false);
                });
        }
    }, [isActionDialogOpen, selectedEvent, responsePlan, toast]);

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
                                    <TableHead className="text-right">Actions</TableHead>
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
                                        <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
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
                                        <TableCell className="text-right">
                                            {(event.status === 'Investigating' || event.status === 'Action Required') && (
                                                <Button variant="outline" size="sm" onClick={() => handleTakeAction(event)}>
                                                    Respond
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!loading && events.length === 0 && (
                                     <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            The simulation ran, but no events were generated. This might indicate a problem.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

             <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                             <Wand2 className="h-6 w-6 text-primary" />
                             Incident Response Plan
                        </DialogTitle>
                         <DialogDescription>
                            AI-generated response plan for event: <span className="font-mono font-medium text-foreground">{selectedEvent?.id}</span>
                         </DialogDescription>
                    </DialogHeader>

                    {isResponding ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-16">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="font-semibold">Generating Response Plan...</p>
                            <p className="text-sm text-muted-foreground">The AI is analyzing the event and creating a playbook.</p>
                        </div>
                    ) : responsePlan ? (
                        <div className="grid gap-6 py-4">
                             <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Suggested Steps</CardTitle>
                                    <CardDescription>{responsePlan.justification}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {responsePlan.suggestedSteps.map((step, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <ChevronRight className="h-4 w-4 text-primary mt-1 shrink-0" />
                                                <span className="text-sm text-muted-foreground">{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                             </Card>
                        </div>
                    ) : (
                         <div className="flex flex-col items-center justify-center gap-4 py-16">
                            <p className="text-muted-foreground">Could not generate a response plan.</p>
                         </div>
                    )}

                    <DialogFooter>
                        {!isResponding && responsePlan && (
                             <>
                                <Button variant="outline" onClick={() => handleUpdateStatus('Contained')}>Mark as Contained</Button>
                                <Button onClick={() => handleUpdateStatus('Resolved')}>Mark as Resolved</Button>
                             </>
                        )}
                         <Button variant="secondary" onClick={() => setIsActionDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </main>
    )
}
