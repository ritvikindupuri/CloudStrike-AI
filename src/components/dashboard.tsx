
'use client';
import * as React from 'react';
import { ArrowUp, CheckCircle, Shield, Info, BarChart3, AlertTriangle, FileText, Check, ShieldAlert, ShieldCheck, ShieldBan, Copy, FlaskConical, Loader2, Terminal, ShieldOff, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAttackSimulation } from '@/context/attack-simulation-context';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, LabelList, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useToast } from '@/hooks/use-toast';
import { analyzeInteraction } from '@/ai/flows/analyze-interaction-flow';
import type { AnalyzeInteractionOutput, InteractionStep } from '@/ai/flows/analyze-interaction-flow';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';

const CHART_COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
];

const SimpleBarChart = ({ data, dataKey, nameKey }: { data: any[], dataKey: string, nameKey: string }) => (
    <ResponsiveContainer width="100%" height="100%">
        <ChartContainer config={{}} className="h-full w-full">
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 40, top: 5, bottom: 5 }}>
                <RechartsTooltip
                    cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
                    content={<ChartTooltipContent hideLabel />}
                />
                <XAxis type="number" dataKey={dataKey} hide />
                <YAxis type="category" dataKey={nameKey} width={160} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <Bar dataKey={dataKey} radius={4} barSize={12}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                     <LabelList 
                        dataKey={dataKey} 
                        position="right" 
                        offset={8} 
                        className="fill-foreground font-medium" 
                        fontSize={10} 
                        formatter={(value: number) => value.toLocaleString()}
                    />
                </Bar>
            </BarChart>
        </ChartContainer>
    </ResponsiveContainer>
);

const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
        case 'Compromised':
            return <ShieldAlert className="h-6 w-6 text-destructive" />;
        case 'Vulnerable':
            return <ShieldOff className="h-6 w-6 text-orange-500" />;
        case 'Investigating':
            return <BrainCircuit className="h-6 w-6 text-blue-500" />;
        case 'Protected':
        default:
            return <ShieldCheck className="h-6 w-6 text-primary" />;
    }
}

const getStatusBadgeVariant = (status: string): "destructive" | "secondary" | "outline" | "default" => {
    switch (status) {
        case 'Compromised':
            return 'destructive';
        case 'Vulnerable':
            return 'secondary';
        case 'Investigating':
            return 'outline';
        case 'Protected':
        default:
            return 'default';
    }
};

export function Dashboard() {
    const { metrics, simulationRun, loading, chartData, analysis, originalScript, cloudResources } = useAttackSimulation();
    const { toast } = useToast();
    const [isTestingDefense, setIsTestingDefense] = React.useState(false);
    const [defenseResult, setDefenseResult] = React.useState<AnalyzeInteractionOutput | null>(null);
    const [displayedLog, setDisplayedLog] = React.useState<InteractionStep[]>([]);
    const [logAnimationComplete, setLogAnimationComplete] = React.useState(false);

    const getRiskBadgeVariant = (score: number): "destructive" | "secondary" | "outline" => {
        if (score > 75) return 'destructive';
        if (score > 40) return 'secondary';
        return 'outline';
    };

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to Clipboard",
            description: `The ${type} has been copied.`,
        });
    };
    
    const handleTestCountermeasure = async () => {
        if (!originalScript || !analysis?.suggestedCountermeasure) {
             toast({
                variant: "destructive",
                title: "Error",
                description: "Missing attack or defense script to test.",
            });
            return;
        }
        setIsTestingDefense(true);
        setDefenseResult(null);
        setDisplayedLog([]);
        setLogAnimationComplete(false);
        try {
            const result = await analyzeInteraction({
                attackScript: originalScript,
                defenseScript: analysis.suggestedCountermeasure
            });
            setDefenseResult(result);
        } catch (error) {
            console.error("Defense analysis failed:", error);
            toast({
                variant: "destructive",
                title: "Analysis Error",
                description: "Failed to test the countermeasure.",
            });
             setIsTestingDefense(false);
        }
    };
    
    React.useEffect(() => {
        if (defenseResult?.interactionLog && defenseResult.interactionLog.length > 0) {
            setIsTestingDefense(false); 

            let i = 0;
            const intervalId = setInterval(() => {
                if (i < defenseResult.interactionLog.length) {
                    setDisplayedLog(prev => [...prev, defenseResult.interactionLog[i]]);
                    i++;
                } else {
                    clearInterval(intervalId);
                    setLogAnimationComplete(true);
                }
            }, 750);

            return () => clearInterval(intervalId);
        }
    }, [defenseResult]);

    const stats = metrics ? [
      {
        title: "Number of Events (24h)",
        value: metrics.totalEvents.toLocaleString(),
        change: "+12.5%",
        icon: <ArrowUp className="h-4 w-4" />,
        changeColor: "text-green-600",
        borderColor: "border-blue-500",
      },
      {
        title: "Active Threats",
        value: metrics.activeThreats.toLocaleString(),
        change: "+8 new",
        icon: <ArrowUp className="h-4 w-4" />,
        changeColor: "text-red-600",
        borderColor: "border-pink-500",
      },
      {
        title: "Blocked Attacks",
        value: metrics.blockedAttacks.toLocaleString(),
        change: "Auto-blocked",
        icon: <Shield className="h-4 w-4" />,
        changeColor: "text-green-600",
        borderColor: "border-emerald-500",
      },
      {
        title: "Detection Accuracy",
        value: metrics.detectionAccuracy,
        change: "Optimal",
        icon: <CheckCircle className="h-4 w-4" /> ,
        changeColor: "text-green-600",
        borderColor: "border-amber-500",
      },
    ] : [];

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
                    <p className="text-muted-foreground">
                        Real-time cloud intrusion detection and analysis
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm">
                        <span className="relative flex h-2.5 w-2.5 mr-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                        </span>
                        System Active
                        <Badge variant="secondary" className="ml-2 bg-emerald-700 border-none text-emerald-100 text-xs">ML Model v3.2</Badge>
                    </Button>
                </div>
            </header>
            
            {!simulationRun && !loading && (
                <Card className="md:col-span-2 lg:col-span-4 border-dashed bg-card shadow-none">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-6 min-h-[400px]">
                        <div className="p-4 bg-primary/10 rounded-full border-8 border-primary/5">
                            <ShieldCheck className="h-16 w-16 text-primary shrink-0"/>
                        </div>
                        <div className="max-w-xl">
                            <h2 className="text-2xl font-bold text-foreground tracking-tight">System Nominal. Awaiting Simulation.</h2>
                            <p className="text-muted-foreground mt-2 mb-6">
                                All CIDS sensors are online and the AI analysis engine is ready. Initiate an attack scenario to populate the dashboard with security events, metrics, and threat analysis.
                            </p>
                            <Button asChild size="lg" className="font-semibold">
                                <Link href="/powershell-simulator">
                                    <Terminal className="mr-2 h-5 w-5" />
                                    Go to Attack Simulator
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {simulationRun && loading && (
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2 mb-2" /><Skeleton className="h-4 w-1/4" /></CardContent></Card>
                    ))}
                    <Card className="md:col-span-2 lg:col-span-4">
                        <CardHeader>
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                </div>
            )}

            {simulationRun && !loading && analysis && (
                <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {metrics && stats.map((stat) => (
                         <Card key={stat.title} className={`border-t-4 ${stat.borderColor} shadow-sm`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stat.value}</div>
                                <p className={`text-xs ${stat.changeColor} flex items-center gap-1 mt-1 font-semibold`}>
                                    {stat.icon}
                                    {stat.change}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                
                <Card className="md:col-span-2 lg:col-span-4">
                    <CardHeader className="flex flex-row justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldAlert className="h-6 w-6 text-destructive" />
                                AI Threat Analysis
                            </CardTitle>
                            <CardDescription>Generated by the CIDS analysis engine.</CardDescription>
                        </div>
                         <div className="text-right">
                            <h3 className="text-sm font-semibold text-muted-foreground mb-1">Risk Score</h3>
                            <Badge variant={getRiskBadgeVariant(analysis.riskScore)} className="text-2xl px-4 py-1">
                                {analysis.riskScore}
                                <span className="text-sm">/100</span>
                            </Badge>
                             <Progress value={analysis.riskScore} className="mt-2 h-2" />
                         </div>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />Executive Summary</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{analysis.executiveSummary}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2"><Check className="h-4 w-4 text-muted-foreground" />Recommended Actions</h4>
                                <ul className="space-y-2">
                                    {analysis.recommendedActions.map((action, i) => (
                                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                            <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                            <span>{action}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                             <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-muted-foreground" />Technical Breakdown</h4>
                                <pre className="text-sm text-muted-foreground leading-relaxed font-mono bg-muted p-3 rounded-md overflow-x-auto whitespace-pre-wrap">{analysis.technicalBreakdown}</pre>
                            </div>
                             <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <ShieldBan className="h-4 w-4 text-muted-foreground" />Suggested Countermeasure
                                     <div className="flex items-center gap-1 ml-auto">
                                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleTestCountermeasure} disabled={isTestingDefense}>
                                            {isTestingDefense ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
                                            <span className="sr-only">Test Countermeasure</span>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(analysis.suggestedCountermeasure, 'countermeasure script')}>
                                            <Copy className="h-4 w-4" />
                                            <span className="sr-only">Copy countermeasure</span>
                                        </Button>
                                     </div>
                                </h4>
                                <pre className="text-sm text-muted-foreground leading-relaxed font-mono bg-muted p-3 rounded-md overflow-x-auto whitespace-pre-wrap">{analysis.suggestedCountermeasure}</pre>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                             <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-muted-foreground"/>
                                Top System Activity
                            </CardTitle>
                             <CardDescription>Suspicious processes and events from the simulation.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-8 pl-2">
                            <div>
                                <h4 className="font-medium text-sm mb-2 text-muted-foreground px-4">Top Suspicious Processes</h4>
                                <div className="h-64">
                                    {chartData?.topProcesses && chartData.topProcesses.length > 0 ? (
                                        <SimpleBarChart data={chartData.topProcesses} dataKey="count" nameKey="name" />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-muted-foreground">
                                            <p className="text-sm">Data unavailable</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                             <div>
                                <h4 className="font-medium text-sm mb-2 text-muted-foreground px-4">Top Generated Events</h4>
                                <div className="h-64">
                                    {chartData?.topEvents && chartData.topEvents.length > 0 ? (
                                        <SimpleBarChart data={chartData.topEvents} dataKey="count" nameKey="name" />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-muted-foreground">
                                            <p className="text-sm">Data unavailable</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-1 flex flex-col">
                         <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-muted-foreground"/>
                                Affected Resources
                            </CardTitle>
                            <CardDescription>Most critical assets impacted by the simulation.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {cloudResources.length > 0 ? (
                                <ul className="space-y-4">
                                    {cloudResources.slice(0, 5).map(resource => (
                                        <li key={resource.resourceId} className="flex items-center gap-4">
                                            <StatusIcon status={resource.status}/>
                                            <div className="flex-1">
                                                <p className="font-semibold leading-tight">{resource.name}</p>
                                                <p className="text-xs text-muted-foreground">{resource.service} &middot; {resource.provider}</p>
                                            </div>
                                             <Badge variant={getStatusBadgeVariant(resource.status)} className="whitespace-nowrap h-fit">
                                                {resource.status}
                                            </Badge>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    <p className="text-sm">No affected resources found.</p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="outline" size="sm" className="w-full">
                                <Link href="/cloud-services">View All {cloudResources.length} Resources</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
                </>
            )}
             <AlertDialog open={isTestingDefense || !!defenseResult} onOpenChange={(open) => {
                if (!open) {
                    setIsTestingDefense(false);
                    setDefenseResult(null);
                    setDisplayedLog([]);
                    setLogAnimationComplete(false);
                }
             }}>
                <AlertDialogContent className="max-w-6xl w-full h-[90vh] flex flex-col">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <FlaskConical className="h-5 w-5" />
                            Countermeasure Engagement Analysis
                        </AlertDialogTitle>
                        {isTestingDefense && (
                            <AlertDialogDescription>
                                The AI is simulating the engagement... please wait.
                            </AlertDialogDescription>
                        )}
                        {!isTestingDefense && defenseResult && (
                            <AlertDialogDescription>
                                The AI has analyzed the effectiveness of the defense script against the attack.
                            </AlertDialogDescription>
                        )}
                    </AlertDialogHeader>
                    
                    {isTestingDefense && (
                         <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                                <p className="font-semibold mt-4">Simulating Engagement</p>
                                <p className="text-sm text-muted-foreground">Analyzing attack vectors and defense posture...</p>
                            </div>
                         </div>
                    )}
                    
                    {!isTestingDefense && defenseResult && (
                        <div className="flex-1 grid md:grid-cols-2 gap-4 overflow-hidden">
                            {/* Left Side: Scripts and New Countermeasure */}
                            <div className="space-y-4 flex flex-col overflow-hidden">
                                <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1">Attack Script</h4>
                                        <pre className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded-md overflow-auto h-32 whitespace-pre-wrap">{originalScript}</pre>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1">Original Defense</h4>
                                        <pre className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded-md overflow-auto h-32 whitespace-pre-wrap">{analysis?.suggestedCountermeasure}</pre>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm flex-shrink-0">
                                        Improved Countermeasure
                                        {logAnimationComplete && (
                                            <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => handleCopy(defenseResult.modifiedDefenseScript, 'improved countermeasure script')}>
                                                <Copy className="h-4 w-4" />
                                                <span className="sr-only">Copy improved countermeasure</span>
                                            </Button>
                                        )}
                                    </h4>
                                    {logAnimationComplete ? (
                                        <pre className="text-sm text-muted-foreground font-mono bg-muted p-3 rounded-md overflow-auto flex-1 whitespace-pre-wrap">{defenseResult.modifiedDefenseScript}</pre>
                                    ) : (
                                        <div className="flex-1 bg-muted rounded-md flex items-center justify-center">
                                            <p className="text-sm text-muted-foreground p-4 text-center">Generating improved script based on engagement outcome...</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Side: Results and Live Log */}
                            <div className="space-y-4 flex flex-col overflow-hidden">
                                <div className="p-4 bg-muted/50 rounded-lg min-h-[148px] flex flex-col justify-center">
                                    {logAnimationComplete ? (
                                        <>
                                            <h4 className="font-semibold text-sm">Outcome Summary</h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed mt-1">{defenseResult.outcomeSummary}</p>
                                            <h4 className="font-semibold mb-1 text-sm mt-3">Effectiveness Score</h4>
                                            <Progress value={defenseResult.effectivenessScore} className="w-full h-3" />
                                            <p className="text-right font-bold text-base mt-1">{defenseResult.effectivenessScore}/100</p>
                                        </>
                                    ) : (
                                        <div className="text-center text-muted-foreground">
                                            <p className="text-sm">Waiting for live simulation to complete...</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                                    <h4 className="font-semibold text-sm flex-shrink-0 mb-2">Live Interaction Log</h4>
                                    <div className="p-3 bg-gray-900 text-white rounded-md font-mono text-xs overflow-y-auto flex-1">
                                        {displayedLog.map((log) => (
                                            <div key={log.step} className="mb-2 last:mb-0 flex items-start whitespace-pre-wrap">
                                                <span className="text-gray-500 mr-3">{log.step.toString().padStart(2, '0')}</span>
                                                <span className={`mr-3 font-bold ${log.action === 'Attack' ? 'text-red-400' : log.action === 'Defense' ? 'text-green-400' : 'text-blue-400'}`}>
                                                    [{log.action.toUpperCase()}]
                                                </span>
                                                <p className="flex-1">
                                                    <span>{log.description} </span>
                                                    <span className="text-yellow-400">{'->'} {log.result}</span>
                                                </p>
                                            </div>
                                        ))}
                                         {!logAnimationComplete && defenseResult && (
                                            <div className="flex items-center text-gray-400">
                                                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                                <span>Analyzing...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <AlertDialogFooter className="pt-4 flex-shrink-0">
                        <AlertDialogAction>Close</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    )

    

    
