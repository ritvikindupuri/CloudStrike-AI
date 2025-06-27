import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-primary"
      {...props}
    >
      {/* Shield Outline */}
      <path d="M12 2L3 5v6c0 5.6 3.8 10.7 9 12 5.2-1.3 9-6.4 9-12V5l-9-3z" />
      {/* Inner Circuit */}
      <path d="M12 12m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0" />
      <path d="M12 10.5V9" />
      <path d="M12 15v-1.5" />
      <path d="M14.5 12.5l1.5-1" />
      <path d="M8 11.5l1.5 1" />
      <path d="M9.5 14.5l-1.5 1" />
      <path d="M16 13.5l-1.5-1" />
    </svg>
  );
}