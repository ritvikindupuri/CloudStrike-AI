'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const events = [
  { id: 'EVT-001', timestamp: '2024-07-26 10:45:12', severity: 'High', description: 'Anomalous login detected from new IP address.', status: 'Investigating' },
  { id: 'EVT-002', timestamp: '2024-07-26 10:42:05', severity: 'Medium', description: 'Multiple failed login attempts for user "admin".', status: 'Contained' },
  { id: 'EVT-003', timestamp: '2024-07-26 10:30:55', severity: 'Low', description: 'Unusual port scan detected from external network.', status: 'Resolved' },
  { id: 'EVT-004', timestamp: '2024-07-26 10:25:18', severity: 'High', description: 'Potential malware execution detected on server "web-01".', status: 'Investigating' },
  { id: 'EVT-005', timestamp: '2024-07-26 10:15:00', severity: 'Critical', description: 'Data exfiltration attempt detected.', status: 'Action Required' },
];

export function SecurityEvents() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Security Events</h1>
                <p className="text-muted-foreground">
                    Review and analyze all security events across your cloud infrastructure.
                </p>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Events</CardTitle>
                    <CardDescription>A log of the latest security events detected by the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Event ID</TableHead>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell className="font-medium">{event.id}</TableCell>
                                    <TableCell>{event.timestamp}</TableCell>
                                    <TableCell>
                                        <Badge variant={event.severity === 'High' || event.severity === 'Critical' ? 'destructive' : event.severity === 'Medium' ? 'secondary' : 'outline'}>{event.severity}</Badge>
                                    </TableCell>
                                    <TableCell>{event.description}</TableCell>
                                    <TableCell>{event.status}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    )
}
