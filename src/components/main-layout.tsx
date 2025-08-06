'use client'
import {
    LayoutDashboard,
    Shield,
    HardDrive,
    ListTodo,
} from 'lucide-react';
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarInset,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSimulation } from '@/context/simulation-context';
import { Badge } from './ui/badge';

export function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data } = useSimulation();

    const menuItems = [
        { href: '/', label: 'Threat Sandbox', icon: Shield },
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { 
            href: '/security-events', 
            label: 'Security Events', 
            icon: ListTodo,
            badge: data?.events?.length || 0,
        },
        { 
            href: '/cloud-services', 
            label: 'Cloud Services', 
            icon: HardDrive,
            badge: data?.affectedResources?.length || 0,
        },
    ];
    
    return (
        <>
            <Sidebar variant='sidebar' collapsible='icon'>
                <SidebarHeader>
                    <div className="flex items-center gap-3 p-2">
                       <Logo className="text-primary h-8 w-8"/>
                       <div className="flex flex-col">
                        <h1 className="text-lg font-semibold text-foreground tracking-wide">Sentinel</h1>
                        <span className="text-[10px] uppercase text-muted-foreground tracking-wider">AI Sandbox</span>
                       </div>
                    </div>
                </SidebarHeader>
                <SidebarContent className="p-2">
                    <SidebarMenu>
                        {menuItems.map((item) => (
                            <SidebarMenuButton
                                key={item.label}
                                asChild
                                isActive={pathname === item.href}
                                className="h-10 justify-start"
                                size="default"
                            >
                                <Link href={item.href}>
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                     {item.badge !== undefined && item.badge > 0 && (
                                        <Badge variant="secondary" className="ml-auto">
                                            {item.badge}
                                        </Badge>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>
            <SidebarInset>
                {children}
            </SidebarInset>
        </>
    );
}
