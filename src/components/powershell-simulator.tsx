'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAttackSimulation } from '@/context/attack-simulation-context';
import { Loader2, Terminal, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { generateAttackScript } from '@/ai/flows/generate-attack-script-flow';

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
    const [scriptContent, setScriptContent] = useState(
`# Welcome to the CIDS Attack Simulator!
# This is a fully editable editor. You have two options:
#
# 1. Generate an attack script with AI:
#    Use the input field below to describe a cloud-native attack.
#
# 2. Write or paste your own script:
#    You can type directly into this window or paste any PowerShell/shell script.
#
# Once your script is ready, click "Run Simulation" to analyze its impact.`
    );
    const [isGenerating, setIsGenerating] = useState(false);

    const { toast } = useToast();

    const handleRunSimulation = () => {
        if (!scriptContent.trim()) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Script content cannot be empty.',
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
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Attack Simulator</h1>
                <p className="text-muted-foreground">
                    Use AI to generate and simulate cloud-native attack scripts in a virtual environment.
                </p>
            </header>
            <div className="font-mono rounded-lg border bg-gray-900 text-white shadow-lg">
                {/* Terminal Header */}
                <div className="px-4 py-2 border-b border-gray-700 flex items-center">
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <p className="ml-4 text-sm text-gray-300">CIDS Terminal - /bin/bash</p>
                </div>
                
                {/* Terminal Body */}
                <div className="p-4">
                    <Textarea 
                        placeholder="AI will generate an attack script here..."
                        className="h-72 w-full bg-transparent border-0 rounded-none text-green-400 font-mono text-sm resize-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                        value={scriptContent}
                        onChange={(e) => setScriptContent(e.target.value)}
                    />

                    {/* AI Prompt Input */}
                    <form onSubmit={handleGenerateScript}>
                        <div className="flex items-center gap-2 mt-4">
                            <span className="text-blue-400">CIDS:\&gt;</span>
                            <Input 
                                placeholder='e.g., "ransomware for S3 bucket"'
                                className="flex-1 bg-gray-800 border-gray-700 rounded-md h-9 text-white focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
                                value={generationPrompt}
                                onChange={(e) => setGenerationPrompt(e.target.value)}
                                disabled={isGenerating}
                            />
                            <Button type="submit" variant="secondary" size="sm" disabled={isGenerating || !generationPrompt}>
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                                Generate Script
                            </Button>
                        </div>
                    </form>

                     <div className="mt-2">
                        <p className="text-xs text-gray-400">Try one of these:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                             {samplePrompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    className="text-xs text-gray-300 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded-md transition-colors"
                                    onClick={() => setGenerationPrompt(prompt)}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex w-full items-center justify-end mt-6 border-t border-gray-700 pt-4">
                        <Button 
                            onClick={handleRunSimulation} 
                            disabled={isSimulating || isGenerating}
                            size="lg"
                            className="bg-primary hover:bg-primary/90"
                        >
                            {isSimulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Terminal className="mr-2 h-4 w-4" />}
                            {isSimulating ? 'Simulating...' : 'Run Simulation'}
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    )
}
