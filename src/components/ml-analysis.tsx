'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function MLAnalysis() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">ML Analysis</h1>
                <p className="text-muted-foreground">
                    Leverage machine learning to analyze suspicious scripts and commands.
                </p>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>Analyze Script</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid w-full gap-2">
                        <Textarea placeholder="Paste your PowerShell or shell script here." className="h-48 font-mono" />
                        <Button>Analyze with ML Model</Button>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
