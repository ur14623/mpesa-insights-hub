import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface RefreshControlProps {
  lastRefreshed: Date;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function RefreshControl({ lastRefreshed, onRefresh, isRefreshing = false }: RefreshControlProps) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <span>
        Last refreshed: {format(lastRefreshed, "MMM dd, yyyy HH:mm:ss")}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="h-8 px-3"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  );
}
