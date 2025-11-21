import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center space-x-1 text-sm", className)}>
      <button
        onClick={() => window.location.href = "/"}
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Home"
      >
        <Home className="h-4 w-4" />
      </button>

      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className={cn(
                "hover:text-foreground transition-colors",
                index === items.length - 1
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </button>
          ) : (
            <span
              className={cn(
                index === items.length - 1
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
