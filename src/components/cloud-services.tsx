'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Cloud, ShieldCheck, ShieldOff } from "lucide-react";

const services = [
    { name: "AWS EC2 Instances", status: "Protected" },
    { name: "Azure Blob Storage", status: "Protected" },
    { name: "Google Cloud Functions", status: "Vulnerable" },
    { name: "VPC Network", status: "Protected" },
];

export function CloudServices() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Cloud Services</h1>
                <p className="text-muted-foreground">
                    Monitor your connected cloud services and their protection status.
                </p>
            </header>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {services.map(service => (
                    <Card key={service.name}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base font-medium">{service.name}</CardTitle>
                            <Cloud className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                {service.status === 'Protected' 
                                    ? <ShieldCheck className="h-5 w-5 text-primary" /> 
                                    : <ShieldOff className="h-5 w-5 text-destructive" />
                                }
                                <p className={`text-lg font-bold ${service.status === 'Protected' ? 'text-primary' : 'text-destructive'}`}>{service.status}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </main>
    )
}
