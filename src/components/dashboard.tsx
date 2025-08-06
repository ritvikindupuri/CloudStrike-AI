'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileWarning, ShieldCheck, ListTodo, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSimulation } from '@/context/simulation-context';

export function Dashboard() {
    const { data } = useSimulation();

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold">No Data to Display</h2>
                <p className="text-muted-foreground mt-2">Run a scenario in the Threat Sandbox to generate dashboard data.</p>
            </div>
        );
    }
    const { metrics, topEvents, topProcesses, analysis } = data;

    const formattedTopEvents = topEvents.map(item => ({ ...item, name: item.name.replace('.exe', '') }));
    const formattedTopProcesses = topProcesses.map(item => ({ ...item, name: item.name.replace('.exe', '') }));


    return (
        <main className="flex-1 p-4 md:p-6">
             <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Scenario Dashboard</h1>
                <p className="text-muted-foreground">
                    An overview of the security posture based on the last simulated attack.
                </p>
            </header>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                        <FileWarning className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalEvents.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Generated in this scenario</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.activeThreats}</div>
                         <p className="text-xs text-muted-foreground">Currently being tracked</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Blocked Attacks</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.blockedAttacks.toLocaleString()}</div>
                         <p className="text-xs text-muted-foreground">Mitigated by automated defenses</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Detection Accuracy</CardTitle>
                         <ListTodo className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.detectionAccuracy}</div>
                        <p className="text-xs text-muted-foreground">Confidence in detection models</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-1 lg:col-span-4">
                     <CardHeader>
                        <CardTitle>Top Security Events</CardTitle>
                        <CardDescription>Most frequent security events generated during the simulation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={formattedTopEvents} layout="vertical" margin={{ left: 20, right: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.3)' }} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}}/>
                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="col-span-1 lg:col-span-3">
                     <CardHeader>
                        <CardTitle>Top Running Processes</CardTitle>
                        <CardDescription>System processes with the highest activity during the simulation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={formattedTopProcesses} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12}/>
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.3)' }} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}}/>
                                <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card className="col-span-1 lg:col-span-7">
                    <CardHeader>
                        <CardTitle>Threat Analysis</CardTitle>
                         <CardDescription>AI-generated analysis of the simulated attack.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                               <span className="text-sm font-medium">Overall Risk Score</span>
                               <span className="text-sm font-bold text-primary">{analysis.riskScore} / 100</span>
                            </div>
                            <Progress value={analysis.riskScore} aria-label={`${analysis.riskScore}% risk score`} />
                        </div>
                        <div className="prose prose-sm prose-invert max-w-none text-muted-foreground">
                            <h4 className="font-semibold text-foreground">Executive Summary</h4>
                            <p>{analysis.executiveSummary}</p>
                             <h4 className="font-semibold text-foreground mt-4">Technical Breakdown</h4>
                            <p>{analysis.technicalBreakdown}</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <div className="w-full">
                            <h4 className="font-semibold text-foreground mb-2">Recommended Actions</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                {analysis.recommendedActions.map((action, index) => (
                                    <li key={index}>{action}</li>
                                ))}
                            </ul>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </main>
    );
}
