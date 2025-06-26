'use client'
import {
    LayoutDashboard,
    ShieldAlert,
    Terminal,
    BrainCircuit,
    Cloud,
    FileText,
} from 'lucide-react';
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarInset,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const menuItems = [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/security-events', label: 'Security Events', icon: ShieldAlert },
        { href: '/powershell-simulator', label: 'PowerShell Simulator', icon: Terminal },
        { href: '/ml-analysis', label: 'ML Analysis', icon: BrainCircuit },
        { href: '/cloud-services', label: 'Cloud Services', icon: Cloud },
        { href: '/reports', label: 'Reports', icon: FileText },
    ];
    
    return (
        <>
            <Sidebar variant='sidebar' collapsible='icon' className="hidden md:flex bg-sidebar">
                <SidebarHeader>
                    <div className="flex items-center gap-3 p-2">
                       <Logo className="text-white h-9 w-9"/>
                       <div className="flex flex-col">
                        <h1 className="text-lg font-semibold text-white tracking-wider">CIDS</h1>
                        <p className="text-[10px] uppercase text-slate-400 tracking-wider">Enterprise Security</p>
                       </div>
                    </div>
                </SidebarHeader>
                <SidebarContent className="p-2">
                    <SidebarMenu>
                        {menuItems.map((item) => (
                            <SidebarMenuItem key={item.label}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname === item.href}
                                    className="h-10 justify-start data-[active=true]:bg-sidebar-accent"
                                    size="default"
                                >
                                    <Link href={item.href}>
                                        <item.icon className="h-5 w-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
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
