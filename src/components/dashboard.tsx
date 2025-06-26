'use client';
import { ArrowUp, CheckCircle, PieChart, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const stats = [
  {
    title: "Number of Events (24h)",
    value: "23,518",
    change: "+12.5%",
    icon: <ArrowUp className="h-4 w-4" />,
    changeColor: "text-green-600",
    borderColor: "border-blue-500",
  },
  {
    title: "Active Threats",
    value: "47",
    change: "+8 new",
    icon: <ArrowUp className="h-4 w-4" />,
    changeColor: "text-red-600",
    borderColor: "border-pink-500",
  },
  {
    title: "Blocked Attacks",
    value: "1,247",
    change: "Auto-blocked",
    icon: <Shield className="h-4 w-4" />,
    changeColor: "text-green-600",
    borderColor: "border-emerald-500",
  },
  {
    title: "Detection Accuracy",
    value: "99.7%",
    change: "Optimal",
    icon: <CheckCircle className="h-4 w-4" />,
    changeColor: "text-green-600",
    borderColor: "border-amber-500",
  },
];

const analysisCards = [
    { title: "Top 10 Process.exe", iconBg: "bg-blue-500" },
    { title: "Top 10 event.exe", iconBg: "bg-emerald-500" },
    { title: "Top 5 BOT connections", iconBg: "bg-violet-500" },
];


export function Dashboard() {
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
                        <p className="text-sm font-semibold">23,518 <span className="font-normal text-xs text-muted-foreground">EVENTS</span></p>
                        <p className="text-sm font-semibold">47 <span className="font-normal text-xs text-muted-foreground">ACTIVE THREATS</span></p>
                        <p className="text-sm font-semibold">1,247 <span className="font-normal text-xs text-muted-foreground">BLOCKED</span></p>
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
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
                                <PieChart className="h-5 w-5 text-white" />
                            </div>
                            <CardTitle className="text-base font-semibold">{card.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="h-48 flex items-center justify-center text-muted-foreground">
                           <p className="text-sm">Chart data unavailable</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </main>
    )
}
