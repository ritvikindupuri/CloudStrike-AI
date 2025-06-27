'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAttackSimulation } from "@/context/attack-simulation-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, Loader2, Wand2, ChevronRight, Search } from "lucide-react";
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function SecurityEvents() {
    const { events, simulationRun, loading, updateEventStatus } = useAttackSimulation();
    const { toast } = useToast();

    const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
    const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
    const [isResponding, setIsResponding] = useState(false);
    const [responsePlan, setResponsePlan] = useState<GenerateResponsePlanOutput | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

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

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const matchesSearch = searchTerm === '' || 
                event.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter;
            const matchesStatus = statusFilter === 'all' || event.status === statusFilter;

            return matchesSearch && matchesSeverity && matchesStatus;
        });
    }, [events, searchTerm, severityFilter, statusFilter]);

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Security Events</h1>
                <p className="text-muted-foreground">
                    Search, filter, and analyze all security events across your cloud infrastructure.
                </p>
            </header>
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                            <CardTitle>Event Log</CardTitle>
                            <CardDescription>
                                {simulationRun 
                                    ? 'A log of the latest security events detected by the system from the simulation.'
                                    : 'No simulation is running. Run an attack to see a log of events.'
                                }
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search events..." 
                                    className="pl-9 w-48"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={severityFilter} onValueChange={setSeverityFilter}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Severity" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Severities</SelectItem>
                                    <SelectItem value="Critical">Critical</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="Investigating">Investigating</SelectItem>
                                    <SelectItem value="Action Required">Action Required</SelectItem>
                                    <SelectItem value="Contained">Contained</SelectItem>
                                    <SelectItem value="Resolved">Resolved</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {!simulationRun && !loading && (
                        <div className="flex flex-col items-center justify-center text-center gap-4 h-96">
                            <Info className="h-12 w-12 text-muted-foreground"/>
                            <h3 className="text-xl font-semibold">No Event Data</h3>
                            <p className="text-muted-foreground">Go to the <Link href="/powershell-simulator" className="font-medium text-primary underline">Attack Simulator</Link> to start a simulation.</p>
                        </div>
                    )}
                    {(simulationRun || loading) && (
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
                                        <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                                    </TableRow>
                                ))}
                                {!loading && filteredEvents.map((event) => (
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
                                {!loading && events.length > 0 && filteredEvents.length === 0 && (
                                     <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No events match your current filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && events.length === 0 && simulationRun && (
                                     <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            The simulation ran, but no events were generated.
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
