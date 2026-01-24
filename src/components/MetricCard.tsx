import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number;
  previousValue: number;
  type: "daily" | "30d" | "90d";
  onNavigate?: () => void;
}

const typeColors = {
  daily: "from-blue-500/20 to-blue-600/5 border-blue-500/30",
  "30d": "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30",
  "90d": "from-violet-500/20 to-violet-600/5 border-violet-500/30",
};

const typeAccents = {
  daily: "text-blue-600 dark:text-blue-400",
  "30d": "text-emerald-600 dark:text-emerald-400",
  "90d": "text-violet-600 dark:text-violet-400",
};

const typeBadgeColors = {
  daily: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "30d": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "90d": "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

function getChangeInfo(value: number, previousValue: number) {
  const difference = value - previousValue;
  const percentChange = previousValue !== 0 ? (difference / previousValue) * 100 : 0;
  
  if (difference > 0) {
    return { icon: TrendingUp, trend: "up" as const, difference, percentChange };
  } else if (difference < 0) {
    return { icon: TrendingDown, trend: "down" as const, difference, percentChange };
  }
  return { icon: Minus, trend: "neutral" as const, difference, percentChange };
}

export function MetricCard({ title, value, previousValue, type, onNavigate }: MetricCardProps) {
  const { icon: TrendIcon, trend, difference, percentChange } = getChangeInfo(value, previousValue);
  
  const formatDifference = (diff: number) => {
    const sign = diff > 0 ? "+" : "";
    return `${sign}${diff.toLocaleString()}`;
  };
  
  const formatPercent = (percent: number) => {
    const sign = percent > 0 ? "+" : "";
    return `${sign}${percent.toFixed(2)}%`;
  };
  
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden cursor-pointer transition-all duration-300",
        "hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5",
        "bg-gradient-to-br border",
        typeColors[type]
      )}
      onClick={onNavigate}
    >
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xs font-medium text-muted-foreground leading-tight line-clamp-2 min-h-[2rem]">
            {title}
          </CardTitle>
          <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase shrink-0", typeBadgeColors[type])}>
            {type === "daily" ? "D" : type === "30d" ? "30D" : "90D"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-3 px-4">
        <div className="space-y-1">
          <p className={cn("text-xl font-bold", typeAccents[type])}>
            {value.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5">
            <TrendIcon 
              className={cn(
                "h-3.5 w-3.5",
                trend === "up" && "text-emerald-500",
                trend === "down" && "text-red-500",
                trend === "neutral" && "text-muted-foreground"
              )}
            />
            <span 
              className={cn(
                "text-xs font-medium",
                trend === "up" && "text-emerald-500",
                trend === "down" && "text-red-500",
                trend === "neutral" && "text-muted-foreground"
              )}
            >
              {formatDifference(difference)} ({formatPercent(percentChange)})
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
