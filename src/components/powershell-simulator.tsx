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
`# The script to be simulated will appear here.
# You can:
# 1. Use the AI generator below to create a cloud-native attack script.
# 2. Type or paste your own script directly into this editor.
#
# When ready, click "Run Simulation".`
    );
    const [isGenerating, setIsGenerating] = useState(false);

    const { toast } = useToast();

    const handleRunSimulation = () => {
        if (!scriptContent.trim() || scriptContent.startsWith('# The script to be simulated')) {
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
                    Generate or write a cloud-native attack script, then simulate its impact on your infrastructure.
                </p>
            </header>
            <div className="font-mono rounded-lg border bg-gray-900 text-white shadow-lg flex flex-col flex-grow">
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
                    <Textarea 
                        placeholder="Your attack script goes here..."
                        className="flex-grow w-full bg-transparent border-0 rounded-none text-green-400 font-mono text-sm resize-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                        value={scriptContent}
                        onChange={(e) => setScriptContent(e.target.value)}
                    />

                    {/* Controls at the bottom */}
                    <div className="mt-4 border-t border-gray-700 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                             <div>
                                <label className="text-sm font-medium text-gray-300 block mb-2">1. Get Script: Generate with AI</label>
                                <form onSubmit={handleGenerateScript} className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Bot className="h-5 w-5 text-blue-400 flex-shrink-0"/>
                                        <Input 
                                            placeholder='Describe a cloud attack...'
                                            className="flex-1 bg-gray-800 border-gray-700 rounded-md h-9 text-white focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
                                            value={generationPrompt}
                                            onChange={(e) => setGenerationPrompt(e.target.value)}
                                            disabled={isGenerating}
                                        />
                                        <Button type="submit" variant="secondary" size="sm" disabled={isGenerating || !generationPrompt}>
                                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate'}
                                        </Button>
                                    </div>
                                     <div className="flex flex-wrap gap-2">
                                        {samplePrompts.slice(0, 3).map((prompt) => (
                                            <button
                                                key={prompt}
                                                type="button"
                                                className="text-xs text-gray-300 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded-md transition-colors"
                                                onClick={() => setGenerationPrompt(prompt)}
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                </form>
                             </div>
                             
                             <div className="flex flex-col justify-start">
                                <label className="text-sm font-medium text-gray-300 block mb-2">2. Run Simulation</label>
                                <Button 
                                    onClick={handleRunSimulation} 
                                    disabled={isSimulating || isGenerating}
                                    size="lg"
                                    className="bg-primary hover:bg-primary/90 w-full"
                                >
                                    {isSimulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Terminal className="mr-2 h-4 w-4" />}
                                    {isSimulating ? 'Simulating...' : 'Simulate Script from Editor'}
                                </Button>
                                <p className="text-xs text-gray-400 mt-2 text-center">This will analyze the script in the editor above and generate a full impact report.</p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
