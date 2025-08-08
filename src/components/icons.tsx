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
      <path d="m5 8 6 6"></path>
      <path d="m4 14 6-6 2-3"></path>
      <path d="M2 5h12"></path>
      <path d="M7 2h1"></path>
      <path d="m12 5 2 3 6 6"></path>
      <path d="m8 14 4 4 6-6"></path>
      <path d="M11 4h10"></path>
    </svg>
  );
}
