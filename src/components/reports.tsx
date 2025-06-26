'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

const reports = [
    { name: "Q2 2024 Security Summary", date: "2024-07-01", size: "2.5 MB" },
    { name: "Intrusion Attempts - June 2024", date: "2024-06-30", size: "1.2 MB" },
    { name: "Malware Scan Results", date: "2024-06-28", size: "5.8 MB" },
];

export function Reports() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                    <p className="text-muted-foreground">
                        Generate and view historical security reports.
                    </p>
                </div>
                <Button disabled>Generate New Report</Button>
            </header>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
                <Card key={report.name}>
                    <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                        <div className="flex-shrink-0">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex-grow">
                            <CardTitle className="text-base">{report.name}</CardTitle>
                            <CardDescription>Generated on {report.date}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardFooter className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{report.size}</span>
                        <Button variant="outline" size="sm" disabled>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                    </CardFooter>
                </Card>
            ))}
            </div>
        </main>
    )
}
