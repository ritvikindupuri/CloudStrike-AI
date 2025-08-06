'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Clipboard, FileCheck2, Loader2, Send, ShieldCheck, FlaskConical, AlertTriangle, Lightbulb } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useSimulation } from '@/context/simulation-context';
import { generateAttackScript, type GenerateAttackScriptOutput } from '@/ai/flows/generate-attack-script-flow';
import { analyzeScript, type AnalyzeScriptOutput } from '@/ai/flows/analyze-script-flow';
import { analyzeInteraction, type AnalyzeInteractionOutput, type InteractionStep } from '@/ai/flows/analyze-interaction-flow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

export function ThreatSandbox() {
    const { toast } = useToast();
    const { data, setData, setIsLoading: setSimulationLoading } = useSimulation();

    const [description, setDescription] = useState('');
    const [script, setScript] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const [analysisResult, setAnalysisResult] = useState<AnalyzeScriptOutput | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const [interactionResult, setInteractionResult] = useState<AnalyzeInteractionOutput | null>(null);
    const [isTesting, setIsTesting] = useState(false);

    const handleGenerateScript = async () => {
        if (!description) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please provide an attack description.' });
            return;
        }
        setIsLoading(true);
        setScript('');
        try {
            const result: GenerateAttackScriptOutput = await generateAttackScript({ description });
            setScript(result.script);
        } catch (error) {
            console.error("Failed to generate script:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not generate script. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyzeScript = async () => {
        if (!script) {
            toast({ variant: 'destructive', title: 'Error', description: 'There is no script to analyze.' });
            return;
        }
        setIsAnalyzing(true);
        setAnalysisResult(null);
        try {
            const result: AnalyzeScriptOutput = await analyzeScript({ script });
            setAnalysisResult(result);
        } catch (error) {
            console.error("Failed to analyze script:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not analyze script. Please try again.' });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleModelScenario = async () => {
        if (!script) {
            toast({ variant: 'destructive', title: 'Error', description: 'There is no script to model.' });
            return;
        }
        setData(null);
        setInteractionResult(null);
        setSimulationLoading(script);
    };

    const handleTestCountermeasure = async () => {
        if (!script || !data?.analysis.suggestedCountermeasure) {
            toast({ variant: 'destructive', title: 'Error', description: 'Attack script or countermeasure is missing.' });
            return;
        }
        setIsTesting(true);
        setInteractionResult(null);
        try {
            const result: AnalyzeInteractionOutput = await analyzeInteraction({
                attackScript: script,
                defenseScript: data.analysis.suggestedCountermeasure
            });
            setInteractionResult(result);
        } catch (error) {
            console.error("Failed to test countermeasure:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not test countermeasure. Please try again.' });
        } finally {
            setIsTesting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied!', description: 'Script copied to clipboard.' });
    };

    const getActionIcon = (action: InteractionStep['action']) => {
        switch (action) {
            case 'Attack': return <AlertTriangle className="h-5 w-5 text-red-500" />;
            case 'Defense': return <ShieldCheck className="h-5 w-5 text-green-500" />;
            case 'System': return <Bot className="h-5 w-5 text-blue-500" />;
            default: return null;
        }
    }


    return (
        <main className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Column */}
            <div className="flex flex-col gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Bot className="h-6 w-6"/> AI Attack Generator
                        </CardTitle>
                        <CardDescription>Describe a cloud-native attack scenario, and the AI will generate a simulated script for it.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="e.g., 'A powershell script that exfiltrates data from an AWS S3 bucket by finding publicly accessible buckets and downloading their contents.'"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="h-24"
                        />
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleGenerateScript} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2" />}
                            Generate Script
                        </Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FlaskConical className="h-6 w-6" />
                            Threat Sandbox
                        </CardTitle>
                        <CardDescription>
                             Paste a script here or generate one to analyze its potential impact in a safe, simulated environment.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Textarea
                            placeholder="Your generated or pasted script will appear here..."
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            className="h-64 font-code text-xs"
                        />
                    </CardContent>
                     <CardFooter className="flex justify-between">
                         <div className="flex gap-2">
                            <Button onClick={handleAnalyzeScript} variant="secondary" disabled={!script || isAnalyzing}>
                                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2" />}
                                Quick Analysis
                            </Button>
                             <Button onClick={handleModelScenario} disabled={!script || isAnalyzing}>
                                Model Full Scenario
                            </Button>
                        </div>
                        <Button onClick={() => copyToClipboard(script)} variant="ghost" size="icon" disabled={!script}>
                            <Clipboard className="h-5 w-5" />
                        </Button>
                    </CardFooter>
                </Card>
                {analysisResult && (
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileCheck2 className="h-6 w-6" />
                                Quick Analysis Results
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert variant={analysisResult.isMalicious ? "destructive" : "default"}>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>{analysisResult.isMalicious ? "Potentially Malicious" : "Looks Safe"}</AlertTitle>
                                <AlertDescription>
                                    {analysisResult.summary}
                                </AlertDescription>
                            </Alert>
                             <div>
                                <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">Risk Score</span>
                                <span className="text-sm font-bold text-primary">{analysisResult.riskScore} / 100</span>
                                </div>
                                <Progress value={analysisResult.riskScore} aria-label={`${analysisResult.riskScore}% risk score`} />
                            </div>
                             <div>
                                <h4 className="font-semibold text-sm mb-1">Recommendations:</h4>
                                <p className="text-sm text-muted-foreground">{analysisResult.recommendations}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
               <Card className="sticky top-6">
                    <CardHeader>
                        <CardTitle>Analysis & Defense</CardTitle>
                         <CardDescription>
                             View the AI-generated countermeasure and test its effectiveness against the attack script.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Tabs defaultValue="countermeasure">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="countermeasure">Countermeasure</TabsTrigger>
                                <TabsTrigger value="engagement" disabled={!data}>Test Effectiveness</TabsTrigger>
                            </TabsList>
                            <TabsContent value="countermeasure" className="mt-4">
                                {data?.analysis.suggestedCountermeasure ? (
                                    <>
                                        <div className="relative">
                                            <Textarea
                                                readOnly
                                                value={data.analysis.suggestedCountermeasure}
                                                className="h-64 font-code text-xs bg-muted"
                                            />
                                            <Button
                                                onClick={() => copyToClipboard(data.analysis.suggestedCountermeasure)}
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2"
                                            >
                                                <Clipboard className="h-5 w-5" />
                                            </Button>
                                        </div>
                                         <Alert className="mt-4">
                                            <Lightbulb className="h-4 w-4" />
                                            <AlertTitle>What is this?</AlertTitle>
                                            <AlertDescription>
                                                This is the AI's suggested defense script. Click "Test Effectiveness" to see how it performs against the attack.
                                            </AlertDescription>
                                        </Alert>
                                    </>
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                        <p>Run a full scenario to generate a countermeasure.</p>
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="engagement" className="mt-4">
                                {isTesting && (
                                     <div className="h-64 flex items-center justify-center">
                                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                                    </div>
                                )}
                                {interactionResult && (
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium">Defense Effectiveness Score</span>
                                            <span className="text-sm font-bold text-primary">{interactionResult.effectivenessScore} / 100</span>
                                            </div>
                                            <Progress value={interactionResult.effectivenessScore} aria-label={`${interactionResult.effectivenessScore}% effectiveness score`} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm mb-1">Outcome Summary:</h4>
                                            <p className="text-sm text-muted-foreground">{interactionResult.outcomeSummary}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-semibold text-sm">Interaction Log:</h4>
                                            <div className="border rounded-lg p-2 max-h-60 overflow-y-auto">
                                                {interactionResult.interactionLog.map(log => (
                                                    <div key={log.step} className="text-xs p-2 flex items-start gap-3 hover:bg-muted/50 rounded-md">
                                                        {getActionIcon(log.action)}
                                                        <div>
                                                            <p><span className="font-bold">{log.action}:</span> {log.description}</p>
                                                            <p className="text-muted-foreground"><span className="font-semibold">Result:</span> {log.result}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                         <Alert>
                                            <Lightbulb className="h-4 w-4" />
                                            <AlertTitle>Improved Defense Script</AlertTitle>
                                            <AlertDescription>
                                                The AI has suggested an improved version of the defense script based on this engagement analysis. You can find it in the "Countermeasure" tab.
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                )}
                                 {!interactionResult && !isTesting && (
                                     <div className="h-64 flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                        <p>Click below to simulate the engagement.</p>
                                        <Button className="mt-4" onClick={handleTestCountermeasure} variant="secondary">
                                            {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2" />}
                                            Test Countermeasure
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                     {data && (
                        <CardFooter>
                             <Button 
                                onClick={handleTestCountermeasure} 
                                className="w-full" 
                                disabled={isTesting || !data?.analysis.suggestedCountermeasure}
                                >
                                {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2" />}
                                {interactionResult ? "Re-Test Countermeasure" : "Test Countermeasure"}
                            </Button>
                        </CardFooter>
                    )}
               </Card>
            </div>
        </main>
    );
}
