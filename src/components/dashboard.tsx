'use client';
import { ArrowUp, CheckCircle, PieChart, Shield, Info, BarChart3, AlertTriangle, FileText, Check, ShieldAlert, ShieldCheck, ShieldBan } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAttackSimulation, ChartData } from '@/context/attack-simulation-context';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';


const SimpleBarChart = ({ data, dataKey, nameKey }: { data: any[], dataKey: string, nameKey: string }) => (
    <ResponsiveContainer width="100%" height="100%">
        <ChartContainer config={{}} className="h-full w-full">
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                <Tooltip
                    cursor={{ fill: 'hsl(var(--accent))' }}
                    content={<ChartTooltipContent hideLabel />}
                />
                <XAxis type="number" dataKey={dataKey} hide />
                <YAxis type="category" dataKey={nameKey} width={130} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <Bar dataKey={dataKey} fill="hsl(var(--primary))" radius={4} barSize={12} />
            </BarChart>
        </ChartContainer>
    </ResponsiveContainer>
);

export function Dashboard() {
    const { metrics, simulationRun, loading, chartData, analysis } = useAttackSimulation();

    const getRiskBadgeVariant = (score: number): "destructive" | "secondary" | "outline" => {
        if (score > 75) return 'destructive';
        if (score > 40) return 'secondary';
        return 'outline';
    };

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

    const analysisCards = [
        { title: "Top 10 Process.exe", iconBg: "bg-blue-500", data: chartData?.topProcesses, nameKey: "name", dataKey: "count" },
        { title: "Top 10 event.exe", iconBg: "bg-emerald-500", data: chartData?.topEvents, nameKey: "name", dataKey: "count" },
        { title: "Top 5 BOT connections", iconBg: "bg-violet-500", data: chartData?.botConnections, nameKey: "name", dataKey: "count" },
    ];


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
                     <div className="hidden md:block text-right">
                        {loading && (
                            <>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-4 w-28 mb-2" />
                                <Skeleton className="h-4 w-20" />
                            </>
                        )}
                        {simulationRun && metrics && !loading && (
                            <>
                                <p className="text-sm font-semibold">{metrics.totalEvents.toLocaleString()} <span className="font-normal text-xs text-muted-foreground">EVENTS</span></p>
                                <p className="text-sm font-semibold">{metrics.activeThreats.toLocaleString()} <span className="font-normal text-xs text-muted-foreground">ACTIVE THREATS</span></p>
                                <p className="text-sm font-semibold">{metrics.blockedAttacks.toLocaleString()} <span className="font-normal text-xs text-muted-foreground">BLOCKED</span></p>
                            </>
                        )}
                    </div>
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
                <Card className="md:col-span-2 lg:col-span-4 bg-blue-50 border-blue-200 shadow-none">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
                        <Info className="h-12 w-12 text-blue-600 shrink-0"/>
                        <div>
                             <h2 className="text-xl font-semibold text-blue-800">Welcome to the CIDS Demo</h2>
                            <p className="text-blue-700 mt-1">This is an interactive Cloud Intrusion Detection System powered by AI.
                            <br /> Go to the <Link href="/powershell-simulator" className="font-medium underline">Attack Simulator</Link> to run a scenario and see the dashboard populate with live data.</p>
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
                                <p className="text-sm text-muted-foreground leading-relaxed font-mono bg-muted p-3 rounded-md">{analysis.technicalBreakdown}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2"><ShieldBan className="h-4 w-4 text-muted-foreground" />Suggested Countermeasure</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed font-mono bg-muted p-3 rounded-md">{analysis.suggestedCountermeasure}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {analysisCards.map((card) => (
                         <Card key={card.title} className="shadow-sm">
                            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                                <div className={`rounded-lg p-2 ${card.iconBg}`}>
                                    <BarChart3 className="h-5 w-5 text-white" />
                                </div>
                                <CardTitle className="text-base font-semibold">{card.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="h-48">
                               {card.data && card.data.length > 0 ? (
                                   <SimpleBarChart data={card.data} dataKey={card.dataKey} nameKey={card.nameKey} />
                               ) : (
                                    <div className="h-full flex items-center justify-center text-muted-foreground">
                                        <p className="text-sm">Data unavailable</p>
                                    </div>
                               )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
                </>
            )}
        </main>
    )
}
