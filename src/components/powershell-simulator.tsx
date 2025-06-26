'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAttackSimulation } from '@/context/attack-simulation-context';
import { Loader2, Terminal, Bot, BrainCircuit, FileWarning, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { generateAttackScript } from '@/ai/flows/generate-attack-script-flow';
import { analyzeScript, AnalyzeScriptOutput } from '@/ai/flows/analyze-script-flow';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const samplePrompts = [
    "Simulate data exfiltration from an S3 bucket",
    "Generate a script that escalates IAM privileges",
    "Create a ransomware simulation for Azure Blob Storage",
    "Simulate a Lambda function being compromised to scan the internal network",
    "Generate a credential dumping attack via instance metadata service"
];

export function PowerShellSimulator() {
    const { runAttack, loading: isSimulating } = useAttackSimulation();
    const [generationPrompt, setGenerationPrompt] = useState("");
    const [scriptContent, setScriptContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalyzeScriptOutput | null>(null);

    const { toast } = useToast();

    const handleRunSimulation = () => {
        if (!scriptContent.trim()) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Script content cannot be empty. Please generate or write a script first.',
            });
            return;
        }
        runAttack(scriptContent);
    };

    const handleGenerateScript = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!generationPrompt.trim()) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Generation prompt cannot be empty.',
            });
            return;
        }
        setIsGenerating(true);
        setAnalysisResult(null);
        setScriptContent(`# Generating script for: "${generationPrompt}"...`);
        try {
            const result = await generateAttackScript({ description: generationPrompt });
            setScriptContent(result.script.trim());
        } catch (error) {
            console.error("Script generation failed:", error);
            toast({
                variant: "destructive",
                title: "Generation Error",
                description: "Failed to generate the script. Please try a different prompt.",
            });
            setScriptContent(`# Error generating script. Please try again.`);
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleAnalyzeScript = async () => {
        if (!scriptContent.trim()) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Script content cannot be empty.',
            });
            return;
        }

        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            const result = await analyzeScript({ script: scriptContent });
            setAnalysisResult(result);
        } catch (error) {
            console.error("Script analysis failed:", error);
            toast({
                variant: "destructive",
                title: "Analysis Error",
                description: "Failed to analyze the script. Please try again.",
            });
        } finally {
            setIsAnalyzing(false);
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
                <h1 className="text-3xl font-bold tracking-tight">Attack Simulator</h1>
                <p className="text-muted-foreground">
                    Generate, analyze, and simulate cloud-native attack scripts to test your defenses.
                </p>
            </header>
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="font-mono rounded-lg border bg-gray-900 text-white shadow-lg flex flex-col min-w-0">
                    {/* Terminal Header */}
                    <div className="px-4 py-2 border-b border-gray-700 flex items-center flex-shrink-0">
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <p className="ml-4 text-sm text-gray-300">CIDS Attack Editor - /bin/bash</p>
                    </div>
                    
                    {/* Terminal Body */}
                    <div className="p-4 flex flex-col flex-grow">
                        <label htmlFor="script-editor" className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                            Script Editor (You can paste your own script directly here)
                        </label>
                        <Textarea 
                            id="script-editor"
                            placeholder={`# Paste your own script here, or use the AI generator below.\n# Example: Get-S3Object -BucketName "public-bucket" -Key "documents/secret.txt"`}
                            className="flex-grow w-full bg-transparent border-0 rounded-none text-green-400 font-mono text-sm resize-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                            value={scriptContent}
                            onChange={(e) => setScriptContent(e.target.value)}
                        />

                        {/* Controls at the bottom */}
                        <div className="mt-4 border-t border-gray-700 pt-4 space-y-4">
                             <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                <label className="text-sm font-medium text-gray-300 block mb-2">1. Generate Script with AI (Optional)</label>
                                <form onSubmit={handleGenerateScript} className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Bot className="h-5 w-5 text-blue-400 flex-shrink-0"/>
                                        <Input 
                                            placeholder='Describe a cloud attack...'
                                            className="flex-1 bg-gray-800 border-gray-600 rounded-md h-9 text-white focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
                                            value={generationPrompt}
                                            onChange={(e) => setGenerationPrompt(e.target.value)}
                                            disabled={isGenerating}
                                        />
                                        <Button type="submit" variant="secondary" size="sm" disabled={isGenerating || isSimulating || !generationPrompt}>
                                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate'}
                                        </Button>
                                    </div>
                                     <div className="flex flex-wrap gap-2">
                                        {samplePrompts.slice(0, 3).map((prompt) => (
                                            <button
                                                key={prompt}
                                                type="button"
                                                className="text-xs text-gray-300 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                                                onClick={() => setGenerationPrompt(prompt)}
                                                disabled={isGenerating || isSimulating}
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                </form>
                             </div>

                             <div className="flex flex-wrap gap-4">
                                <Button 
                                    onClick={handleAnalyzeScript} 
                                    disabled={isAnalyzing || isGenerating || isSimulating || !scriptContent}
                                    variant="outline"
                                    className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white flex-1"
                                >
                                    {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                                    {isAnalyzing ? 'Analyzing...' : '2. Analyze Script'}
                                </Button>
                                <Button 
                                    onClick={handleRunSimulation} 
                                    disabled={isSimulating || isGenerating || !scriptContent}
                                    className="bg-primary hover:bg-primary/90 flex-1"
                                >
                                    {isSimulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Terminal className="mr-2 h-4 w-4" />}
                                    {isSimulating ? 'Simulating...' : '3. Run Full Simulation'}
                                </Button>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center">
                    {isAnalyzing && (
                         <Card className="w-full h-full flex flex-col items-center justify-center">
                             <CardContent className="text-center p-6">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                                <p className="font-semibold">Analyzing Script...</p>
                                <p className="text-sm text-muted-foreground">The AI model is reviewing the code.</p>
                             </CardContent>
                         </Card>
                    )}
                    {!isAnalyzing && analysisResult && (
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    {analysisResult.isMalicious ? <FileWarning className="h-8 w-8 text-destructive" /> : <ShieldCheck className="h-8 w-8 text-primary" />}
                                    <span>Quick Analysis Result</span>
                                </CardTitle>
                                <CardDescription>
                                    {analysisResult.isMalicious ? 'This script has been identified as potentially malicious.' : 'This script appears to be safe.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div>
                                    <h4 className="font-semibold mb-1">Summary</h4>
                                    <p className="text-sm text-muted-foreground">{analysisResult.summary}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Recommendations</h4>
                                    <p className="text-sm text-muted-foreground">{analysisResult.recommendations}</p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center bg-muted/50 p-3 rounded-b-lg">
                                <div className="flex items-center gap-2">
                                     <AlertTriangle className="h-5 w-5" />
                                     <span className="text-sm font-semibold">Risk Score</span>
                                </div>
                               <Badge variant={getRiskBadgeVariant(analysisResult.riskScore)} className="text-lg px-3 py-1">
                                    {analysisResult.riskScore} / 100
                                </Badge>
                            </CardFooter>
                        </Card>
                    )}
                     {!isAnalyzing && !analysisResult && (
                        <Card className="w-full h-full flex flex-col items-center justify-center border-dashed">
                            <CardContent className="text-center p-6">
                                <BrainCircuit className="h-10 w-10 text-muted-foreground mb-4" />
                                <p className="font-semibold">Awaiting Analysis</p>
                                <p className="text-sm text-muted-foreground">Click "Analyze Script" to get a quick risk assessment.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </main>
    )
}
