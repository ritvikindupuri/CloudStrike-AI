'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PowerShellSimulator() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">PowerShell Simulator</h1>
                <p className="text-muted-foreground">
                    Simulate PowerShell commands in a safe environment.
                </p>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>Simulator</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-72 w-full rounded-md border p-4 bg-black font-mono text-sm text-white">
                       <p><span className="text-green-400">PS C:\&gt;</span> Welcome to the PowerShell Simulator.</p>
                       <p><span className="text-green-400">PS C:\&gt;</span> Enter a command below to begin.</p>
                    </ScrollArea>
                     <div className="flex w-full items-center space-x-2 mt-4">
                        <Input type="text" placeholder="Enter a command... e.g., Get-Process" className="bg-background font-mono"/>
                        <Button type="submit">Execute</Button>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
