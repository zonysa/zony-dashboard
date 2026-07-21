import { cn } from "@/lib/utils";

const maxWidths = {
  sm: "max-w-3xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
} as const;

interface PageContainerProps {
  size?: keyof typeof maxWidths;
  className?: string;
  children: React.ReactNode;
}

export function PageContainer({ size = "lg", className, children }: PageContainerProps) {
  return (
    <div className={cn("mx-auto w-full", maxWidths[size], className)}>
      {children}
    </div>
  );
}
