'use client';
import { ArrowUp, CheckCircle, PieChart, Shield, Info, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <Tooltip
                    cursor={{ fill: 'hsl(var(--accent))' }}
                    content={<ChartTooltipContent hideLabel />}
                />
                <XAxis type="number" dataKey={dataKey} hide />
                <YAxis type="category" dataKey={nameKey} width={80} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <Bar dataKey={dataKey} fill="hsl(var(--primary))" radius={4} barSize={12} />
            </BarChart>
        </ChartContainer>
    </ResponsiveContainer>
);

export function Dashboard() {
    const { metrics, simulationRun, loading, chartData } = useAttackSimulation();

    const stats = metrics ? [
      {
        title: "Number of Events (24h)",
        value: metrics.totalEvents,
        change: "+12.5%",
        icon: <ArrowUp className="h-4 w-4" />,
        changeColor: "text-green-600",
        borderColor: "border-blue-500",
      },
      {
        title: "Active Threats",
        value: metrics.activeThreats,
        change: "+8 new",
        icon: <ArrowUp className="h-4 w-4" />,
        changeColor: "text-red-600",
        borderColor: "border-pink-500",
      },
      {
        title: "Blocked Attacks",
        value: metrics.blockedAttacks,
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
                                <p className="text-sm font-semibold">{metrics.totalEvents} <span className="font-normal text-xs text-muted-foreground">EVENTS</span></p>
                                <p className="text-sm font-semibold">{metrics.activeThreats} <span className="font-normal text-xs text-muted-foreground">ACTIVE THREATS</span></p>
                                <p className="text-sm font-semibold">{metrics.blockedAttacks} <span className="font-normal text-xs text-muted-foreground">BLOCKED</span></p>
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

            {!simulationRun && (
                 <Card className="md:col-span-2 lg:col-span-4 bg-blue-50 border-blue-200">
                    <CardContent className="p-6 flex items-center gap-4">
                        <Info className="h-8 w-8 text-blue-600"/>
                        <div>
                           <h3 className="font-semibold text-blue-800">Welcome to the CIDS Dashboard</h3>
                           <p className="text-sm text-blue-700">No simulation is running. Please go to the <Link href="/powershell-simulator" className="font-medium underline">Attack Simulator</Link> to start an attack and populate the dashboard with data.</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {simulationRun && loading && Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="border-t-4 border-gray-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                           <Skeleton className="h-4 w-32" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-24 mb-2" />
                            <Skeleton className="h-4 w-20" />
                        </CardContent>
                    </Card>
                ))}
                {!loading && metrics && stats.map((stat) => (
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
                           {simulationRun && loading && <Skeleton className="h-full w-full" />}
                           {simulationRun && !loading && card.data && card.data.length > 0 && (
                               <SimpleBarChart data={card.data} dataKey={card.dataKey} nameKey={card.nameKey} />
                           )}
                           {(!simulationRun || (!loading && (!card.data || card.data.length === 0))) && (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    <p className="text-sm">Data unavailable</p>
                                </div>
                           )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </main>
    )
}
