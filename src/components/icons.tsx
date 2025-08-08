import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={cn("h-8 w-8 text-primary", className)}
      {...props}
    >
      <path
        fill="currentColor"
        d="M232.54,124,193,89.2V64a8,8,0,0,0-8-8H161.41l-28-25.2a8,8,0,0,0-10.82,0l-28,25.2H71a8,8,0,0,0-8,8V89.2L23.46,124a8,8,0,0,0,0,11.31L63,169.94v25.2a8,8,0,0,0,8,8H94.59l28,25.2a8,8,0,0,0,10.82,0l28-25.2H185a8,8,0,0,0,8-8V169.94l39.54-34.63A8,8,0,0,0,232.54,124ZM104.41,208,79,185.6V168a8,8,0,0,0-4.54-7.2L36.71,136,71,107.2V88h23.59L128,59.31,161.41,88H185v19.2L150.71,136l34.29,24.8a8,8,0,0,0,4.54,7.2v17.6L161.41,208,128,179.31Z"
      />
      <path
        fill="currentColor"
        d="M136,104v48a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"
      />
    </svg>
  );
}
