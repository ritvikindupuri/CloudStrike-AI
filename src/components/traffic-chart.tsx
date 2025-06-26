'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { BarChart } from 'lucide-react';

interface TrafficChartProps {
  data: any[];
}

const chartConfig = {
  traffic: {
    label: "Traffic (PPS)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function generateNormalData() {
  return Array.from({ length: 30 }, (_, i) => ({
    time: `${i}s`,
    traffic: Math.floor(Math.random() * (200 - 100 + 1) + 100),
  }));
}

export function generateAttackData(intensity: number) {
    const data = [];
    const highPoint = 1500 + (intensity * 15); // Scale attack traffic with intensity
    const lowPoint = 1000 + (intensity * 10);
    for (let i = 0; i < 30; i++) {
        let traffic;
        if (i < 5) {
            traffic = Math.floor(Math.random() * (200 - 100 + 1) + 100);
        } else if (i < 25) {
            traffic = Math.floor(Math.random() * (highPoint - lowPoint + 1) + lowPoint);
        } else {
            traffic = Math.floor(Math.random() * (200 - 100 + 1) + 100);
        }
        data.push({ time: `${i}s`, traffic });
    }
    return data;
}

export function TrafficChart({ data }: TrafficChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <BarChart className="text-primary"/>
            Real-Time Network Traffic
        </CardTitle>
        <CardDescription>Visualization of network packets per second (simulated).</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
                <LineChart
                    accessibilityLayer
                    data={data}
                    margin={{
                        left: 12,
                        right: 12,
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="time"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        domain={['auto', 'auto']}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Line
                        dataKey="traffic"
                        type="monotone"
                        stroke="var(--color-traffic)"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
