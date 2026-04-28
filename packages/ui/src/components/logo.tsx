import { cn } from "@tailorkit/ui/lib/utils";

interface LogoProps {
  className?: string;
  rounded?: boolean;
}

export function Logo({ className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn(className)}
      fillRule="evenodd"
      clipRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit={2}
      fill="currentColor"
      aria-label="TailorKit logo"
    >
      <path d="M3 6h6v6H3z" transform="matrix(1.5 0 0 1.5 10.5 -9)" />
      <path d="M2 6v12h12v-6H8V6z" transform="matrix(1.5 0 0 1.5 -3 -3)" />
    </svg>
  );
}
