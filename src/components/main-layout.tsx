
'use client'
import {
    LayoutDashboard,
    Video,
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
        { href: '/', label: 'Live Feed', icon: Video },
        { href: '/alerts-dashboard', label: 'Alerts Dashboard', icon: LayoutDashboard },
    ];
    
    return (
        <>
            <Sidebar variant='sidebar' collapsible='icon' className="hidden md:flex bg-sidebar">
                <SidebarHeader>
                    <div className="flex items-center gap-3 p-2">
                       <Logo className="text-white h-9 w-9"/>
                       <div className="flex flex-col">
                        <h1 className="text-lg font-semibold text-white tracking-wider">Aegis Vision</h1>
                        <span className="text-[10px] uppercase text-slate-400 tracking-wider">AI Security</span>
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
