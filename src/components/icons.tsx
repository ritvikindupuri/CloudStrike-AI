import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6 text-primary", className)}
      {...props}
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <path d="M12 14l-3-1.5"></path>
        <path d="M12 14l3-1.5"></path>
        <path d="M12 14v-4"></path>
        <path d="M12 10l-3-1.5"></path>
        <path d="M12 10l3-1.5"></path>
    </svg>
  );
}
