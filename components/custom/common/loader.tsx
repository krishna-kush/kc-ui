import { cn } from "@/lib/utils";

interface LoaderProps {
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export function Loader({
  text = "Loading...",
  className,
  fullScreen = false,
}: LoaderProps) {
  const content = (
    <div className={cn("text-center", className)}>
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[200px] w-full">
      {content}
    </div>
  );
}
